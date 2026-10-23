import { all, one, contents, link, label } from './editorial-dom.mjs';
import { schoolLocation } from './cpms-contact-details.mjs';

/** Conserver les quatre colonnes et les classes du footer d'index.html. */
export function cpmsFooter(footer,records,safe,logo){
  const columns=all(footer,'.footer-top .footer-widget');
  one(columns[0],'.footer-logo img').attribs.src=logo;
  one(columns[0],'.footer-logo img').attribs.alt='CPMS';
  contents(one(columns[0],'.textwidget p'),'L’École supérieure d’ingénierie Sainte Marie Stella accompagne les étudiants dans leur formation scientifique et technique, au Bénin et au Togo.');
  contents(one(columns[0],'.footer_social'),[
    ['facebook','Facebook','https://www.facebook.com/cpmscotonou'],
    ['linkedin','LinkedIn','https://www.linkedin.com/company/cpms/'],
    ['instagram','Instagram','https://www.instagram.com/prepamariestella/'],
  ].map(([icon,name,url])=>`<li><a href="${url}" aria-label="${name} du CPMS"><span><i class="fa fa-${icon}" aria-hidden="true"></i></span></a></li>`).join(''));
  label(one(columns[1],'.widget-title'),'Nous contacter');
  const details=all(columns[1],'.address-widget .desc');
  contents(details[0],safe(schoolLocation));
  contents(details[1],'<a href="tel:+2290149141277">01 49 14 12 77</a><small>Appel uniquement</small><a href="tel:+2290162721072">01 62 72 10 72</a><a href="https://wa.me/2290162721072" target="_blank" rel="noopener noreferrer">Appel ou WhatsApp</a>');
  contents(details[2],'<a href="mailto:contact@cpms.education">contact@cpms.education</a>');
  label(one(columns[2],'.widget-title'),'Nos pages');
  const pages=[
    ['L’École','/qui-sommes-nous'],
    ['Nos filières','/formations'],
    ['Nos implantations','/nos-implantations'],
    ['Actualités','/actualites'],
    ['Contact','/contact'],
    ['Questions fréquentes','/faq'],
    ['Inscriptions 2026-2027','/rentree-universitaire'],
  ];
  contents(one(columns[2],'.site-map'),pages.map(([title,href])=>`<li><a href="${href}">${safe(title)}</a></li>`).join(''));
  label(one(columns[3],'.widget-title'),'Actualités récentes');
  const posts=records.filter(record=>record.type==='post'&&!record.categories.includes('Témoignages')).sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt));
  all(columns[3],'.recent-post').forEach((post,index)=>{
    const record=posts[index];link(one(post,'.post-desc a'),record.shortTitle,record.route);
    const img=one(post,'img');img.attribs.src=record.image;img.attribs.alt=record.shortTitle;img.attribs.loading='lazy';
    label(one(post,'.post-date'),new Intl.DateTimeFormat('fr-FR',{dateStyle:'long',timeZone:'UTC'}).format(new Date(record.publishedAt.replace(' ','T')+'Z')));
  });
  contents(one(footer,'.copy-right-menu'),[['Accueil','/'],['FAQ','/faq'],['Contact','/contact']].map(([title,href])=>`<li><a href="${href}">${title}</a></li>`).join(''));
  return footer;
}
