import { documentFrom, serialize, one, all, put, label, contents } from './editorial-dom.mjs';

function pageLayout(doc, title, html) {
  const breadcrumbs = one(doc, '.rs-breadcrumbs');
  put(breadcrumbs, 'h1', title);
  label(all(breadcrumbs, 'li').at(-1), title);
  const newsletter = one(doc, '.rs-newsletter');
  contents(one(doc, '.main-content'), serialize(breadcrumbs) + html + (newsletter ? serialize(newsletter) : ''));
}

/** Même grille Educavo que l’accueil, avec les trois offres effectivement présentées. */
export async function filieresPage(doc, { homeHtml, photo, image }) {
  await image(one(doc, '.rs-breadcrumbs img'), photo, 'La vie étudiante à l’EIMS au Bénin');
  const courses = one(documentFrom(homeHtml), '#nos-formations');
  const feedback = one(courses, '.esims-campus-feedback');
  if (feedback) feedback.parent.children = feedback.parent.children.filter(child => child !== feedback);
  pageLayout(doc, 'Nos filières', serialize(courses));
}
