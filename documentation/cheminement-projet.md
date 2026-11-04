# Cheminement du projet

Ce document présente l'évolution réelle du projet **ECHOES: Fragments of Reality**.
Il est maintenu à partir des fonctionnalités présentes dans le dépôt et des commits
significatifs de l'historique Git. La référence narrative et fonctionnelle principale
reste [Info-fr.txt](./Info-fr.txt).

## Organisation actuelle du code

- Les SVG sont classés par usage dans `docs/assets/svg/` : `accueil/`,
  `animations-depart/`, `cles/`, `connexion/`, `ia/`, `identite/` et `motifs/`.
- Les feuilles CSS sont regroupées dans `docs/css/` par rôle : `base/`,
  `bosses/`, `composants/`, `niveaux/` et `pages/`.
- Les contrôleurs des puzzles et niveaux sont dans `docs/js/niveaux/`, les trois
  combats dans `docs/js/bosses/`, et les services partagés restent dans `docs/js/`.
- Les animations micro et premium partagent maintenant `docs/js/ui-effects.js` et
  `docs/css/composants/ui-effects.css`. Les surcharges DEV MODE sont regroupées
  dans `docs/css/composants/dev-mode.css`.
- Les contrôles de sauvegarde manuelle ont été retirés des pages. La sauvegarde
  automatique de la progression, des réussites et des récompenses est conservée.

## État du projet — 02/11/2026

**Campagne active :** 30 niveaux répartis en six parties de cinq niveaux (1–5, 6–10, 11–15, 16–20, 21–25 et 26–30). Les boss 01, 02 et 03 suivent respectivement les niveaux 10, 20 et 30.

Les niveaux bonus 31 à 60 ont été supprimés : la campagne se limite aux niveaux 1 à 30.

### Travail réalisé aujourd'hui

- **Accueil et performances :** visuel neural SVG plein écran, panneau de lecture de l'IA repositionné pour les écrans étroits et traductions FR/EN. Les effets communs ont été regroupés dans `ui-effects.js` et `ui-effects.css` ; des anciens scripts ont été retirés et le redimensionnement du canvas a été ajusté.
- **Sauvegarde :** boutons « Save » et code JavaScript associé supprimés des pages concernées ; la progression continue d'être sauvegardée automatiquement.
- **Niveaux bonus :** niveaux 31 à 60 supprimés (pages, scripts et feuilles CSS).
- **Exemples visuels :** exemples des niveaux 1 à 30 réalignés sur les mécaniques des puzzles, avec grilles d'exemple adaptées.
- **CSS :** un fichier par partie (partie-N_niveau-a_à_b.css) en plus de 
iveaux-communs.css.
- **Cache et références :** versions des scripts et feuilles CSS harmonisées dans les pages concernées.

### Commits Git du 02/11/2026

| Heure | Commit | Contenu |
|---|---|---|
| 09:33 | `67d1a69` | Ajout des pages « En construction » pour les bonus 50 à 60. |
| 09:41 | `b4543da` | Mise à jour des scripts de la partie 2 et de leurs références HTML. |
| 09:45 | `62049a2` | Harmonisation des versions JavaScript et des références HTML. |
| 09:54 | `00a21b6` | Mise à jour de `level-guard.js` et de ses références dans les pages. |
| 10:02 | `4c8f91e` | Amélioration des visuels de l'accueil et des traductions. |
| 10:07 | `916e35c` | Correction des références de scripts dans `index.html`. |
| 10:12 | `186f864` | Suppression des boutons de sauvegarde manuelle et des fonctions associées. |
| 10:21 | `5e7f026` | Ajout des labyrinthes procéduraux 32–40 et de l'éveil du fragment bonus. |
| 10:25 | `bbb613f` | Ajout du visuel neural plein écran et du panneau de lecture de l'IA sur l'accueil. |
| 10:31 | `45d9bd0` | Correction du positionnement responsive du panneau IA de l'accueil. |
| 10:31 | `da99a4f` | Harmonisation des versions des scripts dans les pages HTML. |
| 10:38 | `ef00d30` | Mise à jour des versions CSS/JS de l'accueil et des traductions. |
| 11:02 | `b1498a7` | Regroupement des micro-animations et effets premium ; suppression des anciens scripts et ajustement du canvas et du DEV MODE. |
| 11:22 | `bfb6bd8` | Mise à jour de `level-guard.js`, des exemples visuels et de leurs styles. |
| 11:32 | `53177ab` | Ajout des styles et animations des bonus 41–50 et 51–60. |
| 11:32 | `d0e8ce1` | Ajustement des styles/scripts bonus 45–60 et des défis/traductions de `level-guard.js`. |
| 11:35 | `988d209` | Nommage CSS aligné sur la portée réelle (`niveaux-communs`, `niveaux-11-20`, `niveaux-21-30`, bonus 31–40) ; fusion des styles bonus 41–60 et suppression des feuilles redondantes. |
| 11:35 | `f7784b9` | Mise à jour des liens vers ces feuilles dans les pages concernées, notamment niveaux 24–30 et bonus 31–60 ; README actualisé. |

### Points à revalider

- Parcours complet des six parties et des trois boss sur ordinateur et mobile.
- Correspondance des traductions FR/EN et des exemples visuels sur toutes les pages de puzzle.
- Parcours et responsive des bonus 31–40 ; création des puzzles 41–60.
- Déploiement GitHub Pages : liens, ressources et casse des chemins.
- Protection du DEV MODE : le site étant statique, le contrôle exécuté côté navigateur ne constitue pas une protection de sécurité.

### Repère historique — 16/10/2026

Cette journée portait sur l'habillage du hub, de l'accueil et du DEV MODE, ainsi que sur la connexion et les SVG. Les tâches ci-dessous sont les vérifications notées à cette date ; leur état actuel n'est pas présumé.

| Commit | Contenu |
|---|---|
| `c180c65` | Polissage global de l'interface, DEV MODE et page de connexion. |
| `6aa5626` | Fond SVG `login-fragments.svg` et styles de connexion. |
| `bcc9b65` | Nouveau fond et nouveaux boutons de connexion. |
| `af27038` | Vérification par courriel pour le DEV MODE et configuration EmailJS. |
| `3b3a8e2` | Amélioration du DEV MODE et des connexions lentes. |
| `a6cd1d6` | Refonte de l'accueil et suppression du script d'interlude. |
| `000f4c9` | Curseur et barres de défilement personnalisés. |
| `1871a19` | Nettoyage des styles redondants. |
| `b650597` | Hub de sélection des niveaux et panneau des clés. |

- Vérifier le rendu du bouton « Continuer » de la page de connexion.
- Tester l'envoi réel des codes EmailJS et leur affichage sur mobile.
- Contrôler les boutons à coins coupés sur l'accueil, le hub et les boss.
- Valider les parcours, les traductions et les liens sur mobile et GitHub Pages.

### Points d'attention

- La clé publique EmailJS est visible côté client (comportement normal) ; restreindre le domaine autorisé dans le compte EmailJS.
## Présentation fonctionnelle

- **Projet :** ECHOES: Fragments of Reality
- **Type :** expérience narrative et jeu de puzzles web statique
- **Déploiement visé :** GitHub Pages
- **Version de travail :** bêta v4
- **Jalon actuel :** campagne principale de 30 niveaux en six parties de cinq niveaux ; trois boss après les niveaux 10, 20 et 30
- **Fondations disponibles :** accueil, connexion, introduction interactive, sauvegarde par compte,
  mode développeur, navigation partagée et responsive multi-écrans

## Fonctionnalités livrées

### Accueil, connexion et introduction

- Accueil cyberpunk avec sélection FR/EN, favicon et effets visuels.
- Création de compte, connexion et sauvegarde locale par utilisateur.
- Introduction narrative ECHO / Voyageur avec dialogue machine à écrire.
- Spectre audio canvas, transitions, footer et messages système.
- Mission structurée autour de six clés et six fragments de mémoire :
  Origine, Résonance, Souvenir, Trace, Conscience et Silence.

### Progression et navigation

- Progression séparée par compte dans `localStorage`.
- Points verts de navigation liés au compte actif.
- Sauvegarde automatique du niveau courant.
- Les pages de puzzle ne proposent plus de bouton « Save » ; l'enregistrement reste automatique.
- Reprise de la dernière progression sauvegardée.
- Nouvelle partie avec effacement de la progression du compte.
- Niveaux terminés rejouables sans supprimer les points verts.
- Navigation partagée, boutons retour et liens vers les secteurs suivants.
- Mode développeur pour faciliter les tests et la navigation locale ; son bouton et son menu restent roses sur toutes les pages ; seuls les numéros de niveaux 11 à 20 et le sélecteur « PART 2 » du navigateur passent au bleu électrique ; sur PC, le bouton est à gauche de la fenêtre avec une marge de 28 à 72 px.

### Responsive et qualité d'affichage

- Responsive centralisé dans `docs/css/base/responsive.css`.
- Adaptation pour téléphone, tablette et ordinateur.
- Interfaces tactiles sans dépendance obligatoire au survol.
- Détection des petites fenêtres PC avec pointeur fin.
- Protection contre les débordements de texte.
- Corrections des chemins sensibles à la casse pour GitHub Pages : dossiers docs/ et documentation/ en minuscules dans Git (GitHub Pages distingue la casse).
- Audit des références locales réalisé : `NO_MISSING_LOCAL_REFERENCES`.

## Puzzles et niveaux

### Niveaux 1 à 10 — Parties 1 et 2

- **Niveau 1 — La suite impossible :** trois suites numériques de difficulté croissante.
- **Niveau 2 — Le labyrinthe des débris :** navigation sur une grille au clavier ou avec
  les commandes directionnelles.
- **Niveau 3 — Le chiffre d'ECHO :** décryptage de trois messages par décalage alphabétique.
- **Niveau 4 — Le cœur fracturé :** taquin 3 × 3 généré par déplacements légaux.
- **Niveau 5 — Les archives effacées :** jeu de mémoire avec huit paires de glyphes.
- **Niveau 6 — Le code du gardien :** déduction d'un code de quatre couleurs en huit essais.
- **Niveau 7 — La grille silencieuse :** nonogramme 5 × 5 à résoudre avec ses indices.
- **Niveau 8 — Le corridor laser :** orientation de miroirs pour atteindre un récepteur.
- **Niveau 9 — Les tours du temps :** transfert de quatre disques selon les règles de Hanoï.
- **Niveau 10 — La matrice d'ECHO :** Sudoku 4 × 4 avant le combat de boss.

Les dix pages partagent le contrôleur `docs/js/niveaux/partie-1-puzzles.js` et les styles
`docs/css/niveaux/niveaux-communs.css`. La progression et les niveaux déjà terminés restent
compatibles avec le système de sauvegarde existant.

### Niveaux 11 à 20 — Parties 3 et 4

- Niveau 11 : alignement de plusieurs anneaux de résonance.
- Niveau 12 : mémorisation puis répétition de séquences lumineuses croisées.
- Niveau 13 : puzzle coulissant pour reconstruire un motif fractal.
- Niveau 14 : orientation de miroirs pour guider un faisceau jusqu'à son récepteur.
- Niveau 15 : puzzle de routage géant sur une grille 14 × 14 pour relier vingt paires de
  balises (40 cubes) sans croiser les flux, sans obligation de remplir toute la grille.
  Chaque paire a une couleur très contrastée (20 teintes) et une lettre (initiale du nom
  anglais de la couleur) affichée sur ses deux balises. La disposition est générée
  aléatoirement à chaque chargement et réinitialisation (chemin hamiltonien aléatoire
  découpé en vingt routes, balises éloignées d'au moins 5 cases et réparties dans les
  16 blocs de la grille) : bien plus de 100 configurations, toutes résolubles. Un tracé peut
  passer par-dessus un autre flux (celui-ci est alors effacé et la case prend la nouvelle
  couleur) ; chaque paire reliée déclenche une vague néon vert cube par cube.
- Niveau 16 : cadenas des symboles, avec quatre équations par série et quatre chiffres à déduire.
- Niveau 17 : balance du vide (répartir des masses sur deux plateaux pour égaliser les poids, 3 manches).
- Niveau 18 : tour des échos (tours de Hanoï à 3, 4 puis 5 disques).
- Niveau 19 : mots mêlés codés : retrouver les mots, relever les lettres partagées,
  puis saisir le code numérique caché.
- Niveau 20 : réseau logique en trois manches, où chaque impulsion inverse une cellule
  et ses voisines directes.
- Les puzzles des niveaux 16 et 20 ont été échangés : le cadenas est au niveau 16 et
  le réseau dormant au niveau 20. Le niveau 20 existait déjà ; ses mécaniques ont été
  réaffectées plutôt que dupliquées.

### Boss — `boss-02.html`

- Combat placé après le niveau 20 et avant l'entrée dans la partie 5.
- Arène tactique 5 × 5, déplacements orthogonaux, murs et lignes de frappe télégraphiées.
- Six ancres à stabiliser en trois phases, huit unités de cohérence et deux boucliers.
- Les ancres stabilisées sont indiquées par un rond vert foncé dans le compteur de
  cohérence, plutôt que par l'indicateur orange.
- Victoire débloquant la Clé 02 et le niveau 21.

### Boss — `boss-03.html`

- Combat placé après le niveau 30, à la fin de la partie 6.
- Page, contrôleur et styles dédiés ; la victoire complète la dernière étape de la campagne principale.

### Boss — `boss-01.html`

- Boss placé après le niveau 10, à la fin de la partie 2.
- Nouvelle direction visuelle : gardien spectral, cœur lumineux et orbites de résonance cyan/violettes.
- Page située dans `docs/html/partie-2_niveau-6_à_10/boss-01.html` ; le lien du niveau 10,
  le menu développeur et l'ambiance visuelle utilisent ce nom.
- Trois stages accessibles : trouver trois sceaux correspondants, répéter une mélodie de trois symboles et toucher le noyau pendant deux halos verts.
- Difficulté visée : `1/6`, avec six unités d'énergie et une reprise par réinitialisation.
- Contrôleur et styles isolés dans `docs/js/bosses/boss-01.js` et `docs/css/bosses/boss-01.css`.
- La victoire enregistre `resonance-1` et présente la réunion des trois fragments
  dans une fenêtre de récompense. « Continuer » ouvre directement le niveau 11 ;
  aucune page cinématique Clé 01 séparée n'est conservée.

## Architecture technique

- Le favicon commun est `docs/assets/svg/identite/echoes-favicon.svg` et est référencé par
  toutes les pages HTML du site, y compris `404.html`.
- Les scripts des puzzles sont regroupés par lots dans `docs/js/niveaux/` ; les labyrinthes
  procéduraux 32–40 sont partagés par `partie-4_niveaux-proceduraux.js`.
- Les styles de `docs/css/niveaux/` sont nommés selon leur portée :
  `niveaux-communs.css`, un fichier par partie (`partie-1_niveau-1_à_5.css` … `partie-6_niveau-26_à_30.css`),
  
iveaux-communs.css et un fichier par partie (partie-1_niveau-1_à_5.css … partie-6_niveau-26_à_30.css).
- Les anciennes feuilles de redesign ont été fusionnées dans la feuille commune.

- Les effets d'interface partagés utilisent `docs/js/ui-effects.js` et
  `docs/css/composants/ui-effects.css`.
- `level-guard.js` fournit l'accès aux niveaux, la progression et les exemples visuels.
- `save-system.js` gère les comptes et la progression persistante.
- `dev-mode.js` fournit les outils de test et de navigation.
- `ui-effects.js` (qui a absorbé l'ancien `ambient-background.js` puis `ui-fx.js`) gère aussi l'ambiance d'arrière-plan, le panneau des clés et le curseur premium (accueil, hub, introduction, connexion).
- Les pages restent compatibles avec un déploiement statique GitHub Pages.

## Validation réalisée

- Vérification navigateur des exemples des niveaux 1 à 30 : aucun exemple manquant ni erreur
  JavaScript, avec contrôle des grilles des niveaux 4 et 11.
- Vérification navigateur de neuf pages représentatives : feuilles CSS attendues chargées
  pour les six parties, sans erreur JavaScript.
- Vérification automatisée des chemins CSS locaux dans les 67 pages HTML de `docs/html/` :
  aucun fichier référencé manquant.
- Vérifications antérieures : parcours du boss 01 et test du boss 02 tactique, traductions
  FR/EN et contrôles responsive ciblés.
- `git diff --check` passe sur les changements documentaires.

## Travail en cours

- Valider complètement les parcours des six parties et des trois boss sur desktop et mobile.


- Relier complètement les six clés aux verrous et fragments narratifs.
- Effectuer une validation complète des parcours sur GitHub Pages.

## Journal des commits Git significatifs

### 30/09/2026 — Initialisation et fondations

- `17a3e7f` — Initialisation du projet ECHOES.
- `5625be4` — Ajout du responsive CSS et réorganisation du dossier `docs`.
- `d2f33f6` — Ajout de l'introduction interactive d'ECHOES.
- `560f4a8` — Mise en place du système de connexion et de sauvegarde.
- `792b545` — Amélioration du responsive, des effets visuels et ajout du favicon.
- `6dbd0ea` — Création de la structure HTML, CSS et JavaScript des parties du jeu.

### 01/10/2026 — Puzzles, progression et centralisation

- `3e4cb41` — Ajout des mécaniques du niveau 5.
- `0e3609e` — Ajout des mécaniques des niveaux 6 à 10 et du système de sauvegarde.
- `3d20b90` — Auto-sauvegarde et progression par utilisateur.
- `56e253d` — Ajout des animations et messages système des niveaux 2 à 7.
- `0064a39` — Ajout des niveaux 11 à 14 et de leurs premières mécaniques.
- `c69e70a` — Correction des chemins sensibles à la casse pour GitHub Pages.

### 02/10/2026 — Performance et niveau 12

- `d3d0553` — Passage du niveau 12 à six cartes de classement.
- `daee6c3` — Amélioration du niveau 12, du reset et de l'interface.
- `ced5f49` — Amélioration des performances et de la visibilité du spectre audio.
- `fbdcd7a` — Optimisation responsive et prise en compte de la réduction des mouvements.

### 03/10/2026 — Bêta et expérience utilisateur

- `4b4cea8` — Déploiement de la version bêta v1.
- `60b7b42` — Ajustements responsive de l'animation de progression.
- `77b538d` — Amélioration responsive de la page d'introduction.
- `1da7959` — Styles de statut des puzzles et support de localisation.
- `25128d1` — Nettoyage de niveaux inutilisés et amélioration des exemples de puzzles.

### 04/10/2026 — Boss CLEE_01 et récupération

- `923906f` — Création du niveau boss et du protocole de récupération CLEE_01.
- `8a0c5fa` — Ajout des animations de victoire et amélioration des interactions d'exemple.
- `a8a454b` — Amélioration de l'accessibilité et des animations.
- `5f4f133` — Amélioration du gameplay et de l'interface de récupération.
- `6250126` — Ajustements des mécaniques du boss et des éléments d'interface.
- `a3c1a30` — Amélioration des animations et de l'accessibilité du protocole.
- `dd73ea2` — Stabilisation des interactions, de la trajectoire des notes et du gameplay
  de récupération.

### 05/10/2026 — Clé 01 et niveau unifié

- `40d9712` — Mise à jour des mécaniques du protocole de récupération et ajout de la
  cinématique de récupération de la première clé.
- Évolution fonctionnelle associée : dialogue automatique Voyageur/ECHO, compteur
  global `0 / 6`, animation de récompense et transition narrative vers la suite.

### 05/10/2026 — Partie 2, traduction et micro-animations

- `3bdcce3` — Création des niveaux 11 à 13 (Partie 2, thème bleu électrique et argent) :
  double alignement (11), séquence de lumière croisée (12), puzzle coulissant fractal (13).
  Pages élargies et formes identiques interchangeables au niveau 11.
- `6475b3c` — Niveau 11 plus difficile (séquence aléatoire jouée 2 fois, chrono de 30 s,
  indice à −5 s). Compteur de clés visible uniquement sur le boss et la récupération ;
  progression centrée et `NIVEAU 0X` aligné à droite.
- `ee7cf3f` — Traduction FR/EN complète via `page-i18n.js` (textes, attributs, titres,
  dialogues de transition et d'interlude).
- `a9cb58d` — Micro-animations sur toutes les pages (`micro-animations.css/js` : fondu
  d'entrée, particules, halo de souris, ondulation au clic, flash de statut, respect de
  `prefers-reduced-motion`) et nouvelle page « En construction » partagée
  (`construction.css`) corrigeant l'écran blanc des niveaux 14 à 60.

### 06/10/2026 — Niveaux 14 à 20 et regroupement du JavaScript

- `30978df` — Création des niveaux 14 (miroirs et faisceau) et 16 (réseau logique en trois
  manches) avec leurs pages et textes FR/EN.
- `a107dea` — Niveau 15 « Les veines de lumière » : routage de flux sur grille 14 × 14,
  vingt paires de balises colorées, disposition aléatoire à chaque réinitialisation,
  sans obligation de remplir toute la grille.
- `095e959` — Mode développeur toujours rose (suppression des surcharges bleues de la
  Partie 2), JavaScript des niveaux 11 à 16 regroupé dans `partie-2_niveau-11_à_20.js`
  (scripts `niveau-1X.js` supprimés) et documentation du niveau 15 mise à jour.
- `fd5e9b6` — Correctif GitHub Pages : renommage de `Docs/` et `Documentation/` en
  `docs/` et `documentation/` dans l'index Git (Windows ignore la casse, GitHub Pages non) ;
  chemins mis à jour dans `index.html`, `script.js` et `dev-mode.js`.
- `f945865` — Mode développeur : sur PC (> 900 px), bouton et panneau alignés à gauche de
  la fenêtre (`dev-mode.css`).
- `c622ed3` — Essai de thème bleu pour tout le mode développeur de la Partie 2, remplacé
  par les deux commits suivants (le mode développeur doit rester rose).
- `f98fe07` — Mode développeur rose rétabli ; seuls les numéros des niveaux 11 à 20 passent
  au bleu électrique (`#4b9eff`).
- `e9a7b61` — Sélecteur « PART 2 » du navigateur également en bleu électrique ; les parties 3
  à 6 gardent les couleurs de base.
- 6ec4399 — Règle de maintenance : chaque commit est ajouté à ce journal.
- `fd6d447` — Mode développeur PC : marge gauche de 28 à 72 px (clamp) pour décoller le bouton du bord.
- `9b14ee1` — Mode développeur PC : le bouton s'aligne sur le bord gauche du contenu des pages (marge `max(28px, 50vw - 588px)`), à la même hauteur.
- `bdf3449` — Nouveaux niveaux 17 (balance), 18 (tour de Hanoï) et 19 (code fantôme) avec leurs pages, styles et contrôleurs dans les fichiers de la partie 2. Commentaires en français ajoutés dans tous les JS et CSS de parties (carte des niveaux par fichier, un commentaire par bloc de niveau).
- `4a1ab8a` — Commentaires de section en français devant chaque bloc de code : bandeaux par niveau (ou par rôle) dans le JS et le CSS de la partie 1, en-têtes ajoutés aux fichiers partagés (polices, connexion, micro-animations, langue, ambiance, interlude, bonus…).
- `2a6140e` — Description en français de chaque fonction des JS (143 commentaires). Nettoyage : suppression des 4 JS des parties 3 à 6 (jamais chargés par les pages) et du lien mort vers `ambient-background.css` (fichier inexistant, 404) dans 53 pages.
- 52db539 — Niveau 17 : on sélectionne une masse puis les zones de destination (plateau gauche et droit) s'illuminent et se cliquent directement, au lieu du cycle de clics réserve/gauche/droite.

### 06/10/2026 — Commits poussés sur GitHub (complément)

- `6a8e0e2` (00:30) — Mise à jour de l'état du projet pour les niveaux 14 à 16 et la
  centralisation du JavaScript.
- `7167ebf` (09:41) — Suppression du fichier de données inutilisé
  `docs/data/game-data.json`.
- `205d703` (10:14) — Première version des mots mêlés du niveau 19, cadenas numérique
  au niveau 20 et création de la page 404.
- `d863a0e` (10:43) — Remplacement temporaire du puzzle du niveau 19 par un sudoku de
  lettres.
- `24ed8e9` (11:47) — Évolution du niveau 19 en mots mêlés codés, avec lettres
  partagées et saisie du code caché.
- `e1396ad` (11:49) — Ajout des animations premium et intégration à l'introduction,
  à la cinématique et aux pages de niveaux.
- `2b85772` (11:58) — Harmonisation des scripts de pied de page pour charger les
  animations premium sur les pages concernées.
- `920697f` (13:11) — Échange des mécaniques des niveaux 16 et 20 et harmonisation
  de leurs pages, styles et descriptions.
- `8bcfce9` (13:28) — Création du combat CLEE_02 : interface tactique, déplacements,
  actions, phases, traductions FR/EN, sauvegarde et récompense de Clé 02.
- `f2edc18` (13:32) — Amélioration des visuels du combat CLEE_02, de l'état des
  ancres stabilisées et des instructions de combat.
- `a22f6fa` (14:00) — Refonte du boss CLEE_01 en trois stages accessibles ; suppression
  du protocole de récupération et de l'interlude séparés.
- `aa0066b` (14:13) — Renommage de la page CLEE_01 en `boss-01.html`, mise à jour des
  liens et ajout du favicon à la page 404.

### 06/10/2026 — Boss, niveaux et favicon

- Échange des mécaniques des niveaux 16 et 20 : cadenas des
  symboles au niveau 16, réseau dormant au niveau 20.
- Refonte complète du boss CLEE_01 : nouvelle page
  `boss-01.html`, contrôleur et styles dédiés, trois stages de difficulté `1/6`,
  six unités d'énergie et accès à la cinématique restaurée de la Clé 01. Suppression
  des références aux anciennes pages de récupération et d'interlude.
- Boss CLEE_02 : les ancres stabilisées sont signalées par
  un rond vert foncé dans l'indicateur de cohérence.
- Favicon `echoes-favicon.svg` vérifié et référencé par
  toutes les pages HTML, dont la page 404 ; vérification sans lien favicon local cassé.

### 07/10/2026 — Partie 3 : niveaux 21 à 30

- `e8dea92` — Niveau 25 : puzzle de tri dynamique, thème néon magenta et vert acide de la Partie 3 (CSS, pages 21 à 25, contrôleur `partie-3_niveau-21_à_30.js`) et couleur dédiée dans le mode développeur.
- `4ad336a` — Traductions FR/EN des puzzles captcha des fragments 026 à 030.
- `7b73760` — Refactorisation des fonctions de traduction (lisibilité et maintenance).
- `123eb00` — Niveau 26 : vrai jeu de serpents et échelles (plateau 10 × 10, pion, dé, serpents et échelles en SVG, énigme dans une fenêtre popup à chaque case).
- `4fed206` — Niveau 27 : traçage durci (grille 8 × 8, 25 déplacements, 7 virages, 5 checkpoints, 16 cases corrompues) et règles de traduction mises à jour.
- `7005184` — Niveau 27 : messages de refus détaillés (checkpoints, longueur, virages, ordre).
- `fa70ed5` — Niveau 28 : captcha en trois épreuves (code déformé, grille de formes et couleurs, sphères à trier) ; niveau 29 « L'écho du cavalier » (grille 4 × 4, saut de cavalier, solution unique, difficulté visée 3,5/6) ; textes FR/EN et styles `.captcha-*` / `.echo-*`.

## Prochain jalon recommandé

1. Tester les six parties et les trois boss sur ordinateur et mobile.
3. Valider l'ensemble de la campagne de 30 niveaux.
3. Terminer les puzzles bonus 41–60 et valider les bonus 31–40.
4. Vérifier les clés, les liens et les ressources sur le déploiement GitHub Pages.
5. Préparer une nouvelle version bêta après ces validations.

> Mettre à jour ce document à chaque commit : ajouter une entrée datée avec le hash du commit,
> sa portée (fichiers ou fonctionnalités) et corriger les sections d'état si elles changent.

### 16/10/2026 — Polissage UI, DEV MODE sécurisé et page de connexion

#### Demandes du jour (résumé)

- « Supprime l'animation des cartes de quiz qui bougent » → précisé : garder l'inclinaison (tilt) du panneau et le bouton « Lancer le jeu » qui pulse, mais arrêter toutes les animations de lignes qui traversent l'écran.
- « Améliore aussi l'UI sur toutes les pages ».
- « Mobile et tablette doivent bien s'afficher ».
- Accès DEV MODE par code envoyé par courriel (popup, adresse masquée, code à 4 chiffres, 3 essais, accès valable 3 h), puis aide pour configurer EmailJS (code, modèle HTML aux couleurs du site, mode sombre, taille mobile, identifiants).
- « Refais la page login » → « pas assez style brisé futur » → « moche, refais-la » → « les boutons aussi doivent avoir ça » → « refais le bouton » → « ajoute des SVG sur la page, c'est trop neutre ».
- Demande finale : ajouter les prompts du jour et le travail réalisé à la fin de ce document.

#### Travail réalisé

- **Animations** : inclinaison 3D du panneau conservée ; lignes de scan et traits animés neutralisés (`.puzzle-panel::before/::after`, `.fx-scanline`, footers) dans `dev-mode.css` ; bouton de départ `.sequence-start-button` qui pulse (coupé en mode animations réduites).
- **Polissage global** (`dev-mode.css`) : panneaux en verre dépoli arrondis, boutons à coins coupés (`clip-path`), focus visible cyan, barre de défilement fine.
- **Responsive** : tests à 390 et 768 px sans débordement ; panneau des clés replié par défaut sous 900 px (`ui-effects.js`).
- **DEV MODE protégé** (`dev-mode.js`, `emailjs-config.js`) : popup, adresse masquée, code à 4 chiffres valable 10 min, 3 essais puis blocage 5 min, accès mémorisé 3 h dans `localStorage`, envoi via EmailJS. Limite : site statique, la protection reste contournable.
- **Page de connexion** (`login.html`, `login.css`) : titre fracturé cyan/violet, contenu flottant sur la nébuleuse, champ à coins coupés, bouton « Continuer » refait, logo hexagonal.
- **SVG** : nouveau `docs/assets/svg/connexion/login-fragments.svg` (éclats cyan/violet flottants et points lumineux), masqué en mode performance (`fx-lite`).
- **À vérifier** : rendu du bouton « Continuer » au repos (contour sombre non confirmé), envoi réel du courriel EmailJS et expiration des 3 h.


### 16/10/2026 (suite) — Refonte de l'IA ECHO, fond de l'intro, alphabet, DEV MODE 12 h et niveau 31

#### Demandes (résumé)

- Niveau 3 : bouton ALPHABET (PC et mobile), popup centré avec seulement les lettres et un bouton ×, plus petit sur mobile/tablette, × qui ne touche plus les lettres, fond de la fenêtre changé (violet).
- DEV MODE : accès valable 12 h au lieu de 3 h.
- Footer des pages de niveau qui dépassait sur mobile.
- Bouton ECHOES des pages Boss : retour à la page des niveaux.
- « Refais toute l'IA ECHO, PC et mobile, de A à Z », puis correction de la barre du haut et du footer de l'intro, et nouveau fond SVG sans les petites lignes bleues.
- Niveau 31 : mise en page mobile, pièges « bizarres », ajustement des couleurs.

#### Travail réalisé

- **Alphabet (niveau 3)** : bouton dans la barre d'outils (`partie-1-puzzles.js`), taille réduite ≤ 1024 px, popup violet (`niveaux-communs.css`).
- **DEV MODE** : code `popol` ; accès mémorisé 24 h dans `echoes-dev-ok` (`dev-mode.js`). Vérification côté client uniquement, adaptée au développement et non sécurisée pour protéger des données. Footer des niveaux sans débordement ≤ 700 px (`dev-mode.css`).
- **Pages Boss** : le logo `.brand` de `boss-01/02/03.html` pointe vers `niveaux.html`. Les pages `niveau-XX` pointent toujours vers l'accueil.
- **Entité ECHO** : nouveau composant canvas `echo-ai.js` + `echo-ai.css` (anneaux, spectre vocal radial, étincelles, noyau vitré, mode glitch rouge). Rendu identique PC/mobile, branché via `EchoAI.init` / `EchoAI.setState` dans `introduction.js`.
- **Intro** : fond SVG (`intro-bg.svg`, `intro-shards.svg`) à la place de la grille et des lignes bleues ; barre du haut sur une ligne ; footer centré avec « Tous droits réservés » ; point lumineux du dialogue aligné avec le titre.
- **Niveau 31 mobile** (`partie-bonus_niveau-31_à_40.css`) : plateau dimensionné selon la hauteur d'écran, boutons ◀ ▶ juste sous le plateau, marges du panneau.
- **Niveau 31 jeu** (`partie-4_niveau-31_à_40.js`) : les pièges du dernier étage du secteur 1 (scie, gardien, tapis) ne traversent plus la barre de séparation ; lasers et rebondisseurs en sont exclus.
- **Niveau 31 couleurs** : fond et cadre bleu nuit/violet (plus de vert), danger en rouge/orange (gardiens, scies, lasers), tapis roulants cyan, rebondisseurs et portails inchangés.
- **Boutons ECHOES** : sur les 40 pages de niveau, le logo du haut renvoie à `niveaux.html`.
- **Accueil** : barre du haut en cartouches angulaires (système / FR-EN / dimension) ; avertissement stroboscopique refait (icône SVG, plaque d'alerte, bouton à interrupteur).
- **DEV MODE** : bouton compact angulaire et panneau refaits (`docs/css/composants/dev-mode-ui.css`) : raccourcis, interrupteurs d'options, cartes de parties colorées, grille de niveaux, accès spéciaux.
- **À vérifier** : rendu final du niveau 31 en jeu, glitch rouge de l'intro sur PC large, couleur violette de l'alphabet (choix perso).

### 01/11/2026 — Noms des fichiers des parties

- La campagne active est répartie en six dossiers de cinq niveaux : 1–5, 6–10, 11–15, 16–20, 21–25 et 26–30. Les niveaux bonus 31–60 ont été supprimés.

### 01/11/2026 — Réduction des défis

- La campagne active comporte six parties de cinq niveaux chacune, du niveau 1 au niveau 30.
- Les trois boss sont placés après les parties 2, 4 et 6.
- Les autres pages de niveaux sont conservées en archive et redirigent vers le hub hors DEV MODE.
