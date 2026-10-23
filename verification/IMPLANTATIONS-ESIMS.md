# Nos implantations

Version du 23 octobre 2026 : http://127.0.0.1:3003/nos-implantations.

La page reprend l’organisation des grandes cartes de lieux de la référence JUNIA déjà sélectionnée (`inspiration-junia/04-implantations.png`, page https://www.junia.com/nos-campus/). Elle conserve les grilles Bootstrap, les conventions de cartes Educavo, les typographies et la palette ESIMS. Aucun contenu, chiffre ou visuel de campus JUNIA n’est repris.

Contenu :

- Bannière bleu nuit « Une école, deux pays », liens Bénin/Togo avec drapeaux.
- Deux grandes cartes : photographie réelle de la vie étudiante à Cotonou, visuel graphique institutionnel pour Lomé. Chacune mène aux renseignements de l’implantation.
- Cotonou : cycle préparatoire, photographie de la bibliothèque, phrase de localisation validée à Vèdoko, numéro d’appel uniquement, numéro appel/WhatsApp, email et renvoi vers Contact.
- Lomé : prépa bac+2, licences professionnelles bac+3, liens vers les deux fiches Togo, demande de renseignements pratiques par email et agrément PDF.
- Trois questions dépliables pour préparer son projet et sa venue, puis newsletter et footer partagés.

Les ancres `#cotonou` et `#lome` sont conservées pour les liens existants. Les coordonnées béninoises ne sont pas présentées comme celles de Lomé. Sans photo ni adresse locale togolaise disponible, le visuel reste graphique et l’école est sollicitée pour les renseignements exacts. Aucun email ou message WhatsApp envoyé.

Implémentation : `scripts/esims-campus-page.mjs`, branchement dans `scripts/integrate-cpms.mjs`, feuille `public/cpms/campuses.css` chargée uniquement avec la classe `esims-implantations-page`. Ancienne fonction retirée de `esims-navigation-pages.mjs` ; la page Nos filières reste inchangée. Les pages L’École, accueil et filières conservent leurs mises en page.

Validation : import terminé (101 pages), build/TypeScript réussis (159 pages), 634 fichiers Educavo originaux intacts, 290 médias/documents présents. Premier build arrêté après compilation par une recommandation de mise à jour de sécurité de Next.js ; relance terminée avec le code 0. Dépendances inchangées. Contrôles des deux cartes, ancres, contacts Cotonou, liens des deux fiches Togo et présence de l’agrément réussis.

Navigateur : 1280 × 900 et 390 × 844, aucune largeur excédentaire ou image cassée. Cartes de même taille sur ordinateur, empilées sur mobile, FAQ dépliable. Ancrage des détails à 140 px sur ordinateur et 25 px sur mobile. Ajustement typographique final : espace insécable avant le point d’interrogation du titre ; largeur des boutons limitée à leur conteneur.

Captures : `esims-implantations-cartes.png`, `esims-implantations-cotonou.png`, `esims-implantations-lome.png`, `esims-implantations-mobile.png`.
