/* ============================================================
   UI builders — sliders, segmented buttons, checkboxes, readouts.
   Returns DOM elements + simple wiring; sims supply onchange.
   ============================================================ */
(function(){
const UI = {};

UI.el = function(tag, cls, html){
  var e=document.createElement(tag);
  if(cls)e.className=cls;
  if(html!=null)e.innerHTML=html;
  return e;
};

/* slider control. opt:{label,min,max,step,value,unit,fmt,onInput} -> {el,set,get,input} */
UI.slider = function(opt){
  var wrap=UI.el('div','ctrl');
  var row=UI.el('div','ctrl-row');
  var lab=UI.el('label',null,opt.label);
  var val=UI.el('span','val');
  row.appendChild(lab); row.appendChild(val);
  var input=UI.el('input'); input.type='range';
  input.min=opt.min; input.max=opt.max; input.step=opt.step!=null?opt.step:1;
  input.value=opt.value;
  wrap.appendChild(row); wrap.appendChild(input);
  function show(v){ val.textContent=(opt.fmt?opt.fmt(v):v)+(opt.unit?(' '+opt.unit):''); }
  function get(){ return parseFloat(input.value); }
  show(get());
  input.addEventListener('input',function(){ show(get()); opt.onInput&&opt.onInput(get()); });
  return {el:wrap, input:input, get:get,
    set:function(v){ input.value=v; show(get()); },
    showVal:show };
};

/* segmented control. opt:{label,options:[{v,t}],value,onChange} */
UI.segment = function(opt){
  var wrap=UI.el('div','ctrl');
  if(opt.label){ var row=UI.el('div','ctrl-row'); row.appendChild(UI.el('label',null,opt.label)); wrap.appendChild(row); }
  var seg=UI.el('div','seg'); var cur=opt.value;
  var btns=[];
  opt.options.forEach(function(o){
    var b=UI.el('button',o.v===cur?'on':null,o.t); b.dataset.v=o.v;
    b.addEventListener('click',function(){
      cur=o.v; btns.forEach(function(x){x.classList.toggle('on',x.dataset.v==String(cur));});
      opt.onChange&&opt.onChange(o.v);
    });
    btns.push(b); seg.appendChild(b);
  });
  wrap.appendChild(seg);
  return {el:wrap, get:function(){return cur;}, set:function(v){cur=v;btns.forEach(function(x){x.classList.toggle('on',x.dataset.v==String(v));});}};
};

/* checkbox. opt:{label,checked,onChange} */
UI.check = function(opt){
  var lab=UI.el('label','chk');
  var i=UI.el('input'); i.type='checkbox'; i.checked=!!opt.checked;
  lab.appendChild(i); lab.appendChild(document.createTextNode(opt.label));
  i.addEventListener('change',function(){opt.onChange&&opt.onChange(i.checked);});
  return {el:lab, get:function(){return i.checked;}, set:function(v){i.checked=v;}};
};

/* readout grid. defs:[{id,k,unit}] -> {el, set(id,value,cls)} */
UI.readouts = function(defs){
  var grid=UI.el('div','readouts'); var map={};
  defs.forEach(function(d){
    var ro=UI.el('div','ro'); ro.dataset.id=d.id;
    var k=UI.el('div','k',d.k); var v=UI.el('div','v','—');
    ro.appendChild(k); ro.appendChild(v); grid.appendChild(ro);
    map[d.id]={ro:ro,v:v,unit:d.unit||''};
  });
  return { el:grid,
    set:function(id,value,cls){ var m=map[id]; if(!m)return;
      m.v.innerHTML=value+(m.unit?(' <small>'+m.unit+'</small>'):'');
      m.ro.className='ro'+(cls?(' '+cls):''); } };
};

/* button */
UI.button = function(label,cls,onClick){
  var b=UI.el('button','btn'+(cls?(' '+cls):''),label);
  b.addEventListener('click',onClick); return b;
};

/* a titled control panel container */
UI.controlPanel = function(title){
  var p=UI.el('div','sim-controls');
  if(title)p.appendChild(UI.el('h4',null,title));
  return p;
};

/* Responsive HiDPI canvas with optional animation loop.
   opt:{height (px or fn(w)), draw(ctx,w,h,t,state), animate, onPointer}
   returns {canvas, ctx, redraw, destroy, w, h, state}
   - draw is called with CSS-pixel coordinate system already set.
   - redraw() re-fits if width changed, then draws one frame (static use).
   - if animate:true, a rAF loop calls draw every frame. */
UI.responsiveCanvas = function(parent, opt){
  var wrap=UI.el('div','sim-canvas-wrap');
  var canvas=document.createElement('canvas');
  wrap.appendChild(canvas); parent.appendChild(wrap);
  var ctx=null, W=0, H=0, raf=null, t0=performance.now(), alive=true;
  var state=opt.state||{};
  function measure(){
    var w=Math.max(280, wrap.clientWidth||parent.clientWidth||640);
    var h=typeof opt.height==='function'?opt.height(w):(opt.height||380);
    if(w!==W||h!==H){ W=w; H=h; ctx=Plot.fit(canvas,W,H); }
    return ctx;
  }
  function frame(now){
    if(!alive)return;
    measure();
    ctx.clearRect(0,0,W,H);
    opt.draw(ctx,W,H,(now-t0)/1000,state);
    if(opt.animate) raf=requestAnimationFrame(frame);
  }
  function redraw(){ measure(); ctx.clearRect(0,0,W,H); opt.draw(ctx,W,H,(performance.now()-t0)/1000,state); }
  var ro=null;
  if(window.ResizeObserver){ ro=new ResizeObserver(function(){ if(!opt.animate) redraw(); }); ro.observe(wrap); }
  else window.addEventListener('resize', redraw);
  if(opt.onPointer){
    var handler=function(ev){
      var r=canvas.getBoundingClientRect();
      var cx=(ev.touches?ev.touches[0].clientX:ev.clientX)-r.left;
      var cy=(ev.touches?ev.touches[0].clientY:ev.clientY)-r.top;
      opt.onPointer(cx,cy,ev,state); if(!opt.animate) redraw();
    };
    canvas.addEventListener('pointermove',handler);
    canvas.addEventListener('pointerdown',handler);
    wrap._ph=handler;
  }
  measure();
  if(opt.animate) raf=requestAnimationFrame(frame); else redraw();
  return {
    canvas:canvas, wrap:wrap, get ctx(){return ctx;}, get w(){return W;}, get h(){return H;}, state:state,
    redraw:redraw,
    destroy:function(){ alive=false; if(raf)cancelAnimationFrame(raf); if(ro)ro.disconnect(); else window.removeEventListener('resize',redraw); }
  };
};

/* build a card for the theory side panel */
UI.tcard = function(o){ // {tag,icon,title,html}
  var c=UI.el('div','tcard');
  if(o.tag)c.appendChild(UI.el('span','tag',o.tag));
  if(o.title)c.appendChild(UI.el('h4',null,(o.icon?('<span class="ti">'+o.icon+'</span>'):'')+o.title));
  if(o.html)c.appendChild(UI.el('div',null,o.html));
  return c;
};
UI.callout = function(html){ return UI.el('div','callout','<span class="ci">⚠️</span><div>'+html+'</div>'); };

/* legend strip */
UI.legend = function(items){ // [{c,t,dot}]
  var l=UI.el('div','legend');
  items.forEach(function(it){
    var s=UI.el('span');
    var i=UI.el('i',it.dot?'dot':null); i.style.background=it.c;
    s.appendChild(i); s.appendChild(document.createTextNode(it.t)); l.appendChild(s);
  });
  return l;
};

window.UI = UI;
})();
