import { readFile, writeFile, mkdir, copyFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { dirname, join, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { Element, Text } from 'domhandler';
import { documentFrom, serialize, text, all, one, contents, label, put, link, replaceText, shape } from './editorial-dom.mjs';
import { values, recognition, campaignTitle, homeStatistics, documents, paperDeposit, tests, calendarNotice } from './cpms-home-content.mjs';
import { schoolPage } from './esims-school-page.mjs';
import { cycleContent } from './cpms-cycle-content.mjs';
import { newsPages } from './cpms-news-pages.mjs';
import { resolveEditorialLinks } from './cpms-links.mjs';
import { canonicalEditorialHref, legacyPageTargets } from './esims-link-targets.mjs';
import { buildBrandStyles, uniformSiteShell } from './cpms-branding.mjs';
import { campaignContent } from './cpms-campaign-page.mjs';
import { esimsHomepage } from './esims-home-page.mjs';
import { nameSite } from './esims-naming.mjs';
import { filieresPage } from './esims-navigation-pages.mjs';
import { preparatoryBeninPage, preparatoryTogoPage } from './esims-preparatory-page.mjs';
import { licenceTogoPage } from './esims-licence-page.mjs';
import { implantationsPage } from './esims-campus-page.mjs';
import { contactPage } from './esims-contact-page.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const legacy = '/Users/macbookpro/Documents/BACKEND APPS/MY LOCA/cpms';
const uploads = join(legacy, 'old-cpms/wp-extracted/wp/wp-content/uploads');
const inventory = JSON.parse(await readFile(join(root, '../docs/analyse/contenus-cpms.json'), 'utf8'));
const records = new Map(inventory.records.map(r => [r.id, r]));
const media = new Map(inventory.media.map(m => [String(m.id), m]));
const generated = join(root, 'src/generated/cpms');
const publicRoot = join(root, 'public');
const registry = {};
const copiedMedia = new Map();
const assetAudit = [];
const cropCache = new Map();
const issues = [];
let equipmentPhoto;
const excluded = new Set([154, 40921, 40979]);
const allowedFiles = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf', '.mp4']);
await mkdir(generated, { recursive: true });
await mkdir(join(root, 'src/data'), { recursive: true });

const safe = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const urlPath = s => s.split('/').map(encodeURIComponent).join('/');
const cleanText = s => s.replace(/犀利士|\uFEFF/g, '').replace(/\s+/g, ' ').trim();
const date = value => new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(value.replace(' ', 'T') + 'Z'));
const articleRoute = r => `/articles/${r.id}-${r.slug || 'cpms'}`;
const canonicalRoutes = {2:'/',3:'/confidentialite',81:'/cycle-ingenieur',85:'/cycle-preparatoire',127:'/admissions',145:'/contact',154:'/formations',159:'/qui-sommes-nous',245:'/qui-sommes-nous',287:'/admissions',295:'/domaines',462:'/rentree-universitaire'};
const oldPaths = new Map(inventory.records.filter(r=>r.status==='publish').map(r=>[new URL(r.old_url).pathname.replace(/\/$/, '')||'/',canonicalEditorialHref(canonicalRoutes[r.id]??articleRoute(r))]));
const shortTitles = {
  40819: 'Journée d’orientation des étudiants', 40820: 'Conférence sur les réseaux sociaux',
  40818: 'Portes ouvertes et soirée royale', 40817: 'Immersion culturelle à Ouidah',
  40816: 'Basketball au CPMS', 40815: 'Journées récréatives 2025–2026',
  40814: 'Visite de notre partenaire JUNIA', 40808: 'Merveille TOGBE', 77: 'Marie-Noëlle DANDJINOU',
};
const shortTitle = r => shortTitles[r.id] ?? cleanText(r.title).replace(/\s*\|.*$/, '');
const brief = r => {
  const s = cleanText(r.content_text);
  const first = s.match(/^.{30,190}?[.!?](?:\s|$)/)?.[0] ?? s.slice(0, 180);
  return first.length < s.length && !/[.!?]$/.test(first.trim()) ? first.trim().replace(/\s+\S*$/, '') + '…' : first.trim();
};

async function exists(file) { try { return (await stat(file)).isFile(); } catch { return false; } }

async function copyOriginal(from, relativePath) {
  if (!from || !relativePath || !allowedFiles.has(extname(relativePath).toLowerCase()) || relativePath.includes('..')) return null;
  const url = '/cpms/originals/' + urlPath(relativePath);
  if (!copiedMedia.has(url)) {
    const destination = join(publicRoot, 'cpms/originals', relativePath);
    await mkdir(dirname(destination), { recursive: true });
    await copyFile(from, destination);
    copiedMedia.set(url, { source: from, file: destination, url });
  }
  return url;
}

// Photos de l’accueil choisies explicitement, depuis la copie WordPress fournie.
const homePhotos = {};
for (const [name, relativePath] of Object.entries({
  banner: '2024/07/cropped-Bibliotheque2-1536x640.jpg',
  aboutFirst: '2026/02/jpo-2.jpeg',
  aboutSecond: '2026/03/Bibliotheque-1-1.jpg',
  preparatory: '2024/07/cropped-Bibliotheque2.jpg',
  projects: '2026/03/Salle-de-TP-1-1024x732.jpg',
  ouidah: '2026/02/ouidah/od-5.jpeg',
})) {
  homePhotos[name] = await copyOriginal(join(legacy, 'wordpress/wp-content/uploads', relativePath), relativePath);
}

for (const m of media.values()) {
  let relativePath = m.relative_path;
  let source = m.exists ? m.local_path : null;
  if (!source && m.file_from_url?.exists) { source = m.file_from_url.local_path; relativePath ||= m.file_from_url.relative_path; }
  if (!source && m.alternative_paths_same_basename?.length === 1) source = join(uploads, m.alternative_paths_same_basename[0]);
  if (source) m.publicUrl = await copyOriginal(source, relativePath);
}

async function legacyUrl(url) {
  const path = decodeURIComponent(new URL(url, 'https://cpms.education').pathname);
  const marker = '/wp-content/uploads/';
  if (!path.includes(marker)) return null;
  const rel = path.split(marker)[1];
  const canonical = '/cpms/originals/' + urlPath(rel);
  if (copiedMedia.has(canonical)) return canonical;
  const file = join(uploads, rel);
  return await exists(file) ? copyOriginal(file, rel) : null;
}

async function picture(record) {
  const entry = media.get(String(record.featured_media_id));
  if (entry?.publicUrl && /\.(jpg|jpeg|png|webp|gif)$/i.test(entry.publicUrl)) return entry.publicUrl;
  for (const m of record.media ?? []) {
    const url = await legacyUrl(m.url);
    if (url && /\.(jpg|jpeg|png|webp|gif)$/i.test(url)) return url;
  }
  return await legacyUrl('https://cpms.education/wp-content/uploads/2026/03/Etudiants-Jardin-1.jpg');
}

/** Préparer la photo pour la boîte originale, sans toucher aux CSS. */
async function fitPhoto(sourceUrl, oldSource, { contain = false } = {}) {
  if (!sourceUrl || !oldSource) return sourceUrl;
  const originalFile = join(publicRoot, oldSource.replace(/^\//, ''));
  if (!await exists(originalFile)) return sourceUrl;
  const size = await sharp(originalFile).metadata();
  const key = `${sourceUrl}:${size.width}x${size.height}:${contain}`;
  if (cropCache.has(key)) return cropCache.get(key);
  const from = copiedMedia.get(sourceUrl)?.file ?? join(publicRoot, decodeURIComponent(sourceUrl.replace(/^\//, '')));
  const name = createHash('sha256').update(key).digest('hex').slice(0, 18) + '.webp';
  const destination = join(publicRoot, 'cpms/slots', name);
  await mkdir(dirname(destination), { recursive: true });
  await sharp(from).rotate().resize(size.width, size.height, {
    fit: contain ? 'contain' : 'cover', position: contain ? 'left' : 'attention',
    background: { r: 255, g: 255, b: 255, alpha: contain ? 0 : 1 },
  }).webp({ quality: 80, lossless: contain }).toFile(destination);
  const result = '/cpms/slots/' + name;
  cropCache.set(key, result);
  assetAudit.push({ source: from, originalSlot: oldSource, output: result, width: size.width, height: size.height, fit: contain ? 'contain' : 'cover' });
  return result;
}

async function image(node, sourceUrl, alt, options) {
  if (!node || !sourceUrl) return;
  node.attribs.src = await fitPhoto(sourceUrl, node.attribs.src, options);
  node.attribs.alt = alt;
}

const allowedTags = new Set(['p','br','strong','em','b','i','u','h2','h3','h4','h5','h6','ul','ol','li','table','thead','tbody','tr','td','th','figure','figcaption','img','a','blockquote','video','source']);
const blockedHosts = /cialis|viagra|casino|porn|levitra/i;
const allowedHosts = /(^|\.)(cpms\.education|junia\.com|ecole-junia\.ma|ecpi-edu\.com|youtube\.com|youtu\.be)$/;
let removedSpam = 0;
async function sanitize(raw) {
  const doc = documentFrom(raw);
  async function walk(node) {
    if (node instanceof Text) { node.data = node.data.replace(/犀利士|\uFEFF/g, ''); return [node]; }
    if (!(node instanceof Element)) return [];
    if (['script','style','iframe','object','embed','form','input','button'].includes(node.name)) return [];
    if (node.name === 'a' && blockedHosts.test(node.attribs.href ?? '')) { removedSpam++; return []; }
    const children = (await Promise.all((node.children ?? []).map(walk))).flat();
    if (!allowedTags.has(node.name)) return children;
    const attrs = {};
    if (node.name === 'img' || node.name === 'source' || node.name === 'video') {
      const src = await legacyUrl(node.attribs.src ?? '');
      if (!src) return [];
      attrs.src = src;
      if (node.name === 'img') attrs.alt = cleanText(node.attribs.alt ?? 'Photo de l’archive CPMS');
      if (node.name === 'video') attrs.controls = '';
    }
    if (node.name === 'a') {
      const href = node.attribs.href ?? '';
      const local = await legacyUrl(href);
      const parsed = new URL(href || '/', 'https://cpms.education');
      if (local) attrs.href = local;
      else if (/^https?:$/.test(parsed.protocol) && allowedHosts.test(parsed.hostname)) attrs.href = parsed.hostname.endsWith('cpms.education') ? (oldPaths.get(parsed.pathname.replace(/\/$/,'')||'/')??'/contact') : parsed.href;
      if (!attrs.href) return children;
    }
    if (['td','th'].includes(node.name)) for (const key of ['colspan','rowspan']) if (/^\d+$/.test(node.attribs[key] ?? '')) attrs[key] = node.attribs[key];
    const result = new Element(node.name, attrs, children);
    children.forEach(c => { c.parent = result; });
    return [result];
  }
  return (await Promise.all(doc.children.map(walk))).flat().map(serialize).join('')
    .replace(/\[contact-form-7[^\]]*\]/g, '').replace(/<!--[^]*?-->/g, '');
}

const preparedRecords = [];
for (const r of records.values()) {
  if (r.status !== 'publish') continue;
  r.cleanHtml = await sanitize(r.content_html);
  r.cleanText = text(documentFrom(r.cleanHtml));
  r.photo = await picture(r);
  if (excluded.has(r.id)) continue;
  preparedRecords.push({ id:r.id, title:cleanText(r.title), shortTitle:shortTitle(r), slug:r.slug, type:r.type,
    categories:r.categories, publishedAt:r.published_at, modifiedAt:r.modified_at, oldUrl:r.old_url,
    route:canonicalEditorialHref(canonicalRoutes[r.id]??articleRoute(r)), contentHtml:r.cleanHtml, contentText:r.cleanText, image:r.photo, excerpt:brief({ ...r, content_text:r.cleanText }) });
}
const news = [40819,40820,40818,40817,40816,40815,40814].map(id => records.get(id));
const events = [40820,40818,40815,40817,40816,40814,40819,40805,40804].map(id => records.get(id));
const testimonies = [40808,77,251,40810,40809,40811,819,651,544,546,667,255].map(id => records.get(id));
const logo = await legacyUrl('https://cpms.education/wp-content/uploads/2022/09/cpms-300x300-1.png');
const garden = await legacyUrl('https://cpms.education/wp-content/uploads/2026/03/Etudiants-Jardin-1.jpg');
const classroom = records.get(159).photo;
const brochure = await legacyUrl('https://cpms.education/wp-content/uploads/2023/12/flyer.pdf');
const candidature = await legacyUrl('https://cpms.education/wp-content/uploads/2022/09/candidature.pdf');
// Le lecteur Magnific Popup du template reconnaît le format watch?v=.
const video = 'https://www.youtube.com/watch?v=YSag0j60gSQ';

const dictionary = {
  'Read More':'En savoir plus','READ MORE':'En savoir plus','Discover More':'Découvrir','View All Events':'Tous les événements',
  'Apply Now':'Candidater','Login':'Dossier','Register':'Brochure','CATEGORIES':'Parcours','Categories':'Rubriques',
  'Subscribe to Newsletter':'Les nouvelles du CPMS','Newsletter':'Actualités','Submit':'S’inscrire','Submit Now':'Envoyer',
  'Enter Your Email':'Votre adresse email','Name':'Nom','Email':'Email','Phone':'Téléphone','Subject':'Objet','Message':'Message',
  'Address':'Adresse','Email Address':'Email','Phone Number':'Téléphone','Get In Touch':'Contactez le CPMS',
  'Home':'Accueil','About Us':'Le CPMS','Blog':'Actualités','Blog Single':'Actualités','Events':'Événements',
  'Gallery':'Galerie','Faq':'Questions fréquentes','Courses':'Cursus','Recent Posts':'À lire','Archives':'Archives',
  'Next':'Suivant','Continue Reading':'Lire la suite','Leave a Reply':'Contacter le CPMS','Post Comment':'Envoyer',
  'Name*':'Nom*','Email*':'Email*','Your comment here...':'Votre message…','Privacy Policy':'Confidentialité',
  'Explore':'Le CPMS','Resources':'Ressources','Login/Register':'Admissions','Page Not Found':'Page introuvable',
  'Searching...':'Rechercher…','Search':'Rechercher','View Cart':'Admissions','Check Out':'Candidature',
  'Meta':'Ressources','What Our Students Says':'Les anciens témoignent','Instructor':'Accompagnement',
  'Law Book':'Brochure','LawBook':'Brochure','Spirit Level':'Candidature','Total':'Documents','Subtotal':'Documents',
};

async function common(doc) {
  replaceText(doc, dictionary);
  for (const input of all(doc, 'input, textarea')) {
    const placeholder = input.attribs.placeholder?.trim();
    if (placeholder && dictionary[placeholder]) input.attribs.placeholder = dictionary[placeholder];
    if (input.attribs.value && dictionary[input.attribs.value]) input.attribs.value = dictionary[input.attribs.value];
  }
  for (const anchor of all(doc,'a')) {
    if (/^mailto:/i.test(anchor.attribs.href ?? '')) link(anchor,'contact@cpms.education','mailto:contact@cpms.education');
    if (/^tel:/i.test(anchor.attribs.href ?? '') || /educavo\/tel/.test(anchor.attribs.href ?? '')) link(anchor,'01 62 72 10 72','tel:+2290162721072');
    if (/^(?:index\.html|index3\.html)(?:#)?$/.test(anchor.attribs.href ?? '')) anchor.attribs.href='/';
    if (anchor.attribs.href?.includes('youtube.com/watch')) anchor.attribs.href=video;
    if(one(anchor,'i.fa-facebook, span.fa-facebook'))anchor.attribs.href='https://www.facebook.com/cpmscotonou';
    if(one(anchor,'i.fa-instagram, span.fa-instagram'))anchor.attribs.href='https://www.instagram.com/prepamariestella/';
    if(one(anchor,'i.fa-twitter, i.fa-linkedin, i.fa-pinterest-p, i.fa-google-plus, i.fa-google-plus-square')){anchor.attribs['aria-disabled']='true';anchor.attribs.title='Lien à confirmer auprès du CPMS';}
  }
  for (const img of all(doc,'img')) if (/\/(?:lite-logo|dark-logo|logo-dark|logo|pre-logo)\.png$/.test(img.attribs.src ?? '')) await image(img,logo,'Cycle Préparatoire Sainte Marie Stella',{contain:true});
  for (const header of all(doc,'.nav-menu')) {
    const tops = all(header, '.nav-menu > li');
    const labels = ['Accueil','Qui sommes-nous','Cursus','Campus','Actualités','Contact'];
    const destinations = ['/','/qui-sommes-nous','/formations','/evenements','/actualites','/contact'];
    tops.forEach((item,i)=>link(item.children.find(n=>n instanceof Element&&n.name==='a'),labels[i]??'CPMS',destinations[i]??'/presentation'));
    const home = [
      ['Accueil','/'],['Présentation','/presentation'],['Nos valeurs','/presentation#rs-about'],['Cursus','/formations'],
      ['Cycle préparatoire','/cycle-preparatoire'],['Cycle ingénieur','/cycle-ingenieur'],['Stages','/cycle-preparatoire#stages'],
      ['Projets','/cycle-preparatoire#projets'],['Domaines','/domaines'],['Admissions','/admissions'],['Partenaires','/partenaires'],
      ['Actualités','/actualites'],['Événements','/evenements'],['Témoignages','/temoignages'],['Contact','/contact'],
    ];
    all(tops[0]??header,'.mega-menu a').forEach((a,i)=>link(a,...home[i%home.length]));
    const about=[['Présentation','/presentation'],['Partenaires','/partenaires']];
    all(tops[1]??header,'.sub-menu a').forEach((a,i)=>link(a,...about[i%about.length]));
    const courses=[['Cycle préparatoire','/cycle-preparatoire'],['Cycle ingénieur','/cycle-ingenieur'],['Domaines de professionnalisation','/domaines']];
    all(tops[2]??header,'.sub-menu a').forEach((a,i)=>link(a,...courses[i%courses.length]));
    const pages=[['Témoignages','/temoignages'],['Anciens étudiants','/temoignages'],['Parcours d’anciens','/temoignages'],['Témoignage','/articles/40808-merveille-togbe'],['Événements','/evenements'],['Vie étudiante','/evenements'],['Sport','/articles/40816-match-basketball-cpms-2025-2026'],['Culture','/articles/40817-immersion-culturelle-ouidah-cpms-2025-2026'],['Galerie','/galerie'],['Campus','/galerie'],['Rencontres','/galerie'],['Photos','/galerie'],['Admissions','/admissions'],['Candidature','/admissions'],['Brochure',brochure],['Questions fréquentes','/faq'],['Contact','/contact']];
    all(tops[3]??header,'.sub-menu a').forEach((a,i)=>link(a,...pages[i%pages.length]));
    all(tops[4]??header,'.sub-menu a').forEach((a,i)=>link(a,i===0?'Actualités':shortTitle(news[(i-1)%news.length]),i===0?'/actualites':articleRoute(news[(i-1)%news.length])));
    all(tops[5]??header,'.sub-menu a').forEach((a,i)=>link(a,...[['Contact','/contact'],['Admissions','/admissions'],['Candidature',candidature],['Brochure',brochure]][i%4]));
  }
  all(doc,'.cat-menu a').forEach((a,i)=>link(a,...[['Prépa','/cycle-preparatoire'],['Ingénieur','/cycle-ingenieur'],['Admissions','/admissions'],['Domaines','/domaines']][i%4]));
  for (const a of all(doc,'.topbar-right a')) {
    const value=text(a).toLowerCase();
    if(value.includes('dossier'))a.attribs.href='/admissions';
    if(value.includes('brochure'))a.attribs.href=brochure;
    if(value.includes('candidater'))a.attribs.href='/admissions';
  }
  put(doc,'.canvas-logo + .textwidget','Le CPMS accompagne les étudiants dans leur préparation scientifique et leur parcours vers les métiers de l’ingénieur.');
  put(doc,'.offcanvas-text p','Le CPMS accompagne les étudiants dans leur préparation scientifique et leur parcours vers les métiers de l’ingénieur.');
  for(const desc of all(doc,'.canvas-menu .textwidget, .offwrap .textwidget, .canvas-menu .desc, .off-canvas .desc')) label(desc,'Discipline, courtoisie, honnêteté et excellence : les valeurs du CPMS.');
  const galleryPictures=[garden,classroom,...news.slice(0,4).map(r=>r.photo)];
  for(const [i,a] of all(doc,'.offcanvas-gallery a, .canvas-menu .gallery-img a').entries()) {
    const img=one(a,'img');await image(img,galleryPictures[i%galleryPictures.length],'La vie au CPMS');if(img)a.attribs.href=img.attribs.src;
  }
  for(const stat of all(doc,'.rs-count')) {
    label(stat,'—');stat.attribs['data-cpms-stat']='unconfirmed';stat.attribs['aria-label']='Chiffre à confirmer';
  }
  all(doc,'.counter-item .title').forEach((el,i)=>label(el,['Effectif','Moyenne','Réussite'][i%3]));
  for(const a of all(doc,'.popup-videos')) {a.attribs.href=video;put(a,'.title','Découvrez le CPMS en vidéo');}
  for(const cta of all(doc,'.rs-cta')) {
    put(cta,'.sec-title .title','Candidater au CPMS');
    put(cta,'.sec-title .desc','Retrouvez les pièces à fournir et le formulaire de candidature. Le secrétariat vous renseignera sur les prochaines dates.');
    const button=one(cta,'.readon2');link(button,'Préparer mon dossier','/admissions');
  }
  for(const donation of all(doc,'.donation-part')) {
    put(donation,'.title','Notre engagement');put(donation,'.desc','Discipline, courtoisie, honnêteté et excellence : ces valeurs accompagnent la formation et l’épanouissement des étudiants.');
    link(one(donation,'a'),'Découvrir le CPMS','/presentation');await image(one(donation,'img'),classroom,'Un cadre de travail au CPMS');
  }
  for(const newsletter of all(doc,'.rs-newsletter')) {
    const title=one(newsletter,'.sec-title .title');if(title)label(title,title.children.some(n=>n instanceof Element&&n.name==='br')?'Les nouvelles|du CPMS':'Les nouvelles du CPMS');
    put(newsletter,'.sub-title','Actualités');
  }
  for(const footer of all(doc,'footer')) {
    for(const desc of all(footer,'.textwidget p'))label(desc,'Le CPMS prépare les étudiants aux métiers de l’ingénieur, avec une formation scientifique et un accompagnement personnalisé.');
    all(footer,'.address-widget .desc').forEach((el,i)=>{
      if(i===0) label(el,'Vèdoko, Cotonou, Bénin');
      for(const [j,a] of all(el,'a').entries())if(i===1)link(a,j===0?'01 62 72 10 72':'01 49 14 12 77',j===0?'tel:+2290162721072':'tel:+2290149141277');else if(i===2)link(a,j===0?'contact@cpms.education':'cpms.education',j===0?'mailto:contact@cpms.education':'/');
    });
    const lists=[
      [['Qui sommes-nous','/qui-sommes-nous'],['Histoire',articleRoute(records.get(245))],['Partenaires','/qui-sommes-nous#ecoles-partenaires'],['Vie étudiante','/evenements'],['Actualités','/actualites']],
      [['Cycle préparatoire','/cycle-preparatoire'],['Cycle ingénieur','/cycle-ingenieur'],['Matières','/qui-sommes-nous#matieres'],['Stages','/cycle-preparatoire#stages'],['Domaines','/domaines']],
      [['Admissions','/admissions'],['Candidature',candidature],['Brochure',brochure],['Galerie','/galerie'],['Confidentialité','/confidentialite']],
    ];
    all(footer,'.site-map').forEach((list,i)=>all(list,'a').forEach((a,j)=>link(a,...lists[i%3][j%5])));
    const resourceList=all(footer,'.site-map').at(-1);
    if(resourceList&&!all(resourceList,'a').some(a=>a.attribs.href==='/faq'))contents(resourceList,resourceList.children.map(serialize).join('')+'<li data-cpms-faq-link="true"><a href="/faq">FAQ — Questions fréquentes</a></li>');
    all(footer,'.recent-post').forEach((post,i)=>{
      const r=news[i%news.length];link(one(post,'.post-desc a'),shortTitle(r),articleRoute(r));label(one(post,'.post-date'),date(r.published_at));
    });
    const copyright=one(footer,'.copyright p');if(copyright){const a=one(copyright,'a');label(copyright,'© 2026 CPMS — Tous droits réservés. Template :');if(a){label(a,'RSTheme');a.attribs.href='https://rstheme.com/';}}
  }
  for(const a of all(doc,'.cart-bottom-part a'))a.attribs.href='/admissions';
  for(const img of all(doc,'.cart-body img'))await image(img,garden,'Informations de candidature');
  for(const box of all(doc,'.cart-body, .cart-content')) {
    const visit=node=>{if(node instanceof Text&&/[$£€]\s*\d/.test(node.data))node.data=node.data.replace(/[$£€]\s*[\d.,]+/g,'Archive');for(const child of node.children??[])visit(child);};visit(box);
    for(const a of all(box,'a'))a.attribs.href='/admissions';
  }
  for(const form of all(doc,'.search-modal form')){
    form.attribs.action='/recherche';form.attribs.method='get';
    const input=one(form,'input');if(input){input.attribs.name='q';input.attribs.placeholder='Rechercher au CPMS…';}
  }
}

async function testimonialBlocks(doc) {
  for(const [i,card] of all(doc,'.testi-wrap, .rs-testimonial .testi-item').entries()) {
    const r=i%2===0?records.get(40808):records.get(77);
    const quote=r.id===40808?'Je me suis toujours sentie soutenue et jamais mise de côté. Ils nous poussaient à nous surpasser et restaient à l’écoute.':'Franchement, j’ai adoré l’enseignement au CPMS ; les professeurs compétents sont à votre écoute.';
    const promotion=r.id===40808?'2025':'2024';
    put(card,'.desc',quote);put(card,'.name',shortTitle(r));put(card,'.designation','Promotion '+promotion);await image(one(card,'.img-part img'),r.photo,shortTitle(r));
    const info=one(card,'.info');if(info)info.attribs['data-cpms-promotion']=promotion;
  }
}

async function partnerLogos() {
  const junia=await copyOriginal(join(legacy,'jumia hei.png'),'branding/junia.png');
  const ecpi=await copyOriginal(join(legacy,'ecpi.webp'),'branding/ecpi.webp');
  return {junia,ecpi};
}

async function homepage(doc) {
  const slides=all(doc,'.slider-content');
  [['Cycle préparatoire à Cotonou','Bienvenue au CPMS','Découvrir le CPMS','/presentation'],['Un parcours vers l’ingénierie','Préparez votre avenir','Découvrir le cursus','/formations']].forEach((v,i)=>{put(slides[i],'.sl-sub-title',v[0]);put(slides[i],'.sl-title',v[1]);link(one(slides[i],'.sl-btn a'),v[2],v[3]);});
  const services=[['Discipline','/presentation',classroom],['Courtoisie','/presentation',garden],['Honnêteté','/presentation',records.get(81).photo],['Excellence','/presentation',records.get(40816).photo]];
  for(const [i,card] of all(doc,'.service-item').entries()){link(one(card,'.title a'),services[i][0],services[i][1]);await image(card.children.find(n=>n instanceof Element&&n.name==='img'),services[i][2],services[i][0]);}
  put(doc,'#rs-about .sub-title','À propos du CPMS');put(doc,'#rs-about .sec-title .title','Bienvenue au CPMS de Cotonou');
  put(doc,'#rs-about .sec-title .desc','Le CPMS allie préparation scientifique et accompagnement personnalisé, autour de quatre valeurs : discipline, courtoisie, honnêteté et excellence.');
  for(const [i,card] of all(doc,'#rs-about .counter-item').entries()) {
    const stat=homeStatistics[i];if(!stat)continue;
    const number=one(card,'.rs-count');label(number,String(stat.value));
    number.attribs['data-cpms-stat']='confirmed';
    number.attribs['aria-label']=`${stat.prefix?stat.prefix+' ':''}${stat.value} ${stat.label}`;
    if(stat.prefix)number.attribs['data-cpms-prefix']=stat.prefix;
    put(card,'.title',stat.label);
  }
  link(one(doc,'#rs-about .readon2'),'En savoir plus','/presentation');
  for(const [i,img] of all(doc,'#rs-about .image-grid img').entries())await image(img,i?homePhotos.aboutSecond:homePhotos.aboutFirst,i?'La bibliothèque du CPMS':'Journée portes ouvertes au CPMS');
  put(doc,'.rs-degree .sub-title','Nos parcours');put(doc,'.rs-degree .sec-title .title','Préparez votre avenir avec le CPMS');
  const degrees=[['Cycle préparatoire','Deux années de préparation scientifique, avec travaux pratiques, projets et accompagnement pédagogique.','/cycle-preparatoire',homePhotos.preparatory],['Cycle ingénieur','Découvrez la poursuite d’études dans les écoles partenaires après le cycle préparatoire.','/cycle-ingenieur',records.get(81).photo],['Stages académiques','Des stages de quatre semaines pour découvrir l’entreprise et construire son projet professionnel.','/cycle-preparatoire#stages',classroom],['Projets scientifiques','Des projets en équipe, présentés lors d’une soutenance en fin d’année.','/cycle-preparatoire#projets',homePhotos.projects],['Métiers d’avenir','Découvrez les domaines de professionnalisation ouverts par le parcours ingénieur.','/domaines',garden]];
  for(const [i,card] of all(doc,'.degree-wrap').entries()){const v=degrees[i];put(card,'.title-part .title',v[0]);link(one(card,'.content-part .title a'),v[0],v[2]);put(card,'.desc',v[1]);link(one(card,'.btn-part a'),'En savoir plus',v[2]);await image(one(card,'img'),v[3],v[0]);}
  put(doc,'.rs-latest-events .sub-title','Vie au CPMS');put(doc,'.rs-latest-events .sec-title .title','Événements du CPMS');
  const eventInfo=[[40820,'Févr','20'],[40818,'Janv','30'],[40815,'Janv','28']];
  for(const [i,card] of all(doc,'.events-short').entries()){const [id,month,day]=eventInfo[i];const r=records.get(id);put(card,'.month',month);put(card,'.date',day);link(one(card,'.title a'),i===0?'Conférence : amour et chantage émotionnel sur les réseaux sociaux':r.title,articleRoute(r));all(card,'.categorie a').forEach((a,j)=>link(a,j?'Vie étudiante':'Événements','/evenements'));}
  await image(one(doc,'.rs-latest-events .single-img img'),homePhotos.ouidah??news[0].photo,'Vie au CPMS — Immersion à Ouidah');link(one(doc,'.rs-latest-events .btn-part a'),'Tous les événements','/evenements');
  await testimonialBlocks(doc);
  const homePartnerLogos=await partnerLogos();
  put(doc,'#rs-blog .sub-title','Actualités');put(doc,'#rs-blog .sec-title .title','Les nouvelles du CPMS');
  for(const [i,card] of all(doc,'#rs-blog .blog-item').entries())await fillBlogCard(card,news[i%news.length]);
  // Réutiliser les deux blocs existants de l'accueil, sans changer leurs classes.
  put(doc,'.rs-cta .sec-title .title',values);
  put(doc,'.rs-cta .sec-title .desc',recognition);
  link(one(doc,'.rs-cta .readon2'),'Découvrir le CPMS','/presentation');
  put(doc,'.donation-part .title',campaignTitle);
  contents(one(doc,'.donation-part .desc'),`Les élèves de Terminales C, D et E sont invités à préparer leurs dossiers pour un envoi à <a href="mailto:contact@cpms.education">contact@cpms.education</a>. Retrouvez les six pièces à fournir et les étapes dans la procédure d’inscription. Contactez le secrétariat pour confirmer le calendrier actuel.`);
  link(one(doc,'.donation-part .btn-part a'),'Procédure d’inscription','/admissions');
  const actions=one(doc,'.donation-part .btn-part');
  actions.attribs.class += ' cpms-admissions-actions';
  contents(actions,serialize(one(actions,'a'))+`<a class="readon2 mod cpms-brochure" href="${brochure}">Télécharger la brochure</a>`);
  const nativeCourses=documentFrom(await readFile(join(root,'src/templates/educavo/index.html'),'utf8'));
  const lab=await legacyUrl('/wp-content/uploads/2026/03/Salle-de-TP-1.jpg');
  const source=copiedMedia.get(lab).file,metadata=await sharp(source).metadata();
  equipmentPhoto='/cpms/slots/materiel-scientifique.webp';
  await sharp(source).rotate().extract({left:Math.round(metadata.width*.52),top:Math.round(metadata.height*.54),width:Math.floor(metadata.width*.48),height:Math.floor(metadata.height*.46)}).resize(900,560,{fit:'cover'}).webp({quality:85}).toFile(join(publicRoot,equipmentPhoto));
  const heroPhotos=[];
  for(const [src,alt]of [[lab,'Travaux pratiques au CPMS à Cotonou'],[homePhotos.banner,'La bibliothèque du CPMS à Cotonou'],[classroom,'Les étudiants du CPMS en salle de cours']])heroPhotos.push({src:await fitPhoto(src,'assets/images/slider/h2-1.jpg'),alt});
  const homeTestimonials = [
    { id: 40808, name: 'Merveille TOGBE', promotion: 'Promotion 2025', quote: 'Je me suis toujours sentie soutenue et jamais mise de côté. Ils nous poussaient à nous surpasser et restaient à l’écoute même quand ça n’allait pas.' },
    { id: 77, name: 'Marie-Noëlle DANDJINOU', promotion: 'Promotion 2024', quote: "Après avoir validé mes deux ans de prépa, je suis allée à HEI JUNIA Lille, qui est l’une des écoles partenaires au CPMS. Là je peux vous dire que j’ai bénéficié d’un accueil très chaleureux de la part de ladite école." },
    { id: 251, name: 'Ricardo TONON', quote: "J’ai beaucoup aimé mon enseignement au CPMS, des professeurs compétents sont mis à notre disposition pour nous aider et nous guider tout au long de l’année." },
    { id: 255, name: 'Josée-Marie CHINA', quote: "C’était une expérience incroyable à cause de la qualité de l’enseignement qui s’appuie sur le programme français, la proximité des étudiants avec des professeurs compétents." },
  ].map(item => {
    const record = records.get(item.id);
    const normalizeQuote = value => value.normalize('NFKD').replace(/[^\p{L}\p{N}]/gu, '').toLowerCase();
    assert.ok(normalizeQuote(record.cleanText).includes(normalizeQuote(item.quote)), `Le témoignage ${item.id} doit provenir du texte WordPress.`);
    return { ...item, photo: record.photo, href: articleRoute(record) };
  });
  await esimsHomepage(doc,{nativeCourses,heroPhotos,coursePhotos:[homePhotos.preparatory,lab,equipmentPhoto],testimonials:homeTestimonials,partnerLogos:homePartnerLogos,image,safe});
}

async function fillBlogCard(card,r) {
  await image(one(card,'img'),r.photo,shortTitle(r));
  link(one(card,'.title a, .blog-title a'),shortTitle(r),articleRoute(r));
  put(card,'.desc, .blog-desc',brief({...r,content_text:r.cleanText}));
  all(card,'.blog-meta li').forEach((li,i)=>{
    if(li.children.every(n=>!(n instanceof Element)||n.name==='i'))label(li,i===0?'CPMS':date(r.published_at));
  });
  put(card,'.author','CPMS');put(card,'.blog-date',date(r.published_at));
  link(one(card,'.cmnt-part a'),'Lire l’article',articleRoute(r));
  link(one(card,'.btn-part a, .blog-button a'),'Lire la suite',articleRoute(r));
  for(const a of all(card,'.blog-img a'))a.attribs.href=articleRoute(r);
  link(one(card,'.tag-line a'),r.categories[0]??'CPMS',r.categories.includes('Témoignages')?'/temoignages':'/evenements');
}

async function about(doc) {
  const source=documentFrom(records.get(159).cleanHtml);
  const paragraphs=all(source,'p').map(p=>text(p).replace(/professionnel\s+le/g,'professionnelle'));
  const rows=all(one(source,'table'),'tr').slice(1).map(row=>all(row,'td').map(text));
  await schoolPage(doc, {
    homeHtml: await readFile(join(generated,'.html'),'utf8'),
    faqHtml: await readFile(join(root,'src/templates/educavo/faq.html'),'utf8'),
    rows, paragraphs, safe, image,
    photos: {
      banner: await legacyUrl('/wp-content/uploads/2026/03/Etdts-Escaliers-2.jpg'),
      intro: homePhotos.aboutFirst,
      lab: await legacyUrl('/wp-content/uploads/2026/03/Salle-de-TP-1-1024x732.jpg'),
    },
  });
}

async function courseGrid(doc,domains=false) {
  put(doc,'.rs-breadcrumbs h1',domains?'Domaines de professionnalisation':'Les parcours du CPMS');
  const items=domains?[
    ['Ingénierie médicale','/articles/295-quelques-domaines-de-profesionnalisation-en-cycle-ingenieur',await legacyUrl('/wp-content/uploads/2022/10/medical.png')],
    ['Intelligence artificielle','/articles/295-quelques-domaines-de-profesionnalisation-en-cycle-ingenieur',await legacyUrl('/wp-content/uploads/2022/10/ai.png')],
    ['Informatique et numérique','/articles/295-quelques-domaines-de-profesionnalisation-en-cycle-ingenieur',await legacyUrl('/wp-content/uploads/2022/10/computer.png')],
    ['Conception mécanique','/articles/295-quelques-domaines-de-profesionnalisation-en-cycle-ingenieur',await legacyUrl('/wp-content/uploads/2022/10/mechanic.png')],
    ['Bâtiment et architecture','/articles/295-quelques-domaines-de-profesionnalisation-en-cycle-ingenieur',await legacyUrl('/wp-content/uploads/2022/10/architect.png')],
    ['Chimie et transition','/articles/295-quelques-domaines-de-profesionnalisation-en-cycle-ingenieur',await legacyUrl('/wp-content/uploads/2022/10/chemist.png')],
  ]:[['Cycle préparatoire','/cycle-preparatoire',records.get(85).photo],['Cycle ingénieur','/cycle-ingenieur',records.get(81).photo],['Stages académiques','/cycle-preparatoire#stages',classroom],['Projets scientifiques','/cycle-preparatoire#projets',garden],['Domaines professionnels','/domaines',records.get(81).photo],['Admissions','/admissions',garden]];
  for(const [i,card] of all(doc,'.courses-item').entries()){
    const item=items[i%items.length];await image(one(card,'.img-part img'),item[2],item[0]);link(one(card,'.title a'),item[0],item[1]);
    put(card,'.price',domains?'Cycle':'CPMS');link(one(card,'.categorie'),domains?'Ingénieur':'Parcours',item[1]);
    put(card,'.user','CPMS');put(card,'.ratings','Non noté');
    const arrow=one(card,'.btn-part a');if(arrow)arrow.attribs.href=item[1];
  }
  all(doc,'.gridFilter button').forEach((button,i)=>label(button,['Tous','Sciences','Ingénierie','Technologies','Parcours'][i%5]));
  // Les six domaines tiennent sur une page ; aucune pagination de démonstration.
  for(const pagination of all(doc,'.pagination-area'))pagination.parent.children=pagination.parent.children.filter(child=>child!==pagination);
}

async function courseDetail(doc,engineer=false) {
  const home=documentFrom(await readFile(join(generated,'.html'),'utf8'));
  for(const selector of ['.full-width-header','.rs-newsletter','footer']) {
    const target=one(doc,selector),reference=one(home,selector);
    target.attribs={...reference.attribs};contents(target,reference.children.map(serialize).join(''));
  }
  all(doc,'.nav-menu > li').forEach((li,i)=>{li.attribs.class=(li.attribs.class??'').replace(/current-menu-item/g,'').trim()+(i===2?' current-menu-item':'');});
  one(doc,'body').attribs.class+=' cpms-course-page';
  const record=records.get(engineer?81:85);
  const title=engineer?'Le cycle ingénieur':'Le cycle préparatoire';
  put(doc,'.rs-breadcrumbs h1',title);
  label(all(doc,'.rs-breadcrumbs li').at(-1),title);
  const schoolPhoto=await legacyUrl('/wp-content/uploads/2022/10/junia_france.jpg');
  const classroomPhoto=await legacyUrl('/wp-content/uploads/2026/03/Salle-de-cours-3-1024x731.jpg');
  await image(one(doc,'.rs-breadcrumbs img'),engineer?schoolPhoto:classroomPhoto,engineer?'JUNIA France':'Les étudiants du CPMS en salle de cours');
  const {panels,source,paragraphs}=cycleContent(record,engineer,safe,schoolPhoto);
  const tabs=all(doc,'.intro-tabs > li'),panes=all(doc,'#myTabContent > .tab-pane');
  panels.forEach((panel,i)=>{
    const a=one(tabs[i],'a');label(a,panel.label);a.attribs.href='#'+panes[i].attribs.id;a.attribs['data-target']='#'+panes[i].attribs.id;
    contents(panes[i],panel.html);
  });
  const discard=node=>{node.parent.children=node.parent.children.filter(n=>n!==node);};
  tabs.slice(panels.length).forEach(discard);panes.slice(panels.length).forEach(discard);
  one(doc,'.intro-tabs').attribs.class+=' nav-fill';
  const labels=engineer?['Partenaire','Poursuite','Accès décrit','Écoles','Diplômes']:['Programme','Cycle','Stage académique','Projet','Suivi'];
  const featureValues=engineer?['JUNIA','Après la prépa','Sans concours','HEI · ISA · ISEN','Ingénieur']:['CP2i','Deux années','4 semaines','En groupe','TD · TP · Khôls'];
  all(doc,'.course-features-info li').forEach((li,i)=>{put(li,'.label',labels[i]);put(li,'.value',featureValues[i]);});
  one(doc,'.intro-video').attribs.class='intro-video media-icon';
  put(doc,'.intro-video h4','Découvrez le CPMS');
  await image(one(doc,'.intro-video img'),classroomPhoto,'Les étudiants du CPMS');
  one(doc,'.intro-video .popup-videos').attribs.href=video;
  all(doc,'.video-column .btn-part a').forEach((a,i)=>{
    link(a,i?'Candidater':'Télécharger la brochure',i?'/admissions':brochure);
    a.attribs.class=i?'btn readon2':'btn readon2 transparent';
  });
  if (!engineer) {
    const aboutSource=documentFrom(records.get(159).cleanHtml);
    preparatoryBeninPage(doc, {
      panels,homeHtml:serialize(home),brochure,candidature,video,safe,
      photos:{classroom:classroomPhoto,lab:await legacyUrl('/wp-content/uploads/2026/03/Salle-de-TP-1-1024x732.jpg'),library:homePhotos.aboutSecond},
      subjectParagraphs:all(aboutSource,'p').map(text),
      subjectRows:all(one(aboutSource,'table'),'tr').slice(1).map(row=>all(row,'td').map(text)),
    });
  }
  const finalText=text(doc);
  paragraphs.forEach(p=>assert(finalText.includes(text(p)),`Paragraphe du cycle manquant : ${text(p)}`));
  for(const item of all(source,'li, figcaption'))assert(finalText.includes(text(item)),`Liste ou légende manquante : ${text(item)}`);
  const before=all(source,'table').map(table=>all(table,'tr').map(row=>all(row,'td, th').map(text)).filter(row=>row.some(Boolean)).slice(1));
  const after=all(doc,'.cpms-course-table').map(table=>all(table,'tbody tr').map(row=>all(row,'td, th').map(text)));
  assert.deepEqual(after,before,'Les frais et échéances doivent être intégralement conservés.');
  for(const img of all(source,'img'))assert(all(doc,'.intro-section img').some(node=>node.attribs.src===img.attribs.src),`Image du cycle manquante : ${img.attribs.src}`);
}

async function listing(doc,list,title,page=1,totalPages=1,base='actualites') {
  put(doc,'.rs-breadcrumbs h1',title);
  for(const [i,card] of all(doc,'.rs-inner-blog .blog-item').entries())await fillBlogCard(card,list[i%list.length]);
  const groups=all(doc,'.widget-area .recent-posts');
  for(const [i,a] of all(groups[0], 'ul a').entries())link(a,shortTitle(list[i%list.length]),articleRoute(list[i%list.length]));
  const sideLinks=[['Cycle préparatoire','/cycle-preparatoire'],['Cycle ingénieur','/cycle-ingenieur'],['Admissions','/admissions'],['Contact','/contact']];
  if(groups[1])all(groups[1],'ul a').forEach((a,i)=>link(a,...sideLinks[i%4]));
  const archiveGroups=all(doc,'.widget-area .widget-archives');
  if(archiveGroups[0]){
    put(archiveGroups[0],'.widget-title','Navigation');
    const links=all(archiveGroups[0],'a');
    link(links[0],'Page précédente',page>2?`/${base}/page/${page-1}`:`/${base}`);
    link(links[1],'Page suivante',page<totalPages?`/${base}/page/${page+1}`:`/${base}`);
    if(page===1&&links[0])links[0].attribs['aria-disabled']='true';
    if(page===totalPages&&links[1])links[1].attribs['aria-disabled']='true';
  }
  if(archiveGroups[1])all(archiveGroups[1],'a').forEach((a,i)=>link(a,i?'Témoignages':'Événements',i?'/temoignages':'/evenements'));
  const pager=all(doc,'.pagination-area a');
  for(const [i,a] of pager.entries()){
    const number=i===pager.length-1?Math.min(totalPages,page+1):Math.max(1,page-1)+i;
    a.attribs.href=number<=totalPages?(number===1?`/${base}`:`/${base}/page/${number}`):`/${base}`;
    if(i<pager.length-1)label(a,number<=totalPages?String(number):'—');
    if(number>totalPages||(i===pager.length-1&&page===totalPages))a.attribs['aria-disabled']='true';
  }
}

async function article(doc,r,titleOverride) {
  put(doc,'.rs-breadcrumbs h1',titleOverride??(r.categories.includes('Témoignages')?'Témoignages':'Actualités'));
  await image(one(doc,'.bs-img img'),r.photo,shortTitle(r));
  const leadImageLink=one(doc,'.bs-img a');if(leadImageLink)leadImageLink.attribs.href=r.photo;
  const metadata=all(doc,'.single-post-meta .p-date');label(metadata[0],date(r.published_at));label(metadata[1],'CPMS');
  link(one(doc,'.single-post-meta .tag-line a'),r.categories[0]??'CPMS','/actualites');put(doc,'.single-post-meta .post-comment','Archive');
  const parts=documentFrom(r.cleanHtml).children.filter(n=>n instanceof Element||n instanceof Text&&n.data.trim());
  const slots=all(doc,'.blog-full .blog-desc');const groups=Array.from({length:slots.length},()=>[]);
  if(parts.length){parts.forEach((part,i)=>groups[Math.min(slots.length-1,Math.floor(i*slots.length/parts.length))].push(serialize(part)));}
  for(const [i,slot] of slots.entries())contents(slot,groups[i].join('')||'<p>Retrouvez les informations et les contacts du CPMS pour découvrir l’établissement et préparer votre parcours.</p>');
  put(doc,'.blog-full blockquote p',brief({...r,content_text:r.cleanText})||cleanText(r.title));
  const titles=all(doc,'.blog-full h2.title');label(titles[0],shortTitle(r));label(titles[1],'Pour poursuivre votre parcours');put(doc,'.blog-full .sm-title','Le CPMS à votre écoute');
  for(const [i,li] of all(doc,'.blog-full > .unorder-list li').entries())label(li,['Formation scientifique','Accompagnement pédagogique','Travail en équipe','Poursuite d’études','Contact avec le secrétariat'][i%5]);
  await image(one(doc,'.blog-img img'),(await legacyUrl(r.media?.find(m=>m.url&&!m.url.endsWith('.mp4'))?.url??''))||r.photo,shortTitle(r));
  const nextLink=one(doc,'.ps-navigation .next-link');label(nextLink,'Découvrir le CPMS');if(nextLink?.parent?.attribs)nextLink.parent.attribs.href='/presentation';
  const informationLink=one(doc,'.ps-navigation .link-text');label(informationLink,'Informations de candidature');if(informationLink?.parent?.attribs)informationLink.parent.attribs.href='/admissions';
  put(doc,'.comment-full > p','Le service d’envoi sera connecté à l’administration du CPMS. Vous pouvez contacter le secrétariat par téléphone ou par email.');
  all(doc,'.comment-full input').forEach((input,i)=>{if(input.attribs.type!=='submit')input.attribs.name=i===0?'name':'email';else input.attribs.form='contact-form';});
  const message=one(doc,'.comment-full textarea');if(message)message.attribs.name='message';
}

async function contact(doc) {
  await siteShell(doc,5);
  contactPage(doc,{homeHtml:await readFile(join(generated,'.html'),'utf8')});
}

async function siteShell(doc,active=-1) {
  const home=documentFrom(await readFile(join(generated,'.html'),'utf8'));
  for(const selector of ['.full-width-header','.rs-newsletter','footer']){
    const target=one(doc,selector),source=one(home,selector);if(!target||!source)continue;
    target.attribs={...source.attribs};contents(target,source.children.map(serialize).join(''));
  }
  all(doc,'.nav-menu > li').forEach((li,i)=>{li.attribs.class=(li.attribs.class??'').replace(/current-menu-item/g,'').trim()+(i===active?' current-menu-item':'');});
}

async function errorPage(doc) {
  await siteShell(doc);
  one(doc,'body').attribs.class+=' cpms-error-page';
  put(doc,'.error-message','Page introuvable ou indisponible');
  const form=one(doc,'.error-text form');form.attribs.action='/recherche';form.attribs.method='get';
  const input=one(form,'input');input.attribs.name='q';input.attribs.placeholder='Rechercher sur le site CPMS…';input.attribs['aria-label']='Rechercher sur le site CPMS';
  one(form,'button').attribs['aria-label']='Lancer la recherche';
  const back=one(doc,'.error-text > a');link(back,'Retour à l’accueil','/');back.attribs.title='Retour à l’accueil';back.attribs.class='readon';
}

async function gallery(doc) {
  put(doc,'.rs-breadcrumbs h1','La vie au CPMS');
  const choices=[garden,classroom,...events.map(r=>r.photo),records.get(85).photo];
  for(const [i,card] of all(doc,'.gallery-img').entries()){const img=one(card,'img');await image(img,choices[i%choices.length],'Photo de la vie au CPMS');const a=one(card,'a');if(a&&img)a.attribs.href=img.attribs.src;}
}

async function faq(doc) {
  await siteShell(doc);
  one(doc,'body').attribs.class+=' cpms-faq-page';
  put(doc,'.rs-breadcrumbs h1','Questions fréquentes');
  label(all(doc,'.rs-breadcrumbs li').at(-1),'Questions fréquentes');
  one(doc,'.rs-faq-part').attribs.class=one(doc,'.rs-faq-part').attribs.class.replace(/\borange-color\b/g,'');
  const qa=[
    ['Combien de temps dure le cycle préparatoire ?','Le cycle préparatoire se déroule sur deux années. Retrouvez le programme sur la page <a href="/cycle-preparatoire">Cycle préparatoire</a>.'],
    ['Comment les étudiants sont-ils accompagnés ?','La formation associe cours, travaux dirigés, travaux pratiques et khôls. Les modalités sont présentées dans la rubrique Pédagogie du <a href="/cycle-preparatoire">cycle préparatoire</a>.'],
    ['Où consulter les matières et les coefficients ?','Le tableau des matières et coefficients figure sur la page <a href="/qui-sommes-nous#matieres">Qui sommes-nous</a>.'],
    ['Comment poursuivre en cycle ingénieur ?','La présentation du <a href="/cycle-ingenieur">cycle ingénieur</a> décrit la poursuite d’études après la prépa. Le secrétariat confirme les modalités d’accès actuelles.'],
    ['Quelles sont les écoles partenaires ?','Retrouvez HEI, ISA et ISEN (groupe JUNIA), ainsi qu’ECPI Dakar, dans la section <a href="/qui-sommes-nous#ecoles-partenaires">Écoles partenaires</a>.'],
    ['Des stages et des projets sont-ils prévus ?','Le programme décrit un stage académique de quatre semaines et des projets en groupe. Consultez la rubrique <a href="/cycle-preparatoire#stages">Stages et projets</a>.'],
    ['Où se trouve le CPMS ?','Le CPMS se trouve à Vèdoko, à Cotonou, au Bénin. Consultez la page <a href="/contact">Contact</a> et appelez le secrétariat pour les indications de trajet.'],
    ['Où suivre la vie de l’établissement ?','Les <a href="/actualites">actualités</a> et les <a href="/evenements">événements</a> présentent la vie au CPMS. Retrouvez les photos dans les articles.'],
    ['Comment contacter le secrétariat ?','Écrivez à <a href="mailto:contact@cpms.education">contact@cpms.education</a> ou appelez le <a href="tel:+2290162721072">+229 01 62 72 10 72</a> / <a href="tel:+2290149141277">+229 01 49 14 12 77</a>.'],
    ['À qui s’adresse la candidature ?','Les informations d’inscription concernent les élèves de Terminales C, D et E. Retrouvez les étapes sur la page <a href="/admissions">Procédure d’inscription</a> ; le secrétariat confirme le calendrier en cours.'],
    ['Quelles sont les pièces à fournir ?','Les six pièces demandées sont détaillées dans la <a href="/admissions">procédure d’inscription</a>. Le <a href="'+candidature+'">formulaire de candidature</a> est disponible au téléchargement.'],
    ['Où télécharger la brochure ?','La <a href="'+brochure+'">brochure du CPMS au format PDF</a> est disponible depuis ce lien, ainsi que dans le pied de page du site.'],
  ];
  all(doc,'.rs-faq-part .card').forEach((card,i)=>{
    const a=one(card,'.card-link'),panel=one(card,'.collapse');
    label(a,qa[i][0]);contents(one(card,'.card-body'),qa[i][1]);
    a.attribs.href='#'+panel.attribs.id;a.attribs['data-target']='#'+panel.attribs.id;a.attribs['aria-controls']=panel.attribs.id;a.attribs['aria-expanded']=String(i%3===0);
    a.attribs.class=i%3===0?'card-link':'card-link collapsed';panel.attribs.class=i%3===0?'collapse show':'collapse';
  });
  all(doc,'.rs-faq-part .content-part > .title h3').forEach((h,i)=>label(h,['Formation','Parcours','Vie au CPMS','Admissions'][i]));
}

async function make(name,source,title,adapt,aliases=[]) {
  const original=documentFrom(await readFile(join(root,'src/templates/educavo',source),'utf8'));
  const preservedHomeSections=['.rs-cta','.rs-latest-events','.rs-donation','#rs-blog'];
  const homeShapes=source==='index3.html'?preservedHomeSections.map(selector=>[selector,one(original,selector)]).filter(([,node])=>node).map(([selector,node])=>[selector,shape(node)]):[];
  await common(original);await adapt(original);
  for(const a of all(original,'a')) {
    if(a.attribs.href?.startsWith('/presentation'))a.attribs.href=a.attribs.href.replace('/presentation','/qui-sommes-nous');
    if(a.attribs.href==='/partenaires')a.attribs.href='/qui-sommes-nous#ecoles-partenaires';
  }
  // Les formations et le carrousel de témoignages sont recomposés sur demande.
  if(source==='index3.html') {
    for(const [selector,expected]of homeShapes){
      const actual=all(one(original,selector),'*').filter(el=>!(el.name==='a'&&(el.parent===one(original,'.donation-part .desc')||el.attribs.class?.split(/\s+/).includes('cpms-brochure')))).map(el=>`${el.name}|${(el.attribs.class??'').replace(/ cpms-admissions-actions\b/,'')}|${el.attribs.style??''}`);
      assert.deepEqual(actual,expected,`Le bloc Educavo ${selector} doit conserver son dessin.`);
    }
  }
  const file=name.replaceAll('/','--')+'.html';await writeFile(join(generated,file),serialize(original));
  const entry={file,source,title,description:'Découvrez le Cycle Préparatoire Sainte Marie Stella à Cotonou.',aliases};
  registry[name]=entry;for(const alias of aliases)registry[alias]={...entry,canonical:'/'+name};
}

await make('','index3.html','ESIMS — École supérieure d’ingénierie Sainte Marie Stella',homepage,['index3.html','index.html']);
for(const key of ['', 'index3.html', 'index.html'])registry[key].description='Découvrez l’École supérieure d’ingénierie Sainte Marie Stella : cycle préparatoire au Bénin et au Togo, licences professionnelles au Togo.';
await make('qui-sommes-nous','about2.html','L’École — ESIMS',about,['about2.html','presentation','partenaires']);
for (const key of ['qui-sommes-nous', 'about2.html', 'presentation', 'partenaires']) registry[key].description='Découvrez l’ESIMS, ses implantations au Bénin et au Togo, ses parcours scientifiques et ses écoles partenaires.';
const blogOriginal=documentFrom(await readFile(join(root,'src/templates/educavo/blog.html'),'utf8'));
const pageSize=all(blogOriginal,'.rs-inner-blog .blog-item').length;
const publicNews=preparedRecords.filter(r=>r.type==='post'&&!r.categories.includes('Témoignages')&&![81,85,159,245].includes(r.id)).sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt)).map(r=>records.get(r.id));
const newsLayout=newsPages({publicNews,homeHtml:await readFile(join(generated,'.html'),'utf8'),safe,date,articleRoute,shortTitle,image,fillBlogCard});
const newsPageSize=all(documentFrom(await readFile(join(root,'src/templates/educavo/blog-left.html'),'utf8')),'.rs-inner-blog .blog-item').length;
for(const group of newsLayout.groups) {
  for(let page=1;page<=Math.ceil(group.records.length/newsPageSize);page++) {
    await make(page===1?group.base:`${group.base}/page/${page}`,'blog-left.html',`CPMS — ${group.title}${page>1?' — page '+page:''}`,doc=>newsLayout.listing(doc,group,page,newsPageSize),page===1?(group.base==='actualites'?['blog-left.html','blog.html']:group.base==='evenements'?['events-style1.html']:[]):[]);
  }
}
for(const [key,entry] of Object.entries(registry)) {
  if(entry.source==='blog-left.html') entry.description=key.startsWith('evenements')?'Conférences, rencontres et vie étudiante : retrouvez les événements de l’ESIMS.':'Retrouvez les actualités, événements, projets et archives de l’École supérieure d’ingénierie Sainte Marie Stella.';
}
await make('recherche','blog.html','CPMS — Recherche',doc=>listing(doc,publicNews.slice(0,pageSize),'Recherche'));
for(const [base,title,list] of [['temoignages','Témoignages',testimonies]]){
  const pages=Math.ceil(list.length/pageSize);
  for(let page=1;page<=pages;page++){
    const start=Math.min((page-1)*pageSize,Math.max(0,list.length-pageSize));
    const selected=list.slice(start,start+pageSize);
    await make(page===1?base:`${base}/page/${page}`,'blog.html',`CPMS — ${title}${page>1?' — page '+page:''}`,doc=>listing(doc,selected,title,page,pages,base),page===1&&base==='actualites'?['blog.html']:[]);
  }
}
await make('galerie','gallery-style1.html','CPMS — Galerie',gallery,['gallery-style1.html']);
await make('contact','contact4.html','Contactez le CPMS',contact,['contact4.html','contact.html']);
for(const key of ['contact','contact4.html','contact.html']) {
  registry[key].title='Contact — ESIMS';
  registry[key].description='Contactez l’ESIMS pour les admissions, le choix de filière et les renseignements pratiques au Bénin et au Togo.';
}
await make('faq','faq.html','CPMS — Questions fréquentes',faq,['faq.html']);
await make('erreur','error.html','CPMS — Page introuvable',errorPage,['error.html']);
await make('formations','course2.html','Nos filières — ESIMS',async doc=>filieresPage(doc,{homeHtml:await readFile(join(generated,'.html'),'utf8'),photo:garden,image}));
registry.formations.description='Les filières de l’ESIMS : cycle préparatoire au Bénin et au Togo, licences professionnelles au Togo.';
const togoPermit=await copyOriginal('/Users/macbookpro/Downloads/Agrément ESIMS Togo.pdf','institution/agrement-esims-togo.pdf');
await make('nos-implantations','about2.html','Nos implantations — ESIMS',async doc=>implantationsPage(doc,{homeHtml:await readFile(join(generated,'.html'),'utf8'),photos:{cotonou:garden,library:homePhotos.aboutSecond},permit:togoPermit,safe}));
registry['nos-implantations'].description='Découvrez les implantations de l’ESIMS à Cotonou au Bénin et à Lomé au Togo, ainsi que les parcours proposés sur chaque site.';
await make('domaines','course2.html','CPMS — Domaines de professionnalisation',doc=>courseGrid(doc,true),['course2.html']);
await make('cycle-preparatoire','course-single.html','CPMS — Cycle préparatoire',doc=>courseDetail(doc),['course-single.html']);
for(const key of ['cycle-preparatoire','course-single.html']) {
  registry[key].title='Cycle préparatoire au Bénin — ESIMS';
  registry[key].description='Découvrez le cycle préparatoire de l’ESIMS à Cotonou : deux années de formation, le programme, les stages, les projets et les modalités de candidature.';
}
await make('cycle-ingenieur','course-single.html','CPMS — Cycle ingénieur',doc=>courseDetail(doc,true));
await make('licences-professionnelles','course-single.html','Licences professionnelles au Togo — ESIMS',async doc=>licenceTogoPage(doc,{homeHtml:await readFile(join(generated,'.html'),'utf8'),photo:await legacyUrl('/wp-content/uploads/2026/03/Salle-de-TP-1-1024x732.jpg'),permit:togoPermit,safe}));
await make('cycle-preparatoire-togo','course-single.html','Cycle préparatoire au Togo — ESIMS',async doc=>preparatoryTogoPage(doc,{homeHtml:await readFile(join(generated,'.html'),'utf8'),equipmentPhoto,permit:togoPermit,safe}));
registry['cycle-preparatoire-togo'].description='Découvrez le cycle préparatoire de niveau bac+2 d’ESIMS-Togo à Lomé et contactez l’école pour les modalités d’admission.';
registry['licences-professionnelles'].description='Découvrez les licences professionnelles d’ESIMS-Togo à Lomé et les neuf spécialités mentionnées dans l’agrément fourni.';

// Les billets utilisent le modèle demandé ; les anciennes pages restent distinctes.
for(const prepared of preparedRecords){
  const r=records.get(prepared.id),isPost=prepared.type==='post';
  await make(articleRoute(r).slice(1),isPost?'blog-post-left.html':'blog-single.html',`${shortTitle(r)} — CPMS`,doc=>isPost?newsLayout.article(doc,r):article(doc,r),r.id===40819?['blog-post-left.html','blog-single.html']:[]);
}
const admissions={...records.get(462),title:'Procédure d’inscription — année académique 2026–2027',cleanHtml:`<p>${calendarNotice}</p><p>Les élèves de Terminales C, D et E sont invités à déposer leurs dossiers en ligne via l’adresse <a href="mailto:contact@cpms.education">contact@cpms.education</a>.</p><p><strong>LISTE DES PIÈCES À ENVOYER EN LIGNE :</strong></p><ol>${documents.map(d=>`<li>${d}</li>`).join('')}</ol><p><a href="${candidature}">Télécharger le formulaire de candidature</a></p><p>${paperDeposit}</p><p>${tests}</p><p>Pour toutes autres informations, veuillez contacter les numéros : <a href="tel:+2290162721072">+229 01 62 72 10 72</a> / <a href="tel:+2290149141277">+229 01 49 14 12 77</a>.</p><p><a href="${brochure}">Télécharger la brochure</a></p>`,cleanText:'Retrouvez les six pièces du dossier, l’envoi par email, le dépôt papier et les informations sur les tests et le calendrier.',photo:garden};
await make('admissions','blog-single.html','CPMS — Procédure d’inscription',async doc=>{
  await article(doc,admissions,'Admissions');
  const sections=[
    `<p>${calendarNotice}</p>`,
    '<p>Les élèves de Terminales C, D et E sont invités à déposer leurs dossiers en ligne via l’adresse <a href="mailto:contact@cpms.education">contact@cpms.education</a>.</p>',
    `<p><strong>LISTE DES PIÈCES À ENVOYER EN LIGNE :</strong></p><ol>${documents.map(d=>`<li>${d}</li>`).join('')}</ol>`,
    `<p><a href="${candidature}">Télécharger le formulaire de candidature</a></p>`,
    `<p>${paperDeposit}</p><p>${tests}</p>`,
    `<p>Pour toutes autres informations, veuillez contacter les numéros : <a href="tel:+2290162721072">+229 01 62 72 10 72</a> / <a href="tel:+2290149141277">+229 01 49 14 12 77</a>.</p><p><a href="${brochure}">Télécharger la brochure</a></p>`,
  ];
  all(doc,'.blog-full .blog-desc').forEach((slot,i)=>contents(slot,sections[i]));
  label(all(doc,'.single-post-meta .p-date')[0],'Campagne 2026–2027');
  const titles=all(doc,'.blog-full h2.title');label(titles[1],'Dépôt du dossier et tests');
  put(doc,'.blog-full .sm-title','Contacts et documents utiles');
  put(doc,'.blog-full blockquote p','Contactez le secrétariat pour confirmer les dates actuelles : +229 01 62 72 10 72 / +229 01 49 14 12 77.');
  all(doc,'.blog-full > .unorder-list li').forEach((li,i)=>label(li,['Télécharger et compléter le formulaire de candidature.','Réunir les six pièces demandées.','Transmettre le dossier à contact@cpms.education.','Déposer la version papier au secrétariat avec les frais de dossier.','Contacter le secrétariat pour les dates des tests.'][i%5]));
},['inscription','inscription.html']);
await make('confidentialite','blog-single.html','CPMS — Confidentialité : archive WordPress',doc=>article(doc,{...records.get(3),cleanHtml:'<p>Cette page conserve le texte de la version WordPress pour référence. La politique applicable à la refonte sera finalisée avec les services effectivement utilisés.</p>'+records.get(3).cleanHtml,photo:garden},'Confidentialité'));

// La campagne de rentrée est distincte de la procédure d'inscription.
await make('rentree-universitaire','blog-post-left.html','Inscriptions ouvertes — Année 2026-2027 — CPMS',async doc=>{
  await newsLayout.article(doc,{...records.get(462),photo:homePhotos.aboutFirst??garden},{redesign:false});
  put(doc,'.rs-breadcrumbs h1','Inscriptions 2026-2027');
  label(all(doc,'.rs-breadcrumbs li').at(-1),'Inscriptions 2026-2027');
  const metadata=all(doc,'.single-post-meta .p-date');label(metadata[0],'Année 2026-2027');
  link(one(doc,'.single-post-meta .tag-line a'),'Procédure d’inscription','/admissions');
  const full=one(doc,'.blog-full');
  one(doc,'body').attribs.class+=' cpms-campaign-page';
  // La page d'inscription commence par les informations utiles, sans photo
  // décorative ni métadonnées de billet devant le dossier.
  for(const selector of ['.bs-img','.single-post-meta']){
    const node=one(doc,selector);if(node)node.parent.children=node.parent.children.filter(child=>child!==node);
  }
  put(full,'h2.title','Inscriptions ouvertes');
  contents(one(full,'.cpms-post-content'),campaignContent(records.get(462),safe));
  contents(full,full.children.map(serialize).join('')+`<div class="btn-part cpms-admissions-actions"><a class="readon2" href="${candidature}" download="candidature-cpms.pdf">Télécharger le formulaire</a><a class="readon2 cpms-brochure" href="${brochure}" download="brochure-cpms.pdf">Notre brochure</a></div>`);
  const navigation=one(doc,'.ps-navigation');
  contents(navigation,`<ul><li><a href="/admissions"><span class="next-link">Procédure d’inscription<i class="flaticon-next"></i></span></a></li><li><a href="/contact"><span class="link-text">Contacter le CPMS</span></a></li></ul>`);
});

await buildBrandStyles(publicRoot);
const uniformPages=await uniformSiteShell(registry,generated,logo,brochure,preparedRecords);
await nameSite(registry,generated,preparedRecords);
console.log(`${uniformPages} pages avec le même en-tête, footer et chargement CPMS.`);
const recordTargets=Object.fromEntries(preparedRecords.filter(record=>canonicalRoutes[record.id]).map(record=>[articleRoute(record),record.route]));
const unavailableLinks=await resolveEditorialLinks(registry,generated,recordTargets);
console.log(`${unavailableLinks} liens sans destination orientés vers le modèle error.html.`);
for(const r of preparedRecords)r.cardImage=await fitPhoto(r.image,'assets/images/blog/inner/1.jpg');
await writeFile(join(root,'src/data/cpms-content.json'),JSON.stringify({sourceExport:'16 août 2026',records:preparedRecords},null,2)+'\n');
await writeFile(join(root,'src/generated/cpms-registry.json'),JSON.stringify(registry,null,2)+'\n');
await writeFile(join(root,'src/generated/cpms-media.json'),JSON.stringify({brochure,candidature,video,logo,garden,classroom},null,2)+'\n');
const redirects=Array.from(oldPaths,([source,destination])=>({source,destination,permanent:true})).filter(r=>r.source!==r.destination&&!excluded.has(inventory.records.find(p=>(new URL(p.old_url).pathname.replace(/\/$/,'')||'/')===r.source)?.id));
for(const [source,destination] of Object.entries(legacyPageTargets))redirects.push({source,destination,permanent:true});
for(const record of preparedRecords)if(canonicalRoutes[record.id])redirects.push({source:articleRoute(record),destination:record.route,permanent:true});
const uniqueRedirects=[...new Map(redirects.map(redirect=>[redirect.source,{...redirect,destination:canonicalEditorialHref(redirect.destination,registry)}])).values()];
await writeFile(join(root,'src/generated/cpms-redirects.json'),JSON.stringify(uniqueRedirects,null,2)+'\n');
const generatedPages=await Promise.all([...new Set(Object.values(registry).map(entry=>entry.file))].map(file=>readFile(join(generated,file),'utf8')));
const unconfirmedStatistics=generatedPages.some(html=>html.includes('data-cpms-stat="unconfirmed"'));
await writeFile(join(root,'editorial-manifest.json'),JSON.stringify({source:'Export WordPress CPMS du 16 août 2026',records:preparedRecords.length,generatedRoutes:Object.keys(registry).length,copiedMedia:copiedMedia.size,removedSpamLinks:removedSpam,excludedIds:[...excluded],missing:issues,assets:assetAudit,unconfirmedStatistics,homeStatistics},null,2)+'\n');
console.log(`${preparedRecords.length} contenus publics repris ; ${Object.keys(registry).length} routes éditoriales ; ${copiedMedia.size} médias/documents ; blocs Educavo conservés hors des zones de l’accueil validées.`);
