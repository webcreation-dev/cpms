# CPMS — reproduction Educavo dans Next.js

Cette première version reproduit **index3.html** et les pages du catalogue Educavo avec leurs contenus de démonstration. L'intégration des textes et médias CPMS vient ensuite.

## Démarrer

```sh
npm ci
npm run dev
```

Ouvrir `http://127.0.0.1:3003/`. L'accueil utilise `index3.html`. Son alias `/index3.html` est également disponible. Les 51 modèles sont servis par Next.js aux chemins d'origine, par exemple `/about2.html`, `/course-single.html`, `/blog.html` ou `/contact.html`.

```sh
npm run verify:template
npm run build
npm start
```

## Préserver le design

- `src/templates/educavo/` contient les 51 fichiers HTML copiés à l'identique.
- `public/` contient les CSS, JavaScript, photos, icônes et polices copiés à l'identique.
- `template-manifest.json` conserve leurs empreintes SHA-256 et les alias des polices issus du miroir.
- Aucun reset CSS, Tailwind, nouvelle police ou nouvelle règle graphique n'est ajouté.
- Le serveur transforme le HTML local de confiance en éléments React sans conteneur graphique supplémentaire.
- Chaque modèle conserve sa classe de body et l'ordre de ses feuilles de style.
- Les URL locales deviennent absolues. Les liens d'accueil `index.html` reviennent à `/`, l'accueil index3 retenu.
- Les plugins originaux sont chargés séquentiellement après hydratation, sans modification de leurs fichiers.
- Les liens d'onglets/accordéons du miroir reçoivent un `data-target` non visuel pour retrouver le comportement Bootstrap attendu.
- Les liens restent des liens de document classiques pour que chaque navigation initialise les plugins dans un DOM neuf. Ne pas les remplacer par `next/link` sans ajouter un cycle complet de nettoyage et réinitialisation des plugins.

## Organisation

| Fichier | Rôle |
|---|---|
| `src/app/[[...path]]/layout.tsx` | Document Next, classe du body et styles propres à chaque modèle |
| `src/app/[[...path]]/page.tsx` | Accueil et pages du catalogue, générés depuis les modèles |
| `src/lib/educavo.tsx` | Lecture des modèles et adaptation des chemins |
| `src/components/TemplateRuntime.tsx` | Chargement ordonné des scripts après hydratation |
| `src/app/assets/fonts/[font]/route.ts` | Service des polices dont le nom contient un `?` encodé |
| `scripts/sync-template.mjs` | Copie en lecture seule depuis le miroir original |
| `scripts/verify-template.mjs` | Contrôle de fidélité des fichiers copiés et des originaux |
| `verification/` | Rapport et captures de contrôle du portage |

`npm run sync:template` recopie les sources depuis le dossier voisin `keenitsolutions.com/products/html/educavo`. Cette commande est réservée à la reproduction du template et écrase les copies correspondantes ; ne pas l'utiliser pour écraser un futur travail éditorial.

## Fonctions de démonstration

Les menus, carrousels, animations, recherche modale, panneau latéral, onglets et popups utilisent les scripts Educavo. La recherche n'est pas encore branchée aux contenus CPMS. La vidéo est encore celle du template.

Les formulaires Contact ne transmettent pas de données au `mailer.php` de la démonstration Educavo : une réponse locale explique que le service n'est pas encore connecté, dans la zone de message déjà présente dans le template. La newsletter ne souscrit personne. Boutique, comptes et candidature sont des écrans du catalogue, sans backend métier.

Les deux imports Google Fonts du CSS original sont conservés. Leur disponibilité dépend du réseau, comme dans le template d'origine.

Cette version ne contient pas encore de base de données, de migration WordPress ni d'administration. Les contenus historiques restent dans `../docs/analyse/`, et les sources originales n'ont pas été modifiées.

## Références techniques

- Installation Next.js : https://nextjs.org/docs/app/getting-started/installation
- Root layout sous segment dynamique : https://nextjs.org/docs/app/api-reference/file-conventions/layout
- Routes optionnelles : https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes

Le workflow local de préparation et d'aperçu suit le skill Sites. Aucun Site hébergé n'est créé et aucune publication externe n'est effectuée dans cette étape.
# cpms
