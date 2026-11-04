# Documentation du projet

Ce dossier contient les pages, styles, scripts et ressources du jeu ECHOES.

## Arborescence

```text
assets/
├── images/
└── svg/
    ├── accueil/
    ├── animations-depart/
    ├── cles/
    ├── connexion/
    ├── ia/
    ├── identite/
    └── motifs/
css/
├── base/          Polices et règles responsive
├── bosses/
├── composants/
├── niveaux/
└── pages/
html/
├── partie-1_niveau-1_à_5/ à partie-6_niveau-26_à_30/
└── partie-bonus/  Niveaux 31 à 60, accessibles par le DEV MODE
js/
├── bosses/
├── niveaux/
└── scripts partagés à la racine
```

Les contrôleurs de niveaux sont dans `js/niveaux/`, les combats dans
`js/bosses/` et les services communs (sauvegarde, progression, traductions,
interface) restent dans `js/`.

## Sauvegarde

La progression est enregistrée automatiquement. Les boutons « Save » ont été
supprimés des niveaux et des boss ; les sauvegardes de progression, de réussite
et de récompenses restent gérées par les contrôleurs et `js/save-system.js`.

## Parcours

Les six parties principales couvrent les niveaux 1 à 30, par groupes de cinq.
