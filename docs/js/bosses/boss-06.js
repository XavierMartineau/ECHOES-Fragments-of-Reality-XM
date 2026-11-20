// FINAL BOSS // trace the origin maze through ordered checkpoints.
(() => {
  const board = document.getElementById("originMaze");
  if (!board) return;

  const english = localStorage.getItem("echoes-language") === "en";
  const keyNumber = 6;
  const keyCode = "06";
  const keyId = "resonance-6";
  const keySrc = "../../assets/svg/cles/key-06-usb.svg";
  const nextUrl = document.body.dataset.nextUrl;
  const copy = english
    ? {
        start: "ENTER THE ORIGIN MAZE",
        next: "ENTER THE MEMORY FORGE",
        reset: "RESTART THE FIGHT",
        ready: "Reach every checkpoint in order, then exit. Use the arrow keys or click an adjacent open tile.",
        phase: (n) => `MAZE ${n} / 4`,
        rules: "Move one orthogonal tile at a time. Follow the numbered checkpoints in order, then reach the exit. Walls block movement; red corrupted tiles cost one integrity and send you back to your last checkpoint. The move budget shrinks each phase.",
        checkpoint: (n, row, col) => `Checkpoint ${n}: row ${row}, column ${col}.`,
        checkpointDone: (n) => `Checkpoint ${n} secured.`,
        exit: "Exit reached. The next maze is opening.",
        hazard: "Corrupted tile! One integrity lost; returned to your last checkpoint.",
        invalid: "That tile is not adjacent or is blocked. One integrity lost.",
        wrongCheckpoint: "Checkpoint order broken. One integrity lost; returned to your last checkpoint.",
        outOfMoves: "Move budget exhausted. One integrity lost; the maze resets.",
        lost: "Origin protocol failed. Restart the fight to try again.",
        win: "The origin maze is solved. Resonance key 06 is yours.",
        rewardError: "Key 06 could not be saved. Check your save and retry.",
        integrity: (n) => `${n} integrity remaining`,
        moves: (n) => `${n} moves left`,
        progress: (n) => `${n} / 4 mazes`,
        exitLabel: "EXIT",
        startLabel: "START",
        checkpointLabel: (n) => `CHECKPOINT ${n}`,
        hazardLabel: "CORRUPTED TILE",
        wallLabel: "BLOCKED",
        openLabel: "OPEN TILE",
        keyRecovered: "KEY 06 // RECOVERED",
        keyNote: "KEY 06 // TO RECOVER",
        forgeNext: "ENTER THE MEMORY FORGE",
      }
    : {
        start: "ENTRER DANS LE LABYRINTHE ORIGINEL",
        next: "ENTRER DANS LA FORGE MÉMOIRE",
        reset: "RECOMMENCER LE COMBAT",
        ready: "Atteins chaque checkpoint dans l'ordre, puis la sortie. Utilise les flèches ou clique une case ouverte voisine.",
        phase: (n) => `LABYRINTHE ${n} / 4`,
        rules: "Avance d'une case orthogonale à la fois. Suis les checkpoints numérotés dans l'ordre, puis rejoins la sortie. Les murs bloquent le passage; une case rouge corrompue coûte une unité d'intégrité et te renvoie au dernier checkpoint. Le nombre de déplacements autorisés diminue à chaque phase.",
        checkpoint: (n, row, col) => `Checkpoint ${n} : rangée ${row}, colonne ${col}.`,
        checkpointDone: (n) => `Checkpoint ${n} sécurisé.`,
        exit: "Sortie atteinte. Le labyrinthe suivant s'ouvre.",
        hazard: "Case corrompue ! Une unité d'intégrité perdue; retour au dernier checkpoint.",
        invalid: "Cette case est bloquée ou non voisine. Une unité d'intégrité perdue.",
        wrongCheckpoint: "Ordre des checkpoints rompu. Une unité perdue; retour au dernier checkpoint.",
        outOfMoves: "Budget de déplacements épuisé. Une unité perdue; le labyrinthe recommence.",
        lost: "Protocole originel échoué. Recommence le combat pour réessayer.",
        win: "Le labyrinthe originel est résolu. La clé de résonance 06 est à toi.",
        rewardError: "La clé 06 n'a pas pu être enregistrée. Vérifie ta sauvegarde et réessaie.",
        integrity: (n) => `${n} unités d'intégrité restantes`,
        moves: (n) => `${n} déplacements restants`,
        progress: (n) => `${n} / 4 labyrinthes`,
        exitLabel: "SORTIE",
        startLabel: "DÉPART",
        checkpointLabel: (n) => `CHECKPOINT ${n}`,
        hazardLabel: "CASE CORROMPUE",
        wallLabel: "BLOQUÉE",
        openLabel: "CASE LIBRE",
        keyRecovered: "CLÉ 06 // RÉCUPÉRÉE",
        keyNote: "CLÉ 06 // À RÉCUPÉRER",
        forgeNext: "ENTRER DANS LA FORGE MÉMOIRE",
      };

  const phases = [5, 6, 7, 8].map((size, index) => ({
    size,
    checkpoints: index + 2,
    bonusMoves: [7, 5, 3, 1][index],
  }));
  const maxIntegrity = 5;
  const startButton = document.getElementById("startBossButton");
  const nextButton = document.getElementById("nextLevelButton");
  const resetButton = document.getElementById("resetButton");
  const status = document.getElementById("puzzleStatus");
  const panel = document.querySelector(".boss06-panel");
  const phaseReadout = document.getElementById("phaseReadout");
  const integrityReadout = document.getElementById("integrityReadout");
  const movesReadout = document.getElementById("movesReadout");
  const checkpointReadout = document.getElementById("checkpointReadout");
  const keyCount = document.getElementById("keyCount");
  const keyHud = document.getElementById("keyHud");
  const keyHudNote = document.getElementById("keyHudNote");
  const keyHudImage = document.querySelector("#keyHudSlot img");
  const mazeReadout = document.getElementById("mazeReadout");
  let phaseIndex = 0;
  let integrity = maxIntegrity;
  let maze = null;
  let route = [];
  let checkpoints = [];
  let nextCheckpoint = 0;
  let player = 0;
  let lastCheckpoint = 0;
  let movesLeft = 0;
  let started = false;
  let ended = false;

  const cellIndex = (row, column, dimension) => row * dimension + column;
  const neighbors = (index, dimension) => {
    const row = Math.floor(index / dimension);
    const column = index % dimension;
    return [
      [row - 1, column],
      [row + 1, column],
      [row, column - 1],
      [row, column + 1],
    ]
      .filter(
        ([nextRow, nextColumn]) =>
          nextRow >= 0 &&
          nextColumn >= 0 &&
          nextRow < dimension &&
          nextColumn < dimension,
      )
      .map(([nextRow, nextColumn]) =>
        cellIndex(nextRow, nextColumn, dimension),
      );
  };

  const findRoute = (grid, dimension, start, end) => {
    const queue = [start];
    const previous = new Map([[start, null]]);
    for (let cursor = 0; cursor < queue.length; cursor += 1) {
      const current = queue[cursor];
      if (current === end) break;
      neighbors(current, dimension).forEach((next) => {
        if (!grid[next] || previous.has(next)) return;
        previous.set(next, current);
        queue.push(next);
      });
    }
    if (!previous.has(end)) return [];
    const path = [];
    for (let current = end; current !== null; current = previous.get(current)) {
      path.push(current);
    }
    return path.reverse();
  };

  const createMaze = (logicalSize, checkpointCount) => {
    const dimension = logicalSize * 2 + 1;
    const grid = Array(dimension * dimension).fill(false);
    const start = cellIndex(1, 1, dimension);
    const end = cellIndex(dimension - 2, dimension - 2, dimension);
    const visited = new Set([start]);
    const stack = [[1, 1]];
    grid[start] = true;
    while (stack.length) {
      const [row, column] = stack[stack.length - 1];
      const options = [
        [row - 2, column],
        [row + 2, column],
        [row, column - 2],
        [row, column + 2],
      ].filter(
        ([nextRow, nextColumn]) =>
          nextRow > 0 &&
          nextColumn > 0 &&
          nextRow < dimension - 1 &&
          nextColumn < dimension - 1 &&
          !visited.has(cellIndex(nextRow, nextColumn, dimension)),
      );
      if (!options.length) {
        stack.pop();
        continue;
      }
      const [nextRow, nextColumn] =
        options[Math.floor(Math.random() * options.length)];
      const between = cellIndex(
        (row + nextRow) / 2,
        (column + nextColumn) / 2,
        dimension,
      );
      const next = cellIndex(nextRow, nextColumn, dimension);
      grid[between] = true;
      grid[next] = true;
      visited.add(next);
      stack.push([nextRow, nextColumn]);
    }

    const path = findRoute(grid, dimension, start, end);
    const checkpointCells = Array.from({ length: checkpointCount }, (_, index) => {
      const pathIndex = Math.floor(
        ((index + 1) * (path.length - 1)) / (checkpointCount + 1),
      );
      return path[pathIndex];
    });
    const pathSet = new Set(path);
    const hazardCandidates = grid
      .map((open, index) => (open && !pathSet.has(index) ? index : -1))
      .filter((index) => index >= 0);
    const hazardCount = Math.min(4 + phaseIndex, hazardCandidates.length);
    const hazards = new Set(
      hazardCandidates
        .sort(() => Math.random() - 0.5)
        .slice(0, hazardCount),
    );
    return { dimension, grid, start, end, path, checkpointCells, hazards };
  };

  const checkpointAt = (cell) => checkpoints.indexOf(cell);
  const setStatus = (message, error = false) => {
    status.textContent = message;
    status.classList.toggle("error", error);
    status.classList.toggle("success", !error && ended);
  };

  const updateReadouts = () => {
    phaseReadout.textContent = copy.phase(phaseIndex + 1);
    integrityReadout.textContent = copy.integrity(integrity);
    movesReadout.textContent = copy.moves(movesLeft);
    mazeReadout.textContent = copy.progress(phaseIndex);
    const target = checkpoints[nextCheckpoint];
    if (target === undefined) {
      checkpointReadout.textContent = copy.exitLabel;
      return;
    }
    const row = Math.floor(target / maze.dimension) + 1;
    const column = (target % maze.dimension) + 1;
    checkpointReadout.textContent = copy.checkpoint(
      nextCheckpoint + 1,
      row,
      column,
    );
  };

  const renderMaze = () => {
    board.style.setProperty("--maze-columns", maze.dimension);
    board.replaceChildren();
    maze.grid.forEach((open, index) => {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "boss06-cell";
      const checkpoint = checkpointAt(index);
      const isStart = index === maze.start;
      const isExit = index === maze.end;
      const isHazard = maze.hazards.has(index);
      const isPlayer = index === player;
      cell.disabled = !open || ended;
      if (!open) cell.classList.add("is-wall");
      if (isStart) cell.classList.add("is-start");
      if (isExit) cell.classList.add("is-exit");
      if (isHazard) cell.classList.add("is-hazard");
      if (isPlayer) cell.classList.add("is-player");
      if (checkpoint >= 0 && checkpoint < nextCheckpoint) {
        cell.classList.add("is-checkpoint-done");
      } else if (checkpoint >= 0) {
        cell.classList.add("is-checkpoint");
      }
      const symbol = isPlayer
        ? "●"
        : isStart
          ? "S"
          : isExit
            ? "E"
            : checkpoint >= 0
              ? String(checkpoint + 1)
              : isHazard
                ? "×"
                : "";
      cell.textContent = symbol;
      const label = isPlayer
        ? english ? "your position" : "ta position"
        : isStart
          ? copy.startLabel
          : isExit
            ? copy.exitLabel
            : checkpoint >= 0
              ? copy.checkpointLabel(checkpoint + 1)
              : isHazard
                ? copy.hazardLabel
                : open
                  ? copy.openLabel
                  : copy.wallLabel;
      cell.setAttribute("aria-label", `${english ? "Row" : "Rangée"} ${Math.floor(index / maze.dimension) + 1}, ${english ? "column" : "colonne"} ${(index % maze.dimension) + 1}: ${label}`);
      cell.addEventListener("click", () => move(index));
      board.appendChild(cell);
    });
    updateReadouts();
  };

  const completeMaze = () => {
    if (phaseIndex === phases.length - 1) {
      finishBoss();
      return;
    }
    phaseIndex += 1;
    beginMaze();
    setStatus(copy.exit);
  };

  const loseIntegrity = (message) => {
    integrity -= 1;
    if (integrity <= 0) {
      ended = true;
      started = false;
      startButton.hidden = true;
      board.querySelectorAll("button").forEach((cell) => (cell.disabled = true));
      setStatus(copy.lost, true);
      updateReadouts();
      return;
    }
    if (message === copy.outOfMoves) {
      beginMaze();
    } else {
      player = lastCheckpoint;
      movesLeft = Math.max(0, movesLeft - 1);
      renderMaze();
    }
    setStatus(message, true);
    updateReadouts();
  };

  const move = (target) => {
    if (!started || ended || target === player) return;
    if (!neighbors(player, maze.dimension).includes(target) || !maze.grid[target]) {
      loseIntegrity(copy.invalid);
      return;
    }
    movesLeft -= 1;
    if (maze.hazards.has(target)) {
      loseIntegrity(copy.hazard);
      return;
    }
    const checkpoint = checkpointAt(target);
    if (checkpoint >= 0 && checkpoint !== nextCheckpoint) {
      loseIntegrity(copy.wrongCheckpoint);
      return;
    }
    player = target;
    if (checkpoint === nextCheckpoint) {
      nextCheckpoint += 1;
      lastCheckpoint = target;
      setStatus(copy.checkpointDone(checkpoint + 1));
    }
    if (player === maze.end && nextCheckpoint === checkpoints.length) {
      renderMaze();
      completeMaze();
      return;
    }
    if (movesLeft <= 0) {
      loseIntegrity(copy.outOfMoves);
      return;
    }
    renderMaze();
  };

  const beginMaze = () => {
    const phaseConfig = phases[phaseIndex];
    maze = createMaze(phaseConfig.size, phaseConfig.checkpoints);
    route = maze.path;
    checkpoints = maze.checkpointCells;
    nextCheckpoint = 0;
    player = maze.start;
    lastCheckpoint = maze.start;
    movesLeft = route.length - 1 + phaseConfig.bonusMoves;
    renderMaze();
  };

  const finishBoss = () => {
    ended = true;
    started = false;
    panel.classList.add("is-victory");
    startButton.hidden = true;
    nextButton.hidden = true;
    setStatus(copy.win);
    if (!window.EchoesSave?.unlockKey?.(keyId)) {
      setStatus(copy.rewardError, true);
      return;
    }
    if (!window.EchoesLevels?.markCompleted?.("boss-06")) {
      setStatus(copy.rewardError, true);
      return;
    }
    window.EchoesSave.saveProgress({
      currentPage: "level-30",
      currentLevel: 30,
    });
    keyCount.textContent = `${keyNumber} / 6`;
    keyHud.classList.add("is-unlocked");
    keyHudNote.textContent = copy.keyRecovered;
    nextButton.hidden = false;
  };

  const resetFight = () => {
    phaseIndex = 0;
    integrity = maxIntegrity;
    started = true;
    ended = false;
    panel.classList.remove("is-victory");
    startButton.hidden = true;
    nextButton.hidden = true;
    beginMaze();
    setStatus(copy.ready);
  };

  document.getElementById("bossPart").textContent =
    document.body.dataset.partLabel || "PARTIE 6 // ORIGINE";
  document.getElementById("bossLevel").textContent = `CLÉ 06 // LABYRINTHE ORIGINEL`;
  document.getElementById("bossTitle").textContent = english
    ? "The Origin Weaver"
    : "Le Tisseur d'origine";
  document.getElementById("bossDescription").textContent = english
    ? "The final guardian has hidden a unique route through four expanding mazes. Reach every coordinate checkpoint in order, avoid corrupted tiles, and reach each exit before your move budget runs out."
    : "Le gardien final a dissimulé un itinéraire unique dans quatre labyrinthes grandissants. Atteins les checkpoints de coordonnées dans l'ordre, évite les cases corrompues et rejoins chaque sortie avant la fin du budget.";
  document.getElementById("bossKicker").textContent = english
    ? "BOSS // ORIGIN MAZE PROTOCOL"
    : "BOSS // PROTOCOLE DU LABYRINTHE ORIGINEL";
  document.getElementById("arenaTitle").textContent = english
    ? "Four maze phases"
    : "Quatre phases de labyrinthe";
  document.getElementById("helpTitle").textContent = english
    ? "HOW TO SOLVE IT"
    : "COMMENT RÉSOUDRE L'ÉPREUVE";
  document.getElementById("helpList").innerHTML = english
    ? "<li>Click a tile next to your position or use the arrow keys. You can move only one open tile at a time.</li><li>Reach the numbered checkpoints in order, then move to E for the exit. The current checkpoint coordinates are shown above the maze.</li><li>Walls block movement. A red corrupted tile costs one integrity and sends you back to the last checkpoint.</li><li>Each phase adds checkpoints and maze size while reducing your move bonus. You have five integrity units for all four phases.</li>"
    : "<li>Clique une case voisine ou utilise les flèches. Tu ne peux avancer que d'une case ouverte à la fois.</li><li>Atteins les checkpoints numérotés dans l'ordre, puis rejoins E pour sortir. Les coordonnées du prochain checkpoint sont affichées au-dessus du labyrinthe.</li><li>Les murs bloquent le passage. Une case rouge corrompue coûte une unité d'intégrité et te renvoie au dernier checkpoint.</li><li>Chaque phase ajoute des checkpoints et agrandit le labyrinthe, tout en réduisant le bonus de déplacements. Tu as cinq unités d'intégrité pour les quatre phases.</li>";
  document.getElementById("startBossButton").textContent = copy.start;
  document.getElementById("nextLevelButton").textContent = copy.next;
  resetButton.textContent = copy.reset;
  document.getElementById("keyHudNote").textContent = copy.keyNote;
  keyCount.textContent = "6 / 6";
  keyHudImage.src = keySrc;
  keyHudImage.alt = english ? "Resonance key 06" : "Clé de résonance 06";
  document.getElementById("levelProgress").setAttribute(
    "aria-label",
    english ? "Part 6 progress" : "Progression de la Partie 6",
  );
  for (let level = 26; level <= 30; level += 1) {
    const marker = document.createElement("span");
    marker.className = `level-square${level === 30 ? " current" : ""}`;
    marker.setAttribute("aria-hidden", "true");
    document.getElementById("levelProgress").appendChild(marker);
  }
  document.getElementById("startBossButton").addEventListener("click", resetFight);
  resetButton.addEventListener("click", resetFight);
  nextButton.addEventListener("click", () => {
    window.location.href = nextUrl;
  });
  document.addEventListener("keydown", (event) => {
    if (!started || ended || !["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    const row = Math.floor(player / maze.dimension);
    const column = player % maze.dimension;
    const next = {
      ArrowUp: [row - 1, column],
      ArrowDown: [row + 1, column],
      ArrowLeft: [row, column - 1],
      ArrowRight: [row, column + 1],
    }[event.key];
    if (next[0] < 0 || next[1] < 0 || next[0] >= maze.dimension || next[1] >= maze.dimension) {
      loseIntegrity(copy.invalid);
      return;
    }
    move(cellIndex(next[0], next[1], maze.dimension));
  });

  if (window.EchoesSave?.getKeys?.().includes(keyId)) {
    panel.classList.add("is-victory");
    startButton.hidden = true;
    nextButton.hidden = false;
    setStatus(copy.win);
  } else {
    setStatus(copy.ready);
  }
})();
