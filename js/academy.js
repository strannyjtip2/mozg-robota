(function(){
'use strict';
const App=window.App,$=App.$;
const plural=(n,a,b,c)=>{const m=n%10,h=n%100;return h>10&&h<15?c:m==1?a:m>1&&m<5?b:c};
/* ---------- academy list ---------- */
App.screens.academy=function(root){
 const L=App.lessons,done=App.d.ac.done,n=done.length;
 const i3=App.stars('i3');
 root.innerHTML=`<header class="top"><div class="ttl" style="padding-left:4px"><small>Часть 2</small><b>Академия</b></div><div class="chip">${App.icon('cap')}<span>${n}/${L.length}</span></div></header>
 <div class="stack">
 <div id="mas"></div>
 ${i3?'':`<div class="panel pur" style="font-size:14px;line-height:1.35"><b style="color:var(--teal)">Совет:</b> сначала загляни на остров «Фабрика слоёв». Так будет проще понять, как учатся нейросети. Но уроки открыты всегда!</div>`}
 <div class="sec" style="margin-top:6px">Уроки</div>
 ${L.map((l,i)=>`<button class="lc ${done.includes(l.id)?'done':''}" data-id="${l.id}" style="--c:${l.bg};--bc:${l.bc};--ic:${l.col}"><div class="ico">${App.icon(l.icon)}</div><div style="min-width:0"><h3>${i+1}. ${l.title}</h3><p>${l.sub}</p></div><div class="tick">${App.icon('check')}</div></button>`).join('')}
 </div>`;
 const mas=App.mascot($('#mas',root),{text:n?`Молодец! Пройдено уроков: <b>${n}</b> из ${L.length}. Выбери следующий.`:'Теперь поговорим про <b>настоящие нейросети</b>: ChatGPT, Gemini и другие. Как они работают и как с ними дружить. Выбирай урок!'});
 root.querySelectorAll('.lc').forEach(b=>b.onclick=()=>App.go('/lesson/'+b.dataset.id));
 return{destroy(){}};
};
/* ---------- lesson engine ---------- */
App.demos={};
App.screens.lesson=function(root,id){
 const L=App.lessons,li=Math.max(0,L.findIndex(l=>l.id===id)),les=L[li];
 const steps=les.steps;let si=0,okState=false,demoObj=null,quizOk={};
 root.innerHTML=`<header class="top"><button class="ib" data-back aria-label="Назад">${App.icon('back')}</button><div class="ttl"><small>Урок ${li+1} из ${L.length}</small><b>${les.title}</b></div><div class="chip">${App.icon('cap')}<span>${App.d.ac.done.length}/${L.length}</span></div></header>
 <div class="stack"><div class="dots2" id="dots"></div><div class="panel" id="card"></div>
 <div class="row" id="nb"><button class="btn ghost" id="bk" style="padding:0 18px">${App.icon('back')}</button><button class="btn teal grow" id="nx">Дальше</button></div></div>`;
 App.bindBack(root,'/academy');
 const card=$('#card',root),nx=$('#nx',root),bk=$('#bk',root);
 const setOk=v=>{okState=v;nx.disabled=!v;nx.classList.toggle('pulse',!!v);const t=steps[si]&&steps[si].t;nx.textContent=v?(si===steps.length-1?'Завершить':'Дальше'):(t==='quiz'?'Выбери ответ':'Потрогай демо ↑')};
 function dots(){$('#dots',root).innerHTML=steps.map((s,i)=>`<i class="${i===si?'on':i<si?'done':''}"></i>`).join('')}
 function clean(){if(demoObj&&demoObj.destroy)demoObj.destroy();demoObj=null}
 function render(){
  clean();dots();card.style.animation='none';void card.offsetWidth;card.style.animation='';
  const s=steps[si];bk.style.visibility=si?'visible':'hidden';nx.textContent=si===steps.length-1?'Завершить':'Дальше';
  if(s.t==='text'){card.innerHTML=`<div class="card-t">${s.title}</div><div class="card-b">${s.html}</div>`;setOk(true)}
  else if(s.t==='demo'){card.innerHTML=`<div class="card-t">${s.title}</div><div class="card-b" style="margin-bottom:10px">${s.intro||''}</div><div id="demo"></div>`;setOk(!!quizOk['d'+si]);demoObj=App.demos[s.demo]($('#demo',card),{ok:()=>{quizOk['d'+si]=true;setOk(true)}})||{}}
  else if(s.t==='quiz'){
   const order=App.shuffle(s.o.map((t,i)=>i));let first=true;
   card.innerHTML=`<div class="lbl" style="color:var(--teal)">Мини-вопрос</div><div class="card-t" style="margin-top:4px">${s.q}</div><div id="opts">${order.map(i=>`<button class="opt" data-i="${i}">${s.o[i]}</button>`).join('')}</div><div id="ex"></div>`;
   setOk(!!quizOk['q'+si]);
   card.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{
    if(quizOk['q'+si]||b.classList.contains('no'))return;
    if(+b.dataset.i===s.a){quizOk['q'+si]=true;b.classList.add('ok');card.querySelectorAll('.opt').forEach(o=>{if(o!==b)o.classList.add('dim')});$('#ex',card).innerHTML=`<div class="expl"><b>${first?'Верно!':'Теперь верно!'}</b> ${s.why}</div>`;App.snd.good();
     const k=les.id+':'+si;if(first&&!App.d.ac.quiz[k]){App.d.ac.quiz[k]=1;App.save()}if(!first&&App.d.ac.quiz[k]===undefined){App.d.ac.quiz[k]=0;App.save()}setOk(true)}
    else{if(first){first=false;const k=les.id+':'+si;if(App.d.ac.quiz[k]===undefined){App.d.ac.quiz[k]=0;App.save()}}b.classList.add('no');App.snd.bad();$('#ex',card).innerHTML=`<div class="expl" style="border-color:rgba(255,84,112,.5);background:rgba(255,84,112,.1)">Почти! Подумай ещё и выбери другой ответ.</div>`}
   });
  }
 }
 function finish(){
  clean();dots();bk.style.visibility='hidden';
  const first=!App.d.ac.done.includes(les.id);if(first){App.d.ac.done.push(les.id);App.save();App.confetti(innerWidth/2,innerHeight*.35,70);App.snd.star()}
  const qs=steps.map((s,i)=>s.t==='quiz'?les.id+':'+i:null).filter(Boolean),good=qs.filter(k=>App.d.ac.quiz[k]===1).length;
  const nxt=L[li+1];
  card.innerHTML=`<div style="text-align:center"><div class="mrobot" style="width:130px;margin:0 auto">${App.robot('cheer')}</div><div class="card-t" style="font-size:24px;margin-top:6px">Урок пройден!</div><div class="card-b">${qs.length?`Ответов с первой попытки: <b>${good} из ${qs.length}</b>.<br>`:''}Вот главное, что стоит запомнить:</div></div><div class="expl" style="font-size:15px">${les.takeaway}</div>`;
  $('#nb',root).innerHTML=`<button class="btn ghost grow" id="toL">К урокам</button>${nxt?`<button class="btn teal grow" id="toN">Дальше</button>`:''}`;
  $('#toL',root).onclick=()=>App.go('/academy');if(nxt)$('#toN',root).onclick=()=>App.go('/lesson/'+nxt.id);
  App.refreshStars();
 }
 nx.onclick=()=>{if(!okState)return;if(si>=steps.length-1){finish();return}si++;render();window.scrollTo({top:0,behavior:'smooth'})};
 bk.onclick=()=>{if(si>0){si--;render()}};
 render();
 return{destroy(){clean()}};
};
/* ---------- awards ---------- */
App.screens.awards=function(root){
 const d=App.d,ac=d.ac.done,st=id=>App.stars(id),tot=App.totalStars();
 const B=[
  ['Первая звезда','star',tot>=1,'#ffc93d'],['Вышибала','friends',st('i1')>=3,'#2de2e6'],['Учитель','bulb',st('i2')>=3,'#b26bff'],['Архитектор','brain',st('i3')>=3,'#ffa63d'],
  ['Звездочёт','rocket',tot>=6,'#ff5a8a'],['Знаток LLM','chat',ac.includes('llm'),'#5a96ff'],['Промпт-мастер','wand',ac.includes('prompt'),'#b26bff'],['Проверяльщик','check',ac.includes('halluc'),'#4df0a8'],
  ['Страж данных','shield',ac.includes('safe'),'#2de2e6'],['Академик','cap',ac.length>=App.lessons.length,'#ffc93d']];
 const got=B.filter(b=>b[2]).length;
 root.innerHTML=`<header class="top"><div class="ttl" style="padding-left:4px"><small>Твои успехи</small><b>Награды</b></div><div class="chip">${App.icon('star')}<span>${tot}</span></div></header>
 <div class="stack"><div class="panel bigstat"><b>${tot}</b><div class="mut2" style="margin-top:2px">${plural(tot,'звезда','звезды','звёзд')} из 9 на островах</div></div>
 <div class="panel">${[['i1','Нейрон-вышибала'],['i2','Учитель-подсказчик'],['i3','Фабрика слоёв']].map(x=>`<div class="row" style="padding:5px 0"><span class="grow" style="font-weight:800">${x[1]}</span><span class="stars">${App.starsHTML(st(x[0]))}</span></div>`).join('')}
 <div class="row" style="padding:5px 0"><span class="grow" style="font-weight:800">Академия</span><span class="mut2">${ac.length} из ${App.lessons.length} уроков</span></div></div>
 <div class="sec" style="margin-top:6px">Значки · ${got} из ${B.length}</div>
 <div class="bgrid">${B.map(b=>`<div class="badge ${b[2]?'on':''}" style="--bc:${b[3]}"><div class="bi">${App.icon(b[1])}</div>${b[0]}</div>`).join('')}</div></div>`;
 return{destroy(){}};
};
/* ---------- settings ---------- */
App.screens.settings=function(root){
 root.innerHTML=`<header class="top"><div class="ttl" style="padding-left:4px"><small>Мозг робота</small><b>Ещё</b></div></header>
 <div class="stack">
 <button class="part ${App.d.sound?'on':''}" id="snd"><i class="sw"></i><div><b>Звук</b><span>Тихие звуки при нажатиях и победах</span></div></button>
 <div class="panel"><h3>О приложении</h3><p class="card-b" style="margin-top:6px;font-size:14.5px">«Мозг робота»: игра и мини-академия про нейросети для школьников. Всё работает прямо на твоём телефоне: ничего не отправляется в интернет, а прогресс хранится только здесь.</p></div>
 <div class="panel"><h3>Начать заново</h3><p class="mut2" style="margin:4px 0 10px">Сотрёт звёзды, значки и пройденные уроки.</p><button class="btn red sm" id="rst">${App.icon('reset')}Сбросить прогресс</button></div>
 </div>`;
 const s=$('#snd',root);s.onclick=()=>{App.d.sound=!App.d.sound;App.save();s.classList.toggle('on',App.d.sound);if(App.d.sound)App.snd.good()};
 const r=$('#rst',root);let armed=false,tm;
 r.onclick=()=>{if(!armed){armed=true;r.innerHTML=App.icon('warn')+'Точно? Нажми ещё раз';tm=setTimeout(()=>{armed=false;r.innerHTML=App.icon('reset')+'Сбросить прогресс'},3500);return}clearTimeout(tm);App.resetAll();App.toast('Прогресс сброшен','check');App.go('/map')};
 return{destroy(){clearTimeout(tm)}};
};
})();
