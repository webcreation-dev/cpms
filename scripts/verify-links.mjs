import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { documentFrom, all, text } from './editorial-dom.mjs';
import { canonicalEditorialHref } from './esims-link-targets.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const registry=JSON.parse(await readFile(join(root,'src/generated/cpms-registry.json'),'utf8'));
const redirects=JSON.parse(await readFile(join(root,'src/generated/cpms-redirects.json'),'utf8'));
const targets=Object.fromEntries(redirects.map(r=>[r.source,r.destination]));
const documents=new Map();
for(const file of new Set(Object.values(registry).map(entry=>entry.file)))documents.set(file,documentFrom(await readFile(join(root,'src/generated/cpms',file),'utf8')));
const errors=[], assets=new Set();
let links=0, fragments=0;
const checkTarget=(href,doc,context)=>{
  const url=new URL(href,'https://esims.local/');
  if(/^\/(?:cpms|assets)\//.test(url.pathname)){assets.add(decodeURIComponent(url.pathname));return;}
  const target=href.startsWith('#')?doc:documents.get(registry[decodeURIComponent(url.pathname).replace(/^\//,'').replace(/\/$/,'')]?.file);
  if(!target){errors.push(`${context} : page absente ${href}`);return;}
  if(url.hash){fragments++;const id=decodeURIComponent(url.hash.slice(1));if(!all(target,'*').some(node=>node.attribs.id===id||node.attribs.name===id))errors.push(`${context} : ancre absente ${href}`);}
};
for(const [file,doc]of documents)for(const anchor of all(doc,'a')){
  const href=(anchor.attribs.href??'').trim();
  const classes=(anchor.attribs.class??'').split(/\s+/);
  if(classes.some(c=>['rs-menu-toggle','nav-expander','popup-videos','image-popup','rs-search'].includes(c))||anchor.parent?.attribs?.id==='nav-close')continue;
  if(/^(?:https?:|mailto:|tel:|\/\/)/i.test(href)){
    if(/^https?:\/\/(?:www\.)?cpms\.education(?:\/|$)/i.test(href))errors.push(`${file} : lien vers l’ancien site ${href}`);
    continue;
  }
  const context=`${file} « ${text(anchor).slice(0,60)} »`;
  if(!href||href==='#'||/^javascript:/i.test(href)){errors.push(`${context} : destination vide`);continue;}
  links++;
  checkTarget(href,doc,context);
  if(!anchor.attribs['data-toggle']&&!anchor.attribs['data-target']){
    if(canonicalEditorialHref(href,registry,targets)!==href)errors.push(`${context} : destination non harmonisée ${href}`);
    if(href==='/erreur')errors.push(`${context} : renvoi de secours vers la page d’erreur`);
  }
}
for(const asset of assets)try{await access(join(root,'public',asset));}catch{errors.push(`Fichier absent : ${asset}`);}
assert.equal(new Set(redirects.map(r=>r.source)).size,redirects.length,'Les sources des redirections doivent être uniques.');
for(const redirect of redirects){
  checkTarget(redirect.destination,null,`Redirection ${redirect.source}`);
  if(canonicalEditorialHref(redirect.destination,registry,targets)!==redirect.destination)errors.push(`Redirection indirecte ou cyclique : ${redirect.source}`);
  if(redirect.source===redirect.destination)errors.push(`Redirection vers elle-même : ${redirect.source}`);
}
assert.deepEqual(errors,[],`Navigation incohérente :\n${errors.join('\n')}`);
console.log(`Vérifié : ${documents.size} pages, ${links} liens internes, ${fragments} ancres, ${assets.size} fichiers liés et ${redirects.length} redirections. Aucune destination absente, ancienne ou de secours.`);
