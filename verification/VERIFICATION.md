# Vérification du portage Educavo vers Next.js

14 octobre 2026 — première version technique, contenus de démonstration conservés.

## Résultat

L'accueil Next.js utilise `index3.html`. Les 51 modèles Educavo sont également accessibles aux chemins du catalogue. Les CSS, JavaScript, images et polices sont copiés sans modification ; les 634 fichiers du miroir original sont intacts.

Versions installées, verrouillées dans `package-lock.json` : Next.js 16.4.0, React / React DOM 19.3.0, html-react-parser 6.1.8, TypeScript 7.0.2.

## Contrôles effectués

| Contrôle | Résultat | Preuve |
|---|---|---|
| Build de production après les dernières adaptations | Réussi ; contrôle TypeScript et génération des pages inclus | `npm run build` |
| Fidélité des fichiers copiés et des sources originales | 51 modèles + 583 assets contrôlés par SHA-256 | `npm run verify:template` |
| Routes servies | 52 réponses HTTP 200 : accueil + 51 modèles | `http.json` |
| Fichiers servis par HTTP | 583 réponses 200 ; tous les corps identiques aux fichiers du template | `http.json` |
| Route inconnue | HTTP 404 | `http.json` |
| Contact de démonstration | HTTP 503 local ; aucun envoi simulé | `http.json` |
| Accueil desktop à 1280 × 720 | 12 sections : aucune différence de position, dimension, police, couleur, fond ou padding dans les mesures | `desktop-geometry.json` |
| Accueil mobile à 390 × 844 | 12 sections : aucune différence dans les mêmes mesures | `mobile-geometry.json` |
| Présentation about2 en desktop | 10 blocs mesurés, aucune différence ; hauteur totale identique de 5102 px | `interior-geometry.json` |
| Formation course-single en desktop | 3 blocs mesurés, aucune différence ; hauteur totale identique de 2651 px | `interior-geometry.json` |
| Catégories | Ouverture et fermeture vérifiées | `interactions.json` |
| Panneau latéral | Ouverture et fermeture vérifiées | `interactions.json` |
| Recherche modale | Ouverture et fermeture vérifiées ; recherche métier encore à connecter | `interactions.json` |
| Diaporama | Passage automatique observé de slide1 à slide2 | `interactions.json` |
| Menu mobile et sous-menu About | Ouverture et fermeture vérifiées | `interactions.json` |
| Onglets about2 | Mission et retour à History vérifiés | `interactions.json` |
| Onglets course-single | Curriculum, Instructor et retour à Overview vérifiés | `interactions.json` |
| Accordéon FAQ | Deuxième question ouverte et réponse affichée | `interactions.json` |
| Navigation entre modèles et retour au logo | Retour à `/` et réinitialisation des trois carrousels vérifiés | `interactions.json` |
| Console du navigateur sur les pages testées | Aucun avertissement ni erreur remonté lors des contrôles finaux | Contrôle navigateur après chargement et interactions |

Les réponses HTTP des fichiers ont été contrôlées après la correction des polices. La dernière adaptation ajoutant les cibles d'onglets et d'accordéons a ensuite été compilée et contrôlée dans le navigateur ; elle ne modifie aucun fichier statique.

## Adaptations techniques appliquées

- Chemins des médias et liens rendus absolus pour les routes Next.js.
- Liens d'accueil `index.html` dirigés vers l'accueil retenu `/`.
- Classe du body et ordre des feuilles de style propres à chaque modèle conservés.
- Scripts Educavo chargés dans l'ordre original après hydratation ; initialisation unique par document, avec reprise des callbacks `load`.
- Polices FontAwesome avec un `?` encodé servies par un handler local, avec les mêmes octets que les originaux.
- Cibles `data-target` non visuelles ajoutées aux onglets et accordéons dont le miroir avait transformé les fragments en `page.html#fragment`.
- Formulaires Contact dirigés vers une réponse locale de démonstration ; newsletter sans abonnement réel.

Aucun fichier CSS ni fichier de plugin Educavo n'est réécrit.

## Captures

- `next-desktop-entete.jpg` : accueil Next.js sur ordinateur.
- `next-desktop-complet.jpg` et `original-desktop-complet.jpg` : pages parcourues puis capturées intégralement.
- `next-mobile-entete.jpg` : accueil Next.js à 390 px de large.
- `next-mobile-complet.jpg` et `original-mobile-complet.jpg` : captures intégrales mobiles.
- `about2-entete.jpg` : page intérieure de présentation.

Les animations, compteurs et positions des carrousels dépendent du moment de capture. Les mesures portent sur les conteneurs et leurs styles ; aucune égalité pixel par pixel de toutes les images animées n'est revendiquée. Les pages intérieures ont été contrôlées sur les modèles représentatifs cités, pas toutes les interactions des 51 modèles.

## Périmètre restant

La prochaine étape est l'intégration des textes, photos, documents et vidéos CPMS identifiés dans l'analyse. La base WordPress et l'administration ne sont pas encore connectées. Les comptes, boutique, candidature, newsletter et recherche métier ne sont pas des services opérationnels dans cette reproduction.

Les imports Google Fonts originaux sont conservés, avec leur dépendance au réseau. Les scripts de démonstration restent ceux du template, conformément à la contrainte de conservation du design.

Les serveurs de contrôle étaient locaux et temporaires. Pour ouvrir le projet après cette vérification : `npm run dev` dans le dossier `cpms-next`, puis `http://127.0.0.1:3003/`.
