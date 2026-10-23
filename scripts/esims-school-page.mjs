import assert from 'node:assert/strict';
import { documentFrom, serialize, one, all, put, contents, label, text } from './editorial-dom.mjs';
import { homeResults } from './esims-home-sections.mjs';
import { subjectsTable } from './cpms-about-page.mjs';

const clone = node => documentFrom(serialize(node)).children[0];

/** Page institutionnelle : grille Educavo, références JUNIA et composants partagés. */
export async function schoolPage(doc, { homeHtml, faqHtml, photos, rows, paragraphs, safe, image }) {
  const home = documentFrom(homeHtml);
  const breadcrumbs = clone(one(doc, '.rs-breadcrumbs'));
  put(breadcrumbs, 'h1', 'L’École');
  label(all(breadcrumbs, 'li').at(-1), 'L’École');
  await image(one(breadcrumbs, 'img'), photos.banner, 'Les étudiants de l’ESIMS à Cotonou');

  const intro = documentFrom(`<section id="rs-about" class="rs-about style1 esims-school-intro pt-100 pb-100 md-pt-70 md-pb-70"><div class="container"><div class="row align-items-center">
    <div class="col-lg-5 md-mb-40"><figure class="esims-school-visual"><img src="${photos.intro}" alt="Journée portes ouvertes de l’ESIMS à Cotonou" width="960" height="1280" loading="lazy"><figcaption>La vie à l’ESIMS · Cotonou</figcaption></figure></div>
    <div class="col-lg-6 offset-lg-1"><div class="sec-title"><div class="sub-title">À propos de l’ESIMS</div><h2 class="title mb-25">Une école,<br><span class="esims-school-highlight">plusieurs horizons.</span></h2><p class="esims-school-lead">L’École supérieure d’ingénierie Sainte Marie Stella accompagne les étudiants dans leur formation scientifique et technique, au Bénin et au Togo.</p><div class="desc"><p>À Cotonou, l’école propose le cycle préparatoire. À Lomé, son offre comprend le cycle préparatoire et des licences professionnelles en sciences et technologies.</p><p>Construire des bases solides, développer ses compétences et préparer la suite de son parcours : c’est le fil conducteur de ces formations.</p></div><div class="esims-school-intro-actions mt-30"><a class="readon2" href="/formations">Découvrir nos filières <i class="fa fa-arrow-right" aria-hidden="true"></i></a><a class="esims-school-text-link" href="/nos-implantations">Nos implantations</a></div></div></div>
  </div></div></section>`).children[0];

  const campuses = `<section class="rs-about style1 gray-bg esims-school-campuses pt-70 pb-70 md-pt-50 md-pb-50" id="implantations" aria-labelledby="school-campus-title"><div class="container">
    <div class="sec-title text-center mb-40"><div class="sub-title">Une école, deux implantations</div><h2 class="title" id="school-campus-title">Deux pays, des parcours à découvrir</h2><div class="desc">Choisissez votre lieu de formation et découvrez l’offre qui y est proposée.</div></div>
    <div class="row">
      <div class="col-lg-6 mb-30"><article class="esims-campus-card"><div class="esims-campus-heading"><img src="/cpms/icons/flag-benin.svg" width="54" height="36" alt="Drapeau du Bénin"><div><span>Bénin</span><h3>Cotonou</h3></div></div><h4>Le cycle préparatoire</h4><p>Deux années de formation scientifique pour préparer la poursuite d’études en école d’ingénieur.</p><div class="esims-school-recognition"><span class="esims-school-label">Reconnaissance au Bénin</span><p>L’École supérieure d’ingénierie Sainte Marie Stella bénéficie de l’autorisation de création et d’ouverture mentionnée dans l’arrêté de 2021 N°1018/MESRS/DC/SGM/DGES/CT-J/CJ/SA/049SGG21.</p></div><a class="readon2" href="/cycle-preparatoire">La prépa au Bénin <i class="fa fa-arrow-right" aria-hidden="true"></i></a></article></div>
      <div class="col-lg-6 mb-30"><article class="esims-campus-card"><div class="esims-campus-heading"><img src="/cpms/icons/flag-togo.svg" width="54" height="36" alt="Drapeau du Togo"><div><span>Togo</span><h3>Lomé</h3></div></div><h4>La prépa et les licences professionnelles</h4><p>Un cycle préparatoire de niveau bac+2 et des licences professionnelles de niveau bac+3 en sciences et technologies.</p><div class="esims-school-recognition"><span class="esims-school-label">Agrément au Togo</span><p>L’agrément d’ouverture d’ESIMS-Togo mentionne ces deux parcours et neuf spécialités de licence professionnelle.</p><a class="esims-school-document" href="/cpms/originals/institution/agrement-esims-togo.pdf" target="_blank" rel="noopener noreferrer"><i class="fa fa-file-pdf-o" aria-hidden="true"></i> Consulter l’agrément (PDF)</a></div><a class="readon2" href="/nos-implantations#lome">Les parcours au Togo <i class="fa fa-arrow-right" aria-hidden="true"></i></a></article></div>
    </div><div class="text-center"><a class="esims-school-text-link" href="/nos-implantations">En savoir plus sur nos implantations <i class="fa fa-arrow-right" aria-hidden="true"></i></a></div>
  </div></section>`;

  // Montage et colonnes issus de la première section About ; photo unique ici.
  const pedagogy = clone(one(doc, '#rs-about'));
  pedagogy.attribs.id = 'notre-pedagogie';
  pedagogy.attribs.class += ' esims-school-pedagogy';
  one(pedagogy, '.order-last').attribs.class = 'col-lg-6 md-mb-30';
  one(pedagogy, '.pr-70').attribs.class = 'col-lg-6 pl-50 md-pl-15';
  await image(one(pedagogy, '.img-part img'), photos.lab, 'Travaux pratiques du cycle préparatoire à Cotonou');
  put(pedagogy, '.sub-title', 'L’esprit Sainte Marie Stella');
  one(pedagogy, '.sub-title').attribs.class = 'sub-title';
  put(pedagogy, '.title', 'Apprendre, expérimenter et progresser ensemble');
  contents(one(pedagogy, '.bold-text'), 'Discipline – Courtoisie – Honnêteté – Excellence');
  contents(one(pedagogy, '.desc'), '<p>Dans le cycle préparatoire au Bénin, l’apprentissage associe cours, travaux dirigés, travaux pratiques et projets en équipe.</p><ul class="esims-school-principles"><li><strong>Des fondamentaux scientifiques</strong><span>Construire ses connaissances et sa méthode de travail.</span></li><li><strong>Un accompagnement de proximité</strong><span>Progresser avec l’appui des enseignants et l’entraide entre étudiants.</span></li><li><strong>Des expériences concrètes</strong><span>Mettre ses acquis en pratique à travers les projets et les stages académiques.</span></li></ul><a class="esims-school-text-link" href="/cycle-preparatoire">Découvrir la pédagogie de la prépa <i class="fa fa-arrow-right" aria-hidden="true"></i></a>');

  // Grille de logos inspirée du programme HEI, sur les cartes déjà validées de l’accueil.
  const partnerItems = [
    { name: 'HEI', group: 'Programme du groupe JUNIA', location: 'France', logo: '/cpms/originals/branding/junia.png', href: 'https://www.junia.com/programmes/programme-hei/' },
    { name: 'ISA', group: 'Programme du groupe JUNIA', location: 'France', logo: '/cpms/originals/branding/junia.png', href: 'https://www.junia.com/programmes/programme-isa/' },
    { name: 'ISEN', group: 'Programme du groupe JUNIA', location: 'France', logo: '/cpms/originals/branding/junia.png', href: 'https://www.junia.com/programmes/programme-isen/' },
    { name: 'ECPI Dakar', group: 'École Centrale Polytechnique d’Ingénieurs', location: 'Sénégal', logo: '/cpms/originals/branding/ecpi.webp', href: 'https://ecpi-edu.com/' },
  ];
  const partners = documentFrom(`<section class="rs-partner esims-partners esims-school-network pt-70 pb-70 md-pt-50 md-pb-50" id="ecoles-partenaires" aria-labelledby="school-partners-title"><div class="container"><div class="sec-title text-center mb-50"><div class="sub-title primary">Un parcours ouvert sur le monde</div><h2 class="title" id="school-partners-title">Quatre partenaires,<br>de nouvelles perspectives</h2><p>HEI, ISA et ISEN, trois programmes du groupe JUNIA, ainsi qu’ECPI Dakar.</p></div><div class="esims-partner-grid">${partnerItems.map(item => `<a class="esims-partner-card" href="${item.href}" target="_blank" rel="noopener noreferrer"><div class="esims-partner-logo"><img src="${item.logo}" alt="${item.name === 'ECPI Dakar' ? 'ECPI Dakar' : 'JUNIA, groupe du programme ' + item.name}" width="240" height="160" loading="lazy"></div><span class="esims-school-partner-country">${item.location}</span><h3>${item.name}</h3><p>${item.group}</p><span>Découvrir l’école <i class="fa fa-arrow-right" aria-hidden="true"></i></span></a>`).join('')}</div><div class="esims-school-pathway mt-40"><div><h3>Après la prépa, préparer la suite</h3><p>Après deux années validées, les étudiants peuvent envisager une poursuite de trois années en école d’ingénieur partenaire, selon les conditions d’admission de l’établissement d’accueil.</p></div><a class="readon2" href="/cycle-ingenieur">Comprendre le parcours <i class="fa fa-arrow-right" aria-hidden="true"></i></a></div></div></section>`).children[0];

  const results = homeResults(safe);
  results.attribs.class = results.attribs.class.replace('esims-results', 'esims-results esims-school-results');

  // Les quatre citations et leurs portraits sont ceux de l’accueil, issus de WordPress.
  const testimonials = clone(one(home, '.esims-testimonials'));
  testimonials.attribs.id = 'paroles-d-anciens';
  testimonials.attribs.class += ' esims-school-voices';
  contents(one(testimonials, '.sec-title > p'), 'Ils racontent leur passage en prépa, l’accompagnement reçu et la suite de leurs études.');

  const qa = [
    ['Quelle est la place du cycle préparatoire à l’ESIMS ?', 'Le cycle préparatoire est l’un des parcours de l’École supérieure d’ingénierie Sainte Marie Stella. Il est proposé à Cotonou et à Lomé ; au Togo, l’offre comprend également des licences professionnelles.'],
    ['Quelles filières choisir au Bénin et au Togo ?', 'À Cotonou : le <a href="/cycle-preparatoire">cycle préparatoire</a>. À Lomé : le <a href="/cycle-preparatoire-togo">cycle préparatoire</a> et les <a href="/licences-professionnelles">licences professionnelles</a>. Contactez l’école pour connaître les spécialités ouvertes à la rentrée.'],
    ['Comment préparer une poursuite en école partenaire ?', 'La poursuite se prépare après la validation du cycle préparatoire, avec l’équipe pédagogique et l’école partenaire. Les conditions dépendent du parcours et de l’établissement d’accueil.'],
  ];
  const faqSource = documentFrom(faqHtml);
  const accordion = clone(one(faqSource, '.accordion'));
  accordion.attribs.id = 'school-questions';
  const prototype = serialize(one(accordion, '.card'));
  contents(accordion, qa.map(([question, answer], index) => {
    const card = documentFrom(prototype).children[0];
    const control = one(card, '.card-link'), panel = one(card, '.collapse');
    const id = 'school-answer-' + index;
    Object.assign(control.attribs, { id: id + '-toggle', href: '#' + id, 'data-target': '#' + id, 'aria-controls': id, 'aria-expanded': String(index === 0), class: 'card-link' + (index ? ' collapsed' : '') });
    label(control, question);
    Object.assign(panel.attribs, { id, 'data-parent': '#school-questions', 'aria-labelledby': id + '-toggle', class: 'collapse' + (index ? '' : ' show') });
    contents(one(card, '.card-body'), answer);
    return serialize(card);
  }).join(''));
  const faq = `<section class="rs-faq-part esims-school-faq gray-bg pt-70 pb-70 md-pt-50 md-pb-50" aria-labelledby="school-faq-title"><div class="container"><div class="row"><div class="col-lg-4 pr-40 md-pr-15 md-mb-30"><div class="sec-title"><div class="sub-title">Vos questions</div><h2 class="title" id="school-faq-title">Mieux connaître l’ESIMS</h2><div class="desc"><p>Une question sur l’école ou votre projet d’études ? Le secrétariat vous renseigne.</p></div><a class="readon2" href="/contact">Contactez-nous <i class="fa fa-arrow-right" aria-hidden="true"></i></a></div></div><div class="col-lg-8"><div class="content-part">${serialize(accordion)}</div></div></div></div></section>`;

  // Conserver le tableau demandé et l’ancre historique, dans un bloc secondaire.
  const subjects = documentFrom(subjectsTable({ paragraphs, rows, safe })).children[0];
  subjects.attribs.class = 'rs-about style1 esims-school-subjects pt-70 pb-70 md-pt-50 md-pb-50';
  put(subjects, '.sub-title', 'Cycle préparatoire · Bénin');
  contents(one(subjects, '.desc'), '<p>Les deux années de la prépa au Bénin se déroulent en tronc commun. Retrouvez ci-dessous les matières et les coefficients présentés par l’école.</p>');
  const table = serialize(one(subjects, '.table-responsive'));
  contents(one(subjects, '.table-responsive'), '');
  const tableWrapper = one(subjects, '.table-responsive');
  tableWrapper.parent.children = tableWrapper.parent.children.filter(child => child !== tableWrapper);
  const container = one(subjects, '.container');
  contents(container, container.children.map(serialize).join('') + `<details class="esims-school-table"><summary>Consulter les matières et les coefficients <i class="fa fa-angle-down" aria-hidden="true"></i></summary>${table}</details><div class="text-center mt-25"><a class="esims-school-text-link" href="/cycle-preparatoire">Le programme et les informations de la prépa <i class="fa fa-arrow-right" aria-hidden="true"></i></a></div>`);

  contents(one(doc, '.main-content'), serialize(breadcrumbs) + serialize(intro) + campuses + serialize(pedagogy) + serialize(results) + serialize(partners) + serialize(testimonials) + faq + serialize(subjects) + serialize(one(home, '.rs-newsletter')));
  one(doc, 'body').attribs.class += ' cpms-about-page esims-school-page';
  assert.equal(all(doc, '#ecoles-partenaires .esims-partner-card').length, 4);
  assert.equal(all(doc, '.esims-campus-card').length, 2);
  assert.equal(all(doc, '.cpms-about-table tbody tr').length, 10);
  assert.equal(all(doc, '.esims-quote-card').length, 4);
  assert.deepEqual(all(one(doc, '.cpms-about-table'), 'tbody tr').map(row => all(row, 'th, td').map(text)), rows);
}
