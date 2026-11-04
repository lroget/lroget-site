// Genera la línea de tiempo y las páginas de entrada a partir de content/trayectoria.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {marked} from 'marked';
import {leer} from './contenido.mjs';

const LANGS={
  es:{home:'public/index.html',page:'public/novedades/index.html',base:'/novedades/',other:'/en/news/',root:'Inicio',rootHref:'/',sec:'Novedades',photo:'Foto',
      tags:{charla:'Charla',taller:'Taller',congreso:'Congreso',convenio:'Convenio',reco:'Reconocimiento',prensa:'Prensa',pub:'Publicación',hito:'Hito',voluntariado:'Voluntariado'}},
  en:{home:'public/en/index.html',page:'public/en/news/index.html',base:'/en/news/',other:'/novedades/',root:'Home',rootHref:'/en/',sec:'News',photo:'Photo',
      tags:{charla:'Talk',taller:'Workshop',congreso:'Conference',convenio:'Agreement',reco:'Recognition',prensa:'Press',pub:'Publication',hito:'Milestone',voluntariado:'Volunteer'}}
};
for(const [l,page,base,other,sec] of [['es','public/encuentros/index.html','/encuentros/','/en/gatherings/','Encuentros'],['en','public/en/gatherings/index.html','/en/gatherings/','/encuentros/','Gatherings']])
  LANGS[l].enc={page,base,other,sec};
const ENC=['charla','taller','congreso'];
const esc=s=>String(s??'').replace(/&(?![a-z#0-9]+;)/gi,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const attr=s=>esc(s).replace(/"/g,'&quot;');
const inline=s=>esc(s).replace(/\*([^*]+)\*/g,'<em>$1</em>');
const plain=s=>String(s??'').replace(/\*/g,'');

const items=leer().map(i=>({...i,date:String(i.es.fecha_orden),year:String(i.es.fecha_orden).slice(0,4),tipo:i.es.tipo||'hito'}))
  .sort((a,b)=>b.date.localeCompare(a.date)||a.slug.localeCompare(b.slug));

const esEnc=it=>ENC.includes(it.tipo);
const lim=new Date(Date.now()-365*864e5).toISOString().slice(0,10);
const sitio=(it,lang)=>esEnc(it)?LANGS[lang].enc:LANGS[lang];
const hasPage=(it)=>Boolean((it.es.cuerpo||'').trim()||(it.es.fotos||[]).length);
const field=(it,lang,k)=>it[lang][k]||it.es[k]||'';

function row(it,lang){
  const L=LANGS[lang];
  const dt=it.tipo==='voluntariado'?'hito':it.tipo;
  const title=field(it,lang,'titulo');
  const name=hasPage(it)?`<a href="${sitio(it,lang).base}${it.slug}/">${esc(title)}</a>`:esc(title);
  let what=inline(field(it,lang,'resumen'));
  const url=field(it,lang,'enlace_url');
  if(url){
    const rel=/^https?:/.test(url)?' rel="noopener"':'';
    what+=` <a href="${url}"${rel}>${esc(field(it,lang,'enlace_texto'))}</a>.`;
    const c=lang==='en'&&it.en.cierre; if(c) what+=' '+esc(c);
  }
  return `<li data-t="${dt}"><div class="row"><span class="yr">${esc(field(it,lang,'fecha'))}<span class="tag">${L.tags[it.tipo]||''}</span></span><span class="name">${name}</span><span class="what">${what}</span></div></li>`;
}
// Portada: solo charlas, talleres y congresos del último año, hasta tres.
function recientes(lang){
  return items.filter(i=>esEnc(i)&&i.date>=lim).slice(0,3).map(it=>{
    const r=row(it,lang).replace(/<span class="tag">.*?<\/span>/,'').replace(/^<li data-t="\w+">/,'<li>');
    return r;
  }).join('\n');
}
function timeline(lang,lista){
  const years=[...new Set(lista.map(i=>i.year))].sort((a,b)=>b-a);
  return years.map(y=>`<div class="yg"><h3 class="yh">${y}</h3>\n<ul>\n${lista.filter(i=>i.year===y).map(i=>row(i,lang)).join('\n')}\n</ul></div>`).join('\n');
}
function entry(it,lang,tpl){
  const L={...LANGS[lang],...sitio(it,lang)};
  const path=L.base+it.slug+'/', other=L.other+it.slug+'/';
  const esPath=lang==='es'?path:other, enPath=lang==='en'?path:other;
  const title=plain(field(it,lang,'titulo')).replace(/"/g,'&quot;');
  const full=`${esc(title)} | Leonel Roget`;
  const desc=attr(plain(field(it,lang,'resumen')));
  // Las fotos salen siempre del español: mismo orden en los dos idiomas.
  const fotos=(it.es.fotos||[]).filter(f=>f&&f.imagen).map((f,i)=>{
    const ep=lang==='en'?(it.en.epigrafes||[])[i]||f.epigrafe:f.epigrafe;
    const cap=ep?`<figcaption>${esc(ep)}</figcaption>`:'';
    return `<figure><img src="${attr(encodeURI(f.imagen))}" alt="${attr(ep||field(it,lang,'titulo'))}" loading="lazy">${cap}</figure>`;
  }).join('');
  const url=field(it,lang,'enlace_url');
  const link=url?`<p class="go"><a href="${url}"${/^https?:/.test(url)?' rel="noopener"':''}>${esc(field(it,lang,'enlace_texto'))}</a></p>`:'';
  const main=`<main id="top">
<section class="phead entry">
  <div class="wrap">
    <p class="crumb"><a href="${L.rootHref}">${L.root}</a> / <a href="${L.base}">${L.sec}</a></p>
    <h1>${esc(field(it,lang,'titulo'))}</h1>
    <p class="lead">${esc(field(it,lang,'fecha'))}</p>
  </div>
</section>
<section class="prose">
  <div class="wrap">
${marked.parse(field(it,lang,'cuerpo')||'')}${link}
  </div>
</section>${fotos?`\n<section class="fotos"><div class="wrap">${fotos}</div></section>`:''}
</main>`;
  return tpl
    .replace(/<title>.*?<\/title>/s,`<title>${full}</title>`)
    .replace(/<meta name="description"[^>]*>/,`<meta name="description" content="${desc}">`)
    .replace(/<link rel="canonical"[^>]*>/,`<link rel="canonical" href="https://lroget.com${path}">`)
    .replace(/<link rel="alternate" hreflang="es"[^>]*>/,`<link rel="alternate" hreflang="es" href="https://lroget.com${esPath}">`)
    .replace(/<link rel="alternate" hreflang="en"[^>]*>/,`<link rel="alternate" hreflang="en" href="https://lroget.com${enPath}">`)
    .replace(/<link rel="alternate" hreflang="x-default"[^>]*>/,`<link rel="alternate" hreflang="x-default" href="https://lroget.com${esPath}">`)
    .replace(/<meta property="og:url"[^>]*>/,`<meta property="og:url" content="https://lroget.com${path}">`)
    .replace(/<meta property="og:title"[^>]*>/,`<meta property="og:title" content="${full}">`)
    .replace(/<meta property="og:description"[^>]*>/,`<meta property="og:description" content="${desc}">`)
    .replace(/<script type="application\/ld\+json".*?<\/script>\n?/gs,'')
    .replace(/(<a class="lang" href=")[^"]*("[^>]*hreflang=)/,`$1${other}$2`)
    .replace(/<main id="top">.*<\/main>/s,main);
}

for(const lang of ['es','en']){
  const L=LANGS[lang];
  let html=readFileSync(L.page,'utf8');
  // Novedades: todavía guarda lo que no es un encuentro, y los encuentros del último año.
  html=html.replace(/<!--tl-->.*<!--\/tl-->/s,`<!--tl-->${timeline(lang,items.filter(i=>!esEnc(i)||i.date>=lim))}<!--/tl-->`);
  writeFileSync(L.page,html);
  let enc=readFileSync(L.enc.page,'utf8').replace(/<!--tl-->.*<!--\/tl-->/s,`<!--tl-->${timeline(lang,items.filter(esEnc))}<!--/tl-->`);
  writeFileSync(L.enc.page,enc);
  const home=readFileSync(L.home,'utf8').replace(/<!--rec-->.*<!--\/rec-->/s,`<!--rec-->${recientes(lang)}\n<!--/rec-->`);
  writeFileSync(L.home,home);
  for(const it of items.filter(hasPage)){
    const dir='public'+sitio(it,lang).base+it.slug;
    mkdirSync(dir,{recursive:true});
    writeFileSync(join(dir,'index.html'),entry(it,lang,esEnc(it)?enc:html));
  }
}

let sm=readFileSync('public/sitemap.xml','utf8').replace(/<!--entradas-->.*<!--\/entradas-->\n?/s,'');
const urls=items.filter(hasPage).flatMap(it=>['es','en'].map(l=>{
  const a=`https://lroget.com${sitio(it,'es').base}${it.slug}/`,b=`https://lroget.com${sitio(it,'en').base}${it.slug}/`;
  return `  <url><loc>${l==='es'?a:b}</loc><lastmod>${it.date}</lastmod>
    <xhtml:link rel="alternate" hreflang="es" href="${a}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${b}"/>
  </url>`})).join('\n');
if(urls) sm=sm.replace('</urlset>',`<!--entradas-->\n${urls}\n<!--/entradas-->\n</urlset>`);
writeFileSync('public/sitemap.xml',sm);

const branch=process.env.CMS_BRANCH||'main';
const cfg=readFileSync('cms/config.yml','utf8').replace('__BRANCH__',branch);
mkdirSync('public/admin',{recursive:true});
writeFileSync('public/admin/config.yml',cfg);
if(process.env.SITE_STAGING==='1') writeFileSync('public/_headers','/*\n  X-Robots-Tag: noindex, nofollow\n');
const pend=items.filter(i=>i.pendiente).map(i=>i.slug);
if(pend.length) console.warn('Traducción pendiente:',pend.join(', '));
console.log(items.length,'entradas;',items.filter(hasPage).length,'con página');
