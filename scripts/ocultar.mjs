// Páginas despublicadas en producción. En la copia de prueba (SITE_STAGING=1) y en local siguen visibles.
// - Páginas de proyecto (16/11/2026, pedido de Leo: las está editando). Para volver a publicarlas, vaciar OCULTOS.
// - Página de Instituciones (16/11/2026, pedido de Leo: un texto está mal y hay que corregirlo). Para volver a publicarla, poner INSTITUCIONES=false.
import {readFileSync,writeFileSync,rmSync,existsSync,readdirSync,statSync} from 'node:fs';
import {join} from 'node:path';
const OCULTOS=['argentinat','bioma','coa-carancho'];
const INSTITUCIONES = false;
const enCI=process.env.WORKERS_CI||process.env.CI;
const activo=process.env.OCULTAR_PROYECTOS==='1'||(enCI&&process.env.SITE_STAGING!=='1');
export function ocultar(pub='public'){
  if(!activo||(!OCULTOS.length&&!INSTITUCIONES)) return;
  const alt=OCULTOS.join('|');
  if(OCULTOS.length) for(const s of OCULTOS) for(const d of [join(pub,'proyectos',s),join(pub,'en/projects',s)]) if(existsSync(d)) rmSync(d,{recursive:true});
  if(INSTITUCIONES) for(const d of [join(pub,'instituciones'),join(pub,'en/institutions')]) if(existsSync(d)) rmSync(d,{recursive:true});
  const walk=d=>readdirSync(d).flatMap(n=>{const p=join(d,n);return statSync(p).isDirectory()?walk(p):p.endsWith('.html')?[p]:[]});
  const href=`href="/(?:en/projects|proyectos)/(?:${alt})/[^"]*"`;
  const hrefInst=`href="/(?:en/institutions|instituciones)/[^"]*"`;
  for(const f of walk(pub)){
    let s=readFileSync(f,'utf8'),o=s;
    const en=f.includes('/en/');
    if(OCULTOS.length){
      s=s.replace(new RegExp(`<p class="go"><a ${href}[^>]*>[^<]*</a></p>`,'g'),`<p class="go">${en?'Coming soon':'Próximamente'}</p>`);
      s=s.replace(new RegExp(` <a ${href}[^>]*>(?:Ver el detalle|See the details)</a>\\.`,'g'),'');
      s=s.replace(new RegExp(`<a ${href}[^>]*>([\\s\\S]*?)</a>`,'g'),'$1');
    }
    if(INSTITUCIONES){
      s=s.replace(new RegExp(`<p class="inst-all"><a ${hrefInst}[^>]*>[^<]*</a></p>`,'g'),'');
      s=s.replace(new RegExp(`<a ${hrefInst}[^>]*>(?:Instituciones|Institutions)</a>`,'g'),'');
      s=s.replace(new RegExp(`<a ${hrefInst}[^>]*>([\\s\\S]*?)</a>`,'g'),'$1');
    }
    if(s!==o) writeFileSync(f,s);
  }
  const sm=join(pub,'sitemap.xml');
  if(existsSync(sm)){
    let x=readFileSync(sm,'utf8');
    if(OCULTOS.length) x=x.replace(new RegExp(`\\s*<url><loc>https://lroget\\.com/(?:en/projects|proyectos)/(?:${alt})/</loc>[\\s\\S]*?</url>`,'g'),'');
    if(INSTITUCIONES) x=x.replace(/\s*<url><loc>https:\/\/lroget\.com\/(?:en\/institutions|instituciones)\/<\/loc>[\s\S]*?<\/url>/g,'');
    writeFileSync(sm,x);
  }
  console.log('Despublicado en producción:',[...OCULTOS,...(INSTITUCIONES?['instituciones']:[])].join(', '));
}
