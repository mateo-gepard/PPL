/* ============================================================
   Quiz engine — exam-style single/multiple choice with
   immediate feedback, explanations, scoring.
   ============================================================ */
(function(){
const Quiz = {};
var LETTERS=['A','B','C','D','E','F'];

/* render(container, questions, opt)
   question: {q, choices:[...], answer:Index|[indices], explain, img}
   opt: {onComplete(pct,correct,total), title, shuffle} */
Quiz.render = function(container, questions, opt){
  opt=opt||{};
  var qs = opt.shuffle ? shuffle(questions.slice()) : questions.slice();
  var idx=0, correctCount=0, answered=[];
  var root=document.createElement('div'); root.className='quiz';
  container.innerHTML=''; container.appendChild(root);

  function draw(){
    if(idx>=qs.length){ return result(); }
    var q=qs[idx];
    var multi = Array.isArray(q.answer);
    root.innerHTML='';
    var head=el('div','quiz-head');
    head.appendChild(el('div','qprog','Frage '+(idx+1)+' / '+qs.length));
    head.appendChild(el('div','chip blue', (multi?'Mehrfachauswahl':'Einfachauswahl')));
    root.appendChild(head);
    var bar=el('div','qbar'); var bi=el('i'); bi.style.width=(idx/qs.length*100)+'%'; bar.appendChild(bi); root.appendChild(bar);

    var card=el('div','qcard');
    card.appendChild(el('div','qnum','Aufgabe '+(idx+1)));
    card.appendChild(el('div','qtext',q.q));
    if(q.img){ var im=el('div'); im.style.cssText='margin:0 0 16px'; im.innerHTML=q.img; card.appendChild(im); }
    var ch=el('div','choices');
    var picked = multi ? [] : null;
    var locked=false;
    q.choices.forEach(function(text,i){
      var c=el('div','choice'); c.dataset.i=i;
      var k=el('div','ck',LETTERS[i]); var t=el('div',null,text);
      c.appendChild(k); c.appendChild(t);
      c.addEventListener('click',function(){
        if(locked) return;
        if(multi){
          var p=picked.indexOf(i);
          if(p<0){picked.push(i);c.classList.add('correct');c.querySelector('.ck').style.cssText='';}
          else{picked.splice(p,1);c.classList.remove('correct');}
          // for multi we just highlight selection (blue) — recolor on submit
          c.style.borderColor = picked.indexOf(i)<0 ? '' : 'var(--accent)';
          c.style.background  = picked.indexOf(i)<0 ? '' : 'var(--accent-soft)';
          c.classList.remove('correct');
          submitBtn.style.display = picked.length?'inline-block':'none';
        } else {
          picked=i; lock(i);
        }
      });
      ch.appendChild(c);
    });
    card.appendChild(ch);
    var ex=el('div','explain'); card.appendChild(ex);
    root.appendChild(card);

    var foot=el('div','quiz-foot');
    var spacer=el('div'); foot.appendChild(spacer);
    var submitBtn=el('button','btn','Prüfen'); submitBtn.style.display='none';
    var nextBtn=el('button','btn','Weiter →'); nextBtn.style.display='none';
    if(multi) foot.appendChild(submitBtn);
    foot.appendChild(nextBtn);
    root.appendChild(foot);

    submitBtn.addEventListener('click',function(){ if(!locked) gradeMulti(); });
    nextBtn.addEventListener('click',function(){ idx++; draw(); });

    function lock(sel){
      locked=true;
      var correct = q.answer;
      var nodes=ch.querySelectorAll('.choice');
      nodes.forEach(function(n){ n.classList.add('disabled'); n.style.cssText='';
        var i=+n.dataset.i;
        if(i===correct)n.classList.add('correct');
        if(i===sel&&sel!==correct)n.classList.add('wrong');
      });
      var ok = sel===correct;
      if(ok)correctCount++; answered.push(ok);
      showExplain(ok);
      nextBtn.style.display='inline-block';
      if(idx===qs.length-1)nextBtn.textContent='Auswertung →';
    }
    function gradeMulti(){
      locked=true;
      var ans=q.answer.slice().sort().join(',');
      var got=picked.slice().sort().join(',');
      var ok = ans===got;
      var nodes=ch.querySelectorAll('.choice');
      nodes.forEach(function(n){ n.classList.add('disabled'); n.style.cssText=''; n.classList.remove('correct');
        var i=+n.dataset.i;
        var isAns=q.answer.indexOf(i)>=0, isPick=picked.indexOf(i)>=0;
        if(isAns)n.classList.add('correct');
        if(isPick&&!isAns)n.classList.add('wrong');
      });
      if(ok)correctCount++; answered.push(ok);
      submitBtn.style.display='none';
      showExplain(ok);
      nextBtn.style.display='inline-block';
      if(idx===qs.length-1)nextBtn.textContent='Auswertung →';
    }
    function showExplain(ok){
      ex.className='explain show '+(ok?'ok':'no');
      ex.innerHTML='<span class="ex-tag">'+(ok?'✓ Richtig':'✗ Falsch')+'</span>'+q.explain;
    }
  }

  function result(){
    var pct=Math.round(correctCount/qs.length*100);
    root.innerHTML='';
    var box=el('div','qcard quiz-result');
    box.appendChild(ring(pct));
    var pass = pct>=75;
    box.appendChild(el('h2',null, pass?'Bestanden! 🎉':'Weiter üben'));
    box.appendChild(el('p',null,'Du hast <b>'+correctCount+' von '+qs.length+'</b> Fragen richtig beantwortet ('+pct+'%). '+
      (pass?'Starke Leistung — du beherrschst dieses Thema.':'Schau dir die Theorie & Simulation nochmal an und versuche es erneut.')));
    var again=el('button','btn sec','↻ Wiederholen');
    again.addEventListener('click',function(){ idx=0;correctCount=0;answered=[];qs=opt.shuffle?shuffle(questions.slice()):questions.slice();draw(); });
    box.appendChild(again);
    root.appendChild(box);
    opt.onComplete&&opt.onComplete(pct,correctCount,qs.length);
  }

  function ring(pct){
    var size=130,r=56,cx=size/2, circ=2*Math.PI*r;
    var col = pct>=75?'#1f9d6b':(pct>=50?'#e8821e':'#d8533f');
    var wrap=el('div','score-ring');
    wrap.innerHTML='<svg viewBox="0 0 '+size+' '+size+'" width="'+size+'" height="'+size+'">'+
      '<circle cx="'+cx+'" cy="'+cx+'" r="'+r+'" fill="none" stroke="#eef1f6" stroke-width="11"/>'+
      '<circle cx="'+cx+'" cy="'+cx+'" r="'+r+'" fill="none" stroke="'+col+'" stroke-width="11" stroke-linecap="round" '+
      'stroke-dasharray="'+circ+'" stroke-dashoffset="'+(circ*(1-pct/100))+'" transform="rotate(-90 '+cx+' '+cx+')"/>'+
      '<text x="'+cx+'" y="'+(cx+2)+'" text-anchor="middle" dominant-baseline="middle" font-size="30" font-weight="700" fill="'+col+'">'+pct+'%</text></svg>';
    return wrap;
  }

  draw();
};

function el(t,c,h){var e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e;}
function shuffle(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}

window.Quiz=Quiz;
})();
