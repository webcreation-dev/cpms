import assert from 'node:assert/strict';
import { documentFrom, serialize, text, all, one, contents, label, put, link } from './editorial-dom.mjs';
import { articleGallery } from './cpms-article-gallery.mjs';

const remove = node => { if (node?.parent) node.parent.children = node.parent.children.filter(child => child !== node); };
const slug = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const categories = record => record.categories.length ? record.categories : ['Non classés'];

/** Contenus CPMS dans les deux modèles Educavo à barre latérale gauche. */
export function newsPages({ publicNews, homeHtml, safe, date, articleRoute, shortTitle, image, fillBlogCard }) {
  const months = [...new Set(publicNews.map(record => record.published_at.slice(0,7)))];
  const categoryNames = [...new Set(publicNews.flatMap(categories))].sort((a,b) => a.localeCompare(b,'fr'));
  const archiveRoute = month => `/actualites/archives/${month.replace('-', '/')}`;
  const categoryRoute = category => categoryNames.includes(category) ? `/actualites/categories/${slug(category)}` : category === 'Témoignages' ? '/temoignages' : '/formations';
  const groups = [
    { base:'actualites', title:'Actualités', records:publicNews },
    ...months.map(month => ({ base:archiveRoute(month).slice(1), title:`Archives : ${new Intl.DateTimeFormat('fr-FR',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(`${month}-01T12:00:00Z`))}`, records:publicNews.filter(record => record.published_at.startsWith(month)) })),
    ...categoryNames.map(category => ({ base:categoryRoute(category).slice(1), title:`Catégorie : ${category}`, records:publicNews.filter(record => categories(record).includes(category)) })),
  ];
  const listLinks = entries => entries.map(([title,href]) => `<li><a href="${safe(href)}">${safe(title)}</a></li>`).join('');

  function shell(doc, title) {
    const home = documentFrom(homeHtml);
    for (const selector of ['.full-width-header','.rs-newsletter','footer']) {
      const target = one(doc,selector), source = one(home,selector);
      target.attribs = {...source.attribs}; contents(target,source.children.map(serialize).join(''));
    }
    all(doc,'.nav-menu > li').forEach((li,index) => { li.attribs.class = (li.attribs.class??'').replace(/current-menu-item/g,'').trim() + (index===4?' current-menu-item':''); });
    one(doc,'body').attribs.class += ' cpms-news-page';
    const section = one(doc,'.rs-inner-blog');
    section.attribs.class = section.attribs.class.replace(/\borange-color\b/g,'');
    put(doc,'.rs-breadcrumbs h1',title);
    label(all(doc,'.rs-breadcrumbs li').at(-1),title);
    // Classes Bootstrap du thème : articles en premier sur petit écran.
    one(doc,'.widget-area').parent.attribs.class += ' order-last order-lg-first';
  }

  async function sidebar(doc) {
    const area = one(doc,'.widget-area');
    const search = one(area,'.search-input');
    search.attribs.placeholder='Rechercher…'; search.attribs['aria-label']='Rechercher sur le site CPMS';
    one(area,'.search-wrap button').attribs['aria-label']='Lancer la recherche';
    const recent = one(area,'.recent-posts-widget') ?? one(area,'.recent-posts');
    put(recent,'.widget-title','Posts récents');
    const featured = all(recent,'.show-featured');
    if (featured.length) {
      for (const [index,card] of featured.entries()) {
        const record = publicNews[index];
        if (!record) { remove(card); continue; }
        link(one(card,'.post-desc a'),shortTitle(record),articleRoute(record));
        one(card,'.post-img a').attribs.href=articleRoute(record);
        await image(one(card,'img'),record.photo,shortTitle(record));
        put(card,'.date',date(record.published_at));
      }
    } else contents(one(recent,'ul'),listLinks(publicNews.slice(0,5).map(record=>[shortTitle(record),articleRoute(record)])));
    const [archives,categoryWidget] = all(area,'.widget-archives');
    put(archives,'.widget-title','Archives');
    contents(one(archives,'ul'),listLinks(groups.slice(1,1+months.length).map(group=>[group.title.replace('Archives : ',''),'/'+group.base])));
    put(categoryWidget,'.widget-title','Catégories');
    contents(one(categoryWidget,'ul'),listLinks(categoryNames.map(category=>[category,categoryRoute(category)])));
    const meta = all(area,'.recent-posts').at(-1);
    put(meta,'.widget-title','Méta');
    // Liens utilisables dans la refonte, sans formulaires WordPress fictifs.
    contents(one(meta,'ul'),listLinks([['Toutes les actualités','/actualites'],['Rechercher','/recherche'],['Contact','/contact'],['Politique de confidentialité','/confidentialite']]));
  }

  async function listing(doc, group, page, pageSize) {
    shell(doc,group.title); await sidebar(doc);
    const selected = group.records.slice((page-1)*pageSize,page*pageSize);
    const cards = all(doc,'.rs-inner-blog .blog-item');
    for (const [index,card] of cards.entries()) {
      const record = selected[index];
      if (!record) { remove(card.parent); continue; }
      await fillBlogCard(card,record);
      link(one(card,'.tag-line a'),categories(record)[0],categoryRoute(categories(record)[0]));
    }
    const pages = Math.ceil(group.records.length/pageSize);
    if (pages>1) {
      const pageUrl = number => '/'+group.base+(number===1?'':`/page/${number}`);
      const navigation = Array.from({length:pages},(_,index)=>`<li${page===index+1?' class="active"':''}><a href="${pageUrl(index+1)}"${page===index+1?' aria-current="page"':''}>${index+1}</a></li>`).join('');
      const row = cards[0].parent.parent;
      contents(row,row.children.map(serialize).join('')+`<div class="col-lg-12"><nav class="pagination-area" aria-label="Pages des actualités"><ul class="pagination-part">${page>1?`<li><a href="${pageUrl(page-1)}" aria-label="Page précédente">‹</a></li>`:''}${navigation}${page<pages?`<li><a href="${pageUrl(page+1)}" aria-label="Page suivante">›</a></li>`:''}</ul></nav></div>`);
    }
    assert.deepEqual(all(doc,'.blog-title a').map(a=>a.attribs.href),selected.map(articleRoute),'Les articles doivent apparaître une seule fois par page.');
  }

  async function article(doc,record) {
    shell(doc,'Actualités'); await sidebar(doc);
    const lead = one(doc,'.bs-img img');
    lead.attribs.src=record.photo; lead.attribs.alt=shortTitle(record);
    one(doc,'.bs-img a').attribs.href=record.photo;
    const full = one(doc,'.blog-full');
    const metadata = one(full,'.single-post-meta');
    const dates = all(metadata,'.p-date');
    label(dates[0],date(record.published_at)); label(dates[1],'CPMS');
    const category = categories(record)[0];
    link(one(metadata,'.tag-line a'),category,categoryRoute(category));
    remove(one(metadata,'.post-comment'));
    contents(full,serialize(metadata)+`<h2 class="title mb-35">${safe(record.title)}</h2><div class="blog-desc cpms-post-content">${articleGallery(record.cleanHtml,safe)}</div>`);
    assert.equal(text(one(full,'.cpms-post-content')).replace(/\s/g,''),text(documentFrom(record.cleanHtml)).replace(/\s/g,''),'Le texte intégral du billet doit être conservé.');
    assert.deepEqual(all(full,'.cpms-post-content img').map(img=>img.attribs.src),all(documentFrom(record.cleanHtml),'img').map(img=>img.attribs.src),'Toutes les images du billet doivent être conservées.');
    const index = publicNews.findIndex(candidate=>candidate.id===record.id);
    const next = index>=0 ? publicNews[index+1]??publicNews[index-1] : publicNews[0];
    const navigation = one(doc,'.ps-navigation');
    const back = one(navigation,'.next-link').parent;
    back.attribs.href='/actualites'; contents(back,'<span class="next-link">Toutes les actualités<i class="flaticon-next"></i></span>');
    const following = one(navigation,'.link-text').parent;
    following.attribs.href=next?articleRoute(next):'/actualites'; contents(following,`<span class="link-text">${safe(next?shortTitle(next):'Actualités')}</span>`);
    // Les commentaires n'ont pas de service connecté dans cette refonte.
    remove(one(doc,'.comment-area'));
  }
  return { groups, listing, article };
}
