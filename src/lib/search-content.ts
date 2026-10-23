import content from '@/data/cpms-content.json';
import { documentFrom, all, one, put, link, label, serialize } from '../../scripts/editorial-dom.mjs';

const normalized = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/** Remplit les cartes et la recherche du modèle blog, sans nouveau bloc. */
export function searchTemplate(html: string, query: string) {
  const doc = documentFrom(html);
  const words = normalized(query).trim().split(/\s+/).filter(Boolean);
  const records = content.records;
  const matches = words.length ? records.filter(record => {
    const haystack = normalized(record.title + ' ' + record.contentText);
    return words.every(word => haystack.includes(word));
  }) : [];
  const suggestions = records.filter(record => record.type === 'post').sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt));
  const selected = [...matches, ...suggestions.filter(record => !matches.some(found => found.id === record.id))];
  put(doc, '.rs-breadcrumbs h1', words.length ? (matches.length ? `${matches.length} résultat${matches.length > 1 ? 's' : ''}` : 'Aucun résultat') : 'Rechercher à l’EIMS');
  const cards = all(doc,'.rs-inner-blog .blog-item');
  for (const [index,card] of cards.entries()) {
    const record = selected[index % selected.length];
    const image = one(card,'.blog-img img');
    if (image) { image.attribs.src=record.cardImage;image.attribs.alt=record.shortTitle; }
    link(one(card,'.blog-title a'),record.shortTitle,record.route);
    const imageLink=one(card,'.blog-img a');if(imageLink)imageLink.attribs.href=record.route;
    put(card,'.blog-desc',record.excerpt);
    put(card,'.author','EIMS');
    put(card,'.blog-date',new Intl.DateTimeFormat('fr-FR',{dateStyle:'long',timeZone:'UTC'}).format(new Date(record.publishedAt.replace(' ','T')+'Z')));
    link(one(card,'.tag-line a'),index<matches.length?'Résultat':'À lire aussi',record.route);
    link(one(card,'.blog-button a'),'Lire la suite',record.route);
  }
  for (const input of all(doc,'.search-input, .search-modal input'))input.attribs.value=query;
  for (const a of all(doc,'.widget-archives a')) { delete a.attribs['aria-disabled'];a.attribs.href='/actualites'; }
  all(doc,'.widget-archives a').forEach((a,index)=>label(a,index?'Les actualités':'Toutes les rubriques'));
  return serialize(doc);
}
