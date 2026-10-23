import assert from 'node:assert/strict';
import { documentFrom, serialize, one, all, contents, text } from './editorial-dom.mjs';

/** Lecture dans la grille blog-post-left Educavo, titre et photo au premier plan. */
export function articleReadingPage(doc, { record, publicNews, safe, date, articleRoute, shortTitle, categoryRoute }) {
  const content = one(doc, '.cpms-post-content');
  const originalText = text(content), originalImages = all(content, 'img').map(img => img.attribs.src);
  const headings = all(content, 'h2, h3, h4');
  const usedIds = new Set(all(content, '[id]').map(node => node.attribs.id));
  headings.forEach((heading, index) => {
    if (heading.attribs.id) return;
    let id = `article-section-${index + 1}`;
    while (usedIds.has(id)) id += '-section';
    heading.attribs.id = id; usedIds.add(id);
  });
  const gallery = one(content, '.cpms-article-gallery');
  const photoCount = all(content, '.cpms-article-gallery img').length;
  if (gallery && !gallery.attribs.id) {
    let id = 'article-photos'; while (usedIds.has(id)) id += '-gallery';
    gallery.attribs.id = id;
  }
  const category = record.categories[0] || 'Non classés';
  const readingMinutes = Math.max(1, Math.ceil(originalText.split(/\s+/).length / 200));
  const hero = `<header class="rs-breadcrumbs esims-article-hero"><div class="container"><nav class="esims-article-breadcrumb" aria-label="Fil d’Ariane"><a href="/">Accueil</a><span aria-hidden="true">/</span><a href="/actualites">Actualités</a><span aria-hidden="true">/</span><span>Article</span></nav><a class="esims-article-category" href="${categoryRoute(category)}">${safe(category)}</a><h1>${safe(record.title)}</h1><div class="esims-article-meta"><time datetime="${record.published_at.slice(0,10)}"><i class="fa fa-calendar-o" aria-hidden="true"></i> Publié le ${safe(date(record.published_at))}</time><span><i class="fa fa-clock-o" aria-hidden="true"></i> ${readingMinutes} min de lecture</span>${gallery ? `<a href="#${gallery.attribs.id}"><i class="fa fa-picture-o" aria-hidden="true"></i> Voir les photos (${photoCount})</a>` : ''}</div></div></header>`;
  const sidebarDoc = documentFrom(serialize(one(doc, '.widget-area')));
  const sidebar = one(sidebarDoc, '.widget-area');
  // Les archives restent accessibles sans allonger inutilement les billets courts.
  const archiveWidget = all(sidebar, '.widget-archives')[0];
  if (archiveWidget) {
    const list = one(archiveWidget, 'ul');
    const heading = serialize(one(archiveWidget, '.widget-title'));
    contents(archiveWidget, heading + `<details class="esims-article-archives"><summary>Parcourir les archives <i class="fa fa-angle-down" aria-hidden="true"></i></summary>${serialize(list)}</details>`);
  }
  const toc = headings.length > 1 ? `<nav class="esims-article-toc" aria-labelledby="article-toc-title"><h2 id="article-toc-title">Dans cet article</h2><ol>${headings.map(heading => `<li><a href="#${safe(heading.attribs.id)}">${safe(text(heading))}</a></li>`).join('')}</ol></nav>` : '';
  const mobileToc = headings.length > 1 ? `<details class="esims-article-mobile-toc"><summary>Dans cet article <i class="fa fa-angle-down" aria-hidden="true"></i></summary><ol>${headings.map(heading => `<li><a href="#${safe(heading.attribs.id)}">${safe(text(heading))}</a></li>`).join('')}</ol></details>` : '';
  const cover = `<figure class="bs-img esims-article-cover"><img src="${record.photo}" alt="${safe(shortTitle(record))}" width="1000" height="650"><figcaption>${safe(shortTitle(record))}</figcaption></figure>`;
  const article = `<article class="blog-full esims-article-paper" id="article-content">${cover}<div class="esims-article-copy">${serialize(content)}</div><div class="esims-article-back"><a class="esims-school-text-link" href="/actualites#news-list"><i class="fa fa-arrow-left" aria-hidden="true"></i> Toutes les publications</a>${record.categories.includes('Événements') ? '<a class="esims-school-text-link" href="/evenements#news-list">Les événements <i class="fa fa-arrow-right" aria-hidden="true"></i></a>' : ''}</div></article>`;
  const peers = publicNews.filter(candidate => candidate.id !== record.id);
  const index = publicNews.findIndex(candidate => candidate.id === record.id);
  const related = [...(index >= 0 ? publicNews.slice(index + 1) : peers), ...peers].filter((candidate, position, values) => candidate.id !== record.id && values.findIndex(other => other.id === candidate.id) === position).slice(0, 3);
  const more = related.length ? `<section class="rs-inner-blog esims-article-more pt-60 pb-70 md-pt-40 md-pb-50"><div class="container"><div class="sec-title mb-35"><div class="sub-title">La vie de l’ESIMS</div><h2 class="title">À lire aussi</h2></div><div class="row">${related.map(candidate => `<div class="col-md-4 mb-30"><article class="blog-item"><a href="${articleRoute(candidate)}" class="esims-article-related-photo"><img src="${candidate.photo}" alt="${safe(shortTitle(candidate))}" width="500" height="320" loading="lazy"></a><div class="blog-content"><time datetime="${candidate.published_at.slice(0,10)}">Publié le ${safe(date(candidate.published_at))}</time><h3 class="blog-title"><a href="${articleRoute(candidate)}">${safe(shortTitle(candidate))}</a></h3><a class="esims-school-text-link" href="${articleRoute(candidate)}">Lire l’article <i class="fa fa-arrow-right" aria-hidden="true"></i></a></div></article></div>`).join('')}</div></div></section>` : '';
  const newsletter = serialize(one(doc, '.rs-newsletter'));
  contents(one(doc, '.main-content'), hero + `<section class="rs-inner-blog esims-article-layout pt-60 pb-50 md-pt-35 md-pb-35"><div class="container"><div class="row"><aside class="col-lg-4 pr-40 md-pr-15 esims-article-sidebar" aria-label="Sommaire et publications">${toc}${serialize(sidebar)}</aside><div class="col-lg-8 esims-article-main">${mobileToc}${article}</div></div></div></section>` + more + newsletter);
  one(doc, 'body').attribs.class += ' esims-article-page';
  assert.equal(text(one(doc, '.cpms-post-content')), originalText, 'Conserver le texte intégral dans la nouvelle lecture.');
  assert.deepEqual(all(doc, '.cpms-post-content img').map(img => img.attribs.src), originalImages, 'Conserver les images et leur ordre.');
  const ids = all(one(doc, '.main-content'), '[id]').map(node => node.attribs.id);
  assert.equal(ids.length, new Set(ids).size, 'Les ancres de lecture doivent être uniques.');
}
