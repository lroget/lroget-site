// Genera la página y el bloque de portada de instituciones desde content/instituciones.json.
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
const esc=s=>String(s??'').replace(/&(?![a-z#0-9]+;)/gi,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const D=JSON.parse(readFileSync('content/instituciones.json','utf8'));
const PAGES={
  es:{argentinat:'/proyectos/argentinat/',coa:'/proyectos/coa-carancho/',encuentros:'/encuentros/',comunicacion:'/comunicacion/',all:'/instituciones/',home:'public/index.html',page:'public/instituciones/index.html'},
  en:{argentinat:'/en/projects/argentinat/',coa:'/en/projects/coa-carancho/',encuentros:'/en/gatherings/',comunicacion:'/en/communication/',all:'/en/institutions/',home:'public/en/index.html',page:'public/en/institutions/index.html'}
};
function logo(it){
  for(const e of ['svg','png','webp','jpg']) if(existsSync(`public/img/instituciones/${it.id}.${e}`)) return `/img/instituciones/${it.id}.${e}`;
  return '';
}
function fila(it,lang){
  const P=PAGES[lang], T=D.textos[lang];
  const lg=logo(it), nombre=esc(it.nombre[lang]);
  const mk=`<span class="mk">${lg?`<img src="${lg}" alt="${nombre}" loading="lazy">`:`<span class="txt">${nombre}</span>`}</span>`;
  const link=it.pagina?` <a href="${P[it.pagina]}">${T.ver}</a>.`:'';
  return `<li id="${it.id}">${mk}<div class="tx"><h3>${nombre}</h3><p>${esc(it.rotulo[lang])}${link}</p></div><span class="yr">${esc(it.anio||'')}</span></li>`;
}
function logoNube(it,lang){
  const P=PAGES[lang], lg=logo(it), nombre=esc((it.corto&&it.corto[lang])||it.nombre[lang].replace(/ \(.*\)$/,''));
  return `<li><a href="${P.all}#${it.id}" title="${esc(it.nombre[lang])}">${lg?`<img src="${lg}" alt="${esc(it.nombre[lang])}" loading="lazy">`:`<span class="txt">${nombre}</span>`}</a></li>`;
}
export function paginaInstituciones(lang){
  const T=D.textos[lang];
  const grupos=D.grupos.map(g=>{
    const l=D.items.filter(i=>i.grupo===g.id);
    if(!l.length) return '';
    return `<div class="inst-g"><h2>${esc(g[lang])}</h2>\n<ul class="inst-l">\n${l.map(i=>fila(i,lang)).join('\n')}\n</ul></div>`;
  }).join('\n');
  return `${grupos}\n<p class="inst-note">${esc(D.otros_medios[lang])}</p>\n<p class="inst-note">${esc(T.aviso)}</p>`;
}
export function bloqueHome(lang){
  return `<ul class="inst-pg inst-nube">\n${D.items.map(i=>logoNube(i,lang)).join('\n')}\n</ul>`;
}
export function aplicar(){
  for(const lang of ['es','en']){
    const P=PAGES[lang];
    let p=readFileSync(P.page,'utf8').replace(/<!--inst-->.*<!--\/inst-->/s,`<!--inst-->${paginaInstituciones(lang)}<!--/inst-->`);
    writeFileSync(P.page,p);
    let h=readFileSync(P.home,'utf8').replace(/<!--insth-->.*<!--\/insth-->/s,`<!--insth-->${bloqueHome(lang)}<!--/insth-->`);
    writeFileSync(P.home,h);
  }
}
