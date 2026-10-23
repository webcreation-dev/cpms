# Actualités et événements

Version du 23 octobre 2026 : http://127.0.0.1:3003/actualites et http://127.0.0.1:3003/evenements.

Références consultées : [actualités JUNIA](https://www.junia.com/nos-actualites/) et [agenda JUNIA](https://www.junia.com/agenda/). La mise en avant associe un titre de rubrique et un article photographique ; la navigation permet ensuite de choisir une catégorie. L’adaptation conserve les cartes, la grille et la barre latérale du modèle `blog-left.html` Educavo, les couleurs ESIMS et les boutons rectangulaires. Aucun texte, événement ou visuel JUNIA n’est repris.

Présentation :

- Première page Actualités : bannière bleu nuit, dernière publication à la une, puis cartes en deux colonnes.
- Filtres fixes Tout / Actualités / Événements, avec les nombres issus du corpus. Les catégories WordPress d’origine sont conservées ; certaines publications appartiennent à plusieurs catégories. Les nombres ne s’additionnent donc pas nécessairement au total.
- Événements : même gabarit, 24 publications accessibles sur trois pages, en remplacement des neuf cartes de l’ancien aperçu. Présentation en retours sur les temps forts, sans événements futurs inventés. Les dates affichées sont explicitement des dates de publication.
- Pagination complète : 30 publications sur quatre pages pour la rubrique générale. La publication à la une occupe une place dans la première page et n’est pas répétée dans sa grille.
- Catégories et archives : bandeau compact et résultats du filtre. Les 17 mois d’archives restent disponibles.
- Barre latérale conservée : recherche, Posts récents, Archives, Catégories, Méta. Sur téléphone, elle passe après les articles et la pagination.
- Articles détaillés : modèle `blog-post-left.html` et galeries conservés. Aucun changement au texte intégral ou aux images des billets.
- Menu, newsletter, footer et chargement partagés conservés.

Implémentation : `scripts/esims-news-page.mjs`, `public/cpms/news-hub.css`, branchement dans `scripts/cpms-news-pages.mjs` et `scripts/integrate-cpms.mjs`. Feuille de style limitée à la classe `esims-news-hub`. La route `/evenements` et ses nouvelles pages utilisent le même générateur ; alias `events-style1.html` préservé. Les routes et alias de blog, archives et catégories restent accessibles. Réalignement dans TemplateRuntime lorsqu’une catégorie s’ouvre directement sur `#news-list`, après activation du menu fixe Educavo.

Vérifications : import terminé (103 pages et 122 routes éditoriales), build et TypeScript réussis (161 pages), 634 fichiers originaux Educavo intacts, 281 médias/documents actuellement référencés présents. Comparaison de tous les identifiants sur les quatre pages Actualités et les trois pages Événements : aucune perte ni répétition entre pages. Assertions de conservation du texte intégral et des images de chaque billet toujours actives dans l’import.

Contrôle navigateur à 1280 × 900 et 390 × 844 : aucune largeur excédentaire, aucune image cassée observée, mise en avant lisible, cartes empilées sur téléphone, filtres actifs et fixes, ordre mobile corrigé explicitement pour placer les publications avant la barre latérale. Navigation entre les filtres testée, pagination page 2 testée, archives mars 2026 testées. Article sur les réseaux sociaux ouvert : cinq images de galerie et barre latérale présentes. Recherche « réseaux » depuis la barre latérale : trois résultats.

Captures : `esims-actualites-a-la-une.png`, `esims-actualites-grille.png`, `esims-actualites-mobile.png`.
