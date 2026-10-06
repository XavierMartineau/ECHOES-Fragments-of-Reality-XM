# ECHOES: Fragments of Reality

> Une expérience narrative cyberpunk où chaque puzzle restaure un fragment d'une
> réalité brisée.

ECHOES est un jeu web statique mêlant exploration, puzzles, narration interactive
et effets d'interface inspirés des terminaux cyberpunk. Le joueur est guidé par
**ECHO**, une intelligence fragmentée, et le **Voyageur**, qui traversent des
dimensions instables pour retrouver six clés de résonance.

## État actuel

- **Version de travail :** bêta v4
- **Partie jouable principale :** Partie 1, niveaux 1 à 10
- **Jalons narratifs :** boss `CLEE_01` / Clé 01 et boss `CLEE_02` / Clé 02
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
2. Ouvrir `docs/html/index.html` dans un navigateur, ou servir le dossier
   `docs/` avec un serveur statique local.
3. Pour tester rapidement une scène spéciale, ouvrir le **DEV MODE** dans le jeu.

Un serveur local est recommandé pour reproduire le comportement de GitHub Pages :

```bash
python -m http.server 8000 --directory docs
```

Puis ouvrir <http://localhost:8000/html/index.html>.

## Parcours et gameplay

### Partie 1 — Initiation

Les niveaux 1 à 10 introduisent progressivement les mécaniques :

1. alignement de formes ;
2. séquence lumineuse ;
3. classement géométrique ;
4. rotation holographique ;
5. séquence sonore ;
6. observation de motifs ;
7. porte lumineuse ;
8. séquence de couleurs ;
9. tri et constellation ;
10. séquence finale avant le boss.

Chaque niveau conserve sa progression, ses points verts et ses états de réussite.
Les niveaux déjà terminés restent rejouables.

### Boss et Clé 01

Après le niveau 10, le joueur affronte le Gardien du Signal dans
`boss-01.html`. Ce combat accessible comprend trois stages courts :
associer des sceaux, répéter une mélodie de trois symboles, puis cliquer le noyau
pendant deux halos verts. Le joueur dispose de six unités d’énergie et peut
recommencer sans passer par un niveau de récupération.
La victoire ouvre le niveau spécial `clee_01_cinematic.html` et l’obtention de la Clé 01.

Ce niveau rassemble en une seule scène :

- le dialogue automatique entre Voyageur et ECHO ;
- les répliques colorées du Voyageur et d'ECHO ;
- l'effet de signal glitché propre à ECHO ;
- l'apparition ponctuelle de la clé USB cyberpunk `CLEE_01` ;
- l'animation de la clé vers le HUD ;
- la sauvegarde de `resonance-1` ;
- le passage du compteur `0 / 6` à `1 / 6` ;
- l'indice final qui ouvre la suite du voyage.

### Boss de la Partie 2 — `boss-02.html`

Après le niveau 20, le joueur affronte l'Archonte des Fractures dans une arène
tactique à cases : il faut naviguer entre les murs, éviter les lignes d'impact
télégraphiées, stabiliser six ancres et gérer deux boucliers sur trois phases.
La victoire débloque la Clé 02 et ouvre le niveau 21.

## Organisation du dépôt

```text
docs/
├── assets/      Images, SVG et ressources visuelles
├── css/         Styles globaux, responsive et styles des parties
├── html/        Pages du jeu et niveaux
├── js/          Progression, sauvegarde, puzzles et mode développeur
└── data/        Données et contenus auxiliaires

documentation/
├── Info-fr.txt
└── cheminement-projet.md
```

Fichiers importants :

- `docs/js/save-system.js` : comptes, sauvegardes et clés débloquées ;
- `docs/js/partie-1_niveau-1_à_10.js` : progression et routage de la Partie 1 ;
- `docs/js/key-transition.js` : dialogue, récupération et animation de Clé 01 ;
- `docs/js/dev-mode.js` : accès développeur aux niveaux et scènes spéciales ;
- `docs/assets/images/key-01-usb.svg` : visuel cyberpunk de la première clé ;
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
node --check docs/js/key-transition.js
git diff --check
```

Les parcours principaux sont également vérifiés dans un navigateur : navigation,
dialogues, progression, sauvegarde de clé, responsive et liens locaux.

## Documentation complémentaire

Pour le détail des jalons, des mécaniques et des commits fonctionnels, consulter
[`documentation/cheminement-projet.md`](documentation/cheminement-projet.md).
