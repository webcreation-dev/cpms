import { documentFrom } from './editorial-dom.mjs';
import { homeStatistics } from './cpms-home-content.mjs';

const section = html => documentFrom(html).children[0];

const journeys = [
  {
    id: 'prepa', label: 'Cycle préparatoire',
    intro: 'Deux années de préparation scientifique pour construire votre parcours vers l’ingénierie.',
    steps: [
      ['Bac', 'Choisir la voie scientifique', 'Après le baccalauréat, rejoindre le cycle préparatoire au Bénin ou au Togo.'],
      ['Bac+1', 'Acquérir les fondamentaux', 'Développer ses connaissances scientifiques, sa méthode de travail et sa rigueur.'],
      ['Bac+2', 'Valider la préparation', 'Achever les deux années du cycle préparatoire et préparer sa poursuite d’études.'],
      ['Bac+5', 'Viser le diplôme d’ingénieur', 'Poursuivre trois années en école partenaire, notamment en France, selon les conditions d’admission.'],
    ],
    note: 'La poursuite chez les partenaires dépend de la validation du cycle et des conditions d’admission applicables.',
    links: [['Prépa au Bénin', '/cycle-preparatoire'], ['Prépa au Togo', '/cycle-preparatoire-togo']],
  },
  {
    id: 'licence', label: 'Licence professionnelle',
    intro: 'Au Togo, un parcours en trois ans pour développer des compétences scientifiques et professionnelles.',
    steps: [
      ['Bac', 'Choisir sa spécialité', 'S’orienter vers une licence professionnelle proposée par EIMS-Togo à Lomé.'],
      ['3 ans', 'Se former au Togo', 'Acquérir progressivement les connaissances et les compétences de sa spécialité.'],
      ['Bac+3', 'Obtenir sa licence', 'Valider son cursus de licence professionnelle en sciences et technologies.'],
      ['Après', 'Entrer dans la vie professionnelle', 'Mettre ses compétences au service des entreprises et construire son projet professionnel.'],
    ],
    note: 'Les spécialités ouvertes et les modalités d’admission sont à préciser avec l’école pour chaque rentrée.',
    links: [['Découvrir les licences', '/licences-professionnelles'], ['Contacter l’école', '/contact']],
  },
];

/** Cartes et onglets dans les conventions Bootstrap déjà présentes dans Educavo. */
export function homeJourney(safe) {
  return section(`<section class="esims-journeys pt-70 pb-70 md-pt-50 md-pb-50" id="votre-parcours" aria-labelledby="esims-journey-title"><div class="container">
    <div class="sec-title text-center mb-40"><div class="sub-title primary">Votre avenir se construit ici</div><h2 class="title" id="esims-journey-title">Quel parcours après le bac&nbsp;?</h2></div>
    <ul class="nav esims-journey-tabs" role="tablist" aria-label="Choisir un parcours">${journeys.map((journey, i) => `<li class="nav-item" role="presentation"><a id="esims-${journey.id}-tab" class="nav-link${i === 0 ? ' active' : ''}" data-toggle="tab" href="#esims-${journey.id}-panel" role="tab" aria-controls="esims-${journey.id}-panel" aria-selected="${i === 0}">${journey.label}</a></li>`).join('')}</ul>
    <div class="tab-content">${journeys.map((journey, i) => `<div id="esims-${journey.id}-panel" class="tab-pane fade${i === 0 ? ' show active' : ''}" role="tabpanel" aria-labelledby="esims-${journey.id}-tab"><p class="esims-journey-intro">${journey.intro}</p><ol class="esims-journey-grid">${journey.steps.map(([level, title, body], index) => `<li class="esims-journey-step esims-step-${index + 1}"><div class="esims-journey-progress" aria-hidden="true">${journey.steps.map((_, dot) => `<span${dot === index ? ' class="is-current"' : ''}></span>`).join('')}</div><span class="esims-journey-level">${level}</span><h3>${safe(title)}</h3><p>${safe(body)}</p></li>`).join('')}</ol><p class="esims-journey-note">${journey.note}</p><div class="esims-journey-actions">${journey.links.map(([label, href], j) => `<a class="readon2${j ? ' esims-secondary-action' : ''}" href="${href}">${safe(label)} <i class="fa fa-arrow-right" aria-hidden="true"></i></a>`).join('')}</div></div>`).join('')}</div>
  </div></section>`);
}

export function homeResults(safe) {
  return section(`<section class="esims-results pt-70 pb-70 md-pt-50 md-pb-50" id="cpms-en-chiffres" aria-labelledby="esims-results-title"><div class="container"><div class="sec-title text-center mb-50"><div class="sub-title primary">Le CPMS en chiffres</div><h2 class="title" id="esims-results-title">Les chiffres qui font notre force</h2><p>Le bilan du cycle préparatoire au Bénin.</p></div><dl class="esims-stat-grid">${homeStatistics.map((stat, index) => `<div class="esims-stat-card${index === 0 ? ' esims-stat-featured' : ''}"><dt>${safe(stat.label)}</dt><dd>${stat.value}</dd></div>`).join('')}</dl></div></section>`);
}

export function homePartners({ junia, ecpi }, safe) {
  const schools = [
    { name: 'HEI', group: 'Groupe JUNIA · France', image: junia, alt: 'JUNIA, groupe du programme HEI' },
    { name: 'ISA', group: 'Groupe JUNIA · France', image: junia, alt: 'JUNIA, groupe du programme ISA' },
    { name: 'ISEN', group: 'Groupe JUNIA · France', image: junia, alt: 'JUNIA, groupe du programme ISEN' },
    { name: 'ECPI Dakar', group: 'Dakar · Sénégal', image: ecpi, alt: 'École Centrale Polytechnique d’Ingénieurs' },
  ];
  return section(`<section class="rs-partner esims-partners pt-70 pb-70 md-pt-50 md-pb-50" id="nos-partenaires" aria-labelledby="esims-partners-title"><div class="container"><div class="sec-title text-center mb-40"><div class="sub-title primary">Un parcours ouvert sur le monde</div><h2 class="title" id="esims-partners-title">Nos écoles partenaires</h2><p>HEI, ISA et ISEN, trois programmes du groupe JUNIA, et ECPI Dakar.</p></div><div class="esims-partner-grid">${schools.map(school => `<a class="esims-partner-card" href="/qui-sommes-nous#ecoles-partenaires"><div class="esims-partner-logo"><img src="${school.image}" alt="${safe(school.alt)}" width="240" height="160" loading="lazy"></div><h3>${school.name}</h3><p>${school.group}</p><span>Découvrir <i class="fa fa-arrow-right" aria-hidden="true"></i></span></a>`).join('')}</div></div></section>`);
}
