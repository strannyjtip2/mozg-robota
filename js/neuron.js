(function(){
'use strict';
const App=window.App;
const TEAL='45,226,230',ORA='255,120,90',GRN='77,240,168',RED='255,84,112',PUR='178,107,255';
/* NeuronView: one neuron with N inputs. Used by islands 1 and 2. */
App.NeuronView=function(canvas,cfg){
 const cv=App.canvas(canvas);
 const V={x:[0,0,0],w:[1,1,1],thr:2,dw:[1,1,1],dthr:2,pops:[],rings:[],outLabels:cfg.outLabels||['Пускаем!','Не пускаем'],icons:cfg.icons,names:cfg.names};
 const n=cfg.icons.length;
 const sum=()=>V.x.reduce((s,x,i)=>s+x*V.w[i],0);
 V.sum=sum;V.out=()=>sum()>=V.thr-1e-9;
 V.set=o=>Object.assign(V,o);
 V.pop=(i,text,rgb)=>V.pops.push({i,text,rgb:rgb||TEAL,t:0});
 V.ring=rgb=>V.rings.push({rgb,t:0});
 function pos(){const W=cv.w,H=cv.h;const ys=[...Array(n)].map((_,i)=>H*(.16+.68*(n===1?.5:i/(n-1))));return{ins:ys.map(y=>({x:46,y})),nr:{x:W*.6,y:H/2,r:Math.min(36,W*.1)},out:{x:W-44,y:H/2,r:24}}}
 V.draw=(t,dt)=>{
  const ctx=cv.begin(),P=pos(),W=cv.w,H=cv.h;
  for(let i=0;i<n;i++){V.dw[i]+=(V.w[i]-V.dw[i])*Math.min(1,dt*9)}V.dthr+=(V.thr-V.dthr)*Math.min(1,dt*9);
  const s=V.x.reduce((a,x,i)=>a+x*V.dw[i],0),out=s>=V.dthr-1e-9;
  ctx.lineCap='round';
  // wires
  for(let i=0;i<n;i++){
   const a=P.ins[i],w=V.dw[i],act=V.x[i]>0,neg=w<0,rgb=neg?ORA:TEAL,mag=Math.min(1,Math.abs(w)/3);
   const x0=a.x+22,y0=a.y,x1=P.nr.x-P.nr.r+2,y1=P.nr.y;
   ctx.globalCompositeOperation='lighter';
   ctx.strokeStyle=`rgba(${rgb},${(act?.22:.07)+(act?.5:.15)*mag})`;ctx.lineWidth=1+Math.abs(w)*2.6;
   ctx.shadowColor=`rgba(${rgb},.8)`;ctx.shadowBlur=act?10:0;
   ctx.beginPath();ctx.moveTo(x0,y0);ctx.bezierCurveTo(x0+(x1-x0)*.5,y0,x0+(x1-x0)*.5,y1,x1,y1);ctx.stroke();ctx.shadowBlur=0;
   // pulses
   if(act&&Math.abs(w)>.05){for(let k=0;k<2;k++){const u=((t/1300)+i*.31+k*.5)%1,e=u,bx=(1-e)**3*x0+3*(1-e)**2*e*(x0+(x1-x0)*.5)+3*(1-e)*e*e*(x0+(x1-x0)*.5)+e**3*x1,by=(1-e)**3*y0+3*(1-e)**2*e*y0+3*(1-e)*e*e*y1+e**3*y1;App.glow(ctx,bx,by,7+Math.abs(w)*2.2,rgb,.95*Math.sin(Math.PI*Math.min(1,u*1.05)))}}
   ctx.globalCompositeOperation='source-over';
   // weight label
   const mx=(x0+x1)/2,my=y0+(y1-y0)*.5,tx=x0+(x1-x0)*.38,ty=y0+(y1-y0)*.2;
   const lab=(w>0?'×':'×')+App.fmt(w);
   ctx.font='800 12px Nunito';const tw=ctx.measureText(lab).width+12;
   ctx.fillStyle='rgba(6,8,30,.82)';ctx.strokeStyle=`rgba(${rgb},.7)`;ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(tx-tw/2,ty-9,tw,18,9);ctx.fill();ctx.stroke();
   ctx.fillStyle=neg?'#ffb3a3':'#a8fffa';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(lab,tx,ty+.5);
  }
  // input nodes
  for(let i=0;i<n;i++){const a=P.ins[i],act=V.x[i]>0;
   if(act)App.glow(ctx,a.x,a.y,40,TEAL,.5);
   ctx.fillStyle='rgba(8,12,44,.95)';ctx.strokeStyle=act?`rgba(${TEAL},1)`:'rgba(120,130,200,.45)';ctx.lineWidth=act?2.5:1.5;ctx.beginPath();ctx.arc(a.x,a.y,21,0,7);ctx.fill();ctx.stroke();
   App.drawIcon(ctx,V.icons[i],a.x,a.y,26,act?'#aefff9':'#5d658f',2);
   ctx.font='800 11px Nunito';ctx.textAlign='center';ctx.textBaseline='top';ctx.fillStyle=act?'#cffffb':'#7d86b5';ctx.fillText(V.names[i],a.x,a.y+25);
   // value
   ctx.font='900 11px Unbounded';ctx.fillStyle=act?'#fff':'#59608c';ctx.textBaseline='middle';ctx.fillText(act?'1':'0',a.x+31,a.y-9)
  }
  // neuron
  const N=P.nr,prog=Math.max(0,Math.min(1,V.dthr>0?s/V.dthr:(s>=0?1:0))),rgb=out?GRN:PUR;
  App.glow(ctx,N.x,N.y,N.r*(out?3.2:2.2),rgb,out?.6:.35);
  // branches decoration
  ctx.save();ctx.translate(N.x,N.y);ctx.globalCompositeOperation='lighter';for(let k=0;k<10;k++){const ang=k/10*6.283+t/6000;const l=N.r+9+Math.sin(t/500+k)*3;ctx.strokeStyle=`rgba(${rgb},.55)`;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(Math.cos(ang)*N.r*.9,Math.sin(ang)*N.r*.9);ctx.lineTo(Math.cos(ang)*l,Math.sin(ang)*l);ctx.stroke();ctx.fillStyle=`rgba(${rgb},.9)`;ctx.beginPath();ctx.arc(Math.cos(ang)*(l+2),Math.sin(ang)*(l+2),2,0,7);ctx.fill()}ctx.restore();
  const g=ctx.createRadialGradient(N.x-N.r*.3,N.y-N.r*.35,2,N.x,N.y,N.r);g.addColorStop(0,out?'#d8fff0':'#e5d3ff');g.addColorStop(.45,out?'#3ee9a8':'#9a63ff');g.addColorStop(1,out?'#0b8c66':'#3b1d93');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(N.x,N.y,N.r,0,7);ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,.75)';ctx.lineWidth=2;ctx.stroke();
  // progress ring
  ctx.strokeStyle=out?`rgba(${GRN},1)`:`rgba(${TEAL},.9)`;ctx.lineWidth=4;ctx.beginPath();ctx.arc(N.x,N.y,N.r+6,-Math.PI/2,-Math.PI/2+6.283*prog);ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.12)';ctx.beginPath();ctx.arc(N.x,N.y,N.r+6,0,7);ctx.lineWidth=1;ctx.strokeStyle='rgba(255,255,255,.14)';ctx.stroke();
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff';ctx.font='700 17px Unbounded';ctx.shadowColor='rgba(0,0,0,.6)';ctx.shadowBlur=4;ctx.fillText(App.fmt(s),N.x,N.y-3);ctx.shadowBlur=0;
  ctx.font='800 10.5px Nunito';ctx.fillStyle='#ffd9a0';ctx.fillText('порог '+App.fmt(V.dthr),N.x,N.y+N.r+22);
  ctx.fillStyle='rgba(255,255,255,.55)';ctx.fillText('сумма',N.x,N.y+11);
  // output wire
  const O=P.out,ox0=N.x+N.r+8,ox1=O.x-O.r;
  ctx.globalCompositeOperation='lighter';ctx.strokeStyle=out?`rgba(${GRN},.75)`:'rgba(255,84,112,.22)';ctx.lineWidth=out?5:2;ctx.shadowColor=out?`rgba(${GRN},.9)`:'transparent';ctx.shadowBlur=out?12:0;ctx.beginPath();ctx.moveTo(ox0,O.y);ctx.lineTo(ox1,O.y);ctx.stroke();ctx.shadowBlur=0;
  if(out){for(let k=0;k<2;k++){const u=((t/700)+k*.5)%1;App.glow(ctx,ox0+(ox1-ox0)*u,O.y,9,GRN,.9*Math.sin(Math.PI*u))}}
  ctx.globalCompositeOperation='source-over';
  // output node
  const orgb=out?GRN:RED;App.glow(ctx,O.x,O.y,out?50:34,orgb,out?.65:.4);
  ctx.fillStyle='rgba(8,12,44,.95)';ctx.strokeStyle=`rgba(${orgb},1)`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(O.x,O.y,O.r,0,7);ctx.fill();ctx.stroke();
  App.drawIcon(ctx,out?'check':'cross',O.x,O.y,24,`rgb(${orgb})`,3.2);
  ctx.font='900 11.5px Nunito';ctx.textBaseline='top';ctx.fillStyle=`rgb(${orgb})`;ctx.fillText(out?V.outLabels[0]:V.outLabels[1],O.x,O.y+O.r+6);
  // rings
  V.rings=V.rings.filter(r=>r.t<1);for(const r of V.rings){r.t+=dt*1.6;ctx.strokeStyle=`rgba(${r.rgb},${1-r.t})`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(N.x,N.y,N.r+8+r.t*60,0,7);ctx.stroke()}
  // pops
  V.pops=V.pops.filter(p=>p.t<1);for(const p of V.pops){p.t+=dt*.9;const a=p.i<0?{x:N.x,y:N.y+N.r+4}:P.ins[p.i];const px=p.i<0?a.x+34:(a.x+N.x)/2-6,py=a.y-18-p.t*34;ctx.globalAlpha=Math.min(1,(1-p.t)*2);ctx.font='900 17px Unbounded';ctx.textBaseline='middle';ctx.fillStyle=`rgb(${p.rgb})`;ctx.shadowColor=`rgba(${p.rgb},.9)`;ctx.shadowBlur=10;ctx.fillText(p.text,px,py);ctx.shadowBlur=0;ctx.globalAlpha=1}
 };
 V.destroy=()=>cv.destroy();
 return V};
})();
