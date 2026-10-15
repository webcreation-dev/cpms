# Correction de l’en-tête — 14 octobre 2026

À la demande de l’utilisateur, l’en-tête des pages CPMS affiche le sceau officiel
avec « CPMS » et « Cycle Préparatoire Marie Stella » à côté. Sur ordinateur,
l’identité, les six liens et les icônes de recherche, boutique et menu occupent
une seule rangée. Le menu « Rubriques » a été retiré. Sur téléphone, le bouton hamburger ouvre les six
rubriques.

Le bloc identité affiche sous le logo une icône téléphone, « TÉLÉPHONE » et
les deux liens d’appel : +229 01 62 72 10 72 / +229 01 49 14 12 77. Les liens
principaux ont des marges et espacements internes uniformes, et la place restante
est répartie également entre eux : écarts mesurés de 48,62 px à 1280 px, de
29,90 px sur l’accueil à 992 px et de 25,90 px sur Présentation à 992 px
(arrondis au centième, écart maximal de 0,01 px).

La correction utilise `public/cpms/header.css` et le rendu des pages éditoriales
dans `src/lib/educavo.tsx`. Les fichiers HTML, CSS et médias Educavo originaux
restent intacts. Le contrôle historique de structure porte sur les sources
générées ; l’ajout du texte et l’alignement de l’en-tête sont une adaptation
explicitement demandée après ce contrôle.

Validation : compilation Next/TypeScript réussie ; vérification des 634 fichiers
originaux réussie ; accueil à 1280 et 992 px, Présentation à 992 px, accueil mobile
à 390 px. Aucun débordement horizontal constaté. Les six liens principaux
ont la même hauteur sur ordinateur ; le menu mobile s’ouvre et se referme.

Captures : `header-desktop.jpg` et `header-mobile.jpg`.

Cette vérification concerne l’en-tête. Elle ne certifie pas la reprise exhaustive
des contenus de l’ancien WordPress.
