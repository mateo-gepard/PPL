/* Unit 04 — Tragflügelprofil & Strömung (Joukowski potential flow) */
(function(){
App.registerUnit({
  id:'airfoil', group:'Auftrieb', n:4, ch:'Kap. 3 & 4', icon:'wing',
  title:'Profil & Strömung',
  subtitle:'Echte Potentialströmung um ein Profil: Stromlinien, Staupunkte, Druckverteilung und Zirkulation.',
  intro:'Diese Strömung ist physikalisch echt gerechnet (Joukowski-Potentialströmung mit Kutta-Bedingung). Verändere Anstellwinkel und Wölbung und beobachte, wie die Luft oben beschleunigt (Unterdruck), wo die Staupunkte liegen und wie der Auftrieb mit dem Anstellwinkel wächst.',

  sim:function(ctx){
    var stage=ctx.stage, side=ctx.side;
    var st={ alpha:6, camber:0.06, thick:0.10, showCp:true, showStag:true, showLift:true };
    var foil=Phys.joukowski({camber:st.camber, thickness:st.thick});
    function rebuild(){ foil=Phys.joukowski({camber:st.camber, thickness:st.thick}); computeLines(); }

    var rc=UI.responsiveCanvas(stage,{height:430, animate:true, draw:draw, state:st});

    function rot(p,a){ var c=Math.cos(a),s=Math.sin(a); return {re:p.re*c-p.im*s, im:p.re*s+p.im*c}; }
    function viewVel(pv,a){ // velocity in view frame (wind horizontal)
      var z=rot(pv,a);                       // view->z (rotate by +a)
      var v=foil.velAt(z,a);
      var vv=rot({re:v.vx,im:v.vy},-a);       // z->view
      return {vx:vv.re, vy:vv.im, zeta:v.zeta};
    }
    var DOMW=6.6; // math-unit domain width centered on origin
    var lines=[]; var phase=0;
    function computeLines(){
      lines=[]; var a=Phys.rad(st.alpha);
      var seeds=[]; for(var k=0;k<23;k++){ seeds.push(-2.15 + k*(4.30/22)); }
      seeds.forEach(function(y0){
        var pts=[], spd=[], cum=[0], tcum=[0];
        var x=-DOMW/2, y=y0, steps=0, ds=0.045;
        while(x<DOMW/2 && Math.abs(y)<2.5 && steps<320){
          var v; try{ v=viewVel({re:x,im:y},a); }catch(e){ break; }
          var sp=Math.hypot(v.vx,v.vy); if(!isFinite(sp)||sp<1e-3){ break; }
          pts.push([x,y]); spd.push(sp);
          var ux=v.vx/sp, uy=v.vy/sp;
          x+=ux*ds; y+=uy*ds; steps++;
          if(pts.length>1){ cum.push(cum[cum.length-1]+ds); tcum.push(tcum[tcum.length-1]+ds/sp); }
        }
        if(pts.length>6) lines.push({pts:pts, spd:spd, tcum:tcum, Ttot:tcum[tcum.length-1]});
      });
    }
    computeLines();

    var ro=UI.readouts([
      {id:'a',k:'Anstellwinkel α',unit:'°'},
      {id:'cl',k:'Auftriebsbeiwert c_A',unit:''},
      {id:'a0',k:'Nullauftriebswinkel',unit:'°'},
      {id:'cpmin',k:'Saugspitze c_p',unit:''},
      {id:'circ',k:'Zirkulation Γ',unit:''}
    ]);
    stage.appendChild(ro.el);
    stage.appendChild(UI.legend([
      {c:Plot.colors.red,t:'Überdruck (langsam)',dot:true},
      {c:Plot.colors.accent,t:'Unterdruck / Sog (schnell)',dot:true},
      {c:Plot.colors.green,t:'Staupunkt',dot:true},
      {c:Plot.colors.orange,t:'Auftrieb / Zirkulation'}
    ]));

    var cp=UI.controlPanel('Steuerung');
    cp.appendChild(UI.slider({label:'Anstellwinkel α',min:-8,max:16,step:0.5,value:6,unit:'°',
      onInput:function(v){st.alpha=v;sync();}}).el);
    cp.appendChild(UI.slider({label:'Wölbung des Profils',min:0,max:16,step:1,value:6,unit:'%',
      onInput:function(v){st.camber=v/100;rebuild();sync();}}).el);
    cp.appendChild(UI.slider({label:'Profildicke',min:6,max:20,step:1,value:10,unit:'%',
      onInput:function(v){st.thick=v/100;rebuild();sync();}}).el);
    var togRow=UI.el('div'); togRow.style.cssText='display:flex;gap:18px;flex-wrap:wrap;margin-top:6px';
    togRow.appendChild(UI.check({label:'Druckpfeile (c_p)',checked:true,onChange:function(v){st.showCp=v;}}).el);
    togRow.appendChild(UI.check({label:'Staupunkte',checked:true,onChange:function(v){st.showStag=v;}}).el);
    togRow.appendChild(UI.check({label:'Auftriebsvektor',checked:true,onChange:function(v){st.showLift=v;}}).el);
    cp.appendChild(togRow);
    stage.appendChild(cp);

    function sync(){
      var a=Phys.rad(st.alpha);
      var cl=foil.cl(a);
      var a0=-Phys.deg(foil.beta);
      var surf=foil.surface(a,160); var cpmin=1;
      surf.forEach(function(s){ if(s.cp<cpmin)cpmin=s.cp; });
      ro.set('a',st.alpha.toFixed(1));
      ro.set('cl',cl.toFixed(2), cl>0?'good':'');
      ro.set('a0',a0.toFixed(1));
      ro.set('cpmin',cpmin.toFixed(2),'alert');
      ro.set('circ',foil.gamma(a).toFixed(2));
      computeLines();
    }

    function draw(c,W,H,t){
      var sc=W/DOMW, ox=W/2, oy=H/2 + 6;
      function P(p){ return [ox+p.re*sc, oy-p.im*sc]; } // math->canvas
      var a=Phys.rad(st.alpha);

      // background
      c.fillStyle='#fbfcfe'; c.fillRect(0,0,W,H);

      // streamlines (static, computed from the real velocity field)
      c.lineCap='round'; c.lineJoin='round';
      lines.forEach(function(ln){
        c.beginPath();
        ln.pts.forEach(function(pt,idx){ var q=P({re:pt[0],im:pt[1]}); idx?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]); });
        c.strokeStyle='rgba(150,176,214,.55)'; c.lineWidth=1; c.stroke();
      });
      // moving flow markers — travel at correct local speed (equal-time spacing)
      phase += 0.016;
      lines.forEach(function(ln){
        if(ln.Ttot<=0) return;
        var M=Math.max(2, Math.round(ln.Ttot*0.9));
        for(var m=0;m<M;m++){
          var tt=((phase + m*ln.Ttot/M) % ln.Ttot);
          // find segment by tcum
          var lo=0,hi=ln.tcum.length-1;
          while(lo<hi-1){ var mid=(lo+hi)>>1; if(ln.tcum[mid]<tt)lo=mid;else hi=mid; }
          var f=(tt-ln.tcum[lo])/((ln.tcum[hi]-ln.tcum[lo])||1);
          var x=ln.pts[lo][0]+(ln.pts[hi][0]-ln.pts[lo][0])*f;
          var y=ln.pts[lo][1]+(ln.pts[hi][1]-ln.pts[lo][1])*f;
          var sp=ln.spd[lo];
          var q=P({re:x,im:y});
          var col=Plot.cmap(Math.min(1,Math.max(0,(sp-0.3)/1.5)));
          c.beginPath(); c.arc(q[0],q[1],1.9,0,7); c.fillStyle=col; c.fill();
        }
      });

      // airfoil outline (rotated to view) with pressure coloring
      var surf=foil.surface(a,180);
      // fill body
      c.beginPath();
      surf.forEach(function(s,idx){ var pv=rot({re:s.x,im:s.y},-a); var q=P(pv); idx?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]); });
      c.closePath(); c.fillStyle='#2a3banull'; c.fillStyle='#33405a'; c.fill();
      // pressure-colored edge
      for(var k=0;k<surf.length-1;k++){
        var s0=surf[k], s1=surf[k+1];
        var p0=P(rot({re:s0.x,im:s0.y},-a)), p1=P(rot({re:s1.x,im:s1.y},-a));
        var tcol=Plot.cmap(clamp01((s0.cp+1.0)/2.2)); // cp:-? ->blue, +1->red
        c.beginPath(); c.moveTo(p0[0],p0[1]); c.lineTo(p1[0],p1[1]);
        c.strokeStyle=tcol; c.lineWidth=4.5; c.stroke();
      }

      // chord line + relative wind
      var le=rot({re:-2*foil.lam,im:0},-a), te=rot({re:2*foil.lam,im:0},-a);
      var Ple=P(le), Pte=P(te);
      c.setLineDash([4,4]); c.strokeStyle='rgba(90,102,120,.6)'; c.lineWidth=1;
      c.beginPath(); c.moveTo(Ple[0],Ple[1]); c.lineTo(Pte[0],Pte[1]); c.stroke(); c.setLineDash([]);
      // relative wind arrow (horizontal)
      Plot.arrow(c, 14, oy, 64, oy, {color:Plot.colors.ink3,w:2,head:7});
      Plot.text(c,'relative Anströmung', 14, oy-9,{color:Plot.colors.ink3,font:'600 10.5px -apple-system'});

      // Cp pressure arrows
      if(st.showCp){
        for(var m=4;m<surf.length-4;m+=9){
          var s=surf[m]; var pv=rot({re:s.x,im:s.y},-a); var base=P(pv);
          // outward normal in view frame
          var pm=rot({re:surf[m-1].x,im:surf[m-1].y},-a), pp=rot({re:surf[m+1].x,im:surf[m+1].y},-a);
          var tx=pp.re-pm.re, ty=pp.im-pm.im; var tl=Math.hypot(tx,ty)||1;
          var nx=ty/tl, ny=-tx/tl; // normal (math)
          // ensure outward: point away from centroid ~ origin-ish (use chord mid)
          if((pv.re*nx+pv.im*ny)<0){ nx=-nx; ny=-ny; }
          var mag=s.cp; // +pressure pushes in, -suction pulls out
          var L=mag*sc*0.5;
          var tip={re:pv.re - nx*(L/sc), im:pv.im - ny*(L/sc)}; // cp>0 push toward surface (inward)
          var Btip=P(tip);
          var col = mag>0?Plot.colors.red:Plot.colors.accent;
          Plot.arrow(c, base[0],base[1], Btip[0],Btip[1], {color:col,w:1.4,head:4});
        }
      }

      // stagnation points (lowest speed on surface)
      if(st.showStag){
        var mins=[]; for(var z=0;z<surf.length;z++){ var s=surf[z];
          var spd=Math.sqrt(Math.max(0,1-s.cp)); mins.push({i:z,spd:spd,s:s}); }
        mins.sort(function(x,y){return x.spd-y.spd;});
        var picks=[]; for(var w=0;w<mins.length && picks.length<2;w++){
          var ok=true; for(var u2=0;u2<picks.length;u2++){ if(Math.abs(mins[w].i-picks[u2].i)<surf.length*0.12){ok=false;break;} }
          if(ok)picks.push(mins[w]);
        }
        picks.forEach(function(pk){ var pv=rot({re:pk.s.x,im:pk.s.y},-a); var q=P(pv);
          c.beginPath(); c.arc(q[0],q[1],5,0,7); c.fillStyle=Plot.colors.green; c.fill();
          c.lineWidth=2; c.strokeStyle='#fff'; c.stroke(); });
      }

      // lift vector (perpendicular to wind = vertical) at quarter chord
      if(st.showLift){
        var cl=foil.cl(a);
        var qc=rot({re:-1*foil.lam,im:0},-a); var base=P(qc);
        var Llen=cl*48;
        Plot.arrow(c, base[0], base[1], base[0], base[1]-Llen, {color:Plot.colors.orange,w:3,head:9});
        Plot.text(c,'A', base[0]+6, base[1]-Llen+4,{color:Plot.colors.orange,font:'700 13px -apple-system'});
      }
    }
    function clamp01(x){return Math.max(0,Math.min(1,x));}

    sync();

    side.appendChild(UI.tcard({tag:'Was du siehst', icon:'1', title:'Sog erzeugt Auftrieb',
      html:'<p>Über der Oberseite drängt sich die Luft zusammen und <b>beschleunigt</b> → starker Unterdruck (blau, „Saugspitze"). Unten staut sie sich → Überdruck (rot).</p>'+
           '<p>Etwa <b>2/3 des Auftriebs</b> entstehen durch den Sog oben, nur 1/3 durch den Überdruck unten.</p>'}));
    side.appendChild(UI.tcard({tag:'Staupunkte', icon:'2', title:'Vorderer & hinterer Staupunkt',
      html:'<p>Am <b>vorderen Staupunkt</b> (grün, an der Nase) trifft die Strömung auf und steht still — hier herrscht der höchste Druck. Mit grösserem Anstellwinkel wandert er nach unten.</p>'+
           '<p>Der <b>hintere Staupunkt</b> liegt durch die Kutta-Bedingung exakt an der scharfen Hinterkante.</p>'}));
    side.appendChild(UI.tcard({tag:'Zirkulation', icon:'3', title:'Anstellwinkel = mehr Auftrieb',
      html:'<p>Im normalen Bereich steigt c<sub>A</sub> nahezu <b>linear</b> mit dem Anstellwinkel (≈ 0,1 pro Grad).</p>'+
           '<p>Ein <b>gewölbtes</b> Profil erzeugt schon bei α = 0 Auftrieb; der Nullauftrieb liegt bei negativem Winkel.</p>'}));
    side.appendChild(UI.callout('Erhöhe den Anstellwinkel über ~16°: In Einheit 11 siehst du, wie die Strömung dann abreisst (Stall). Hier bleibt sie idealisiert anliegend.'));

    return { destroy:function(){ rc.destroy(); } };
  },

  theory:function(){ return ''+
   '<h2>Geometrie des Tragflügelprofils</h2>'+
   '<p>Ein Profil wird durch wenige Grössen beschrieben: die <b>Profilsehne</b> (Verbindung Vorder–Hinterkante), die <b>Profildicke</b>, die <b>Wölbung</b> (Krümmung der Skelettlinie) und den <b>Anstellwinkel α</b> zwischen Sehne und Anströmung.</p>'+
   '<h2>Wie Auftrieb entsteht</h2>'+
   '<p>Die Strömung teilt sich an der Vorderkante. Über der gewölbten Oberseite verengt sich der „Strömungskanal", die Luft beschleunigt (Kontinuität) und ihr statischer Druck sinkt (Bernoulli). Unten staut sie sich leicht, der Druck steigt. Die resultierende <b>Druckdifferenz</b> ergibt eine nach oben gerichtete Kraft — den Auftrieb A, senkrecht zur Anströmung.</p>'+
   '<p>Wichtig: Der grössere Anteil des Auftriebs stammt aus dem <b>Unterdruck (Sog) oben</b>, nicht aus dem Überdruck unten.</p>'+
   '<h3>Staupunkte und Druckverteilung</h3>'+
   '<p>Am <b>Staupunkt</b> wird die Strömung vollständig abgebremst — dort herrscht der höchste (Gesamt-)Druck. Der vordere Staupunkt liegt an der Nase und wandert mit steigendem Anstellwinkel nach unten. Der hintere Staupunkt liegt an der Hinterkante: Die Strömung verlässt das Profil glatt an der scharfen Hinterkante (Kutta-Bedingung) — das legt die Zirkulation und damit den Auftrieb fest.</p>'+
   '<h3>Anstellwinkel und Auftriebsbeiwert</h3>'+
   '<p>Im normalen Flugbereich wächst der Auftriebsbeiwert c<sub>A</sub> nahezu linear mit dem Anstellwinkel. Ein gewölbtes Profil hat seinen Nullauftrieb bei einem <b>negativen</b> Anstellwinkel — es trägt also schon bei α = 0. Erst nahe dem kritischen Anstellwinkel (~16°) reisst die Strömung ab.</p>';
  },

  quiz:[
    {q:'Woher stammt der grössere Teil des Auftriebs an einem normalen Profil?',
     choices:['Aus dem Überdruck an der Unterseite','Aus dem Unterdruck (Sog) an der Oberseite','Zu gleichen Teilen oben und unten','Aus der Reibung an der Hinterkante'],
     answer:1, explain:'Rund <b>2/3</b> des Auftriebs entstehen durch den Sog (Unterdruck) über der Oberseite, nur etwa 1/3 durch den Überdruck unten.'},
    {q:'Was kennzeichnet den vorderen Staupunkt?',
     choices:['Höchste Geschwindigkeit, niedrigster Druck','Geschwindigkeit null, höchster Druck','Liegt immer an der Hinterkante','Dort reisst die Strömung ab'],
     answer:1, explain:'Am Staupunkt wird die Strömung vollständig abgebremst (v = 0). Die ganze Bewegungsenergie wird zu Druck → <b>höchster Druck</b>.'},
    {q:'Wie verändert sich der Auftriebsbeiwert c_A im normalen Bereich mit dem Anstellwinkel?',
     choices:['Er sinkt linear','Er steigt nahezu linear','Er bleibt konstant','Er steigt quadratisch'],
     answer:1, explain:'Bis nahe zum kritischen Anstellwinkel steigt c<sub>A</sub> <b>nahezu linear</b> (~0,1 pro Grad) mit α.'},
    {q:'Ein gewölbtes (asymmetrisches) Profil erzeugt bei einem Anstellwinkel von 0°…',
     choices:['keinen Auftrieb','bereits positiven Auftrieb','negativen Auftrieb','maximalen Auftrieb'],
     answer:1, explain:'Durch die Wölbung liegt der Nullauftriebswinkel im <b>Negativen</b>. Bei α = 0° erzeugt das Profil daher schon Auftrieb.'},
    {q:'Wohin wandert der vordere Staupunkt, wenn der Anstellwinkel vergrössert wird?',
     choices:['Nach oben','Nach unten (Richtung Unterseite)','Zur Hinterkante','Er bleibt fest'],
     answer:1, explain:'Mit grösserem Anstellwinkel verschiebt sich der vordere Staupunkt <b>nach unten/hinten auf die Unterseite</b>.'}
  ]
});
})();
