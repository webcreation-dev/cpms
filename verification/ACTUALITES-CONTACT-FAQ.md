# Vérifications du 15 octobre 2026

- Actualités : modèle `blog-left.html`, barre latérale gauche avec Posts récents, Archives, Catégories et Méta.
- 30 actualités sur quatre pages, sans doublons. Dernière page : six billets.
- 27 listes et filtres générés ; liens de widgets et pagination contrôlés.
- 46 billets : modèle `blog-post-left.html`, textes intégraux et toutes les images du corps conservés par comparaison avec les données importées.
- Navigation : Accueil, Qui sommes-nous, Actualités et Contact sans sous-menu. Cursus conserve les trois entrées validées.
- Contact : modèle `contact4.html`, coordonnées CPMS, carte de Vèdoko, formulaire avec indication explicite que l’envoi reste indisponible.
- FAQ : modèle `faq.html`, 12 questions, quatre thèmes ; lien dans les footers des pages éditoriales. Ouverture d’un accordéon testée dans le navigateur.
- Erreur : modèle `error.html` adapté, recherche et retour à l’accueil ; liens sans destination orientés vers `/erreur`. Recherche, vidéos, galeries, menus et onglets restent des commandes interactives.
- Navigateur : clic sur un post récent, filtre mensuel, catégorie, pagination, FAQ du footer et icône boutique vérifiés. Contact sans sous-menu confirmé dans le DOM rendu.
- Aucun débordement horizontal sur Contact, Actualités et Erreur à 390 px ; Contact et FAQ également vérifiés à 1280 px.
- Compilation Next.js réussie. Les 634 fichiers originaux du template sont intacts.

Captures : `actualites-blog-left.png`, `article-blog-post-left.png`, `contact-sans-dropdown.png`.
