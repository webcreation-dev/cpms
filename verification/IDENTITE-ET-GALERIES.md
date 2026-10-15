# Identité CPMS et galeries — 15 octobre 2026

- 97 pages éditoriales utilisent le même en-tête, footer, bloc newsletter et chargement que l’accueil. L’onglet actif dépend de la page consultée.
- Le chargement utilise partout le logo CPMS original. Il conserve l’animation Educavo, sans attente artificielle.
- Palette principale `#0066B3`, secondaire `#FFCF03`. Les styles du thème sont dérivés dans `public/cpms/theme` ; les fichiers de référence restent intacts. Les URL des images CSS sont ancrées à la racine.
- Le menu fixe garde ses liens blancs et l’onglet actif jaune. Les boutons jaunes utilisent un texte noir.
- 17 articles comportent des photos regroupées en 19 grilles Educavo, soit 153 photos. Les 46 billets conservent leurs textes, leurs légendes et toutes leurs images dans l’ordre d’origine.
- Article 40820 : grille de cinq photos ; agrandissement, navigation 1/5 → 2/5 et fermeture par Échap vérifiés. Le lecteur est limité aux photos du billet.
- Contrôle à 1280 px et 390 px : aucune largeur excessive sur l’article ; grille en une colonne sur mobile, avec ouverture des images originales en grand.
- Couleurs calculées dans le navigateur : bleu `rgb(0, 102, 179)`, jaune `rgb(255, 207, 3)`. Footer et logo de chargement vérifiés dans toutes les pages générées.
- Compilation Next.js réussie. Vérification des 634 fichiers originaux Educavo réussie.

Captures : `article-galerie-cpms.png` et `footer-cpms-uniforme.png`.
