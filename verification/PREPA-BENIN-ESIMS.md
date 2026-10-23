# Cycle préparatoire — Bénin

Version du 22 octobre 2026 à regarder ensemble : http://127.0.0.1:3003/cycle-preparatoire.

Référence consultée : [fiche du cycle préparatoire HEI de JUNIA](https://www.junia.com/formations/cycle-preparatoire-integre-ingenieur-hei-generaliste/). L’organisation reprend une navigation par sections, un résumé pratique à droite, trois atouts photographiques et une ouverture sur la poursuite d’études. La grille Bootstrap, les cartes courses-item, la liste course-features-info, les typographies et les boutons viennent des conventions Educavo. Palette ESIMS conservée.

Contenu de la page :

- Bannière en deux colonnes : titre du cycle, drapeau du Bénin, photo réelle de la salle de cours à Cotonou et lien de présentation vidéo déjà utilisé sur le site.
- Navigation : Présentation, Programme, Points forts, Stages et projets, Admissions, Frais. La rubrique active suit le défilement. Les ancres fonctionnent sans JavaScript.
- Résumé pratique : Cotonou, deux années, accès après le bac, programme CP2i, stage académique de quatre semaines, brochure et procédure d’inscription.
- Programme : tableau des dix matières et coefficients provenant de la présentation historique de l’école.
- Trois atouts illustrés avec les photos des archives ESIMS : suivi pédagogique, pratique, préparation de la poursuite.
- Stages et projets : résumé lisible et détail complet de la source. Ancres historiques `#stages`, `#projets`, `#ressources`, `#frais` et `#tenue` conservées.
- Candidature au Bénin : Terminales C, D et E, lien vers la procédure et le formulaire PDF. Aucune date nouvelle n’est inventée.
- Frais et tenue : trois tableaux historiques conservés, avec avertissement sur la confirmation du barème par le secrétariat. Tableaux défilables horizontalement sur téléphone.

Les cinq anciens panneaux de contenu sont conservés dans des blocs dépliables, chacun associé à la rubrique correspondante. Le générateur compare toujours les paragraphes, listes, légendes, photos et cellules des tableaux à la source WordPress. La poursuite en école partenaire est présentée selon les conditions d’admission de l’établissement d’accueil, sans promesse d’admission automatique.

La barre de navigation reste sous l’en-tête sur ordinateur et en haut de l’écran sur mobile. Le résumé est fixe dans sa colonne sur les grands écrans suffisamment hauts ; il suit le flux sur les petites hauteurs et sur mobile pour rester intégralement consultable.

Implémentation : `scripts/esims-preparatory-page.mjs`, `public/cpms/preparatory.css`, `src/lib/esims-course.ts`, activation dans TemplateRuntime et feuille de style limitée à la page Bénin. La page ingénieur et les deux fiches du Togo ne sont pas recomposées.

Vérifications : import réussi ; build et TypeScript réussis (159 pages) ; 634 fichiers Educavo originaux intacts ; 290 médias/documents référencés présents. Navigateur à 1280 × 900 et 390 × 844 : navigation active correcte, ancrage sous le menu, colonne fixe, détails dépliables, dix matières et trois tableaux de frais accessibles, aucun débordement horizontal de la page. Sur mobile les tableaux de 620 px défilent dans leur propre conteneur.

Captures : `esims-prepa-benin-banniere.png`, `esims-prepa-benin-programme.png`, `esims-prepa-benin-mobile.png`.
