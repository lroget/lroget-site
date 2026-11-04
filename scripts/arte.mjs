// Dibuja las formas del look carancho como SVG propios. Se corre a mano: node scripts/arte.mjs
import {writeFileSync,mkdirSync} from 'node:fs';
const OUT='public/img/carancho'; mkdirSync(OUT,{recursive:true});
let seed=4217;
const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
const r2=n=>Math.round(n*10)/10;
const TAU=Math.PI*2;
// ruido periódico: suma de senos
const ruido=(n=4)=>{const a=[...Array(n)].map((_,i)=>[1+i,rnd()*TAU,1/(i+1)]);return t=>a.reduce((s,[f,p,w])=>s+w*Math.sin(TAU*f*t+p),0)/1.6};
const svg=(w,h,body)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">${body}</svg>`;
// contorno suave cerrado por puntos medios
function cerrado(p){const m=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];let s=m(p[p.length-1],p[0]),d=`M${r2(s[0])} ${r2(s[1])}`;
  for(let i=0;i<p.length;i++){const e=m(p[i],p[(i+1)%p.length]);d+=`Q${r2(p[i][0])} ${r2(p[i][1])} ${r2(e[0])} ${r2(e[1])}`}return d+'Z'}
// trazo de ancho variable a lo largo de una curva
function trazo(c,ancho,pasos=90,punta=0){const A=[],B=[];
  for(let i=0;i<=pasos;i++){const t=i/pasos,[x,y]=c(t),[x2,y2]=c(Math.min(1,t+.002)),[x0,y0]=c(Math.max(0,t-.002));
    let nx=-(y2-y0),ny=x2-x0;const l=Math.hypot(nx,ny)||1;nx/=l;ny/=l;
    let w=ancho(t);if(punta){w*=Math.min(1,Math.sin(Math.PI*t)*punta)}
    A.push([x+nx*w/2,y+ny*w/2]);B.unshift([x-nx*w/2,y-ny*w/2])}
  return cerrado([...A,...B])}

// A: haz de ondas diagonal
{const a=ruido(3),b=ruido(3),gap=ruido(3);let d='';
 const C=t=>[1120-1250*t+150*Math.sin(TAU*(1.05*t+.08))+60*a(t),-90+1420*t+120*Math.sin(TAU*(.8*t+.55))+40*b(t)];
 for(let k=0;k<13;k++){const w=ruido(4);
   const c=t=>{const [x,y]=C(t),[x2,y2]=C(Math.min(1,t+.003)),[x0,y0]=C(Math.max(0,t-.003));let nx=-(y2-y0),ny=x2-x0;const l=Math.hypot(nx,ny)||1;
     const o=(k-6)*(30+8*gap(t))*(1+.35*Math.sin(TAU*(t+.2)));return [x+nx/l*o,y+ny/l*o]};
   d+=trazo(c,t=>11+3.6*w(t),110)}
 writeFileSync(`${OUT}/ondas.svg`,svg(1000,1200,`<path d="${d}"/>`))}

// B: franja horizontal que empalma consigo misma
{const a=ruido(3);let d='';const W=2400,H=320;
 for(let k=0;k<8;k++){const w=ruido(4),q=ruido(2);
   const c=t=>[t*W,48+k*31+62*a(t)+16*q(t)*(k/7)];
   d+=trazo(c,t=>9.5+3*w(t),160)}
 writeFileSync(`${OUT}/franja.svg`,svg(W,H,`<path d="${d}"/>`))}

// C: mancha irregular
{const a=rnd()*TAU,b=rnd()*TAU,c=rnd()*TAU,p=[];
 for(let i=0;i<72;i++){const t=i/72*TAU,r=470*(1+.065*Math.sin(2*t+a)+.05*Math.sin(3*t+b)+.022*Math.sin(5*t+c));p.push([500+r*Math.cos(t),500+r*Math.sin(t)])}
 writeFileSync(`${OUT}/mancha.svg`,svg(1000,1000,`<path d="${cerrado(p)}"/>`))}

// D: barrado del pecho, en mosaico: barras onduladas, finas e irregulares
{let d='';const W=496,H=150,cw=62,rh=15;
 for(let row=0;row<H/rh;row++)for(let col=0;col<W/cw;col++){
   const cx=col*cw+(row%2?cw/2:0)+(rnd()-.5)*12,cy=row*rh+7.5+(rnd()-.5)*3,L=44+rnd()*18,cur=2.5+rnd()*4,g=rnd()*3;
   const w0=ruido(2),m=t=>[cx-L/2+L*t,cy+cur*Math.sin(Math.PI*t)-cur/2+1.6*Math.sin(TAU*(1.5*t+g))];
   const copias=[0];if(cx+L/2>W)copias.push(-W);if(cx-L/2<0)copias.push(W);
   for(const ox of copias){d+=trazo(t=>{const [x,y]=m(t);return [x+ox,y]},t=>5+1.7*w0(t),10,3)}
 }
 writeFileSync(`${OUT}/pecho.svg`,svg(W,H,`<path d="${d}"/>`))}

// E: línea a mano que empalma, para separadores
{const a=ruido(4),w=ruido(5),W=1800;
 writeFileSync(`${OUT}/linea.svg`,svg(W,12,`<path d="${trazo(t=>[t*W,6+3*a(t)],t=>1.5+.8*w(t),200)}"/>`))}

// F: pincelada corta para subrayar títulos
{let d='';const a=ruido(3);
 for(const [o,g] of [[-7,9],[1,13],[9,8]]){const w=ruido(4);d+=trazo(t=>[8+t*484,27+o+6*a(t)],t=>g+3.5*w(t),60,3.5)}
 writeFileSync(`${OUT}/pincelada.svg`,svg(500,54,`<path d="${d}"/>`))}
