import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, posix } from 'node:path';
import { documentFrom, serialize, all, one, contents, text, link, label } from './editorial-dom.mjs';
import { cpmsFooter } from './cpms-footer.mjs';

const primary = new Set(['#21a7d0','#273c66','#031a3d','#112958','#1c335f','#1c2f5e','#2e4778','#ff5421','#ed3600','#ff4007','#ff582f','#0c8b51','#4e49a1','#625eaa','#32b9e2','#59cbed']);
const secondary = new Set(['#f4bf00','#fcb903','#ffdf00','#f2d300']);
const rgbPrimary = new Set(['33,167,208','39,60,102','255,84,33','12,139,81','78,73,161']);
export function brandColors(css) {
  return css.replace(/#[a-f0-9]{6}(?:[a-f0-9]{2})?\b/gi, color=>{
    const base=color.slice(0,7).toLowerCase(),alpha=color.slice(7);
    return primary.has(base)?'#0066B3'+alpha:secondary.has(base)?'#FFCF03'+alpha:color;
  })
    .replace(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(\s*,\s*[\d.]+)?\s*\)/gi,(match,r,g,b,alpha)=>rgbPrimary.has(`${r},${g},${b}`)?`${alpha?'rgba':'rgb'}(0, 102, 179${alpha??''})`:match);
}

/** Dériver la palette sans modifier les fichiers Educavo de référence. */
export async function buildBrandStyles(publicRoot) {
  const sources=['style.css','assets/css/responsive.css','assets/css/rsmenu-main.css','cpms/header.css','cpms/about.css','cpms/cycles.css','cpms/news.css','cpms/information.css'];
  const destination=join(publicRoot,'cpms/theme');await mkdir(destination,{recursive:true});
  for(const source of sources){
    const css=await readFile(join(publicRoot,source),'utf8');
    const branded=brandColors(css).replace(/url\(\s*(['"]?)([^)'"\s]+)\1\s*\)/gi,(match,quote,url)=>/^(?:\/|#|data:|https?:)/i.test(url)?match:`url("${posix.resolve('/',posix.dirname(source),url)}")`);
    await writeFile(join(destination,posix.basename(source)),branded);
  }
}

/** Un seul en-tête, footer et chargement pour toutes les pages éditoriales. */
export async function uniformSiteShell(registry, generated, logo, brochure, records=[]) {
  const home=documentFrom(await readFile(join(generated,registry[''].file),'utf8'));
  const safe=value=>String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  for(const cart of all(home,'.cart-inner'))cart.parent.children=cart.parent.children.filter(child=>child!==cart);
  const phone=all(home,'.topbar-contact li')[1];
  contents(phone,'<i class="flaticon-call" aria-hidden="true"></i><a href="tel:+2290162721072">01 62 72 10 72</a><span> / </span><a href="tel:+2290149141277">01 49 14 12 77</a>');
  // Garder les éléments Educavo, avec les sept rubriques demandées.
  const prototypes=all(home,'.nav-menu > li');
  const navigation=[['Accueil','/',0],['Qui sommes-nous','/qui-sommes-nous',1],['Cursus','/formations',2],['Événements','/evenements',3],['Témoignages','/temoignages',3],['Actualités','/actualites',4],['Contact','/contact',5]];
  contents(one(home,'.nav-menu'),navigation.map(([title,href,index])=>{
    const item=documentFrom(serialize(prototypes[index])).children[0];
    const anchor=one(item,'a');link(anchor,title,href);
    item.attribs.class=(item.attribs.class??'').replace(/current-menu-item/g,'').trim();
    if(index!==2){
      item.attribs.class=item.attribs.class.split(/\s+/).filter(name=>!['rs-mega-menu','mega-rs','menu-item-has-children'].includes(name)).join(' ');
      item.children=[anchor];anchor.parent=item;
      delete anchor.attribs['aria-haspopup'];delete anchor.attribs['aria-expanded'];
    }else{
      const submenu=one(item,'ul');submenu.children=submenu.children.filter(child=>child.name==='li').slice(0,3);
    }
    return serialize(item);
  }).join(''));
  contents(one(home,'.topbar-right'),`<li class="btn-part"><a class="cpms-top-button cpms-brochure-button" href="${brochure}" download="brochure-cpms.pdf">Notre brochure</a></li><li class="btn-part"><a class="apply-btn cpms-top-button" href="/rentree-universitaire">Inscriptions ouvertes - Année 2026-2027</a></li>`);
  // Bloc exact d'index.html : icône à côté du titre et formulaire à droite.
  const reference=documentFrom(await readFile(join(generated,'../../templates/educavo/index.html'),'utf8'));
  const newsletter=one(reference,'.rs-newsletter');
  label(one(newsletter,'.sec-title .title'),'Soyez au courant de nos actualités');
  const newsletterIcon=one(newsletter,'.title-icon img');newsletterIcon.attribs.src='/assets/images/newsletter.png';newsletterIcon.attribs.alt='';
  const newsletterInput=one(newsletter,'input');newsletterInput.attribs.placeholder='Votre adresse email';newsletterInput.attribs['aria-label']='Votre adresse email';
  label(one(newsletter,'button'),'S’inscrire');
  const homeNewsletter=one(home,'.rs-newsletter');homeNewsletter.attribs={...newsletter.attribs};contents(homeNewsletter,newsletter.children.map(serialize).join(''));
  const footer=cpmsFooter(one(reference,'footer'),records,safe,logo);
  const homeFooter=one(home,'footer');homeFooter.attribs={...footer.attribs};contents(homeFooter,footer.children.map(serialize).join(''));
  const loader=one(home,'#loader');loader.attribs.class='loader';
  const seal=one(loader,'img');seal.attribs.src=logo;seal.attribs.alt='CPMS';seal.attribs.width='80';seal.attribs.height='80';
  loader.attribs['aria-label']='Chargement du site CPMS';
  const files=new Map(Object.entries(registry).map(([route,entry])=>[entry.file,route]));
  const references=['.full-width-header','footer','#loader','.rs-newsletter'].map(selector=>[selector,one(home,selector)]);
  const footerHtml=serialize(one(home,'footer'));
  for(const [file,route]of files){
    const doc=documentFrom(await readFile(join(generated,file),'utf8'));
    for(const [selector,reference]of references){
      const target=one(doc,selector);if(!reference||!target)continue;
      target.attribs={...reference.attribs};contents(target,reference.children.map(serialize).join(''));
    }
    const canonical=Object.entries(registry).find(([key,entry])=>entry.file===file&&!entry.canonical)?.[0]??route;
    const articleId=Number(canonical.match(/^articles\/(\d+)-/)?.[1]);
    const testimony=records.some(record=>record.id===articleId&&record.categories.includes('Témoignages'));
    const active=file===registry[''].file?0:file===registry['qui-sommes-nous'].file?1:/^(formations|domaines|cycle-)/.test(canonical)?2:/^(evenements|galerie)/.test(canonical)?3:/^temoignages/.test(canonical)||testimony?4:/^(actualites|articles)/.test(canonical)?5:canonical==='contact'?6:-1;
    all(doc,'.nav-menu > li').forEach((li,index)=>{
      li.attribs.class=(li.attribs.class??'').replace(/current-menu-item/g,'').trim()+(index===active?' current-menu-item':'');
      for(const descendant of all(li,'.current-menu-item'))if(descendant!==li)descendant.attribs.class=descendant.attribs.class.replace(/current-menu-item/g,'').trim();
      const anchor=one(li,'a');if(index===active)anchor.attribs['aria-current']='page';else delete anchor.attribs['aria-current'];
    });
    for(const anchor of all(doc,'a'))if(/^candidater$/i.test(text(anchor)))anchor.attribs.href='/rentree-universitaire';
    const body=one(doc,'body');body.attribs.class=[...new Set((body.attribs.class+' cpms-site').split(/\s+/))].join(' ');
    assert.equal(serialize(one(doc,'footer')),footerHtml,`Footer différent de l’accueil : ${route}`);
    assert.equal(one(doc,'#loader img').attribs.src,logo,`Logo de chargement manquant : ${route}`);
    await writeFile(join(generated,file),serialize(doc));
  }
  return files.size;
}
