# Lecture des articles et Contact

Version du 23 octobre 2026. Pages de contrôle : http://127.0.0.1:3003/articles/40819-journee-orientation-etudiants et http://127.0.0.1:3003/contact.

Références consultées : article [JUNIA](https://www.junia.com/actualites/fermeture-estivale-junia/) pour la hiérarchie titre/date/photo/texte et [Contact JUNIA](https://www.junia.com/contact/) pour les motifs de demande. Les composants sont adaptés aux conventions `blog-post-left.html` et `contact4.html` Educavo, aux couleurs ESIMS et aux boutons rectangulaires.

## Lecture

Le titre réel devient l’unique h1 du billet, dans une bannière bleu nuit. Catégorie, date explicite de publication, estimation du temps de lecture et accès à la galerie accompagnent le titre. La photo du billet ouvre la colonne de lecture, avec une typographie et des intertitres plus aérés. Le texte intégral et toutes les images restent conservés, dans l’ordre de la source.

Les textes comportant plusieurs intertitres disposent d’un sommaire : colonne gauche sur ordinateur, bloc dépliable avant l’article sur mobile. Les widgets Posts récents, Archives, Catégories et Méta restent accessibles ; les archives se déplient pour éviter de rallonger les billets courts. Les widgets passent après l’article sur téléphone. Trois suggestions « À lire aussi » et des liens de retour vers les publications concluent la lecture.

Le nouveau gabarit s’applique aux billets, y compris aux événements et témoignages publiés en articles. La page de campagne `/rentree-universitaire` conserve sa présentation dédiée grâce à une option explicite du générateur. Ses six pièces et huit échéances restent présentes.

Implémentation : `scripts/esims-article-page.mjs`, `public/cpms/article.css`, branchement dans `scripts/cpms-news-pages.mjs`. Feuille limitée à la classe `esims-article-page`. Assertions de conservation du texte et de chaque image actives avant et après recomposition.

## Contact

Trois motifs : rejoindre l’école, choisir sa filière, préparer sa venue. Les liens présélectionnent le motif et mènent au formulaire. Les contacts réels sont présentés avec les distinctions appel uniquement et appel/WhatsApp. La phrase de localisation de Vèdoko est conservée mot pour mot et utilise la police du texte courant. Les renseignements locaux de Lomé sont à demander à l’école ; les numéros béninois ne sont pas attribués à Lomé.

Le formulaire prépare un email dans le navigateur. Motif, implantation, nom/email facultatifs et message composent le brouillon. Le visiteur peut ensuite ouvrir sa messagerie, vérifier le contenu et l’envoyer lui-même. Aucun envoi serveur, stockage ou appel à l’API de démonstration n’est effectué. Le bouton n’annonce jamais un message envoyé. Modifier un champ masque le brouillon devenu obsolète. Les liens email, téléphone et WhatsApp restent disponibles directement. Sans JavaScript, l’action du formulaire utilise `mailto:` et les liens de contact restent utilisables.

Implémentation : `scripts/esims-contact-page.mjs`, `public/cpms/contact.css`, `src/lib/esims-contact.ts`, initialisation dans TemplateRuntime. Styles limités à `esims-contact-page`. Alias Contact conservés. L’ancienne API de démonstration reste inchangée mais n’est plus utilisée par ce formulaire.

## Vérifications

Import terminé : 103 pages et 122 routes éditoriales. Compilation et TypeScript réussis : 161 pages. Next.js a de nouveau signalé sa recommandation de mise à jour de sécurité après compilation ; la relance a terminé avec le code 0 et le même avertissement. Dépendances inchangées. Les 634 fichiers originaux Educavo restent intacts ; les 281 médias/documents actuellement référencés sont présents. Contrôles des ancres, de la phrase de localisation exacte, des trois motifs, du brouillon local et de la préservation de la campagne réussis.

Navigateur 1280 × 900 et 390 × 844 : aucun débordement horizontal ni image cassée observée ; lecture avant les widgets sur téléphone ; sommaire dépliable mobile fonctionnel. Ancres à 140 px sur ordinateur et 25 px sur mobile. Galerie de l’article d’orientation : ouverture et passage de la photo 1/2 à 2/2 testés. Contact : présélection, champs requis, destinataire/objet/implantation dans le brouillon et invalidation après modification testés. Aucun message, appel ou WhatsApp envoyé ; le lien final vers l’application de messagerie n’a pas été activé pendant les tests.

Captures : `esims-article-lecture.png`, `esims-article-texte.png`, `esims-article-mobile.png`, `esims-contact-banniere.png`, `esims-contact-motifs.png`, `esims-contact-formulaire.png`, `esims-contact-mobile.png`.
