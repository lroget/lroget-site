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

// E: línea a mano que empalma, para separadores
{const a=ruido(4),w=ruido(5),W=1800;
 writeFileSync(`${OUT}/linea.svg`,svg(W,12,`<path d="${trazo(t=>[t*W,6+3*a(t)],t=>1.5+.8*w(t),200)}"/>`))}

// F: pincelada corta para subrayar títulos
{let d='';const a=ruido(3);
 for(const [o,g] of [[-7,9],[1,13],[9,8]]){const w=ruido(4);d+=trazo(t=>[8+t*484,27+o+6*a(t)],t=>g+3.5*w(t),60,3.5)}
 writeFileSync(`${OUT}/pincelada.svg`,svg(500,54,`<path d="${d}"/>`))}

// C: formas irregulares para recortar fotos
for(const n of [1,2]){const a=rnd()*TAU,b=rnd()*TAU,c=rnd()*TAU,p=[];
 for(let i=0;i<72;i++){const t=i/72*TAU,r=445*(1+.06*Math.sin(2*t+a)+.045*Math.sin(3*t+b)+.02*Math.sin(5*t+c));p.push([500+r*Math.cos(t),500+r*Math.sin(t)])}
 writeFileSync(`${OUT}/mancha-${n}.svg`,svg(1000,1000,`<path d="${cerrado(p)}"/>`))}
