(function(){
'use strict';
const App=window.App,$=App.$;
const FE=[{k:'smile',n:'Улыбается',i:'smile'},{k:'gift',n:'С подарком',i:'gift'},{k:'known',n:'Знакомый',i:'friends'}];
App.FE=FE;
const COMBOS=[];for(let k=0;k<2;k++)for(let g=0;g<2;g++)for(let s=0;s<2;s++)COMBOS.push([s,g,k]);
App.COMBOS=COMBOS;
const TASKS=[
 {id:'explore',t:'Знакомство',text:'Нейрон-вышибала <b>складывает</b> важность признаков гостя. Если сумма <b>не меньше порога</b>, он пускает гостя. Включай и выключай признаки у гостя и смотри, что решит вышибала.',f:null,sol:null,hint:'Нажимай на карточки признаков: <b>улыбка</b>, <b>подарок</b>, <b>знакомый</b>. Сумма растёт, и когда доходит до порога, вышибала пускает.'},
 {id:'gift',t:'Только с подарком',text:'Правило вечеринки: <b>пускать только тех, кто пришёл с подарком</b>. Настрой веса и порог так, чтобы все 8 гостей получили верное решение.',f:(s,g,k)=>g,sol:[0,2,0,1],hint:'Важен только подарок. Поставь вес подарка побольше, а остальным дай <b>0</b>. Порог пусть будет меньше веса подарка.'},
 {id:'or',t:'Улыбка или подарок',text:'Теперь так: пускаем гостя, если он <b>улыбается ИЛИ пришёл с подарком</b> (достаточно одного). Знакомство не важно.',f:(s,g,k)=>s||g,sol:[1,1,0,1],hint:'Дай улыбке и подарку вес <b>1</b>, знакомому <b>0</b>. Хватит одной единички, значит порог поставь <b>1</b>.'},
 {id:'and',t:'Улыбка и подарок',text:'Строже: пускаем, только если гость <b>и улыбается, И пришёл с подарком</b>. Одного признака мало.',f:(s,g,k)=>s&&g,sol:[1,1,0,2],hint:'Веса те же, что в прошлом задании, но один признак теперь не проходит. Подними порог до <b>2</b>.'},
 {id:'boss',t:'Знакомые и чужие',text:'Главное задание! <b>Знакомых пускаем всегда.</b> Чужих — только если они <b>и улыбаются, и с подарком</b>.',f:(s,g,k)=>k||(s&&g),sol:[1,1,2,2],hint:'Знакомый должен пройти сам по себе: дай ему вес <b>2</b>, как у порога. Улыбка и подарок по <b>1</b> вместе тоже дают 2.'}
];
const NEED=(f,c)=>f?!!f(c[0],c[1],c[2]):null;

App.screens.i1=function(root){
 let ti=TASKS.findIndex(t=>!App.d.i1.done.includes(t.id));if(ti<0)ti=TASKS.length-1;
 root.innerHTML=App.topbar('Остров 1','Нейрон-вышибала')+`
 <div class="stack">
 <div class="panel"><div class="row" style="margin-bottom:8px"><span class="lbl" id="tn"></span><div class="pbar grow"><i id="pb"></i></div><span class="lbl" id="tc"></span></div><h3 id="tt" style="margin-bottom:4px"></h3><p class="mut2" style="color:#cfd6ff;font-size:14.5px;line-height:1.35" id="tx"></p></div>
 <div class="panel" id="guestp"></div>
 <div class="panel"><canvas class="nv"></canvas><div class="calc" id="calc"></div></div>
 <div class="panel teal" id="sliders"></div>
 <div id="mas"></div>
 <div class="row"><button class="btn ghost sm" id="hint">${App.icon('bulb')}Подсказка</button><button class="btn teal grow" id="next" disabled>Дальше</button></div>
 </div>`;
 App.bindBack(root);
 const st={w:[1,1,1],thr:2,sel:0,tog:[1,0,0],seen:{y:false,n:false},solved:false,hints:0};
 const nv=App.NeuronView($('canvas.nv',root),{icons:FE.map(f=>f.i),names:FE.map(f=>f.n)});
 const mas=App.mascot($('#mas',root),{text:''});
 const guestp=$('#guestp',root),slp=$('#sliders',root);
 // sliders
 slp.innerHTML=FE.map((f,i)=>`<div class="srow" data-i="${i}"><span class="si">${App.icon(f.i)}</span><div class="sbody"><div class="sl"><span>Вес: ${f.n.toLowerCase()}</span><output>1.0</output></div><input type="range" min="-3" max="3" step="0.5" value="1"></div></div>`).join('')+`<div class="srow thr" style="margin-top:8px"><span class="si">${App.icon('gear')}</span><div class="sbody"><div class="sl"><span>Порог</span><output>2.0</output></div><input type="range" min="0" max="5" step="0.5" value="2"></div></div>`;
 const inputs=App.$$('input',slp),outs=App.$$('output',slp),upd=inputs.map(App.slider);
 inputs.forEach((inp,i)=>inp.addEventListener('input',()=>{const v=+inp.value;if(i<3){st.w[i]=v;inp.parentNode.parentNode.parentNode.classList.toggle('neg',v<0)}else st.thr=v;outs[i].textContent=App.fmt(v);update(true)}));
 function setSliders(w,thr){inputs.forEach((inp,i)=>{const v=i<3?w[i]:thr;inp.value=v;outs[i].textContent=App.fmt(v);upd[i]();if(i<3)inp.parentNode.parentNode.parentNode.classList.toggle('neg',v<0)});st.w=w.slice();st.thr=thr}
 function T(){return TASKS[ti]}
 function guests(){return T().f?COMBOS:[st.tog]}
 function decide(c){return c[0]*st.w[0]+c[1]*st.w[1]+c[2]*st.w[2]>=st.thr-1e-9}
 function renderGuests(){
  const t=T();
  if(!t.f){guestp.innerHTML=`<div class="lbl" style="margin-bottom:8px">Гость у входа · нажимай на признаки</div><div class="tg">${FE.map((f,i)=>`<button data-t="${i}" class="${st.tog[i]?'on':''}">${App.icon(f.i)}<span>${f.n}</span></button>`).join('')}</div><div class="row c" style="margin-top:10px;gap:8px"><span class="cp ${st.seen.y?'on':''}">${st.seen.y?'✓':'○'} пустили гостя</span><span class="cp ${st.seen.n?'on':''}">${st.seen.n?'✓':'○'} не пустили</span></div>`;
   App.$$('[data-t]',guestp).forEach(b=>b.onclick=()=>{st.tog[+b.dataset.t]^=1;update(true);renderGuests()})}
  else{guestp.innerHTML=`<div class="lbl" style="margin-bottom:8px">8 гостей · нужно решить правильно про каждого</div><div class="gg">${COMBOS.map((c,i)=>{const need=NEED(t.f,c);return`<div class="guest" data-g="${i}"><span class="st"></span><div class="ic">${FE.map((f,j)=>App.icon(f.i,c[j]?'on':'')).join('')}</div><div class="need">нужно: <b>${need?'пустить':'нет'}</b></div></div>`}).join('')}</div>`;
   App.$$('.guest',guestp).forEach(g=>g.onclick=()=>{st.sel=+g.dataset.g;update(false)})}
 }
 function feats(){return T().f?COMBOS[st.sel]:st.tog}
 function update(sound){
  const t=T(),c=feats();nv.set({x:c.slice(),w:st.w.slice(),thr:st.thr});
  const s=c.reduce((a,x,i)=>a+x*st.w[i],0),out=s>=st.thr-1e-9;
  $('#calc',root).innerHTML=`${c.map((x,i)=>`<span class="t">${x}×${App.fmt(st.w[i])}</span>`).join(' + ')} = <b>${App.fmt(s)}</b> ${out?'≥':'<'} порог <b>${App.fmt(st.thr)}</b> → <b class="${out?'ok':'no'}">${out?'пускаем!':'не пускаем'}</b>`;
  if(sound)App.snd.tick();
  if(!t.f){if(out)st.seen.y=true;else st.seen.n=true;const ch=App.$$('.cp',guestp);if(ch[0]){ch[0].className='cp '+(st.seen.y?'on':'');ch[0].textContent=(st.seen.y?'✓':'○')+' пустили гостя';ch[1].className='cp '+(st.seen.n?'on':'');ch[1].textContent=(st.seen.n?'✓':'○')+' не пустили'}
   if(st.seen.y&&st.seen.n&&!st.solved)solve()}
  else{let all=true;App.$$('.guest',guestp).forEach((g,i)=>{const o=decide(COMBOS[i]),ok=o===NEED(t.f,COMBOS[i]);if(!ok)all=false;g.classList.toggle('good',ok);g.classList.toggle('bad',!ok);g.classList.toggle('sel',i===st.sel);g.querySelector('.st').innerHTML=App.icon(ok?'check':'cross')});
   if(all&&!st.solved)solve();else if(!all&&st.solved){st.solved=false;$('#next',root).disabled=true;$('#next',root).classList.remove('pulse')}}
 }
 function solve(){
  st.solved=true;const t=T();
  if(!App.d.i1.done.includes(t.id)){App.d.i1.done.push(t.id);App.save()}
  const done=App.d.i1.done.length,stars=App.starsFrom(done,TASKS.length);
  const last=ti===TASKS.length-1,all=done===TASKS.length;
  setTimeout(()=>{
   const g=App.setStars('i1',stars);
   if(all)mas.say('<b>Ура!</b> Ты настроил вышибалу и понял главное: нейрон <i>складывает признаки с весами</i> и сравнивает сумму с порогом. Так думает любая нейросеть!','cheer');
   else mas.say(t.f?'<b>Все 8 гостей решены верно!</b> Видишь, веса — это важность признака. Нажми «Дальше».':'<b>Отлично!</b> Ты увидел, как вышибало решает: сумма против порога. Дальше — задания.','cheer');
   if(g)App.celebrate('Остров 1',g);else{App.snd.good();App.confetti(innerWidth/2,innerHeight*.4,40)}
   App.refreshStars();$('#next',root).disabled=false;$('#next',root).classList.add('pulse');$('#next',root).textContent=last?'На карту':'Дальше';
  },t.f?450:150);
 }
 function load(){
  const t=T();st.solved=false;st.sel=0;st.seen={y:false,n:false};st.tog=[1,0,0];
  $('#tn',root).textContent='Задание '+(ti+1)+'/'+TASKS.length;$('#tc',root).textContent='';$('#pb',root).style.width=((ti+(App.d.i1.done.includes(t.id)?1:0))/TASKS.length*100)+'%';
  $('#tt',root).textContent=t.t;$('#tx',root).innerHTML=t.text;
  setSliders([1,1,1],t.f?2:1.5);if(!t.f)setSliders([1,1,1],1.5);
  renderGuests();update(false);
  $('#next',root).disabled=true;$('#next',root).classList.remove('pulse');$('#next',root).textContent='Дальше';
  mas.say(ti===0?'Привет! Я <b>РОБ</b>. Это нейрон-вышибала. Попробуй: включи гостю подарок и посмотри, что решит нейрон.':'Подвигай <b>ползунки весов</b> и <b>порога</b>. Цель — чтобы у всех гостей была зелёная галочка.', ti===0?'happy':'think');
  st.hints=0;
 }
 $('#next',root).onclick=()=>{if(ti<TASKS.length-1){ti++;load()}else App.go('/map')};
 $('#hint',root).onclick=()=>{const t=T();st.hints++;if(st.hints===1||!t.sol)mas.say(t.hint,'think');else{mas.say(`Вот ответ: веса <b>${t.sol.slice(0,3).map(App.fmt).join('; ')}</b>, порог <b>${App.fmt(t.sol[3])}</b>. Попробуй сам поставить!`,'happy');}};
 load();
 const stop=App.loop((t,dt)=>nv.draw(t,dt));
 return{destroy(){stop();nv.destroy()}};
};
})();
