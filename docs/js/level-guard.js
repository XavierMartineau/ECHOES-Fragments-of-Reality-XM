// LEVEL GUARD // bloque les niveaux verrouillés et enregistre chaque niveau terminé.
(() => {
  // Fond animé de la partie (voir scene-bg.js).
  if (document.currentScript) {
    const scene = document.createElement("script");
    scene.src = new URL("scene-bg.js?v=3", document.currentScript.src).href;
    document.body.appendChild(scene);
  }

  const levels = window.EchoesLevels;
  const save = window.EchoesSave;
  if (!levels || !save) return;

  // Mode développeur : les pages archivées restent accessibles avec le raccourci développeur.
  const devModeUnlocked =
    localStorage.getItem("echoes-dev-unlock") === "1" ||
    sessionStorage.getItem("echoes-dev-unlock") === "1";

  const item = levels.itemForPath();
  if (!item) {
    if (
      !devModeUnlocked &&
      /(?:niveau|boss)-\d+\.html$/i.test(window.location.pathname)
    ) {
      window.location.replace(levels.hubUrl);
    }
    return;
  }

  const username = save.getCurrentUser();
  if (!devModeUnlocked && !username) {
    window.location.replace(levels.loginUrl);
    return;
  }
  if (!devModeUnlocked && !levels.canOpen(item.id, username)) {
    window.location.replace(levels.hubUrl);
    return;
  }

  // Animation de réussite unique par niveau (voir level-victory.js).
  if (!devModeUnlocked && document.currentScript) {
    const style = document.createElement("link");
    style.rel = "stylesheet";
    style.href = new URL("../css/composants/level-victory.css?v=2", document.currentScript.src).href;
    document.head.appendChild(style);
    const effect = document.createElement("script");
    effect.src = new URL("level-victory.js?v=3", document.currentScript.src).href;
    document.body.appendChild(effect);
  }

  const progressMarkers = new Map();
  const serie = levels.series.find((entry) => entry.id === item.series);
  if (item.type === "level" && serie?.levels) {
    const seriesPosition = item.number - serie.start + 1;
    const language =
      localStorage.getItem("echoes-language") === "en" ? "en" : "fr";
    const levelWord = language === "en" ? "Level" : "Niveau";
    const nextWord = language === "en" ? "LEVEL" : "NIVEAU";
    const levelLabel = `${levelWord} ${String(item.displayNumber).padStart(2, "0")}`;
    document.title = `ECHOES - ${levelLabel}`;

    const heading = document.querySelector(
      '[data-i18n="level"], [data-copy="level"], #levelLabel, .level-meta > strong',
    );
    if (heading) heading.textContent = levelLabel;
    const partHeading = document.querySelector(
      '[data-i18n="part"], [data-copy="part"], #partLabel',
    );
    if (partHeading) {
      const partName =
        typeof serie.name === "string" ? serie.name : serie.name[language];
      partHeading.textContent = language === "en"
        ? `PART ${item.series} // ${partName.toUpperCase()}`
        : `PARTIE ${item.series} // ${partName.toUpperCase()}`;
    }

    const counter =
      document.querySelector(
        '#footerProgress, [data-i18n="counter"], [data-copy="counter"]',
      ) ||
      [...document.querySelectorAll(".level-footer > span")].find((element) =>
        /^\s*\d+\s*\/\s*\d+\s*$/.test(element.textContent),
      );
    if (counter) counter.textContent = `${seriesPosition} / ${serie.levels.length}`;
    const nextButton = document.getElementById("nextLevelButton");
    if (nextButton) {
      if (seriesPosition < serie.levels.length) {
        nextButton.textContent = nextButton.textContent.replace(
          /\b(?:NIVEAU|LEVEL)\s+\d+\b/i,
          `${nextWord} ${item.number + 1}`,
        );
      } else if (serie.boss && /\b(?:NIVEAU|LEVEL)\s+\d+\b/i.test(nextButton.textContent)) {
        nextButton.textContent =
          language === "en" ? "FACE THE BOSS" : "AFFRONTER LE BOSS";
      }
    }

    const progress = document.getElementById("levelProgress");
    if (progress) {
      const progressItems = username ? levels.getProgress(username).items : [];
      const stateById = new Map(
        progressItems.map((entry) => [entry.id, entry.state]),
      );
      progress.replaceChildren();
      serie.levels.forEach((number, index) => {
        const id = `level-${number}`;
        const state = stateById.get(id);
        const marker = document.createElement("span");
        marker.className = `level-square${state === "completed" ? " completed" : ""}${id === item.id ? " current" : ""}`;
        marker.setAttribute("aria-label", `${levelWord} ${index + 1}`);
        progress.appendChild(marker);
        progressMarkers.set(id, marker);
      });
      progress.setAttribute(
        "aria-label",
        language === "en"
            ? `Progress for levels ${serie.start} to ${serie.end}`
            : `Progression des niveaux ${serie.start} à ${serie.end}`,
      );
    }
  }

  if (item.type === "level" && serie?.levels?.includes(item.number)) {
    const panel = document.querySelector(".puzzle-panel");
    if (panel) {
      const language =
        localStorage.getItem("echoes-language") === "en" ? "en" : "fr";
      const levelName = language === "en" ? "LEVEL" : "NIVEAU";
      const startButton = document.getElementById("startPuzzleButton");
      // One example group per campaign part, in the same order as `series`.
      const examples = [
        [
          {
            fr: "Repère la règle qui relie les termes pour trouver le nombre manquant.",
            en: "Find the rule connecting the terms to work out the missing number.",
            steps: [
              { fr: "La première suite augmente de cinq à chaque étape.", en: "The first sequence increases by five at each step.", tokens: ["4", "9", "14", "19", "?"] },
              { fr: "Ajoute 5 au dernier terme : 19 + 5 = 24.", en: "Add 5 to the last term: 19 + 5 = 24.", tokens: ["19", "+ 5", "→", "24"] },
            ],
          },
          {
            fr: "Récupère les trois éclats avant de rejoindre la sortie ; les murs bloquent le passage.",
            en: "Collect all three shards before reaching the exit; walls block your path.",
            steps: [
              { fr: "Déplace le joueur vers une case voisine libre.", en: "Move the player to a neighboring open cell.", tokens: ["DÉPART", "→", "◆", "→", "CASE LIBRE"] },
              { fr: "Ramasse les trois éclats pour déverrouiller la sortie.", en: "Collect all three shards to unlock the exit.", tokens: ["✦", "✦", "✦", "→", "◎ SORTIE"] },
            ],
          },
          {
            fr: "Déchiffre le message en reculant chaque lettre de trois rangs dans l'alphabet.",
            en: "Decode the message by moving each letter three places back in the alphabet.",
            steps: [
              { fr: "Recule chaque lettre de trois rangs : HFKR devient ECHO.", en: "Move each letter back three places: HFKR becomes ECHO.", tokens: ["HFKR", "−3", "→", "ECHO"] },
              { fr: "Applique le même décalage aux trois messages.", en: "Apply the same shift to all three messages.", tokens: ["V→S", "L→I", "J→G", "Q→N", "D→A", "O→L"] },
            ],
          },
          {
            fr: "Fais glisser une tuile voisine dans la case vide pour remettre les nombres de 1 à 8 en ordre.",
            en: "Slide a neighboring tile into the empty space to put numbers 1 through 8 in order.",
            steps: [
              { fr: "La tuile 8 touche la case vide : tu peux la faire glisser à gauche.", en: "Tile 8 touches the empty space, so you can slide it left.", tokens: ["1", "2", "3", "4", "5", "6", "7", "□", "8"], layout: "grid-3" },
              { fr: "Le but est d'ordonner les tuiles, avec le vide en dernière case.", en: "Arrange the tiles in order, leaving the empty space in the last cell.", tokens: ["1", "2", "3", "4", "5", "6", "7", "8", "□"], layout: "grid-3" },
            ],
          },
          {
            fr: "Retourne deux cartes à la fois : conserve les paires identiques et mémorise les autres positions.",
            en: "Turn over two cards at a time: keep matching pairs and remember the other positions.",
            steps: [
              { fr: "Deux symboles identiques forment une paire.", en: "Two identical symbols make a pair.", tokens: ["✦", "✦", "✓"] },
              { fr: "Si les symboles diffèrent, les cartes se referment : retiens leur emplacement.", en: "If the symbols differ, the cards turn face down again; remember where they were.", tokens: ["◈", "≠", "☾", "↻"] },
            ],
          },
        ],
        [
          {
            fr: "Les indices séparent les couleurs bien placées des couleurs présentes au mauvais endroit.",
            en: "Feedback separates colors in the right place from colors in the wrong place.",
            steps: [
              { fr: "Compose une proposition de cinq couleurs différentes.", en: "Build a guess from five different colors.", tokens: ["●", "◆", "▲", "★", "?" ] },
              { fr: "Lis les deux compteurs, puis change l'ordre sans répéter une couleur.", en: "Read both counters, then change the order without repeating a color.", tokens: ["POSITION", "COULEUR", "ORDRE", "↻"] },
            ],
          },
          {
            fr: "Un indice décrit des groupes de cases allumées. Une case vide sépare toujours deux groupes.",
            en: "A clue describes runs of lit cells. One empty cell always separates two runs.",
            steps: [
              { fr: "L'indice 2 1 donne deux cases, une pause, puis une case.", en: "The clue 2 1 means two cells, a gap, then one cell.", tokens: ["2 1", "■", "■", "·", "■"] },
              { fr: "Croise l'indice de la ligne avec ceux des colonnes.", en: "Cross-check the row clue against the column clues.", tokens: ["LIGNE", "↕", "COLONNE", "✓"] },
            ],
          },
          {
            fr: "Chaque miroir renvoie le faisceau selon son orientation ; certains miroirs ne servent pas au bon trajet.",
            en: "Each mirror reflects the beam according to its angle; some mirrors are decoys.",
            steps: [
              { fr: "Le faisceau avance jusqu'au miroir et change de direction.", en: "The beam travels to a mirror and changes direction.", tokens: ["▶", "→", "/", "↑", "◎"] },
              { fr: "Teste le trajet, puis ne pivote que les miroirs traversés.", en: "Test the beam, then rotate only mirrors it reaches.", tokens: ["MIROIR", "↻", "FAISCEAU", "→"] },
            ],
          },
          {
            fr: "Déplace un disque à la fois ; un disque plus grand ne peut jamais reposer sur un plus petit.",
            en: "Move one disk at a time; a larger disk can never sit on a smaller one.",
            steps: [
              { fr: "Le plus petit disque peut changer de tour librement.", en: "The smallest disk can move freely between towers.", tokens: ["●", "A", "→", "B"] },
              { fr: "Libère le disque inférieur avant de le déplacer.", en: "Clear the smaller disks before moving a larger one.", tokens: ["●", "●●", "●●●", "→"] },
            ],
          },
          {
            fr: "Un chiffre ne se répète ni dans sa ligne, ni dans sa colonne, ni dans son bloc de 2 × 3.",
            en: "A digit cannot repeat in its row, column, or 2 × 3 box.",
            steps: [
              { fr: "Cherche un chiffre absent de la ligne et de la colonne.", en: "Look for a digit missing from both the row and column.", tokens: ["LIGNE", "1 2 _", "COLONNE", "✓"] },
              { fr: "Vérifie aussi les six cases du bloc avant de le placer.", en: "Check the six cells in the box before placing it.", tokens: ["2 × 3", "1 2 3", "4 5 6"] },
            ],
          },
        ],
        [
          {
            fr: "Mémorise l'ordre des formes sur les deux lignes, puis replace-les sans aide visuelle.",
            en: "Memorize the shapes on both lines, then place them again without visual hints.",
            steps: [
              { fr: "Observe les deux rangées de symboles.", en: "Study both rows of symbols.", tokens: ["▲", "●", "◆", "✦", "▲", "●", "◆", "✦"], layout: "grid-4" },
              { fr: "Reproduis chaque rangée dans le même ordre.", en: "Recreate each row in the same order.", tokens: ["▲", "●", "◆", "✦", "▲", "●", "◆", "✦"], layout: "grid-4" },
            ],
          },
          {
            fr: "Observe la séquence lumineuse, puis reproduis-la dans le même ordre.",
            en: "Watch the light sequence, then repeat it in the same order.",
            steps: [
              { fr: "Mémorise les impulsions avant qu'elles s'éteignent.", en: "Memorize the pulses before they go dark.", tokens: ["●", "▲", "◆", "✦"] },
              { fr: "Clique sur les mêmes symboles, du premier au dernier.", en: "Click the same symbols from first to last.", tokens: ["●", "→", "▲", "→", "◆", "→", "✦"] },
            ],
          },
          {
            fr: "Fais glisser les tuiles voisines de la case vide pour remettre les nombres en ordre.",
            en: "Slide tiles next to the empty space to put the numbers in order.",
            steps: [
              { fr: "Seule une tuile adjacente à la case vide peut bouger.", en: "Only a tile next to the empty space can move.", tokens: ["1", "2", "3", "4", "5", "6", "7", "□", "8"], layout: "grid-3" },
              { fr: "Range les nombres de gauche à droite et de haut en bas.", en: "Arrange the numbers from left to right and top to bottom.", tokens: ["1", "2", "3", "4", "5", "6", "7", "8", "□"], layout: "grid-3" },
            ],
          },
          {
            fr: "Active le faisceau et oriente les miroirs pour guider la lumière jusqu'au récepteur.",
            en: "Turn on the beam and rotate mirrors to guide the light to the receiver.",
            steps: [
              { fr: "Le miroir dévie le faisceau selon son orientation.", en: "The mirror redirects the beam according to its orientation.", tokens: ["ÉMETTEUR", "→", "/", "↗", "◎"] },
              { fr: "Teste le trajet et ajuste les miroirs qui bloquent la route.", en: "Test the route and adjust mirrors blocking the beam.", tokens: ["FAISCEAU", "→", "MIROIR", "↻", "RÉCEPTEUR"] },
            ],
          },
          {
            fr: "Relie chaque balise à celle de même couleur en traçant un chemin sinueux.",
            en: "Connect each beacon to the one with the same color using a winding path.",
            steps: [
              { fr: "Commence à une balise et suis les cases voisines.", en: "Start at one beacon and follow adjacent cells.", tokens: ["●", "→", "□", "↘", "●"] },
              { fr: "Rejoins la balise assortie sans croiser les autres chemins.", en: "Reach its matching beacon without crossing other paths.", tokens: ["●", "╲", "╱", "✓", "●"] },
            ],
          },
        ],
        [
          {
            fr: "Déduis la valeur des symboles, puis saisis les résultats numériques dans l'ordre.",
            en: "Work out each symbol's value, then enter the numerical results in order.",
            steps: [
              { fr: "Un même symbole représente toujours la même valeur.", en: "The same symbol always represents the same value.", tokens: ["● + ●", "=", "8"] },
              { fr: "Résous les opérations et inscris uniquement les chiffres.", en: "Solve the equations and enter digits only.", tokens: ["● = 4", "◆ = ?", "→", "CODE"] },
            ],
          },
          {
            fr: "Déplace les masses vers les plateaux ou la réserve pour équilibrer les deux côtés.",
            en: "Move weights to the pans or reserve until both sides balance.",
            steps: [
              { fr: "Additionne les masses de chaque plateau.", en: "Add the weights on each pan.", tokens: ["3", "+", "5", "=", "8"] },
              { fr: "Déplace les poids jusqu'à obtenir deux totaux égaux.", en: "Move weights until both totals are equal.", tokens: ["GAUCHE 8", "=", "DROITE 8"] },
            ],
          },
          {
            fr: "Transfère les disques d'une tour à une autre en respectant leur taille.",
            en: "Move the disks from one tower to another while respecting their sizes.",
            steps: [
              { fr: "Déplace uniquement le disque placé au sommet.", en: "Move only the disk at the top of a tower.", tokens: ["SOMMET", "●", "→", "TOUR"] },
              { fr: "Ne pose jamais un grand disque sur un disque plus petit.", en: "Never place a larger disk on a smaller one.", tokens: ["●", "●●", "✕", "●●●"] },
            ],
          },
          {
            fr: "Trouve les mots dans la grille, puis compose le code avec les lettres numérotées.",
            en: "Find words in the grid, then build the code from the numbered letters.",
            steps: [
              { fr: "Repère un mot en ligne, en colonne ou en diagonale.", en: "Find a word across, down, or diagonally.", tokens: ["G", "A", "L", "A", "X", "I", "E"] },
              { fr: "Sélectionne le début et la fin des mots, puis lis le code.", en: "Select each word's first and last letters, then read the code.", tokens: ["1", "→", "2", "→", "…", "7"] },
            ],
          },
          {
            fr: "Chaque impulsion inverse la case choisie et ses voisines horizontales et verticales.",
            en: "Each pulse toggles the chosen cell and its horizontal and vertical neighbors.",
            steps: [
              { fr: "Une impulsion centrale modifie les cinq cases en croix.", en: "A center pulse changes the five cells in a cross.", tokens: ["·", "■", "·", "■", "✦", "■", "·", "■", "·"], layout: "grid-3" },
              { fr: "Trouve les impulsions qui éteignent toute la grille.", en: "Find the pulses that switch off the whole grid.", tokens: ["IMPULSION", "→", "VOISINES", "→", "ÉTEINT"] },
            ],
          },
        ],
        [
          {
            fr: "Lis le code transmis, puis saisis toutes ses lettres dans l'ordre inverse.",
            en: "Read the transmitted code, then enter all its letters in reverse order.",
            steps: [
              { fr: "Inverse la séquence complète : ECHO devient OHCE.", en: "Reverse the full sequence: ECHO becomes OHCE.", tokens: ["ECHO", "↶", "OHCE"] },
              { fr: "Répète l'opération pour chaque transmission.", en: "Repeat the process for each transmission.", tokens: ["CODE 1", "→", "CODE INVERSÉ"] },
            ],
          },
          {
            fr: "Replace les fragments pour synchroniser les trois lignes holographiques.",
            en: "Reposition the fragments to synchronize all three holographic lines.",
            steps: [
              { fr: "Les trois lignes doivent afficher le même ordre de formes.", en: "All three lines must show the same shape order.", tokens: ["●", "▲", "◆", "●", "▲", "◆", "●", "▲", "◆"], layout: "grid-3" },
              { fr: "Aligne chaque fragment à son emplacement correspondant.", en: "Align each fragment with its matching position.", tokens: ["LIGNE 1", "=", "LIGNE 2", "=", "LIGNE 3"] },
            ],
          },
          {
            fr: "Attends la pulsation lumineuse et clique au bon moment pour maintenir le rythme.",
            en: "Wait for the light pulse and click at the right moment to keep the rhythm.",
            steps: [
              { fr: "Observe le pulseur et attends qu'il s'allume.", en: "Watch the pulse and wait for it to light up.", tokens: ["ATTENDS", "◌", "●"] },
              { fr: "Clique pendant la pulsation pour valider le battement.", en: "Click during the pulse to register the beat.", tokens: ["●", "→", "CLIC", "→", "✓"] },
            ],
          },
          {
            fr: "Oriente les miroirs holographiques pour guider le rayon jusqu'au récepteur.",
            en: "Rotate the holographic mirrors to guide the beam to the receiver.",
            steps: [
              { fr: "Le rayon change de direction lorsqu'il touche un miroir.", en: "The beam changes direction when it hits a mirror.", tokens: ["ÉMETTEUR", "→", "/", "↗", "◎"] },
              { fr: "Ajuste les miroirs traversés jusqu'à atteindre la cible.", en: "Adjust the mirrors in the route until the beam reaches its target.", tokens: ["RAYON", "→", "MIROIR", "↻", "CIBLE"] },
            ],
          },
          {
            fr: "Attrape les symboles flottants un par un et dépose chacun dans l'emplacement correspondant.",
            en: "Catch the floating symbols one at a time and place each in its matching slot.",
            steps: [
              { fr: "Fais glisser un symbole vers son emplacement.", en: "Drag a symbol to its matching slot.", tokens: ["✦", "→", "EMPLACEMENT", "✓"] },
              { fr: "Trie les dix symboles avant que le réseau ne les disperse.", en: "Sort all ten symbols before the network scatters them.", tokens: ["10 SYMBOLES", "→", "10 CIBLES"] },
            ],
          },
        ],
        [
          {
            fr: "Lance le dé pour avancer, puis résous le défi visuel de la case où tu arrives.",
            en: "Roll to move, then solve the visual challenge on the tile you land on.",
            steps: [
              { fr: "Sur une échelle, une bonne réponse te fait monter ; un serpent te fait descendre.", en: "A correct answer climbs a ladder; a snake sends you back down.", tokens: ["DÉ", "→", "CASE", "▲ / ▼"] },
              { fr: "Réussis les mini-puzzles pour atteindre la case 100.", en: "Solve the mini-puzzles to reach square 100.", tokens: ["PION", "→", "ÉNIGME", "→", "100"] },
            ],
          },
          {
            fr: "Relie le départ à l'arrivée en traversant les cinq checkpoints dans l'ordre exact.",
            en: "Connect the start to the exit through all five checkpoints in order.",
            steps: [
              { fr: "Passe par les checkpoints 1 à 5 sans en sauter.", en: "Visit checkpoints 1 through 5 without skipping any.", tokens: ["S", "→", "1", "→", "2", "→", "3", "→", "4", "→", "5", "→", "E"] },
              { fr: "Respecte exactement 25 déplacements et 7 virages.", en: "Use exactly 25 moves and 7 turns.", tokens: ["25 PAS", "·", "7 VIRAGES", "✓"] },
            ],
          },
          {
            fr: "Résous trois verrous visuels : recopie le code, sélectionne les formes demandées, puis classe les sphères par taille.",
            en: "Solve three visual locks: copy the code, select the requested shapes, then sort spheres by size.",
            steps: [
              { fr: "Chaque verrou demande une action différente.", en: "Each lock requires a different action.", tokens: ["CODE", "→", "FORMES", "→", "SPHÈRES"] },
              { fr: "Classe les sphères de la plus petite à la plus grande.", en: "Sort the spheres from smallest to largest.", tokens: ["●", "→", "●●", "→", "●●●"] },
            ],
          },
          {
            fr: "Les indices des lignes et colonnes indiquent les groupes de cases actives du nonogramme.",
            en: "Row and column clues show the groups of filled cells in the nonogram.",
            steps: [
              { fr: "L'indice 2 1 signifie deux cases pleines, une vide, puis une pleine.", en: "The clue 2 1 means two filled cells, one empty, then one filled.", tokens: ["2 1", "■", "■", "·", "■"] },
              { fr: "Croise les indices horizontaux et verticaux pour trouver le motif.", en: "Cross-check row and column clues to find the pattern.", tokens: ["LIGNE", "↕", "COLONNE", "→", "MOTIF"] },
            ],
          },
          {
            fr: "Trace le trajet exact de S à E en suivant les checkpoints et sans revisiter de case.",
            en: "Trace the exact route from S to E through the checkpoints without revisiting cells.",
            steps: [
              { fr: "Passe par les checkpoints 1 à 5 dans l'ordre.", en: "Visit checkpoints 1 through 5 in order.", tokens: ["S", "→", "1", "→", "2", "→", "3", "→", "4", "→", "5", "→", "E"] },
              { fr: "Le trajet doit compter 28 déplacements et 5 virages.", en: "The route must contain 28 moves and 5 turns.", tokens: ["28 PAS", "·", "5 VIRAGES", "✓"] },
            ],
          },
        ],
      ];
      const example = examples[item.series - 1]?.[item.number - serie.start];
      const previousInertStates = [...panel.children].map((child) => [
        child,
        child.inert,
      ]);
      previousInertStates.forEach(([child]) => {
        child.inert = true;
      });

      const overlay = document.createElement("div");
      overlay.className = "level-challenge-launch";
      overlay.setAttribute("role", "group");
      overlay.setAttribute(
        "aria-label",
        language === "en"
          ? `Start part ${item.series}, level ${item.number}`
          : `Lancer la partie ${item.series}, niveau ${item.number}`,
      );
      overlay.innerHTML = `
        <div class="level-launch-card">
          <span class="level-launch-kicker">${language === "en" ? "CHALLENGE // READY" : "ÉPREUVE // PRÊTE"}</span>
          <span class="level-launch-emblem" aria-hidden="true">
            <svg viewBox="0 0 64 64" focusable="false">
              <path class="level-launch-emblem-frame" d="M32 3 55 16v27L32 61 9 43V16L32 3Z" />
              <circle class="level-launch-emblem-ring" cx="32" cy="27" r="11" />
              <path class="level-launch-emblem-key" d="M35.8 23.2a5.4 5.4 0 1 0-2.1 4.3L43 36.8h4.2v-4.2h-4.1v-4.1h-4.2l-1.6-1.6" />
              <path class="level-launch-emblem-spark" d="m14 13 3-4m33 4-3-4m-15-6v5" />
            </svg>
          </span>
          <p class="level-launch-title">${language === "en" ? `PART ${item.series} // ${levelName} ${item.displayNumber}` : `PARTIE ${item.series} // ${levelName} ${item.displayNumber}`}</p>
          <button class="level-launch-button" type="button">
            <span>${language === "en" ? "START CHALLENGE" : "LANCER LE DÉFI"}</span>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M4 12h15m-6-6 6 6-6 6" />
            </svg>
          </button>
          <p class="level-launch-caption">${language === "en" ? "ACTIVATE TO ENTER THE PUZZLE" : "ACTIVER POUR ENTRER DANS LE PUZZLE"}</p>
        </div>`;
      const exampleSection = document.createElement("section");
      exampleSection.className = "level-example";
      const exampleToggle = document.createElement("button");
      exampleToggle.className = "level-example-toggle";
      exampleToggle.type = "button";
      exampleToggle.setAttribute("aria-expanded", "true");
      exampleToggle.textContent =
        language === "en" ? "VISUAL EXAMPLE" : "EXEMPLE VISUEL";
      const exampleContent = document.createElement("div");
      exampleContent.className = "level-example-content";
      const exampleDescription = document.createElement("p");
      exampleDescription.className = "level-example-description";
      exampleDescription.textContent = example?.[language] || "";
      const exampleVisual = document.createElement("div");
      exampleVisual.className = "level-example-visual";
      exampleVisual.setAttribute("aria-live", "polite");
      const exampleStep = document.createElement("p");
      exampleStep.className = "level-example-step";
      const exampleNext = document.createElement("button");
      exampleNext.className = "level-example-next";
      exampleNext.type = "button";
      exampleNext.textContent =
        language === "en" ? "NEXT EXAMPLE STEP" : "ÉTAPE SUIVANTE";
      let stepIndex = 0;
      const showExampleStep = () => {
        const step = example?.steps[stepIndex];
        exampleStep.textContent = step?.[language] || "";
        exampleVisual.dataset.layout = step?.layout || "sequence";
        exampleVisual.replaceChildren(
          ...(step?.tokens || []).map((token, index) => {
            const chip = document.createElement("span");
            chip.className = `level-example-token level-example-token-${index % 4}`;
            chip.textContent = token;
            return chip;
          }),
        );
        exampleNext.textContent =
          language === "en"
            ? `NEXT STEP ${stepIndex + 1} / ${example?.steps.length || 0}`
            : `ÉTAPE ${stepIndex + 1} / ${example?.steps.length || 0}`;
      };
      exampleNext.addEventListener("click", () => {
        stepIndex = (stepIndex + 1) % (example?.steps.length || 1);
        showExampleStep();
      });
      exampleToggle.setAttribute(
        "aria-controls",
        `level-example-${item.series}-${item.displayNumber}`,
      );
      exampleContent.id = `level-example-${item.series}-${item.displayNumber}`;
      exampleToggle.addEventListener("click", () => {
        const expanded =
          exampleToggle.getAttribute("aria-expanded") !== "true";
        exampleToggle.setAttribute("aria-expanded", String(expanded));
        exampleContent.hidden = !expanded;
      });
      exampleContent.append(exampleDescription, exampleVisual, exampleStep, exampleNext);
      exampleSection.append(exampleToggle, exampleContent);
      overlay.querySelector(".level-launch-card").append(exampleSection);
      showExampleStep();
      panel.appendChild(overlay);

      const restorePanel = () => {
        previousInertStates.forEach(([child, wasInert]) => {
          child.inert = wasInert;
        });
        overlay.remove();
      };
      overlay
        .querySelector(".level-launch-button")
        .addEventListener("click", () => {
          panel
            .querySelector(".puzzle-actions")
            ?.prepend(exampleSection);
          restorePanel();
          if (!startButton || startButton.disabled) return;
          startButton.hidden = false;
          startButton.click();
          if (!startButton.hidden) startButton.hidden = true;
        });
      overlay.querySelector(".level-launch-button").focus();
    }
  }

  if (devModeUnlocked) return;

  const complete = () => {
    const completed = levels.markCompleted(item.id, username);
    if (completed) progressMarkers.get(item.id)?.classList.add("completed");
    return completed;
  };

  // Le bouton "niveau suivant" apparaît uniquement quand le niveau est réussi.
  document.addEventListener("DOMContentLoaded", () => {
    const next = document.getElementById("nextLevelButton");
    if (!next) return;
    if (!next.hidden) complete();
    new MutationObserver(() => {
      if (!next.hidden) complete();
    }).observe(next, { attributes: true, attributeFilter: ["hidden"] });
    next.addEventListener("click", complete);
  });
})();
