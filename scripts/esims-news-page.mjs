import assert from 'node:assert/strict';
import { serialize, one, all, contents } from './editorial-dom.mjs';

/** À la une et navigation inspirées de JUNIA, cartes et sidebar blog-left Educavo. */
export function newsListingPage(doc, { group, page, pageSize, selected, cards, counts, categoryRoute, articleRoute, shortTitle, date, safe }) {
  const isEvents = group.base === 'evenements' || group.base === categoryRoute('Événements').slice(1);
  const isNews = group.base === categoryRoute('Actualités').slice(1);
  const isAll = group.base === 'actualites';
  const heading = isAll ? 'Actualités et événements' : isEvents ? 'Les événements de l’EIMS' : isNews ? 'Les actualités de l’EIMS' : group.title;
  const introduction = isEvents ? 'Conférences, rencontres et vie étudiante : retour sur les temps forts de l’école.' : 'Rencontres, projets et nouvelles de l’école : suivez la vie de l’EIMS.';
  const featured = page === 1 && (isAll || group.base === 'evenements') ? selected[0] : null;
  const excerpt = record => {
    const value = record.cleanText.replace(/\s+/g, ' ').trim();
    return value.length > 155 ? value.slice(0, 155).replace(/\s+\S*$/, '') + '…' : value;
  };
  const tag = record => record.categories.includes('Événements') ? 'Événement' : 'Actualité';
  const publicationDate = record => `<time datetime="${record.published_at.slice(0,10)}">Publié le ${safe(date(record.published_at))}</time>`;
  const hero = `<section class="rs-breadcrumbs esims-news-hero" aria-labelledby="news-title"><div class="container"><nav class="esims-news-breadcrumb" aria-label="Fil d’Ariane"><a href="/">Accueil</a><span aria-hidden="true">/</span>${isAll ? '<span>Actualités</span>' : `<a href="/actualites">Actualités</a><span aria-hidden="true">/</span><span>${safe(group.title)}</span>`}</nav><div class="row align-items-center"><div class="${featured ? 'col-lg-4 md-mb-30' : 'col-lg-9'}"><div class="esims-news-eyebrow">La vie de l’EIMS</div><h1 id="news-title">${safe(heading)}</h1><p>${introduction}</p></div>${featured ? `<div class="col-lg-8"><article class="esims-news-feature"><a class="esims-news-feature-photo" href="${articleRoute(featured)}" aria-label="Lire : ${safe(shortTitle(featured))}"><img src="${featured.photo}" alt="${safe(shortTitle(featured))}" width="800" height="650"><span>${tag(featured)}</span></a><div class="esims-news-feature-copy"><span class="esims-news-feature-label">À la une</span>${publicationDate(featured)}<h2 class="blog-title"><a href="${articleRoute(featured)}">${safe(shortTitle(featured))}</a></h2><p>${safe(excerpt(featured))}</p><a class="readon2" href="${articleRoute(featured)}">Lire l’article <i class="fa fa-arrow-right" aria-hidden="true"></i></a></div></article></div>` : ''}</div></div></section>`;
  const tabs = [['Tout', '/actualites', counts.all, isAll], ['Actualités', categoryRoute('Actualités'), counts.news, isNews], ['Événements', '/evenements', counts.events, isEvents]];
  const filters = `<div class="esims-news-filters"><div class="container"><nav aria-label="Choisir les publications">${tabs.map(([label, href, count, active]) => `<a href="${href}#news-list"${active ? ' class="is-active" aria-current="page"' : ''}>${label}<span>${count}</span></a>`).join('')}</nav><a class="esims-news-search-link" href="/recherche"><i class="fa fa-search" aria-hidden="true"></i> Rechercher</a></div></div>`;
  const sidebar = serialize(one(doc, '.widget-area'));
  const visibleCards = featured ? cards.slice(1) : cards;
  for (const [index, card] of visibleCards.entries()) {
    const record = selected[index + (featured ? 1 : 0)];
    const metadata = one(card, '.blog-meta');
    contents(metadata, `<ul class="btm-cate"><li class="esims-news-type">${tag(record)}</li><li>${publicationDate(record)}</li></ul>`);
    const title = one(card, '.blog-title a'); title.attribs.title = shortTitle(record);
  }
  const pages = Math.ceil(group.records.length / pageSize);
  const pageUrl = number => '/' + group.base + (number === 1 ? '' : `/page/${number}`) + '#news-list';
  const pagination = pages > 1 ? `<nav class="pagination-area" aria-label="Pages des publications"><ul class="pagination-part">${page > 1 ? `<li><a href="${pageUrl(page-1)}" aria-label="Page précédente">‹</a></li>` : ''}${Array.from({ length: pages }, (_, index) => `<li${page === index+1 ? ' class="active"' : ''}><a href="${pageUrl(index+1)}"${page === index+1 ? ' aria-current="page"' : ''}>${index+1}</a></li>`).join('')}${page < pages ? `<li><a href="${pageUrl(page+1)}" aria-label="Page suivante">›</a></li>` : ''}</ul></nav>` : '';
  const resultsTitle = isAll ? 'Les publications de l’école' : isEvents ? 'Retour sur les temps forts' : isNews ? 'Les nouvelles de l’école' : group.title;
  const results = `<section id="news-list" class="rs-inner-blog esims-news-list pt-60 pb-70 md-pt-40 md-pb-50"><div class="container"><div class="row"><aside class="col-lg-4 col-md-12 pr-40 md-pr-15 order-last order-lg-first" aria-label="Rechercher et parcourir les publications">${sidebar}</aside><div class="col-lg-8"><div class="esims-news-results"><div><h2>${safe(resultsTitle)}</h2><p>${group.records.length} publication${group.records.length > 1 ? 's' : ''}${featured ? ' dont une à la une' : ''} · Page ${page} sur ${pages}</p></div>${!isAll && !isEvents && !isNews ? '<a class="esims-school-text-link" href="/actualites#news-list">Tout voir <i class="fa fa-arrow-right" aria-hidden="true"></i></a>' : ''}</div><div class="row esims-news-grid">${visibleCards.map(card => `<div class="col-md-6 mb-30">${serialize(card)}</div>`).join('')}</div>${pagination}</div></div></div></section>`;
  const newsletter = serialize(one(doc, '.rs-newsletter'));
  contents(one(doc, '.main-content'), hero + filters + results + newsletter);
  one(doc, 'body').attribs.class += ' esims-news-hub';
  assert.deepEqual(all(doc, '.blog-title a').map(anchor => anchor.attribs.href), selected.map(articleRoute), 'Chaque publication doit apparaître une seule fois dans sa page.');
  assert.equal(all(doc, '.esims-news-grid .blog-item').length + Number(Boolean(featured)), selected.length);
  const ids = all(one(doc, '.main-content'), '[id]').map(node => node.attribs.id);
  assert.equal(ids.length, new Set(ids).size);
}
