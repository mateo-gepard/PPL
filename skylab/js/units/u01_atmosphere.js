/* Unit 01 — Atmosphäre & Staudruck (ISA model) */
(function(){
App.registerUnit({
  id:'atmosphere', group:'Grundlagen', n:1, ch:'Kap. 2', icon:'atmos',
  title:'Atmosphäre & Staudruck',
  subtitle:'Wie Dichte, Druck und Temperatur mit der Höhe abnehmen — und warum der Staudruck zählt.',
  intro:'Die Standardatmosphäre (ISA) ist die Grundlage aller Aerodynamik. Erlebe, wie die Luftdichte ρ mit der Höhe sinkt und wie daraus der Staudruck q = ½ρv² entsteht — die Grösse, die Auftrieb erzeugt und die der Fahrtmesser misst.',

  sim:function(ctx){
    var stage=ctx.stage, side=ctx.side;
    var st={altFt:0, ias:100}; // ias in knots
    var dots=[]; for(var i=0;i<240;i++){ dots.push({fx:Math.random(), fy:Math.random(), s:0.7+Math.random()*1.6}); }

    var rc=UI.responsiveCanvas(stage,{height:380, draw:draw, state:st});

    // readouts
    var ro=UI.readouts([
      {id:'alt',k:'Höhe',unit:'ft'},{id:'oat',k:'Temp.',unit:'°C'},
      {id:'rho',k:'Dichte ρ',unit:'kg/m³'},{id:'sig',k:'σ = ρ/ρ₀',unit:''},
      {id:'ias',k:'IAS',unit:'kt'},{id:'tas',k:'TAS',unit:'kt'},
      {id:'q',k:'Staudruck q',unit:'Pa'}
    ]);
    stage.appendChild(ro.el);

    var cp=UI.controlPanel('Steuerung');
    var sAlt=UI.slider({label:'Flughöhe',min:0,max:36000,step:500,value:0,unit:'ft',
      fmt:function(v){return v.toLocaleString('de-CH');},
      onInput:function(v){ st.altFt=v; update(); }});
    var sIas=UI.slider({label:'Angezeigte Geschwindigkeit (IAS)',min:40,max:160,step:1,value:100,unit:'kt',
      onInput:function(v){ st.ias=v; update(); }});
    cp.appendChild(sAlt.el); cp.appendChild(sIas.el);
    stage.appendChild(cp);

    function update(){
      var alt_m=Phys.ft2m(st.altFt);
      var A=Phys.isa(alt_m);
      var ias_ms=Phys.kt2ms(st.ias);
      var tas_ms=Phys.tasFromIas(ias_ms,A.rho);
      var q=Phys.q(A.rho, tas_ms);
      ro.set('alt', st.altFt.toLocaleString('de-CH'));
      ro.set('oat', A.Tc.toFixed(1), A.Tc<0?'alert':'');
      ro.set('rho', A.rho.toFixed(3));
      ro.set('sig', A.sigma.toFixed(3));
      ro.set('ias', st.ias.toFixed(0));
      ro.set('tas', Phys.ms2kt(tas_ms).toFixed(0),'good');
      ro.set('q', q.toFixed(0));
      rc.redraw();
    }

    function draw(c,W,H){
      // layout: left column (atmosphere), right chart
      var colX=24, colW=Math.min(150, W*0.26), colTop=24, colBot=H-26;
      var alt_m=Phys.ft2m(st.altFt);
      // sky gradient
      var g=c.createLinearGradient(0,colTop,0,colBot);
      g.addColorStop(0,'#cfe0f7'); g.addColorStop(1,'#eef5ff');
      c.fillStyle=g; roundRect(c,colX,colTop,colW,colBot-colTop,10); c.fill();
      c.save(); roundRect(c,colX,colTop,colW,colBot-colTop,10); c.clip();
      // density dots
      dots.forEach(function(d){
        var alt=d.fy*11000; var sg=Phys.isa(alt).sigma;
        var y=colBot-(d.fy)*(colBot-colTop);
        var x=colX+8+d.fx*(colW-16);
        c.beginPath(); c.arc(x,y,d.s,0,7);
        c.fillStyle='rgba(31,95,208,'+(0.10+sg*0.55).toFixed(2)+')'; c.fill();
      });
      c.restore();
      // altitude ticks
      c.fillStyle=Plot.colors.ink3; c.font='10px -apple-system,sans-serif'; c.textAlign='right';
      [0,10000,20000,30000].forEach(function(ft){
        var y=colBot-(Phys.ft2m(ft)/11000)*(colBot-colTop);
        c.fillText((ft/1000)+'k', colX-3, y+3);
      });
      // aircraft at current altitude
      var ay=colBot-(alt_m/11000)*(colBot-colTop);
      var ax=colX+colW/2;
      drawPlane(c,ax,ay,18);
      c.fillStyle=Plot.colors.accent; c.font='600 11px -apple-system,sans-serif'; c.textAlign='center';
      c.fillText(st.altFt.toLocaleString('de-CH')+' ft', ax, ay-16);

      // ---- right chart: σ and p/p0 vs altitude ----
      var cx0=colX+colW+58, cy0=colTop+6, cw=W-cx0-26, chh=colBot-colTop-30;
      if(cw<140){ return; }
      var ch=new Plot.Chart(c,{x:cx0,y:cy0,w:cw,h:chh,xmin:0,xmax:1,ymin:0,ymax:36000});
      ch.axes({xlabel:'Anteil vom Bodenwert', ylabel:'Höhe (ft)',
        xticks:[0,0.25,0.5,0.75,1], yticks:[0,9000,18000,27000,36000],
        yfmt:function(v){return (v/1000)+'k';}, xfmt:function(v){return (v*100)+'%';}});
      // altitude is the independent variable (Y) -> build polylines
      var sigPts=[], prePts=[];
      for(var ft=0; ft<=36000; ft+=1500){ var Aa=Phys.isa(Phys.ft2m(ft));
        sigPts.push({x:Aa.sigma, y:ft}); prePts.push({x:Aa.p/Phys.p0, y:ft}); }
      ch.poly(prePts,{color:Plot.colors.orange,w:2,dash:[5,4]});
      ch.poly(sigPts,{color:Plot.colors.accent,w:2.4});
      // marker
      var A=Phys.isa(alt_m);
      ch.dot(A.sigma, st.altFt, {color:Plot.colors.accent,ring:true,r:5});
      // labels
      Plot.text(c,'Dichte σ', ch.px(0.04), ch.py(34000),{color:Plot.colors.accent,font:'600 11px -apple-system,sans-serif'});
      Plot.text(c,'Druck p/p₀', ch.px(0.30), ch.py(34000),{color:Plot.colors.orange,font:'600 11px -apple-system,sans-serif'});
    }

    update();

    side.appendChild(UI.tcard({tag:'Kernidee', icon:'1', title:'Staudruck q = ½·ρ·v²',
      html:'<p>Der <b>Staudruck</b> (dynamischer Druck) ist die Energie der bewegten Luft. Er wächst <b>linear mit der Dichte</b> und <b>quadratisch mit der Geschwindigkeit</b>.</p>'+
           '<div class="formula"><span class="var">q</span> = ½ · <span class="var">ρ</span> · <span class="var">v</span>²</div>'+
           '<p>Doppelte Geschwindigkeit → <b>vierfacher</b> Staudruck.</p>'}));
    side.appendChild(UI.tcard({icon:'2', title:'IAS bleibt, TAS steigt',
      html:'<p>Der Fahrtmesser misst den Staudruck. In grosser Höhe ist ρ klein — die Luft ist „dünner". Für denselben Staudruck (gleiche IAS) muss das Flugzeug <b>schneller durch die Luft</b> fliegen.</p>'+
           '<div class="formula">TAS = IAS / <span class="var">√σ</span></div>'+
           '<p>Faustregel: rund <b>+2% TAS pro 1000 ft</b>.</p>'}));
    side.appendChild(UI.callout('In der ISA-Standardatmosphäre gilt am Boden: <b>15 °C</b>, <b>1013,25 hPa</b>, <b>ρ₀ = 1,225 kg/m³</b>. Temperaturgradient: <b>−2 °C / 1000 ft</b> (−6,5 °C/km).'));

    return { destroy:function(){ rc.destroy(); } };
  },

  theory:function(){ return ''+
   '<h2>Die internationale Standardatmosphäre (ISA)</h2>'+
   '<p>Damit Leistungen vergleichbar sind, rechnet man mit einer genormten Atmosphäre. Am Meeresspiegel (MSL) gelten die <b>ISA-Bezugswerte</b>:</p>'+
   '<div class="formula">T₀ = 15 °C&nbsp;&nbsp;·&nbsp;&nbsp;p₀ = 1013,25 hPa&nbsp;&nbsp;·&nbsp;&nbsp;ρ₀ = 1,225 kg/m³</div>'+
   '<p>In der Troposphäre nimmt die Temperatur um <b>0,65 °C pro 100 m</b> (≈ 2 °C / 1000 ft) ab. Mit der Temperatur sinken auch Druck und Dichte — die Dichte allerdings schneller, weil sie zusätzlich von der Temperatur abhängt (ideales Gasgesetz p = ρ·R·T).</p>'+
   '<h3>Warum die Dichte alles bestimmt</h3>'+
   '<p>Die Luftdichte ρ ist die Schlüsselgrösse der Aerodynamik. Sie steckt im Staudruck und damit in jeder Auftriebs- und Widerstandskraft. Sinkt ρ, so sinkt bei gleicher Geschwindigkeit der Staudruck — Auftrieb und Triebwerksleistung nehmen ab.</p>'+
   '<h2>Der Staudruck</h2>'+
   '<p>Bewegt sich Luft mit der Geschwindigkeit v, trägt sie kinetische Energie. Der daraus entstehende <b>Staudruck</b> ist:</p>'+
   '<div class="formula">q = ½ · ρ · v²</div>'+
   '<p>Weil v im Quadrat steht, hat die Geschwindigkeit enormen Einfluss: doppelte Geschwindigkeit bedeutet <b>vierfachen</b> Staudruck, dreifache Geschwindigkeit <b>neunfachen</b>. Der Staudruck ist die treibende Grösse hinter Auftrieb (A = c<sub>A</sub>·F·q) und Widerstand.</p>'+
   '<h3>IAS, CAS und TAS</h3>'+
   '<p>Der Fahrtmesser misst nicht direkt die Geschwindigkeit, sondern den Staudruck. Deshalb zeigt er die <b>angezeigte Geschwindigkeit (IAS)</b> an, die dem Staudruck entspricht. Die <b>wahre Geschwindigkeit (TAS)</b> gegenüber der Luft ist in der Höhe grösser, weil ρ kleiner ist:</p>'+
   '<div class="formula">TAS = IAS / √σ&nbsp;&nbsp;&nbsp;mit&nbsp;&nbsp;σ = ρ / ρ₀</div>'+
   '<p>Für das Fliegen ist das entscheidend: Strömungsabriss, Auftrieb und Steuerbarkeit hängen vom <b>Staudruck = IAS</b> ab, nicht von der TAS. Deshalb fliegt und plant der Pilot nach IAS, navigiert aber mit TAS.</p>';
  },

  quiz:[
    {q:'Wie verändert sich die Luftdichte ρ mit zunehmender Höhe (in der Troposphäre)?',
     choices:['Sie nimmt ab','Sie nimmt zu','Sie bleibt konstant','Sie steigt zuerst, dann fällt sie'],
     answer:0, explain:'Mit der Höhe sinken Druck <b>und</b> Temperatur; netto nimmt die Dichte ab. Geringere Dichte bedeutet weniger Staudruck bei gleicher TAS.'},
    {q:'Der Staudruck ist q = ½·ρ·v². Verdoppelt man die Geschwindigkeit, so wird der Staudruck …',
     choices:['doppelt so gross','viermal so gross','dreimal so gross','gleich gross'],
     answer:1, explain:'v steht im Quadrat: 2² = 4. Doppelte Geschwindigkeit → <b>vierfacher</b> Staudruck. Daher reagiert Auftrieb sehr stark auf die Geschwindigkeit.'},
    {q:'Ein Flugzeug fliegt in grosser Höhe mit konstanter IAS. Wie verhält sich die wahre Geschwindigkeit (TAS)?',
     choices:['TAS ist kleiner als IAS','TAS ist gleich IAS','TAS ist grösser als IAS','TAS hängt nur von der Temperatur ab'],
     answer:2, explain:'In der Höhe ist ρ kleiner. Für denselben Staudruck (gleiche IAS) muss das Flugzeug schneller durch die Luft fliegen: <b>TAS = IAS/√σ > IAS</b>.'},
    {q:'Welche Werte gelten in der ISA-Standardatmosphäre am Meeresspiegel?',
     choices:['15 °C, 1013,25 hPa, 1,225 kg/m³','0 °C, 1000 hPa, 1,0 kg/m³','25 °C, 1013 hPa, 1,5 kg/m³','15 °C, 950 hPa, 1,225 kg/m³'],
     answer:0, explain:'ISA-MSL: <b>15 °C, 1013,25 hPa, ρ₀ = 1,225 kg/m³</b>. Diese Werte sind Bezugspunkt für alle Leistungsberechnungen.'},
    {q:'Wonach richtet sich der Pilot bei Strömungsabriss, Auftrieb und Steuerbarkeit?',
     choices:['Nach der TAS','Nach der Grundgeschwindigkeit (GS)','Nach der IAS (dem Staudruck)','Nach der Höhe'],
     answer:2, explain:'Aerodynamische Effekte hängen vom <b>Staudruck</b> ab, den der Fahrtmesser als IAS anzeigt. Deshalb sind Grenzgeschwindigkeiten stets als IAS angegeben.'}
  ]
});
function roundRect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function drawPlane(c,x,y,s){
  c.save();c.translate(x,y);c.fillStyle='#1a2230';
  c.beginPath();
  c.moveTo(-s,0);c.lineTo(s*0.55,-s*0.16);c.lineTo(s,0);c.lineTo(s*0.55,s*0.16);c.closePath();c.fill();
  c.beginPath();c.moveTo(-s*0.2,0);c.lineTo(-s*0.55,-s*0.5);c.lineTo(-s*0.35,-s*0.5);c.lineTo(0,0);c.closePath();c.fill();
  c.beginPath();c.moveTo(-s*0.2,0);c.lineTo(-s*0.55,s*0.5);c.lineTo(-s*0.35,s*0.5);c.lineTo(0,0);c.closePath();c.fill();
  c.restore();
}
})();
