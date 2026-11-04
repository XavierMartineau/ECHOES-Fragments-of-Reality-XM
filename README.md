# ECHOES: Fragments of Reality

> Une expérience narrative cyberpunk où chaque puzzle restaure un fragment d'une
> réalité brisée.

ECHOES est un jeu web **statique** (HTML, CSS et JavaScript, sans framework, sans
compilation et sans serveur obligatoire). Le joueur est guidé par **ECHO**, une
intelligence fragmentée, et par le **Voyageur**, qui traversent des dimensions
instables pour retrouver six clés de résonance.

## Sommaire

1. [État du projet](#état-du-projet)
2. [Lancer le projet](#lancer-le-projet)
3. [Campagne et nomenclature officielle](#campagne-et-nomenclature-officielle)
4. [Fonctionnalités](#fonctionnalités)
5. [Organisation du dépôt](#organisation-du-dépôt)
6. [Conventions de nommage](#conventions-de-nommage)
7. [Sauvegarde et données locales](#sauvegarde-et-données-locales)
8. [DEV MODE](#dev-mode)
9. [Performance et accessibilité](#performance-et-accessibilité)
10. [Direction artistique](#direction-artistique)
11. [Validation](#validation)
12. [Documentation et suite](#documentation-et-suite)

## État du projet

| Élément | Valeur |
| --- | --- |
| Version de travail | bêta v4 |
| Campagne jouable | 6 parties, niveaux 1 à 30, 3 boss |
| Clés obtenues en jeu | Clé 01, Clé 02, Clé 03 (clés 04 à 06 prévues) |
| Niveau final | « La fin finale » : câblé dans `levels-config.js`, pas encore jouable |
| Langues | français et anglais, changement en place sans rechargement |
| Appareils | PC, tablette et mobile (décor d'accueil adaptatif en trois tailles) |
| Déploiement prévu | GitHub Pages |

## Lancer le projet

Aucune compilation n'est nécessaire.

1. Cloner le dépôt.
2. Ouvrir `index.html` à la racine dans un navigateur, ou servir la racine avec
   un serveur statique local (recommandé : il reproduit GitHub Pages).

```bash
python -m http.server 8000
```

Puis ouvrir <http://localhost:8000>.

Pour tester vite une scène ou un niveau, ouvrir le [DEV MODE](#dev-mode) depuis
le bouton « DEV MODE » présent sur chaque page.

## Campagne et nomenclature officielle

### Parties

| Partie | Nom (FR / EN) | Niveaux | Dossier de pages | Fin de partie |
| --- | --- | --- | --- | --- |
| 1 | Initiation | 1 à 5 | `partie-1_niveau-1_à_5` | : |
| 2 | Fractures | 6 à 10 | `partie-2_niveau-6_à_10` | Boss // CLÉ 01 |
| 3 | Éclipse / Eclipse | 11 à 15 | `partie-3_niveau-11_à_15` | : |
| 4 | Résonance / Resonance | 16 à 20 | `partie-4_niveau-16_à_20` | Boss // CLÉ 02 |
| 5 | Convergence | 21 à 25 | `partie-5_niveau-21_à_25` | : |
| 6 | Origine / Origin | 26 à 30 | `partie-6_niveau-26_à_30` | Boss // CLÉ 03 |

La source unique de cette structure est `docs/js/levels-config.js` : parties,
boss, clés et niveau final y sont déclarés, et les autres scripts la lisent.

### Boss et clés de résonance

| Boss | Page | Après | Récompense | Identifiant de clé |
| --- | --- | --- | --- | --- |
| Boss // CLÉ 01 : le Gardien du Signal | `boss-01.html` | niveau 10 | Clé 01 | `resonance-1` |
| Boss // CLÉ 02 : l'Archonte des Fractures | `boss-02.html` | niveau 20 | Clé 02 | `resonance-2` |
| Boss // CLÉ 03 : l'Occulteur | `boss-03.html` | niveau 30 | Clé 03 | `resonance-3` |

Les identifiants de clés vont de `resonance-1` à `resonance-6`. Les visuels
`key-01-usb.svg` à `key-07-usb.svg` existent déjà dans `docs/assets/svg/cles/`.
Dans les sauvegardes, les boss sont enregistrés sous `boss-02`, `boss-04` et
`boss-06` (numéro de la série qui les contient).

### Parcours

```text
Introduction → Connexion → Hub des niveaux
        ↓
Partie 1 (niv. 1–5) → Partie 2 (niv. 6–10) → Boss // CLÉ 01
        ↓
Partie 3 (niv. 11–15) → Partie 4 (niv. 16–20) → Boss // CLÉ 02
        ↓
Partie 5 (niv. 21–25) → Partie 6 (niv. 26–30) → Boss // CLÉ 03
        ↓
La fin finale (à venir)
```

Les niveaux terminés restent rejouables.

### Mécaniques des niveaux 1 à 10

1. suites numériques à déduire ;
2. labyrinthe à parcourir au clavier ou avec les commandes ;
3. messages chiffrés par décalage alphabétique ;
4. taquin 3 × 3 à reconstruire ;
5. mémoire de huit paires ;
6. déduction de code façon Mastermind ;
7. nonogramme 5 × 5 ;
8. miroirs à orienter pour guider un faisceau laser ;
9. tours de Hanoï à quatre disques ;
10. Sudoku 4 × 4 avant le combat de boss.

### Combats de boss

- **Boss // CLÉ 01** : trois stages courts (associer des sceaux, répéter une
  mélodie de trois symboles, cliquer le noyau pendant deux halos verts) avec six
  unités d'énergie. La victoire reconstitue la Clé 01 dans une cinématique
  intégrée, enregistre la récompense et mène au niveau 11.
- **Boss // CLÉ 02** : arène tactique à cases, lignes d'impact télégraphiées,
  six ancres à stabiliser et deux boucliers sur trois phases. La victoire
  débloque la Clé 02 et ouvre le niveau 21.
- **Boss // CLÉ 03** : trois phases d'anneaux d'éclipse à verrouiller du plus
  extérieur au plus intérieur ; la phase 2 accélère, la phase 3 inverse le sens.
  La victoire débloque la Clé 03 et termine la campagne principale.

## Fonctionnalités

- Comptes et sauvegarde locaux, reprise automatique de la progression.
- Hub des niveaux avec points verts de progression et panneau des six clés.
- ECHO, l'assistante du jeu, avec ses messages et son habillage glitch.
- Traductions FR/EN complètes ; le dictionnaire de la langue active est chargé
  en premier, l'autre au repos.
- Accueil : décor SVG adaptatif, titre ECHOES en typographie de terminal,
  HUD, ligne du haut en électrocardiogramme et fond canvas léger.
- Curseur à réticule sur tout le site (souris uniquement), avec états pointeur,
  texte, glisser, clic et désactivé.
- DEV MODE en page indépendante, avec débogueur.
- Mode « Réduire les effets » : toutes les animations sont ralenties par 4.

## Organisation du dépôt

```text
index.html              Accueil
404.html                Page « Signal perdu »
script.js               Accueil : fond canvas, langue FR/EN, effets réduits
style.css               Styles généraux de l'accueil
lag-fix/                Correctifs de performance (voir plus bas)
docs/
├── assets/
│   ├── images/
│   └── svg/
│       ├── accueil/    Décor d'accueil (dont adaptatif/ : PC, tablette, mobile)
│       ├── animations-depart/
│       ├── cles/       key-01-usb.svg … key-07-usb.svg
│       ├── connexion/
│       ├── ia/         Visuel d'ECHO
│       ├── identite/   Favicon et marque
│       └── motifs/
├── css/
│   ├── base/           fonts.css, responsive.css
│   ├── bosses/         boss-01.css … boss-03.css
│   ├── composants/     ui-effects, key-tray, key-fragments, echo-ai, dev-mode…
│   ├── niveaux/        niveaux-communs.css + un fichier par partie
│   └── pages/          home, login, niveaux, introduction, dev-mode-page…
├── html/
│   ├── introduction.html, login.html, niveaux.html, dev-mode.html
│   └── partie-N_niveau-X_à_Y/   niveau-NN.html et boss-0N.html
└── js/
    ├── bosses/         boss-01.js … boss-03.js
    ├── niveaux/        Contrôleurs et puzzles des niveaux
    └── *.js            Modules partagés

documentation/
├── Info-fr.txt             Cahier des charges et univers
└── cheminement-projet.md   Historique, planification et journal
```

### Fichiers importants

| Fichier | Rôle |
| --- | --- |
| `docs/js/levels-config.js` | Parties, boss, clés, niveau final et progression |
| `docs/js/save-system.js` | Comptes, sauvegardes et clés débloquées |
| `docs/js/level-guard.js` | Accès aux niveaux selon la progression |
| `docs/js/niveaux/` | Puzzles et contrôleurs des niveaux (`partie-1-puzzles.js`, etc.) |
| `docs/js/bosses/` | Contrôleurs des trois combats |
| `docs/js/key-fragments.js`, `key-tray.js` | Assemblage des clés et panneau des clés |
| `docs/js/ui-effects.js` | Curseur, scrollbars, accessibilité et « Réduire les effets » |
| `docs/js/home-line.js` | Ligne de l'accueil en électrocardiogramme |
| `docs/js/translations*.js`, `language.js`, `page-i18n.js` | Traductions FR/EN |
| `docs/js/dev-mode.js` | Bouton « DEV MODE » injecté sur chaque page |
| `docs/js/dev-mode-page.js` | Logique de la page DEV MODE et du débogueur |
| `docs/html/dev-mode.html` | Page DEV MODE |
| `lag-fix/fps-boost.js`, `fps-boost.css` | Mode allégé automatique et pause des animations |

## Conventions de nommage

- **Parties** : dossier `partie-N_niveau-X_à_Y` (le « à » est un vrai caractère
  accentué : encoder les URL avec `encodeURIComponent`).
- **Pages** : `niveau-NN.html` (deux chiffres) et `boss-0N.html`.
- **CSS de niveaux** : `niveaux-communs.css` plus un fichier par partie,
  nommés comme le dossier de la partie.
- **Clés** : `resonance-1` à `resonance-6` ; visuels `key-0N-usb.svg`.
- **Cache** : les ressources partagées sont versionnées par `?v=` dans les HTML.
  Incrémenter la valeur force le rechargement.
- **Textes** : français par défaut, traductions dans `translations.fr.js` et
  `translations.en.js` ; les textes visibles passent par des clés `data-i18n`.

## Sauvegarde et données locales

Tout est stocké dans `localStorage` du navigateur.

| Clé | Contenu |
| --- | --- |
| `echoes-account-<nom>` | Compte local |
| `echoes-current-user` | Joueur connecté |
| `echoes-save-<nom>` | Niveau courant, niveaux et boss terminés, clés |
| `echoes-guest-keys` | Clés d'un joueur non connecté |
| `echoes-language` | Langue (`fr` ou `en`) |
| `echoes-reduced-effects`, `echoes-reduce` | Réglages « Réduire les effets » |
| `echoes-fx-cursor`, `echoes-fx-scene`, `echoes-perf` | Curseur, fonds animés, mode performance |

La progression est enregistrée automatiquement ; il n'y a plus de bouton de
sauvegarde manuelle. Le paramètre `?dev=1` permet de rejouer la scène Clé 01.

## DEV MODE

Page indépendante `docs/html/dev-mode.html`, ouverte par le bouton « DEV MODE »
de n'importe quelle page. Elle n'est chargée qu'à la demande pour ne pas alourdir
le jeu. L'accès demande un code, mémorisé 24 h. Ce code est vérifié côté client :
ce n'est pas une sécurité.

Les outils sont rangés en catégories ouvrables et fermables (état mémorisé),
avec un filtre, « Tout ouvrir / Tout fermer » et un compteur de FPS en direct.

**Outils de jeu**

- Raccourcis, état du joueur, don et retrait des clés 1 à 6.
- Progression : skip jusqu'à un niveau, tout terminer, réinitialisation.
- Options : repères couleurs, curseur, fonds animés, mode performance, compteur de FPS.
- Navigation par partie vers chaque niveau et chaque boss.
- Copie de la sauvegarde et verrouillage du DEV MODE.

**Débogueur**

- Système et performance : graphique des FPS, moyenne et minimum, pire image,
  tâches longues, mémoire JS, éléments DOM, écran, cœurs, réseau.
- Journal d'erreurs : erreurs et avertissements captés sur les pages du jeu
  quand le DEV MODE est déverrouillé.
- Inspecteur de stockage : liste, lecture et suppression des clés `localStorage`.
- Vérificateur de pages : teste que chaque niveau, boss et page principale répond.
- Terminal : `help`, `keys`, `give`, `take`, `skip`, `save`, `ls`, `get`, `set`,
  `del`, `fps`, `clear`.

## Performance et accessibilité

- `lag-fix/fps-boost.js` mesure les FPS et active un **mode allégé** (sans flou,
  ombres de texte ni effets décoratifs) sous 45 FPS, ou si « performance » ou
  « mouvements réduits » est actif. Il fige aussi les animations quand l'onglet
  est masqué. `fps-boost.css` contient les règles correspondantes.
- Le canvas de l'accueil limite sa résolution et son rythme.
- Le décor d'accueil est servi en trois tailles par `<picture>`.
- Lien d'évitement, focus visible et réglage **« Réduire les effets »** : toutes
  les animations tournent 4 fois plus lentement, pour éviter les changements
  rapides de couleurs.
- Le curseur personnalisé est réservé à la souris.
- Un écran à 60 Hz limite l'affichage à 60 images par seconde : le but est de
  rester fluide, pas de dépasser la fréquence de l'écran.

## Direction artistique

- fonds sombres et grilles holographiques ;
- cyan, violet, vert néon et magenta ;
- typographie de terminal (titre ECHOES en monospace avec curseur et glitch rouge) ;
- orbites, halos et noyaux de résonance ;
- perturbations glitch limitées aux signaux d'ECHO ;
- interfaces centrées et adaptées au mobile.

## Validation

```bash
node --check docs/js/dev-mode-page.js
node --check docs/js/ui-effects.js
node --check lag-fix/fps-boost.js
git diff --check
```

Le DEV MODE contient aussi un vérificateur de pages et un journal d'erreurs.

## Documentation et suite

- [`documentation/cheminement-projet.md`](documentation/cheminement-projet.md) :
  historique, planification et journal de travail.
- [`documentation/Info-fr.txt`](documentation/Info-fr.txt) : univers, structure
  et cahier des charges.

Prochaines étapes : niveau final « La fin finale », clés 04 à 06, tests
automatisés (liens, clés de traduction, progression) et nettoyage de l'ancien CSS
du panneau DEV MODE.
