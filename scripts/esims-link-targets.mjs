/** Destinations retenues pour les anciens points d’entrée du site. */
export const legacyPageTargets = {
  '/presentation': '/qui-sommes-nous',
  '/partenaires': '/qui-sommes-nous#ecoles-partenaires',
  '/admissions': '/rentree-universitaire',
  '/cycle-ingenieur': '/#votre-parcours',
  '/domaines': '/formations',
  '/galerie': '/evenements',
};

/** Préserver les téléchargements, les services externes et les ancres locales. */
export function canonicalEditorialHref(href, registry = {}, routeTargets = {}) {
  if (!href || href.startsWith('#') || /^(?:[a-z]+:|\/\/)/i.test(href)) return href;
  const url = new URL(href, 'https://esims.local/');
  const visited = new Set();
  let changed = false;
  while (!visited.has(url.pathname)) {
    visited.add(url.pathname);
    const pathname = url.pathname.replace(/\/$/, '') || '/';
    const entry = registry[pathname.slice(1)];
    const destination = routeTargets[pathname] ?? legacyPageTargets[pathname] ?? entry?.canonical;
    if (!destination) break;
    const target = new URL(destination, 'https://esims.local/');
    url.pathname = target.pathname;
    if (target.hash) url.hash = target.hash;
    changed = true;
  }
  return changed ? url.pathname + url.search + url.hash : href;
}
