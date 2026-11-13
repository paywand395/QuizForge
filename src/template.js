'use strict';

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Escape JSON so it is safe inside an inline <script>.
const safeJson = (o) =>
  JSON.stringify(o).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

const UI = {
  en: { start: 'Start quiz', next: 'Next', finish: 'See score', retry: 'Try again', review: 'Review mistakes',
    of: 'of', score: 'Your score', correct: 'Correct!', wrong: 'Not quite.', question: 'Question', none: 'No mistakes. Perfect!' },
  ckb: { start: 'دەستپێکردن', next: 'دواتر', finish: 'بینینی ئەنجام', retry: 'دووبارە هەوڵبدەرەوە', review: 'پێداچوونەوە بە هەڵەکان',
    of: 'لە', score: 'ئەنجامەکەت', correct: 'دروستە!', wrong: 'هەڵەیە.', question: 'پرسیار', none: 'هیچ هەڵەیەک نییە. نایابە!' },
  ar: { start: 'ابدأ الاختبار', next: 'التالي', finish: 'عرض النتيجة', retry: 'حاول مجددًا', review: 'مراجعة الأخطاء',
    of: 'من', score: 'نتيجتك', correct: 'صحيح!', wrong: 'غير صحيح.', question: 'السؤال', none: 'لا أخطاء. ممتاز!' },
};

function pickUi(quiz) {
  const l = (quiz.lang || '').toLowerCase();
  if (UI[l]) return UI[l];
  if (l.startsWith('ar')) return UI.ar;
  if (['ku', 'ckb', 'sdh'].includes(l)) return UI.ckb;
  return UI.en;
}

function render(quiz, opts = {}) {
  const shuffle = opts.shuffle !== false;
  const ui = pickUi(quiz);
  const data = { quiz, ui, shuffle };
  return `<!DOCTYPE html>
<html lang="${esc(quiz.lang || (quiz.dir === 'rtl' ? 'ar' : 'en'))}" dir="${quiz.dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(quiz.title)}</title>
<style>
:root{--bg:#f4f7fc;--card:#fff;--ink:#14213d;--muted:#5b6b86;--blue:#1d4ed8;--blue2:#dbe7ff;--ok:#15803d;--okbg:#dcfce7;--bad:#b91c1c;--badbg:#fee2e2;--line:#d8e1f0}
@media(prefers-color-scheme:dark){:root{--bg:#0b1220;--card:#121c31;--ink:#e8eefc;--muted:#9fb0cf;--blue:#6ea0ff;--blue2:#1b2a4a;--ok:#4ade80;--okbg:#10351f;--bad:#f87171;--badbg:#3a1616;--line:#25344f}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font-family:"Noto Kufi Arabic","Segoe UI",system-ui,-apple-system,Roboto,sans-serif;line-height:1.6}
main{max-width:720px;margin:0 auto;padding:20px 16px 60px}
.card{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:22px;box-shadow:0 6px 24px rgba(20,33,61,.06)}
h1{font-size:1.5rem;margin:0 0 6px}
p.desc{color:var(--muted);margin:0 0 18px}
.bar{height:8px;background:var(--blue2);border-radius:99px;overflow:hidden;margin-bottom:6px}
.bar i{display:block;height:100%;width:0;background:var(--blue);transition:width .3s}
.meta{color:var(--muted);font-size:.9rem;margin-bottom:14px}
.q{font-size:1.2rem;font-weight:600;margin:0 0 16px}
.opt{display:block;width:100%;text-align:start;font:inherit;color:inherit;background:var(--card);border:2px solid var(--line);border-radius:12px;padding:12px 14px;margin:0 0 10px;cursor:pointer}
.opt:hover:not(:disabled){border-color:var(--blue)}
.opt:disabled{cursor:default}
.opt.ok{border-color:var(--ok);background:var(--okbg)}
.opt.bad{border-color:var(--bad);background:var(--badbg)}
.fb{margin:12px 0 0;padding:12px 14px;border-radius:12px;background:var(--blue2)}
.fb b{display:block}
button.main{font:inherit;font-weight:600;color:#fff;background:var(--blue);border:0;border-radius:12px;padding:12px 22px;margin-top:14px;cursor:pointer}
button.ghost{font:inherit;font-weight:600;color:var(--blue);background:transparent;border:2px solid var(--blue);border-radius:12px;padding:10px 20px;margin:14px 8px 0 0;cursor:pointer}
[dir=rtl] button.ghost{margin:14px 0 0 8px}
.score{font-size:3rem;font-weight:700;text-align:center;margin:10px 0}
.rev{border-top:1px solid var(--line);padding:12px 0}
.rev small{color:var(--muted)}
.hide{display:none}
.rev:first-of-type{margin-top:4px}
button.ghost+h1{margin-top:22px}
</style>
</head>
<body>
<main><div class="card" id="app"></div></main>
<script>
(function(){
var D=${safeJson(data)};var Q=D.quiz,UI=D.ui;
var app=document.getElementById('app');
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function shuf(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}return a}
var items,idx,score,wrong;
function prep(){items=Q.questions.map(function(q){
  var o=q.options.map(function(t,i){return{t:t,c:i===q.answer}});
  return{q:q.question,o:D.shuffle?shuf(o):o,e:q.explanation}});
  if(D.shuffle)items=shuf(items);idx=0;score=0;wrong=[]}
function intro(){app.innerHTML='';app.appendChild(el('h1',0,Q.title));
  if(Q.description)app.appendChild(el('p','desc',Q.description));
  app.appendChild(el('p','desc',Q.questions.length+' '+UI.question));
  var b=el('button','main',UI.start);b.onclick=function(){prep();show()};app.appendChild(b)}
function show(){app.innerHTML='';var it=items[idx];
  var bar=el('div','bar');var fill=el('i');fill.style.width=(idx/items.length*100)+'%';bar.appendChild(fill);app.appendChild(bar);
  app.appendChild(el('div','meta',UI.question+' '+(idx+1)+' '+UI.of+' '+items.length));
  app.appendChild(el('p','q',it.q));var done=false;var btns=[];
  it.o.forEach(function(o){var b=el('button','opt',o.t);btns.push(b);
    b.onclick=function(){if(done)return;done=true;
      btns.forEach(function(x,i){x.disabled=true;if(it.o[i].c)x.classList.add('ok')});
      var good=o.c;if(!good)b.classList.add('bad');
      if(good)score++;else wrong.push({q:it.q,a:it.o.filter(function(z){return z.c})[0].t,e:it.e});
      var fb=el('div','fb');fb.appendChild(el('b',0,good?UI.correct:UI.wrong));
      if(it.e)fb.appendChild(el('span',0,it.e));app.appendChild(fb);
      var nx=el('button','main',idx===items.length-1?UI.finish:UI.next);
      nx.onclick=function(){idx++;idx<items.length?show():end()};app.appendChild(nx)};
    app.appendChild(b)})}
function end(){app.innerHTML='';app.appendChild(el('h1',0,UI.score));
  app.appendChild(el('div','score',score+' / '+items.length+' ('+Math.round(score/items.length*100)+'%)'));
  var r=el('button','ghost',UI.retry);r.onclick=function(){prep();show()};app.appendChild(r);
  app.appendChild(el('h1',0,UI.review));
  if(!wrong.length)app.appendChild(el('p','desc',UI.none));
  wrong.forEach(function(w){var d=el('div','rev');d.appendChild(el('div',0,w.q));d.appendChild(el('small',0,'✔ '+w.a+(w.e?' — '+w.e:'')));app.appendChild(d)})}
intro();
})();
</script>
</body>
</html>
`;
}

module.exports = { render };
