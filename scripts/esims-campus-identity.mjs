/** Logos des implantations Bénin et Togo. */
export function campusLogo(country) {
  const label = country === 'benin' ? 'ESIMS-Bénin' : 'ESIMS-Togo';
  return `<span class="esims-campus-logo esims-campus-logo--${country}"><img src="/cpms/logos/esims-${country}.png" alt="Logo ${label}" width="512" height="512" loading="lazy" decoding="async"></span>`;
}
