# Cheminement du projet

Ce document présente l'évolution réelle du projet **ECHOES: Fragments of Reality**.
Il est maintenu à partir des fonctionnalités présentes dans le dépôt et des commits
significatifs de l'historique Git. La référence narrative et fonctionnelle principale
reste [Info-fr.txt](./Info-fr.txt).

## État du projet au 04/10/2026

- **Projet :** ECHOES: Fragments of Reality
- **Type :** expérience narrative et jeu de puzzles web statique
- **Déploiement visé :** GitHub Pages
- **Version de travail :** bêta v4
- **Jalon actuel :** intégration du boss `CLEE_01` et du protocole de récupération
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
- Mode développeur pour faciliter les tests et la navigation locale.

### Responsive et qualité d'affichage

- Responsive centralisé dans `docs/css/responsive.css`.
- Adaptation pour téléphone, tablette et ordinateur.
- Interfaces tactiles sans dépendance obligatoire au survol.
- Détection des petites fenêtres PC avec pointeur fin.
- Protection contre les débordements de texte.
- Corrections des chemins sensibles à la casse pour GitHub Pages.
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

### Niveaux 11 à 14

Les bases HTML, CSS et JavaScript des niveaux suivants ont été ajoutées et plusieurs
mécaniques sont en cours d'harmonisation :

- Niveau 11 : paires de résonance.
- Niveau 12 : classement de cartes et amélioration du puzzle de couleur.
- Niveau 13 : mécanique géométrique et évolutions visuelles.
- Niveau 14 : mécanique de lumière et intégration progressive à la partie suivante.

### Boss — `clee_01_boss_level`

- Boss placé après le niveau 10 dans la partie 1.
- Combat en plusieurs phases avec attaques, vies et redémarrage en phase 1.
- Défaite du boss suivie d'un accès au protocole de récupération.
- Réussite du protocole permettant de débloquer la première clé.
- HUD de progression de clé : `CLÉE : 0 / 1`.

## Protocole de récupération

Page : `docs/html/partie-1_niveau-1_à_10/boss-recovery.html`

- 120 notes au total.
- Minimum requis : 90 réussites.
- Quatre phases de 30 notes.
- Ordre des trois colonnes mélangé aléatoirement à chaque lancement, avec les trois
  couleurs présentes dans chaque cycle.
- Vitesse globale réglée à `1,5×`.
- Durées de chute visées :
  - Phase 1 : environ `800 ms`.
  - Phase 2 : environ `733 ms`.
  - Phase 3 : environ `683 ms`.
  - Phase 4 : environ `650 ms`.
- Intervalle des drops aléatoire à partir de `200 ms`, avec une limite qui diminue
  selon la phase.
- Trajectoire linéaire contrôlée par `requestAnimationFrame`.
- Note visible au-dessus du rectangle pendant la traversée, puis sous le rectangle
  après sa sortie complète.
- Toute la surface de chaque rectangle coloré accepte le clic correspondant.
- Les erreurs font avancer la séquence sans remettre le score à zéro.
- Réinitialisation complète disponible.
- Pas de pause et pas de reprise automatique de la progression du mini-jeu au rechargement.
- Panneau d'exemple avec feedback correct/incorrect et bouton de fermeture.

## Architecture technique

- Scripts centralisés des niveaux 1 à 10 dans
  `docs/js/partie-1_niveau-1_à_10.js`.
- Styles communs et styles de partie séparés dans `docs/css/`.
- `save-system.js` gère les comptes et la progression persistante.
- `dev-mode.js` fournit les outils de test et de navigation.
- `ambient-background.js` et les feuilles d'ambiance gèrent les effets d'arrière-plan.
- Les pages restent compatibles avec un déploiement statique GitHub Pages.

## Validation réalisée

- Tests navigateur sur l'accueil, l'introduction, les niveaux et le protocole de récupération.
- Vérification de l'ouverture et de la fermeture du panneau d'exemple.
- Vérification de la stabilité de la colonne gauche lors de l'ouverture de l'exemple.
- Vérification du reset, de l'absence de reprise automatique et du pulse au clic.
- Vérification du scheduler après plusieurs clics, erreurs et notes simultanées.
- Vérification de l'ordre aléatoire et des intervalles variables entre les drops.
- Vérification de la trajectoire linéaire et du changement de profondeur sous les rectangles.
- Vérification des références locales et des chemins GitHub Pages.
- Vérification de syntaxe JavaScript et `git diff --check`.

## Travail en cours

- Finaliser et tester les niveaux 8 à 15.
- Harmoniser les contenus FR/EN des niveaux futurs.
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

## Prochain jalon recommandé

1. Terminer les tests prolongés du protocole de récupération sur desktop et mobile.
2. Valider le déblocage de la première clé après une réussite complète.
3. Finaliser les niveaux 8 à 15 et leurs traductions.
4. Vérifier l'ensemble des liens et assets sur GitHub Pages.
5. Préparer une nouvelle version bêta après validation des parcours complets.

> Mettre à jour ce document après chaque jalon important. Les entrées du journal doivent
> référencer les commits fonctionnels plutôt que les commits techniques intermédiaires.
