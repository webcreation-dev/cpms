/** Animation du nouvel accueil, indépendante du carrousel Owl des autres blocs. */
export function initializeEsimsHome() {
  const hero = document.querySelector<HTMLElement>('.esims-hero');
  if (!hero || hero.dataset.initialized) return;
  hero.dataset.initialized = 'true';
  const slides = Array.from(hero.querySelectorAll<HTMLElement>('[data-esims-slide]'));
  const dots = Array.from(hero.querySelectorAll<HTMLButtonElement>('[data-esims-go]'));
  const pause = hero.querySelector<HTMLButtonElement>('.esims-hero-pause');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0, paused = motion.matches, outside = false, changing = false;
  let holdTimer: ReturnType<typeof setTimeout> | undefined;
  let finishTimer: ReturnType<typeof setTimeout> | undefined;
  const clearHold = () => { clearTimeout(holdTimer); };
  const controls = () => {
    hero.dataset.currentSlide = String(current);
    dots.forEach((dot, index) => {
      dot.classList.toggle('is-active', index === current);
      dot.setAttribute('aria-pressed', String(index === current));
    });
    pause?.setAttribute('aria-pressed', String(paused));
    pause?.setAttribute('aria-label', paused ? 'Reprendre le diaporama' : 'Mettre le diaporama en pause');
    const icon = pause?.querySelector('i'); if (icon) icon.className = paused ? 'fa fa-play' : 'fa fa-pause';
  };
  const schedule = () => {
    clearHold();
    if (paused || outside || document.hidden || motion.matches || slides.length < 2) return;
    holdTimer = setTimeout(() => show((current + 1) % slides.length), 4400);
  };
  const show = (index: number) => {
    clearHold();
    if (changing || index === current) { if (!changing) schedule(); return; }
    const previous = slides[current], next = slides[index];
    if (motion.matches) {
      previous.classList.remove('is-active'); previous.setAttribute('aria-hidden', 'true');
      next.classList.add('is-active'); next.setAttribute('aria-hidden', 'false');
      current = index; controls(); return;
    }
    changing = true; hero.dataset.transitioning = 'true'; hero.classList.add('is-changing');
    previous.classList.add('is-leaving'); next.classList.add('is-entering'); next.setAttribute('aria-hidden', 'false');
    finishTimer = setTimeout(() => {
      previous.classList.remove('is-active', 'is-leaving'); previous.setAttribute('aria-hidden', 'true');
      next.classList.remove('is-entering'); next.classList.add('is-active');
      current = index; changing = false; hero.dataset.transitioning = 'false'; hero.classList.remove('is-changing');
      controls(); schedule();
    }, 1150);
  };
  dots.forEach((dot, index) => dot.addEventListener('click', () => { if (!changing) show(index); }));
  pause?.addEventListener('click', () => { paused = !paused; controls(); schedule(); });
  hero.addEventListener('keydown', event => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    show((current + (event.key === 'ArrowRight' ? 1 : slides.length - 1)) % slides.length);
  });
  let touch: { x: number; y: number } | undefined;
  hero.addEventListener('pointerdown', event => { if (event.pointerType === 'touch') touch = { x: event.clientX, y: event.clientY }; }, { passive: true });
  hero.addEventListener('pointerup', event => {
    if (!touch) return;
    const dx = event.clientX - touch.x, dy = event.clientY - touch.y; touch = undefined;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) show((current + (dx < 0 ? 1 : slides.length - 1)) % slides.length);
  }, { passive: true });
  document.addEventListener('visibilitychange', schedule);
  new IntersectionObserver(entries => { outside = !entries[0].isIntersecting; schedule(); }, { threshold: 0.05 }).observe(hero);
  motion.addEventListener('change', () => { paused = motion.matches; controls(); schedule(); });
  window.addEventListener('pagehide', () => { clearHold(); clearTimeout(finishTimer); }, { once: true });
  controls(); schedule();

  const section = document.getElementById('nos-formations');
  const title = document.getElementById('esims-formations-title');
  const originalTitle = title?.textContent ?? '';
  const status = document.getElementById('esims-campus-status');
  const reset = document.querySelector<HTMLButtonElement>('.esims-campus-reset');
  const countries = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-esims-campus]'));
  const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-esims-campuses]'));
  const filter = (country?: string) => {
    cards.forEach(card => { card.hidden = Boolean(country && !card.dataset.esimsCampuses?.split(' ').includes(country)); });
    countries.forEach(link => {
      const active = link.dataset.esimsCampus === country;
      link.classList.toggle('is-selected', active);
      if (active) link.setAttribute('aria-current', 'true'); else link.removeAttribute('aria-current');
    });
    if (title) title.textContent = country ? `Nos filières au ${country === 'benin' ? 'Bénin' : 'Togo'}` : originalTitle;
    if (reset) reset.hidden = !country;
    if (status) status.textContent = country === 'benin' ? 'Cotonou · Bénin : le cycle préparatoire.' : country === 'togo' ? 'Lomé · Togo : le cycle préparatoire et les licences professionnelles.' : '';
  };
  countries.forEach(link => link.addEventListener('click', event => {
    event.preventDefault(); filter(link.dataset.esimsCampus);
    history.replaceState(null, '', '#nos-formations');
    section?.scrollIntoView({ behavior: motion.matches ? 'instant' : 'smooth', block: 'start' });
  }));
  reset?.addEventListener('click', () => filter());

  const journeyTabs = Array.from(document.querySelectorAll<HTMLAnchorElement>('.esims-journey-tabs [role="tab"]'));
  journeyTabs.forEach((tab, index) => {
    tab.tabIndex = tab.classList.contains('active') ? 0 : -1;
    tab.addEventListener('click', () => journeyTabs.forEach(item => { item.tabIndex = item === tab ? 0 : -1; }));
    tab.addEventListener('keydown', event => {
      if (event.key === ' ') { event.preventDefault(); tab.click(); return; }
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? journeyTabs.length - 1
        : (index + (event.key === 'ArrowRight' ? 1 : journeyTabs.length - 1)) % journeyTabs.length;
      journeyTabs[next].focus(); journeyTabs[next].click();
    });
  });

}

/** Carrousel partagé par l’accueil et la page L’École. */
export function initializeEsimsTestimonials() {
  const track = document.querySelector<HTMLElement>('.esims-testimonial-track');
  if (track && !track.dataset.initialized) {
    track.dataset.initialized = 'true';
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const testimonials = Array.from(track.querySelectorAll<HTMLElement>('.esims-quote-card'));
    const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-testimonial-direction]'));
    const counter = document.querySelector<HTMLElement>('.esims-testimonial-status');
    const updateTestimonials = () => {
      const bounds = track.getBoundingClientRect();
      const visible = testimonials.map((card, index) => ({ bounds: card.getBoundingClientRect(), index }))
        .filter(card => card.bounds.right > bounds.left + 5 && card.bounds.left < bounds.right - 5);
      if (counter && visible.length) {
        const start = visible[0].index + 1, end = visible[visible.length - 1].index + 1;
        counter.textContent = `${start === end ? start : `${start}–${end}`} / ${testimonials.length}`;
      }
      buttons.forEach(button => {
        button.disabled = button.dataset.testimonialDirection === '-1'
          ? track.scrollLeft < 2
          : track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
      });
    };
    const advance = (direction: number) => {
      const step = testimonials[0]?.getBoundingClientRect().width ?? track.clientWidth;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      track.scrollBy({ left: direction * (step + gap), behavior: motion.matches ? 'instant' : 'smooth' });
    };
    buttons.forEach(button => button.addEventListener('click', () => advance(Number(button.dataset.testimonialDirection))));
    track.addEventListener('keydown', event => {
      if (event.target !== track || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      if (event.key === 'Home' || event.key === 'End') track.scrollTo({ left: event.key === 'Home' ? 0 : track.scrollWidth, behavior: motion.matches ? 'instant' : 'smooth' });
      else advance(event.key === 'ArrowRight' ? 1 : -1);
    });
    track.addEventListener('scroll', updateTestimonials, { passive: true });
    new ResizeObserver(updateTestimonials).observe(track);
    updateTestimonials();
  }
}
