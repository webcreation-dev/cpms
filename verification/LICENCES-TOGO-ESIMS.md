# Licences professionnelles — Togo

Version du 23 octobre 2026 : http://127.0.0.1:3003/licences-professionnelles.

La page adopte la présentation des fiches prépa : bannière avec drapeau, photographie, navigation fixe, grille Educavo en deux colonnes et résumé pratique à droite. Les couleurs, typographies, boutons et habillages restent ceux du site ESIMS. L’ancien contenu à trois onglets est remplacé par six rubriques : Présentation, Spécialités, Programme, Admissions, Frais, Agrément.

Les neuf intitulés de l’agrément sont conservés et présentés dans des cartes avec icônes : Électronique, Électrotechnique, Énergies renouvelables, Mathématiques et informatique, Génie industriel, Génie mécanique, Génie électrique, Informatique industrielle, Développement d’applications. Chaque carte propose une demande de renseignement par courriel dont l’objet identifie la spécialité et Lomé. Aucun message envoyé.

Niveau bac+3, domaine Sciences et technologies, mention Sciences de l’ingénieur. Les ouvertures de rentrée, programmes détaillés, conditions d’admission et frais restent à confirmer avec l’école. Aucun programme, tarif ou débouché spécifique n’est inventé. L’agrément PDF reste accessible et le renvoi vers la prépa cible bien la fiche Togo.

La photo provient de la salle de travaux pratiques du Bénin ; la légende et le texte alternatif indiquent qu’il s’agit d’une illustration. En-tête, footer et newsletter partagés conservés.

Implémentation : `scripts/esims-licence-page.mjs`, branchement dans `scripts/integrate-cpms.mjs`. La feuille `public/cpms/preparatory.css` sert maintenant aussi la classe `esims-licence-page`, avec des sélecteurs de même spécificité pour préserver les prépas. Navigation JavaScript existante réutilisée. Ancienne fonction licence retirée du fichier d’accueil.

Vérifications : import réussi (101 pages), build et TypeScript réussis (159 pages), 634 fichiers Educavo originaux intacts, 290 médias/documents référencés présents. Contrôles des neuf intitulés, objets de courriels, six ancres, présence du PDF et absence de renvois vers le dossier de candidature Bénin dans le corps de page.

Navigateur à 1280 × 900 et 390 × 844 : bannière lisible, navigation active, résumé fixe sur ordinateur et dans le flux sur mobile, cartes en deux colonnes puis empilées sur téléphone, détails dépliables, aucun débordement de page. Ancrage à 200 px sur ordinateur et 85 px sur mobile.

Captures : `esims-licences-togo-banniere.png`, `esims-licences-togo-specialites.png`, `esims-licences-togo-mobile.png`.
