# Cycle préparatoire — Togo

Version du 23 octobre 2026 : http://127.0.0.1:3003/cycle-preparatoire-togo.

Présentation commune à la fiche Bénin déjà réalisée : bannière en deux colonnes, palette ESIMS, drapeau, navigation par rubriques, contenu dans la grille Educavo et résumé pratique à droite. Les classes, cartes, boutons et typographies restent cohérents avec le site.

Six rubriques : Présentation, Le parcours, Après la prépa, Admissions, Frais, Agrément. Le parcours comporte trois repères : projet après le bac, cycle préparatoire bac+2, préparation de la poursuite d’études. La licence professionnelle est présentée comme une offre distincte.

Les informations propres à Lomé reprennent la fiche Togo précédente et l’agrément fourni : ESIMS-Togo, implantation de Lomé, cycle préparatoire bac+2 et licences professionnelles bac+3. L’agrément PDF est accessible depuis le résumé et la dernière rubrique. Les liens de renseignement préparent un courriel dont l’objet identifie la prépa de Lomé ; aucun courriel n’a été envoyé.

Le programme détaillé, les frais, les conditions et dates d’admission restent à obtenir auprès de l’école. Aucun coefficient, montant, série de bac, stage de quatre semaines, programme CP2i ou partenariat du Bénin n’est attribué au Togo. Les boutons du corps de page ne renvoient pas au dossier ou à la brochure historique de Cotonou. L’en-tête et le footer partagés restent ceux du site.

La photographie de matériel scientifique provient des archives du Bénin ; sa légende et son texte alternatif indiquent son usage illustratif. Elle ne présente pas un campus togolais.

Implémentation : `preparatoryTogoPage` dans `scripts/esims-preparatory-page.mjs`, branchement dans `scripts/integrate-cpms.mjs`. CSS partagé par les deux prépas via la classe `esims-preparatory-page` ; identité de page conservée. Ancienne fonction Togo à onglets remplacée. Navigation JavaScript existante réutilisée.

Vérifications : import terminé (101 pages), compilation et TypeScript réussis (159 pages), 634 fichiers Educavo originaux intacts, 290 médias/documents présents. Le premier build a signalé une recommandation de mise à jour de sécurité de Next.js 16.4.0 après compilation ; la relance a terminé avec le code 0. Aucune dépendance modifiée.

Contrôle navigateur à 1280 × 900 et 390 × 844 : aucune largeur de page excédentaire, bannière lisible, cartes empilées sur téléphone, détails programme/frais dépliables. Navigation fixe à 108 px sur ordinateur et à 0 px sur mobile ; ancres alignées à 200 et 85 px ; rubrique active mise à jour. Résumé fixe sur grand écran et dans le flux sur mobile. PDF présent et liens internes de rubriques résolus. Vérification de conservation des dix lignes du tableau et des trois atouts de la fiche Bénin.

Captures : `esims-prepa-togo-banniere.png`, `esims-prepa-togo-parcours.png`, `esims-prepa-togo-mobile.png`.
