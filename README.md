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
| Campagne jouable | 6 parties, niveaux 1 à 30, 6 boss |
| Clés obtenues en jeu | Clés de résonance 01 à 06, puis clé mémoire 07 |
| Niveau final | Forge de mémoire : assembler les clés 01 à 06 pour forger la clé 07 |
| Langues | français et anglais, changement en place sans rechargement |
| Appareils | PC, tablette et mobile (décor d'accueil adaptatif en trois tailles) |
| Déploiement prévu | GitHub Pages |

## Lancer le projet

Aucune compilation n'est nécessaire.

1. Cloner le dépôt.
2. Servir la racine avec un serveur statique local (nécessaire pour charger le
   SVG interactif de la forge, et pour reproduire GitHub Pages).

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
| 1 | Initiation | 1 à 5 | `partie-1_niveau-1_à_5` | Boss // CLÉ 01 |
| 2 | Fractures | 6 à 10 | `partie-2_niveau-6_à_10` | Boss // CLÉ 02 |
| 3 | Éclipse / Eclipse | 11 à 15 | `partie-3_niveau-11_à_15` | Boss // CLÉ 03 |
| 4 | Résonance / Resonance | 16 à 20 | `partie-4_niveau-16_à_20` | Boss // CLÉ 04 |
| 5 | Convergence | 21 à 25 | `partie-5_niveau-21_à_25` | Boss // CLÉ 05 |
| 6 | Origine / Origin | 26 à 30 | `partie-6_niveau-26_à_30` | Boss // CLÉ 06 |

La source unique de cette structure est `docs/js/levels-config.js` : parties,
boss, clés et niveau final y sont déclarés, et les autres scripts la lisent.

### Boss et clés de résonance

| Boss | Page | Après | Récompense | Identifiant de clé |
| --- | --- | --- | --- | --- |
| Boss // CLÉ 01 : la Sentinelle | `boss-01.html` | niveau 5 | Clé 01 | `resonance-1` |
| Boss // CLÉ 02 : l'Architecte du Néant | `boss-02.html` | niveau 10 | Clé 02 | `resonance-2` |
| Boss // CLÉ 03 : l'Occulteur | `boss-03.html` | niveau 15 | Clé 03 | `resonance-3` |
| Boss // CLÉ 04 : le Gardien prismatique | `boss-04.html` | niveau 20 | Clé 04 | `resonance-4` |
| Boss // CLÉ 05 : le Dueliste du tempo | `boss-05.html` | niveau 25 | Clé 05 | `resonance-5` |
| Boss // CLÉ 06 : le Régulateur du noyau | `boss-06.html` | niveau 30 | Clé 06 | `resonance-6` |

Chaque boss donne une clé `resonance-1` à `resonance-6`. Après le niveau 30 et le
Boss 06, la forge présente les dessins des sept clés en gris, comme les clés
verrouillées du jeu. Glisse les six clés colorées dans les emplacements de même
forme et numéro : chaque signal colore son circuit. Abaisse ensuite le levier
pour débloquer `resonance-7` (`key-07-usb.svg`), révéler progressivement la
clé 07 et lancer sa cinématique de construction. Une
clé placée disparaît du tiroir et peut être déplacée ou récupérée par double-clic ;
sur tactile ou au clavier, sélectionne son emplacement puis « Retirer la clé ».

### Parcours

```text
Introduction → Connexion → Hub des niveaux
        ↓
Partie 1 (niv. 1–5) → Boss // CLÉ 01
        ↓
Partie 2 (niv. 6–10) → Boss // CLÉ 02
        ↓
Partie 3 → Boss // CLÉ 03 → Partie 4 → Boss // CLÉ 04
        ↓
Partie 5 → Boss // CLÉ 05 → Partie 6 (niv. 26–30) → Boss // CLÉ 06
        ↓
Forge de mémoire : six clés alignées → levier → clé mémoire 07
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

- **Boss // CLÉ 01** : sceaux, mémorisation d'une séquence et interception de
  pulsations. Les séquences s'allongent et l'énergie diminue avec la difficulté.
- **Boss // CLÉ 02** : arène tactique, ancres à stabiliser et lignes d'impact
  télégraphiées.
- **Boss // CLÉ 03** : combat d'anneaux d'éclipse conservé, avec rotations,
  fenêtres à aligner et plusieurs phases.
- **Boss // CLÉ 04** : faisceau prismatique à router en orientant des miroirs;
  trois plateaux ajoutent virages et miroirs-leurres.
- **Boss // CLÉ 05** : duel de précision; frappe dans une fenêtre mobile tandis
  que le tempo accélère et que la zone de capture rétrécit.
- **Boss // CLÉ 06** : combat stratégique de gestion du réacteur. Équilibre le
  flux et la chaleur, bloque les impulsions annoncées et stabilise trois phases.
- **Forge mémoire** : placer les six clés sur les matrices correspondantes et
  abaisser le levier pour obtenir la clé 07.

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
│   ├── bosses/         boss-01.css … boss-06.css, key-forge.css
│   ├── composants/     ui-effects, key-tray, key-fragments, echo-ai, dev-mode…
│   ├── niveaux/        niveaux-communs.css + un fichier par partie
│   └── pages/          home, login, niveaux, introduction, dev-mode-page…
├── html/
│   ├── introduction.html, login.html, niveaux.html, dev-mode.html
│   └── partie-N_niveau-X_à_Y/   niveau-NN.html et boss-0N.html
└── js/
    ├── bosses/         boss-01.js … boss-06.js
    ├── key-forge.js    Fusion des six clés et récompense clé 07
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
| `docs/js/bosses/` | Contrôleurs des six combats |
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
- Options : repères couleurs, curseur, fonds animés, mode performance, compteur de FPS
  affiché dans le bouton DEV MODE pendant le jeu.
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
  « mouvements réduits » est actif. Après le retour d'un onglet masqué, la
  mesure repart avec une période de stabilisation. `fps-boost.css` contient
  les règles correspondantes.
- Les fonds canvas s'adaptent au mode allégé : résolution et nombre de
  particules réduits, cadence plafonnée à environ 15 images par seconde.
  Leur animation et la ligne de l'accueil sont suspendues lorsque l'onglet
  est masqué ; les mécanismes de jeu restent inchangés.
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
node --test tests/performance.test.js
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
