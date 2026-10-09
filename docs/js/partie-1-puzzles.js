// PART 1 // Ten redesigned challenges, from deduction to constraint solving.
(() => {
  const match = window.location.pathname.match(/niveau-(\d+)\.html$/i);
  const level = Number(match?.[1]);
  if (!Number.isInteger(level) || level < 1 || level > 10) return;

  const language = localStorage.getItem("echoes-language") === "en" ? "en" : "fr";
  const copy = {
    fr: {
      part: "PARTIE 1 // RUPTURE",
      footer: "ÉCHO // PROTOCOLE DE STABILISATION",
      start: "LANCER LE DÉFI",
      reset: "RECOMMENCER",
      save: "SAUVEGARDER",
      saved: "SAUVEGARDÉ",
      continue: (number) =>
        number === 10 ? "AFFRONTER LE GARDIEN" : `CONTINUER VERS LE NIVEAU ${number + 1}`,
      completed: "Défi résolu. Le fragment est stabilisé.",
      progress: "Progression du défi",
      levels: [
        {
          eyebrow: "Fragment 001 // Déduction",
          title: "La suite impossible",
          description:
            "ECHO a perdu la clé de synchronisation. Résous trois suites logiques, de plus en plus complexes, sans te fier aux formes.",
          system: "SYSTEME:: TROIS SEQUENCES // LOGIQUE REQUISE",
          puzzle: "Séquences à déduire",
          ready: "Repère la règle, puis sélectionne le prochain nombre.",
        },
        {
          eyebrow: "Fragment 002 // Navigation",
          title: "Le labyrinthe des débris",
          description:
            "Traverse la grille jusqu'au noyau sans toucher les débris. Chaque détour compte : les commandes directionnelles et les flèches du clavier fonctionnent.",
          system: "SYSTEME:: NAVIGATION MANUELLE // NOYAU LOCALISE",
          puzzle: "Trajet du noyau",
          ready: "Lance le défi, puis trouve un chemin jusqu'à la sortie.",
        },
        {
          eyebrow: "Fragment 003 // Cryptanalyse",
          title: "Le chiffre d'ECHO",
          description:
            "Trois messages ont été chiffrés par décalage alphabétique. Détermine le décalage, puis retrouve le message original.",
          system: "SYSTEME:: CANAL CRYPTE // TROIS MESSAGES",
          puzzle: "Décryptage de fréquence",
          ready: "Applique le décalage indiqué et choisis le mot décodé.",
        },
        {
          eyebrow: "Fragment 004 // Reconstruction",
          title: "Le cœur fracturé",
          description:
            "Réassemble le noyau en faisant glisser les fragments dans le bon ordre. Le vide est la seule case mobile.",
          system: "SYSTEME:: MATRICE 3X3 // RECONSTRUCTION REQUISE",
          puzzle: "Taquin quantique",
          ready: "Déplace les tuiles voisines du vide pour reconstruire l'image.",
        },
        {
          eyebrow: "Fragment 005 // Mémoire",
          title: "Les archives effacées",
          description:
            "Huit paires de glyphes sont dispersées dans les archives. Mémorise leur position : une erreur referme les deux cartes.",
          system: "SYSTEME:: 8 PAIRES // MEMOIRE VOLATILE",
          puzzle: "Archives jumelles",
          ready: "Retourne deux cartes à la fois et retrouve les huit paires.",
        },
        {
          eyebrow: "Fragment 006 // Déduction",
          title: "Le code du gardien",
          description:
            "Le gardien a verrouillé le signal avec quatre couleurs distinctes. Huit essais, et uniquement le nombre de couleurs bien placées ou déplacées, te séparent de la sortie.",
          system: "SYSTEME:: CODE A 4 POSITIONS // 8 ESSAIS MAXIMUM",
          puzzle: "Protocole Mastermind",
          ready: "Choisis quatre couleurs, puis déduis le code grâce aux indices.",
        },
        {
          eyebrow: "Fragment 007 // Logique visuelle",
          title: "La grille silencieuse",
          description:
            "Restaure le motif lumineux à l'aide des indices de lignes et de colonnes. Les cases vides comptent autant que les cases allumées.",
          system: "SYSTEME:: MATRICE 5X5 // INDICES DE LIGNE ET COLONNE",
          puzzle: "Nonogramme fractal",
          ready: "Reconstitue le motif. Clique une case pour la remplir, puis à nouveau pour la marquer vide.",
        },
        {
          eyebrow: "Fragment 008 // Réflexion",
          title: "Le corridor laser",
          description:
            "Oriente les miroirs pour guider le faisceau jusqu'au récepteur. Plusieurs miroirs sont des leurres : teste le trajet après chaque ajustement.",
          system: "SYSTEME:: FAISCEAU INSTABLE // RECEPTEUR HORS LIGNE",
          puzzle: "Optique de la rupture",
          ready: "Fais pivoter les miroirs, puis teste le trajet du laser.",
        },
        {
          eyebrow: "Fragment 009 // Planification",
          title: "Les tours du temps",
          description:
            "Déplace les quatre disques vers le socle opposé. Un grand disque ne peut jamais recouvrir un plus petit.",
          system: "SYSTEME:: 4 DISQUES // DEPLACEMENT MINIMAL : 15",
          puzzle: "Transfert temporel",
          ready: "Déplace la tour complète en respectant la règle de taille.",
        },
        {
          eyebrow: "Fragment 010 // Synthèse",
          title: "La matrice d'ECHO",
          description:
            "Le dernier verrou est une grille de logique. Complète chaque ligne, colonne et carré sans répéter de chiffre.",
          system: "SYSTEME:: MATRICE 4X4 // CONTRAINTES MULTIPLES",
          puzzle: "Sudoku de stabilisation",
          ready: "Complète la grille puis vérifie ta solution.",
        },
      ],
      rules: {
        sequence: "Trouve le terme suivant",
        maze: "Flèches directionnelles",
        cipher: "Message intercepté",
        memory: "Choisis deux cartes",
        mastermind: "Code proposé",
        nonogram: "Indices",
        laser: "Pivoter",
        hanoi: "Socle",
        sudoku: "Chiffre choisi",
        verify: "VÉRIFIER LA GRILLE",
        trace: "TESTER LE FAISCEAU",
        undo: "EFFACER LA DERNIÈRE COULEUR",
        selected: "Sélectionnée",
        exit: "SORTIE",
        start: "DÉPART",
        moves: "déplacements",
        attempts: "essais",
        exact: "bien placées",
        misplaced: "bonne couleur, mauvaise position",
        invalid: "Cette pièce ne peut pas être déplacée ici.",
        wrong: "Ce n'est pas encore la bonne réponse. Analyse les indices et réessaie.",
        matched: "Paire trouvée.",
        retry: "Les cartes ne correspondent pas. Réessaie.",
        locked: "Choisis d'abord une couleur.",
        fullGuess: "Renseigne les quatre positions avant de valider.",
        noRoute: "Le faisceau n'atteint pas le récepteur. Réoriente les miroirs.",
        mirror: "Miroir",
        target: "Récepteur",
        player: "Noyau",
        filled: "Remplie",
        empty: "Vide",
        unknown: "Inconnue",
        disk: "Disque",
        chosen: "Choisi",
        chooseNumber: "Choisis un chiffre, puis une case vide.",
        sudokuConflict: "La grille contient une contradiction.",
        sudokuIncomplete: "La grille est incomplète.",
        solvedSudoku: "La matrice est cohérente, le verrou est ouvert.",
        round: (n, total) => `Séquence ${n} / ${total}`,
        cardLabels: ["aurore", "comète", "cristal", "éclipse", "fractale", "nébuleuse", "orbite", "pulsar"],
      },
    },
    en: {
      part: "PART 1 // BREACH",
      footer: "ECHO // STABILIZATION PROTOCOL",
      start: "START CHALLENGE",
      reset: "RESTART",
      save: "SAVE",
      saved: "SAVED",
      continue: (number) =>
        number === 10 ? "FACE THE GUARDIAN" : `CONTINUE TO LEVEL ${number + 1}`,
      completed: "Challenge solved. The fragment is stable.",
      progress: "Challenge progress",
      levels: [
        {
          eyebrow: "Fragment 001 // Deduction",
          title: "The impossible sequence",
          description:
            "ECHO lost the synchronization key. Solve three increasingly complex logic sequences without relying on shapes.",
          system: "SYSTEM:: THREE SEQUENCES // LOGIC REQUIRED",
          puzzle: "Sequences to solve",
          ready: "Find the rule, then choose the next number.",
        },
        {
          eyebrow: "Fragment 002 // Navigation",
          title: "The debris maze",
          description:
            "Cross the grid to the core without hitting debris. Every detour counts. Use the direction controls or your keyboard arrows.",
          system: "SYSTEM:: MANUAL NAVIGATION // CORE LOCATED",
          puzzle: "Core route",
          ready: "Start the challenge, then find a path to the exit.",
        },
        {
          eyebrow: "Fragment 003 // Cryptanalysis",
          title: "ECHO's cipher",
          description:
            "Three messages were encrypted with an alphabet shift. Determine the shift, then recover the original message.",
          system: "SYSTEM:: ENCRYPTED CHANNEL // THREE MESSAGES",
          puzzle: "Frequency decryption",
          ready: "Apply the given shift and choose the decoded word.",
        },
        {
          eyebrow: "Fragment 004 // Reconstruction",
          title: "The fractured core",
          description:
            "Reassemble the core by sliding fragments into the right order. The empty square is the only movable space.",
          system: "SYSTEM:: 3X3 MATRIX // RECONSTRUCTION REQUIRED",
          puzzle: "Quantum sliding puzzle",
          ready: "Move tiles next to the empty space to rebuild the image.",
        },
        {
          eyebrow: "Fragment 005 // Memory",
          title: "The erased archive",
          description:
            "Eight pairs of glyphs are scattered through the archive. Memorize their positions: a mismatch hides both cards again.",
          system: "SYSTEM:: 8 PAIRS // VOLATILE MEMORY",
          puzzle: "Twin archive",
          ready: "Turn over two cards at a time and find all eight pairs.",
        },
        {
          eyebrow: "Fragment 006 // Deduction",
          title: "The guardian's code",
          description:
            "The guardian locked the signal with four distinct colors. Eight attempts and feedback on correct or misplaced colors stand between you and the exit.",
          system: "SYSTEM:: 4-POSITION CODE // 8 ATTEMPTS MAXIMUM",
          puzzle: "Mastermind protocol",
          ready: "Choose four colors, then deduce the code from the clues.",
        },
        {
          eyebrow: "Fragment 007 // Visual logic",
          title: "The silent grid",
          description:
            "Restore the light pattern using the row and column clues. Empty squares matter just as much as lit ones.",
          system: "SYSTEM:: 5X5 MATRIX // ROW AND COLUMN CLUES",
          puzzle: "Fractal nonogram",
          ready: "Rebuild the pattern. Click a square to fill it, then click again to mark it empty.",
        },
        {
          eyebrow: "Fragment 008 // Reflection",
          title: "The laser corridor",
          description:
            "Orient the mirrors to guide the beam to the receiver. Some mirrors are decoys: test the route after each adjustment.",
          system: "SYSTEM:: UNSTABLE BEAM // RECEIVER OFFLINE",
          puzzle: "Breach optics",
          ready: "Rotate the mirrors, then test the laser route.",
        },
        {
          eyebrow: "Fragment 009 // Planning",
          title: "The towers of time",
          description:
            "Move all four disks to the opposite pedestal. A larger disk can never be placed on a smaller one.",
          system: "SYSTEM:: 4 DISKS // MINIMUM MOVES: 15",
          puzzle: "Temporal transfer",
          ready: "Move the full tower while respecting disk size.",
        },
        {
          eyebrow: "Fragment 010 // Synthesis",
          title: "ECHO's matrix",
          description:
            "The final lock is a logic grid. Complete every row, column, and box without repeating a number.",
          system: "SYSTEM:: 4X4 MATRIX // MULTIPLE CONSTRAINTS",
          puzzle: "Stabilization sudoku",
          ready: "Complete the grid, then verify your solution.",
        },
      ],
      rules: {
        sequence: "Find the next term",
        maze: "Direction controls",
        cipher: "Intercepted message",
        memory: "Choose two cards",
        mastermind: "Current guess",
        nonogram: "Clues",
        laser: "Rotate",
        hanoi: "Pedestal",
        sudoku: "Selected number",
        verify: "VERIFY GRID",
        trace: "TEST BEAM",
        undo: "CLEAR LAST COLOR",
        selected: "Selected",
        exit: "EXIT",
        start: "START",
        moves: "moves",
        attempts: "attempts",
        exact: "correct position",
        misplaced: "right color, wrong position",
        invalid: "That piece cannot be moved there.",
        wrong: "That is not the answer yet. Study the clues and try again.",
        matched: "Pair found.",
        retry: "Those cards do not match. Try again.",
        locked: "Choose a color first.",
        fullGuess: "Fill all four positions before submitting.",
        noRoute: "The beam missed the receiver. Reorient the mirrors.",
        mirror: "Mirror",
        target: "Receiver",
        player: "Core",
        filled: "Filled",
        empty: "Empty",
        unknown: "Unknown",
        disk: "Disk",
        chosen: "Selected",
        chooseNumber: "Choose a number, then an empty cell.",
        sudokuConflict: "The grid contains a contradiction.",
        sudokuIncomplete: "The grid is incomplete.",
        solvedSudoku: "The matrix is consistent. The lock is open.",
        round: (n, total) => `Sequence ${n} / ${total}`,
        cardLabels: ["aurora", "comet", "crystal", "eclipse", "fractal", "nebula", "orbit", "pulsar"],
      },
    },
  }[language];

  const levelCopy = copy.levels[level - 1];
  const rules = copy.rules;
  const main = document.querySelector(".level-shell");
  const intro = main?.querySelector(".level-intro");
  const panel = main?.querySelector(".puzzle-panel");
  if (!main || !intro || !panel) return;

  document.documentElement.lang = language;
  document.title = `ECHOES - ${levelCopy.title}`;
  main.dataset.levelStart = "1";
  main.dataset.levelEnd = "10";
  intro.querySelector(".eyebrow").textContent = levelCopy.eyebrow;
  intro.querySelector("h1").textContent = levelCopy.title;
  intro.querySelector(".level-description").textContent = levelCopy.description;
  intro.querySelector(".volume-notice")?.remove();
  intro.querySelectorAll("[data-i18n]").forEach((element) => {
    element.removeAttribute("data-i18n");
  });
  intro.querySelector(".system-label").textContent = "SYSTEM://LOG";
  document.getElementById("systemMessage").textContent = levelCopy.system;
  document.querySelector(".level-meta > span").textContent = copy.part;
  document
    .querySelectorAll(".level-meta [data-i18n], .level-footer [data-i18n]")
    .forEach((element) => element.removeAttribute("data-i18n"));
  document
    .getElementById("levelProgress")
    .setAttribute(
      "aria-label",
      language === "en" ? "Progress for levels 1 to 10" : "Progression des niveaux 1 à 10",
    );
  document.querySelector(".level-meta > strong").textContent =
    `${language === "en" ? "LEVEL" : "NIVEAU"} ${String(level).padStart(2, "0")}`;
  document.querySelector(".level-footer > span:first-child").textContent =
    copy.footer;
  document.querySelector(".level-footer > span:last-child").textContent =
    `${level} / 60`;

  panel.className = "puzzle-panel redesigned-panel";
  panel.innerHTML = `
    <div class="panel-heading">
      <div>
        <p class="panel-kicker">PUZZLE // ${String(level).padStart(2, "0")}</p>
        <h2 id="puzzleTitle">${levelCopy.puzzle}</h2>
      </div>
      <span class="progress-readout" id="progressReadout">0 / 1</span>
    </div>
    <div class="puzzle-board redesigned-board" id="puzzleBoard"></div>
    <div class="challenge-toolbar" id="challengeToolbar"></div>
    <div class="puzzle-actions redesigned-actions">
      <button class="sequence-start-button" id="startPuzzleButton" type="button">${copy.start}</button>
      <p class="puzzle-status" id="puzzleStatus">${levelCopy.ready}</p>
      <button class="next-level-button" id="nextLevelButton" type="button" hidden>${copy.continue(level)}</button>
      <button class="reset-button" id="resetButton" type="button">${copy.reset}</button>
    </div>
  `;

  const board = document.getElementById("puzzleBoard");
  const toolbar = document.getElementById("challengeToolbar");
  const status = document.getElementById("puzzleStatus");
  const readout = document.getElementById("progressReadout");
  const startButton = document.getElementById("startPuzzleButton");
  const resetButton = document.getElementById("resetButton");
  const nextButton = document.getElementById("nextLevelButton");
  const saveButton = document.getElementById("saveGameButton");
  const accountId = window.EchoesSave?.getCurrentUser?.() || "guest";
  const progressKey = `echoes-completed-levels-${encodeURIComponent(accountId)}`;
  let completed = [];
  try {
    const current = JSON.parse(localStorage.getItem(progressKey) || "[]");
    const legacy = JSON.parse(
      localStorage.getItem("echoes-completed-levels") || "[]",
    );
    completed = [...new Set([...current, ...legacy].filter(
      (value) => Number.isInteger(value) && value >= 1 && value <= 60,
    ))];
  } catch (error) {
    console.warn("Could not read saved level progression.", error);
  }
  const wasCompleted = completed.includes(level);
  let started = false;
  let solved = false;
  let beginPuzzle = () => {};

  const setProgress = (current, total) => {
    readout.textContent = `${current} / ${total}`;
  };
  const setStatus = (message, kind = "") => {
    status.textContent = message;
    status.className = `puzzle-status${kind ? ` ${kind}` : ""}`;
  };
  const completeLevel = () => {
    if (solved) return;
    solved = true;
    setStatus(copy.completed, "success");
    if (!completed.includes(level)) completed.push(level);
    completed.sort((a, b) => a - b);
    localStorage.setItem(progressKey, JSON.stringify(completed));
    window.EchoesSave?.saveProgress({
      currentPage: `level-${level}`,
      currentLevel: level,
      completedLevels: completed,
    });
    nextButton.hidden = false;
    startButton.hidden = true;
    panel.classList.add("puzzle-completed");
    document.querySelectorAll(".level-square").forEach((square, index) => {
      if (index + 1 === level) square.classList.add("completed");
    });
  };
  const button = (label, className = "challenge-button") => {
    const element = document.createElement("button");
    element.type = "button";
    element.className = className;
    element.textContent = label;
    return element;
  };
  const label = (text, className = "challenge-label") => {
    const element = document.createElement("p");
    element.className = className;
    element.textContent = text;
    return element;
  };
  const randomize = (values) => {
    const shuffled = [...values];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[swapIndex]] = [
        shuffled[swapIndex],
        shuffled[index],
      ];
    }
    return shuffled;
  };
  const nextUrl =
    level === 10 ? "boss-01.html" : `niveau-${String(level + 1).padStart(2, "0")}.html`;
  nextButton.addEventListener("click", () => {
    window.location.href = nextUrl;
  });
  startButton.addEventListener("click", () => {
    if (solved) return;
    started = true;
    startButton.hidden = true;
    beginPuzzle();
  });
  resetButton.addEventListener("click", () => window.location.reload());
  saveButton.textContent = copy.save;
  saveButton.addEventListener("click", () => {
    const saved = window.EchoesSave?.saveProgress({
      currentPage: `level-${level}`,
      currentLevel: level,
      completedLevels: completed,
    });
    if (saved) saveButton.textContent = copy.saved;
  });
  for (let index = 1; index <= 10; index += 1) {
    const square = document.createElement("span");
    square.className = `level-square${index === level ? " current" : ""}${completed.includes(index) ? " completed" : ""}`;
    square.setAttribute(
      "aria-label",
      `${language === "en" ? "Level" : "Niveau"} ${index}`,
    );
    document.getElementById("levelProgress")?.appendChild(square);
  }
  if (wasCompleted) nextButton.hidden = false;

  // Level 1: three rule-based number sequences.
  if (level === 1) {
    const rounds = [
      { values: [4, 9, 14, 19], answer: 24, options: [22, 23, 24, 26], rule: language === "en" ? "Each term increases by the same amount." : "Chaque terme augmente de la même quantité." },
      { values: [2, 6, 12, 20], answer: 30, options: [28, 30, 32, 36], rule: language === "en" ? "The difference increases by two each time." : "L'écart augmente de deux à chaque étape." },
      { values: [3, 6, 12, 24], answer: 48, options: [36, 42, 48, 54], rule: language === "en" ? "Each term follows the same multiplicative rule." : "Chaque terme suit la même règle de multiplication." },
    ];
    let round = 0;
    const render = () => {
      const data = rounds[round];
      board.replaceChildren(
        label(`${rules.round(round + 1, rounds.length)} — ${data.rule}`),
      );
      const sequence = document.createElement("div");
      sequence.className = "logic-sequence";
      [...data.values, "?"].forEach((value) => {
        const item = document.createElement("span");
        item.className = "logic-term";
        item.textContent = value;
        sequence.appendChild(item);
      });
      board.append(sequence);
      const choices = document.createElement("div");
      choices.className = "logic-options";
      data.options.forEach((value) => {
        const answer = button(String(value));
        answer.addEventListener("click", () => {
          if (!started || solved) return;
          if (value !== data.answer) {
            answer.classList.add("is-wrong");
            setStatus(rules.wrong, "error");
            window.setTimeout(() => answer.classList.remove("is-wrong"), 450);
            return;
          }
          round += 1;
          setProgress(round, rounds.length);
          if (round === rounds.length) {
            completeLevel();
          } else {
            setStatus(
              language === "en" ? "Correct. The next pattern is more complex." : "Exact. Le prochain motif est plus complexe.",
              "success",
            );
            window.setTimeout(render, 500);
          }
        });
        choices.appendChild(answer);
      });
      board.appendChild(choices);
    };
    beginPuzzle = render;
    setProgress(0, rounds.length);
  }

  // Level 2: navigate a maze with keyboard or directional buttons.
  if (level === 2) {
    const maze = [
      "S.#....",
      "..#.#..",
      "....#..",
      ".##....",
      "...##.#",
      "#......",
      "...#..G",
    ];
    let player = [0, 0];
    const grid = document.createElement("div");
    grid.className = "maze-grid";
    board.append(label(language === "en" ? "Reach the exit without crossing a blocked cell." : "Atteins la sortie sans traverser les cases bloquées."));
    board.appendChild(grid);
    const render = () => {
      grid.replaceChildren();
      maze.forEach((row, y) =>
        [...row].forEach((cell, x) => {
          const tile = document.createElement("span");
          tile.className = `maze-cell${cell === "#" ? " is-wall" : ""}${cell === "G" ? " is-goal" : ""}`;
          if (player[0] === x && player[1] === y) {
            tile.classList.add("is-player");
            tile.textContent = "◆";
            tile.setAttribute("aria-label", rules.player);
          } else if (cell === "G") {
            tile.textContent = "◎";
            tile.setAttribute("aria-label", rules.exit);
          } else if (cell === "#") {
            tile.setAttribute("aria-label", language === "en" ? "Blocked" : "Bloquée");
          } else {
            tile.setAttribute("aria-hidden", "true");
          }
          grid.appendChild(tile);
        }),
      );
    };
    let moves = 0;
    const move = (dx, dy) => {
      if (!started || solved) return;
      const [x, y] = player;
      const nextX = x + dx;
      const nextY = y + dy;
      if (
        nextX < 0 || nextX >= 7 || nextY < 0 || nextY >= 7 ||
        maze[nextY][nextX] === "#"
      ) {
        setStatus(language === "en" ? "Blocked. Find another route." : "Passage bloqué. Cherche un autre chemin.", "error");
        return;
      }
      player = [nextX, nextY];
      moves += 1;
      readout.textContent = `${moves} ${rules.moves}`;
      render();
      if (maze[nextY][nextX] === "G") completeLevel();
      else setStatus(`${moves} ${rules.moves}`);
    };
    const directions = [
      ["↑", 0, -1],
      ["←", -1, 0],
      ["↓", 0, 1],
      ["→", 1, 0],
    ];
    directions.forEach(([symbol, dx, dy]) => {
      const moveButton = button(symbol, "maze-control");
      moveButton.setAttribute("aria-label", `${language === "en" ? "Move" : "Aller"} ${symbol}`);
      moveButton.addEventListener("click", () => move(dx, dy));
      toolbar.appendChild(moveButton);
    });
    window.addEventListener("keydown", (event) => {
      const keys = {
        ArrowUp: [0, -1],
        ArrowLeft: [-1, 0],
        ArrowDown: [0, 1],
        ArrowRight: [1, 0],
      };
      if (keys[event.key]) {
        event.preventDefault();
        move(...keys[event.key]);
      }
    });
    beginPuzzle = () => {
      render();
      setStatus(levelCopy.ready);
    };
    render();
    readout.textContent = `0 ${rules.moves}`;
  }

  // Level 3: decode a Caesar-shifted message through three rounds.
  if (level === 3) {
    const rounds = [
      { code: "HFKR", shift: 3, answer: "ECHO", options: ["ECHO", "CODE", "VOID", "ORBIT"] },
      { code: "VLJQDO", shift: 3, answer: "SIGNAL", options: ["SIGNAL", "MEMORY", "SYSTEM", "PORTAL"] },
      { code: "EULGJH", shift: 3, answer: "BRIDGE", options: ["BRIDGE", "BREACH", "FRAGILE", "SHADOW"] },
    ];
    let round = 0;
    const render = () => {
      const data = rounds[round];
      board.replaceChildren(
        label(`${rules.round(round + 1, rounds.length)} — ${language === "en" ? `Shift each letter back by ${data.shift}.` : `Recule chaque lettre de ${data.shift} rangs dans l'alphabet.`}`),
      );
      const encrypted = document.createElement("strong");
      encrypted.className = "cipher-message";
      encrypted.textContent = data.code;
      board.appendChild(encrypted);
      const options = document.createElement("div");
      options.className = "logic-options";
      data.options.forEach((word) => {
        const answer = button(word);
        answer.addEventListener("click", () => {
          if (!started || solved) return;
          if (word !== data.answer) {
            answer.classList.add("is-wrong");
            setStatus(rules.wrong, "error");
            window.setTimeout(() => answer.classList.remove("is-wrong"), 450);
            return;
          }
          round += 1;
          setProgress(round, rounds.length);
          if (round === rounds.length) completeLevel();
          else window.setTimeout(render, 500);
        });
        options.appendChild(answer);
      });
      board.appendChild(options);
    };
    beginPuzzle = render;
    setProgress(0, rounds.length);
  }

  // Level 4: solve a randomized, always-solvable 8-puzzle.
  if (level === 4) {
    const solvedTiles = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    const tiles = [...solvedTiles];
    let empty = 8;
    let moves = 0;
    let previousEmpty = -1;
    const grid = document.createElement("div");
    grid.className = "sliding-grid";
    board.append(label(language === "en" ? "Arrange the fragments from 1 to 8." : "Range les fragments de 1 à 8."));
    board.appendChild(grid);
    const neighbors = (index) => {
      const x = index % 3;
      const y = Math.floor(index / 3);
      return [
        ...(y > 0 ? [index - 3] : []),
        ...(y < 2 ? [index + 3] : []),
        ...(x > 0 ? [index - 1] : []),
        ...(x < 2 ? [index + 1] : []),
      ];
    };
    for (let step = 0; step < 50; step += 1) {
      const options = neighbors(empty).filter((index) => index !== previousEmpty);
      const nextEmpty = options[Math.floor(Math.random() * options.length)];
      [tiles[empty], tiles[nextEmpty]] = [tiles[nextEmpty], tiles[empty]];
      previousEmpty = empty;
      empty = nextEmpty;
    }
    const render = () => {
      grid.replaceChildren();
      tiles.forEach((value, index) => {
        const tile = button(value ? String(value) : "", `sliding-tile${value ? "" : " is-empty"}`);
        tile.disabled = !value;
        tile.addEventListener("click", () => {
          if (!started || solved || !neighbors(empty).includes(index)) return;
          [tiles[empty], tiles[index]] = [tiles[index], tiles[empty]];
          empty = index;
          moves += 1;
          readout.textContent = `${moves} ${rules.moves}`;
          render();
          if (tiles.every((item, cell) => item === solvedTiles[cell])) completeLevel();
        });
        grid.appendChild(tile);
      });
    };
    beginPuzzle = () => setStatus(levelCopy.ready);
    render();
    readout.textContent = `0 ${rules.moves}`;
  }

  // Level 5: locate eight symbol pairs in a memory grid.
  if (level === 5) {
    const glyphs = ["✦", "◈", "⬡", "✧", "✺", "☾", "✥", "❖"];
    const cards = randomize(
      [...glyphs, ...glyphs].map((glyph, index) => ({
        glyph,
        id: index % glyphs.length,
      })),
    );
    const grid = document.createElement("div");
    grid.className = "memory-grid";
    board.appendChild(grid);
    const opened = [];
    const matched = new Set();
    let locked = false;
    const render = () => {
      grid.replaceChildren();
      cards.forEach((card, index) => {
        const faceUp = opened.includes(index) || matched.has(index);
        const tile = button(
          faceUp ? card.glyph : "·",
          `memory-card${faceUp ? " is-revealed" : ""}${matched.has(index) ? " is-matched" : ""}`,
        );
        tile.setAttribute(
          "aria-label",
          faceUp ? `${rules.cardLabels[card.id]} ${language === "en" ? "card" : "carte"}` : (language === "en" ? "Hidden card" : "Carte cachée"),
        );
        tile.addEventListener("click", () => {
          if (!started || locked || matched.has(index) || opened.includes(index)) return;
          opened.push(index);
          render();
          if (opened.length < 2) return;
          const [first, second] = opened;
          if (cards[first].id === cards[second].id) {
            matched.add(first);
            matched.add(second);
            opened.length = 0;
            setProgress(matched.size / 2, glyphs.length);
            setStatus(rules.matched, "success");
            render();
            if (matched.size === cards.length) completeLevel();
            return;
          }
          locked = true;
          setStatus(rules.retry, "error");
          window.setTimeout(() => {
            opened.length = 0;
            locked = false;
            render();
          }, 700);
        });
        grid.appendChild(tile);
      });
    };
    beginPuzzle = () => setStatus(levelCopy.ready);
    render();
    setProgress(0, glyphs.length);
  }

  // Level 6: deduce a four-color code from Mastermind feedback.
  if (level === 6) {
    const palette = ["#51e7ef", "#8274ff", "#ff609e", "#ffd35a", "#82e0a8", "#ff8b5b"];
    const code = randomize([...palette.keys()]).slice(0, 4);
    const guess = [null, null, null, null];
    const history = document.createElement("div");
    history.className = "mastermind-history";
    const current = document.createElement("div");
    current.className = "mastermind-guess";
    const swatches = document.createElement("div");
    swatches.className = "mastermind-palette";
    const submit = button(language === "en" ? "SUBMIT GUESS" : "SOUMETTRE LE CODE");
    const undo = button(rules.undo, "challenge-button is-secondary");
    board.append(label(language === "en" ? "Four different colors. Feedback reveals counts, not positions." : "Quatre couleurs différentes. L'indice révèle un nombre, pas les positions."));
    board.append(history, current, swatches);
    toolbar.append(undo, submit);
    let selectedColor = null;
    let attempts = 0;
    const paintGuess = () => {
      current.replaceChildren();
      guess.forEach((color, index) => {
        const position = button(color === null ? "?" : "", "mastermind-slot");
        if (color !== null) position.style.setProperty("--peg-color", palette[color]);
        position.setAttribute("aria-label", `${language === "en" ? "Position" : "Position"} ${index + 1}`);
        position.addEventListener("click", () => {
          if (!started || selectedColor === null) return;
          guess[index] = selectedColor;
          paintGuess();
        });
        current.appendChild(position);
      });
    };
    palette.forEach((color, index) => {
      const peg = button("", "mastermind-peg");
      peg.style.setProperty("--peg-color", color);
      peg.setAttribute("aria-label", `${language === "en" ? "Color" : "Couleur"} ${index + 1}`);
      peg.addEventListener("click", () => {
        if (!started) return;
        selectedColor = index;
        swatches.querySelectorAll(".is-selected").forEach((item) => item.classList.remove("is-selected"));
        peg.classList.add("is-selected");
      });
      swatches.appendChild(peg);
    });
    undo.addEventListener("click", () => {
      if (!started) return;
      let last = guess.length - 1;
      while (last >= 0 && guess[last] === null) last -= 1;
      if (last >= 0) guess[last] = null;
      paintGuess();
    });
    submit.addEventListener("click", () => {
      if (!started || solved) return;
      if (guess.some((value) => value === null)) {
        setStatus(rules.fullGuess, "error");
        return;
      }
      attempts += 1;
      const exact = guess.reduce((count, value, index) => count + (value === code[index] ? 1 : 0), 0);
      const misplaced = guess.filter((value) => code.includes(value)).length - exact;
      const row = document.createElement("div");
      row.className = "mastermind-history-row";
      guess.forEach((value) => {
        const peg = document.createElement("span");
        peg.className = "mastermind-peg";
        peg.style.setProperty("--peg-color", palette[value]);
        row.appendChild(peg);
      });
      const clue = document.createElement("span");
      clue.textContent = `${exact} ${rules.exact} · ${misplaced} ${rules.misplaced}`;
      row.appendChild(clue);
      history.prepend(row);
      setProgress(attempts, 8);
      if (exact === code.length) {
        completeLevel();
        return;
      }
      if (attempts === 8) {
        setStatus(language === "en" ? "No attempts left. Restart to try a new code." : "Plus d'essais. Recommence pour générer un nouveau code.", "error");
        submit.disabled = true;
        return;
      }
      guess.fill(null);
      paintGuess();
      setStatus(`${8 - attempts} ${rules.attempts} ${language === "en" ? "remaining." : "restants."}`);
    });
    beginPuzzle = () => setStatus(levelCopy.ready);
    paintGuess();
    setProgress(0, 8);
  }

  // Level 7: solve a 5x5 nonogram using row and column clues.
  if (level === 7) {
    const solution = [
      [1, 1, 0, 0, 1],
      [1, 0, 1, 0, 1],
      [1, 1, 1, 1, 1],
      [0, 0, 1, 0, 1],
      [0, 1, 1, 1, 0],
    ];
    const clues = (line) => {
      const runs = [];
      let count = 0;
      line.forEach((cell) => {
        if (cell) count += 1;
        else if (count) {
          runs.push(count);
          count = 0;
        }
      });
      if (count) runs.push(count);
      return runs.length ? runs.join(" ") : "–";
    };
    const columns = Array.from({ length: 5 }, (_, x) => solution.map((row) => row[x]));
    const grid = document.createElement("div");
    grid.className = "nonogram-grid";
    const topLeft = document.createElement("span");
    topLeft.className = "nonogram-corner";
    grid.appendChild(topLeft);
    columns.forEach((column) => {
      const clue = document.createElement("span");
      clue.className = "nonogram-clue is-column";
      clue.textContent = clues(column).replace(/ /g, "\n");
      grid.appendChild(clue);
    });
    const states = Array.from({ length: 25 }, () => 0);
    let filled = 0;
    solution.forEach((row, y) => {
      const clue = document.createElement("span");
      clue.className = "nonogram-clue";
      clue.textContent = clues(row);
      grid.appendChild(clue);
      row.forEach((_, x) => {
        const index = y * 5 + x;
        const cell = button("", "nonogram-cell");
        cell.setAttribute("aria-label", `${y + 1}, ${x + 1}`);
        cell.addEventListener("click", () => {
          if (!started || solved) return;
          states[index] = (states[index] + 1) % 3;
          cell.classList.toggle("is-filled", states[index] === 1);
          cell.classList.toggle("is-empty", states[index] === 2);
          cell.textContent = states[index] === 2 ? "×" : "";
          cell.setAttribute("aria-label", `${y + 1}, ${x + 1}: ${states[index] === 1 ? rules.filled : states[index] === 2 ? rules.empty : rules.unknown}`);
          filled = states.reduce((count, value) => count + (value === 1 ? 1 : 0), 0);
          const correctFilled = states.reduce((count, value, cellIndex) => {
            const target = solution[Math.floor(cellIndex / 5)][cellIndex % 5];
            return count + (value === 1 && target === 1 ? 1 : 0);
          }, 0);
          const total = solution.flat().reduce((sum, value) => sum + value, 0);
          setProgress(correctFilled, total);
          if (states.every((value, cellIndex) => value === (solution[Math.floor(cellIndex / 5)][cellIndex % 5] ? 1 : 2))) {
            completeLevel();
          } else if (filled > total) {
            setStatus(language === "en" ? "Too many cells are filled. Recheck the clues." : "Trop de cases sont remplies. Vérifie les indices.", "error");
          }
        });
        grid.appendChild(cell);
      });
    });
    board.appendChild(grid);
    beginPuzzle = () => setStatus(levelCopy.ready);
    setProgress(0, solution.flat().reduce((sum, value) => sum + value, 0));
  }

  // Level 8: route a laser through adjustable mirrors to the receiver.
  if (level === 8) {
    const mirrorCells = [
      { x: 2, y: 5, angle: "/" },
      { x: 2, y: 2, angle: "/" },
      { x: 4, y: 2, angle: "/" },
      { x: 4, y: 0, angle: "/" },
      { x: 1, y: 3, angle: "\\" },
    ];
    const receiver = [5, 0];
    const grid = document.createElement("div");
    grid.className = "laser-grid";
    board.append(label(language === "en" ? "Click a mirror to rotate it. Then test the beam." : "Clique un miroir pour le faire pivoter, puis teste le faisceau."));
    board.appendChild(grid);
    const cells = new Map();
    for (let y = 0; y < 6; y += 1) {
      for (let x = 0; x < 6; x += 1) {
        const cell = button("", "laser-cell");
        cell.disabled = true;
        cell.dataset.x = String(x);
        cell.dataset.y = String(y);
        cells.set(`${x},${y}`, cell);
        grid.appendChild(cell);
      }
    }
    const paintMirrors = () => {
      mirrorCells.forEach((mirror, index) => {
        const cell = cells.get(`${mirror.x},${mirror.y}`);
        cell.textContent = mirror.angle;
        cell.classList.add("has-mirror");
        cell.setAttribute("aria-label", `${rules.mirror} ${index + 1}: ${mirror.angle}`);
      });
      const goal = cells.get(`${receiver[0]},${receiver[1]}`);
      goal.textContent = "◎";
      goal.classList.add("is-receiver");
      goal.setAttribute("aria-label", rules.target);
      cells.get("0,5").textContent = "▶";
      cells.get("0,5").classList.add("is-emitter");
    };
    mirrorCells.forEach((mirror, index) => {
      const mirrorButton = cells.get(`${mirror.x},${mirror.y}`);
      mirrorButton.disabled = false;
      mirrorButton.addEventListener("click", () => {
        if (!started || solved) return;
        mirror.angle = mirror.angle === "/" ? "\\" : "/";
        paintMirrors();
        mirrorButton.dataset.mirrorIndex = String(index);
      });
    });
    const trace = button(rules.trace);
    trace.addEventListener("click", () => {
      if (!started || solved) return;
      cells.forEach((cell) => cell.classList.remove("beam-hit"));
      let [x, y] = [-1, 5];
      let [dx, dy] = [1, 0];
      const visited = new Set();
      let hitReceiver = false;
      for (let step = 0; step < 60; step += 1) {
        x += dx;
        y += dy;
        if (x < 0 || x >= 6 || y < 0 || y >= 6) break;
        const key = `${x},${y}`;
        if (visited.has(`${key}:${dx},${dy}`)) break;
        visited.add(`${key}:${dx},${dy}`);
        cells.get(key).classList.add("beam-hit");
        if (x === receiver[0] && y === receiver[1]) {
          hitReceiver = true;
          break;
        }
        const mirror = mirrorCells.find((item) => item.x === x && item.y === y);
        if (mirror) {
          if (mirror.angle === "/") [dx, dy] = [-dy, -dx];
          else [dx, dy] = [dy, dx];
        }
      }
      if (hitReceiver) completeLevel();
      else setStatus(rules.noRoute, "error");
    });
    toolbar.appendChild(trace);
    beginPuzzle = () => setStatus(levelCopy.ready);
    paintMirrors();
    setProgress(0, 1);
  }

  // Level 9: transfer four disks while obeying the size constraint.
  if (level === 9) {
    const piles = [[4, 3, 2, 1], [], []];
    const moves = document.createElement("div");
    moves.className = "hanoi-moves";
    const rods = document.createElement("div");
    rods.className = "hanoi-rods";
    const rodNames = language === "en" ? ["LEFT", "MIDDLE", "RIGHT"] : ["GAUCHE", "CENTRE", "DROITE"];
    let selectedRod = null;
    let moveCount = 0;
    board.append(label(language === "en" ? "Move the tower from the left pedestal to the right." : "Déplace la tour du socle gauche vers le socle droit."));
    board.appendChild(rods);
    board.appendChild(moves);
    const render = () => {
      rods.replaceChildren();
      piles.forEach((pile, rodIndex) => {
        const rod = button("", `hanoi-rod${selectedRod === rodIndex ? " is-selected" : ""}`);
        rod.setAttribute("aria-label", `${rules.hanoi} ${rodNames[rodIndex]}`);
        pile.forEach((disk) => {
          const piece = document.createElement("span");
          piece.className = `hanoi-disk disk-${disk}`;
          piece.textContent = `${rules.disk} ${disk}`;
          rod.appendChild(piece);
        });
        const name = document.createElement("b");
        name.textContent = rodNames[rodIndex];
        rod.appendChild(name);
        rod.addEventListener("click", () => {
          if (!started || solved) return;
          if (selectedRod === null) {
            if (!piles[rodIndex].length) return;
            selectedRod = rodIndex;
            render();
            return;
          }
          if (selectedRod === rodIndex) {
            selectedRod = null;
            render();
            return;
          }
          const source = piles[selectedRod];
          const destination = piles[rodIndex];
          const disk = source[source.length - 1];
          if (destination.length && destination[destination.length - 1] < disk) {
            setStatus(rules.invalid, "error");
            selectedRod = null;
            render();
            return;
          }
          destination.push(source.pop());
          selectedRod = null;
          moveCount += 1;
          moves.textContent = `${moveCount} ${rules.moves} · ${language === "en" ? "minimum" : "minimum"} 15`;
          setProgress(moveCount, 15);
          render();
          if (piles[2].length === 4) completeLevel();
        });
        rods.appendChild(rod);
      });
      moves.textContent = `${moveCount} ${rules.moves} · ${language === "en" ? "minimum" : "minimum"} 15`;
    };
    beginPuzzle = () => setStatus(levelCopy.ready);
    render();
    setProgress(0, 15);
  }

  // Level 10: solve a compact Sudoku with row, column, and box constraints.
  if (level === 10) {
    const given = [
      [1, 0, 3, 0],
      [0, 4, 0, 2],
      [2, 0, 4, 0],
      [0, 3, 0, 1],
    ];
    const values = given.map((row) => [...row]);
    let selectedNumber = 1;
    let filled = 0;
    const grid = document.createElement("div");
    grid.className = "sudoku-grid";
    const controls = document.createElement("div");
    controls.className = "sudoku-controls";
    const palette = document.createElement("div");
    palette.className = "sudoku-palette";
    const verify = button(rules.verify);
    const selectedLabel = label(`${rules.sudoku}: 1`);
    board.append(label(language === "en" ? "Each row, column, and 2x2 box must contain 1 through 4 once." : "Chaque ligne, colonne et carré 2x2 doit contenir une fois les chiffres de 1 à 4."));
    board.appendChild(grid);
    controls.append(palette, selectedLabel, verify);
    toolbar.appendChild(controls);
    const cells = [];
    const refresh = () => {
      filled = values.flat().filter((value, index) => !given[Math.floor(index / 4)][index % 4] && value).length;
      setProgress(filled, 8);
      cells.forEach(({ cell, row, col }) => {
        cell.textContent = values[row][col] || "";
        cell.classList.toggle("is-given", Boolean(given[row][col]));
        cell.classList.toggle("is-selected", cell.dataset.selected === "true");
      });
    };
    given.forEach((row, y) =>
      row.forEach((value, x) => {
        const cell = button(value ? String(value) : "", "sudoku-cell");
        cell.dataset.row = String(y);
        cell.dataset.col = String(x);
        cell.addEventListener("click", () => {
          if (!started || solved || given[y][x]) return;
          cells.forEach(({ cell: item }) => {
            item.dataset.selected = "false";
            item.classList.remove("is-selected");
          });
          cell.dataset.selected = "true";
          values[y][x] = selectedNumber;
          refresh();
          setStatus(`${rules.chooseNumber} ${selectedNumber}`);
        });
        cells.push({ cell, row: y, col: x });
        grid.appendChild(cell);
      }),
    );
    [1, 2, 3, 4].forEach((value) => {
      const digit = button(String(value), "sudoku-digit");
      digit.addEventListener("click", () => {
        if (!started) return;
        selectedNumber = value;
        selectedLabel.textContent = `${rules.sudoku}: ${value}`;
        palette.querySelectorAll(".is-selected").forEach((item) => item.classList.remove("is-selected"));
        digit.classList.add("is-selected");
      });
      palette.appendChild(digit);
    });
    verify.addEventListener("click", () => {
      if (!started || solved) return;
      if (values.some((row) => row.includes(0))) {
        setStatus(rules.sudokuIncomplete, "error");
        return;
      }
      const rowsValid = values.every((row) => new Set(row).size === 4);
      const columnsValid = values.every(
        (_, x) => new Set(values.map((row) => row[x])).size === 4,
      );
      const boxesValid = [0, 1].every((boxY) =>
        [0, 1].every((boxX) => {
          const boxValues = [
            values[boxY * 2][boxX * 2],
            values[boxY * 2][boxX * 2 + 1],
            values[boxY * 2 + 1][boxX * 2],
            values[boxY * 2 + 1][boxX * 2 + 1],
          ];
          return new Set(boxValues).size === 4;
        }),
      );
      if (rowsValid && columnsValid && boxesValid) completeLevel();
      else setStatus(rules.sudokuConflict, "error");
    });
    beginPuzzle = () => setStatus(levelCopy.ready);
    refresh();
  }
})();
