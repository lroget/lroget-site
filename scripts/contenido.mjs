// Lectura del contenido: español en content/trayectoria (panel), inglés en content/en (Claude).
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import YAML from 'yaml';

export const ES='content/trayectoria', EN='content/en';

// Huella del texto en español: si cambia, la traducción queda pendiente.
export function huella(d){
  const base={titulo:d.titulo,fecha:d.fecha,resumen:d.resumen,enlace_url:d.enlace_url,enlace_texto:d.enlace_texto,
    cuerpo:d.cuerpo,epigrafes:(d.fotos||[]).map(f=>f.epigrafe||'')};
  return createHash('sha1').update(JSON.stringify(base)).digest('hex').slice(0,12);
}
export function leer(){
  return readdirSync(ES).filter(f=>/\.ya?ml$/.test(f)).map(f=>{
    const slug=f.replace(/\.ya?ml$/,'');
    const es=YAML.parse(readFileSync(join(ES,f),'utf8'))||{};
    const p=join(EN,slug+'.yml');
    const en=existsSync(p)?YAML.parse(readFileSync(p,'utf8'))||{}:null;
    const pendiente=!en||en.huella_es!==huella(es);
    return {slug,es,en:pendiente?{}:en,pendiente,enPrevio:en};
  });
}
