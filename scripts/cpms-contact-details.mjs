// Coordonnées et indications de trajet confirmées par le CPMS.
export const schoolLocation = 'L’école est située à Vèdoko, 2ème rue à gauche après l’église Jésus Eucharistie, en quittant l’Étoile rouge pour le stade de l’Amitié.';
export const schoolLocationHtml = 'L’école est située à <strong>Vèdoko, 2ème rue à gauche après l’église Jésus Eucharistie</strong>, en quittant l’Étoile rouge pour le stade de l’Amitié.';
export const contactLinks = '<a href="tel:+2290149141277">01 49 14 12 77</a> (appel uniquement) – <a href="tel:+2290162721072">01 62 72 10 72</a> (appel ou <a href="https://wa.me/2290162721072" target="_blank" rel="noopener noreferrer">WhatsApp</a>) ou par mail : <a href="mailto:contact@cpms.education">contact@cpms.education</a>.';
export function locationNotice() {
  return `<aside class="gray-bg p-30 mb-30 cpms-location-note" aria-label="Localisation et contacts du CPMS"><h3 class="mb-20"><i class="fa fa-map-marker" aria-hidden="true"></i> Nous trouver à Vèdoko</h3><p>${schoolLocationHtml}</p><p>Veuillez nous contacter au ${contactLinks}</p></aside>`;
}
