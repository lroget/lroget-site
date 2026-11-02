// node scripts/pendientes.mjs            lista las traducciones pendientes
// node scripts/pendientes.mjs --sellar   marca como traducidas las entradas indicadas
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import YAML from 'yaml';
import {leer,huella,EN} from './contenido.mjs';
const args=process.argv.slice(2);
const items=leer();
if(args[0]==='--sellar'){
  for(const slug of args.slice(1)){
    const it=items.find(i=>i.slug===slug); if(!it) throw new Error('No existe: '+slug);
    const p=join(EN,slug+'.yml');
    const d=YAML.parse(readFileSync(p,'utf8')); d.huella_es=huella(it.es);
    writeFileSync(p,YAML.stringify(d,{lineWidth:0}));
  }
}else{
  const p=items.filter(i=>i.pendiente);
  console.log(p.length?p.map(i=>i.slug).join('\n'):'Sin pendientes');
}
