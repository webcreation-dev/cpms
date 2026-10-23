# L’École — ESIMS

Version à revoir ensemble, 22 octobre 2026. Aperçu : http://127.0.0.1:3003/qui-sommes-nous.

La page reprend les composants Educavo : colonnes About et Bootstrap, cartes de partenaires et carrousel de témoignages déjà validés sur l’accueil, accordéons de faq.html. Après le retour utilisateur, le montage photo, les onglets partenaires et les deux témoignages latéraux sont remplacés. Références : présentation photo/texte de la page École JUNIA et grille des partenaires de la page Programme HEI JUNIA. Le menu, le chargement, la newsletter et le footer restent partagés avec l’accueil. Les couleurs sont celles de l’ESIMS.

Ordre du contenu :

1. Bannière de page avec la photo des étudiants à Cotonou.
2. Présentation de l’ESIMS, de ses deux pays et de la place du cycle préparatoire. Une grande photo des portes ouvertes à Cotonou remplace le montage, à côté du titre « Une école, plusieurs horizons » et d’un texte plus court.
3. Cotonou / Bénin et Lomé / Togo : parcours disponibles et reconnaissances distinguées ; lien vers l’agrément togolais fourni.
4. Pédagogie du cycle préparatoire au Bénin, avec photo de travaux pratiques et devise.
5. Quatre chiffres validés : 172, 163, 9 et 4, explicitement rattachés au bilan de la prépa au Bénin.
6. Partenaires : quatre cartes HEI, ISA, ISEN et ECPI Dakar, avec le logo du groupe JUNIA pour ses trois programmes et celui d’ECPI. Liens vers chaque partenaire. Encadré séparé sur la poursuite d’études, selon les conditions d’admission.
7. Quatre témoignages déjà vérifiés sur les archives WordPress : Merveille (promotion 2025), Marie-Noëlle (promotion 2024), Ricardo et Josée-Marie. Le même carrousel que l’accueil : trois cartes sur ordinateur, une sur mobile, flèches, clavier et compteur ; liens vers les textes complets. Son initialisation est désormais partagée entre les deux pages.
8. Trois questions fréquentes et accès au contact.
9. Tableau historique des dix matières et coefficients du cycle préparatoire au Bénin, consultable dans un bloc dépliable. Ancre `#matieres` conservée.

Les modalités historiques du Bénin ne sont pas présentées comme celles du Togo. Les photos des étudiants et des équipements sont identifiées comme celles du Bénin. Les données détaillées sur les licences et la prépa togolaise restent dans leurs fiches respectives. Aucun texte de direction ni donnée institutionnelle nouvelle n’est inventé.

Implémentation : `scripts/esims-school-page.mjs`, appelé par `scripts/integrate-cpms.mjs`. Adaptations visuelles limitées à `public/cpms/esims.css`. Le générateur conserve les dix lignes et leurs valeurs au moyen d’une comparaison avec le tableau source.

Vérifications : import réussi (101 pages, 120 routes, 54 contenus), TypeScript et build réussis (159 pages générées), 634 fichiers Educavo originaux intacts, 290 médias/documents présents. Contrôles navigateur sur ordinateur et à 390 px : aucun débordement horizontal ni image cassée ; carrousel de témoignages au clic et au clavier, compteur et fin de défilement corrects. FAQ dépliable, tableau des dix matières et menu mobile vérifiés sur la première version et conservés.

Captures actuelles : `esims-ecole-presentation-v2.png`, `esims-ecole-partenaires-v2.png` et `esims-ecole-temoignages-v2.png`. Les captures sans suffixe v2 décrivent la première version.
