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
- **Niveaux bonus :** niveaux 31 à 60, accessibles depuis le DEV MODE
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
Les niveaux déjà terminés restent rejouables. Les niveaux 31 à 60 sont des
niveaux bonus : ils ne figurent pas dans le parcours principal et se lancent
depuis la navigation du DEV MODE.

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
principale. Les niveaux bonus restent accessibles depuis le DEV MODE.

## Organisation du dépôt

```text
docs/
├── assets/      Images, SVG et ressources visuelles
├── css/         Styles globaux, responsive et styles des parties
├── html/        Pages du jeu, six parties et niveaux bonus 31 à 60
├── js/          Progression, sauvegarde, puzzles et mode développeur
└── data/        Données et contenus auxiliaires

documentation/
├── Info-fr.txt
└── cheminement-projet.md
```

Les pages de la campagne sont regroupées par blocs de cinq dans
`docs/html/partie-1_niveau-1_à_5/` à
`docs/html/partie-6_niveau-26_à_30/`. Les pages 31 à 60 se trouvent dans
`docs/html/partie-bonus/`.

Fichiers importants :

- `docs/js/save-system.js` : comptes, sauvegardes et clés débloquées ;
- `docs/js/partie-1-puzzles.js` : nouveaux puzzles des niveaux 1 à 10 ;
- `docs/js/partie-1_niveau-1_à_10.js` : anciens contrôleurs et utilitaires du premier arc ;
- `docs/js/key-fragments.js` : assemblage des fragments et cinématique de récompense ;
- `docs/js/dev-mode.js` : accès développeur aux niveaux et scènes spéciales ;
- `docs/assets/svg/key-01-usb.svg` : visuel cyberpunk de la première clé ;
- `documentation/cheminement-projet.md` : historique fonctionnel et cheminement détaillé.

## Sauvegarde et développement

La progression est stockée localement par utilisateur. Le système prend en charge :

- création de compte et connexion locale ;
- sauvegarde du niveau courant ;
- points verts des niveaux terminés ;
- reprise de progression ;
- réinitialisation d'une nouvelle partie ;
- sauvegarde des clés de résonance ;
- mode développeur pour rejouer les scènes.

Le paramètre `?dev=1` permet notamment de rejouer la scène Clé 01 sans considérer
la clé comme déjà récupérée.

## Direction artistique

ECHOES utilise une identité visuelle fondée sur :

- fonds sombres et grilles holographiques ;
- cyan, violet, vert néon et magenta ;
- typographie de terminal ;
- orbites, halos et noyaux de résonance ;
- perturbations glitch limitées aux signaux d'ECHO ;
- interfaces centrées et adaptées au mobile.

## Validation

Les vérifications courantes du projet comprennent :

```bash
node --check docs/js/key-fragments.js
node --check docs/js/boss-01.js
git diff --check
```

Les parcours principaux sont également vérifiés dans un navigateur : navigation,
dialogues, progression, sauvegarde de clé, responsive et liens locaux.

## Documentation complémentaire

Pour le détail des jalons, des mécaniques et des commits fonctionnels, consulter
[`documentation/cheminement-projet.md`](documentation/cheminement-projet.md).

## Campagne et progression

- `docs/html/login.html` : nom d'utilisateur seul (identifiant unique de la sauvegarde, `localStorage`).
- `docs/html/niveaux.html` : grille des niveaux, progression globale, bouton de r?initialisation (avec confirmation).
- `docs/js/levels-config.js` : structure de la campagne. Pour ajouter des niveaux, ?diter `series` (et mettre `ready: true` quand les pages existent).
- `docs/js/level-guard.js` : bloque les niveaux verrouill?s et enregistre la r?ussite (apparition du bouton ? niveau suivant ?). Contournement dev : `localStorage.setItem("echoes-dev-unlock", "1")`.
