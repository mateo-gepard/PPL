/* Unit 03 — Der Fahrtmesser (Pitot-Statik, IAS/CAS/TAS) */
(function(){
App.registerUnit({
  id:'airspeed', group:'Grundlagen', n:3, ch:'Kap. 2', icon:'gauge',
  title:'Der Fahrtmesser',
  subtitle:'Wie das Pitot-Statik-System den Staudruck misst — und warum IAS und TAS auseinanderlaufen.',
  intro:'Der Fahrtmesser misst die Differenz aus Gesamtdruck (Staurohr) und statischem Druck — also den Staudruck. Er ist auf Meereshöhe geeicht. Stelle wahre Geschwindigkeit und Höhe ein und beobachte, was der Zeiger wirklich anzeigt.',

  sim:function(ctx){
    var stage=ctx.stage, side=ctx.side;
    var st={ tas:110, altFt:0 };
    var SMIN=40, SMAX=180, START=150, SWEEP=240; // gauge geometry (deg)
    // V-speeds for a typical light single (kt, IAS)
    var V={ vs0:45, vs1:52, vfe:88, vno:128, vne:155 };

    var rc=UI.responsiveCanvas(stage,{height:380, animate:true, draw:draw, state:st});

    var ro=UI.readouts([
      {id:'tas',k:'Wahre Geschw. (TAS)',unit:'kt'},
      {id:'ias',k:'Angezeigt (IAS)',unit:'kt'},
      {id:'pt',k:'Gesamtdruck',unit:'Pa'},
      {id:'ps',k:'statischer Druck',unit:'Pa'},
      {id:'q',k:'Staudruck (q)',unit:'Pa'},
      {id:'diff',k:'TAS − IAS',unit:'kt'}
    ]);
    stage.appendChild(ro.el);

    var cp=UI.controlPanel('Steuerung');
    cp.appendChild(UI.slider({label:'Wahre Geschwindigkeit (TAS)',min:40,max:180,step:1,value:110,unit:'kt',
      onInput:function(v){st.tas=v;update();}}).el);
    cp.appendChild(UI.slider({label:'Flughöhe',min:0,max:14000,step:250,value:0,unit:'ft',
      fmt:function(v){return v.toLocaleString('de-CH');}, onInput:function(v){st.altFt=v;update();}}).el);
    stage.appendChild(cp);

    var anim={needle:SMIN};
    function update(){
      var A=Phys.isa(Phys.ft2m(st.altFt));
      var tas_ms=Phys.kt2ms(st.tas);
      var q=Phys.q(A.rho,tas_ms);
      var ias_ms=Math.sqrt(2*q/Phys.rho0);
      var ias=Phys.ms2kt(ias_ms);
      var ps=A.p;
      ro.set('tas',st.tas.toFixed(0));
      ro.set('ias',ias.toFixed(0),'good');
      ro.set('pt',(ps+q).toFixed(0));
      ro.set('ps',ps.toFixed(0));
      ro.set('q',q.toFixed(0));
      ro.set('diff','+'+(st.tas-ias).toFixed(0), (st.tas-ias)>0?'':'');
      st._ias=ias;
    }

    function ang(spd){ return Phys.rad(START + (Math.min(SMAX,Math.max(SMIN,spd))-SMIN)/(SMAX-SMIN)*SWEEP); }
    function draw(c,W,H,t){
      // ---- gauge on the left ----
      var R=Math.min(H*0.42, W*0.22), cx=Math.min(W*0.28, R+40), cy=H*0.46;
      // arcs
      function arc(a,b,col,wid){ c.beginPath(); c.arc(cx,cy,R-12,ang(a),ang(b)); c.lineWidth=wid; c.strokeStyle=col; c.lineCap='butt'; c.stroke(); }
      c.save();
      // face
      c.beginPath(); c.arc(cx,cy,R,0,7); c.fillStyle='#fff'; c.fill();
      c.lineWidth=6; c.strokeStyle='#e7eaf0'; c.stroke();
      arc(V.vs0,V.vfe,'#cfd6e2',9);                 // white arc (flap range)
      arc(V.vs1,V.vno,'#1f9d6b',9);                 // green arc
      arc(V.vno,V.vne,'#e8b21e',9);                 // yellow arc
      // red line Vne
      c.beginPath(); c.moveTo(cx+(R-19)*Math.cos(ang(V.vne)),cy+(R-19)*Math.sin(ang(V.vne)));
      c.lineTo(cx+(R-5)*Math.cos(ang(V.vne)),cy+(R-5)*Math.sin(ang(V.vne)));
      c.lineWidth=3; c.strokeStyle=Plot.colors.red; c.stroke();
      // ticks + numbers
      c.fillStyle=Plot.colors.ink; c.textAlign='center'; c.textBaseline='middle';
      for(var s=SMIN;s<=SMAX;s+=10){
        var a=ang(s), big=(s%20===0);
        var r1=R-4, r2=R-(big?15:10);
        c.beginPath(); c.moveTo(cx+r1*Math.cos(a),cy+r1*Math.sin(a)); c.lineTo(cx+r2*Math.cos(a),cy+r2*Math.sin(a));
        c.lineWidth=big?2:1; c.strokeStyle=Plot.colors.ink2; c.stroke();
        if(big){ c.font='600 '+Math.round(R*0.10)+'px -apple-system'; c.fillStyle=Plot.colors.ink;
          c.fillText(s, cx+(R-26)*Math.cos(a), cy+(R-26)*Math.sin(a)); }
      }
      c.font='600 10px -apple-system'; c.fillStyle=Plot.colors.ink3;
      c.fillText('KNOTS', cx, cy+R*0.42); c.fillText('IAS', cx, cy-R*0.42);
      // needle (smooth toward IAS)
      var target=st._ias||SMIN; anim.needle += (target-anim.needle)*0.18;
      var na=ang(anim.needle);
      c.beginPath(); c.moveTo(cx-(R*0.12)*Math.cos(na),cy-(R*0.12)*Math.sin(na));
      c.lineTo(cx+(R-20)*Math.cos(na),cy+(R-20)*Math.sin(na));
      c.lineWidth=3; c.strokeStyle=Plot.colors.ink; c.lineCap='round'; c.stroke();
      c.beginPath(); c.arc(cx,cy,5,0,7); c.fillStyle=Plot.colors.ink; c.fill();
      c.restore();

      // ---- pitot-static schematic on the right ----
      var px=cx+R+50; if(px>W-150){ return; }
      var pw=W-px-24, pcy=H*0.32;
      var A=Phys.isa(Phys.ft2m(st.altFt)); var q=Phys.q(A.rho,Phys.kt2ms(st.tas));
      // pitot tube
      c.fillStyle='#5a6678';
      c.fillRect(px, pcy-6, pw*0.55, 12);
      c.beginPath(); c.moveTo(px,pcy-6); c.lineTo(px-12,pcy); c.lineTo(px,pcy+6); c.closePath(); c.fill();
      Plot.text(c,'Staurohr (Pitot) → Gesamtdruck = p + q', px-12, pcy-14,{color:Plot.colors.ink2,font:'600 11px -apple-system'});
      // static port
      var scy=pcy+58;
      c.fillStyle='#9fb2cc'; c.fillRect(px+pw*0.18, scy-5,pw*0.37,10);
      c.beginPath(); c.arc(px+pw*0.18, scy, 7,0,7); c.fillStyle='#9fb2cc'; c.fill();
      Plot.text(c,'statischer Anschluss → p', px+pw*0.18-2, scy+22,{color:Plot.colors.ink2,font:'600 11px -apple-system'});
      // airflow arrows toward pitot
      for(var i=0;i<3;i++){ var ay=pcy-18+i*18; var off=(t*120 + i*40)%70;
        Plot.arrow(c, px-70+off, ay, px-70+off+22, ay, {color:'#c2cede',w:2,head:5}); }
      // dynamic pressure bar
      var by=H*0.74, bw=pw, bx=px;
      Plot.text(c,'Staudruck q = Gesamtdruck − statischer Druck', bx, by-12,{color:Plot.colors.ink,font:'700 12px -apple-system'});
      c.fillStyle='#eef1f6'; roundR(c,bx,by,bw,16,6); c.fill();
      var frac=Math.min(1, q/Phys.q(Phys.rho0,Phys.kt2ms(SMAX)));
      c.fillStyle=Plot.colors.accent; roundR(c,bx,by,bw*frac,16,6); c.fill();
      Plot.text(c, q.toFixed(0)+' Pa', bx+8, by+12,{color:'#fff',font:'700 11px -apple-system'});
      // the indicator equation
      Plot.text(c,'Zeiger zeigt IAS = √(2q/ρ₀)  → auf Meereshöhe geeicht', bx, by+44,{color:Plot.colors.ink3,font:'11px -apple-system'});
    }

    update();

    side.appendChild(UI.tcard({tag:'Funktion', icon:'1', title:'So misst der Fahrtmesser',
      html:'<p>Das <b>Staurohr</b> liefert den Gesamtdruck (statisch + Staudruck). Der <b>statische Anschluss</b> liefert nur den statischen Druck. Die Dose im Instrument misst die Differenz = <b>Staudruck</b>.</p>'+
           '<div class="formula">q = p<sub>ges</sub> − p<sub>stat</sub> = ½ρv²</div>'}));
    side.appendChild(UI.tcard({tag:'Wichtig', icon:'2', title:'IAS vs. TAS',
      html:'<p>Der Zeiger ist auf <b>ρ₀ (Meereshöhe)</b> geeicht. In der Höhe ist die Luft dünner — der gleiche Staudruck entsteht erst bei höherer wahrer Geschwindigkeit.</p>'+
           '<div class="formula">TAS = IAS / √σ</div>'+
           '<p>Der Fehler wächst mit der Höhe (≈ +2% pro 1000 ft).</p>'}));
    side.appendChild(UI.tcard({title:'Die farbigen Bögen',
      html:'<p class="kfacts"></p><ul class="kfacts">'+
        '<li><b>Weisser Bogen:</b> Klappenbereich (V<sub>S0</sub>–V<sub>FE</sub>)</li>'+
        '<li><b>Grüner Bogen:</b> normaler Betrieb (V<sub>S1</sub>–V<sub>NO</sub>)</li>'+
        '<li><b>Gelber Bogen:</b> Vorsicht, nur ruhige Luft</li>'+
        '<li><b>Rote Linie:</b> V<sub>NE</sub> — nie überschreiten</li></ul>'}));

    return { destroy:function(){ rc.destroy(); } };
  },

  theory:function(){ return ''+
   '<h2>Das Pitot-Statik-System</h2>'+
   '<p>Der Fahrtmesser ist ein Differenzdruckmesser. Er vergleicht zwei Drücke:</p>'+
   '<p>• Das <b>Staurohr (Pitot)</b> zeigt nach vorn in die Strömung. Hier wird die Luft abgebremst — es entsteht der <b>Gesamtdruck</b> = statischer Druck + Staudruck.<br>'+
   '• Der <b>statische Anschluss</b> liegt seitlich und misst nur den ungestörten <b>statischen Druck</b>.</p>'+
   '<div class="formula">Anzeige ∝ p<sub>ges</sub> − p<sub>stat</sub> = ½ρv² = Staudruck</div>'+
   '<p>Da der Staudruck genau die Grösse ist, die auch Auftrieb erzeugt, ist die angezeigte Geschwindigkeit (IAS) für den Piloten besonders nützlich: Grenzwerte wie Überziehgeschwindigkeit oder Klappengeschwindigkeit hängen vom Staudruck ab und gelten daher als IAS — unabhängig von der Höhe.</p>'+
   '<h2>IAS, CAS und TAS</h2>'+
   '<p><b>IAS</b> (Indicated Air Speed) ist der abgelesene Wert. Nach Korrektur von Einbau- und Instrumentenfehlern erhält man die <b>CAS</b> (Calibrated). Da das Instrument auf Meereshöhe (ρ₀) geeicht ist, weicht die <b>TAS</b> (True Air Speed) — die tatsächliche Geschwindigkeit gegenüber der Luft — in der Höhe ab:</p>'+
   '<div class="formula">TAS = CAS / √σ&nbsp;&nbsp;&nbsp;(σ = ρ/ρ₀)</div>'+
   '<p>In grosser Höhe ist die TAS deutlich höher als die IAS. Faustregel: rund <b>2% mehr TAS pro 1000 ft</b>. Für Aerodynamik und Steuerung zählt die IAS, für Navigation und Flugplanung die TAS.</p>'+
   '<h2>Die Markierungen am Instrument</h2>'+
   '<p>Farbige Bögen geben die Betriebsgrenzen wieder: weisser Bogen = zulässiger Klappenbereich, grüner Bogen = normaler Betrieb, gelber Bogen = nur in ruhiger Luft, rote Linie = V<sub>NE</sub> (never exceed).</p>';
  },

  quiz:[
    {q:'Welche Grösse misst der Fahrtmesser physikalisch?',
     choices:['Den statischen Druck','Die Differenz Gesamtdruck − statischer Druck (Staudruck)','Die Lufttemperatur','Die Höhe'],
     answer:1, explain:'Pitot liefert Gesamtdruck, der statische Anschluss den statischen Druck. Die Differenz ist der <b>Staudruck ½ρv²</b>.'},
    {q:'Ein Flugzeug steigt mit konstanter IAS. Wie verhält sich die TAS?',
     choices:['Sie sinkt','Sie bleibt gleich','Sie steigt','Sie wird negativ'],
     answer:2, explain:'In der Höhe ist ρ kleiner. Für gleichen Staudruck (gleiche IAS) wird die wahre Geschwindigkeit grösser: <b>TAS = IAS/√σ</b>.'},
    {q:'Warum sind Grenzgeschwindigkeiten (z. B. Überziehgeschwindigkeit) als IAS angegeben?',
     choices:['Weil IAS einfacher abzulesen ist','Weil aerodynamische Effekte vom Staudruck abhängen, den die IAS direkt anzeigt','Weil die TAS unbekannt ist','Aus historischen Gründen'],
     answer:1, explain:'Überziehen, Auftrieb und Lasten hängen vom <b>Staudruck</b> ab. Da die IAS genau diesen abbildet, gilt sie höhenunabhängig.'},
    {q:'Was bedeutet die rote Linie auf dem Fahrtmesser?',
     choices:['Überziehgeschwindigkeit V_S','Höchstgeschwindigkeit für Klappen V_FE','Nie zu überschreitende Geschwindigkeit V_NE','Reisegeschwindigkeit'],
     answer:2, explain:'Die rote Linie markiert <b>V<sub>NE</sub></b> (never exceed). Darüber drohen strukturelle Schäden.'},
    {q:'Der statische Anschluss verstopft (vereist) im Steigflug. Die Höhe steigt weiter. Was zeigt der Fahrtmesser tendenziell an?',
     choices:['Zu wenig (unterschätzt)','Zu viel (überschätzt)','Bleibt korrekt','Springt auf null'],
     answer:0, explain:'Bleibt der statische Druck eingeschlossen (zu hoch), wird die Druckdifferenz im Steigflug zu klein — der Fahrtmesser <b>zeigt zu wenig</b> an. (Gegenteil im Sinkflug.)'}
  ]
});
function roundR(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
})();
