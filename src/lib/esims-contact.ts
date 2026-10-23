/** Préparer un brouillon dans le navigateur, sans envoi ni stockage de données. */
export function initializeEsimsContact() {
  const form = document.querySelector<HTMLFormElement>('#esims-contact-form');
  if (!form || form.dataset.initialized) return;
  form.dataset.initialized = 'true';
  const topic = form.elements.namedItem('topic') as HTMLSelectElement;
  const preview = document.querySelector<HTMLElement>('[data-esims-contact-preview]');
  const draft = document.querySelector<HTMLAnchorElement>('[data-esims-contact-draft]');
  const status = document.querySelector<HTMLElement>('[data-esims-contact-status]');
  const feedback = document.getElementById('contact-topic-feedback');
  const choices = document.querySelectorAll<HTMLAnchorElement>('[data-esims-contact-topic]');
  const behavior: ScrollBehavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  const invalidate = () => { if (preview) preview.hidden = true; };
  const syncTopic = () => {
    choices.forEach(choice => choice.classList.toggle('is-selected', choice.dataset.esimsContactTopic === topic.value));
    if (feedback) feedback.textContent = topic.value ? `Motif choisi : ${topic.selectedOptions[0].textContent}.` : '';
  };
  form.addEventListener('input', invalidate);
  form.addEventListener('change', invalidate);
  topic.addEventListener('change', syncTopic);
  choices.forEach(choice => choice.addEventListener('click', event => {
    event.preventDefault();
    topic.value = choice.dataset.esimsContactTopic ?? '';
    syncTopic();
    invalidate();
    document.getElementById('nous-ecrire')?.scrollIntoView({ block: 'start', behavior });
    topic.focus({ preventScroll: true });
  }));
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity() || !preview || !draft || !status) return;
    const values = new FormData(form);
    const value = (key: string) => String(values.get(key) ?? '').trim();
    const subject = `EIMS — ${topic.selectedOptions[0].textContent} — ${value('campus')}`;
    const details = [
      `Lieu de formation : ${value('campus')}`,
      value('name') ? `Nom : ${value('name')}` : '',
      value('email') ? `Email : ${value('email')}` : '',
    ].filter(Boolean).join('\n');
    const body = `${details}\n\n${value('message')}`;
    draft.href = `mailto:contact@cpms.education?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    status.textContent = 'Votre email est prêt. Ouvrez votre messagerie pour le vérifier et l’envoyer.';
    preview.hidden = false;
    preview.scrollIntoView({ block: 'nearest', behavior });
  });
}
