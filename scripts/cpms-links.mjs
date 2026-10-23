import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { documentFrom, all, serialize, text } from './editorial-dom.mjs';
import { canonicalEditorialHref } from './esims-link-targets.mjs';

/** Remplacer les destinations vides, sans modifier les commandes du thème. */
export async function resolveEditorialLinks(registry, generated, routeTargets = {}) {
  const documents=new Map();
  for(const file of new Set(Object.values(registry).map(entry=>entry.file))) documents.set(file,documentFrom(await readFile(join(generated,file),'utf8')));
  let replaced=0;
  for(const [file,doc]of documents){
    for(const anchor of all(doc,'a')){
      const classes=(anchor.attribs.class??'').split(/\s+/);
      if(classes.some(name=>['rs-menu-toggle','nav-expander','popup-videos','image-popup','rs-search'].includes(name))||anchor.attribs['data-toggle']||anchor.attribs['data-target']||anchor.parent?.attribs?.id==='nav-close')continue;
      let href=(anchor.attribs.href??'').trim();
      if(classes.includes('cart-icon')){anchor.attribs['aria-label']='Boutique';href='';}
      if(/^(?:https?:|mailto:|tel:|\/\/)/i.test(href))continue;
      // Les documents et photos de l'archive restent accessibles directement.
      if(/^\/?(?:cpms|assets)\//.test(href))continue;
      href=canonicalEditorialHref(href,registry,routeTargets);
      anchor.attribs.href=href;
      const [path,fragment]=href.split('#');
      const key=path.split('?')[0].replace(/^\//,'').replace(/\/$/,'');
      const target=path?documents.get(registry[key]?.file):doc;
      let valid=Boolean(href&&target);
      if(valid&&fragment){let id;try{id=decodeURIComponent(fragment);}catch{id=fragment;}valid=all(target,'*').some(node=>node.attribs.id===id||node.attribs.name===id);}
      if(!href||href==='#'||href.endsWith('#')||/^javascript:/i.test(href)||!valid){
        anchor.attribs.href='/erreur';delete anchor.attribs['aria-disabled'];delete anchor.attribs.title;replaced++;
      }
    }
    // Les liens réels du pied de page ont leurs destinations CPMS.
    for(const anchor of all(doc,'.footer-bottom a')){
      const destination={'Event':'/evenements','Actualités':'/actualites','Contact':'/contact'}[text(anchor)];
      if(destination)anchor.attribs.href=destination;
    }
    // Souligner les liens de lecture sans transformer les cartes, médias ou onglets.
    for(const anchor of all(doc,'.main-content a')) {
      const classes=(anchor.attribs.class??'').split(/\s+/);
      if(classes.some(c=>['readon2','popup-videos','image-popup','nav-link'].includes(c))||anchor.attribs['data-toggle']||anchor.attribs['data-target']||all(anchor,'img').length)continue;
      let prose=false;
      for(let parent=anchor.parent;parent;parent=parent.parent) {
        const parentClasses=(parent.attribs?.class??'').split(/\s+/);
        if(parent.name==='p'||parentClasses.some(c=>['card-body','cpms-post-content'].includes(c)))prose=true;
      }
      if(prose||classes.includes('esims-school-text-link')||classes.includes('esims-school-document'))anchor.attribs['data-esims-link']='text';
    }
    await writeFile(join(generated,file),serialize(doc));
  }
  return replaced;
}
