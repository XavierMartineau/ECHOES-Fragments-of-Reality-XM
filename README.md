# ECHOES: Fragments of Reality

> Une expérience narrative cyberpunk où chaque puzzle restaure un fragment d'une
> réalité brisée.

ECHOES est un jeu web statique mêlant exploration, puzzles, narration interactive
et effets d'interface inspirés des terminaux cyberpunk. Le joueur est guidé par
**ECHO**, une intelligence fragmentée, et le **Voyageur**, qui traversent des
dimensions instables pour retrouver six clés de résonance.

## État actuel

- **Version de travail :** bêta v4
- **Campagne principale :** 6 parties, niveaux 1 à 30
- **Jalons narratifs :** boss `CLEE_01` / Clé 01, `CLEE_02` / Clé 02 et `CLEE_03` / Clé 03
- **Déploiement prévu :** GitHub Pages
- **Technologies :** HTML, CSS et JavaScript sans framework ni serveur obligatoire

Le dernier jalon ajoute le parcours complet du premier verrou :

```text
Niveaux 1 à 10
        ↓
Boss CLEE_01
        ↓
Protocole de récupération
        ↓
Niveau spécial Clé 01
        ↓
Animation de récupération + compteur 1 / 6
        ↓
Indice ECHO pour la suite
```

## Lancer le projet

Le jeu ne nécessite pas de compilation.

1. Cloner le dépôt.
2. Ouvrir `index.html` à la racine dans un navigateur, ou servir la racine
   du dépôt avec un serveur statique local.
3. Pour tester rapidement une scène spéciale, ouvrir le **DEV MODE** dans le jeu.

Un serveur local est recommandé pour reproduire le comportement de GitHub Pages :

```bash
python -m http.server 8000
```

Puis ouvrir <http://localhost:8000>.

## Parcours et gameplay

La campagne principale compte six parties de cinq niveaux chacune :

| Partie | Niveaux |
| --- | --- |
| Partie 1 — Initiation | 1 à 5 |
| Partie 2 — Fractures | 6 à 10 |
| Partie 3 — Éclipse | 11 à 15 |
| Partie 4 — Résonance | 16 à 20 |
| Partie 5 — Convergence | 21 à 25 |
| Partie 6 — Origine | 26 à 30 |

Les dix premiers niveaux proposent dix mécaniques distinctes, avec une
difficulté croissante :

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

Chaque niveau conserve sa progression, ses points verts et ses états de réussite.
Les niveaux déjà terminés restent rejouables.

### Boss et Clé 01

Après le niveau 10, le joueur affronte le Gardien du Signal dans
`partie-2_niveau-6_à_10/boss-01.html`. Ce combat accessible comprend trois stages courts :
associer des sceaux, répéter une mélodie de trois symboles, puis cliquer le noyau
pendant deux halos verts. Le joueur dispose de six unités d’énergie et peut
recommencer sans passer par un niveau de récupération.
La victoire reconstitue la Clé 01 dans une courte cinématique intégrée au boss,
enregistre la récompense, puis mène directement au niveau 11, dans la Partie 3.

### Boss après la Partie 4 — `partie-4_niveau-16_à_20/boss-02.html`

Après le niveau 20, le joueur affronte l'Archonte des Fractures dans une arène
tactique à cases : il faut naviguer entre les murs, éviter les lignes d'impact
télégraphiées, stabiliser six ancres et gérer deux boucliers sur trois phases.
La victoire débloque la Clé 02 et ouvre le niveau 21, dans la Partie 5.

### Boss après la Partie 6 — `partie-6_niveau-26_à_30/boss-03.html`

Après le niveau 30, le joueur affronte l'Occulteur : trois phases d'anneaux
d'éclipse qui tournent autour du soleil. Il faut verrouiller chaque brèche sous
le rayon au bon instant (de l'anneau extérieur à l'intérieur). Une erreur coûte
de la cohérence et libère l'anneau précédent ; la phase 2 accélère les anneaux
restants à chaque verrouillage, la phase 3 inverse leur sens. La victoire
débloque la Clé 03 (SVG animé `key-03-usb.svg`) et termine la campagne
principale.

## Organisation du dépôt

```text
docs/
├── assets/
│   ├── images/
│   └── svg/
│       ├── accueil/
│       ├── animations-depart/
│       ├── cles/
│       ├── connexion/
│       ├── ia/
│       ├── identite/
│       └── motifs/
├── css/
│   ├── base/       Polices et règles responsive
│   ├── bosses/
│   ├── composants/
│   ├── niveaux/
│   └── pages/
├── html/           Pages du jeu et des niveaux 1 à 30
└── js/
    ├── bosses/     Contrôleurs des combats
    ├── niveaux/    Contrôleurs des niveaux et puzzles
    └── *.js        Modules partagés à la racine

documentation/
├── Info-fr.txt
└── cheminement-projet.md
```

Les pages de la campagne sont regroupées par blocs de cinq dans
`docs/html/partie-1_niveau-1_à_5/` à
`docs/html/partie-6_niveau-26_à_30/`.

Fichiers importants :

- `docs/js/save-system.js` : comptes, sauvegardes et clés débloquées ;
- `docs/js/niveaux/partie-1-puzzles.js` : puzzles des niveaux 1 à 10 ;
- `docs/css/niveaux/` : styles communs et un fichier par partie (1 à 6) ;
- `docs/js/bosses/` : contrôleurs des trois combats de boss ;
- `docs/js/key-fragments.js` : assemblage des fragments et cinématique de récompense ;
- `lag-fix/` : `fps-boost.js` et `fps-boost.css`, chargés sur toutes les pages ; mesurent les FPS et passent automatiquement en mode allégé (sans flou, ombres ni effets décoratifs) sous 45 FPS, et figent les animations quand l'onglet est masqué ;
- `docs/js/home-line.js` : ligne du haut de l'accueil, déformée par une impulsion (la ligne elle-même bouge) ;
- `docs/html/dev-mode.html`, `docs/js/dev-mode-page.js` et `docs/css/pages/dev-mode-page.css` : DEV MODE sous forme de page indépendante (code d'accès, navigation par partie, état du joueur, don/retrait des clés 1 à 6, skip de niveau, tout terminer, réinitialisation, compteur de FPS, copie de la sauvegarde, curseur à réticule) ;
- `docs/js/dev-mode.js` : version légère injectée sur chaque page, qui ne crée que le bouton « DEV MODE » et ouvre la page ci-dessus ;
- `docs/assets/svg/accueil/adaptatif/` : le même décor d'accueil en trois tailles (PC, tablette, mobile), choisi par `<picture>` dans `index.html` ;
- `script.js` : fond canvas de l'accueil et changement de langue FR/EN en place (sans rechargement, dictionnaire de l'autre langue préchargé au repos) ;
- `docs/js/ui-effects.js` et `docs/css/composants/ui-effects.css` : animations partagées, ambiance par niveau, panneau des clés et curseur premium ;
- `docs/css/composants/dev-mode.css` : styles DEV MODE, y compris les anciens styles UI ;
- `docs/assets/svg/cles/key-01-usb.svg` : visuel cyberpunk de la première clé ;
- `documentation/cheminement-projet.md` : historique fonctionnel et cheminement détaillé.

## Sauvegarde et développement

La progression est stockée localement par utilisateur. Le système prend en charge :

- création de compte et connexion locale ;
- sauvegarde automatique du niveau courant et de la progression ;
- points verts des niveaux terminés ;
- reprise de progression ;
- réinitialisation d'une nouvelle partie ;
- sauvegarde des clés de résonance ;
- mode développeur pour rejouer les scènes.

Les boutons de sauvegarde manuelle ont été retirés des niveaux et des boss :
la progression est enregistrée automatiquement par les contrôleurs, tandis que
les récompenses et validations de boss conservent leurs propres sauvegardes.

Le paramètre `?dev=1` permet notamment de rejouer la scène Clé 01 sans considérer
la clé comme déjà récupérée.

## Direction artistique

ECHOES utilise une identité visuelle fondée sur :

- fonds sombres et grilles holographiques ;
- cyan, violet, vert néon et magenta ;
- typographie de terminal (titre ECHOES en monospace avec curseur clignotant et glitch rouge) ;
- orbites, halos et noyaux de résonance ;
- perturbations glitch limitées aux signaux d'ECHO ;
- interfaces centrées et adaptées au mobile.

## Validation

Les vérifications courantes du projet comprennent :

```bash
node --check docs/js/key-fragments.js
node --check docs/js/bosses/boss-01.js
git diff --check
```

Les dictionnaires sont séparés par langue (`translations.fr.js`, `translations.en.js`) :
`translations.js` ne charge que la langue choisie.

Les parcours principaux sont également vérifiés dans un navigateur : navigation,
dialogues, progression, sauvegarde de clé, responsive et liens locaux.

## Documentation complémentaire

Pour le détail des jalons, des mécaniques et des commits fonctionnels, consulter
[`documentation/cheminement-projet.md`](documentation/cheminement-projet.md).

## Campagne et progression

- `docs/html/login.html` : nom d'utilisateur seul (identifiant unique de la sauvegarde, `localStorage`).
- `docs/html/niveaux.html` : grille des niveaux, progression globale et réinitialisation avec confirmation.
- `docs/js/levels-config.js` : structure de la campagne. Pour ajouter des niveaux, éditer `series` et mettre `ready: true` quand les pages existent.
- `docs/js/level-guard.js` : bloque les niveaux verrouillés et enregistre leur réussite. Contournement dev : `localStorage.setItem("echoes-dev-unlock", "1")`.
