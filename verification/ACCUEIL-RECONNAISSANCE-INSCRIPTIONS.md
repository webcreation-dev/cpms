# Reconnaissance et inscriptions sur l’accueil

Le bloc de texte à droite de la vidéo affiche les quatre valeurs et le texte
d’autorisation fourni par l’utilisateur, y compris le numéro d’arrêté de 2021.
Le bloc « Notre engagement », à gauche des témoignages, devient le résumé des
inscriptions 2026–2027 : Terminales C, D et E et email. Sous ce texte, deux
boutons côte à côte ouvrent la procédure et la brochure PDF. Le bouton de
brochure est jaune avec un texte noir, à la demande de l’utilisateur.

La page /admissions reprend les six pièces, le formulaire de candidature, le
dépôt papier à partir du 6 avril 2026 avec les frais de dossier, l’annonce des
dates des tests, les deux téléphones et la brochure. Le titre de campagne est
neutre ; le texte indique que la date limite retrouvée dans l’archive était le
11 septembre 2026 et que le secrétariat confirme le calendrier actuel.

Les textes sont centralisés dans scripts/cpms-home-content.mjs. L’import utilise
les blocs natifs d’index3.html. Aucun CSS ou fichier original Educavo n’est
modifié. Le contrôle de structure de l’accueil autorise uniquement le lien
email, le bouton de brochure supplémentaire et la classe qui aligne les deux
boutons. Tous les autres éléments, classes et styles inline sont conservés.

Vérifications : import et compilation Next/TypeScript réussis ; 634 fichiers
originaux intacts ; textes de reconnaissance exacts par rapport au module ;
six pièces vérifiées une à une ; dépôt papier et tests présents ; deux fichiers
PDF valides. Le bouton de l’accueil a été utilisé pour ouvrir /admissions et le
lien de brochure a ouvert directement /cpms/originals/2023/12/flyer.pdf.

Contrôle sur ordinateur à 1280 px et téléphone à 390 px : aucun débordement
horizontal. Captures : accueil-reconnaissance.jpg et accueil-inscriptions.jpg.

La rubrique Domaines conserve son emplacement précédent ; aucune nouvelle
section de domaines n’a été ajoutée sur l’accueil.

La vidéo de présentation utilise désormais le Short YouTube fourni par
l’utilisateur (YSag0j60gSQ). Le lien est normalisé au format watch?v= pour le
lecteur Magnific Popup original. Le clic ouvre youtube.com/embed/YSag0j60gSQ ;
le lecteur affiche « Bienvenue au CPMS ». Capture : video-youtube.jpg.

Le premier témoignage (Merveille TOGBE) affiche « Promotion 2025 » sous le nom,
avec un alignement à gauche identique et 4 px d’espacement. Contrôles à 1280 et
390 px : texte placé sous le nom, aucun débordement horizontal. Capture :
temoignage-promotion-2025.jpg. Import et compilation réussis après ces ajouts.

La dernière tentative d’affichage du lecteur directement dans la colonne de
droite a été annulée à la demande de l’utilisateur. La présentation conserve
le bouton vidéo à gauche, l’ouverture du lecteur en fenêtre, et le texte de
reconnaissance à droite.

Marie-Noëlle DANDJINOU affiche désormais « Promotion 2024 », aligné sous son
nom. Accueil est un lien direct vers / : le sous-menu, ses entrées et les
indicateurs de menu déroulant sont retirés. Les autres menus conservent leurs
sous-menus.

Les quatre cartes sous le bandeau affichent, dans l’ordre : Travail, Piété,
Excellence et Discipline. Les images, icônes, classes et disposition sont
conservées ; leurs liens ouvrent la présentation du CPMS.

Les trois compteurs du bloc À propos utilisent les chiffres fournis par
l’utilisateur le 14 octobre 2026 : 172 « Ayant voyagé », 163 « Ayant formé » et
9 « Cursus béninois ». Les anciens suffixes k+ et % ne s’affichent plus sur ces
trois compteurs ; l’animation native du template reste active. Les compteurs
d’autres pages qui n’ont pas reçu de données restent marqués à confirmer.

Le premier compteur affiche ensuite « + 172 » à la demande de l’utilisateur.
Le préfixe est séparé de la valeur numérique pour conserver l’animation. Le
lien « Tous les événements » est mis en évidence en bleu dès l’affichage et
s’illumine au survol, au focus clavier et lors de l’activation.
