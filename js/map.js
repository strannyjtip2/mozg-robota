(function(){
'use strict';
const App=window.App,$=App.$;
const POS=[[28,88],[68,75],[30,62],[68,49],[30,36],[68,23],[32,10]];
const IS=[
 {id:'i1',n:'Нейрон-вышибала',ic:'friends',c:['45,226,230','#2de2e6','#0b6f86']},
 {id:'i2',n:'Учитель-подсказчик',ic:'bulb',c:['178,107,255','#b26bff','#5b2fb8']},
 {id:'i3',n:'Фабрика слоёв',ic:'brain',c:['255,166,61','#ffa63d','#b3520c']},
 {id:'i4',n:'Нарисуй цифру',ic:'wand',c:['255,90,138','#ff5a8a','#8f1d4a']},
 {id:'i5',n:'Глаз робота',ic:'smile',c:['77,240,168','#4df0a8','#0b7a52']},
 {id:'i6',n:'Как болтает чат-бот',ic:'chat',c:['90,150,255','#5a96ff','#1d3fa8']},
 {id:'i7',n:'Ловушки данных',ic:'warn',c:['255,201,61','#ffc93d','#a87400']}
];
let uid=0;
function art(it,locked,k){
 const u='g'+(uid++),[rgb,main,dark]=it.c;
 const top=locked?['#6a72a8','#3d4272']:[main,dark];
 return `<svg class="art" viewBox="0 0 150 138" style="${locked?'filter:saturate(.25) brightness(.85)':''}">
 <defs>
  <linearGradient id="${u}r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4b4f9c"/><stop offset=".55" stop-color="#2a2c68"/><stop offset="1" stop-color="#14153f"/></linearGradient>
  <linearGradient id="${u}t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top[0]}"/><stop offset="1" stop-color="${top[1]}"/></linearGradient>
  <radialGradient id="${u}o" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="${locked?'#9aa0cc':main}"/><stop offset="1" stop-color="${locked?'#3a3f72':dark}"/></radialGradient>
  <radialGradient id="${u}g"><stop offset="0" stop-color="rgb(${locked?'140,150,220':rgb})" stop-opacity=".55"/><stop offset="1" stop-color="rgb(${locked?'140,150,220':rgb})" stop-opacity="0"/></radialGradient>
 </defs>
 <ellipse cx="75" cy="124" rx="48" ry="9" fill="rgba(0,0,0,.35)"/>
 <ellipse cx="75" cy="62" rx="78" ry="46" fill="url(#${u}g)"/>
 <path d="M13 64 Q18 86 40 100 Q56 112 66 130 Q75 138 84 130 Q94 112 110 100 Q132 86 137 64 Z" fill="url(#${u}r)" stroke="rgba(160,170,255,.5)" stroke-width="1.5"/>
 <path d="M44 80 L52 98 M76 84 L74 112 M104 80 L98 100" stroke="rgba(160,170,255,.25)" stroke-width="2" stroke-linecap="round"/>
 <ellipse cx="75" cy="64" rx="63" ry="22" fill="url(#${u}t)" stroke="rgba(255,255,255,.55)" stroke-width="1.5"/>
 <ellipse cx="75" cy="60" rx="52" ry="14" fill="rgba(255,255,255,.18)"/>
 <circle cx="75" cy="40" r="30" fill="url(#${u}g)" opacity=".9"/>
 <circle cx="75" cy="40" r="22" fill="url(#${u}o)" stroke="rgba(255,255,255,.75)" stroke-width="1.5"/>
 <ellipse cx="68" cy="31" rx="9" ry="5" fill="rgba(255,255,255,.55)" transform="rotate(-25 68 31)"/>
 ${locked?`<g transform="translate(60 25) scale(1.25)" fill="rgba(20,22,60,.85)" stroke="#e6e9ff" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"><path d="${App.LOCK}"/></g>`
 :`<g transform="translate(62 27) scale(.99)" fill="none" stroke="#fff" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 0 2px rgba(0,0,0,.45))"><path d="${App.IC[it.ic]}"/></g>`}
 <circle cx="25" cy="60" r="2.6" fill="#fff" opacity=".8"/><circle cx="124" cy="66" r="2" fill="#fff" opacity=".6"/><circle cx="104" cy="58" r="1.6" fill="rgba(${locked?'200,200,240':rgb},.9)"/>
</svg>`}
App.mapState=()=>{
 const s=id=>App.stars(id);
 return {open:[true,s('i1')>0,s('i2')>0,false,false,false,false]};
};
App.screens.map=function(root){
 const st=App.mapState(),total=App.totalStars();
 const nextIdx=(()=>{for(let i=0;i<3;i++)if(st.open[i]&&App.stars(IS[i].id)<3)return i;return -1})();
 let hello;
 if(!total)hello='Привет! Я <b>Бип</b>. Давай соберём мой мозг: остров за островом!';
 else if(nextIdx<0)hello='Ты прошёл все открытые острова! Загляни в <b>Академию</b>: там про чат-ботов вроде меня.';
 else hello=`Продолжим? Следующий: <b>${IS[nextIdx].n}</b>. Ты собрал ${total} ${total==1?'звезду':total<5?'звезды':'звёзд'}!`;
 let paths='';
 for(let i=0;i<6;i++){const a=POS[i],b=POS[i+1],my=(a[1]+b[1])/2,cls=st.open[i+1]?'flow':'';
  const col=st.open[i+1]?'rgba(45,226,230,.95)':'rgba(150,160,230,.35)';
  paths+=`<path d="M${a[0]} ${a[1]-6} C${a[0]} ${my},${b[0]} ${my},${b[0]} ${b[1]-6}" fill="none" stroke="${col}" stroke-width="3.2" stroke-linecap="round" vector-effect="non-scaling-stroke" class="${cls}" style="filter:drop-shadow(0 0 5px ${col})"/>`}
 root.innerHTML=`<div class="hero"><div class="tt"><div class="logo">Мозг<br>робота</div><div class="logo-sub">${App.icon('brain')}</div></div><div class="mrobot">${App.robot('happy')}</div></div>
 <div class="hbub"><div class="bubble"><span class="t" id="hb">${hello}</span></div></div>
 <div class="map"><svg class="path" viewBox="0 0 100 100" preserveAspectRatio="none">${paths}</svg>
 ${IS.map((it,i)=>{const open=st.open[i],cur=i===nextIdx,s=App.stars(it.id);return `<div class="isl ${open?'':'lock'} ${cur?'cur':''}" data-i="${i}" style="left:${POS[i][0]}%;top:${POS[i][1]}%">${art(it,!open,i)}<div class="nm">${it.n}</div>${open?`<div class="stars">${App.starsHTML(s)}</div>`:`<div class="soon">${i<3?'закрыто':'скоро'}</div>`}</div>`}).join('')}
 </div>
 <div class="playwrap"><button class="btn pulse" id="play">${App.icon('play')}${total?'Продолжить':'Играть'}</button></div>`;
 const hb=$('#hb',root);
 root.querySelectorAll('.isl').forEach(el=>el.onclick=()=>{
  const i=+el.dataset.i,it=IS[i];App.snd.click();
  if(st.open[i]){App.go('/'+it.id);return}
  el.classList.remove('shake');void el.offsetWidth;el.classList.add('shake');App.snd.bad();
  hb.innerHTML=i<3?`Остров «${it.n}» откроется, когда ты получишь хотя бы одну звезду на острове «${IS[i-1].n}».`:`Остров «${it.n}» ещё строится. <b>Скоро</b> откроется!`;
 });
 $('#play',root).onclick=()=>{App.snd.click();App.go(nextIdx>=0?'/'+IS[nextIdx].id:'/academy')};
 return{destroy(){}};
};
})();
