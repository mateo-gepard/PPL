/* Unit 11 — Überziehen & Trudeln (Stall & Spin) */
(function(){
var CL={clAlpha:0.10, alpha0:-3.5, clMax:1.45, alphaCrit:16};
App.registerUnit({
  id:'stall', group:'Steuerung', n:11, ch:'Kap. 10', icon:'stall',
  title:'Überziehen & Trudeln',
  subtitle:'Über dem kritischen Anstellwinkel reisst die Strömung ab — unabhängig von Geschwindigkeit und Fluglage.',
  intro:'Überziehen (Stall) tritt immer am selben kritischen Anstellwinkel auf. Erhöhe den Anstellwinkel und beobachte, wie die Strömung von hinten nach vorn ablöst, der Auftrieb einbricht und die Nachlaufzone wächst. Im Trudeln-Modus siehst du, warum ein einseitiger Abriss zur Autorotation führt.',

  sim:function(ctx){
    var stage=ctx.stage, side=ctx.side;
    var st={alpha:8, mode:'stall', spinT:0};
    var rc=UI.responsiveCanvas(stage,{height:410, animate:true, draw:draw, state:st});

    var ro=UI.readouts([
      {id:'a',k:'Anstellwinkel α',unit:'°'},{id:'cl',k:'c_A',unit:''},
      {id:'sep',k:'Ablösepunkt (ab LE)',unit:'%'},{id:'st',k:'Zustand',unit:''},
      {id:'warn',k:'Stall-Warnung',unit:''}
    ]);
    stage.appendChild(ro.el);

    var cp=UI.controlPanel('Steuerung');
    cp.appendChild(UI.segment({label:'Ansicht',value:'stall',options:[{v:'stall',t:'Überziehen'},{v:'spin',t:'Trudeln'}],
      onChange:function(v){st.mode=v;upd();}}).el);
    var sAlpha=UI.slider({label:'Anstellwinkel α',min:-4,max:24,step:0.5,value:8,unit:'°',onInput:function(v){st.alpha=v;upd();}});
    cp.appendChild(sAlpha.el);
    var bb=UI.el('div'); bb.style.cssText='display:flex;gap:6px;margin-top:6px;flex-wrap:wrap';
    bb.appendChild(UI.button('Reiseflug (4°)','sec',function(){st.alpha=4;sAlpha.set(4);upd();}));
    bb.appendChild(UI.button('Kritisch (16°)','sec',function(){st.alpha=16;sAlpha.set(16);upd();}));
    bb.appendChild(UI.button('Tiefer Stall (21°)','sec',function(){st.alpha=21;sAlpha.set(21);upd();}));
    cp.appendChild(bb);
    stage.appendChild(cp);

    function sepPoint(a){ // fraction of chord from LE where flow separates (1 = attached to TE)
      var start=CL.alphaCrit-4;
      if(a<=start) return 1;
      return Math.max(0.06, 1 - (a-start)*0.11);
    }
    function upd(){
      var cl=Phys.cl(st.alpha,CL), sp=sepPoint(st.alpha), stalled=st.alpha>CL.alphaCrit;
      var warn=st.alpha>=CL.alphaCrit-2;
      ro.set('a',st.alpha.toFixed(1));
      ro.set('cl',cl.toFixed(2), stalled?'alert':'');
      ro.set('sep',(sp*100).toFixed(0), sp<1?'alert':'good');
      ro.set('st', stalled?'STALL — abgelöst':(warn?'kurz vor Abriss':'anliegend'), stalled?'alert':(warn?'':'good'));
      ro.set('warn', warn?'🔊 AKTIV':'aus', warn?'alert':'');
    }

    // airfoil sample in local chord coords
    function afT(x){ return 0.12*5*(0.2969*Math.sqrt(x)-0.126*x-0.3516*x*x+0.2843*x*x*x-0.1015*x*x*x*x); }
    function afC(x){ return 0.045*(1-Math.pow((x-0.45)/0.55,2)); }

    function draw(c,W,H,t){
      c.fillStyle='#fbfcfe'; c.fillRect(0,0,W,H);
      if(st.mode==='spin'){ drawSpin(c,W,H,t); return; }
      drawStall(c,W,H,t);
    }

    function drawStall(c,W,H,t){
      var a=Phys.rad(st.alpha), sp=sepPoint(st.alpha), stalled=st.alpha>CL.alphaCrit, warn=st.alpha>=CL.alphaCrit-2;
      var buffet = warn ? Math.sin(t*38)*(stalled?2.8:1.2) : 0;   // airframe shake near/at stall
      // left: airfoil + flow
      var fx=W*0.52, lx0=26, lcy=H*0.40+buffet, chord=Math.min(fx-60, 300);
      var qx=0.25;
      function loc(xf, yf){ // local chord coords -> canvas, tilt about quarter chord by -a
        var X=(xf-qx)*chord, Y=yf*chord;
        var rx=X*Math.cos(a)+Y*Math.sin(a), ry=-X*Math.sin(a)+Y*Math.cos(a);
        return [lx0+qx*chord+rx, lcy-ry];
      }
      var up=[],lo=[];
      for(var i=0;i<=48;i++){ var xf=i/48; up.push(loc(xf, afC(xf)+afT(xf))); lo.push(loc(xf, afC(xf)-afT(xf))); }
      // far-field streamlines (deflected), flowing dashes
      c.save(); c.setLineDash([7,7]); c.lineDashOffset=-t*70; c.lineCap='round';
      c.lineWidth=1.3; c.strokeStyle='rgba(150,176,214,.7)';
      for(var k=-4;k<=4;k++){ if(k===0)continue;
        var base=lcy + k*26;
        c.beginPath();
        for(var xx=lx0-14; xx<=lx0+chord+80; xx+=8){
          var prog=(xx-lx0)/chord;
          var defl = Math.exp(-Math.pow((prog-0.4)/0.5,2)) * (k>0? -10:6) * (0.5+st.alpha/24);
          var dw = prog>0.6? -(prog-0.6)*18*(0.4+st.alpha/30):0;
          var y=base+defl+dw;
          (xx===lx0-14)?c.moveTo(xx,y):c.lineTo(xx,y);
        }
        c.stroke();
      }
      // upper hugging streamlines (flow up to separation)
      [7,17,29].forEach(function(gap,gi){
        c.beginPath(); var cut=stalled? Math.floor(sp*48):48;
        var p0=up[0]; c.moveTo(lx0-14, p0[1]-gap*0.4); c.lineTo(p0[0],p0[1]-gap);
        for(var ii=1;ii<=cut;ii++){ var p=up[ii]; c.lineTo(p[0],p[1]-gap); }
        if(!stalled){ var pe=up[48]; c.lineTo(pe[0]+30, pe[1]-gap+10+gi*3); }
        c.strokeStyle=stalled?'rgba(150,120,150,.55)':'rgba(80,135,225,.95)'; c.lineWidth=1.8; c.stroke();
      });
      c.restore();
      // separated wake (turbulent, animated)
      if(stalled){
        var sIdx=Math.floor(sp*48), psep=up[sIdx];
        c.fillStyle='rgba(216,83,63,.12)';
        c.beginPath(); c.moveTo(psep[0],psep[1]);
        for(var i3=sIdx;i3<=48;i3++){ var p=up[i3]; c.lineTo(p[0], p[1]-34-9*Math.sin(t*6+i3)); }
        c.lineTo(up[48][0]+58, up[48][1]-12);
        c.lineTo(up[48][0]+58, up[48][1]);
        for(var j=48;j>=sIdx;j--){ c.lineTo(up[j][0],up[j][1]); }
        c.closePath(); c.fill();
        // tumbling vortices
        for(var vptr=0;vptr<5;vptr++){
          var px=psep[0]+ (vptr+1)*(up[48][0]+30-psep[0])/5;
          var py=psep[1]-16- (vptr%2)*12 + Math.sin(t*3+vptr)*3;
          var rr=7+vptr*1.6, ph=t*5 - vptr;
          c.beginPath(); c.arc(px,py,rr, ph, ph+5.0); c.strokeStyle='rgba(216,83,63,.6)'; c.lineWidth=1.8; c.stroke();
          Plot.arrow(c, px+rr*Math.cos(ph+5.0), py+rr*Math.sin(ph+5.0),
            px+rr*Math.cos(ph+5.6), py+rr*Math.sin(ph+5.6), {color:'rgba(216,83,63,.6)',w:1.4,head:4});
        }
        c.beginPath(); c.arc(psep[0],psep[1],5,0,7); c.fillStyle=Plot.colors.red; c.fill();
        c.lineWidth=2;c.strokeStyle='#fff';c.stroke();
        Plot.text(c,'Ablösepunkt',psep[0],psep[1]-28,{color:Plot.colors.red,font:'700 10.5px -apple-system',align:'center'});
      }
      // airfoil body
      c.beginPath(); up.forEach(function(p,i){i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]);});
      for(var d=48;d>=0;d--){ c.lineTo(lo[d][0],lo[d][1]); } c.closePath();
      c.fillStyle='#33405a'; c.fill();
      // relative wind arrow
      Plot.arrow(c,8,lcy,42,lcy,{color:Plot.colors.ink3,w:2.2,head:7});
      Plot.text(c,'Wind',8,lcy-8,{color:Plot.colors.ink3,font:'600 10px -apple-system'});

      // right: CL-alpha curve
      var bx=W*0.56, bw=W-bx-18, bch=H*0.60;
      var ch=new Plot.Chart(c,{x:bx,y:18,w:bw,h:bch,xmin:-4,xmax:24,ymin:-0.3,ymax:1.7});
      ch.axes({xlabel:'Anstellwinkel α (°)',ylabel:'c_A',xticks:[-4,0,4,8,12,16,20,24],yticks:[0,0.4,0.8,1.2,1.6]});
      c.save();c.fillStyle='rgba(216,83,63,.07)';c.fillRect(ch.px(CL.alphaCrit),18,ch.x0+ch.w-ch.px(CL.alphaCrit),bch);c.restore();
      ch.vline(CL.alphaCrit,{color:'rgba(216,83,63,.5)',dash:[5,4]});
      Plot.text(c,'kritischer α (16°)',ch.px(CL.alphaCrit)+4,30,{color:Plot.colors.red,font:'600 10px -apple-system'});
      ch.curve(function(x){return Phys.cl(x,CL);},{color:Plot.colors.accent,w:2.6,n:120});
      Scene.glow(c, ch.px(st.alpha), ch.py(Phys.cl(st.alpha,CL)), 15, stalled?'rgba(216,83,63,.5)':'rgba(232,130,30,.45)');
      ch.dot(st.alpha, Phys.cl(st.alpha,CL),{color:stalled?Plot.colors.red:Plot.colors.orange,ring:true,r:6});
      Plot.text(c, stalled?'Auftrieb bricht ein':'Auftrieb steigt mit α', bx, H-40,{color:stalled?Plot.colors.red:Plot.colors.ink2,font:'600 12px -apple-system'});
      Plot.text(c,'Überziehen hängt nur vom Anstellwinkel ab.', bx, H-22,{color:Plot.colors.ink3,font:'11px -apple-system'});

      // stall-warning horn chip + warn frame
      if(warn){ Scene.tag(c, lx0, 14, (Math.floor(t*4)%2? '🔊 ':'🔈 ')+'STALL WARNING', Plot.colors.red); }
      if(stalled) Scene.warnFrame(c, 4, 4, W-8, H-8, t);
    }

    function drawSpin(c,W,H,t){
      st.spinT += 0.045;
      var cx=W*0.28, cy=H*0.44, s=Math.min(W*0.13,72);
      // descending spiral trail (height loss)
      c.save(); c.strokeStyle='rgba(31,95,208,.22)'; c.lineWidth=2;
      c.beginPath();
      for(var k=0;k<140;k++){ var th=st.spinT - k*0.18; var rr=s*1.5*(1-k/170); var px=cx+rr*Math.cos(th), py=cy+rr*Math.sin(th)*0.5 + k*0.7;
        k?c.lineTo(px,py):c.moveTo(px,py); }
      c.stroke(); c.restore();
      // rotation ring + arrow
      c.beginPath(); c.arc(cx,cy,s*1.32, 0.4, 0.4+4.4); c.strokeStyle='rgba(90,102,120,.55)'; c.lineWidth=2.5; c.setLineDash([6,6]); c.lineDashOffset=-t*40; c.stroke(); c.setLineDash([]);
      var ea=0.4+4.4; var ex=cx+s*1.32*Math.cos(ea), ey=cy+s*1.32*Math.sin(ea);
      Plot.arrow(c,ex,ey,ex+12*Math.cos(ea+1.4),ey+12*Math.sin(ea+1.4),{color:Plot.colors.ink2,w:2.6,head:8});
      // aircraft top view, inner (left) wing stalled (red)
      Scene.planeTop(c,cx,cy,s,st.spinT,{wingL:Plot.colors.red, wingR:Plot.colors.accent});
      Plot.text(c,'Autorotation',cx,cy+s*1.75,{color:Plot.colors.ink,font:'800 13px -apple-system',align:'center'});
      // legend dots
      c.fillStyle=Plot.colors.red; Scene.roundRect(c,lx(W)-6,H-58,11,11,2); c.fill();
      Plot.text(c,'innerer Flügel: stärker überzogen — weniger Auftrieb, mehr Widerstand',lx(W)+12,H-49,{color:Plot.colors.ink2,font:'10.5px -apple-system'});
      c.fillStyle=Plot.colors.accent; Scene.roundRect(c,lx(W)-6,H-40,11,11,2); c.fill();
      Plot.text(c,'äusserer Flügel: noch tragend, schneller',lx(W)+12,H-31,{color:Plot.colors.ink2,font:'10.5px -apple-system'});

      // right: CL curve with both wings
      var bx=W*0.56, bw=W-bx-18, bch=H*0.58;
      var ch=new Plot.Chart(c,{x:bx,y:18,w:bw,h:bch,xmin:0,xmax:26,ymin:0,ymax:1.7});
      ch.axes({xlabel:'Anstellwinkel α (°)',ylabel:'c_A',xticks:[0,5,10,15,20,25],yticks:[0,0.4,0.8,1.2,1.6]});
      c.save();c.fillStyle='rgba(216,83,63,.07)';c.fillRect(ch.px(CL.alphaCrit),18,ch.x0+ch.w-ch.px(CL.alphaCrit),bch);c.restore();
      ch.vline(CL.alphaCrit,{color:'rgba(216,83,63,.5)',dash:[5,4]});
      ch.curve(function(x){return Phys.cl(x,CL);},{color:Plot.colors.accent,w:2.4,n:120});
      var aOuter=14, aInner=20;
      ch.dot(aOuter, Phys.cl(aOuter,CL),{color:Plot.colors.accent,ring:true,r:6,label:'äusserer Flügel',lcolor:Plot.colors.accent});
      ch.dot(aInner, Phys.cl(aInner,CL),{color:Plot.colors.red,ring:true,r:6,label:'innerer Flügel',lcolor:Plot.colors.red});
      Plot.text(c,'Asymmetrischer Abriss → die Drehung erhält sich selbst.',bx,H-40,{color:Plot.colors.ink2,font:'600 11.5px -apple-system'});
      Plot.text(c,'Ausleitung: Anstellwinkel verringern + Seitenruder gegen die Drehung.',bx,H-22,{color:Plot.colors.ink3,font:'10.5px -apple-system'});
    }
    function lx(W){ return 24; }

    upd();
    side.appendChild(UI.tcard({tag:'Kernaussage', icon:'1', title:'Stall = kritischer Anstellwinkel',
      html:'<p>Überziehen tritt <b>immer beim selben kritischen Anstellwinkel</b> auf — gleichgültig bei welcher Geschwindigkeit, Fluglage oder welchem Gewicht. Man kann bei jeder Geschwindigkeit überziehen.</p>'}));
    side.appendChild(UI.tcard({tag:'Ablauf', icon:'2', title:'Strömungsablösung',
      html:'<p>Jenseits des kritischen Winkels löst sich die Grenzschicht — beginnend an der Hinterkante und nach vorn wandernd. Der Auftrieb bricht ein, der Widerstand steigt stark, das Flugzeug nickt nach unten.</p>'}));
    side.appendChild(UI.tcard({tag:'Trudeln', icon:'3', title:'Autorotation',
      html:'<p>Reisst die Strömung an einem Flügel früher ab (z. B. im unkoordinierten, langsamen Flug), erzeugt dieser weniger Auftrieb und mehr Widerstand → das Flugzeug rollt und giert in einer stabilen Eigendrehung — dem <b>Trudeln</b>.</p>'+
           '<p><b>Ausleitung:</b> Gas raus, Seitenruder <b>gegen</b> die Drehung, Höhenruder nachdrücken (Anstellwinkel verringern), dann sauber abfangen.</p>'}));
    side.appendChild(UI.callout('Recovery beim Stall: <b>Anstellwinkel verringern</b> (nachdrücken) — nicht ziehen! Erst wenn die Strömung wieder anliegt, sanft abfangen. Höhe verlieren ist Teil der Ausleitung.'));
    return {destroy:function(){rc.destroy();}};
  },

  theory:function(){return ''+
   '<h2>Überziehen (Stall)</h2>'+
   '<p>Mit steigendem Anstellwinkel wächst der Auftriebsbeiwert — bis zum <b>kritischen Anstellwinkel</b> (typisch ~15–16°), bei dem c_Amax erreicht wird. Darüber kann die Strömung der gewölbten Oberseite nicht mehr folgen: sie <b>löst ab</b>. Der Auftrieb bricht ein, der Widerstand steigt sprunghaft.</p>'+
   '<div class="callout" style="margin:12px 0"><span class="ci">★</span><div>Das Entscheidende: Überziehen hängt <b>nur vom Anstellwinkel</b> ab — nicht von der Geschwindigkeit. Ein Flugzeug kann bei jeder Geschwindigkeit und in jeder Fluglage überzogen werden (z. B. im steilen Abfangbogen bei hoher Geschwindigkeit).</div></div>'+
   '<p>Die Ablösung beginnt meist an der Hinterkante und wandert mit zunehmendem Winkel nach vorn. Viele Profile sind so ausgelegt, dass der Abriss an der Flügelwurzel beginnt — so bleiben die Querruder (aussen) länger wirksam und der Abriss kündigt sich an.</p>'+
   '<h3>Anzeichen und Recovery</h3>'+
   '<p>Anzeichen: Stall-Warnung, weiche Ruder, Schütteln (Buffet), sinkende Geschwindigkeit, Absacken. <b>Ausleitung: Anstellwinkel verringern</b> (Steuer nachdrücken), Leistung setzen, dann sanft abfangen. Niemals ziehen — das vergrössert den Anstellwinkel weiter.</p>'+
   '<h2>Trudeln (Spin)</h2>'+
   '<p>Trudeln ist ein überzogener Flugzustand mit Eigendrehung. Es entsteht, wenn beim Überziehen ein Flügel <b>stärker abreisst</b> als der andere (unkoordiniert, mit Schiebewinkel). Der stärker überzogene Flügel hat weniger Auftrieb und mehr Widerstand — das Flugzeug rollt und giert um die Hochachse. Da der sinkende Flügel einen noch grösseren Anstellwinkel bekommt, <b>erhält sich die Drehung selbst</b> (Autorotation).</p>'+
   '<h3>Ausleitung (Standardverfahren)</h3>'+
   '<p>Leistung zurück, Querruder neutral, <b>Seitenruder kräftig gegen die Drehrichtung</b>, dann Höhenruder nachdrücken, um den Anstellwinkel zu verringern; sobald die Drehung stoppt, Seitenruder neutral und sauber abfangen.</p>'+
   '<h2>Seitengleitflug (Slip)</h2>'+
   '<p>Beim Seitengleitflug wird mit gekreuzten Rudern (Querruder in eine, Seitenruder in die andere Richtung) bewusst ein Schiebewinkel erzeugt. Das erhöht den Widerstand und ermöglicht steileres Sinken ohne Geschwindigkeitszunahme — nützlich zum Höhenabbau und bei Seitenwindlandungen.</p>';
  },

  quiz:[
    {q:'Wovon hängt das Überziehen (der Stall) ab?',
     choices:['Nur von der Geschwindigkeit','Nur vom kritischen Anstellwinkel','Vom Gewicht allein','Von der Flughöhe'],
     answer:1, explain:'Stall tritt <b>immer beim kritischen Anstellwinkel</b> auf — unabhängig von Geschwindigkeit, Lage oder Gewicht.'},
    {q:'Was ist die richtige Sofortmassnahme beim Strömungsabriss?',
     choices:['Steuer ziehen','Anstellwinkel verringern (nachdrücken)','Nichts tun','Nur Leistung erhöhen'],
     answer:1, explain:'Den <b>Anstellwinkel verringern</b> (nachdrücken), damit die Strömung wieder anliegt — danach sanft abfangen. Ziehen verschlimmert den Abriss.'},
    {q:'Kann ein Flugzeug bei hoher Geschwindigkeit überzogen werden?',
     choices:['Nein, nie','Ja, wenn der kritische Anstellwinkel überschritten wird','Nur über 10.000 ft','Nur mit Klappen'],
     answer:1, explain:'Ja — z. B. im steilen Abfangbogen. Entscheidend ist der <b>Anstellwinkel</b>, nicht die Geschwindigkeit (high-speed stall / accelerated stall).'},
    {q:'Wodurch entsteht das Trudeln?',
     choices:['Durch symmetrischen Abriss beider Flügel','Durch einseitig (asymmetrisch) stärkeren Strömungsabriss','Durch zu hohe Geschwindigkeit','Durch ausgefahrene Klappen'],
     answer:1, explain:'Reisst ein Flügel stärker ab (unkoordiniert, Schiebewinkel), entsteht eine sich selbst erhaltende Dreh­bewegung — die <b>Autorotation</b>.'},
    {q:'Welches Ruder ist zur Ausleitung des Trudelns entscheidend?',
     choices:['Querruder in Drehrichtung','Seitenruder gegen die Drehrichtung','Höhenruder ziehen','Trimmruder'],
     answer:1, explain:'<b>Seitenruder kräftig gegen die Drehrichtung</b>, dann Höhenruder nachdrücken (Anstellwinkel verringern). Querruder bleiben neutral.'}
  ]
});
})();
