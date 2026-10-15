# Cursus — reprise des deux sources, 15 octobre 2026

Sources : contenus WordPress 85 (Cycle préparatoire) et 81 (Cycle ingénieur), comparés aux deux pages publiques fournies par l'utilisateur. Reprise des textes et médias locaux, sans migration des éléments publicitaires étrangers au contenu.

Les deux pages conservent le modèle Educavo `course-single.html`, son système d'onglets, sa colonne vidéo, ses boutons et ses espacements. L'en-tête, la newsletter et le pied de page sont ceux de l'accueil CPMS. Les styles spécifiques servent à la palette bleue, aux libellés français et aux tableaux financiers défilants.

- Cycle préparatoire : 20 paragraphes, 11 éléments de listes, 4 illustrations avec légendes, 3 tableaux financiers comportant respectivement 6, 1 et 1 lignes de données. Les onglets sont Présentation, Pédagogie, Stages et projets, Ressources, Frais et tenue.
- Cycle ingénieur : 5 paragraphes de la source, organisés dans Présentation, Campus et métiers, Enseignements. La photographie JUNIA France provient de la page de présentation de l'ancien site. Liens vers les partenaires et les domaines conservés.

La mention « en construction » de l'intranet est conservée. Les frais et échéances sont reproduits et identifiés comme ceux de l'ancien site ; le secrétariat confirme le barème applicable. Les textes ne déclenchent aucun accès à un intranet ni paiement.

Assertions d'import : présence de chaque paragraphe, élément de liste et légende ; comparaison de toutes les cellules des lignes de données des trois tableaux ; présence de chaque image de la source préparatoire. Compilation Next/TypeScript réussie, 634 fichiers Educavo originaux intacts.

Vérifications dans le navigateur : onglets des deux pages, ressources étudiants/parents, frais, liens vers les domaines, aucun média cassé. À 390 pixels : tableau de 620 pixels dans une région de 320 pixels, défilement horizontal réel vérifié (300 pixels), sans débordement du document ; onglet Campus et métiers fonctionnel. Les ancres `#stages`, `#projets` et `#frais` ouvrent automatiquement l'onglet contenant la cible ; l'ancre frais a été vérifiée à 160 pixels du haut sur ordinateur et mobile, après passage de l'en-tête en position fixe.

Aperçus : `cycle-preparatoire-frais.png`, `cycle-ingenieur-complet.png`.
