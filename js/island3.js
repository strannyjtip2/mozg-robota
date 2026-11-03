(function(){
'use strict';
const App=window.App,$=App.$;
const DS=[['blobs','Два пятна'],['xor','Крест'],['circle','Круг'],['moons','Луны']];
const MISS=[
 {id:'m1',t:'Раздели «Два пятна» (точность 95%+)',ds:'blobs'},
 {id:'m2',t:'Реши «Крест» (95%+) — тут нужно 2 и больше скрытых нейронов',ds:'xor',minH:2},
 {id:'m3',t:'Окружи «Круг» (95%+)',ds:'circle',minH:2},
 {id:'m4',t:'Разведи «Луны» (95%+)',ds:'moons',minH:2},
 {id:'m5',t:'Нарисуй свою задачу: добавь 4 точки и снова научи сеть (90%+)',custom:true}
];
const R=84;
App.screens.i3=function(root){
 root.innerHTML=App.topbar('Остров 3','Фабрика слоёв')+`
 <div class="stack">
 <div class="panel" style="padding:10px">
  <div class="tabs" id="dsb">${DS.map((d,i)=>`<button class="cp ${i?'':'on'}" data-d="${d[0]}">${d[1]}</button>`).join('')}</div>
  <div style="position:relative"><canvas class="plot" id="plot"></canvas>
   <span class="cp red on" style="position:absolute;left:8px;top:8px;padding:4px 10px;font-size:12px;pointer-events:none;background:rgba(8,10,36,.75)">● Красные</span>
   <span class="cp blue on" style="position:absolute;right:8px;top:8px;padding:4px 10px;font-size:12px;pointer-events:none;background:rgba(8,10,36,.75)">● Синие</span></div>
  <div class="row" style="margin-top:9px;gap:7px"><span class="lbl" style="flex:1">Тапни по полю:</span><button class="cp red on" data-c="0" style="padding:7px 12px">+ красная</button><button class="cp blue" data-c="1" style="padding:7px 12px">+ синяя</button></div>
 </div>
 <div class="row"><button class="btn teal grow" id="go">${App.icon('play')}Учить</button><button class="btn ghost" id="pa" style="padding:0 16px">${App.icon('pause')}</button><button class="btn ghost" id="rs" style="padding:0 16px">${App.icon('reset')}</button></div>
 <div id="mas"></div>
 <div class="panel" style="padding:8px 8px 10px"><canvas class="net" id="net"></canvas>
  <div class="stats" style="margin-top:6px"><div class="stat"><b id="ep">0</b><small>эпох</small></div><div class="stat"><b id="acc">0%</b><small>точность</small></div><div class="stat"><b id="ls">–</b><small>ошибка</small></div><canvas id="spark" style="width:84px;height:44px;flex:none;border-radius:12px;background:rgba(0,0,0,.32);border:1px solid var(--line)"></canvas></div></div>
 <div class="panel pur"><div class="row"><div class="grow"><h3>Скрытые нейроны</h3><div class="mut2">чем больше, тем хитрее форма границы</div></div><div class="stepper"><button id="hm">${App.icon('minus')}</button><b id="hn">4</b><button id="hp">${App.icon('plus')}</button></div></div></div>
 <div class="panel"><div class="row" style="margin-bottom:8px"><h3 class="grow">Задания острова</h3><span class="stars" id="isst"></span></div><div class="ms" id="ms"></div></div>
 </div>`;
 App.bindBack(root);
 const mas=App.mascot($('#mas',root));
 const plot=App.canvas($('#plot',root)),net=App.canvas($('#net',root)),spark=App.canvas($('#spark',root));
 const heat=document.createElement('canvas');heat.width=heat.height=R;const hctx=heat.getContext('2d'),img=hctx.createImageData(R,R);
 const M=App.d.i3;
 let ds='blobs',data=App.makeData(ds),H=4,seed=3,mlp=new App.MLP(H,seed),epoch=0,training=false,loss=0,acc=0,hist=[],added=0,sinceAdd=0,addClass=0,said={},dirty=true,probe=0,probeT=0,pa=[],pp=.5;
 function say(k,t,m){if(said[k])return;said[k]=1;mas.say(t,m)}
 function resetNet(msg){seed++;mlp=new App.MLP(H,seed);epoch=0;loss=0;hist=[];training=false;sinceAdd=0;said={};dirty=true;stats();btn()}
 function setDs(k){ds=k;data=App.makeData(k);added=0;App.$$('#dsb .cp',root).forEach(b=>b.classList.toggle('on',b.dataset.d===k));resetNet()}
 function btn(){$('#go',root).innerHTML=(training?App.icon('play')+'Учу…':App.icon('play')+(epoch?'Учить дальше':'Учить'));$('#go',root).classList.toggle('pulse',!training&&!epoch)}
 function stats(){acc=mlp.accuracy(data);$('#ep',root).textContent=epoch;$('#acc',root).textContent=Math.round(acc*100)+'%';$('#ls',root).textContent=epoch?loss.toFixed(2):'–'}
 function missions(){
  $('#ms',root).innerHTML=MISS.map((m,i)=>`<div class="mi ${M.missions.includes(m.id)?'done':''}"><span class="ck">${App.icon('check')}</span>${m.t}</div>`).join('');
  $('#isst',root).innerHTML=App.starsHTML(App.stars('i3'));
 }
 function check(){
  for(const m of MISS){
   if(M.missions.includes(m.id))continue;
   let ok=false;
   if(m.custom)ok=added>=4&&sinceAdd>=40&&acc>=.9;
   else ok=ds===m.ds&&added===0&&acc>=.95&&epoch>=25&&(!m.minH||H>=m.minH);
   if(ok){M.missions.push(m.id);App.save();missions();const s=App.starsFrom(M.missions.length,MISS.length);const g=App.setStars('i3',s);App.refreshStars();
    mas.say(m.custom?'<b>Ты сам придумал задачу — и сеть её решила!</b> Вот так и работает обучение на примерах.':`<b>Задание выполнено!</b> Точность ${Math.round(acc*100)}%. `+(M.missions.length===MISS.length?'Остров пройден!':'Выбери другую картинку сверху.'),'cheer');
    if(g)App.celebrate('Остров 3',g);else{App.snd.good();App.confetti(innerWidth/2,innerHeight*.35,45)}
    $('#isst',root).innerHTML=App.starsHTML(App.stars('i3'));break}
  }
 }
 /* controls */
 App.$$('#dsb .cp',root).forEach(b=>b.onclick=()=>{if(b.dataset.d!==ds){setDs(b.dataset.d);mas.say({blobs:'Два пятна можно разделить даже прямой линией. Нажми «Учить»!',xor:'«Крест»: красные в одних углах, синие в других. Одной прямой не хватит. Нужно несколько скрытых нейронов.',circle:'«Круг»: синие внутри, красные вокруг. Граница должна замкнуться.',moons:'«Луны» изогнуты. Сеть должна научиться гнуть границу.'}[ds],'think')}});
 App.$$('[data-c]',root).forEach(b=>b.onclick=()=>{addClass=+b.dataset.c;App.$$('[data-c]',root).forEach(x=>x.classList.toggle('on',x===b))});
 $('#go',root).onclick=()=>{training=true;btn();if(!epoch)mas.say('Смотри: сеть угадывает цвет каждой точки, ошибается и чуть-чуть меняет свои связи. Так много раз подряд!','happy')};
 $('#pa',root).onclick=()=>{training=false;btn()};
 $('#rs',root).onclick=()=>{resetNet();mas.say('Сеть забыла всё и начала с нуля. Связи получились другие, так что результат может отличаться!','think')};
 const setH=n=>{H=Math.max(1,Math.min(8,n));$('#hn',root).textContent=H;resetNet();if(H===1)mas.say('Один скрытый нейрон умеет рисовать только прямую границу. Попробуй на «Кресте» и сам увидишь.','think');else mas.say(`Теперь скрытых нейронов: <b>${H}</b>. Сеть сбросилась, нажми «Учить».`,'happy')};
 $('#hm',root).onclick=()=>setH(H-1);$('#hp',root).onclick=()=>setH(H+1);
 $('#plot',root).addEventListener('pointerdown',e=>{
  const r=e.target.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*2-1,y=1-(e.clientY-r.top)/r.height*2;
  if(data.length>=240)return;data.push({x:Math.max(-.97,Math.min(.97,x)),y:Math.max(-.97,Math.min(.97,y)),c:addClass});added++;sinceAdd=0;dirty=true;App.snd.blip(addClass?820:520);stats();
  if(added===1)mas.say('Новая точка! Нажми «Учить», и сеть подстроит границу под неё. Добавь ещё!','happy');
 });
 stats();btn();missions();
 mas.say('Это <b>настоящая нейросеть</b>: она учится прямо у тебя в телефоне. Нажми «Учить» и смотри, как граница между красными и синими точками сама находит форму.','happy');

 function drawHeat(){
  const d=img.data;
  for(let j=0;j<R;j++)for(let i=0;i<R;i++){
   const x=-1+2*(i+.5)/R,y=1-2*(j+.5)/R,p=mlp.forward(x,y),conf=Math.abs(2*p-1);
   const c=p>.5?[70,140,255]:[255,70,105],a=.1+.32*Math.pow(conf,.8),gl=Math.exp(-Math.pow((p-.5)/.07,2))*.95;
   const A=a+gl*(1-a);const g=[255,196,90];
   const k=(j*R+i)*4;for(let q=0;q<3;q++)d[k+q]=(c[q]*a+g[q]*gl*(1-a))/A;d[k+3]=A*255}
  hctx.putImageData(img,0,0)}
 function drawPlot(t){
  const ctx=plot.begin(),W=plot.w,Hh=plot.h;
  const bg=ctx.createLinearGradient(0,0,0,Hh);bg.addColorStop(0,'#0a0e36');bg.addColorStop(1,'#060824');
  ctx.save();ctx.beginPath();ctx.roundRect(0,0,W,Hh,18);ctx.clip();ctx.fillStyle=bg;ctx.fillRect(0,0,W,Hh);
  ctx.strokeStyle='rgba(130,150,255,.09)';ctx.lineWidth=1;for(let k=1;k<8;k++){ctx.beginPath();ctx.moveTo(W*k/8,0);ctx.lineTo(W*k/8,Hh);ctx.moveTo(0,Hh*k/8);ctx.lineTo(W,Hh*k/8);ctx.stroke()}
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(heat,0,0,W,Hh);
  const X=x=>(x+1)/2*W,Y=y=>(1-y)/2*Hh,rad=Math.max(5,W/50);
  for(const p of data){const red=p.c===0,rgb=red?'255,70,105':'70,140,255';App.glow(ctx,X(p.x),Y(p.y),rad*2.4,rgb,.5)}
  for(const p of data){const red=p.c===0,x=X(p.x),y=Y(p.y);const g=ctx.createRadialGradient(x-rad*.3,y-rad*.35,0,x,y,rad);g.addColorStop(0,red?'#ffc2cf':'#c2dcff');g.addColorStop(.5,red?'#ff5578':'#4d8bff');g.addColorStop(1,red?'#c9143f':'#1c46c9');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,rad,0,7);ctx.fill();
   if(((mlp.forward(p.x,p.y)>.5)?1:0)!==p.c){ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(x,y,rad+3,0,7);ctx.stroke()}}
  // probe ring
  const pr=data[probe%Math.max(1,data.length)];if(pr){const k=(t/1000*2)%1,x=X(pr.x),y=Y(pr.y);ctx.strokeStyle=`rgba(255,255,255,${.9*(1-k)})`;ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,rad+3+k*16,0,7);ctx.stroke()}
  ctx.restore();ctx.strokeStyle='rgba(150,165,255,.4)';ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(.75,.75,W-1.5,Hh-1.5,18);ctx.stroke();
 }
 function drawNet(t){
  const ctx=net.begin(),W=net.w,Hh=net.h,top=34,bot=Hh-24;
  const xs=[W*.15,W*.5,W*.82],ins=[0,1].map(i=>({x:xs[0],y:top+(bot-top)*(.3+.4*i)}));
  const hid=[...Array(H)].map((_,j)=>({x:xs[1],y:top+(bot-top)*(H===1?.5:(j/(H-1)))*.94+(bot-top)*.03})),out={x:xs[2],y:(top+bot)/2};
  ctx.font='900 12.5px Nunito';ctx.textAlign='center';ctx.textBaseline='middle';
  [['Входной слой','#2de2e6',xs[0]],['Скрытый слой','#c58bff',xs[1]],['Выходной слой','#ffa63d',xs[2]]].forEach(([s,c,x])=>{ctx.fillStyle=c;ctx.shadowColor=c;ctx.shadowBlur=8;ctx.fillText(s,x,13);ctx.shadowBlur=0});
  const wire=(a,b,w,ph,delay)=>{
   const m=Math.min(1,Math.abs(w)/2.5),rgb=w>=0?'45,226,230':'255,120,90';
   ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(${rgb},${.14+.5*m})`;ctx.lineWidth=.6+m*3.6;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.bezierCurveTo((a.x+b.x)/2,a.y,(a.x+b.x)/2,b.y,b.x,b.y);ctx.stroke();
   const sp=training?1:.25;
   if(m>.12){let u=((t/1000)*.9*sp+ph+delay)%1;const x0=a.x,y0=a.y,x1=b.x,y1=b.y,mx=(x0+x1)/2,e=u,bx=(1-e)**3*x0+3*(1-e)**2*e*mx+3*(1-e)*e*e*mx+e**3*x1,by=(1-e)**3*y0+3*(1-e)**2*e*y0+3*(1-e)*e*e*y1+e**3*y1;App.glow(ctx,bx,by,4+m*5,rgb,(training?.95:.45)*Math.sin(Math.PI*u))}
   ctx.globalCompositeOperation='source-over'};
  for(let j=0;j<H;j++){for(let k=0;k<2;k++)wire(ins[k],hid[j],mlp.W1[j][k],(j*.37+k*.21)%1,0);wire(hid[j],out,mlp.W2[j],(j*.29)%1,.5)}
  const node=(p,r,rgb,b,label)=>{App.glow(ctx,p.x,p.y,r*(1.8+2*b),rgb,.35+.5*b);const g=ctx.createRadialGradient(p.x-r*.3,p.y-r*.35,1,p.x,p.y,r);g.addColorStop(0,'#fff');g.addColorStop(.35,`rgb(${rgb})`);g.addColorStop(1,'rgba(10,10,50,.95)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,r,0,7);ctx.fill();ctx.strokeStyle=`rgba(${rgb},${.6+.4*b})`;ctx.lineWidth=2;ctx.stroke()};
  const pt=data[probe%Math.max(1,data.length)]||{x:0,y:0,c:0};
  ins.forEach((p,i)=>{node(p,13,'45,226,230',.5+.5*Math.abs(i?pt.y:pt.x));ctx.fillStyle='#04202e';ctx.font='900 12px Nunito';ctx.fillText(i?'y':'x',p.x,p.y+1)});
  hid.forEach((p,j)=>{const a=Math.abs(pa[j]||0);node(p,Math.max(8,Math.min(13,150/H/1.5)),(pa[j]||0)>=0?'178,107,255':'255,100,200',a)});
  const conf=Math.abs(2*pp-1);node(out,15,'255,166,61',conf);
  ctx.font='800 11px Nunito';ctx.fillStyle=pp>.5?'#9cc6ff':'#ff9db3';ctx.fillText(pp>.5?'синий '+Math.round(pp*100)+'%':'красный '+Math.round((1-pp)*100)+'%',out.x,out.y+27);
 }
 function drawSpark(){const ctx=spark.begin(),W=spark.w,Hh=spark.h;ctx.strokeStyle='rgba(255,166,61,.95)';ctx.lineWidth=2;ctx.lineJoin='round';ctx.shadowColor='rgba(255,166,61,.8)';ctx.shadowBlur=6;if(hist.length>1){const mx=Math.max(.7,...hist);ctx.beginPath();hist.forEach((v,i)=>{const x=4+(W-8)*i/(hist.length-1),y=Hh-5-(Hh-10)*Math.min(1,v/mx);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke()}ctx.shadowBlur=0;ctx.fillStyle='rgba(255,255,255,.4)';ctx.font='800 9px Nunito';ctx.textAlign='left';ctx.fillText('ошибка',5,10)}
 let frame=0;
 const stop=App.loop((t,dt)=>{
  frame++;
  if(training){for(let s=0;s<2;s++){loss=mlp.step(data,.018);epoch++;sinceAdd++}dirty=true;if(epoch%4===0){hist.push(loss);if(hist.length>140)hist.shift()}
   if(frame%3===0){stats();check();
    if(epoch>60)say('a','Видишь? Граница между красным и синим <b>сама изгибается</b> и подстраивается под точки. Это и есть обучение!','cheer');
    if(epoch>180&&H===1&&ds!=='blobs'&&acc<.85)say('b','Один нейрон рисует только <b>прямую</b>. Здесь так не получится. Нажми <b>+</b>, добавь скрытых нейронов и учи снова!','think');
    if(acc>=.95&&epoch>40)say('c','Сеть правильно угадывает почти все точки! Белые кольца показывают, где она ещё ошибается.','cheer');
    if(epoch>=4000){training=false;btn()}
   }}
  if(frame%2===0&&dirty){drawHeat();dirty=false}
  probeT+=dt;if(probeT>1){probeT=0;probe=Math.floor(Math.random()*data.length)}
  if(frame%2===0){pa=new Array(H);pp=mlp.forward((data[probe]||{x:0}).x,(data[probe]||{y:0}).y,pa)}
  drawPlot(t);drawNet(t);drawSpark();
 });
 drawHeat();
 return{destroy(){stop();plot.destroy();net.destroy();spark.destroy()}};
};
})();
