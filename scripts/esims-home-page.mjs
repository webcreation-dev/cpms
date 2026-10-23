import assert from 'node:assert/strict';
import { documentFrom, all, one, contents, put, link, serialize } from './editorial-dom.mjs';
import { homeJourney, homeResults, homePartners } from './esims-home-sections.mjs';

const remove = node => { if (node?.parent) node.parent.children = node.parent.children.filter(child => child !== node); };
const replace = (node, replacements) => {
  const parent = node.parent, index = parent.children.indexOf(node);
  for (const replacement of replacements) replacement.parent = parent;
  parent.children.splice(index, 1, ...replacements);
};

/** Les nouvelles zones validées réutilisent les cartes index et le bloc about2. */
export async function esimsHomepage(doc, { nativeCourses, heroPhotos, coursePhotos, testimonials, partnerLogos, image, safe }) {
  one(doc, 'body').attribs.class += ' esims-home';
  const hero = documentFrom(`<section class="rs-slider style1 esims-hero" aria-label="La vie à l’école" aria-roledescription="diaporama">
    <div class="esims-hero-photos">${heroPhotos.map((photo, index) => `<div class="esims-hero-slide${index === 0 ? ' is-active' : ''}" data-esims-slide="${index}" aria-hidden="${index !== 0}"><img src="${safe(photo.src)}" alt="${safe(photo.alt)}" width="1920" height="920" loading="eager" decoding="async"></div>`).join('')}</div>
    <div class="esims-hero-shade"></div>
    <div class="container esims-hero-copy"><h1><span>Construisez votre avenir</span><br><span>dans les sciences et les technologies.</span></h1><a class="readon2 esims-hero-cta" href="#nos-formations">Découvrir nos filières <i class="fa fa-arrow-right" aria-hidden="true"></i></a></div>
    <div class="esims-hero-controls" aria-label="Commandes du diaporama">${heroPhotos.map((_, index) => `<button type="button" class="esims-slide-dot${index === 0 ? ' is-active' : ''}" data-esims-go="${index}" aria-label="Afficher la photo ${index + 1}" aria-pressed="${index === 0}"></button>`).join('')}<button type="button" class="esims-hero-pause" aria-label="Mettre le diaporama en pause" aria-pressed="false"><i class="fa fa-pause" aria-hidden="true"></i></button></div>
  </section>`).children[0];
  const countries = documentFrom(`<section class="esims-countries" aria-label="Nos implantations"><div class="container"><h2>EIMS, une école présente au</h2><div class="esims-country-links" role="group" aria-label="Afficher les filières par pays"><a class="esims-country-benin" href="#nos-formations" data-esims-campus="benin" aria-controls="esims-course-grid"><img src="/cpms/icons/flag-benin.svg" width="42" height="28" alt="" aria-hidden="true"><span>Bénin</span></a><span>et</span><a class="esims-country-togo" href="#nos-formations" data-esims-campus="togo" aria-controls="esims-course-grid"><img src="/cpms/icons/flag-togo.svg" width="42" height="28" alt="" aria-hidden="true"><span>Togo</span></a></div></div></section>`).children[0];
  replace(one(doc, '.rs-slider'), [hero, countries]);

  const courses = one(nativeCourses, '#rs-popular-courses');
  courses.attribs = { id: 'nos-formations', class: 'rs-popular-courses main-home pt-70 pb-70 md-pt-50 md-pb-50 esims-formations' };
  const row = one(courses, '.row');
  const prototype = serialize(one(row, '.courses-item'));
  contents(row, ''); row.attribs.id = 'esims-course-grid';
  put(courses, '.sub-title', 'Nos filières');
  put(courses, '.sec-title3 .title', 'Des parcours pour construire votre avenir');
  one(courses, '.sec-title3 .title').attribs.id = 'esims-formations-title';
  const programs = [
    { title: 'Cycle préparatoire', level: 'BAC+2', country: 'Bénin', location: 'Cotonou · Bénin', campuses: 'benin', description: 'Deux années pour bâtir des bases scientifiques solides et préparer la poursuite en école d’ingénieur.', href: '/cycle-preparatoire', action: 'Découvrir le parcours', photo: coursePhotos[0], alt: 'La bibliothèque du CPMS à Cotonou' },
    { title: 'Cycle préparatoire', level: 'BAC+2', country: 'Togo', location: 'Lomé · Togo', campuses: 'togo', description: 'Un premier parcours scientifique à Lomé, au sein de l’École supérieure d’ingénierie Sainte Marie Stella.', href: '/cycle-preparatoire-togo', action: 'Découvrir le parcours', photo: coursePhotos[1], alt: 'Travaux pratiques scientifiques — photographie d’illustration issue du CPMS au Bénin' },
    { title: 'Licences professionnelles', level: 'BAC+3', country: 'Togo', location: 'Lomé · Togo', campuses: 'togo', description: 'Des spécialités en sciences et technologies pour développer des compétences professionnelles.', href: '/licences-professionnelles', action: 'Voir les spécialités', photo: coursePhotos[2], alt: 'Matériel scientifique — photographie d’illustration issue du CPMS au Bénin' },
  ];
  for (const program of programs) {
    const column = documentFrom(`<div class="col-lg-4 col-md-6 mb-30" data-esims-campuses="${program.campuses}">${prototype}</div>`).children[0];
    await image(one(column, 'img'), program.photo, program.alt);
    const imageLink = one(column, '.img-part a'); imageLink.attribs.href = program.href;
    const visual = one(column, '.img-part');
    contents(visual, visual.children.map(serialize).join('') + `<span class="esims-country-badge"><img src="/cpms/icons/flag-${program.campuses}.svg" width="30" height="20" alt="Drapeau du ${program.country}">${program.country}</span>`);
    contents(one(column, '.info-meta'), `<span class="esims-level">${program.level}</span>`);
    remove(one(column, '.course-price'));
    link(one(column, '.title a'), program.title, program.href);
    contents(one(column, '.meta-part'), `<li><i class="fa fa-map-marker" aria-hidden="true"></i> ${program.location}</li>`);
    const content = one(column, '.content-part');
    contents(content, content.children.map(serialize).join('') + `<p class="esims-course-description">${program.description}</p><a class="readon2" href="${program.href}">${program.action} <i class="fa fa-arrow-right" aria-hidden="true"></i></a>`);
    column.parent = row; row.children.push(column);
  }
  const courseContainer = one(courses, '.container');
  contents(courseContainer, courseContainer.children.map(serialize).join('') + '<div class="esims-campus-feedback"><p id="esims-campus-status" role="status" aria-live="polite"></p><button type="button" class="esims-campus-reset" hidden>Voir toutes les filières</button></div>');

  // L'accueil commence directement par les formations après le bandeau des pays.
  const oldAbout = one(doc, '#rs-about'), oldDegree = one(doc, '.rs-degree'), services = one(doc, '.rs-services');
  remove(oldDegree); remove(services);
  replace(oldAbout, [courses, homeJourney(safe)]);
  assert.equal(all(doc, '.rs-services, .esims-about').length, 0);
  assert.equal(all(doc, '.esims-hero').length, 1);
  const events = one(doc, '.rs-latest-events');
  remove(events);
  replace(one(doc, '.rs-partner'), [homeResults(safe), homePartners(partnerLogos, safe), events]);
  // Le bloc d'inscription est retiré de l'accueil à la demande du commanditaire.
  const oldTestimonials = one(doc, '.rs-testimonial');
  const testimonySection = documentFrom(`<section class="rs-testimonial esims-testimonials pt-70 pb-70 md-pt-50 md-pb-50" aria-labelledby="esims-testimonials-title" aria-roledescription="carrousel"><div class="container"><div class="sec-title text-center mb-50"><div class="sub-title">Ils en parlent</div><h2 class="title" id="esims-testimonials-title">Leurs parcours, leurs mots</h2><p>Les anciens du cycle préparatoire partagent leur expérience.</p></div><div class="esims-testimonial-track" id="esims-testimonial-track" tabindex="0" aria-label="Témoignages des anciens étudiants">${testimonials.map((item, index) => `<article class="esims-quote-card" data-testimonial-id="${item.id}" aria-label="Témoignage ${index + 1} sur ${testimonials.length}"><span class="esims-quote-mark" aria-hidden="true">“</span><blockquote><p>${safe(item.quote)}</p></blockquote><div class="esims-quote-author"><img src="${safe(item.photo)}" alt="${safe(item.name)}" width="76" height="86" loading="lazy"><div><h3>${safe(item.name)}</h3><p>${safe(item.promotion || 'Ancien étudiant du CPMS')}</p><span>Cycle préparatoire</span></div></div><a class="esims-quote-more" href="${item.href}">Lire son témoignage <i class="fa fa-arrow-right" aria-hidden="true"></i></a></article>`).join('')}</div><div class="esims-testimonial-controls"><button type="button" data-testimonial-direction="-1" aria-controls="esims-testimonial-track" aria-label="Témoignage précédent"><i class="fa fa-arrow-left" aria-hidden="true"></i></button><span class="esims-testimonial-status" aria-live="polite" aria-atomic="true"></span><button type="button" data-testimonial-direction="1" aria-controls="esims-testimonial-track" aria-label="Témoignage suivant"><i class="fa fa-arrow-right" aria-hidden="true"></i></button></div><div class="text-center mt-30"><a class="esims-all-testimonials" href="/temoignages">Tous les témoignages <i class="fa fa-arrow-right" aria-hidden="true"></i></a></div></div></section>`).children[0];
  replace(oldTestimonials, [testimonySection]);
  assert.equal(all(doc, '.donation-part, .esims-admissions').length, 0);
  assert.equal(all(doc, '[data-esims-campuses]').length, 3);
  assert.equal(all(doc, '.esims-quote-card').length, testimonials.length);
  assert.equal(all(doc, '.esims-stat-card').length, 4);
  assert.equal(all(doc, '.esims-partner-card').length, 4);
  assert.equal(all(doc, '.esims-journeys .tab-pane').length, 2);
}
