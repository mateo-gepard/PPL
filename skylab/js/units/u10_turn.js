/* Unit 10 — Kurvenflug & Lastvielfaches + V-n-Diagramm */
(function(){
var Vs1=50;          // 1g stall speed (IAS kt)
var nPos=3.8, nNeg=-1.52, Vne=160;
App.registerUnit({
  id:'turn', group:'Steuerung', n:10, ch:'Kap. 9', icon:'turn',
  title:'Kurvenflug & Lastvielfaches',
  subtitle:'n = 1/cos φ. Mehr Querneigung → mehr Last, höhere Überziehgeschwindigkeit, engerer Radius.',
  intro:'Im Kurvenflug muss der Auftrieb das Gewicht tragen UND die Kurvenkraft liefern. Dadurch steigt das Lastvielfache n = 1/cos φ. Mit ihm wachsen die Belastung und die Überziehgeschwindigkeit (V_S·√n). Das V-n-Diagramm zeigt die zulässigen Grenzen.',

  sim:function(ctx){
    var stage=ctx.stage, side=ctx.side;
    var st={bank:30, ias:100};
    var rc=UI.responsiveCanvas(stage,{height:400, animate:true, draw:draw, state:st});

    var ro=UI.readouts([
      {id:'n',k:'Lastvielfaches n',unit:'g'},{id:'vst',k:'V_S in der Kurve',unit:'kt'},
      {id:'r',k:'Kurvenradius',unit:'m'},{id:'rate',k:'Kurvenrate',unit:'°/s'},
      {id:'load',k:'scheinb. Gewicht',unit:'%'},{id:'margin',k:'Abstand zum Stall',unit:'kt'}
    ]);
    stage.appendChild(ro.el);

    var cp=UI.controlPanel('Steuerung');
    cp.appendChild(UI.slider({label:'Querneigung (Bank) φ',min:0,max:75,step:1,value:30,unit:'°',onInput:function(v){st.bank=v;upd();}}).el);
    cp.appendChild(UI.slider({label:'Geschwindigkeit (IAS)',min:45,max:170,step:1,value:100,unit:'kt',onInput:function(v){st.ias=v;upd();}}).el);
    var bb=UI.el('div'); bb.style.cssText='display:flex;gap:6px;margin-top:8px;flex-wrap:wrap';
    [0,30,45,60].forEach(function(b){ bb.appendChild(UI.button(b+'°','sec',function(){ st.bank=b; cp.querySelectorAll('input')[0].value=b; upd(); })); });
    cp.appendChild(bb);
    stage.appendChild(cp);

    function metrics(){
      var n=1/Math.cos(Phys.rad(st.bank));
      var vst=Vs1*Math.sqrt(n);
      var V=Phys.kt2ms(st.ias);
      var r=st.bank>0? V*V/(Phys.g*Math.tan(Phys.rad(st.bank))) : Infinity;
      var rate=st.bank>0? Phys.deg(Phys.g*Math.tan(Phys.rad(st.bank))/V) : 0;
      return {n:n,vst:vst,r:r,rate:rate,margin:st.ias-vst};
    }
    function upd(){
      var M=metrics();
      ro.set('n',M.n.toFixed(2),M.n>=3.8?'alert':'');
      ro.set('vst',M.vst.toFixed(0), M.margin<0?'alert':'');
      ro.set('r', isFinite(M.r)?Math.round(M.r).toLocaleString('de-CH'):'∞');
      ro.set('rate',M.rate.toFixed(1));
      ro.set('load',Math.round(M.n*100));
      ro.set('margin',(M.margin>=0?'+':'')+M.margin.toFixed(0), M.margin<0?'alert':(M.margin<10?'':'good'));
    }

    function draw(c,W,H){
      var M=metrics();
      // ---- left: rear-view banked aircraft + forces ----
      var lx=W*0.25, ly=H*0.40, sc=1;
      var phi=Phys.rad(st.bank);
      // aircraft (front silhouette) rotated by phi
      c.save(); c.translate(lx,ly); c.rotate(phi);
      c.strokeStyle='#33405a'; c.lineWidth=6; c.lineCap='round';
      c.beginPath(); c.moveTo(-70,0); c.lineTo(70,0); c.stroke();      // wings
      c.beginPath(); c.arc(0,0,9,0,7); c.fillStyle='#33405a'; c.fill(); // fuselage
      c.beginPath(); c.moveTo(0,0); c.lineTo(0,-18); c.lineWidth=4; c.stroke(); // fin
      c.restore();
      // lift vector (perpendicular to wings, tilted by phi), length ∝ n
      var Llen=70*Math.min(2.2,M.n);
      var lvx=Math.sin(phi), lvy=-Math.cos(phi);
      Plot.arrow(c,lx,ly, lx+lvx*Llen, ly+lvy*Llen, {color:Plot.colors.green,w:4,head:10});
      Plot.text(c,'Auftrieb L = n·G', lx+lvx*Llen+4, ly+lvy*Llen, {color:Plot.colors.green,font:'700 11px -apple-system'});
      // weight (down)
      Plot.arrow(c,lx,ly, lx, ly+70, {color:Plot.colors.ink,w:4,head:10});
      Plot.text(c,'G', lx+6, ly+66, {color:Plot.colors.ink,font:'700 12px -apple-system'});
      // vertical component of lift (= weight) and horizontal (centripetal)
      c.setLineDash([4,4]); c.strokeStyle='rgba(31,95,208,.6)'; c.lineWidth=1.5;
      c.beginPath(); c.moveTo(lx+lvx*Llen, ly+lvy*Llen); c.lineTo(lx+lvx*Llen, ly); c.stroke(); // down to horizontal level
      c.beginPath(); c.moveTo(lx+lvx*Llen, ly); c.lineTo(lx, ly); c.stroke();
      c.setLineDash([]);
      Plot.text(c,'Zentripetalkraft', lx+lvx*Llen*0.5, ly-4, {color:Plot.colors.accent,font:'600 10px -apple-system',align:'center'});
      Plot.text(c,'n = 1 / cos φ = '+M.n.toFixed(2)+' g', lx, H-46, {color:Plot.colors.ink,font:'700 13px -apple-system',align:'center'});
      Plot.text(c,'φ = '+st.bank+'°', lx, H-28, {color:Plot.colors.ink3,font:'12px -apple-system',align:'center'});

      // ---- right: V-n diagram ----
      var bx=W*0.50+8, bw=W-bx-18, bch=H-58;
      var ch=new Plot.Chart(c,{x:bx,y:16,w:bw,h:bch,xmin:0,xmax:Vne+15,ymin:-2.4,ymax:4.6});
      ch.axes({xlabel:'Geschwindigkeit IAS (kt)', ylabel:'Lastvielfaches n (g)',
        xticks:[0,40,80,120,160], yticks:[-2,-1,0,1,2,3,4]});
      ch.hline(0,{color:Plot.colors.line,dash:false,w:1});
      // positive stall boundary n=(V/Vs1)^2 until nPos
      var Va=Vs1*Math.sqrt(nPos);
      var posStall=[]; for(var v=0; v<=Va; v+=2){ posStall.push({x:v,y:Math.pow(v/Vs1,2)}); }
      ch.poly(posStall,{color:Plot.colors.accent,w:2});
      ch.line(Va,nPos, Vne,nPos,{color:Plot.colors.accent,w:2});
      // negative stall boundary
      var VsNeg=Vs1*1.18, VaNeg=VsNeg*Math.sqrt(-nNeg);
      var negStall=[]; for(var v2=0; v2<=VaNeg; v2+=2){ negStall.push({x:v2,y:-Math.pow(v2/VsNeg,2)}); }
      ch.poly(negStall,{color:Plot.colors.accent,w:2});
      ch.line(VaNeg,nNeg, Vne,nNeg,{color:Plot.colors.accent,w:2});
      // Vne
      ch.line(Vne,nNeg,Vne,nPos,{color:Plot.colors.red,w:2});
      Plot.text(c,'V_NE',ch.px(Vne)-2,ch.py(nPos)-3,{color:Plot.colors.red,font:'600 10px -apple-system',align:'right'});
      // Va
      ch.dot(Va,nPos,{color:Plot.colors.orange,r:4}); Plot.text(c,'V_A',ch.px(Va)+5,ch.py(nPos)+13,{color:Plot.colors.orange,font:'600 10px -apple-system'});
      // limit labels
      Plot.text(c,'+3,8 g',ch.px(6),ch.py(nPos)-4,{color:Plot.colors.ink3,font:'10px -apple-system'});
      Plot.text(c,'−1,52 g',ch.px(6),ch.py(nNeg)+12,{color:Plot.colors.ink3,font:'10px -apple-system'});
      // current operating point
      var over = M.n>nPos+0.02, willStall = st.ias < M.vst;
      var col = (over)?Plot.colors.red:(willStall?Plot.colors.orange:Plot.colors.green);
      ch.dot(st.ias, M.n, {color:col, ring:true, r:6});
      if(willStall) Plot.text(c,'Stall!',ch.px(st.ias)+8,ch.py(M.n),{color:Plot.colors.orange,font:'700 10px -apple-system'});
      if(over) Plot.text(c,'Überlast!',ch.px(st.ias)-8,ch.py(M.n)-8,{color:Plot.colors.red,font:'700 10px -apple-system',align:'right'});
    }

    upd();
    side.appendChild(UI.tcard({tag:'Kernformel', icon:'1', title:'Lastvielfaches',
      html:'<div class="formula"><span class="var">n</span> = 1 / cos φ</div>'+
           '<ul class="kfacts"><li>30° → 1,15 g</li><li>45° → 1,41 g</li><li>60° → <b>2,0 g</b></li><li>75° → 3,86 g</li></ul>'+
           '<p>Bei 60° trägt der Flügel das doppelte Gewicht.</p>'}));
    side.appendChild(UI.tcard({tag:'Folge', icon:'2', title:'Überziehgeschwindigkeit steigt',
      html:'<div class="formula">V_S(Kurve) = V_S · √n</div>'+
           '<p>Bei 60° Bank (n=2) steigt V_S um √2 ≈ <b>41%</b>. Enge Kurven nahe der Mindestgeschwindigkeit sind deshalb gefährlich (Strömungsabriss in der Kurve).</p>'}));
    side.appendChild(UI.tcard({tag:'V-n-Diagramm', icon:'3', title:'Manövergeschwindigkeit V_A',
      html:'<p>Unterhalb von <b>V_A</b> überzieht der Flügel, bevor das Lastvielfache die Struktur überlastet — eine eingebaute Schutzgrenze. Oberhalb von V_A keine vollen, ruckartigen Ruderausschläge!</p>'}));
    side.appendChild(UI.callout('Normalkategorie: Grenzlastvielfache <b>+3,8 g / −1,52 g</b>. V_NE (rote Linie) niemals überschreiten. Böen können das n zusätzlich erhöhen.'));
    return {destroy:function(){rc.destroy();}};
  },

  theory:function(){return ''+
   '<h2>Kräfte im Kurvenflug</h2>'+
   '<p>Um eine Kurve zu fliegen, neigt der Pilot das Flugzeug. Der Auftrieb steht dann schräg: Seine <b>vertikale Komponente</b> trägt weiterhin das Gewicht, seine <b>horizontale Komponente</b> liefert die zur Kurve nötige Zentripetalkraft. Damit die Höhe gehalten wird, muss der Gesamtauftrieb grösser sein als das Gewicht.</p>'+
   '<h2>Das Lastvielfache</h2>'+
   '<p>Das Verhältnis von Auftrieb zu Gewicht heisst <b>Lastvielfaches n</b>. Im koordinierten Horizontalkurvenflug gilt:</p>'+
   '<div class="formula">n = L / G = 1 / cos φ</div>'+
   '<p>Beispiele: 30° → 1,15 g, 45° → 1,41 g, <b>60° → 2,0 g</b>, 75° → 3,86 g. Bei 60° Querneigung wiegt also alles scheinbar doppelt — auch der Pilot.</p>'+
   '<h2>Überziehgeschwindigkeit in der Kurve</h2>'+
   '<p>Weil der Flügel mehr Auftrieb (n·G) erzeugen muss, steigt die Überziehgeschwindigkeit:</p>'+
   '<div class="formula">V_S(Kurve) = V_S · √n</div>'+
   '<p>Bei 60° Bank (n = 2) ist V_S um den Faktor √2 ≈ 1,41 grösser. Enge, langsame Kurven bergen daher die Gefahr eines Strömungsabrisses.</p>'+
   '<h2>Das V-n-Diagramm (Flugbereich)</h2>'+
   '<p>Das V-n-Diagramm zeigt, welche Kombinationen aus Geschwindigkeit und Lastvielfachem zulässig sind. Begrenzt wird der Bereich durch:</p>'+
   '<ul class="kfacts">'+
   '<li>die <b>aerodynamische Grenze</b> (Überziehgrenze, n = (V/V_S)²) — links,</li>'+
   '<li>die <b>strukturellen Grenzlastvielfachen</b> (+3,8 g / −1,52 g in der Normalkategorie) — oben/unten,</li>'+
   '<li>die <b>V_NE</b> (never exceed) — rechts.</li></ul>'+
   '<p>Die <b>Manövergeschwindigkeit V_A</b> liegt am Schnittpunkt von Überziehgrenze und positivem Grenzlastvielfachen. Darunter schützt der Strömungsabriss die Struktur; darüber dürfen keine vollen Ruderausschläge gegeben werden.</p>';
  },

  quiz:[
    {q:'Wie gross ist das Lastvielfache bei 60° Querneigung im Horizontalkurvenflug?',
     choices:['1,15 g','1,41 g','2,0 g','3,0 g'],
     answer:2, explain:'n = 1/cos 60° = 1/0,5 = <b>2,0 g</b>. Der Flügel trägt das Doppelte des Gewichts.'},
    {q:'Wie verändert sich die Überziehgeschwindigkeit bei n = 2 (60° Bank)?',
     choices:['Sie bleibt gleich','Sie steigt um den Faktor √2 (≈ 41%)','Sie verdoppelt sich','Sie sinkt'],
     answer:1, explain:'V_S(Kurve) = V_S·√n = V_S·√2 ≈ <b>1,41·V_S</b> — rund 41% höher.'},
    {q:'Was beschreibt die Manövergeschwindigkeit V_A?',
     choices:['Die Höchstgeschwindigkeit','Die Geschwindigkeit, unter der das Flugzeug überzieht, bevor die Struktur überlastet wird','Die beste Steiggeschwindigkeit','Die Überziehgeschwindigkeit bei 1 g'],
     answer:1, explain:'Unter <b>V_A</b> überzieht der Flügel, bevor das Grenzlastvielfache erreicht wird — Schutz vor struktureller Überlastung. Darüber keine vollen Ruderausschläge.'},
    {q:'Welche Grenzlastvielfachen gelten typisch für die Normalkategorie?',
     choices:['+2,0 / −1,0 g','+3,8 / −1,52 g','+6,0 / −3,0 g','+4,4 / −1,76 g'],
     answer:1, explain:'Normalkategorie: <b>+3,8 g / −1,52 g</b>. (Utility und Aerobatic erlauben mehr.)'},
    {q:'Warum ist eine enge Kurve nahe der Mindestgeschwindigkeit gefährlich?',
     choices:['Der Radius wird zu gross','Die Überziehgeschwindigkeit steigt mit √n und kann die Fluggeschwindigkeit erreichen','Das Flugzeug wird zu schnell','Die Ruder werden zu wirksam'],
     answer:1, explain:'Durch n steigt V_S um √n. Nahe der Mindestgeschwindigkeit kann der Flügel in der Kurve <b>überziehen</b> — klassischer Strömungsabriss im Queranflug.'}
  ]
});
})();
