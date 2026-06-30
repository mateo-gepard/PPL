/* ============================================================
   App core: registry, router, dashboard, unit view, progress.
   ============================================================ */
(function(){
const App = { units:[], _byId:{}, _active:null, _teardown:null };

/* ---------- progress (localStorage with safe fallback) ---------- */
var MEM={};
function load(){ try{ return JSON.parse(localStorage.getItem('skylab.progress'))||{}; }catch(e){ return MEM; } }
function save(p){ try{ localStorage.setItem('skylab.progress',JSON.stringify(p)); }catch(e){ MEM=p; } }
App.progress = load();
function unitScore(id){
  var p=App.progress[id]||{};
  var sim = p.sim?1:0;
  var quiz = (p.quiz||0)/100;
  return 0.35*sim + 0.65*quiz;
}
App.markSim=function(id){ var p=App.progress; p[id]=p[id]||{}; p[id].sim=true; save(p); refreshProgress(); };
App.markQuiz=function(id,pct){ var p=App.progress; p[id]=p[id]||{}; p[id].quiz=Math.max(p[id].quiz||0,pct); save(p); refreshProgress(); };
App.isDone=function(id){ var p=App.progress[id]||{}; return p.sim && (p.quiz||0)>=75; };

/* ---------- registry ---------- */
App.registerUnit=function(def){ App.units.push(def); App._byId[def.id]=def; };

/* ---------- icons ---------- */
App.icon=function(n){
  var I={
    atmos:'<path d="M3 14h11a3 3 0 1 0-3-3M3 18h15a3 3 0 1 1-3 3M3 10h7"/>',
    flow:'<path d="M3 8c4 0 4 3 8 3s4-3 8-3M3 14c4 0 4 3 8 3s4-3 8-3M3 19c4 0 4 1 8 1s4-1 8-1"/>',
    gauge:'<path d="M5 18a8 8 0 1 1 14 0"/><path d="M12 14l4-4"/><circle cx="12" cy="14" r="1.3" fill="currentColor" stroke="none"/>',
    wing:'<path d="M3 16c6 1 12-1 18-9-2 6-6 11-13 12-2 .3-4-1-5-3z"/><path d="M9 13l3 3"/>',
    lift:'<path d="M12 21V7"/><path d="M7 12l5-5 5 5"/><path d="M4 21h16"/>',
    drag:'<path d="M4 12h10"/><path d="M14 8l5 4-5 4"/><path d="M4 7v10"/>',
    glide:'<path d="M4 6l16 6-16 6 4-6z"/>',
    flap:'<path d="M3 10h12l5 3-5 3H8z"/><path d="M15 16l3 4"/>',
    yaw:'<path d="M12 3v18"/><path d="M5 8l7-5 7 5"/><path d="M8 14l-4 4 4 4" opacity=".0"/><path d="M4 18h16"/>',
    turn:'<path d="M4 16a8 8 0 1 1 16 0"/><path d="M16 10l4-2 0 4z" fill="currentColor" stroke="none"/>',
    stall:'<path d="M3 7c5 0 5 4 9 4M3 12c5 0 6 5 10 4"/><path d="M16 8l5 3-5 3"/>',
    book:'<path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z"/><path d="M4 19a2 2 0 0 1 2-2h12"/>'
  };
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+(I[n]||I.book)+'</svg>';
};

/* ---------- boot ---------- */
App.boot=function(){
  buildNav();
  bindChrome();
  refreshProgress();
  // route from hash
  route();
  window.addEventListener('hashchange',route);
};
function route(){
  var h=location.hash.replace('#','');
  if(h==='exam'){ App.openExam(); return; }
  if(h && App._byId[h]){ App.openUnit(h); return; }
  App.openHome();
}

function bindChrome(){
  document.getElementById('brandHome').onclick=function(){ location.hash=''; };
  document.getElementById('examBtn').onclick=function(){ location.hash='exam'; };
  document.getElementById('menuToggle').onclick=function(){ document.getElementById('sidebar').classList.toggle('open'); };
  document.getElementById('resetBtn').onclick=function(){
    if(confirm('Gesamten Lernfortschritt zurücksetzen?')){ App.progress={}; save({}); refreshProgress(); route(); }
  };
}

/* ---------- navigation ---------- */
var GROUPS=[
  {key:'Grundlagen', label:'Grundlagen der Strömung'},
  {key:'Auftrieb', label:'Auftrieb, Widerstand & Polare'},
  {key:'Steuerung', label:'Steuerung & Flugzustände'}
];
function buildNav(){
  var nav=document.getElementById('nav'); nav.innerHTML='';
  GROUPS.forEach(function(g){
    var box=document.createElement('div'); box.className='nav-group';
    box.appendChild(elc('div','nav-group-label',g.label));
    App.units.filter(function(u){return u.group===g.key;}).forEach(function(u){
      var it=document.createElement('div'); it.className='nav-item'; it.dataset.id=u.id;
      it.innerHTML='<span class="nav-num">'+u.n+'</span><span class="nav-title">'+u.title+'</span><span class="nav-check">✓</span>';
      it.onclick=function(){ location.hash=u.id; document.getElementById('sidebar').classList.remove('open'); };
      box.appendChild(it);
    });
    nav.appendChild(box);
  });
}
function refreshProgress(){
  // overall
  var total=App.units.length||1, sum=0;
  App.units.forEach(function(u){ sum+=unitScore(u.id); });
  var pct=Math.round(sum/total*100);
  document.getElementById('overallPct').textContent=pct+'%';
  document.getElementById('overallBar').style.width=pct+'%';
  // nav state
  document.querySelectorAll('.nav-item').forEach(function(it){
    var id=it.dataset.id;
    it.classList.toggle('done', App.isDone(id));
    it.classList.toggle('active', App._active===id);
  });
}

/* ---------- view helpers ---------- */
function elc(t,c,h){var e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e;}
function teardown(){ if(App._teardown){try{App._teardown();}catch(e){} App._teardown=null;} }

/* ---------- HOME / dashboard ---------- */
App.openHome=function(){
  teardown(); App._active=null; refreshProgress();
  document.getElementById('crumb').innerHTML='<b>Übersicht</b>';
  var done=App.units.filter(function(u){return App.isDone(u.id);}).length;
  var v=document.getElementById('view');
  var wrap=elc('div','wrap');
  wrap.innerHTML=
   '<div class="hero">'+
     '<h1>PPL Aerodynamik — interaktiv verstehen</h1>'+
     '<p>Elf Lerneinheiten mit physikalisch echten Simulationen, direkt verknüpft mit dem EASA-Stoff „081 Principles of Flight". Spiele mit den Parametern, sieh die Strömung, und festige alles mit Prüfungsfragen.</p>'+
     '<div class="hero-meta">'+
       '<div class="hm"><b>11</b><span>Einheiten</span></div>'+
       '<div class="hm"><b>11</b><span>Simulationen</span></div>'+
       '<div class="hm"><b>'+totalQuestions()+'</b><span>Prüfungsfragen</span></div>'+
       '<div class="hm"><b>'+done+'/'+App.units.length+'</b><span>Abgeschlossen</span></div>'+
     '</div>'+
   '</div>';
  GROUPS.forEach(function(g){
    wrap.appendChild(elc('div','section-title',g.label));
    var cards=elc('div','cards');
    App.units.filter(function(u){return u.group===g.key;}).forEach(function(u){
      cards.appendChild(unitCard(u));
    });
    wrap.appendChild(cards);
  });
  // exam card
  wrap.appendChild(elc('div','section-title','Prüfung'));
  var ex=elc('div','ucard');
  ex.style.background='linear-gradient(120deg,#fff, #f4f8ff)';
  ex.innerHTML='<div class="uc-top"><div class="uc-ico" style="background:var(--orange-soft);color:var(--orange)">'+App.icon('book')+'</div><span class="uc-badge" style="background:var(--orange-soft);color:#9a5a12">Mock-Exam</span></div>'+
    '<h3>Prüfungssimulator</h3><p>20 gemischte Fragen im EASA-Stil aus allen Kapiteln. 75% zum Bestehen.</p>'+
    '<div class="uc-foot"><span class="status">Alle Themen</span><span class="chip orange">Start →</span></div>';
  ex.onclick=function(){ location.hash='exam'; };
  wrap.appendChild(ex);

  v.innerHTML=''; v.appendChild(wrap); v.scrollTop=0;
};
function unitCard(u){
  var c=elc('div','ucard'); var sc=Math.round(unitScore(u.id)*100); var done=App.isDone(u.id);
  c.innerHTML=
    '<div class="uc-top"><div class="uc-ico">'+App.icon(u.icon)+'</div><span class="uc-badge">'+u.ch+'</span></div>'+
    '<h3>'+u.title+'</h3><p>'+u.subtitle+'</p>'+
    '<div class="uc-foot"><div class="mini-bar"><i style="width:'+sc+'%"></i></div>'+
    '<span class="status'+(done?' done':'')+'">'+(done?'✓ Fertig':(sc>0?sc+'%':'Start'))+'</span></div>';
  c.onclick=function(){ location.hash=u.id; };
  return c;
}
function totalQuestions(){ var n=0; App.units.forEach(function(u){n+=(u.quiz||[]).length;}); return n; }

/* ---------- UNIT view ---------- */
App.openUnit=function(id){
  teardown();
  var u=App._byId[id]; if(!u){ App.openHome(); return; }
  App._active=id; refreshProgress();
  App.markSim(id);
  document.getElementById('crumb').innerHTML=u.ch+' · <b>'+u.title+'</b>';
  var v=document.getElementById('view'); v.scrollTop=0; v.innerHTML='';
  var wrap=elc('div','wrap');
  wrap.appendChild(elc('div','unit-head',
    '<div class="eyebrow">'+u.ch+' · Einheit '+u.n+'</div><h1>'+u.title+'</h1><p>'+u.intro+'</p>'));
  // tabs
  var tabs=elc('div','tabs');
  var tSim=elc('div','tab active','Simulation');
  var tThe=elc('div','tab','Theorie');
  var qdone=(App.progress[id]&&App.progress[id].quiz>=75);
  var tQui=elc('div','tab'+(qdone?' complete':''),'Quiz <span class="dot"></span>');
  tabs.appendChild(tSim); tabs.appendChild(tThe); tabs.appendChild(tQui);
  wrap.appendChild(tabs);
  var body=elc('div'); wrap.appendChild(body);
  v.appendChild(wrap);

  function activate(tab){ [tSim,tThe,tQui].forEach(function(t){t.classList.remove('active');}); tab.classList.add('active'); }

  function showSim(){
    teardown(); activate(tSim); body.innerHTML='';
    var lab=elc('div','lab');
    var stage=elc('div','panel sim-stage');
    var side=elc('div','theory-side');
    lab.appendChild(stage); lab.appendChild(side); body.appendChild(lab);
    try{
      var inst=u.sim({stage:stage, side:side});
      App._teardown=(inst&&inst.destroy)?inst.destroy:null;
    }catch(e){ stage.innerHTML='<div style="padding:30px;color:#d8533f">Sim-Fehler: '+e.message+'</div>'; console.error(e); }
  }
  function showTheory(){
    teardown(); activate(tThe); body.innerHTML='';
    var p=elc('div','prose'); p.innerHTML=u.theory(); body.appendChild(p);
  }
  function showQuiz(){
    teardown(); activate(tQui); body.innerHTML='';
    var host=elc('div'); body.appendChild(host);
    Quiz.render(host, u.quiz, { shuffle:true, onComplete:function(pct){
      App.markQuiz(id,pct);
      if(pct>=75) tQui.classList.add('complete');
    }});
  }
  tSim.onclick=showSim; tThe.onclick=showTheory; tQui.onclick=showQuiz;
  showSim();
};

/* ---------- EXAM ---------- */
App.openExam=function(){
  teardown(); App._active=null; refreshProgress();
  document.getElementById('crumb').innerHTML='<b>Prüfungssimulator</b>';
  var pool=[]; App.units.forEach(function(u){ (u.quiz||[]).forEach(function(q){ pool.push(q); }); });
  // pick 20 random
  pool=pool.slice(); for(var i=pool.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=pool[i];pool[i]=pool[j];pool[j]=t;}
  var pick=pool.slice(0,Math.min(20,pool.length));
  var v=document.getElementById('view'); v.scrollTop=0; v.innerHTML='';
  var wrap=elc('div','wrap');
  wrap.appendChild(elc('div','unit-head','<div class="eyebrow">Mock-Exam · EASA 081</div><h1>Prüfungssimulator</h1><p>'+pick.length+' zufällige Fragen aus allen Einheiten. Ziel: mindestens 75% — wie in der echten PPL-Theorieprüfung.</p>'));
  var host=elc('div'); wrap.appendChild(host); v.appendChild(wrap);
  Quiz.render(host, pick, { shuffle:false });
};

window.App=App;
})();
