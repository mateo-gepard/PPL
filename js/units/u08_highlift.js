/* Unit 08 — Auftriebshilfen (Klappen & Vorflügel) */
(function(){
var S=16, mDef=1100;
// config -> aerodynamic params
function cfg(flap, slat){
  var base={clMax:1.45, a0:-3.5, aCrit:16, cd0:0.028};
  var f={0:{dCl:0,da0:0,daC:0,dcd:0},15:{dCl:0.35,da0:-3,daC:-1.5,dcd:0.01},
         30:{dCl:0.62,da0:-6,daC:-2.5,dcd:0.035},40:{dCl:0.72,da0:-8,daC:-3.5,dcd:0.07}}[flap];
  var o={clMax:base.clMax+f.dCl, a0:base.a0+f.da0, aCrit:base.aCrit+f.daC, cd0:base.cd0+f.dcd};
  if(slat){ o.clMax+=0.30; o.aCrit+=4; }
  return o;
}
function clCurve(a,o){ return Phys.cl(a,{clAlpha:0.10,alpha0:o.a0,clMax:o.clMax,alphaCrit:o.aCrit}); }
function vstall(o,m){ return Phys.ms2kt(Math.sqrt(2*(m||mDef)*Phys.g/(Phys.rho0*S*o.clMax))); }

App.registerUnit({
  id:'highlift', group:'Auftrieb', n:8, ch:'Kap. 7', icon:'flap',
  title:'Auftriebshilfen',
  subtitle:'Klappen und Vorflügel erhöhen c_Amax und senken die Mindestgeschwindigkeit — auf Kosten von Widerstand.',
  intro:'Start- und Landehilfen vergrössern Wölbung (und Fläche) des Flügels. Dadurch steigt der maximale Auftriebsbeiwert c_Amax, und die Überziehgeschwindigkeit sinkt. Fahre die Klappen aus und beobachte, wie sich die c_A-Kurve nach oben/links verschiebt und V_S kleiner wird.',

  sim:function(ctx){
    var stage=ctx.stage, side=ctx.side;
    var st={flap:0, slat:false, flapAnim:0};
    var rc=UI.responsiveCanvas(stage,{height:400, animate:true, draw:draw, state:st});

    var ro=UI.readouts([
      {id:'clmax',k:'c_Amax (aktuell)',unit:''},{id:'clmax0',k:'c_Amax (clean)',unit:''},
      {id:'vs',k:'V_S (aktuell)',unit:'kt'},{id:'vs0',k:'V_S (clean)',unit:'kt'},
      {id:'red',k:'V_S-Reduktion',unit:'%'},{id:'acrit',k:'kritischer α',unit:'°'}
    ]);
    stage.appendChild(ro.el);

    var cp=UI.controlPanel('Konfiguration');
    cp.appendChild(UI.segment({label:'Klappenstellung',value:0,options:[
      {v:0,t:'Clean 0°'},{v:15,t:'15°'},{v:30,t:'30°'},{v:40,t:'40°'}],
      onChange:function(v){st.flap=+v;upd();}}).el);
    cp.appendChild(UI.check({label:'Vorflügel (Slats) ausgefahren',checked:false,onChange:function(v){st.slat=v;upd();}}).el);
    stage.appendChild(cp);

    function upd(){
      var o=cfg(st.flap,st.slat), o0=cfg(0,false);
      ro.set('clmax',o.clMax.toFixed(2),'good');
      ro.set('clmax0',o0.clMax.toFixed(2));
      ro.set('vs',vstall(o).toFixed(0),'good');
      ro.set('vs0',vstall(o0).toFixed(0));
      ro.set('red','−'+((1-vstall(o)/vstall(o0))*100).toFixed(0));
      ro.set('acrit',o.aCrit.toFixed(0));
    }

    function draw(c,W,H,t){
      st.flapAnim += (st.flap - st.flapAnim)*0.15;
      var o=cfg(st.flap,st.slat), o0=cfg(0,false);
      // ---- left: airfoil with flap ----
      var ax0=20, aw=W*0.46-30, acy=H*0.30, chord=aw, hinge=0.70;
      drawAirfoil(c, ax0, acy, chord, st.flapAnim, st.slat);
      Plot.text(c,'Profil mit Wölbklappe'+(st.slat?' + Vorflügel':''), ax0, acy+62,{color:Plot.colors.ink2,font:'600 11px -apple-system'});
      Plot.text(c, st.flap?('Klappen '+st.flap+'° → mehr Wölbung, mehr c_Amax'):'Reiseflug — saubere Konfiguration',
        ax0, acy+80,{color:Plot.colors.ink3,font:'11px -apple-system'});

      // ---- right: cA-alpha curves ----
      var bx=W*0.5+24, bw=W-bx-20, bch=H*0.62;
      var ch=new Plot.Chart(c,{x:bx,y:18,w:bw,h:bch,xmin:-14,xmax:22,ymin:0,ymax:2.6});
      ch.axes({xlabel:'Anstellwinkel α (°)', ylabel:'c_A', xticks:[-12,-6,0,6,12,18], yticks:[0,0.5,1,1.5,2,2.5]});
      // clean (reference)
      ch.curve(function(x){return clCurve(x,o0);},{color:Plot.colors.ink3,w:1.8,dash:[5,4],n:110});
      // current
      ch.curve(function(x){return clCurve(x,o);},{color:Plot.colors.accent,w:2.6,n:110});
      ch.hline(o.clMax,{color:'rgba(31,157,107,.5)',dash:[4,4]});
      ch.dot(o.aCrit, o.clMax, {color:Plot.colors.green,ring:true,r:5,label:'c_Amax',lcolor:Plot.colors.green});
      Plot.text(c,'clean', ch.px(18), ch.py(clCurve(18,o0))-2,{color:Plot.colors.ink3,font:'600 10px -apple-system'});
      Plot.text(c,'mit Hilfen', ch.px(-13), ch.py(0.55),{color:Plot.colors.accent,font:'600 10px -apple-system'});

      // stall-speed bar comparison
      var by=H-44, bw2=bw;
      var vs=vstall(o), vs0=vstall(o0), vmax=vstall(cfg(0,false))*1.05;
      Plot.text(c,'Überziehgeschwindigkeit V_S', bx, by-10,{color:Plot.colors.ink,font:'700 11.5px -apple-system'});
      c.fillStyle='#eef1f6'; roundR(c,bx,by,bw2,14,5); c.fill();
      c.fillStyle=Plot.colors.ink3; roundR(c,bx,by,bw2*(vs0/vmax),14,5); c.fill();
      c.fillStyle=Plot.colors.green; roundR(c,bx,by,bw2*(vs/vmax),14,5); c.fill();
      Plot.text(c, vs.toFixed(0)+' kt', bx+6, by+11,{color:'#fff',font:'700 10px -apple-system'});
      Plot.text(c, 'clean '+vs0.toFixed(0)+' kt', bx+bw2-4, by+25,{color:Plot.colors.ink3,font:'10px -apple-system',align:'right'});
    }

    upd();
    side.appendChild(UI.tcard({tag:'Ziel', icon:'1', title:'Mindestgeschwindigkeit senken',
      html:'<p>Auftriebshilfen erhöhen den maximalen Auftriebsbeiwert c_Amax (und teils die Fläche). Da V_S = √(2G/(ρ·F·c_Amax)), sinkt damit die <b>Überziehgeschwindigkeit</b> — kürzere Start- und Landestrecken.</p>'}));
    side.appendChild(UI.tcard({tag:'Klappen', icon:'2', title:'Wölbklappen',
      html:'<p>Klappen an der Hinterkante vergrössern die <b>Wölbung</b>: Die c_A-Kurve verschiebt sich nach oben und links (Nullauftrieb bei negativerem Winkel). Der kritische Anstellwinkel wird etwas <b>kleiner</b>, der Widerstand grösser.</p>'}));
    side.appendChild(UI.tcard({tag:'Vorflügel', icon:'3', title:'Slats verzögern den Abriss',
      html:'<p>Vorflügel an der Vorderkante führen energiereiche Luft auf die Oberseite. Sie <b>erhöhen den kritischen Anstellwinkel</b> und c_Amax — die Strömung reisst erst später ab.</p>'}));
    side.appendChild(UI.callout('Faustregel zur Bedienung: <b>Klappen schrittweise</b> setzen. Beim Start meist nur kleine Stellung (viel Auftrieb, wenig Widerstand); zur Landung volle Stellung (viel Auftrieb <i>und</i> Widerstand für steileren, langsameren Anflug).'));
    return {destroy:function(){rc.destroy();}};
  },

  theory:function(){return ''+
   '<h2>Warum Auftriebshilfen?</h2>'+
   '<p>Start und Landung sollen möglichst langsam erfolgen — das verkürzt die Strecken und erhöht die Sicherheit. Die Mindestgeschwindigkeit ist die Überziehgeschwindigkeit:</p>'+
   '<div class="formula">V_S = √( 2·G / (ρ·F·c_Amax) )</div>'+
   '<p>Sie sinkt, wenn man <b>c_Amax</b> oder die <b>Fläche F</b> vergrössert. Genau das leisten Start- und Landehilfen.</p>'+
   '<h2>Wölbklappen (Flaps)</h2>'+
   '<p>Klappen an der Flügelhinterkante erhöhen die Wölbung des Profils. Die c_A-Kurve verschiebt sich parallel nach oben: bei jedem Anstellwinkel mehr Auftrieb, und ein höheres c_Amax. Der Nullauftriebswinkel wird negativer. Allerdings sinkt der kritische Anstellwinkel etwas, und der <b>Widerstand steigt</b> deutlich — bei grossen Stellungen erwünscht für einen steileren Landeanflug. Bauarten: einfache Wölbklappe, Spreizklappe, Spaltklappe und <b>Fowler-Klappe</b> (vergrössert zusätzlich die Fläche).</p>'+
   '<h2>Vorflügel (Slats)</h2>'+
   '<p>An der Vorderkante leiten Vorflügel energiereiche Luft auf die Oberseite und verzögern den Strömungsabriss. Sie <b>erhöhen den kritischen Anstellwinkel</b> und damit c_Amax — die Strömung bleibt bis zu grösseren Winkeln anliegend.</p>'+
   '<h2>Störklappen (Spoiler)</h2>'+
   '<p>Spoiler bewirken das Gegenteil: Sie zerstören gezielt den Auftrieb und erhöhen den Widerstand. Sie dienen dem schnellen Höhenabbau und nach der Landung dem Abbremsen (Bodenanstellung des Auftriebs).</p>'+
   '<h2>Grundregeln zur Klappenbetätigung</h2>'+
   '<p>Klappen werden <b>schrittweise</b> und innerhalb des weissen Bogens (V_FE) betätigt. Kleine Stellungen geben viel Zusatzauftrieb bei wenig Widerstand (Start), grosse Stellungen viel Auftrieb und Widerstand (Landung). Beim Ausfahren steigt der Auftrieb — gegebenenfalls nachtrimmen.</p>';
  },

  quiz:[
    {q:'Was ist der Hauptzweck von Auftriebshilfen (Klappen)?',
     choices:['Den Widerstand im Reiseflug zu senken','Die Überziehgeschwindigkeit zu senken','Die Höchstgeschwindigkeit zu erhöhen','Den Treibstoffverbrauch zu senken'],
     answer:1, explain:'Klappen erhöhen c_Amax und senken so die <b>Überziehgeschwindigkeit</b> V_S — kürzere Start- und Landestrecken.'},
    {q:'Wie verschiebt sich die c_A-α-Kurve beim Ausfahren von Wölbklappen?',
     choices:['Nach unten/rechts','Nach oben/links (höheres c_Amax)','Sie bleibt unverändert','Sie wird flacher'],
     answer:1, explain:'Mehr Wölbung → die Kurve verschiebt sich nach <b>oben und links</b>: mehr Auftrieb bei jedem Winkel, höheres c_Amax, negativerer Nullauftriebswinkel.'},
    {q:'Was bewirken Vorflügel (Slats) vor allem?',
     choices:['Sie senken den kritischen Anstellwinkel','Sie erhöhen den kritischen Anstellwinkel und c_Amax','Sie verringern den Auftrieb','Sie erhöhen nur den Widerstand'],
     answer:1, explain:'Slats führen energiereiche Luft auf die Oberseite und <b>erhöhen den kritischen Anstellwinkel</b> sowie c_Amax — der Abriss tritt später ein.'},
    {q:'Welche Nebenwirkung haben grosse Klappenstellungen?',
     choices:['Deutlich mehr Widerstand','Weniger Auftrieb','Höhere Höchstgeschwindigkeit','Geringeres Gewicht'],
     answer:0, explain:'Grosse Klappenstellungen erzeugen viel Auftrieb, aber auch <b>deutlich mehr Widerstand</b> — erwünscht für einen steileren, langsameren Landeanflug.'},
    {q:'Wozu dienen Störklappen (Spoiler)?',
     choices:['Auftrieb erhöhen','Auftrieb verringern und Widerstand erhöhen','Den kritischen Winkel erhöhen','Die Wölbung vergrössern'],
     answer:1, explain:'Spoiler <b>verringern den Auftrieb</b> und erhöhen den Widerstand — für schnellen Höhenabbau und zum Abbremsen nach der Landung.'}
  ]
});
function roundR(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function af(x){ // NACA-ish half-thickness at chord fraction x (0..1)
  return 0.12*5*(0.2969*Math.sqrt(x)-0.126*x-0.3516*x*x+0.2843*x*x*x-0.1015*x*x*x*x);
}
function camb(x){ return 0.04*(1-Math.pow((x-0.4)/0.6,2))*(x>0?1:0); }
function drawAirfoil(c,x0,cy,chord,flapDeg,slat){
  var hinge=0.68, fa=Phys.rad(flapDeg);
  function pt(xf, up){
    var yc=camb(xf), yt=af(xf)*(up?1:-1);
    var X=xf, Y=yc+yt;
    if(xf>hinge){ // rotate about hinge point on camber line
      var hx=hinge, hy=camb(hinge);
      var dx=X-hx, dy=Y-hy;
      X=hx+dx*Math.cos(fa)+dy*Math.sin(fa);
      Y=hy-dx*Math.sin(fa)+dy*Math.cos(fa);
    }
    return [x0+X*chord, cy-Y*chord];
  }
  c.beginPath();
  var i;
  for(i=0;i<=40;i++){ var xf=i/40; var p=pt(xf,true); i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]); }
  for(i=40;i>=0;i--){ var xf2=i/40; var p2=pt(xf2,false); c.lineTo(p2[0],p2[1]); }
  c.closePath(); c.fillStyle='#33405a'; c.fill();
  // hinge line highlight
  if(flapDeg>0.5){ var hp=pt(hinge,true), hpl=pt(hinge,false);
    c.strokeStyle='rgba(255,255,255,.5)'; c.lineWidth=1; c.beginPath(); c.moveTo(hp[0],hp[1]); c.lineTo(hpl[0],hpl[1]); c.stroke(); }
  // slat (leading-edge element)
  if(slat){ c.fillStyle=Plot.colors.orange;
    c.beginPath();
    for(i=0;i<=12;i++){ var xf=i/12*0.16; var p=pt(xf,true); var px=p[0]-chord*0.05, py=p[1]-chord*0.02; i?c.lineTo(px,py):c.moveTo(px,py); }
    for(i=12;i>=0;i--){ var xf2=i/12*0.16; var p2=pt(xf2,false); c.lineTo(p2[0]-chord*0.05,p2[1]-chord*0.02); }
    c.closePath(); c.fill();
  }
}
})();
