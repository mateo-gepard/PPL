/* Unit 02 — Kontinuität & Bernoulli (Venturi) */
(function(){
App.registerUnit({
  id:'bernoulli', group:'Grundlagen', n:2, ch:'Kap. 2', icon:'flow',
  title:'Kontinuität & Bernoulli',
  subtitle:'Enger Querschnitt → schnellere Strömung → niedrigerer Druck. Das Prinzip hinter dem Auftrieb.',
  intro:'Strömt Luft durch eine Verengung, muss sie beschleunigen (Kontinuität). Nach Bernoulli sinkt dann ihr statischer Druck. Diese beiden Gesetze erklären, warum ein Tragflügel Auftrieb erzeugt. Spiele mit Geschwindigkeit und Engstelle und beobachte Strömung und Druck.',

  sim:function(ctx){
    var stage=ctx.stage, side=ctx.side;
    var rho=1.225;
    var st={ v1:18, throat:0.5 }; // v1 m/s at inlet, throat = constriction 0..0.75 (fraction reduced)
    var NL=9;                     // number of streamlines
    var parts=[]; for(var li=0; li<NL; li++){ for(var k=0;k<13;k++){ parts.push({lane:li, x:((k/13)+li*0.031)%1}); } }

    var rc=UI.responsiveCanvas(stage,{height:380, animate:true, draw:draw, state:st});

    var ro=UI.readouts([
      {id:'a1',k:'Querschn. Eintritt',unit:''},{id:'v1',k:'v Eintritt',unit:'m/s'},{id:'p1',k:'stat. Druck',unit:'Pa'},
      {id:'a2',k:'Querschn. Engstelle',unit:''},{id:'v2',k:'v Engstelle',unit:'m/s'},{id:'p2',k:'stat. Druck',unit:'Pa'}
    ]);
    stage.appendChild(ro.el);
    stage.appendChild(UI.legend([
      {c:Plot.colors.accent,t:'langsam / hoher Druck',dot:true},
      {c:Plot.colors.red,t:'schnell / niedriger Druck',dot:true},
      {c:Plot.colors.ink2,t:'Manometer = statischer Druck'}
    ]));

    var cp=UI.controlPanel('Steuerung');
    cp.appendChild(UI.slider({label:'Anströmgeschwindigkeit v₁',min:6,max:40,step:1,value:18,unit:'m/s',
      onInput:function(v){st.v1=v;update();}}).el);
    cp.appendChild(UI.slider({label:'Verengung der Engstelle',min:0,max:72,step:2,value:50,unit:'%',
      onInput:function(v){st.throat=v/100;update();}}).el);
    stage.appendChild(cp);

    function widthAt(fx, H){ // fx 0..1 along tube; returns half-info {top,bot}
      var hMax=H*0.26;
      var hump=Math.exp(-Math.pow((fx-0.5)/0.17,2));      // bell centered at throat
      var w=hMax*(1 - st.throat*hump);
      var cy=H*0.70;
      return {top:cy-w/2, bot:cy+w/2, w:w, cy:cy};
    }
    function update(){
      var A1=1.0, A2=(1-st.throat);
      var v2=st.v1*A1/A2;
      var q1=Phys.q(rho,st.v1), q2=Phys.q(rho,v2);
      // gauge static pressures (relative): p_total const; choose p1=0 ref +600 baseline
      var p1=300, p2=p1+q1-q2;
      ro.set('a1','1.00'); ro.set('v1',st.v1.toFixed(0)); ro.set('p1',p1.toFixed(0),'good');
      ro.set('a2',A2.toFixed(2)); ro.set('v2',v2.toFixed(0)); ro.set('p2',p2.toFixed(0), p2<0?'alert':'');
    }

    function vNormAt(fx,H){ var wi=widthAt(fx,H); return st.v1*(H*0.26)/wi.w; } // continuity
    function draw(c,W,H,t){
      var dt=Scene.dt(st,t);
      var tubeTop=14;
      var x0=20, x1=W-20, span=x1-x0;
      var A2=(1-st.throat), v2=st.v1/A2;
      var vmax=st.v1/Math.max(0.25,1-st.throat);
      function spdT(v){ return Scene.clamp01((v-st.v1*0.7)/((vmax-st.v1*0.7)||1)); }

      // duct fill — subtle gradient
      c.beginPath();
      for(var i=0;i<=70;i++){ var fx=i/70; var wi=widthAt(fx,H); var X=x0+fx*span; i?c.lineTo(X,wi.top):c.moveTo(X,wi.top); }
      for(var i2=70;i2>=0;i2--){ var fx2=i2/70; var wi2=widthAt(fx2,H); var X2=x0+fx2*span; c.lineTo(X2,wi2.bot); }
      c.closePath();
      var dg=c.createLinearGradient(0,H*0.2,0,H*0.75); dg.addColorStop(0,'#eef4fb'); dg.addColorStop(1,'#e3edf8');
      c.fillStyle=dg; c.fill();

      // streamlines (bunch together at the throat)
      c.lineCap='round';
      for(var li=0; li<NL; li++){
        var fl=(li+0.5)/NL;
        c.beginPath();
        for(var sx=0;sx<=70;sx++){ var fxx=sx/70; var w2=widthAt(fxx,H); var Y=w2.top+fl*w2.w; var XX=x0+fxx*span; sx?c.lineTo(XX,Y):c.moveTo(XX,Y); }
        c.strokeStyle='rgba(150,176,214,0.40)'; c.lineWidth=1; c.stroke();
      }
      // flowing particles along streamlines, coloured by local speed
      parts.forEach(function(p){
        var wi=widthAt(p.x,H);
        var vN=st.v1*(H*0.26)/wi.w;
        p.x += (vN/span)*1.5*dt;
        if(p.x>1) p.x-=1;
        var fl=(p.lane+0.5)/NL;
        var y=wi.top+fl*wi.w;
        var X=x0+p.x*span;
        var col=Plot.cmap(0.15+0.75*spdT(vN));
        c.beginPath(); c.arc(X,y,2.4,0,7); c.fillStyle=col; c.fill();
      });

      // walls
      c.lineWidth=3; c.strokeStyle='#8fa3c0';
      c.beginPath(); for(var k=0;k<=90;k++){ var fk=k/90; var wk=widthAt(fk,H); var Xk=x0+fk*span; k?c.lineTo(Xk,wk.top):c.moveTo(Xk,wk.top); } c.stroke();
      c.beginPath(); for(var k2=0;k2<=90;k2++){ var fk2=k2/90; var wk2=widthAt(fk2,H); var Xk2=x0+fk2*span; k2?c.lineTo(Xk2,wk2.bot):c.moveTo(Xk2,wk2.bot); } c.stroke();

      // manometer standpipes (static pressure) — tall glass tubes on the top wall
      var q1=Phys.q(rho,st.v1);
      var stations=[{fx:0.13,lab:'Eintritt'},{fx:0.5,lab:'Engstelle'},{fx:0.87,lab:'Austritt'}];
      function levelY(pstat,wallY){ var pipeH=wallY-tubeTop; var f=Scene.clamp01((pstat+150)/650); return wallY - f*pipeH; }
      // reference line at the inlet liquid level — makes the throat drop obvious
      var inW=widthAt(0.13,H), inLevel=levelY(300, inW.top);
      c.save(); c.setLineDash([5,4]); c.strokeStyle='rgba(31,95,208,0.35)'; c.lineWidth=1;
      c.beginPath(); c.moveTo(x0, inLevel); c.lineTo(x1, inLevel); c.stroke(); c.restore();
      Plot.text(c,'Bezug',x1-2,inLevel-5,{color:'rgba(31,95,208,0.6)',font:'600 9.5px -apple-system',align:'right'});
      stations.forEach(function(s){
        var wi=widthAt(s.fx,H); var X=x0+s.fx*span;
        var vloc=st.v1*(H*0.26)/wi.w; var qloc=Phys.q(rho,vloc);
        var pstat=300 + q1 - qloc;                       // lower where flow is faster
        var wallY=wi.top, pipeH=wallY-tubeTop;
        var surfY=levelY(pstat,wallY) + Math.sin(t*3+s.fx*9)*1.0;
        var liqCol=pstat<0?Plot.colors.red:Plot.colors.accent;
        // glass tube (light tint so it's clearly a tube)
        c.fillStyle='rgba(225,235,248,0.7)'; c.fillRect(X-8,tubeTop,16,pipeH);
        c.strokeStyle='rgba(120,140,170,0.7)'; c.lineWidth=1.6; c.strokeRect(X-8,tubeTop,16,pipeH);
        // liquid column
        c.fillStyle=liqCol; c.fillRect(X-7, surfY, 14, wallY-surfY+3);
        c.fillStyle='rgba(255,255,255,0.6)'; c.fillRect(X-7, surfY, 14, 2.5);   // surface highlight
        // value + station + local speed
        Plot.text(c, Math.round(pstat)+' Pa', X, surfY-7, {color:liqCol,font:'800 11px -apple-system',align:'center'});
        Plot.text(c, s.lab, X, wi.bot+16, {color:Plot.colors.ink2,font:'700 10.5px -apple-system',align:'center'});
        Plot.text(c, vloc.toFixed(0)+' m/s', X, wi.bot+29, {color:Plot.cmap(0.15+0.75*spdT(vloc)),font:'700 10px -apple-system',align:'center'});
      });

      // labels
      Plot.text(c,'A·v = konstant   (Kontinuität)', x0+4, H-8,{color:Plot.colors.ink3,font:'600 11px -apple-system'});
      Plot.text(c,'p + ½ρv² = konstant   (Bernoulli)', x1-4, H-8,{color:Plot.colors.ink3,font:'600 11px -apple-system',align:'right'});
    }

    update();

    side.appendChild(UI.tcard({tag:'Gesetz 1', icon:'1', title:'Kontinuität',
      html:'<p>Durch jeden Querschnitt strömt pro Zeit dieselbe Luftmenge. Wird der Kanal enger, muss die Luft <b>schneller</b> werden.</p>'+
           '<div class="formula"><span class="var">A₁·v₁</span> = <span class="var">A₂·v₂</span></div>'+
           '<p>Halber Querschnitt → doppelte Geschwindigkeit.</p>'}));
    side.appendChild(UI.tcard({tag:'Gesetz 2', icon:'2', title:'Bernoulli',
      html:'<p>Die Summe aus <b>statischem Druck</b> und <b>Staudruck</b> bleibt entlang einer Stromlinie konstant. Wo die Luft schneller ist, ist der statische Druck <b>kleiner</b>.</p>'+
           '<div class="formula"><span class="var">p</span> + ½ρv² = konstant</div>'}));
    side.appendChild(UI.callout('Genau das passiert am Tragflügel: Oben strömt die Luft schneller → <b>Unterdruck</b> (Sog), unten langsamer → höherer Druck. Die Druckdifferenz erzeugt den Auftrieb.'));
    side.appendChild(UI.tcard({title:'Gültigkeit',
      html:'<p>Bernoulli gilt streng nur bei <b>konstanter Dichte</b> (inkompressibel) und <b>reibungsfreier</b> Strömung. Bei den langsamen Geschwindigkeiten der PPL-Fliegerei ist das eine sehr gute Näherung.</p>'}));

    return { destroy:function(){ rc.destroy(); } };
  },

  theory:function(){ return ''+
   '<h2>Das Kontinuitätsgesetz</h2>'+
   '<p>Stell dir eine Stromröhre vor — ein gedachtes Bündel von Stromlinien. Da keine Luft verloren geht, muss durch jeden Querschnitt pro Sekunde dieselbe Masse strömen. Bei konstanter Dichte folgt:</p>'+
   '<div class="formula">A₁ · v₁ = A₂ · v₂</div>'+
   '<p>Verengt sich der Querschnitt, steigt die Geschwindigkeit im gleichen Verhältnis. Das ist der Grund, warum die Luft über der gewölbten Flügeloberseite beschleunigt.</p>'+
   '<h2>Das Gesetz von Bernoulli</h2>'+
   '<p>Daniel Bernoulli erkannte: In einer Strömung wird die Summe aus statischem Druck und Staudruck (dynamischem Druck) nicht grösser oder kleiner — sie bleibt konstant:</p>'+
   '<div class="formula">p<sub>stat</sub> + ½ · ρ · v² = p<sub>ges</sub> = konstant</div>'+
   '<p>Beschleunigt die Luft (grösserer Staudruck), muss der statische Druck sinken. Wo es schnell strömt, herrscht <b>Unterdruck</b>; wo es langsam strömt, <b>Überdruck</b>.</p>'+
   '<h3>Der Staudruck</h3>'+
   '<p>Der Staudruck q = ½ρv² ist die „kinetische Energie" der Strömung pro Volumen. Verdoppelt man die Geschwindigkeit, vervierfacht sich der Staudruck. Bremst man die Strömung vollständig ab (Staupunkt), wird die gesamte Bewegungsenergie in Druck umgewandelt — diesen Effekt nutzt der Fahrtmesser.</p>'+
   '<h3>Voraussetzungen</h3>'+
   '<p>Bernoulli gilt exakt nur für eine reibungsfreie Strömung mit konstanter Luftdichte. In der Praxis (langsamer Flug, kleine Höhen) sind beide Annahmen gut erfüllt, sodass die Aussage „schneller = weniger Druck" zuverlässig anwendbar ist.</p>';
  },

  quiz:[
    {q:'Luft strömt durch eine Verengung, in der sich der Querschnitt halbiert. Was passiert mit der Geschwindigkeit?',
     choices:['Sie halbiert sich','Sie bleibt gleich','Sie verdoppelt sich','Sie vervierfacht sich'],
     answer:2, explain:'Kontinuität A₁·v₁ = A₂·v₂: halber Querschnitt → <b>doppelte</b> Geschwindigkeit.'},
    {q:'Nach Bernoulli gilt: Wo die Strömungsgeschwindigkeit hoch ist, …',
     choices:['ist der statische Druck niedrig','ist der statische Druck hoch','ändert sich der Druck nicht','steigt die Temperatur stark'],
     answer:0, explain:'p + ½ρv² = konstant. Steigt der Staudruck (½ρv²), muss der statische Druck <b>sinken</b>. Hohe Geschwindigkeit = Unterdruck.'},
    {q:'Warum erzeugt ein Tragflügel Auftrieb (Bernoulli-Erklärung)?',
     choices:['Weil unten die Luft schneller strömt','Weil oben die Luft schneller strömt und dort Unterdruck entsteht','Weil die Luft oben stillsteht','Weil die Temperatur oben höher ist'],
     answer:1, explain:'Über der Oberseite strömt die Luft schneller → niedrigerer Druck (Sog). Unten höherer Druck. Die <b>Druckdifferenz</b> ergibt die Auftriebskraft.'},
    {q:'Unter welchen Bedingungen gilt die Bernoulli-Gleichung exakt?',
     choices:['Bei jeder Strömung','Nur bei Überschall','Bei konstanter Dichte und reibungsfreier Strömung','Nur bei sehr hoher Reibung'],
     answer:2, explain:'Bernoulli setzt <b>inkompressible</b> (konstante Dichte) und <b>reibungsfreie</b> Strömung voraus — im langsamen Flug eine gute Näherung.'},
    {q:'Was ist der Staudruck physikalisch?',
     choices:['Der Druck der ruhenden Luft','Die kinetische Energie der Strömung pro Volumen','Die Lufttemperatur','Der Druck am Flügelende'],
     answer:1, explain:'q = ½ρv² entspricht der <b>Bewegungsenergie</b> der Luft pro Volumen. Beim Abbremsen am Staupunkt wird sie vollständig in Druck umgesetzt.'}
  ]
});
})();
