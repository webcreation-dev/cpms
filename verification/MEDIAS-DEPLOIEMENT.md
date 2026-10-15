# Médias du déploiement — 15 octobre 2026

Le générateur `scripts/integrate-cpms.mjs` écrit directement les recadrages en WebP (qualité 80 pour les photos, sans perte pour les logos et les intitulés de programmes). Le montage « Qui sommes-nous » conserve sa transparence et utilise une qualité de 90. Les dimensions des emplacements Educavo sont conservées.

Les deux PDF (brochure et candidature) et les cinq vidéos référencées sont ajoutés au dépôt. Les autres fichiers de l’archive WordPress locale restent exclus.

Contrôles effectués :

- `npm run content:import` : génération réussie, structure de l’accueil conservée.
- `npm run verify:media -- --tracked` : 300 médias/documents utilisés, présents et suivis dans Git ; aucun recadrage référencé en PNG ; 80,4 Mio au total.
- `npm run verify:template` : les 634 fichiers originaux Educavo sont intacts.
- `npm run build` : compilation, TypeScript et génération des pages réussis.

Avant un prochain push après une importation, relancer le contrôle `verify:media -- --tracked` après avoir ajouté les nouveaux médias sélectionnés à Git. L’importation lit les archives WordPress locales ; le déploiement utilise les fichiers générés déjà enregistrés dans le dépôt.
