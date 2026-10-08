# Cheminement du projet

Ce document présente l'évolution réelle du projet **ECHOES: Fragments of Reality**.
Il est maintenu à partir des fonctionnalités présentes dans le dépôt et des commits
significatifs de l'historique Git. La référence narrative et fonctionnelle principale
reste [Info-fr.txt](./Info-fr.txt).

## État du projet au 07/10/2026

- **Projet :** ECHOES: Fragments of Reality
- **Type :** expérience narrative et jeu de puzzles web statique
- **Déploiement visé :** GitHub Pages
- **Version de travail :** bêta v4
- **Jalon actuel :** Partie 3 (niveaux 21 à 30) jouable ; boss `CLEE_01` / Clé 01 et combat tactique `CLEE_02` après le niveau 20
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
- Reprise de la dernière progression sauvegardée.
- Nouvelle partie avec effacement de la progression du compte.
- Niveaux terminés rejouables sans supprimer les points verts.
- Navigation partagée, boutons retour et liens vers les secteurs suivants.
- Mode développeur pour faciliter les tests et la navigation locale ; son bouton et son menu restent roses sur toutes les pages ; seuls les numéros de niveaux 11 à 20 et le sélecteur « PART 2 » du navigateur passent au bleu électrique ; sur PC, le bouton est à gauche de la fenêtre avec une marge de 28 à 72 px.

### Responsive et qualité d'affichage

- Responsive centralisé dans `docs/css/responsive.css`.
- Adaptation pour téléphone, tablette et ordinateur.
- Interfaces tactiles sans dépendance obligatoire au survol.
- Détection des petites fenêtres PC avec pointeur fin.
- Protection contre les débordements de texte.
- Corrections des chemins sensibles à la casse pour GitHub Pages : dossiers docs/ et documentation/ en minuscules dans Git (GitHub Pages distingue la casse).
- Audit des références locales réalisé : `NO_MISSING_LOCAL_REFERENCES`.

## Puzzles et niveaux

### Partie 1 — Niveaux 1 à 10

- **Niveau 1 — Alignement primaire :** trois manches, formes mélangées et progression
  après réussite de chaque manche.
- **Niveau 2 — Séquence lumineuse :** quatre piliers, séquence aléatoire, replay et
  feedback de désynchronisation.
- **Niveau 3 — Formes géométriques :** six formes à classer dans six emplacements
  mélangés.
- **Niveau 4 — Rotation holographique :** quatre orientations diagonales aléatoires
  (`45°`, `135°`, `225°`, `315°`).
- **Niveau 5 — Séquence sonore :** quatre notes Web Audio, écoute manuelle et feedback
  d'erreur.
- **Niveau 6 — Observation des motifs :** grille de 20 symboles, motifs identiques
  placés aléatoirement et reset complet.
- **Niveau 7 — Porte lumineuse :** trois stages de difficulté et séquences à reproduire.
- **Niveau 8 — Mécanique de couleur :** évolution du puzzle vers les séquences de couleurs.
- **Niveau 9 — Mécanique de tri :** progression vers le classement et la constellation.
- **Niveau 10 — Séquence de couleurs :** puzzle de séquence servant de transition vers
  le combat de boss.

### Niveaux 11 à 20

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

- Combat placé après le niveau 20 et avant l'entrée dans la partie 3.
- Arène tactique 5 × 5, déplacements orthogonaux, murs et lignes de frappe télégraphiées.
- Six ancres à stabiliser en trois phases, huit unités de cohérence et deux boucliers.
- Les ancres stabilisées sont indiquées par un rond vert foncé dans le compteur de
  cohérence, plutôt que par l'indicateur orange.
- Victoire débloquant la Clé 02 et le niveau 21.

### Boss — `boss-01.html`

- Boss placé après le niveau 10 dans la partie 1.
- Nouvelle direction visuelle : gardien spectral, cœur lumineux et orbites de résonance cyan/violettes.
- Page renommée `docs/html/partie-1_niveau-1_à_10/boss-01.html` ; le lien du niveau 10,
  le menu développeur et l'ambiance visuelle utilisent ce nom.
- Trois stages accessibles : trouver trois sceaux correspondants, répéter une mélodie de trois symboles et toucher le noyau pendant deux halos verts.
- Difficulté visée : `1/6`, avec six unités d'énergie et une reprise par réinitialisation.
- Contrôleur et styles isolés dans `docs/js/boss-01.js` et `docs/css/boss-01.css`.
- La victoire enregistre `resonance-1` et présente la réunion des trois fragments
  dans une fenêtre de récompense. « Continuer » ouvre directement le niveau 11 ;
  aucune page cinématique Clé 01 séparée n'est conservée.

## Architecture technique

- Le favicon commun est `docs/assets/svg/echoes-favicon.svg` et est référencé par
  toutes les pages HTML du site, y compris `404.html`.
- Scripts centralisés des niveaux 1 à 10 dans
  `docs/js/partie-1_niveau-1_à_10.js`.
- Styles communs et styles de partie séparés dans `docs/css/`.
- `save-system.js` gère les comptes et la progression persistante.
- `dev-mode.js` fournit les outils de test et de navigation.
- `partie-2_niveau-11_à_20.js` regroupe tout le JavaScript des niveaux 11 à 16 (sauvegarde,
  navigation et contrôleurs de puzzle) ; il n'existe plus de script `niveau-1X.js` séparé.
- `ambient-background.js` et les feuilles d'ambiance gèrent les effets d'arrière-plan.
- Les pages restent compatibles avec un déploiement statique GitHub Pages.

## Validation réalisée

- Vérification navigateur des trois stages du boss 01, de la victoire, de la perte
  d'énergie et de la réinitialisation ; test du boss 02 tactique.
- Vérification des textes FR/EN et de l'absence de débordement horizontal sur mobile
  pour la page du boss 01.
- Vérification des références locales : les 68 pages HTML ont un favicon référencé
  et tous les liens locaux vers le SVG existent.
- Vérification de syntaxe JavaScript et `git diff --check`.

## Travail en cours

- Valider complètement les parcours des niveaux 1 à 20 sur desktop et mobile.
- Harmoniser et vérifier les contenus FR/EN des pages restantes.
- Relier complètement les six clés aux verrous et fragments narratifs.
- Compléter les puzzles des dimensions Fractures et Éclipse.
- Effectuer une validation complète des parcours sur GitHub Pages.

## Journal des pushes Git significatifs

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
- `c28050c` — Harmonisation de la version des scripts et de la sauvegarde.
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

1. Valider les parcours complets des parties 1 et 2 sur desktop et mobile.
2. Vérifier le rendu du SVG `key-01-usb.svg` et de son animation dans le HUD.
3. Relier les clés restantes aux verrous et fragments narratifs.
4. Vérifier l'ensemble des liens et assets sur GitHub Pages.
5. Préparer une nouvelle version bêta après validation des parcours complets.

> Mettre à jour ce document à chaque commit : ajouter une entrée datée avec le hash du commit,
> sa portée (fichiers ou fonctionnalités) et corriger les sections d'état si elles changent.
- Ce commit — Niveau 19 devient un gros mots croisés (FR/EN selon la langue choisie) ; le cadenas des symboles passe au niveau 20 avec saisie de chiffres au clavier (plus de listes) ; nouvelle page 404.html aux couleurs du jeu.
