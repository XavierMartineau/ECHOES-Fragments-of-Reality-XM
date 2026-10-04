# Cheminement du projet

Ce document suit l'avancement réel du projet ECHOES: Fragments of Reality.
La référence narrative et fonctionnelle principale reste `documentation/Info-fr.txt`.

## État actuel

- Date : 04/10/2026
- Projet : ECHOES: Fragments of Reality
- Phase : introduction interactive, niveaux 1 à 7 jouables et boss CLEE_01 en cours d'intégration
- Déploiement visé : GitHub Pages

## Progression actuelle

### ✅ Accueil, formulaire et introduction

- Page d'accueil cyberpunk avec fond animé et sélecteur FR/EN.
- Page de connexion avec création de compte, mot de passe et reprise de sauvegarde.
- Introduction narrative ECHO / Voyageur avec spectre audio canvas.
- Dialogue machine à écrire avec défilement automatique.
- Panne de mémoire d'ECHO présentée comme un vrai log de code semi-corrompu.
- Messages `ECHO_CORE`, `MISSION_FAILED` et `TRANSMISSION:: TERMINATED`.
- Mission étendue à six clés et six fragments de mémoire : Origine, Résonance, Souvenir, Trace, Conscience et Silence.
- Boutons retour présents à partir de la page formulaire.

### ✅ Système de comptes et progression

- Sauvegarde par compte utilisateur dans `localStorage`.
- Progression des niveaux séparée par compte.
- Points verts de navigation liés au compte actif.
- Sauvegarde automatique du niveau courant à l'ouverture d'un niveau.
- Reprise directe du dernier niveau sauvegardé.
- Nouvelle partie qui efface la progression du compte avant de recommencer.
- Niveaux terminés rejouables sans perdre les points verts.
- Messages de réussite avec indication du secteur suivant et du nombre de niveaux restants.

### ✅ Responsive et GitHub Pages

- Media queries centralisées dans `docs/css/responsive.css` pour l'accueil et l'introduction.
- PC à partir de 1100 px, tablette de 651 à 1099 px, téléphone jusqu'à 650 px.
- Détection desktop pour les petites fenêtres PC avec pointeur fin.
- Interfaces tactiles adaptées et textes protégés contre les débordements.
- Favicon corrigé vers `docs/assets/images/echoes-favicon.svg`.
- Audit des références locales terminé : `NO_MISSING_LOCAL_REFERENCES`.
- Chemins d'accueil des niveaux corrigés pour GitHub Pages.

## Niveaux jouables

### ✅ Niveau 1 — Alignement primaire

- Trois manches successives d'alignement.
- Chaque manche possède un ordre de formes aléatoire.
- Compteur de manches `1 / 3`, `2 / 3`, puis `3 / 3`.
- Nouvelle manche lancée automatiquement après réussite.
- Sauvegarde seulement après la troisième manche.
- Bouton de lancement pour éviter les interactions avant le démarrage.

### ✅ Niveau 2 — Séquence lumineuse

- Quatre piliers lumineux.
- Séquence aléatoire à mémoriser.
- Lecture uniquement après clic sur le bouton de lancement.
- Feedback de désynchronisation et replay.
- Réussite persistante et bouton vers le niveau 3.

### ✅ Niveau 3 — Formes géométriques

- Six formes à classer dans six emplacements.
- Ordre des cartes et des cibles mélangé à chaque partie.
- Interface tactile sans dépendance au hover.
- Cible correspondante mise en évidence après sélection.
- Bouton de lancement et progression persistante.

### ✅ Niveau 4 — Rotation holographique

- Quatre manches avec la même forme visible.
- Seule la ligne d'orientation change entre les manches.
- Angles diagonaux aléatoires : `45°`, `135°`, `225°`, `315°`.
- Compteur des quatre orientations et animation de stabilisation.
- La forme ne disparaît pas pendant la progression.

### ✅ Niveau 5 — Séquence sonore

- Quatre notes générées avec Web Audio.
- Message visible demandant d'activer le volume.
- Séquence sonore aléatoire et bouton d'écoute manuel.
- Aucun son automatique avant interaction utilisateur.
- Feedback d'erreur et progression sauvegardée.

### ✅ Niveau 6 — Observation des motifs

- Mur holographique de 20 symboles.
- Trois motifs identiques placés aléatoirement.
- Toutes les cases sont bleues au départ pour ne pas révéler la solution.
- La case devient verte uniquement après une bonne sélection.
- Les formes cibles changent à chaque nouvelle partie ou réinitialisation.
- SYSTEM LOG avec objectif initial et message de réussite personnalisé.
- Reset qui recrée et remélange complètement la grille.

### ✅ Niveau 7 — Porte lumineuse

- Porte holographique avec anneaux, noyau et cinq symboles.
- Trois stages de difficulté : 3 boutons, puis 4, puis 5 boutons actifs.
- Séquences aléatoires à observer et à reproduire.
- Compteur de stages `1 / 3`, `2 / 3`, puis `3 / 3`.
- Animation d'ouverture de la porte à la réussite finale.
- Erreur de séquence avec corruption rouge et glitch de la page.
- Message semi-corrompu d'ECHO, `MISSION_FAILED` et fin de transmission.

### ✅ Niveau boss — CLEE_01 et protocole de récupération

- Ajout du niveau `clee_01_boss_level` dans la partie 1 après le niveau 10.
- Combat de boss en plusieurs phases avec attaques, vies et redémarrage en phase 1.
- Déblocage de la première clé après la récupération, avec affichage dans le HUD `CLÉE : 0 / 1`.
- Ajout de la page `boss-recovery.html` pour le mini-jeu de récupération.
- Mini-jeu de 120 notes avec un minimum de 90 réussites.
- Quatre phases de 30 notes, avec une vitesse qui augmente progressivement :
  - Phase 1 : chute d'environ 800 ms.
  - Phase 2 : chute d'environ 733 ms.
  - Phase 3 : chute d'environ 683 ms.
  - Phase 4 : chute d'environ 650 ms.
- Vitesse globale des notes réglée à `1,5×`.
- Ordre des touches mélangé aléatoirement à chaque nouveau test, avec les trois colonnes réparties dans chaque cycle.
- Intervalle aléatoire entre les drops, à partir de 200 ms, avec une limite réduite progressivement par phase.
- Notes animées linéairement sur toute la colonne, au-dessus des rectangles pendant leur traversée puis sous les rectangles après leur sortie complète.
- Toute la surface de chaque rectangle coloré accepte le clic correspondant.
- Les erreurs font continuer la séquence sans remettre le score à zéro.
- Ajout d'un bouton de réinitialisation, sans pause et sans reprise automatique de la progression au rechargement.
- Ajout d'un panneau d'exemple avec indications visuelles de réussite et d'erreur.

## Centralisation technique

- Les niveaux 1 à 10 utilisent le script central `docs/js/partie-1_niveau-1_à_10.js`.
- Les contrôleurs séparés des niveaux 2 à 5 ont été supprimés.
- Des sections clairement identifiées existent pour les niveaux 6 à 15.
- Les feuilles CSS de toutes les parties possèdent une base responsive et des animations d'entrée.
- Les footers avec droits réservés sont présents sur toutes les pages de niveaux.

## En cours

- Finalisation des mécaniques détaillées des niveaux 8 à 15.
- Ajout progressif des six fragments et des clés dans la progression narrative.
- Harmonisation des contenus FR/EN des niveaux futurs.

## À venir

- Niveaux 8 à 15 entièrement jouables.
- Système complet des six clés et des verrous associés.
- Puzzles des dimensions Fractures et Éclipse.
- Validation navigateur complète des parcours GitHub Pages.

## Journal des modifications

### 01/10/2026

- Création et validation des niveaux 1 à 7.
- Centralisation des scripts de la partie 1.
- Ajout de la progression par compte et de la reprise automatique.
- Ajout des animations communes aux pages de niveaux.
- Correction des chemins GitHub Pages et des favicons.
- Amélioration responsive PC, tablette et téléphone.
- Ajout des footers de copyright sur les pages de niveaux.
- Ajout des messages d'erreur semi-corrompus d'ECHO.

### 04/10/2026

- Création et itérations du combat CLEE_01 après le niveau 10.
- Ajout du protocole de récupération avec notes multiples, ordre aléatoire et intervalles variables.
- Correction du scheduler pour maintenir les drops après les clics et les erreurs.
- Ajustement de la trajectoire linéaire des notes sur toute la colonne.
- Ajout du passage visuel des notes derrière les rectangles après leur sortie complète.
- Progression de la vitesse sur quatre phases, de 800 ms à 650 ms avec une vitesse globale de `1,5×`.
- Ajout de la réinitialisation complète et suppression de la reprise automatique du mini-jeu.

### 30/09/2026

- Création de l'accueil et de l'introduction narrative.
- Ajout du système FR/EN.
- Ajout du spectre audio et du dialogue machine à écrire.
- Mise en place de la structure initiale dans `docs/`.

## Note

Mettre à jour ce document après chaque modification importante et consulter `Info-fr.txt` avant toute nouvelle mécanique ou évolution narrative.
