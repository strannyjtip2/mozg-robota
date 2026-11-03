(function(){
'use strict';
const App=window.App,$=App.$,FE=App.FE,COMBOS=App.COMBOS;
const rule=c=>!!(c[2]||(c[0]&&c[1]));
App.screens.i2=function(root){
 root.innerHTML=App.topbar('Остров 2','Учитель-подсказчик')+`
 <div class="stack">
 <div class="panel pur"><div class="lbl" style="color:#d9b8ff;margin-bottom:4px">Правило учителя</div><p style="font-size:15px;line-height:1.35">Знакомых гостей пускаем всегда. <b>Чужих — только если они улыбаются и пришли с подарком.</b> Нейрон этого не знает: сначала он только угадывает. А ты — учитель.</p></div>
 <div class="panel"><div class="row" style="margin-bottom:6px"><span class="lbl">Новый гость</span><div class="grow"></div><div id="gcard" class="row" style="gap:6px"></div></div>
  <canvas class="nv"></canvas><div class="calc" id="calc"></div></div>
 <div class="row" id="vb"><button class="btn green grow" id="vr">${App.icon('check')}Верно</button><button class="btn red grow" id="vw">${App.icon('cross')}Ошибся</button></div>
 <div class="panel"><div class="stats"><div class="stat"><b id="acc">–</b><small>точность (10)</small></div><div class="stat"><b id="strk">0</b><small>подряд верно</small></div><div class="stat"><b id="ans">0</b><small>примеров</small></div></div><div class="dots" id="dots" style="margin-top:10px"></div></div>
 <div class="panel"><div class="ms" id="ms"></div></div>
 <div id="mas"></div>
 <div class="row"><button class="btn ghost sm grow" id="rst">${App.icon('reset')}Стереть память нейрона</button></div>
 </div>`;
 App.bindBack(root);
 const nv=App.NeuronView($('canvas.nv',root),{icons:FE.map(f=>f.i),names:FE.map(f=>f.n),outLabels:['Пускаю!','Не пускаю']});
 const mas=App.mascot($('#mas',root));
 const D=App.d.i2;
 let w,thr,hist,bag,cur,busy,streak;
 const LR=.5;
 function reset(){w=[0,0,0];thr=1;hist=[];bag=[];streak=0;busy=false;nv.dw=[0,0,0];nv.dthr=1;next(true);paint()}
 function nextGuest(){if(!bag.length)bag=App.shuffle(COMBOS.map((c,i)=>i));return COMBOS[bag.pop()]}
 const decide=c=>c[0]*w[0]+c[1]*w[1]+c[2]*w[2]>=thr-1e-9;
 function next(first){
  cur=nextGuest();busy=false;
  nv.set({x:cur.slice(),w:w.slice(),thr});
  $('#gcard',root).innerHTML=FE.map((f,i)=>`<span class="cp ${cur[i]?'on':''}" style="padding:4px 9px;font-size:12px">${f.n}</span>`).join('');
  const s=cur.reduce((a,x,i)=>a+x*w[i],0),g=decide(cur);
  $('#calc',root).innerHTML=`Сумма <b>${App.fmt(s)}</b> ${g?'≥':'<'} порог <b>${App.fmt(thr)}</b> → нейрон решил: <b class="${g?'ok':'no'}">${g?'ПУСКАТЬ':'НЕ ПУСКАТЬ'}</b>`;
  $('#vr',root).disabled=$('#vw',root).disabled=false;
  if(first&&!D.answered)mas.say('Нейрон пока ничего не знает: все веса равны нулю. Он решает, а <b>ты проверяешь по правилу</b> и нажимаешь «Верно» или «Ошибся».','happy');
 }
 function paint(){
  const last=hist.slice(-10),ok=last.filter(Boolean).length;
  $('#acc',root).textContent=last.length?Math.round(ok/last.length*100)+'%':'–';
  $('#strk',root).textContent=streak;$('#ans',root).textContent=hist.length;
  $('#dots',root).innerHTML=[...Array(10)].map((_,i)=>{const r=last[i-(10-last.length)];return`<i class="${r===undefined?'':r?'g':'r'}"></i>`}).join('');
  const f=D.flags;
  $('#ms',root).innerHTML=[['a','Проверь 10 примеров'],['b','8 из последних 10 — верно'],['c','8 верных ответов подряд']].map(([k,t])=>`<div class="mi ${f[k]?'done':''}"><span class="ck">${App.icon('check')}</span>${t}</div>`).join('');
  $('.stars',root);
 }
 function checkStars(){
  const last=hist.slice(-10),ok=last.filter(Boolean).length;
  let n=0;const f=D.flags;
  if(hist.length>=10&&!f.a){f.a=1;n++}
  if(hist.length>=10&&ok>=8&&!f.b){f.b=1;n++}
  if(streak>=8&&!f.c){f.c=1;n++}
  if(n){App.save();const s=(f.a?1:0)+(f.b?1:0)+(f.c?1:0);const g=App.setStars('i2',s);App.refreshStars();paint();
   if(f.c){mas.say('<b>Нейрон выучил правило!</b> Он сам научился решать, а ты только говорил ему «верно» и «ошибся». Так учатся настоящие нейросети: на ошибках.','cheer')}
   if(g)App.celebrate('Остров 2',g)}
 }
 function verdict(kind){
  if(busy)return;
  const target=rule(cur),guess=decide(cur),correct=target===guess;
  const claimRight=kind==='r';
  if(claimRight&&!correct){mas.say(`Проверь по правилу ещё раз! ${target?'Этого гостя <b>нужно пускать</b>':'Этого гостя <b>пускать нельзя</b>'}, а нейрон решил наоборот. Значит, он ошибся.`,'think');App.snd.bad();return}
  if(!claimRight&&correct){mas.say(`Хм, а нейрон тут как раз <b>прав</b>: по правилу гостя ${target?'надо пустить':'пускать нельзя'}. Посмотри на признаки ещё раз.`,'think');App.snd.bad();return}
  busy=true;$('#vr',root).disabled=$('#vw',root).disabled=true;
  hist.push(correct);D.answered++;
  if(correct){streak++;D.maxStreak=Math.max(D.maxStreak||0,streak);nv.ring('77,240,168');App.snd.good();mas.say(['Верно! Вес менять не нужно.','Угадал! Нейрон молодец.','Отлично, ничего не меняем.'][hist.length%3],'happy');paint();checkStars();setTimeout(()=>next(),900)}
  else{
   streak=0;const err=target?1:-1;nv.ring('255,84,112');App.snd.bad();
   mas.say(`Ошибка! Нейрон ${guess?'пустил лишнего':'не пустил нужного'}. Исправляем: ${err>0?'<b>увеличиваем</b> веса признаков этого гостя и <b>снижаем порог</b>':'<b>уменьшаем</b> веса признаков этого гостя и <b>поднимаем порог</b>'}.`,'oops');paint();
   setTimeout(()=>{
    cur.forEach((x,i)=>{if(x){w[i]+=LR*err;nv.pop(i,(err>0?'+':'−')+LR,err>0?'77,240,168':'255,120,90')}});
    thr-=LR*err;nv.pop(-1,(thr>=0?'':'')+'порог '+(err>0?'−':'+')+LR,'255,190,80');
    thr=Math.max(-3,Math.min(6,thr));
    nv.set({w:w.slice(),thr});App.snd.blip(err>0?700:420);
    const s=cur.reduce((a,x,i)=>a+x*w[i],0),g=decide(cur);
    $('#calc',root).innerHTML=`Теперь для этого гостя сумма <b>${App.fmt(s)}</b>, порог <b>${App.fmt(thr)}</b> → <b class="${g?'ok':'no'}">${g?'ПУСКАТЬ':'НЕ ПУСКАТЬ'}</b>`;
   },700);
   setTimeout(()=>next(),2300);
  }
 }
 $('#vr',root).onclick=()=>verdict('r');$('#vw',root).onclick=()=>verdict('w');
 $('#rst',root).onclick=()=>{reset();mas.say('Память стёрта. Нейрон снова ничего не знает. Научи его ещё раз!','happy')};
 reset();paint();
 const stop=App.loop((t,dt)=>nv.draw(t,dt));
 return{destroy(){stop();nv.destroy()}};
};
})();
