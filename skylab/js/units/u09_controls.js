/* Unit 09 — Steueranlagen: Achsen & Ruder (3D) */
(function(){
App.registerUnit({
  id:'controls', group:'Steuerung', n:9, ch:'Kap. 8', icon:'yaw',
  title:'Steuerung & Achsen',
  subtitle:'Querruder, Höhenruder, Seitenruder — und die drei Achsen Rollen, Nicken, Gieren.',
  intro:'Jedes Ruder dreht das Flugzeug um eine der drei Achsen. Bewege die Ruder und sieh in 3D, wie das Flugzeug rollt, nickt oder giert. Die markierte Achse zeigt, worum es sich gerade dreht.',

  sim:function(ctx){
    var stage=ctx.stage, side=ctx.side;
    var st={ail:0, elev:0, rud:0};
    var att={roll:0,pitch:0,yaw:0}; // animated attitude
    var rc=UI.responsiveCanvas(stage,{height:400, animate:true, draw:draw, state:st});

    var ro=UI.readouts([
      {id:'ctrl',k:'Aktives Ruder',unit:''},{id:'axis',k:'Achse',unit:''},
      {id:'motion',k:'Bewegung',unit:''},{id:'angle',k:'Lage',unit:'°'}
    ]);
    stage.appendChild(ro.el);

    var cp=UI.controlPanel('Ruder');
    cp.appendChild(UI.slider({label:'Querruder (Steuer links/rechts)',min:-100,max:100,step:1,value:0,unit:'%',onInput:function(v){st.ail=v/100;upd();}}).el);
    cp.appendChild(UI.slider({label:'Höhenruder (Steuer ziehen/drücken)',min:-100,max:100,step:1,value:0,unit:'%',onInput:function(v){st.elev=v/100;upd();}}).el);
    cp.appendChild(UI.slider({label:'Seitenruder (Pedale)',min:-100,max:100,step:1,value:0,unit:'%',onInput:function(v){st.rud=v/100;upd();}}).el);
    var br=UI.el('div'); br.style.marginTop='8px';
    br.appendChild(UI.button('Neutral','sec',function(){ st.ail=st.elev=st.rud=0; cp.querySelectorAll('input').forEach(function(i){i.value=0;}); upd(); }));
    cp.appendChild(br);
    stage.appendChild(cp);

    function upd(){
      var mags=[{n:'Querruder',v:Math.abs(st.ail),ax:'Längsachse',mo:st.ail>0?'Rollen rechts':'Rollen links'},
                {n:'Höhenruder',v:Math.abs(st.elev),ax:'Querachse',mo:st.elev>0?'Nicken (Nase hoch)':'Nicken (Nase runter)'},
                {n:'Seitenruder',v:Math.abs(st.rud),ax:'Hochachse',mo:st.rud>0?'Gieren rechts':'Gieren links'}];
      mags.sort(function(a,b){return b.v-a.v;});
      var top=mags[0];
      if(top.v<0.02){ ro.set('ctrl','—'); ro.set('axis','—'); ro.set('motion','Neutral'); ro.set('angle','0'); }
      else{ ro.set('ctrl',top.n,'good'); ro.set('axis',top.ax); ro.set('motion',top.mo);
        var ang=top.n==='Querruder'?att.roll:(top.n==='Höhenruder'?att.pitch:att.yaw);
        ro.set('angle',(Phys.deg(ang)).toFixed(0)); }
    }

    // ---- 3D ----
    function rotX(p,a){var c=Math.cos(a),s=Math.sin(a);return[p[0],p[1]*c-p[2]*s,p[1]*s+p[2]*c];}
    function rotY(p,a){var c=Math.cos(a),s=Math.sin(a);return[p[0]*c+p[2]*s,p[1],-p[0]*s+p[2]*c];}
    function rotZ(p,a){var c=Math.cos(a),s=Math.sin(a);return[p[0]*c-p[1]*s,p[0]*s+p[1]*c,p[2]];}
    function attitude(p){ return rotZ(rotY(rotX(p,att.roll),att.pitch),att.yaw); }
    // camera
    var az=Phys.rad(38), el=Phys.rad(20);
    var d=[Math.cos(el)*Math.cos(az), Math.cos(el)*Math.sin(az), Math.sin(el)];
    function cross(a,b){return[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
    function norm(a){var l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l];}
    var right=norm(cross([0,0,1],d)), up=cross(d,right);
    function project(p, cx, cy, sc){
      var sx=p[0]*right[0]+p[1]*right[1]+p[2]*right[2];
      var sy=p[0]*up[0]+p[1]*up[1]+p[2]*up[2];
      var dep=-(p[0]*d[0]+p[1]*d[1]+p[2]*d[2]);
      return [cx+sx*sc, cy-sy*sc, dep];
    }

    // panels (body coords x fwd, y right, z up); hinge:{p,axis,defl()}
    function panels(){
      var P=[];
      // fuselage planform (top, z=-0.02)
      P.push({pts:[[2.7,0,0],[0.4,0.45,0],[-2.5,0.22,0],[-2.7,0,0],[-2.5,-0.22,0],[0.4,-0.45,0]],col:'#aebbcd'});
      // fuselage side (y=0)
      P.push({pts:[[2.7,0,0],[0.3,0,0.42],[-2.5,0,0.36],[-2.7,0,0.02],[-2.5,0,-0.18],[0.3,0,-0.2]],col:'#c3cdde'});
      // main wing
      P.push({pts:[[0.7,-3.2,0],[0.7,3.2,0],[-0.45,3.2,0],[-0.45,-3.2,0]],col:'#c9d2e0'});
      // ailerons (hinge at x=-0.2 spanwise)
      P.push({tag:'ailR',pts:[[-0.2,1.9,0.01],[-0.2,3.1,0.01],[-0.6,3.1,0.01],[-0.6,1.9,0.01]],hinge:{p:[-0.2,0,0],ax:'y',sgn:1}});
      P.push({tag:'ailL',pts:[[-0.2,-3.1,0.01],[-0.2,-1.9,0.01],[-0.6,-1.9,0.01],[-0.6,-3.1,0.01]],hinge:{p:[-0.2,0,0],ax:'y',sgn:-1}});
      // horizontal stab
      P.push({pts:[[-2.05,-1.15,0.04],[-2.05,1.15,0.04],[-2.5,1.15,0.04],[-2.5,-1.15,0.04]],col:'#c9d2e0'});
      // elevator
      P.push({tag:'elev',pts:[[-2.5,-1.15,0.04],[-2.5,1.15,0.04],[-2.78,1.15,0.04],[-2.78,-1.15,0.04]],hinge:{p:[-2.5,0,0],ax:'y',sgn:1}});
      // vertical fin (y=0 plane)
      P.push({pts:[[-2.0,0,0.05],[-2.0,0,1.05],[-2.5,0,1.05],[-2.5,0,0.05]],col:'#b4c0d2'});
      // rudder
      P.push({tag:'rud',pts:[[-2.5,0,0.08],[-2.5,0,1.05],[-2.8,0,1.05],[-2.8,0,0.08]],hinge:{p:[-2.5,0,0],ax:'z',sgn:1}});
      return P;
    }
    function hingeRot(p, h, defl){
      var v=[p[0]-h.p[0],p[1]-h.p[1],p[2]-h.p[2]];
      var r = h.ax==='y'?rotY(v,defl): (h.ax==='z'?rotZ(v,defl):rotX(v,defl));
      return [r[0]+h.p[0],r[1]+h.p[1],r[2]+h.p[2]];
    }

    function draw(c,W,H,t){
      // animate attitude toward control-driven targets
      var tRoll=st.ail*Phys.rad(50), tPitch=st.elev*Phys.rad(22), tYaw=st.rud*Phys.rad(28);
      att.roll+=(tRoll-att.roll)*0.12; att.pitch+=(tPitch-att.pitch)*0.12; att.yaw+=(tYaw-att.yaw)*0.12;
      // live attitude readout for the active axis
      var amag=Math.max(Math.abs(st.ail),Math.abs(st.elev),Math.abs(st.rud));
      if(amag>0.02){ var ang=Math.abs(st.ail)>=Math.max(Math.abs(st.elev),Math.abs(st.rud))?att.roll:(Math.abs(st.elev)>=Math.abs(st.rud)?att.pitch:att.yaw);
        ro.set('angle', Phys.deg(ang).toFixed(0)); }
      else ro.set('angle','0');

      var cx=W*0.42, cy=H*0.45, sc=Math.min(W*0.12, 58);
      // ground reference grid (horizon)
      c.fillStyle='#f4f8fd'; c.fillRect(0,0,W,H);

      // active axis line through aircraft
      var active = Math.abs(st.ail)>=Math.max(Math.abs(st.elev),Math.abs(st.rud)) && Math.abs(st.ail)>0.02 ? 'x'
        : (Math.abs(st.elev)>=Math.abs(st.rud) && Math.abs(st.elev)>0.02 ? 'y'
        : (Math.abs(st.rud)>0.02 ? 'z' : null));
      function axisLine(axis,col,len){
        var a=axis==='x'?[len,0,0]:axis==='y'?[0,len,0]:[0,0,len];
        var b=axis==='x'?[-len,0,0]:axis==='y'?[0,-len,0]:[0,0,-len];
        var pa=project(attitude(a),cx,cy,sc), pb=project(attitude(b),cx,cy,sc);
        c.strokeStyle=col; c.lineWidth=2.5; c.setLineDash([6,5]);
        c.beginPath();c.moveTo(pa[0],pa[1]);c.lineTo(pb[0],pb[1]);c.stroke();c.setLineDash([]);
      }
      // draw all three axes faint, active one highlighted
      axisLine('x', active==='x'?Plot.colors.orange:'#dde3ec', 4.2);
      axisLine('y', active==='y'?Plot.colors.orange:'#dde3ec', 4.2);
      axisLine('z', active==='z'?Plot.colors.orange:'#dde3ec', 3.0);

      // build & sort panels by depth
      var defl={ailR:st.ail*Phys.rad(24)*1, ailL:st.ail*Phys.rad(24)*-1, elev:st.elev*Phys.rad(22), rud:st.rud*Phys.rad(24)};
      var list=panels().map(function(pan){
        var pts=pan.pts.map(function(p){
          var q=p;
          if(pan.hinge){ q=hingeRot(p,pan.hinge, (pan.tag==='ailR'?defl.ailR:pan.tag==='ailL'?defl.ailL:pan.tag==='elev'?defl.elev:defl.rud)); }
          return project(attitude(q),cx,cy,sc);
        });
        var dep=pts.reduce(function(s,p){return s+p[2];},0)/pts.length;
        var col=pan.col || (Math.abs(pan.tag==='elev'?st.elev:pan.tag==='rud'?st.rud:st.ail)>0.02?Plot.colors.orange:'#9fb0c6');
        return {pts:pts,dep:dep,col:col};
      });
      list.sort(function(a,b){return a.dep-b.dep;});
      list.forEach(function(pan){
        c.beginPath(); pan.pts.forEach(function(p,i){i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]);}); c.closePath();
        c.fillStyle=pan.col; c.fill(); c.lineWidth=1; c.strokeStyle='rgba(40,55,80,.25)'; c.stroke();
      });

      // axis labels
      if(active){ var name=active==='x'?'Längsachse · ROLLEN':active==='y'?'Querachse · NICKEN':'Hochachse · GIEREN';
        Plot.text(c,name, cx, H*0.86, {color:Plot.colors.orange,font:'700 13px -apple-system',align:'center'}); }

      // right info: control mapping table
      var ix=W*0.66; if(ix<W-150){
        var rows=[['Querruder','Längsachse','Rollen',st.ail],['Höhenruder','Querachse','Nicken',st.elev],['Seitenruder','Hochachse','Gieren',st.rud]];
        Plot.text(c,'Primärwirkung der Ruder', ix, 34,{color:Plot.colors.ink,font:'700 13px -apple-system'});
        rows.forEach(function(r,i){
          var y=64+i*54; var on=Math.abs(r[3])>0.02;
          c.fillStyle=on?'#fff4e8':'#f7f9fc'; roundR(c,ix,y-20,W-ix-18,44,9); c.fill();
          if(on){c.strokeStyle=Plot.colors.orange;c.lineWidth=1.5;c.stroke();}
          Plot.text(c,r[0], ix+12, y-2,{color:on?Plot.colors.orange:Plot.colors.ink,font:'700 12.5px -apple-system'});
          Plot.text(c,r[1]+' → '+r[2], ix+12, y+15,{color:Plot.colors.ink2,font:'11.5px -apple-system'});
        });
      }
    }

    upd();
    side.appendChild(UI.tcard({tag:'3 Achsen', icon:'1', title:'Achsen & Primärwirkung',
      html:'<ul class="kfacts"><li><b>Längsachse</b> — Rollen — <b>Querruder</b></li><li><b>Querachse</b> — Nicken — <b>Höhenruder</b></li><li><b>Hochachse</b> — Gieren — <b>Seitenruder</b></li></ul>'+
           '<p>Alle drei Achsen schneiden sich im Schwerpunkt.</p>'}));
    side.appendChild(UI.tcard({tag:'Sekundär', icon:'2', title:'Negatives Wendemoment',
      html:'<p>Beim Rollen mit Querrudern erzeugt das nach unten ausschlagende Querruder (innenkurvenseitig hochgehender Flügel) <b>mehr Widerstand</b> als das nach oben ausschlagende. Die Nase giert kurz <b>gegen</b> die Kurve — das negative Wendemoment. Ausgleich: Differenzialquerruder, Frise-Ruder, koordiniertes Seitenruder.</p>'}));
    side.appendChild(UI.tcard({tag:'Sekundär', icon:'3', title:'Roll-Gier-Kopplung',
      html:'<p>Das Seitenruder giert nicht nur, sondern erzeugt durch die unterschiedliche Anströmung auch ein <b>Rollmoment</b> in dieselbe Richtung. Umgekehrt führt Schieben/Rollen zu Gieren. Längs- und Hochachse sind aerodynamisch gekoppelt.</p>'}));
    side.appendChild(UI.callout('Ruderausschlag erzeugt ein Moment, das das Flugzeug um die Achse dreht. Die Wirkung hängt vom <b>Staudruck</b> ab: bei niedriger Geschwindigkeit sind die Ruder „weicher".'));
    return {destroy:function(){rc.destroy();}};
  },

  theory:function(){return ''+
   '<h2>Die drei Achsen des Flugzeugs</h2>'+
   '<p>Alle Drehbewegungen beziehen sich auf drei gedachte Achsen, die sich im Schwerpunkt schneiden:</p>'+
   '<ul class="kfacts">'+
   '<li><b>Längsachse</b> (von der Nase zum Heck): Drehung = <b>Rollen</b> (Querneigung), bewirkt durch die <b>Querruder</b>.</li>'+
   '<li><b>Querachse</b> (von Flügelspitze zu Flügelspitze): Drehung = <b>Nicken</b>, bewirkt durch das <b>Höhenruder</b>.</li>'+
   '<li><b>Hochachse</b> (senkrecht nach oben/unten): Drehung = <b>Gieren</b>, bewirkt durch das <b>Seitenruder</b>.</li></ul>'+
   '<h2>Primärwirkung der Ruder</h2>'+
   '<p>Ein Ruderausschlag verändert die Wölbung des jeweiligen Leitwerks und erzeugt dort eine Auftriebsänderung — und damit ein Drehmoment um die zugehörige Achse. Beispiel Querruder: ein Flügel bekommt mehr, der andere weniger Auftrieb → das Flugzeug rollt.</p>'+
   '<h2>Sekundärwirkungen</h2>'+
   '<h3>Negatives Wendemoment</h3>'+
   '<p>Das nach unten ausschlagende Querruder erhöht nicht nur den Auftrieb, sondern auch den (induzierten) Widerstand dieses Flügels stärker als das nach oben ausschlagende. Dadurch giert die Nase kurzzeitig <b>entgegen</b> der eingeleiteten Rollrichtung. Konstruktive Abhilfen: Differenzialquerruder und Frise-Querruder; fliegerisch gleicht man mit dem Seitenruder aus (koordinierter Kurvenflug).</p>'+
   '<h3>Kopplung von Rollen und Gieren</h3>'+
   '<p>Das Seitenruder bewirkt primär Gieren, durch die geänderte Anströmung aber auch ein Rollmoment in dieselbe Richtung. Umgekehrt erzeugt eine Schiebebewegung über die V-Form der Flügel ein Rollmoment. Hoch- und Längsachse sind daher gekoppelt.</p>'+
   '<h2>Ruderausgleich</h2>'+
   '<p>Damit die Ruderkräfte für den Piloten beherrschbar bleiben, werden Ruder aerodynamisch (vorgelagerte Fläche, Hornausgleich) und durch Masse ausgeglichen. <b>Trimmruder</b> halten eine Ruderstellung kräftefrei.</p>';
  },

  quiz:[
    {q:'Um welche Achse dreht das Flugzeug beim Betätigen der Querruder?',
     choices:['Querachse','Längsachse','Hochachse','Schwerpunktachse'],
     answer:1, explain:'Querruder bewirken <b>Rollen um die Längsachse</b> (Drehung um die Achse Nase–Heck).'},
    {q:'Welches Ruder steuert das Nicken um die Querachse?',
     choices:['Querruder','Seitenruder','Höhenruder','Trimmruder'],
     answer:2, explain:'Das <b>Höhenruder</b> bewirkt das Nicken (Nase hoch/runter) um die Querachse.'},
    {q:'Was versteht man unter dem negativen Wendemoment?',
     choices:['Die Nase giert in die eingeleitete Kurve','Die Nase giert beim Rollen kurz entgegen der Kurvenrichtung','Das Flugzeug nickt beim Rollen','Der Auftrieb verschwindet'],
     answer:1, explain:'Das abwärts ausschlagende Querruder erzeugt mehr Widerstand → die Nase giert kurz <b>entgegen</b> der Rollrichtung. Ausgleich mit Seitenruder.'},
    {q:'Welche Sekundärwirkung hat das Seitenruder?',
     choices:['Es bewirkt zusätzlich ein Rollmoment in dieselbe Richtung','Es bewirkt zusätzlich Nicken','Es hat keine Sekundärwirkung','Es verringert den Auftrieb'],
     answer:0, explain:'Das Seitenruder giert primär, erzeugt aber durch die geänderte Anströmung auch ein <b>Rollmoment</b> in dieselbe Richtung (Roll-Gier-Kopplung).'},
    {q:'Wovon hängt die Wirksamkeit der Ruder ab?',
     choices:['Nur von der Grösse des Ausschlags','Vom Staudruck (Geschwindigkeit)','Nur von der Höhe','Vom Gewicht'],
     answer:1, explain:'Die Ruderwirkung beruht auf einer Auftriebsänderung und hängt damit vom <b>Staudruck</b> ab — bei geringer Geschwindigkeit sind die Ruder „weicher".'}
  ]
});
function roundR(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
})();
