/* Unit 05 — Auftrieb & Auftriebsformel */
(function(){
var CL={clAlpha:0.10, alpha0:-3.5, clMax:1.45, alphaCrit:16};
App.registerUnit({
  id:'lift', group:'Auftrieb', n:5, ch:'Kap. 4', icon:'lift',
  title:'Auftrieb & Formel',
  subtitle:'A = c_A · F · ½ρv². Spiele mit allen Grössen und bring Auftrieb und Gewicht ins Gleichgewicht.',
  intro:'Der Auftrieb hängt von vier Grössen ab: Auftriebsbeiwert (Anstellwinkel), Flügelfläche, Luftdichte und — quadratisch — der Geschwindigkeit. Verändere sie und beobachte, ob das Flugzeug steigt, sinkt oder horizontal fliegt.',

  sim:function(ctx){
    var stage=ctx.stage, side=ctx.side;
    var st={alpha:5, ias:100, S:16, m:1000, altFt:0,
            _scroll:0, _vscroll:0, _pitch:0, _bob:0, _prop:0, _roc:0};
    var clouds=Scene.makeClouds(7,21);
    var rc=UI.responsiveCanvas(stage,{height:420, animate:true, draw:draw, state:st});

    var ro=UI.readouts([
      {id:'cl',k:'c_A (Beiwert)',unit:''},{id:'lift',k:'Auftrieb A',unit:'N'},
      {id:'weight',k:'Gewicht G',unit:'N'},{id:'q',k:'Staudruck q',unit:'Pa'},
      {id:'vs',k:'Überziehgeschw. V_S',unit:'kt'},{id:'state',k:'Flugzustand',unit:''}
    ]);
    stage.appendChild(ro.el);

    var cp=UI.controlPanel('Steuerung');
    cp.appendChild(UI.slider({label:'Anstellwinkel α',min:-4,max:18,step:0.5,value:5,unit:'°',onInput:function(v){st.alpha=v;upd();}}).el);
    cp.appendChild(UI.slider({label:'Geschwindigkeit (IAS)',min:40,max:160,step:1,value:100,unit:'kt',onInput:function(v){st.ias=v;upd();}}).el);
    cp.appendChild(UI.slider({label:'Flügelfläche F',min:8,max:28,step:1,value:16,unit:'m²',onInput:function(v){st.S=v;upd();}}).el);
    cp.appendChild(UI.slider({label:'Masse m',min:600,max:1600,step:20,value:1000,unit:'kg',onInput:function(v){st.m=v;upd();}}).el);
    cp.appendChild(UI.slider({label:'Höhe',min:0,max:12000,step:500,value:0,unit:'ft',fmt:function(v){return v.toLocaleString('de-CH');},onInput:function(v){st.altFt=v;upd();}}).el);
    stage.appendChild(cp);

    function compute(){
      var A=Phys.isa(Phys.ft2m(st.altFt));
      var cl=Phys.cl(st.alpha,CL);
      var tas=Phys.tasFromIas(Phys.kt2ms(st.ias),A.rho);
      var q=Phys.q(A.rho,tas);
      var lift=cl*q*st.S;
      var W=st.m*Phys.g;
      var vs=Phys.ms2kt(Math.sqrt(2*W/(Phys.rho0*st.S*CL.clMax)));
      return {cl:cl,lift:lift,W:W,q:q,vs:vs,stalled:Phys.stalled(st.alpha,CL),A:A};
    }
    function upd(){
      var r=compute();
      ro.set('cl',r.cl.toFixed(2));
      ro.set('lift',Math.round(r.lift).toLocaleString('de-CH'),'good');
      ro.set('weight',Math.round(r.W).toLocaleString('de-CH'));
      ro.set('q',Math.round(r.q));
      ro.set('vs',r.vs.toFixed(0));
      var ratio=r.lift/r.W;
      var label = r.stalled?'STALL':(ratio>1.04?'steigt ↑':(ratio<0.96?'sinkt ↓':'Horizontalflug'));
      ro.set('state',label, r.stalled?'alert':(Math.abs(ratio-1)<=0.04?'good':''));
      st._r=r;
    }

    function draw(c,W,H,t){
      var r=st._r||compute();
      var dt=Scene.dt(st,t);
      var ratio=r.lift/r.W;

      // ---------- left: cA-alpha curve ----------
      var m=40, cw=W*0.42-m-6, chh=H-72;
      var ch=new Plot.Chart(c,{x:m,y:20,w:cw,h:chh,xmin:-6,xmax:20,ymin:-0.4,ymax:1.7});
      ch.axes({xlabel:'Anstellwinkel α (°)', ylabel:'c_A', xticks:[-4,0,4,8,12,16,20], yticks:[0,0.4,0.8,1.2,1.6]});
      c.save(); c.fillStyle='rgba(216,83,63,.07)';
      c.fillRect(ch.px(CL.alphaCrit),20,ch.x0+ch.w-ch.px(CL.alphaCrit),chh); c.restore();
      ch.vline(CL.alphaCrit,{color:'rgba(216,83,63,.5)',dash:[5,4]});
      Plot.text(c,'kritischer α',ch.px(CL.alphaCrit)+4,30,{color:Plot.colors.red,font:'600 10px -apple-system'});
      ch.curve(function(x){return Phys.cl(x,CL);},{color:Plot.colors.accent,w:2.6,n:120});
      ch.hline(CL.clMax,{color:'rgba(31,157,107,.4)',dash:[4,4]});
      Plot.text(c,'c_Amax',ch.px(-5.5),ch.py(CL.clMax)-4,{color:Plot.colors.green,font:'600 10px -apple-system'});
      var dotCol=r.stalled?Plot.colors.red:Plot.colors.orange;
      Scene.glow(c, ch.px(st.alpha), ch.py(r.cl), 16, r.stalled?'rgba(216,83,63,.5)':'rgba(232,130,30,.5)');
      ch.dot(st.alpha, r.cl, {color:dotCol, ring:true, r:6});

      // ---------- right: live flight scene ----------
      var bx=Math.round(W*0.46), by=8, bw=W-bx-8, bh=H-16;
      c.save(); Scene.roundRect(c,bx,by,bw,bh,14); c.clip();
      var altT=Scene.clamp01(st.altFt/14000);
      Scene.sky(c,bx,by,bw,bh,altT);

      // physical climb/sink: vertical speed driven by lift excess; stall forces descent
      var rocTarget = r.stalled ? -3.4 : Scene.clamp((ratio-1)*6, -3.2, 3.2);  // m/s-ish
      Scene.approach(st,'_roc',rocTarget,2.2,dt);
      // horizontal cloud scroll from true airspeed; vertical scroll from ROC
      var tas=Phys.ms2kt(Phys.tasFromIas(Phys.kt2ms(st.ias),r.A.rho));
      st._scroll += tas*0.55*dt;
      st._vscroll += st._roc*14*dt;           // climb -> clouds move down
      st._prop += dt*40;

      // clouds with vertical parallax (wrap)
      c.save(); c.beginPath(); c.rect(bx,by,bw,bh); c.clip();
      c.translate(0, ((st._vscroll%bh)+bh)%bh - bh/2);
      Scene.clouds(c,bx,by-bh, bw,bh,clouds,st._scroll,0.9);
      Scene.clouds(c,bx,by,    bw,bh,clouds,st._scroll,0.9);
      Scene.clouds(c,bx,by+bh, bw,bh,clouds,st._scroll,0.9);
      c.restore();

      // aircraft pitch: climb nose-up, sink nose-down, stall nose-drop + buffet
      var pitchTarget = r.stalled ? -0.34 : Scene.clamp(st._roc*0.10, -0.22, 0.26);
      Scene.approach(st,'_pitch',pitchTarget,3.5,dt);
      st._bob = Math.sin(t*1.6)*4 + (r.stalled?Math.sin(t*34)*5:0);  // gentle bob + stall buffet
      var acx=bx+bw*0.45, acy=by+bh*0.52+st._bob;
      var asz=Math.min(62, bw*0.20);

      // force arrows: weight = fixed visual length, lift scales by A/G ratio
      var Wlen=86;
      var liftTop=by+40;                                   // keep tip + badge inside
      var La=Scene.clamp(ratio*Wlen, 6, (acy-asz*0.34)-liftTop);
      var Wa=Wlen;
      var lx=acx, lTipY=acy-asz*0.34-La, wTipY=acy+asz*0.30+Wa;
      Plot.arrow(c, lx, acy-asz*0.34, lx, lTipY, {color:Plot.colors.green, w:5, head:12});
      Plot.arrow(c, lx, acy+asz*0.30, lx, wTipY, {color:'#26324a', w:5, head:12});
      Scene.valBadge(c, lx+12, lTipY+12, 'A = '+(r.lift/1000).toFixed(1)+' kN', Plot.colors.green);
      Scene.valBadge(c, lx+12, wTipY-2, 'G = '+(r.W/1000).toFixed(1)+' kN', '#26324a');
      Scene.planeSide(c, acx, acy, asz, {pitch:st._pitch, prop:true, propPhase:st._prop, face:1});

      // climb / sink indicator ribbon on the right edge
      var vsx=bx+bw-30;
      if(Math.abs(st._roc)>0.25){
        var up=st._roc>0, vlen=Scene.clamp(Math.abs(st._roc)*16,12,bh*0.34);
        Scene.forceArrow(c, vsx, acy, 0, up?-vlen:vlen,
          {color:up?Plot.colors.green:Plot.colors.orange, w:3, head:8});
        Plot.text(c,(up?'+':'−')+Math.abs(st._roc*197).toFixed(0)+' ft/min', vsx-4, acy+(up?-vlen-8:vlen+14),
          {color:up?Plot.colors.green:Plot.colors.orange,font:'700 10px -apple-system',align:'right'});
      }

      // header formula + altitude tag
      Scene.tag(c,bx+10,by+10,'A = c_A · F · ½ρv²',Plot.colors.ink2);
      Scene.tag(c,bx+10,by+38, st.altFt.toLocaleString('de-CH')+' ft · '+tas.toFixed(0)+' kt TAS',Plot.colors.accent);

      // status banner
      var lbl=r.stalled?'STALL — Strömung reisst ab':(ratio>1.04?'A > G  ·  Steigflug':(ratio<0.96?'A < G  ·  Sinkflug':'A = G  ·  Horizontalflug'));
      var col=r.stalled?Plot.colors.red:(Math.abs(ratio-1)<=0.04?Plot.colors.green:Plot.colors.orange);
      var banW=bw-24; Scene.roundRect(c,bx+12,by+bh-40,banW,30,8); c.fillStyle=col; c.fill();
      Plot.text(c,lbl,bx+bw/2,by+bh-25,{color:'#fff',font:'700 13px -apple-system',align:'center'});
      c.restore();
      if(r.stalled) Scene.warnFrame(c,bx,by,bw,bh,t);
    }

    upd();
    side.appendChild(UI.tcard({tag:'Formel', icon:'1', title:'Die Auftriebsformel',
      html:'<div class="formula"><span class="var">A</span> = <span class="var">c_A</span> · <span class="var">F</span> · ½<span class="var">ρ</span><span class="var">v</span>²</div>'+
           '<ul class="kfacts"><li><b>c_A</b> — steigt mit dem Anstellwinkel</li><li><b>F</b> — Flügelfläche</li><li><b>ρ</b> — Luftdichte (sinkt mit Höhe)</li><li><b>v</b> — Geschwindigkeit, geht <b>quadratisch</b> ein</li></ul>'}));
    side.appendChild(UI.tcard({tag:'Quadratisch', icon:'2', title:'Geschwindigkeit dominiert',
      html:'<p>Weil v² in der Formel steht, hat die Geschwindigkeit den stärksten Einfluss. Doppelte Geschwindigkeit → <b>vierfacher</b> Auftrieb (bei gleichem c_A).</p>'+
           '<p>Deshalb kann langsamer Flug nur durch höheren Anstellwinkel (mehr c_A) oder Klappen ausgeglichen werden.</p>'}));
    side.appendChild(UI.callout('Im stationären Horizontalflug gilt <b>A = G</b>. Wird langsamer geflogen, braucht es einen grösseren Anstellwinkel — bis zum kritischen Winkel, dann folgt der Strömungsabriss.'));
    return {destroy:function(){rc.destroy();}};
  },

  theory:function(){return ''+
   '<h2>Die Auftriebsformel</h2>'+
   '<p>Alle Einflüsse auf den Auftrieb fasst eine einzige Gleichung zusammen:</p>'+
   '<div class="formula">A = c_A · F · ½ · ρ · v²</div>'+
   '<p>mit A = Auftrieb [N], c_A = Auftriebsbeiwert, F = Flügelfläche [m²], ρ = Luftdichte [kg/m³], v = Geschwindigkeit [m/s].</p>'+
   '<h3>Der Auftriebsbeiwert c_A</h3>'+
   '<p>c_A bündelt Profilform und Anstellwinkel. Im normalen Bereich wächst c_A linear mit dem Anstellwinkel. Erst am <b>kritischen Anstellwinkel</b> erreicht er sein Maximum c_Amax — darüber reisst die Strömung ab und c_A fällt.</p>'+
   '<h3>Geschwindigkeit zählt am meisten</h3>'+
   '<p>Da v im Quadrat steht, ändert sich der Auftrieb mit der Geschwindigkeit am stärksten: doppelte Geschwindigkeit → vierfacher Auftrieb. Halbiert man die Geschwindigkeit, viertelt sich der Auftrieb — er muss dann durch einen viermal grösseren c_A (hoher Anstellwinkel, Klappen) ausgeglichen werden.</p>'+
   '<h3>Gleichgewicht im Horizontalflug</h3>'+
   '<p>Im stationären Horizontalflug halten sich Auftrieb und Gewicht die Waage: A = G. Aus der Formel folgt die <b>Überziehgeschwindigkeit</b>, bei der selbst c_Amax gerade noch das Gewicht trägt:</p>'+
   '<div class="formula">V_S = √( 2·G / (ρ·F·c_Amax) )</div>'+
   '<p>Mehr Gewicht oder kleinere Fläche erhöhen V_S; ein grösserer c_Amax (Klappen) senkt sie.</p>';
  },

  quiz:[
    {q:'Welche Grösse geht in der Auftriebsformel quadratisch ein?',
     choices:['Die Flügelfläche F','Der Auftriebsbeiwert c_A','Die Geschwindigkeit v','Die Luftdichte ρ'],
     answer:2, explain:'A = c_A·F·½ρ<b>v²</b>. Die Geschwindigkeit geht im Quadrat ein und hat damit den grössten Einfluss.'},
    {q:'Ein Flugzeug verdoppelt seine Geschwindigkeit bei gleichem Anstellwinkel. Der Auftrieb …',
     choices:['verdoppelt sich','vervierfacht sich','bleibt gleich','halbiert sich'],
     answer:1, explain:'v² → 2² = 4. Der Auftrieb wird <b>viermal</b> so gross.'},
    {q:'Wie muss der Anstellwinkel verändert werden, um bei geringerer Geschwindigkeit den Auftrieb konstant zu halten?',
     choices:['Verkleinert werden','Vergrössert werden','Unverändert bleiben','Auf 0° gesetzt werden'],
     answer:1, explain:'Weniger Geschwindigkeit (weniger Staudruck) erfordert mehr c_A — also einen <b>grösseren Anstellwinkel</b>, bis maximal c_Amax.'},
    {q:'Was passiert mit der Überziehgeschwindigkeit V_S, wenn die Masse steigt?',
     choices:['V_S sinkt','V_S bleibt gleich','V_S steigt','V_S wird null'],
     answer:2, explain:'V_S = √(2G/(ρF·c_Amax)). Mehr Gewicht G → <b>höhere</b> Überziehgeschwindigkeit.'},
    {q:'In welchem Verhältnis stehen Auftrieb und Gewicht im stationären Horizontalflug?',
     choices:['A > G','A < G','A = G','A = 2·G'],
     answer:2, explain:'Im stationären Horizontalflug herrscht Gleichgewicht: <b>A = G</b>. Ist A > G, steigt das Flugzeug; ist A < G, sinkt es.'}
  ]
});
})();
