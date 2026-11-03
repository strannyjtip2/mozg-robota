(function(root){
'use strict';
function rng(seed){let a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function gauss(r){let u=0,v=0;while(!u)u=r();while(!v)v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(6.283185*v)}
/* tiny MLP: 2 inputs -> H tanh -> 1 sigmoid, trained with Adam on binary cross entropy */
function MLP(H,seed){
 const r=rng(seed||1);this.H=H;this.t=0;
 this.W1=[];this.b1=[];this.W2=[];this.b2=0;
 for(let j=0;j<H;j++){this.W1.push([gauss(r)*.9,gauss(r)*.9]);this.b1.push((r()-.5)*.6);this.W2.push(gauss(r)*.7)}
 const z=n=>new Array(n).fill(0);
 this.m={W1:this.W1.map(()=>[0,0]),b1:z(H),W2:z(H),b2:0};this.v={W1:this.W1.map(()=>[0,0]),b1:z(H),W2:z(H),b2:0};
}
MLP.prototype.forward=function(x,y,a){const H=this.H;let z=this.b2;for(let j=0;j<H;j++){const v=Math.tanh(this.W1[j][0]*x+this.W1[j][1]*y+this.b1[j]);if(a)a[j]=v;z+=this.W2[j]*v}return 1/(1+Math.exp(-z))};
MLP.prototype.step=function(data,lr){
 const H=this.H,N=data.length;if(!N)return 0;
 const gW1=this.W1.map(()=>[0,0]),gb1=new Array(H).fill(0),gW2=new Array(H).fill(0);let gb2=0,loss=0;const a=new Array(H);
 for(const p of data){const pr=this.forward(p.x,p.y,a),t=p.c;loss-=t*Math.log(pr+1e-9)+(1-t)*Math.log(1-pr+1e-9);const dz=pr-t;gb2+=dz;
  for(let j=0;j<H;j++){gW2[j]+=dz*a[j];const d1=dz*this.W2[j]*(1-a[j]*a[j]);gW1[j][0]+=d1*p.x;gW1[j][1]+=d1*p.y;gb1[j]+=d1}}
 this.t++;const b1=.9,b2=.999,t=this.t,c1=1-Math.pow(b1,t),c2=1-Math.pow(b2,t);
 const upd=(w,g,m,v)=>{g/=N;m=b1*m+(1-b1)*g;v=b2*v+(1-b2)*g*g;return[w-lr*(m/c1)/(Math.sqrt(v/c2)+1e-8),m,v]};
 let o;
 for(let j=0;j<H;j++){for(let k=0;k<2;k++){o=upd(this.W1[j][k],gW1[j][k],this.m.W1[j][k],this.v.W1[j][k]);this.W1[j][k]=o[0];this.m.W1[j][k]=o[1];this.v.W1[j][k]=o[2]}
  o=upd(this.b1[j],gb1[j],this.m.b1[j],this.v.b1[j]);this.b1[j]=o[0];this.m.b1[j]=o[1];this.v.b1[j]=o[2];
  o=upd(this.W2[j],gW2[j],this.m.W2[j],this.v.W2[j]);this.W2[j]=o[0];this.m.W2[j]=o[1];this.v.W2[j]=o[2]}
 o=upd(this.b2,gb2,this.m.b2,this.v.b2);this.b2=o[0];this.m.b2=o[1];this.v.b2=o[2];
 return loss/N};
MLP.prototype.accuracy=function(data){if(!data.length)return 0;let k=0;for(const p of data){if((this.forward(p.x,p.y)>.5?1:0)===p.c)k++}return k/data.length};
/* datasets: c=0 red, c=1 blue, coordinates in [-1,1] */
function makeData(kind){
 const r=rng({blobs:11,xor:22,circle:33,moons:44}[kind]||5),pts=[],n=36;
 const add=(x,y,c)=>pts.push({x:Math.max(-.97,Math.min(.97,x)),y:Math.max(-.97,Math.min(.97,y)),c});
 if(kind==='blobs'){for(let i=0;i<n;i++){add(-.5+gauss(r)*.2,.4+gauss(r)*.22,0);add(.5+gauss(r)*.2,-.4+gauss(r)*.22,1)}}
 else if(kind==='xor'){for(let i=0;i<n;i++){const s=r()<.5?-1:1,t=r()<.5?-1:1;add(s*(.15+r()*.7),t*(.15+r()*.7),s*t>0?1:0)}}
 else if(kind==='circle'){for(let i=0;i<n;i++){const a=r()*6.283,d=Math.sqrt(r())*.46;add(Math.cos(a)*d,Math.sin(a)*d,1);const a2=r()*6.283,d2=.7+r()*.25;add(Math.cos(a2)*d2*.97,Math.sin(a2)*d2*.97,0)}}
 else if(kind==='moons'){for(let i=0;i<n;i++){const a=r()*3.1416;add(Math.cos(a)*.6-.15+gauss(r)*.07,Math.sin(a)*.6-.12+gauss(r)*.07,0);const b=r()*3.1416;add(.15+Math.cos(b)*.6+gauss(r)*.07,.12-Math.sin(b)*.6+gauss(r)*.07,1)}}
 return pts}
const out={MLP,makeData,rng};
if(typeof module!=='undefined'&&module.exports)module.exports=out;else{root.App=root.App||{};root.App.MLP=MLP;root.App.makeData=makeData}
})(typeof window!=='undefined'?window:globalThis);
