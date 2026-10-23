export async function POST() {
  return new Response("L’envoi depuis le site n’est pas encore disponible. Contactez directement l’EIMS : contact@cpms.education ou 01 62 72 10 72. Aucun message n’a été envoyé.", {
    status: 503,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
