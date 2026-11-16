// Páginas de proyecto despublicadas en producción (16/11/2026, pedido de Leo: las está editando).
// En la copia de prueba (SITE_STAGING=1) y en local siguen visibles. Para volver a publicarlas, vaciar OCULTOS.
import {readFileSync,writeFileSync,rmSync,existsSync,readdirSync,statSync} from 'node:fs';
import {join} from 'node:path';
const OCULTOS=['argentinat','bioma','coa-carancho'];
const enCI=process.env.WORKERS_CI||process.env.CI;
const activo=process.env.OCULTAR_PROYECTOS==='1'||(enCI&&process.env.SITE_STAGING!=='1');
export function ocultar(pub='public'){
  if(!activo||!OCULTOS.length) return;
  const alt=OCULTOS.join('|');
  for(const s of OCULTOS) for(const d of [join(pub,'proyectos',s),join(pub,'en/projects',s)]) if(existsSync(d)) rmSync(d,{recursive:true});
  const walk=d=>readdirSync(d).flatMap(n=>{const p=join(d,n);return statSync(p).isDirectory()?walk(p):p.endsWith('.html')?[p]:[]});
  const href=`href="/(?:en/projects|proyectos)/(?:${alt})/[^"]*"`;
  for(const f of walk(pub)){
    let s=readFileSync(f,'utf8'),o=s;
    const en=f.includes('/en/');
    s=s.replace(new RegExp(`<p class="go"><a ${href}[^>]*>[^<]*</a></p>`,'g'),`<p class="go">${en?'Coming soon':'Próximamente'}</p>`);
    s=s.replace(new RegExp(` <a ${href}[^>]*>(?:Ver el detalle|See the details)</a>\\.`,'g'),'');
    s=s.replace(new RegExp(`<a ${href}[^>]*>([\\s\\S]*?)</a>`,'g'),'$1');
    if(s!==o) writeFileSync(f,s);
  }
  const sm=join(pub,'sitemap.xml');
  if(existsSync(sm)){
    let x=readFileSync(sm,'utf8');
    x=x.replace(new RegExp(`\\s*<url><loc>https://lroget\\.com/(?:en/projects|proyectos)/(?:${alt})/</loc>[\\s\\S]*?</url>`,'g'),'');
    writeFileSync(sm,x);
  }
  console.log('Proyectos despublicados:',OCULTOS.join(', '));
}
