# Qui sommes-nous — 14 octobre 2026

La navigation éditoriale remplace CPMS et son sous-menu Présentation/Partenaires par un accès direct à `/qui-sommes-nous`. Accueil reste également sans sous-menu. Les autres menus sont conservés.

La page reprend le modèle original `about2.html` : introduction avec photographie du CPMS, vidéo avec texte sur les deux années de préparation, chiffres fournis par le propriétaire, onglets Matières / JUNIA France / Maroc & Dakar, cartes des trois écoles et témoignages. Les couleurs, polices, grilles, espacements et carrousels du modèle sont conservés. Les raccourcis des cartes d'écoles mènent aux sites officiels, à la présentation, au cursus ou au contact, sans profils sociaux inventés.

Source : texte fourni par l'utilisateur et corps éditorial du contenu WordPress 159. Les treize paragraphes, les dix lignes de matières avec les coefficients des deux années, les trois liens de visite et les photos des trois écoles sont repris. Le fragment publicitaire parasite est supprimé et « professionnel le » est réparé en « professionnelle ». Les chiffres JUNIA restent explicitement ceux de l'ancien site.

Les anciens chemins `/presentation` et `/partenaires` redirigent vers cette page (ancre écoles pour partenaires). L'article historique 245 reste disponible depuis Histoire dans le pied de page.

Vérifications : assertions de reprise intégrale des paragraphes et coefficients lors de l'import ; compilation Next et TypeScript réussies ; 634 fichiers Educavo originaux inchangés ; clic du menu testé sur ordinateur et mobile ; trois onglets fonctionnels ; aucune image cassée ni débordement horizontal à 1280, 992 et 390 pixels ; redirection Présentation vérifiée. Les textes de marque restent lisibles dans l'en-tête fixe à fond blanc des pages intérieures.

Aperçu : `qui-sommes-nous.jpg`.

## Nouvelle présentation, demandée par l'utilisateur

L'utilisateur a ensuite autorisé une révision du design de cette page dans le thème Educavo. La page possède désormais une introduction claire sur fond léger, une grande photographie réelle du CPMS, une bande de chiffres bleue, une présentation du parcours avec lecteur vidéo en popup, un tableau des matières pleine largeur et trois sections illustrées distinctes pour les partenaires. Tous les paragraphes et coefficients restent contrôlés par les assertions d'import. Les chiffres historiques JUNIA sont accessibles dans un volet natif `details`.

L'en-tête, la newsletter et le pied de page reprennent ceux de l'accueil index3, avec les coordonnées CPMS et la palette bleue. Le style spécifique `public/cpms/about.css` est chargé seulement lorsque le corps comporte `cpms-about-page`. Les autres pages et les fichiers Educavo originaux restent intacts.

Compilation Next/TypeScript et contrôle des originaux réussis. Rendu vérifié à 1280, 992 et 390 pixels ; tableau lisible et aucune image cassée ni débordement horizontal. Liens d'ancre, ouverture des chiffres JUNIA et popup YouTube `YSag0j60gSQ` vérifiés. La page d'accueil ne charge pas les styles spécifiques.

Nouvel aperçu : `qui-sommes-nous-redesignee.png`.

## Composition Educavo validée — 15 octobre 2026

Après examen des modèles, l'utilisateur a validé : présentation native About Educavo d'about2, compteurs d'about2, vidéo et texte d'index3, tableau des matières harmonisé, puis les trois onglets natifs d'about2 pour JUNIA France / JUNIA Maroc / ECPI Dakar. L'en-tête, la newsletter et le pied de page restent ceux de l'accueil CPMS.

La grille et les styles spécifiques de la précédente proposition sont supprimés. Les blocs proviennent des DOM des templates conservés, avec leurs classes Educavo. Le montage photographique de la première section conserve les trois cadres du visuel original et y place les photos CPMS (jardin, salle de cours, travaux pratiques). La photo de bannière est assombrie pour préserver la lisibilité du titre blanc. Les seules règles spécifiques concernent le tableau, la couleur des onglets, les ancres et le remplacement du fond vidéo par une photo CPMS.

Tous les paragraphes et les dix lignes de coefficients sont vérifiés à l'import. Compilation Next/TypeScript et vérification des 634 fichiers Educavo originaux réussies. Trois onglets et popup YouTube vérifiés sur ordinateur ; onglets Maroc et ECPI vérifiés à 390 pixels ; tableau de 360 pixels, aucune image cassée ni débordement horizontal. Le menu Cursus n'a pas été modifié à la suite de la question explicative de l'utilisateur.

Aperçu actuel : `qui-sommes-nous-educavo-valide.png`.
