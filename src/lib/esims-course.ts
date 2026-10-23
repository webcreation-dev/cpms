/** Navigation de la fiche filière ; chaque rubrique reste lisible sans JavaScript. */
export function initializeEsimsCourse() {
  const nav = document.querySelector<HTMLElement>('.esims-course-nav');
  if (!nav || nav.dataset.initialized) return;
  nav.dataset.initialized = 'true';
  const links = Array.from(nav.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
  const sections = links.map(link => document.getElementById(link.hash.slice(1)));
  let frame = 0;
  const update = () => {
    frame = 0;
    const offset = nav.getBoundingClientRect().bottom + 45;
    let current = 0;
    sections.forEach((section, index) => { if (section && section.getBoundingClientRect().top <= offset) current = index; });
    links.forEach((link, index) => {
      link.classList.toggle('is-active', index === current);
      if (index === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  document.querySelectorAll('.esims-course-detail').forEach(detail => detail.addEventListener('toggle', schedule));
  const revealHash = () => {
    let id: string;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    let detail = target?.closest('details');
    let revealed = false;
    while (detail) {
      if (!detail.open) { detail.open = true; revealed = true; }
      detail = detail.parentElement?.closest('details') ?? null;
    }
    if (revealed) requestAnimationFrame(() => target?.scrollIntoView({ block: 'start' }));
  };
  window.addEventListener('hashchange', revealHash);
  revealHash();
  update();
}
