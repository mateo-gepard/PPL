/* ============================================================
   Scene — shared "vivid" rendering toolkit for the simulations.
   Sky, clouds, moving ground, recognizable aircraft (side / front
   / top), labelled force arrows, glow, buffet shake, instruments.
   Everything draws in CSS-pixel coordinates (canvas already fitted
   by UI.responsiveCanvas). Colours follow Plot.colors.
   ============================================================ */
(function(){
const S = {};
const C = Plot.colors;

/* ---------- small math / time helpers ---------- */
S.lerp = function(a,b,t){ return a+(b-a)*t; };
S.clamp = function(v,lo,hi){ return v<lo?lo:(v>hi?hi:v); };
S.clamp01 = function(v){ return v<0?0:(v>1?1:v); };
S.ease = function(t){ return t<0.5 ? 2*t*t : 1-Math.pow(-2*t+2,2)/2; };
/* per-frame delta time from the absolute clock UI passes to draw().
   stores _t on the state object; returns seconds since last frame. */
S.dt = function(st,t){ var d = st._t==null?0.016:(t-st._t); st._t=t; return Math.min(0.05, Math.max(0,d)); };
/* critically-damped approach of st[key] toward target */
S.approach = function(st,key,target,rate,dt){
  var v = st[key]==null?target:st[key];
  v += (target-v)*(1-Math.exp(-rate*dt));
  st[key]=v; return v;
};

/* ---------- geometry ---------- */
S.roundRect = function(c,x,y,w,h,r){
  if(w<2*r)r=w/2; if(h<2*r)r=h/2;
  c.beginPath();
  c.moveTo(x+r,y);
  c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r);
  c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r);
  c.closePath();
};

/* ---------- backgrounds ---------- */
/* Sky gradient. altT 0 (sea level) .. 1 (high) darkens toward space. */
S.sky = function(c,x,y,w,h,altT){
  altT = altT||0;
  var g=c.createLinearGradient(0,y,0,y+h);
  var top = mix([86,140,210],[14,40,92], altT);          // higher = deeper blue
  var bot = mix([214,232,252],[150,190,236], altT);
  g.addColorStop(0,'rgb('+top.join(',')+')');
  g.addColorStop(1,'rgb('+bot.join(',')+')');
  c.fillStyle=g; c.fillRect(x,y,w,h);
  // faint sun glow upper-right
  var rg=c.createRadialGradient(x+w*0.82,y+h*0.16,4,x+w*0.82,y+h*0.16,h*0.55);
  rg.addColorStop(0,'rgba(255,255,255,'+(0.45*(1-altT*0.5))+')');
  rg.addColorStop(1,'rgba(255,255,255,0)');
  c.fillStyle=rg; c.fillRect(x,y,w,h);
};
function mix(a,b,t){ return [Math.round(S.lerp(a[0],b[0],t)),Math.round(S.lerp(a[1],b[1],t)),Math.round(S.lerp(a[2],b[2],t))]; }

/* deterministic cloud field. returns array; draw with S.clouds() */
S.makeClouds = function(n,seed){
  var r=mulberry(seed||7), out=[];
  for(var i=0;i<n;i++){
    out.push({ x:r(), y:0.08+r()*0.7, s:0.6+r()*1.1, layer:0.4+r()*0.8 });
  }
  return out;
};
/* scroll: world px offset (increase = moving right→left). worldW px. */
S.clouds = function(c,x,y,w,h,clouds,scroll,alpha){
  alpha=alpha==null?1:alpha;
  c.save(); c.beginPath(); c.rect(x,y,w,h); c.clip();
  var worldW=w*1.7;
  clouds.forEach(function(cl){
    var px = x + mod(cl.x*worldW - scroll*cl.layer, worldW+w*0.4) - w*0.2;
    var py = y + cl.y*h;
    puff(c,px,py,26*cl.s,alpha*0.9);
  });
  c.restore();
};
function puff(c,x,y,r,a){
  c.save(); c.globalAlpha=a;
  var blobs=[[0,0,1],[ -0.9,0.18,0.72],[0.9,0.16,0.72],[-0.45,-0.28,0.66],[0.5,-0.24,0.7],[0.0,0.2,0.85]];
  // soft shadow underside
  c.fillStyle='rgba(190,205,228,'+(0.5)+')';
  blobs.forEach(function(b){ c.beginPath(); c.arc(x+b[0]*r, y+b[1]*r+r*0.18, r*b[2], 0, 7); c.fill(); });
  c.fillStyle='rgba(255,255,255,0.96)';
  blobs.forEach(function(b){ c.beginPath(); c.arc(x+b[0]*r, y+b[1]*r, r*b[2], 0, 7); c.fill(); });
  c.restore();
}
function mod(a,n){ return ((a%n)+n)%n; }
function mulberry(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; var t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }

/* moving ground band with perspective fields + scrolling stripes.
   y = horizon line; band fills y..y+h. scroll in px conveys speed. */
S.ground = function(c,x,y,w,h,scroll){
  c.save(); c.beginPath(); c.rect(x,y,w,h); c.clip();
  var g=c.createLinearGradient(0,y,0,y+h);
  g.addColorStop(0,'#cfe6c8'); g.addColorStop(1,'#bcdcb4');
  c.fillStyle=g; c.fillRect(x,y,w,h);
  // perspective field stripes scrolling left
  for(var i=-1;i<40;i++){
    var fx = x + mod(i*64 - scroll, w+64);
    var depth=0.2;
    c.fillStyle = (i%2===0)?'rgba(120,170,110,0.18)':'rgba(150,195,140,0.14)';
    c.beginPath();
    c.moveTo(fx,y); c.lineTo(fx+34,y);
    c.lineTo(fx+34+44,y+h); c.lineTo(fx-44,y+h);
    c.closePath(); c.fill();
  }
  // horizon line
  c.strokeStyle='rgba(120,150,110,0.6)'; c.lineWidth=1.5;
  c.beginPath(); c.moveTo(x,y); c.lineTo(x+w,y); c.stroke();
  c.restore();
};

/* short horizontal speed streaks to convey airspeed through the frame */
S.speedLines = function(c,x,y,w,h,lines,scroll,speedT){
  speedT=S.clamp01(speedT);
  c.save(); c.beginPath(); c.rect(x,y,w,h); c.clip();
  c.strokeStyle='rgba(255,255,255,'+(0.10+0.28*speedT)+')'; c.lineWidth=1.4; c.lineCap='round';
  lines.forEach(function(l){
    var px=x+mod(l.x*w - scroll*l.layer, w+80)-40;
    var py=y+l.y*h, len=10+30*speedT*l.layer;
    c.beginPath(); c.moveTo(px,py); c.lineTo(px-len,py); c.stroke();
  });
  c.restore();
};
S.makeStreaks=function(n,seed){ var r=mulberry(seed||3),o=[]; for(var i=0;i<n;i++)o.push({x:r(),y:0.05+r()*0.9,layer:0.5+r()*1.1}); return o; };

/* ---------- aircraft: side view (high-wing GA / trainer) ----------
   draws centred at (x,y). s = size (≈ half body length in px).
   opt:{pitch(rad), face:1|-1 (nose dir), prop, propPhase, flap:0..1,
        color, glide(bool nose-down trim)} */
S.planeSide = function(c,x,y,s,opt){
  opt=opt||{}; var col=opt.color||'#33405a';
  var face=opt.face||1, pitch=opt.pitch||0;
  c.save(); c.translate(x,y); c.scale(face,1); c.rotate(-face*pitch); c.scale(s,s);
  c.lineJoin='round'; c.lineCap='round';
  // tail surfaces (behind fuselage)
  c.fillStyle=col;
  // vertical fin
  c.beginPath();
  c.moveTo(-0.95,-0.04); c.quadraticCurveTo(-1.16,-0.62,-1.02,-0.66);
  c.lineTo(-0.78,-0.10); c.closePath(); c.fill();
  // horizontal stab
  c.beginPath();
  c.moveTo(-0.78,-0.02); c.lineTo(-1.18,-0.16); c.lineTo(-1.12,-0.02); c.lineTo(-0.8,0.06); c.closePath(); c.fill();
  // fuselage
  c.beginPath();
  c.moveTo(1.06,0.0);
  c.quadraticCurveTo(0.7,-0.20, 0.18,-0.22);
  c.quadraticCurveTo(-0.5,-0.235,-0.98,-0.06);
  c.quadraticCurveTo(-1.06,-0.02,-1.0,0.06);
  c.quadraticCurveTo(-0.5,0.22, 0.2,0.205);
  c.quadraticCurveTo(0.75,0.18, 1.06,0.0);
  c.closePath(); c.fill();
  // cockpit / windscreen
  c.fillStyle='rgba(173,205,240,0.95)';
  c.beginPath();
  c.moveTo(0.62,-0.14); c.quadraticCurveTo(0.42,-0.205,0.16,-0.20);
  c.lineTo(0.12,-0.05); c.lineTo(0.6,-0.04); c.closePath(); c.fill();
  // cheatline
  c.strokeStyle='rgba(31,95,208,0.55)'; c.lineWidth=0.035;
  c.beginPath(); c.moveTo(-0.95,0.04); c.lineTo(0.7,0.06); c.stroke();
  // high wing (drawn as thin airfoil sitting on top, slight chord)
  c.fillStyle=col;
  var wf = opt.flap?opt.flap:0;
  c.beginPath();
  c.moveTo(0.5,-0.22); c.quadraticCurveTo(0.1,-0.30,-0.42,-0.27);
  c.lineTo(-0.5,-0.205);
  // trailing edge with flap droop
  c.quadraticCurveTo(0.05,-0.18+wf*0.05, 0.48,-0.165);
  c.closePath(); c.fill();
  // wing strut
  c.strokeStyle=col; c.lineWidth=0.03;
  c.beginPath(); c.moveTo(-0.05,-0.205); c.lineTo(-0.18,0.0); c.stroke();
  // landing gear
  c.lineWidth=0.045; c.strokeStyle=col;
  c.beginPath(); c.moveTo(0.0,0.19); c.lineTo(-0.06,0.40); c.stroke();
  c.beginPath(); c.moveTo(0.62,0.16); c.lineTo(0.66,0.36); c.stroke();
  c.fillStyle='#222a38';
  c.beginPath(); c.arc(-0.06,0.42,0.07,0,7); c.fill();
  c.beginPath(); c.arc(0.66,0.38,0.06,0,7); c.fill();
  // spinner + propeller disc at nose
  c.fillStyle=col;
  c.beginPath(); c.moveTo(1.02,-0.05); c.lineTo(1.12,0.0); c.lineTo(1.02,0.05); c.closePath(); c.fill();
  if(opt.prop!==false){
    var ph=opt.propPhase||0;
    c.save(); c.translate(1.12,0);
    c.strokeStyle='rgba(60,72,92,0.35)'; c.lineWidth=0.03;
    for(var k=0;k<3;k++){
      var a=ph+k*2.094;
      c.beginPath(); c.moveTo(0,0); c.lineTo(0.02*Math.cos(a),0.34*Math.sin(a)); c.stroke();
    }
    c.strokeStyle='rgba(60,72,92,0.18)'; c.lineWidth=0.05;
    c.beginPath(); c.ellipse(0,0,0.05,0.34,0,0,7); c.stroke();
    c.restore();
  }
  c.restore();
};

/* ---------- aircraft: front view (for bank / load factor) ----------
   bank in rad (right wing down positive). s = wing half-span px. */
S.planeFront = function(c,x,y,s,bank,opt){
  opt=opt||{}; var col=opt.color||'#33405a';
  c.save(); c.translate(x,y); c.rotate(bank); c.scale(s,s);
  c.lineJoin='round'; c.lineCap='round';
  // wings with slight dihedral
  c.fillStyle=col;
  c.beginPath();
  c.moveTo(-1.0,0.02); c.lineTo(-0.06,-0.06); c.lineTo(0.06,-0.06); c.lineTo(1.0,0.02);
  c.lineTo(1.0,0.075); c.lineTo(0.06,0.02); c.lineTo(-0.06,0.02); c.lineTo(-1.0,0.075);
  c.closePath(); c.fill();
  // fuselage (circle) + fin
  c.beginPath(); c.ellipse(0,0.02,0.13,0.17,0,0,7); c.fill();
  c.beginPath(); c.moveTo(-0.05,-0.05); c.lineTo(0,-0.34); c.lineTo(0.05,-0.05); c.closePath(); c.fill();
  // canopy
  c.fillStyle='rgba(173,205,240,0.95)';
  c.beginPath(); c.ellipse(0,-0.02,0.08,0.10,0,0,7); c.fill();
  // wingtip nav lights
  c.fillStyle=C.red; c.beginPath(); c.arc(-1.0,0.05,0.05,0,7); c.fill();
  c.fillStyle=C.green; c.beginPath(); c.arc(1.0,0.05,0.05,0,7); c.fill();
  c.restore();
};

/* ---------- aircraft: top view (for spin / turn) ----------
   heading rot in rad. s ≈ half span px. opt:{stallL,stallR} tint wings. */
S.planeTop = function(c,x,y,s,rot,opt){
  opt=opt||{}; var col=opt.color||'#33405a';
  c.save(); c.translate(x,y); c.rotate(rot); c.scale(s,s);
  c.lineJoin='round';
  // fuselage along +y (nose up)
  c.fillStyle=col;
  c.beginPath();
  c.moveTo(0,-1.05);
  c.quadraticCurveTo(0.12,-0.5,0.10,0.3);
  c.quadraticCurveTo(0.08,0.85,0,1.0);
  c.quadraticCurveTo(-0.08,0.85,-0.10,0.3);
  c.quadraticCurveTo(-0.12,-0.5,0,-1.05);
  c.closePath(); c.fill();
  // wings
  c.fillStyle=opt.wingL||col;
  c.beginPath(); c.moveTo(-0.05,-0.30); c.lineTo(-1.0,-0.12); c.lineTo(-1.0,0.10); c.lineTo(-0.05,0.12); c.closePath(); c.fill();
  c.fillStyle=opt.wingR||col;
  c.beginPath(); c.moveTo(0.05,-0.30); c.lineTo(1.0,-0.12); c.lineTo(1.0,0.10); c.lineTo(0.05,0.12); c.closePath(); c.fill();
  // tailplane
  c.fillStyle=col;
  c.beginPath(); c.moveTo(-0.04,0.78); c.lineTo(-0.42,0.92); c.lineTo(-0.42,1.0); c.lineTo(-0.04,0.95); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(0.04,0.78); c.lineTo(0.42,0.92); c.lineTo(0.42,1.0); c.lineTo(0.04,0.95); c.closePath(); c.fill();
  // canopy
  c.fillStyle='rgba(173,205,240,0.9)';
  c.beginPath(); c.ellipse(0,-0.45,0.07,0.18,0,0,7); c.fill();
  c.restore();
};

/* ---------- glider (slim, long wings) side view ---------- */
S.glider = function(c,x,y,s,pitch,opt){
  opt=opt||{}; var col=opt.color||'#33405a';
  c.save(); c.translate(x,y); c.rotate(-(pitch||0)); c.scale(s,s);
  c.lineJoin='round'; c.fillStyle=col;
  // slender fuselage
  c.beginPath();
  c.moveTo(1.0,0); c.quadraticCurveTo(0.2,-0.10,-0.5,-0.06);
  c.quadraticCurveTo(-1.0,-0.04,-1.1,0); c.quadraticCurveTo(-1.0,0.05,-0.5,0.05);
  c.quadraticCurveTo(0.2,0.07,1.0,0); c.closePath(); c.fill();
  // canopy
  c.fillStyle='rgba(173,205,240,0.95)';
  c.beginPath(); c.ellipse(0.55,-0.05,0.16,0.07,0,0,7); c.fill();
  // long thin wing
  c.fillStyle=col;
  c.fillRect(-0.15,-0.10,0.18,0.02*1);
  c.beginPath(); c.moveTo(0.1,-0.07); c.lineTo(-0.35,-0.085); c.lineTo(-0.35,-0.055); c.lineTo(0.1,-0.04); c.closePath(); c.fill();
  // T-tail
  c.beginPath(); c.moveTo(-0.95,-0.02); c.lineTo(-1.12,-0.34); c.lineTo(-1.02,-0.34); c.lineTo(-0.82,-0.02); c.closePath(); c.fill();
  c.fillRect(-1.16,-0.36,0.26,0.03);
  c.restore();
};

/* ---------- labelled force arrow with value badge ----------
   from (x,y) along (dx,dy) px. opt:{color,label,sub,w,head,labelSide} */
S.forceArrow = function(c,x,y,dx,dy,opt){
  opt=opt||{}; var col=opt.color||C.ink;
  var x2=x+dx, y2=y+dy, len=Math.hypot(dx,dy);
  if(len<2) return;
  Plot.arrow(c,x,y,x2,y2,{color:col,w:opt.w||4.5,head:opt.head||11});
  if(opt.label){
    var pad=5, fs=opt.fs||12;
    c.font='700 '+fs+'px '+fontSans();
    var tw=c.measureText(opt.label).width;
    var bw=tw+pad*2+ (opt.sub?0:0), bh=fs+8;
    // place beyond the arrow tip
    var ux=dx/len, uy=dy/len;
    var bx=x2+ux*8, by=y2+uy*8;
    bx = (ux>=0)? bx : bx-bw;
    by = by - bh/2;
    bx = (Math.abs(uy)>Math.abs(ux)) ? x2 - bw/2 + (opt.labelDX||0) : bx;
    S.roundRect(c,bx,by,bw,bh,bh/2); c.fillStyle=col; c.fill();
    c.fillStyle='#fff'; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(opt.label,bx+bw/2,by+bh/2+0.5);
  }
};
function fontSans(){ return '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif'; }

/* small filled value chip centred at (x,y) — for force/value labels */
S.valBadge = function(c,x,y,text,color){
  c.save(); c.font='700 11.5px '+fontSans();
  var tw=c.measureText(text).width, bw=tw+16, bh=21;
  var bx=x-2, by=y-bh/2;
  S.roundRect(c,bx,by,bw,bh,bh/2); c.fillStyle=color||C.ink; c.fill();
  c.fillStyle='#fff'; c.textAlign='left'; c.textBaseline='middle';
  c.fillText(text,bx+8,by+bh/2+0.5); c.restore();
};

/* soft glow blob (for suction spots, warnings, lights) */
S.glow = function(c,x,y,r,color){
  var g=c.createRadialGradient(x,y,0,x,y,r);
  g.addColorStop(0,color); g.addColorStop(1,'rgba(255,255,255,0)');
  c.save(); c.globalCompositeOperation='lighter'; c.fillStyle=g;
  c.beginPath(); c.arc(x,y,r,0,7); c.fill(); c.restore();
};

/* pulsing red vignette + chip for stall / warning states */
S.warnFrame = function(c,x,y,w,h,t,label){
  var a=0.35+0.35*Math.sin(t*9);
  c.save();
  c.strokeStyle='rgba(216,83,63,'+a+')'; c.lineWidth=5;
  S.roundRect(c,x+3,y+3,w-6,h-6,12); c.stroke();
  if(label){
    c.font='800 13px '+fontSans(); var tw=c.measureText(label).width;
    var bw=tw+26, bx=x+w/2-bw/2, by=y+12;
    S.roundRect(c,bx,by,bw,28,14); c.fillStyle=C.red; c.fill();
    c.fillStyle='#fff'; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('⚠ '+label, x+w/2, by+15);
  }
  c.restore();
};

/* tiny title chip top-left of a scene */
S.tag = function(c,x,y,text,color){
  color=color||C.ink2;
  c.save(); c.font='700 11px '+fontSans();
  var tw=c.measureText(text).width;
  S.roundRect(c,x,y,tw+18,22,11); c.fillStyle='rgba(255,255,255,0.82)'; c.fill();
  c.strokeStyle='rgba(20,30,50,0.08)'; c.lineWidth=1; c.stroke();
  c.fillStyle=color; c.textAlign='left'; c.textBaseline='middle';
  c.fillText(text,x+9,y+12); c.restore();
};

/* vertical streamline ribbon through a wing region (anim particles).
   pts:[{x,y}] world, spd-scaled colours handled by caller. */
S.flowDot = function(c,x,y,r,speedT){
  c.beginPath(); c.arc(x,y,r,0,7);
  c.fillStyle=Plot.cmap(0.18+0.7*S.clamp01(speedT)); c.fill();
};

window.Scene = S;
})();
