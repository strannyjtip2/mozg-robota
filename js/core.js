(function(){
'use strict';
const App=window.App={screens:{},cur:null};
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
App.$=$;App.$$=$$;
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));App.clamp=clamp;
App.lerp=(a,b,t)=>a+(b-a)*t;
App.rng=function(seed){let a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}};
App.shuffle=(arr,r=Math.random)=>{const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};

/* ---------- storage ---------- */
const KEY='mozg-robota-v1';
const DEF=()=>({stars:{},i1:{done:[]},i2:{answered:0,best:0,streak:0,maxStreak:0,flags:{}},i3:{missions:[]},ac:{done:[],quiz:{}},sound:true});
function load(){let d=DEF();try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s)for(const k in s){d[k]=(typeof s[k]==='object'&&s[k]&&!Array.isArray(s[k]))?Object.assign(d[k]||{},s[k]):s[k]}}catch(e){}return d}
App.d=load();
App.save=()=>{try{localStorage.setItem(KEY,JSON.stringify(App.d))}catch(e){}};
App.resetAll=()=>{App.d=DEF();App.save()};
App.stars=id=>App.d.stars[id]||0;
App.totalStars=()=>Object.values(App.d.stars).reduce((a,b)=>a+b,0);
App.setStars=(id,n)=>{const old=App.stars(id);if(n>old){App.d.stars[id]=n;App.save();return n-old}return 0};
App.starsFrom=(done,total)=>Math.min(3,Math.ceil(done*3/total));

/* ---------- sound ---------- */
const Snd=App.snd={ctx:null,
 init(){if(!this.ctx){try{this.ctx=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(this.ctx&&this.ctx.state==='suspended')this.ctx.resume()},
 tone(f,d=.12,type='sine',v=.05,delay=0,slide){if(!App.d.sound||!this.ctx)return;const c=this.ctx,t=c.currentTime+delay,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+d);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+d+.03)},
 click(){this.tone(620,.07,'triangle',.045)},
 tick(){this.tone(1000,.035,'square',.012)},
 good(){[523,659,784].forEach((f,i)=>this.tone(f,.2,'sine',.055,i*.08))},
 bad(){this.tone(240,.25,'sawtooth',.03,0,140)},
 star(){[784,988,1175,1568].forEach((f,i)=>this.tone(f,.22,'triangle',.05,i*.09))},
 blip(f=500){this.tone(f,.08,'sine',.035)}
};
document.addEventListener('pointerdown',()=>Snd.init(),{passive:true});
document.addEventListener('click',e=>{if(e.target.closest('button,.isl,.lc,.cp,.opt,.part,.guest'))Snd.click()},true);

/* ---------- icons ---------- */
const circ=(cx,cy,r)=>`M${cx-r} ${cy}a${r} ${r} 0 1 0 ${2*r} 0a${r} ${r} 0 1 0 ${-2*r} 0`;
const IC=App.IC={
 map:'M3 11l9-8 9 8M5 10v10h14V10M10 20v-6h4v6',
 cap:'M2 9l10-5 10 5-10 5zM6 11.5v4.5c0 1.5 3 3 6 3s6-1.5 6-3v-4.5M22 9v6',
 trophy:'M8 4h8v5a4 4 0 0 1-8 0zM8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4M12 13v3M8 20h8M9.5 16h5v4h-5z',
 gear:circ(12,12,3.2)+'M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1',
 back:'M15 5l-7 7 7 7',
 play:'M7 4.5v15l12-7.5z',
 pause:'M7 5h3.5v14H7zM13.5 5H17v14h-3.5z',
 reset:'M4 12a8 8 0 1 0 2.6-5.9M4 4v5h5',
 bulb:'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z',
 check:'M5 12.5l4.5 4.5L19 7.5',
 cross:'M6 6l12 12M18 6L6 18',
 plus:'M12 5v14M5 12h14',minus:'M5 12h14',
 smile:circ(12,12,9)+'M8.3 14c1 1.7 2.2 2.4 3.7 2.4s2.7-.7 3.7-2.4M9 9.6v.6M15 9.6v.6',
 gift:'M4 11h16v9H4zM3 7.5h18V11H3zM12 7.5V20M12 7.5C10.5 4 6.5 4 6.8 6.2c.2 1.4 2.8 1.3 5.2 1.3zM12 7.5c1.5-3.5 5.5-3.5 5.2-1.3-.2 1.4-2.8 1.3-5.2 1.3z',
 friends:circ(9,8,3.2)+circ(17,9,2.6)+'M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6M15.5 14.2c3 0 5.5 2 5.5 5.3',
 sound:'M4 9.5h3.5L12 6v12l-4.5-3.5H4zM15.5 9a4 4 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11',
 mute:'M4 9.5h3.5L12 6v12l-4.5-3.5H4zM16 9.5l5 5M21 9.5l-5 5',
 brain:'M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 5 1V5a2 2 0 0 0-2-1zM15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-5 1V5a2 2 0 0 1 2-1zM9 9h1.5M13.5 9H15M9 14h1.5M13.5 14H15',
 chat:'M4 5h16v11H11l-5 4v-4H4z M8 9.5h8M8 12.5h5',
 token:'M4 7h6v4H4zM12 7h8v4h-8zM4 13h9v4H4zM15 13h5v4h-5z',
 book:'M12 6c-2-1.5-5-2-8-1.5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5v-13C17 4 14 4.5 12 6zM12 6v13',
 warn:'M12 3l10 18H2zM12 10v5M12 17.8v.4',
 wand:'M4 20L16 8M14 4l1 2.2L17.2 7 15 8l-1 2.2L13 8l-2.2-1L13 6zM19 12l.6 1.4L21 14l-1.4.6L19 16l-.6-1.4L17 14l1.4-.6z',
 world:circ(12,12,9)+'M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18',
 shield:'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z M8.5 12l2.5 2.5L16 9.5',
 rocket:'M12 3c3 2 5 5.5 5 9l-2 3H9l-2-3c0-3.5 2-7 5-9zM9 15l-3 3 3 .5.5 3 3-3M15 15l3 3-3 .5-.5 3M12 9.5h.01',
 list:'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01'
};
const STAR='M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.5l-5.9 3.2 1.2-6.6L2.5 9.5l6.6-.9z';
const LOCK='M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3M12 14.5v2.5';
App.icon=(n,cls='')=>{if(n==='star')return`<svg class="${cls}" viewBox="0 0 24 24" fill="currentColor"><path d="${STAR}"/></svg>`;if(n==='play')return`<svg class="${cls}" viewBox="0 0 24 24" fill="currentColor"><path d="${IC.play}"/></svg>`;if(n==='pause')return`<svg class="${cls}" viewBox="0 0 24 24" fill="currentColor"><path d="${IC.pause}"/></svg>`;return`<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${IC[n]}"/></svg>`};
App.STAR=STAR;App.LOCK=LOCK;
App.starsHTML=n=>[0,1,2].map(i=>App.icon('star',i<n?'on':'')).join('');
// draw icon path onto canvas
App.drawIcon=(ctx,name,x,y,size,color,lw=2)=>{const p=App._p=App._p||{};const P=p[name]||(p[name]=new Path2D(IC[name]));const s=size/24;ctx.save();ctx.translate(x-size/2,y-size/2);ctx.scale(s,s);ctx.strokeStyle=color;ctx.lineWidth=lw;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke(P);ctx.restore()};

/* ---------- robot mascot ---------- */
function robot(mood='happy'){
 const cheer=mood==='cheer',think=mood==='think',oops=mood==='oops';
 let eyes,mouth;
 if(cheer){eyes=`<path d="M52 70q8-13 16 0M92 70q8-13 16 0" fill="none" stroke="#7ffbff" stroke-width="5.5" stroke-linecap="round" filter="url(#fGlow)"/>`;mouth=`<path d="M68 82q12 14 24 0z" fill="#7ffbff" stroke="#7ffbff" stroke-width="3" stroke-linejoin="round" filter="url(#fGlow)"/>`}
 else if(think){eyes=`<g class="eye"><ellipse cx="62" cy="64" rx="7.5" ry="10" fill="url(#gEye)" filter="url(#fGlow)"/><ellipse cx="98" cy="64" rx="7.5" ry="10" fill="url(#gEye)" filter="url(#fGlow)"/></g>`;mouth=`<path d="M72 85h16" stroke="#7ffbff" stroke-width="4" stroke-linecap="round" fill="none" filter="url(#fGlow)"/>`}
 else if(oops){eyes=`<g class="eye"><ellipse cx="62" cy="68" rx="7" ry="8.5" fill="url(#gEye)" filter="url(#fGlow)"/><ellipse cx="98" cy="68" rx="7" ry="8.5" fill="url(#gEye)" filter="url(#fGlow)"/></g>`;mouth=`<path d="M70 88q10-8 20 0" stroke="#7ffbff" stroke-width="4" stroke-linecap="round" fill="none" filter="url(#fGlow)"/>`}
 else{eyes=`<g class="eye"><ellipse cx="62" cy="67" rx="8" ry="11" fill="url(#gEye)" filter="url(#fGlow)"/><ellipse cx="98" cy="67" rx="8" ry="11" fill="url(#gEye)" filter="url(#fGlow)"/><circle cx="59.5" cy="62.5" r="2.6" fill="#fff"/><circle cx="95.5" cy="62.5" r="2.6" fill="#fff"/></g>`;mouth=`<path d="M70 83q10 9 20 0" stroke="#7ffbff" stroke-width="4" stroke-linecap="round" fill="none" filter="url(#fGlow)"/>`}
 const armL=cheer?`<g transform="rotate(-150 46 142)"><ellipse cx="38" cy="146" rx="9" ry="17" fill="url(#gBody)"/></g>`:`<ellipse cx="42" cy="146" rx="9" ry="17" fill="url(#gBody)" transform="rotate(14 42 146)"/>`;
 const armR=cheer?`<g transform="rotate(150 114 142)"><ellipse cx="122" cy="146" rx="9" ry="17" fill="url(#gBody)"/></g>`:`<ellipse cx="118" cy="146" rx="9" ry="17" fill="url(#gBody)" transform="rotate(-14 118 146)"/>`;
 return`<svg viewBox="0 0 160 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<defs>
<radialGradient id="gHead" cx=".35" cy=".22" r=".95"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#e3e9ff"/><stop offset="1" stop-color="#9aa8dc"/></radialGradient>
<radialGradient id="gBody" cx=".35" cy=".2" r=".95"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#d9e0fb"/><stop offset="1" stop-color="#8d9bd2"/></radialGradient>
<linearGradient id="gVisor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b2468"/><stop offset="1" stop-color="#070b2c"/></linearGradient>
<radialGradient id="gEye" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#f0ffff"/><stop offset=".5" stop-color="#6ff6ff"/><stop offset="1" stop-color="#18b8f0"/></radialGradient>
<linearGradient id="gPhone" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8af4ff"/><stop offset="1" stop-color="#1c8fd8"/></linearGradient>
<filter id="fGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<g class="ant"><line x1="80" y1="26" x2="80" y2="10" stroke="#aab6e8" stroke-width="3" stroke-linecap="round"/><circle cx="80" cy="8" r="6" fill="#6ff6ff" filter="url(#fGlow)"/></g>
<ellipse cx="80" cy="176" rx="38" ry="6" fill="#000" opacity=".25"/>
${armL}${armR}
<ellipse cx="80" cy="150" rx="35" ry="28" fill="url(#gBody)"/>
<circle cx="80" cy="152" r="10" fill="#0a1040" stroke="url(#gPhone)" stroke-width="3.5"/><circle cx="80" cy="152" r="4" fill="#6ff6ff" filter="url(#fGlow)"/>
<ellipse cx="19" cy="80" rx="12" ry="24" fill="#c6d0f5"/><ellipse cx="19" cy="80" rx="8" ry="18" fill="none" stroke="url(#gPhone)" stroke-width="4"/>
<ellipse cx="141" cy="80" rx="12" ry="24" fill="#c6d0f5"/><ellipse cx="141" cy="80" rx="8" ry="18" fill="none" stroke="url(#gPhone)" stroke-width="4"/>
<rect x="24" y="24" width="112" height="98" rx="46" fill="url(#gHead)" stroke="#fff" stroke-opacity=".5"/>
<ellipse cx="62" cy="34" rx="26" ry="7" fill="#fff" opacity=".7"/>
<rect x="36" y="40" width="88" height="62" rx="30" fill="url(#gVisor)" stroke="#5f6cc4" stroke-width="2"/>
<rect x="38" y="42" width="84" height="22" rx="11" fill="#fff" opacity=".07"/>
${eyes}${mouth}
${cheer?'<ellipse cx="50" cy="86" rx="6" ry="3.5" fill="#ff7aa8" opacity=".5"/><ellipse cx="110" cy="86" rx="6" ry="3.5" fill="#ff7aa8" opacity=".5"/>':''}
</svg>`}
App.robot=robot;
App.mascot=(parent,opts={})=>{
 const el=document.createElement('div');el.className='mbox'+(opts.right?' right':'');
 el.innerHTML=`<div class="mrobot">${robot(opts.mood||'happy')}</div><div class="bubble"><span class="t"></span></div>`;
 parent.appendChild(el);
 const api={el,mood:opts.mood||'happy',say(t,mood){const b=$('.bubble',el);b.innerHTML=`<span class="t">${t}</span>`;if(mood&&mood!==api.mood){api.mood=mood;$('.mrobot',el).innerHTML=robot(mood)}return api}};
 if(opts.text)api.say(opts.text);
 return api};

/* ---------- canvas helper ---------- */
App.canvas=c=>{const o={c,w:1,h:1,dpr:1,ctx:c.getContext('2d')};const upd=()=>{const r=c.getBoundingClientRect();o.dpr=Math.min(window.devicePixelRatio||1,2.5);o.w=Math.max(1,r.width);o.h=Math.max(1,r.height);c.width=Math.round(o.w*o.dpr);c.height=Math.round(o.h*o.dpr)};upd();let ro;if(window.ResizeObserver){ro=new ResizeObserver(upd);ro.observe(c)}o.begin=()=>{o.ctx.setTransform(o.dpr,0,0,o.dpr,0,0);o.ctx.clearRect(0,0,o.w,o.h);return o.ctx};o.destroy=()=>ro&&ro.disconnect();return o};
App.glow=(ctx,x,y,r,rgb,a=1)=>{const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${rgb},${a})`);g.addColorStop(.35,`rgba(${rgb},${a*.45})`);g.addColorStop(1,`rgba(${rgb},0)`);ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill()};

/* ---------- main loop ---------- */
const subs=new Set();let last=0;
App.loop=fn=>{subs.add(fn);return()=>subs.delete(fn)};
function frame(t){const dt=Math.min(.05,(t-last)/1000||.016);last=t;subs.forEach(f=>f(t,dt));requestAnimationFrame(frame)}
requestAnimationFrame(frame);

/* ---------- stars bg ---------- */
(function(){const c=$('#stars'),ctx=c.getContext('2d');let W,H,S=[];
 function rs(){const d=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;c.width=W*d;c.height=H*d;ctx.setTransform(d,0,0,d,0,0);const r=App.rng(7);S=Array.from({length:Math.round(W*H/5200)},()=>({x:r()*W,y:r()*H,r:r()*1.3+.3,p:r()*6.28,s:r()*1.4+.4,c:r()<.18?'160,255,250':r()<.3?'210,180,255':'255,255,255'}))}
 rs();addEventListener('resize',rs);let acc=0;
 App.loop((t,dt)=>{acc+=dt;if(acc<.05)return;acc=0;ctx.clearRect(0,0,W,H);for(const s of S){const a=.35+.65*(.5+.5*Math.sin(t/1000*s.s+s.p));ctx.fillStyle=`rgba(${s.c},${a*.9})`;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,7);ctx.fill()}})})();

/* ---------- confetti & toast ---------- */
const fx=$('#fx'),fctx=fx.getContext('2d');let parts=[];
function frs(){fx.width=innerWidth;fx.height=innerHeight}frs();addEventListener('resize',frs);
App.confetti=(x=innerWidth/2,y=innerHeight*.3,n=70)=>{const cols=['#2de2e6','#b26bff','#ffa63d','#ff5a8a','#ffc93d','#4df0a8'];for(let i=0;i<n;i++){const a=Math.random()*6.28,s=3+Math.random()*7;parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-4,r:3+Math.random()*4,c:cols[i%cols.length],rot:Math.random()*6,vr:(Math.random()-.5)*.4,life:1})}};
App.loop((t,dt)=>{if(!parts.length){return}fctx.clearRect(0,0,fx.width,fx.height);parts=parts.filter(p=>p.life>0&&p.y<fx.height+20);for(const p of parts){p.vy+=.22;p.x+=p.vx;p.y+=p.vy;p.vx*=.992;p.rot+=p.vr;p.life-=.007;fctx.save();fctx.translate(p.x,p.y);fctx.rotate(p.rot);fctx.globalAlpha=Math.max(0,Math.min(1,p.life*1.5));fctx.fillStyle=p.c;fctx.fillRect(-p.r,-p.r/2,p.r*2,p.r);fctx.restore()}if(!parts.length)fctx.clearRect(0,0,fx.width,fx.height)});
App.toast=(html,icon='star')=>{const t=document.createElement('div');t.className='tst';t.innerHTML=App.icon(icon)+'<span>'+html+'</span>';$('#toast').appendChild(t);setTimeout(()=>t.remove(),3100)};
App.celebrate=(msg,gained)=>{App.confetti();if(gained){Snd.star();App.toast(msg+(gained?` · +${gained} ${gained==1?'звезда':gained<5?'звезды':'звёзд'}`:''))}else{Snd.good();App.toast(msg,'check')}};
App.award=(id,n,msg)=>{const g=App.setStars(id,n);if(g)App.celebrate(msg,g);else{Snd.good();App.toast(msg,'check')}return g};

/* ---------- ui helpers ---------- */
App.topbar=(kicker,title)=>`<header class="top"><button class="ib" data-back aria-label="Назад">${App.icon('back')}</button><div class="ttl"><small>${kicker}</small><b>${title}</b></div><div class="chip">${App.icon('star')}<span id="tstars">${App.totalStars()}</span></div></header>`;
App.bindBack=(root,to='/map')=>{const b=$('[data-back]',root);if(b)b.onclick=()=>App.go(to)};
App.refreshStars=()=>{const e=$('#tstars');if(e)e.textContent=App.totalStars()};
App.slider=(inp)=>{const f=()=>{const p=(inp.value-inp.min)/(inp.max-inp.min)*100;inp.style.setProperty('--p',p+'%')};inp.addEventListener('input',f);f();return f};
App.fmt=v=>{const s=(Math.round(v*10)/10).toFixed(1);return s==='-0.0'?'0.0':s};

/* ---------- router ---------- */
App.go=h=>{if(location.hash==='#'+h)route();else location.hash=h};
function route(){const h=(location.hash||'#/map').slice(1);const parts=h.split('/').filter(Boolean);const name=parts[0]||'map';const arg=parts[1];
 if(App.cur&&App.cur.destroy)try{App.cur.destroy()}catch(e){console.error(e)}
 const view=$('#view');view.innerHTML='';const s=document.createElement('section');s.className='scr';view.appendChild(s);
 $$('.playwrap').forEach(e=>e.remove());
 const fn=App.screens[name]||App.screens.map;App.cur=fn(s,arg)||{};window.scrollTo(0,0);
 const grp={map:'map',i1:'map',i2:'map',i3:'map',academy:'academy',lesson:'academy',awards:'awards',settings:'settings'}[name]||'map';
 $$('#nav button').forEach(b=>b.classList.toggle('on',b.dataset.go===grp))}
App.route=route;
App.initNav=()=>{const items=[['map','map','Карта'],['academy','cap','Академия'],['awards','trophy','Награды'],['settings','gear','Ещё']];
 $('#nav').innerHTML='<div class="in">'+items.map(i=>`<button data-go="${i[0]}">${App.icon(i[1])}<span>${i[2]}</span></button>`).join('')+'</div>';
 $$('#nav button').forEach(b=>b.onclick=()=>App.go('/'+b.dataset.go));
 addEventListener('hashchange',route)};
})();
