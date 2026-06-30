/* Unit 06 — Widerstand & Polare */
(function(){
App.registerUnit({
  id:'drag', group:'Auftrieb', n:6, ch:'Kap. 5 & 6', icon:'drag',
  title:'Widerstand & Polare',
  subtitle:'Schädlicher Widerstand (∝v²) und induzierter Widerstand (∝1/v²) ergeben die typische Widerstandskurve.',
  intro:'Der Gesamtwiderstand setzt sich aus dem schädlichen Widerstand (wächst mit v²) und dem induzierten Widerstand (sinkt mit der Geschwindigkeit) zusammen. Ihre Summe hat ein Minimum — die Geschwindigkeit des geringsten Widerstands und besten Gleitens. Rechts: die Polare mit der Tangente für den besten Gleitwinkel.',

  sim:function(ctx){
    var stage=ctx.stage, side=ctx.side;
    var S=16, e=0.8;
    var st={ias:95, m:1100, AR:8, cd0:0.028};
    var rc=UI.responsiveCanvas(stage,{height:400, draw:draw, state:st});

    var ro=UI.readouts([
      {id:'dp',k:'Schädl. Widerstd.',unit:'N'},{id:'di',k:'Induz. Widerstd.',unit:'N'},
      {id:'dt',k:'Gesamtwiderstd.',unit:'N'},{id:'ld',k:'Gleitzahl c_A/c_W',unit:''},
      {id:'best',k:'beste Gleitzahl',unit:''},{id:'vmd',k:'V (min. Wid.)',unit:'kt'}
    ]);
    stage.appendChild(ro.el);
    stage.appendChild(UI.legend([
      {c:Plot.colors.orange,t:'schädlicher Widerstand'},
      {c:Plot.colors.accent,t:'induzierter Widerstand'},
      {c:Plot.colors.ink,t:'Gesamtwiderstand'}
    ]));

    var cp=UI.controlPanel('Steuerung');
    cp.appendChild(UI.slider({label:'Geschwindigkeit (IAS)',min:45,max:160,step:1,value:95,unit:'kt',onInput:function(v){st.ias=v;upd();}}).el);
    cp.appendChild(UI.slider({label:'Masse m',min:700,max:1500,step:20,value:1100,unit:'kg',onInput:function(v){st.m=v;upd();}}).el);
    cp.appendChild(UI.slider({label:'Streckung Λ (Flügelschlankheit)',min:5,max:14,step:0.5,value:8,unit:'',onInput:function(v){st.AR=v;upd();}}).el);
    cp.appendChild(UI.slider({label:'Nullwiderstand c_W0',min:0.018,max:0.05,step:0.002,value:0.028,unit:'',fmt:function(v){return v.toFixed(3);},onInput:function(v){st.cd0=v;upd();}}).el);
    stage.appendChild(cp);

    function dragAt(ias){
      var v=Phys.kt2ms(ias), q=Phys.q(Phys.rho0,v), W=st.m*Phys.g;
      var cl=W/(q*S);
      var cdi=cl*cl/(Math.PI*st.AR*e);
      var Dp=st.cd0*q*S, Di=cdi*q*S;
      return {Dp:Dp,Di:Di,Dt:Dp+Di,cl:cl,cd:st.cd0+cdi,q:q,W:W,v:v};
    }
    function bestGlide(){ // tangent point of polar
      var clStar=Math.sqrt(st.cd0*Math.PI*st.AR*e);
      var cwStar=2*st.cd0;
      return {cl:clStar, cw:cwStar, ld:clStar/cwStar};
    }
    function vmd(){ // speed at min drag (Dp=Di)
      var bg=bestGlide(); var W=st.m*Phys.g;
      var v=Math.sqrt(2*W/(Phys.rho0*S*bg.cl));
      return Phys.ms2kt(v);
    }
    function upd(){
      var d=dragAt(st.ias), bg=bestGlide();
      ro.set('dp',Math.round(d.Dp));
      ro.set('di',Math.round(d.Di));
      ro.set('dt',Math.round(d.Dt),'');
      ro.set('ld',(d.cl/d.cd).toFixed(1));
      ro.set('best','1 : '+bg.ld.toFixed(1),'good');
      ro.set('vmd',vmd().toFixed(0));
      rc.redraw();
    }

    function draw(c,W,H){
      var d=dragAt(st.ias), bg=bestGlide();
      // ---- left: drag vs speed ----
      var m=42, cw=W*0.5-m-8, chh=H-66;
      var maxD=Math.max(dragAt(45).Dt, dragAt(160).Di+dragAt(160).Dp)*0.7;
      maxD=Math.max(dragAt(50).Di, dragAt(160).Dp)*1.15;
      var ch=new Plot.Chart(c,{x:m,y:18,w:cw,h:chh,xmin:45,xmax:160,ymin:0,ymax:maxD});
      ch.axes({xlabel:'Geschwindigkeit IAS (kt)', ylabel:'Widerstand (N)'});
      ch.curve(function(v){return dragAt(v).Dp;},{color:Plot.colors.orange,w:2,n:80});
      ch.curve(function(v){return dragAt(v).Di;},{color:Plot.colors.accent,w:2,n:80});
      ch.curve(function(v){return dragAt(v).Dt;},{color:Plot.colors.ink,w:2.6,n:80});
      ch.vline(vmd(),{color:Plot.colors.green,dash:[5,4]});
      Plot.text(c,'V min. Wid.',ch.px(vmd())+4,ch.py(maxD*0.96),{color:Plot.colors.green,font:'600 10px -apple-system'});
      ch.dot(st.ias, d.Dt, {color:Plot.colors.ink,ring:true,r:5});

      // ---- right: polar cA vs cW ----
      var bx=W*0.55+30, bw=W*0.45-50, bch=H-66;
      var ch2=new Plot.Chart(c,{x:bx,y:18,w:bw,h:bch,xmin:0,xmax:Math.max(0.14,bg.cw*5),ymin:0,ymax:1.6});
      ch2.axes({xlabel:'Widerstandsbeiwert c_W', ylabel:'Auftriebsbeiwert c_A'});
      // polar curve cw(cl)
      var pts=[]; for(var cl=0;cl<=1.5;cl+=0.05){ pts.push({x:st.cd0+cl*cl/(Math.PI*st.AR*e), y:cl}); }
      ch2.poly(pts,{color:Plot.colors.accent,w:2.4});
      // tangent from origin
      ch2.line(0,0, bg.cw,bg.cl, {color:Plot.colors.green,w:1.8,dash:[5,4]});
      ch2.dot(bg.cw,bg.cl,{color:Plot.colors.green,ring:true,r:6,label:'bester Gleitwinkel',lcolor:Plot.colors.green});
      // current point
      ch2.dot(d.cd, d.cl, {color:Plot.colors.orange,ring:true,r:5});
      Plot.text(c,'Tangente vom Ursprung = max c_A/c_W',bx,H-50,{color:Plot.colors.ink3,font:'10.5px -apple-system'});
    }

    upd();
    side.appendChild(UI.tcard({tag:'Zwei Anteile', icon:'1', title:'Schädlich + induziert',
      html:'<p><b>Schädlicher Widerstand</b> (Form + Reibung + Interferenz) wächst mit v² — bei hoher Geschwindigkeit dominant.</p>'+
           '<p><b>Induzierter Widerstand</b> entsteht durch die Randwirbel des Auftriebs. Er ist bei langsamem Flug (hoher c_A) am grössten und sinkt mit der Geschwindigkeit.</p>'}));
    side.appendChild(UI.tcard({tag:'Minimum', icon:'2', title:'Geschwindigkeit des geringsten Widerstands',
      html:'<p>Am Minimum der Gesamtkurve sind schädlicher und induzierter Widerstand <b>gleich gross</b>. Hier ist die Gleitzahl c_A/c_W maximal — das ist die Geschwindigkeit für <b>bestes Gleiten</b> und grösste Reichweite (Propeller).</p>'}));
    side.appendChild(UI.tcard({tag:'Polare', icon:'3', title:'Bester Gleitwinkel',
      html:'<p>In der Polare (c_A über c_W) liefert die <b>Tangente vom Ursprung</b> den Punkt mit dem grössten Verhältnis c_A/c_W — die <b>beste Gleitzahl</b>. Beispiel 1:10 = 10 m vorwärts pro 1 m Höhenverlust.</p>'}));
    side.appendChild(UI.callout('Eine grössere <b>Streckung Λ</b> (schlankerer Flügel) verringert den induzierten Widerstand → bessere Gleitzahl. Deshalb haben Segelflugzeuge sehr lange, schmale Flügel.'));
    return {destroy:function(){rc.destroy();}};
  },

  theory:function(){return ''+
   '<h2>Der Gesamtwiderstand</h2>'+
   '<p>Der Luftwiderstand eines Flugzeugs besteht aus zwei grundverschiedenen Anteilen:</p>'+
   '<h3>Schädlicher Widerstand</h3>'+
   '<p>Er entsteht durch Form, Oberflächenreibung und Interferenz aller nicht-auftriebserzeugenden Teile. Wie jede Widerstandskraft wächst er mit dem Staudruck, also mit <b>v²</b>. Bei hoher Geschwindigkeit ist er der dominierende Anteil.</p>'+
   '<h3>Induzierter Widerstand</h3>'+
   '<p>Er ist der „Preis des Auftriebs": An den Flügelenden strömt Luft von der Unterseite (Überdruck) zur Oberseite (Unterdruck) und bildet <b>Randwirbel</b>. Diese erzeugen einen Abwind und kippen den Auftriebsvektor leicht nach hinten — das ist der induzierte Widerstand. Er ist proportional zu c_A² und damit bei <b>langsamem Flug</b> (hoher Anstellwinkel) am grössten; mit zunehmender Geschwindigkeit nimmt er ab (∝ 1/v²).</p>'+
   '<div class="formula">c_W = c_W0 + c_A² / (π · Λ · e)</div>'+
   '<p>Eine grosse <b>Streckung Λ</b> (Verhältnis Spannweite zu Flügeltiefe) verringert den induzierten Widerstand deutlich.</p>'+
   '<h2>Die Widerstandskurve und das Minimum</h2>'+
   '<p>Addiert man beide Anteile, entsteht eine U-förmige Kurve. Ihr Minimum liegt dort, wo schädlicher und induzierter Widerstand <b>gleich gross</b> sind. Diese Geschwindigkeit liefert die beste Gleitzahl und (beim Propellerflugzeug) die grösste Reichweite.</p>'+
   '<h2>Die Polare</h2>'+
   '<p>Die <b>Gesamtpolare</b> trägt c_A über c_W auf. Eine Gerade vom Ursprung, die die Polare gerade berührt (Tangente), markiert den Punkt mit dem grössten Verhältnis c_A/c_W — die <b>beste Gleitzahl</b> bzw. den besten Gleitwinkel. Eine Gleitzahl von 1:10 bedeutet: pro Meter Höhenverlust 10 Meter Strecke über Grund (bei Windstille).</p>';
  },

  quiz:[
    {q:'Wie verhält sich der induzierte Widerstand mit zunehmender Geschwindigkeit?',
     choices:['Er nimmt zu','Er nimmt ab','Er bleibt konstant','Er steigt mit v²'],
     answer:1, explain:'Induzierter Widerstand hängt von c_A² ab. Schneller Flug → kleinerer Anstellwinkel/c_A → <b>weniger</b> induzierter Widerstand (∝ 1/v²).'},
    {q:'Wodurch entsteht der induzierte Widerstand?',
     choices:['Durch Oberflächenreibung','Durch die Randwirbel an den Flügelenden','Durch die Form des Rumpfes','Durch die Triebwerksleistung'],
     answer:1, explain:'Am Flügelende strömt Luft vom Über- zum Unterdruck und bildet <b>Randwirbel</b>. Der erzeugte Abwind kippt den Auftrieb nach hinten = induzierter Widerstand.'},
    {q:'Wo liegt das Minimum des Gesamtwiderstands?',
     choices:['Wo der schädliche Widerstand null ist','Wo induzierter und schädlicher Widerstand gleich gross sind','Bei der Höchstgeschwindigkeit','Bei der Überziehgeschwindigkeit'],
     answer:1, explain:'Im Minimum sind beide Anteile <b>gleich gross</b>. Dort ist die Gleitzahl c_A/c_W maximal (bestes Gleiten).'},
    {q:'Was bewirkt eine grössere Streckung Λ (schlankerer Flügel)?',
     choices:['Mehr induzierten Widerstand','Weniger induzierten Widerstand','Mehr schädlichen Widerstand','Keine Wirkung'],
     answer:1, explain:'Eine grössere Streckung verringert die Randwirbel und damit den <b>induzierten Widerstand</b> — bessere Gleitzahl (Segelflugzeuge).'},
    {q:'Eine Gleitzahl von 1:10 bedeutet …',
     choices:['10 m Höhenverlust pro 1 m Strecke','1 m Höhenverlust pro 10 m Strecke','10° Gleitwinkel','10 m/s Sinkrate'],
     answer:1, explain:'Gleitzahl 1:10 = pro <b>1 m Höhenverlust 10 m</b> Strecke über Grund (bei Windstille). Den besten Wert liefert die Tangente an die Polare.'}
  ]
});
})();
