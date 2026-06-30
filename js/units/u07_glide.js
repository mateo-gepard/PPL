/* Unit 07 — Geschwindigkeitspolare & Gleitflug */
(function(){
var S=16, CD0=0.028, AR=8, e=0.8, m=1100;
function sink(iasKt){ // m/s sink rate in still air
  var V=Phys.kt2ms(iasKt), W=m*Phys.g, q=Phys.q(Phys.rho0,V);
  var cl=W/(q*S); var cd=CD0+cl*cl/(Math.PI*AR*e);
  return V*cd/cl;
}
function scanBestGlide(){ var best=1e9,vb=70; for(var v=50;v<=140;v+=0.5){ var g=sink(v)/Phys.kt2ms(v); if(g<best){best=g;vb=v;} } return vb; }
function scanMinSink(){ var best=1e9,vb=60; for(var v=45;v<=140;v+=0.5){ var w=sink(v); if(w<best){best=w;vb=v;} } return vb; }

App.registerUnit({
  id:'glide', group:'Auftrieb', n:7, ch:'Kap. 6', icon:'glide',
  title:'Geschwindigkeitspolare & Gleiten',
  subtitle:'Sinkrate über Geschwindigkeit: bestes Gleiten vs. geringstes Sinken — und der Einfluss von Wind.',
  intro:'Triebwerksausfall! Die Geschwindigkeitspolare zeigt für jede Geschwindigkeit die Sinkrate. Die Tangente vom Ursprung liefert die beste Gleitgeschwindigkeit (maximale Reichweite), der höchste Punkt das geringste Sinken (längste Flugzeit). Sieh, wie Gegenwind die beste Gleitgeschwindigkeit erhöht.',

  sim:function(ctx){
    var stage=ctx.stage, side=ctx.side;
    var vBG=scanBestGlide(), vMS=scanMinSink();
    var st={ias:vBG, wind:0, altFt:5000, fieldKm:9, acX:0};
    var rc=UI.responsiveCanvas(stage,{height:400, animate:true, draw:draw, state:st});

    var ro=UI.readouts([
      {id:'bg',k:'beste Gleitgeschw.',unit:'kt'},{id:'ms',k:'geringstes Sinken bei',unit:'kt'},
      {id:'sink',k:'Sinkrate',unit:'m/s'},{id:'gr',k:'Gleitzahl (Luft)',unit:''},
      {id:'grg',k:'Gleitzahl (Grund)',unit:''},{id:'reach',k:'Reichweite',unit:'km'}
    ]);
    stage.appendChild(ro.el);

    var cp=UI.controlPanel('Steuerung');
    cp.appendChild(UI.slider({label:'Gleitgeschwindigkeit (IAS)',min:50,max:130,step:1,value:Math.round(vBG),unit:'kt',onInput:function(v){st.ias=v;upd();}}).el);
    cp.appendChild(UI.slider({label:'Wind (− Gegenwind / + Rückenwind)',min:-30,max:30,step:1,value:0,unit:'kt',onInput:function(v){st.wind=v;upd();}}).el);
    cp.appendChild(UI.slider({label:'Höhe über Grund',min:1000,max:9000,step:250,value:5000,unit:'ft',fmt:function(v){return v.toLocaleString('de-CH');},onInput:function(v){st.altFt=v;upd();}}).el);
    cp.appendChild(UI.slider({label:'Entfernung zum Feld',min:2,max:22,step:0.5,value:9,unit:'km',onInput:function(v){st.fieldKm=v;upd();}}).el);
    var btn=UI.el('div'); btn.style.marginTop='8px';
    btn.appendChild(UI.button('↪ Auf beste Gleitgeschwindigkeit','sec',function(){ st.ias=Math.round(vBG); sl.set(st.ias); upd(); }));
    cp.appendChild(btn);
    stage.appendChild(cp);
    var sl=cp.querySelector('input'); // first slider (ias)

    function metrics(){
      var w=sink(st.ias), V=Phys.kt2ms(st.ias);
      var Vg=Phys.kt2ms(st.ias + st.wind); // wind: + tailwind adds ground speed
      var grAir=V/w, grGnd=Vg/w;
      var h=Phys.ft2m(st.altFt);
      var reach=Math.max(0, Vg*(h/w))/1000; // km
      return {w:w,grAir:grAir,grGnd:grGnd,reach:reach,h:h};
    }
    function upd(){
      var M=metrics();
      ro.set('bg',vBG.toFixed(0),'good'); ro.set('ms',vMS.toFixed(0));
      ro.set('sink',M.w.toFixed(2));
      ro.set('gr','1 : '+M.grAir.toFixed(1));
      ro.set('grg','1 : '+M.grGnd.toFixed(1), st.wind<0?'alert':(st.wind>0?'good':''));
      ro.set('reach',M.reach.toFixed(1), M.reach>=st.fieldKm?'good':'alert');
    }

    function draw(c,W,H,t){
      var M=metrics();
      // ---- left: speed polar (sink downward) ----
      var mL=44, cw=W*0.46-mL-6, chh=H*0.62;
      var maxSink=Math.max(4, sink(130)*1.05);
      var ch=new Plot.Chart(c,{x:mL,y:16,w:cw,h:chh,xmin:0,xmax:135,ymin:maxSink,ymax:0});
      ch.axes({xlabel:'Geschwindigkeit IAS (kt)', ylabel:'Sinkrate (m/s)',
        xticks:[0,30,60,90,120], yticks:[0,1,2,3,4]});
      var pts=[]; for(var v=48;v<=132;v+=2){ pts.push({x:v,y:sink(v)}); }
      ch.poly(pts,{color:Plot.colors.accent,w:2.4});
      // tangent (best glide) from origin
      ch.line(0,0, vBG, sink(vBG), {color:Plot.colors.green,w:1.6,dash:[5,4]});
      ch.dot(vBG, sink(vBG), {color:Plot.colors.green,ring:true,r:5});
      // wind-shifted tangent
      if(st.wind!==0){
        // best glide over ground: maximize Vg/w -> tangent from (−wind, 0)
        var ox=-st.wind; var bestV=vBG, bestG=0;
        for(var v2=50;v2<=132;v2+=0.5){ var g=(v2-ox)/sink(v2); if(g>bestG){bestG=g;bestV=v2;} }
        ch.line(ox,0, bestV, sink(bestV), {color:Plot.colors.orange,w:1.4,dash:[3,3]});
        ch.dot(bestV, sink(bestV), {color:Plot.colors.orange,r:4});
        Plot.text(c, (st.wind<0?'bestes Gleiten bei Gegenwind: ':'bei Rückenwind: ')+bestV.toFixed(0)+' kt',
          W*0.5+10, H-9, {color:Plot.colors.orange,font:'600 10.5px -apple-system'});
      }
      // min sink apex
      ch.dot(vMS, sink(vMS), {color:Plot.colors.ink,r:4});
      Plot.text(c,'min. Sinken',ch.px(vMS)-2,ch.py(sink(vMS))-9,{color:Plot.colors.ink2,font:'600 9.5px -apple-system',align:'center'});
      // current point
      ch.dot(st.ias, M.w, {color:Plot.colors.orange,ring:true,r:6});

      // ---- right: glide scene (side view) ----
      var gx=W*0.5+8, gw=W-gx-16, gtop=20, gground=H-30;
      // sky
      c.fillStyle='#eef5ff'; c.fillRect(gx,gtop,gw,gground-gtop);
      // ground
      c.fillStyle='#e3efe2'; c.fillRect(gx,gground,gw,30);
      c.strokeStyle='#bcd0bb'; c.lineWidth=2; c.beginPath(); c.moveTo(gx,gground); c.lineTo(gx+gw,gground); c.stroke();
      // scale: horizontal gw px = fieldKm*1.6 km window
      var winKm=Math.max(st.fieldKm*1.25, M.reach*1.1, 6);
      var pxPerKm=gw/winKm;
      var hPx=(gground-gtop);
      var altScalePx=hPx/Math.max(st.altFt,1)/1; // map altitude to vertical
      // start point (aircraft release) top-left
      var x0=gx+18, y0=gtop+14;
      // glide slope: drops M.h metres over reach km
      var endX=gx+18 + M.reach*pxPerKm;
      var endY=gground;
      // glide path
      c.strokeStyle=Plot.colors.accent; c.lineWidth=2; c.setLineDash([6,4]);
      c.beginPath(); c.moveTo(x0,y0); c.lineTo(endX,endY); c.stroke(); c.setLineDash([]);
      // field marker
      var fx=gx+18 + st.fieldKm*pxPerKm;
      c.fillStyle=M.reach>=st.fieldKm?Plot.colors.green:Plot.colors.red;
      c.fillRect(fx-1,gground-26,2,26);
      c.beginPath(); c.moveTo(fx,gground-26); c.lineTo(fx+16,gground-21); c.lineTo(fx,gground-16); c.closePath(); c.fill();
      Plot.text(c,'Feld '+st.fieldKm.toFixed(1)+' km', fx, gground-30,{color:Plot.colors.ink2,font:'600 10px -apple-system',align:'center'});
      // animate aircraft along path
      st.acX=(st.acX + 0.0017*pxPerKm*Phys.kt2ms(st.ias+st.wind)) % 1;
      var ax=x0+(endX-x0)*st.acX, ay=y0+(endY-y0)*st.acX;
      var ang=Math.atan2(endY-y0,endX-x0);
      drawGlider(c,ax,ay,13,ang);
      // wind arrow
      var wy=gtop+12;
      if(st.wind!==0){ var dir=st.wind<0?-1:1; Plot.arrow(c, gx+gw*0.5-18*dir, wy, gx+gw*0.5+18*dir, wy, {color:Plot.colors.ink3,w:2,head:6});
        Plot.text(c,(st.wind<0?'Gegenwind ':'Rückenwind ')+Math.abs(st.wind)+' kt', gx+gw*0.5, wy-6,{color:Plot.colors.ink3,font:'600 10px -apple-system',align:'center'}); }
      // reach label
      Plot.text(c, M.reach>=st.fieldKm?'✓ Feld erreichbar':'✗ Feld nicht erreichbar', gx+gw-6, gtop+14,
        {color:M.reach>=st.fieldKm?Plot.colors.green:Plot.colors.red,font:'700 11.5px -apple-system',align:'right'});
    }

    upd();
    side.appendChild(UI.tcard({tag:'Polare', icon:'1', title:'Zwei wichtige Punkte',
      html:'<p><b>Tangente vom Ursprung</b> → beste Gleitgeschwindigkeit: grösste Strecke pro Höhenverlust (maximale Reichweite).</p>'+
           '<p><b>Höchster Punkt der Polare</b> → geringstes Sinken: maximale Flugzeit in der Luft (langsamer als bestes Gleiten).</p>'}));
    side.appendChild(UI.tcard({tag:'Wind', icon:'2', title:'Wind verschiebt das Optimum',
      html:'<p>Bei <b>Gegenwind</b> fliegt man die beste Gleitstrecke etwas <b>schneller</b> (Tangente vom verschobenen Ursprung). Bei <b>Rückenwind</b> etwas langsamer.</p>'+
           '<p>Über Grund verbessert Rückenwind die Gleitzahl, Gegenwind verschlechtert sie.</p>'}));
    side.appendChild(UI.callout('Nach Triebwerksausfall sofort die <b>beste Gleitgeschwindigkeit</b> einstellen und halten — sie ist gewichtsabhängig und im Handbuch angegeben. Zu langsam (näher am Überziehen) bringt nicht mehr Reichweite, nur mehr Sinken.'));
    return {destroy:function(){rc.destroy();}};
  },

  theory:function(){return ''+
   '<h2>Die Geschwindigkeitspolare</h2>'+
   '<p>Während die Gesamtpolare c_A über c_W aufträgt, zeigt die <b>Geschwindigkeitspolare</b> die Sinkrate (Höhenverlust pro Zeit) über der Fluggeschwindigkeit. Sie beschreibt den antriebslosen, stationären Gleitflug.</p>'+
   '<h3>Bestes Gleiten (grösste Reichweite)</h3>'+
   '<p>Die <b>Tangente vom Ursprung</b> an die Polare berührt sie im Punkt der besten Gleitzahl. Diese Geschwindigkeit bringt die grösste Strecke pro Meter Höhenverlust — entscheidend nach einem Triebwerksausfall, um ein Feld zu erreichen.</p>'+
   '<h3>Geringstes Sinken (längste Flugzeit)</h3>'+
   '<p>Der <b>höchste Punkt</b> der Polare (kleinste Sinkrate) liegt bei einer etwas geringeren Geschwindigkeit. Hier bleibt das Flugzeug am längsten in der Luft — nützlich, um Zeit zu gewinnen, aber nicht für maximale Reichweite.</p>'+
   '<h2>Der Einfluss des Windes</h2>'+
   '<p>Die Polare gilt gegenüber der Luft. Über Grund verändert Wind das Ergebnis: Bei <b>Gegenwind</b> verschiebt sich der „Ursprung" der Tangente, sodass die optimale Gleitgeschwindigkeit <b>höher</b> liegt — man fliegt schneller, um weniger Zeit im Gegenwind zu verlieren. Bei <b>Rückenwind</b> ist die optimale Geschwindigkeit etwas geringer.</p>'+
   '<h3>Gewicht</h3>'+
   '<p>Die <b>Gleitzahl</b> selbst ändert sich mit dem Gewicht nicht — sie hängt nur von c_A/c_W ab. Ein schwereres Flugzeug fliegt dieselbe Gleitzahl aber bei <b>höherer Geschwindigkeit</b> (und höherer Sinkrate). Deshalb sind die besten Gleitgeschwindigkeiten gewichtsabhängig.</p>';
  },

  quiz:[
    {q:'Welcher Punkt der Geschwindigkeitspolare ergibt die grösste Reichweite (bestes Gleiten)?',
     choices:['Der höchste Punkt der Polare','Die Tangente vom Ursprung','Der rechte Endpunkt','Die Überziehgeschwindigkeit'],
     answer:1, explain:'Die <b>Tangente vom Ursprung</b> berührt die Polare im Punkt der besten Gleitzahl = grösste Strecke pro Höhenverlust.'},
    {q:'Welche Geschwindigkeit ergibt das geringste Sinken (längste Flugzeit)?',
     choices:['Die der besten Gleitzahl','Eine etwas geringere als die beste Gleitgeschwindigkeit','Die Höchstgeschwindigkeit','Die Manövergeschwindigkeit'],
     answer:1, explain:'Das geringste Sinken (höchster Punkt der Polare) liegt bei einer <b>etwas geringeren</b> Geschwindigkeit als das beste Gleiten.'},
    {q:'Wie sollte man bei kräftigem Gegenwind für maximale Gleitstrecke über Grund fliegen?',
     choices:['Langsamer als die normale beste Gleitgeschwindigkeit','Schneller als die normale beste Gleitgeschwindigkeit','Genau gleich','Mit minimaler Geschwindigkeit'],
     answer:1, explain:'Bei Gegenwind verschiebt sich das Optimum zu einer <b>höheren</b> Geschwindigkeit, um weniger Zeit im Gegenwind zu verlieren.'},
    {q:'Wie wirkt sich ein höheres Fluggewicht auf die beste Gleitzahl aus?',
     choices:['Die Gleitzahl wird schlechter','Die Gleitzahl bleibt gleich, aber bei höherer Geschwindigkeit','Die Gleitzahl wird besser','Das Gleiten ist nicht mehr möglich'],
     answer:1, explain:'Die <b>Gleitzahl bleibt gleich</b> (nur c_A/c_W zählt). Schwerer = dieselbe Gleitzahl bei höherer Geschwindigkeit und höherer Sinkrate.'},
    {q:'Was ist nach einem Triebwerksausfall die wichtigste sofortige Massnahme bezüglich Geschwindigkeit?',
     choices:['So langsam wie möglich fliegen','Die beste Gleitgeschwindigkeit einstellen und halten','Höchstgeschwindigkeit anstreben','Die Geschwindigkeit ignorieren'],
     answer:1, explain:'Sofort die <b>beste Gleitgeschwindigkeit</b> herstellen und sauber halten — sie maximiert die erreichbare Strecke zum Notlandefeld.'}
  ]
});
function drawGlider(c,x,y,s,ang){ c.save();c.translate(x,y);c.rotate(ang);c.fillStyle='#33405a';
  c.beginPath();c.ellipse(0,0,s,s*0.3,0,0,7);c.fill();
  c.fillRect(-s*0.2,-s*0.7,s*0.12,s*0.7);
  c.beginPath();c.moveTo(-s,-s*0.1);c.lineTo(-s*1.2,-s*0.55);c.lineTo(-s*0.85,-s*0.1);c.closePath();c.fill();
  c.restore(); }
})();
