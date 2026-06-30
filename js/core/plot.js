/* ============================================================
   Canvas helpers: HiDPI setup, axes, curves, markers.
   ============================================================ */
(function(){
const Plot = {};

/* size a canvas for crisp HiDPI rendering; returns ctx ready to draw
   in CSS pixels with origin at top-left. */
Plot.fit = function(canvas, cssW, cssH){
  var dpr = Math.max(1, Math.min(2.5, window.devicePixelRatio||1));
  canvas.style.width = cssW+'px';
  canvas.style.height = cssH+'px';
  canvas.width = Math.round(cssW*dpr);
  canvas.height = Math.round(cssH*dpr);
  var ctx = canvas.getContext('2d');
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx._cssW = cssW; ctx._cssH = cssH;
  return ctx;
};

Plot.colors = {
  ink:'#1a2230', ink2:'#5a6678', ink3:'#aab2c0', line:'#e7eaf0',
  accent:'#1f5fd0', orange:'#e8821e', green:'#1f9d6b', red:'#d8533f',
  grid:'#eef1f6'
};

/* A 2D cartesian chart mapped into a rect of the canvas. */
Plot.Chart = function(ctx, opt){
  this.ctx = ctx;
  this.x0 = opt.x; this.y0 = opt.y; this.w = opt.w; this.h = opt.h;
  this.xmin = opt.xmin; this.xmax = opt.xmax;
  this.ymin = opt.ymin; this.ymax = opt.ymax;
};
Plot.Chart.prototype.px = function(x){ return this.x0 + (x-this.xmin)/(this.xmax-this.xmin)*this.w; };
Plot.Chart.prototype.py = function(y){ return this.y0 + this.h - (y-this.ymin)/(this.ymax-this.ymin)*this.h; };
Plot.Chart.prototype.invX = function(px){ return this.xmin + (px-this.x0)/this.w*(this.xmax-this.xmin); };
Plot.Chart.prototype.invY = function(py){ return this.ymin + (this.y0+this.h-py)/this.h*(this.ymax-this.ymin); };

Plot.Chart.prototype.axes = function(o){
  o = o||{};
  var c=this.ctx, C=Plot.colors;
  // gridlines
  c.save();
  c.strokeStyle=C.grid; c.lineWidth=1; c.fillStyle=C.ink3;
  c.font='11px -apple-system,sans-serif';
  var xt = o.xticks || niceTicks(this.xmin,this.xmax,6);
  var yt = o.yticks || niceTicks(this.ymin,this.ymax,5);
  c.textAlign='center'; c.textBaseline='top';
  xt.forEach(function(v){
    var X=this.px(v);
    c.beginPath();c.moveTo(X,this.y0);c.lineTo(X,this.y0+this.h);c.stroke();
    if(o.xfmt!==false) c.fillText((o.xfmt?o.xfmt(v):fmt(v)), X, this.y0+this.h+6);
  },this);
  c.textAlign='right'; c.textBaseline='middle';
  yt.forEach(function(v){
    var Y=this.py(v);
    c.beginPath();c.moveTo(this.x0,Y);c.lineTo(this.x0+this.w,Y);c.stroke();
    if(o.yfmt!==false) c.fillText((o.yfmt?o.yfmt(v):fmt(v)), this.x0-7, Y);
  },this);
  // frame
  c.strokeStyle=C.line; c.lineWidth=1.2;
  c.strokeRect(this.x0,this.y0,this.w,this.h);
  // axis labels
  if(o.xlabel){ c.fillStyle=C.ink2; c.font='600 11.5px -apple-system,sans-serif'; c.textAlign='center'; c.textBaseline='top';
    c.fillText(o.xlabel, this.x0+this.w/2, this.y0+this.h+22); }
  if(o.ylabel){ c.save(); c.translate(this.x0-36, this.y0+this.h/2); c.rotate(-Math.PI/2);
    c.fillStyle=C.ink2; c.font='600 11.5px -apple-system,sans-serif'; c.textAlign='center'; c.textBaseline='bottom';
    c.fillText(o.ylabel,0,0); c.restore(); }
  c.restore();
};

/* draw a curve from sample function f(x) */
Plot.Chart.prototype.curve = function(f, o){
  o=o||{}; var c=this.ctx;
  c.save(); c.beginPath();
  var N=o.n||160, started=false;
  for(var i=0;i<=N;i++){
    var x=this.xmin+(this.xmax-this.xmin)*i/N;
    var y=f(x);
    if(y===null||isNaN(y)){started=false;continue;}
    var X=this.px(x), Y=this.py(Math.max(this.ymin,Math.min(this.ymax,y)));
    if(!started){c.moveTo(X,Y);started=true;}else c.lineTo(X,Y);
  }
  c.lineWidth=o.w||2.2; c.strokeStyle=o.color||Plot.colors.accent;
  if(o.dash)c.setLineDash(o.dash);
  c.stroke(); c.restore();
};
/* draw a polyline from points [{x,y}] */
Plot.Chart.prototype.poly = function(pts, o){
  o=o||{}; var c=this.ctx; c.save(); c.beginPath();
  pts.forEach(function(p,i){ var X=this.px(p.x),Y=this.py(p.y); i?c.lineTo(X,Y):c.moveTo(X,Y);},this);
  if(o.fill){ c.lineTo(this.px(pts[pts.length-1].x),this.py(this.ymin)); c.lineTo(this.px(pts[0].x),this.py(this.ymin)); c.closePath(); c.fillStyle=o.fill; c.fill(); }
  if(o.color!==false){ c.lineWidth=o.w||2.2; c.strokeStyle=o.color||Plot.colors.accent; if(o.dash)c.setLineDash(o.dash); c.stroke(); }
  c.restore();
};
Plot.Chart.prototype.dot = function(x,y,o){
  o=o||{}; var c=this.ctx, X=this.px(x), Y=this.py(y);
  c.save(); c.beginPath(); c.arc(X,Y,o.r||5,0,7); c.fillStyle=o.color||Plot.colors.orange;
  c.fill(); if(o.ring){c.lineWidth=2.5;c.strokeStyle='#fff';c.stroke();}
  if(o.label){ c.fillStyle=o.lcolor||Plot.colors.ink; c.font='600 11.5px -apple-system,sans-serif';
    c.textAlign=o.align||'left'; c.textBaseline='bottom'; c.fillText(o.label,X+(o.align==='right'?-8:8),Y-7); }
  c.restore();
};
Plot.Chart.prototype.vline = function(x,o){ o=o||{}; var c=this.ctx,X=this.px(x);
  c.save(); c.beginPath(); c.moveTo(X,this.y0); c.lineTo(X,this.y0+this.h);
  c.lineWidth=o.w||1.5; c.strokeStyle=o.color||Plot.colors.ink3; if(o.dash!==false)c.setLineDash(o.dash||[5,4]); c.stroke(); c.restore(); };
Plot.Chart.prototype.hline = function(y,o){ o=o||{}; var c=this.ctx,Y=this.py(y);
  c.save(); c.beginPath(); c.moveTo(this.x0,Y); c.lineTo(this.x0+this.w,Y);
  c.lineWidth=o.w||1.5; c.strokeStyle=o.color||Plot.colors.ink3; if(o.dash!==false)c.setLineDash(o.dash||[5,4]); c.stroke(); c.restore(); };
/* line between two data points */
Plot.Chart.prototype.line = function(x1,y1,x2,y2,o){ o=o||{}; var c=this.ctx;
  c.save();c.beginPath();c.moveTo(this.px(x1),this.py(y1));c.lineTo(this.px(x2),this.py(y2));
  c.lineWidth=o.w||1.6;c.strokeStyle=o.color||Plot.colors.ink3;if(o.dash)c.setLineDash(o.dash);c.stroke();c.restore(); };

/* ---- general canvas text helper ---- */
Plot.text = function(ctx,t,x,y,o){ o=o||{}; ctx.save();
  ctx.fillStyle=o.color||Plot.colors.ink; ctx.font=o.font||'12px -apple-system,sans-serif';
  ctx.textAlign=o.align||'left'; ctx.textBaseline=o.baseline||'alphabetic';
  ctx.fillText(t,x,y); ctx.restore(); };

/* arrow */
Plot.arrow = function(ctx,x1,y1,x2,y2,o){ o=o||{}; ctx.save();
  ctx.strokeStyle=o.color||Plot.colors.ink; ctx.fillStyle=o.color||Plot.colors.ink;
  ctx.lineWidth=o.w||2;
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
  var ang=Math.atan2(y2-y1,x2-x1), s=o.head||7;
  ctx.beginPath();ctx.moveTo(x2,y2);
  ctx.lineTo(x2-s*Math.cos(ang-0.4),y2-s*Math.sin(ang-0.4));
  ctx.lineTo(x2-s*Math.cos(ang+0.4),y2-s*Math.sin(ang+0.4));
  ctx.closePath();ctx.fill(); ctx.restore(); };

/* pressure/value colormap (blue=low/suction -> red=high) */
Plot.cmap = function(t){ // t 0..1
  t=Math.max(0,Math.min(1,t));
  var stops=[[31,95,208],[120,170,230],[245,245,245],[240,160,90],[216,83,63]];
  var f=t*(stops.length-1), i=Math.floor(f), fr=f-i;
  if(i>=stops.length-1) return 'rgb('+stops[stops.length-1].join(',')+')';
  var a=stops[i],b=stops[i+1];
  return 'rgb('+Math.round(a[0]+(b[0]-a[0])*fr)+','+Math.round(a[1]+(b[1]-a[1])*fr)+','+Math.round(a[2]+(b[2]-a[2])*fr)+')';
};

function niceTicks(min,max,n){
  var span=max-min, step=Math.pow(10,Math.floor(Math.log10(span/n)));
  var err=n*step/span;
  if(err<=0.15)step*=10;else if(err<=0.35)step*=5;else if(err<=0.75)step*=2;
  var t=[],start=Math.ceil(min/step)*step;
  for(var v=start;v<=max+step*0.5;v+=step)t.push(Math.round(v/step)*step);
  return t;
}
function fmt(v){ if(Math.abs(v)>=1000)return (v/1000)+'k'; return (Math.round(v*100)/100).toString(); }
Plot.niceTicks=niceTicks;

window.Plot = Plot;
})();
