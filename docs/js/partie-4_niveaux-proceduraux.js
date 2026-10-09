/* ---------------------------------------------------------------------------
 * PARTIE 4 // NIVEAUX 32 À 40
 * Labyrinthes générés à chaque tentative, avec une mécanique par niveau.
 * ------------------------------------------------------------------------- */
(() => {
  const board = document.getElementById("mazeBoard");
  if (!board) return;

  const level = Number(document.body.dataset.level);
  if (!Number.isInteger(level) || level < 32 || level > 40) return;

  const language = localStorage.getItem("echoes-language") === "en" ? "en" : "fr";
  const translations = {
    fr: {
      part: "PARTIE 4 // RÉSONANCE",
      eyebrow: (n) => `Fragment ${String(n).padStart(3, "0")} // Labyrinthe instable`,
      titles: [
        "Le labyrinthe fractal", "La chambre des brumes", "Le couloir de glace",
        "Les sentinelles", "Les dalles fragiles", "La porte résonnante",
        "Les failles mouvantes", "Les doubles portails", "La convergence",
      ],
      descriptions: [
        "Une carte fractale se recompose à chaque tentative. Explore les portails et récupère les fragments.",
        "Le brouillard cache la carte. Explore chaque couloir pour révéler le chemin.",
        "Les dalles glacées entraînent ta bille en ligne droite. Choisis tes virages avec soin.",
        "Les sentinelles patrouillent dans les couloirs. Observe leurs mouvements pour passer.",
        "Certaines dalles s'effondrent après ton passage. Ne t'enferme pas dans une impasse.",
        "Récupère la clé avant de traverser la porte résonnante et d'atteindre la sortie.",
        "Les anomalies changent l'état des passages. Choisis le bon moment pour avancer.",
        "Deux paires de portails relient des zones éloignées du labyrinthe.",
        "Les mécaniques de la partie convergent dans une carte dense et imprévisible.",
      ],
      rules: "Déplace-toi avec les flèches ou ZQSD. Récupère les fragments et rejoins la sortie. Chaque nouvelle tentative génère un autre labyrinthe.",
      reset: "RÉGÉNÉRER",
      start: "LANCER LA CARTE",
      saveError: "Impossible de sauvegarder la progression.",
      footer: "ÉCHO // RÉSONANCE",
      footerProgress: (n) => `${n} / 60`,
      next: "NIVEAU SUIVANT",
      replay: "REJOUER",
      shards: (collected, total) => `FRAGMENTS ${collected} / ${total}`,
      lives: (count) => `ÉNERGIE ${count}`,
      waiting: "Récupère les fragments, puis rejoins la sortie.",
      playing: "Carte instable : le parcours a changé.",
      gateLocked: "La porte est verrouillée. Trouve la clé résonnante.",
      hit: "Une anomalie t'a touché. Tu as perdu de l'énergie.",
      dead: "Énergie épuisée. Une nouvelle carte est prête.",
      solved: "Fragments récupérés. Sortie atteinte !",
      key: "CLÉ",
      exit: "SORTIE",
      player: "Bille",
      portal: "Portail",
      hazard: "Anomalie",
      guard: "Sentinelle",
      legend: [
        ["Mur", "Fragment", "Portail", ""],
        ["Mur", "Fragment", "Brouillard", ""],
        ["Mur", "Fragment", "Glace", ""],
        ["Mur", "Fragment", "Sentinelle", "Anomalie"],
        ["Mur", "Fragment", "Dalle fragile", ""],
        ["Mur", "Fragment", "Clé", "Porte"],
        ["Mur", "Fragment", "Portail", "Passage instable"],
        ["Mur", "Fragment", "Portails doubles", "Anomalie"],
        ["Mur", "Fragment", "Glace / portail", "Anomalie"],
      ],
      controls: ["Haut", "Gauche", "Bas", "Droite"],
      complete: (n) => `NIVEAU ${n} TERMINÉ`,
      system: "SYSTEME:: CARTE PROCÉDURALE // RÉSONANCE DÉTECTÉE",
      progress: "Progression de la Partie 4",
    },
    en: {
      part: "PART 4 // RESONANCE",
      eyebrow: (n) => `Fragment ${String(n).padStart(3, "0")} // Unstable maze`,
      titles: [
        "The Fractal Maze", "The Fog Chamber", "The Ice Corridor",
        "The Sentinels", "The Fragile Tiles", "The Resonant Gate",
        "The Shifting Faults", "The Twin Portals", "The Convergence",
      ],
      descriptions: [
        "A fractal map rebuilds itself with every attempt. Explore the portals and collect the fragments.",
        "Fog conceals the map. Explore each corridor to reveal the route.",
        "Icy tiles send your ball sliding in a straight line. Choose your turns carefully.",
        "Sentinels patrol the corridors. Watch their movements to slip past.",
        "Some tiles collapse after you leave them. Don't trap yourself in a dead end.",
        "Find the key before crossing the resonant gate and reaching the exit.",
        "Anomalies change the state of passages. Choose the right moment to move.",
        "Two pairs of portals connect distant parts of the maze.",
        "The part's mechanics converge in a dense, unpredictable map.",
      ],
      rules: "Move with the arrow keys or WASD. Collect the fragments and reach the exit. Every new attempt generates another maze.",
      reset: "REGENERATE",
      start: "START MAP",
      saveError: "Unable to save progress.",
      footer: "ECHO // RESONANCE",
      footerProgress: (n) => `${n} / 60`,
      next: "NEXT LEVEL",
      replay: "PLAY AGAIN",
      shards: (collected, total) => `FRAGMENTS ${collected} / ${total}`,
      lives: (count) => `ENERGY ${count}`,
      waiting: "Collect the fragments, then reach the exit.",
      playing: "Unstable map: the route has changed.",
      gateLocked: "The gate is locked. Find the resonant key.",
      hit: "An anomaly struck you. Energy lost.",
      dead: "Energy depleted. A new map is ready.",
      solved: "Fragments collected. Exit reached!",
      key: "KEY",
      exit: "EXIT",
      player: "Ball",
      portal: "Portal",
      hazard: "Anomaly",
      guard: "Sentinel",
      legend: [
        ["Wall", "Fragment", "Portal", ""],
        ["Wall", "Fragment", "Fog", ""],
        ["Wall", "Fragment", "Ice", ""],
        ["Wall", "Fragment", "Sentinel", "Anomaly"],
        ["Wall", "Fragment", "Fragile tile", ""],
        ["Wall", "Fragment", "Key", "Gate"],
        ["Wall", "Fragment", "Portal", "Unstable passage"],
        ["Wall", "Fragment", "Twin portals", "Anomaly"],
        ["Wall", "Fragment", "Ice / portal", "Anomaly"],
      ],
      controls: ["Up", "Left", "Down", "Right"],
      complete: (n) => `LEVEL ${n} CLEARED`,
      system: "SYSTEM:: PROCEDURAL MAP // RESONANCE DETECTED",
      progress: "Part 4 progress",
    },
  }[language];
  const levelIndex = level - 32;
  const title = translations.titles[levelIndex];
  const $ = (id) => document.getElementById(id);
  const size = 17;
  const directions = [
    { x: 0, y: -1, key: "ArrowUp" },
    { x: -1, y: 0, key: "ArrowLeft" },
    { x: 0, y: 1, key: "ArrowDown" },
    { x: 1, y: 0, key: "ArrowRight" },
  ];
  const start = { x: 1, y: 1 };
  const exit = { x: size - 2, y: size - 2 };
  const shardCount = Math.min(2 + Math.floor(levelIndex / 2), 5);
  const currentUser = window.EchoesSave?.getCurrentUser?.() || "guest";
  const progressKey = `echoes-completed-levels-${encodeURIComponent(currentUser)}`;
  const completed = new Set(JSON.parse(localStorage.getItem(progressKey) || "[]"));
  let map;
  let route;
  let player;
  let shards;
  let keyCell;
  let gateCell;
  let portals;
  let hazards;
  let guards;
  let ice;
  let collapse;
  let unstable;
  let discovered;
  let energy;
  let moves;
  let hasKey;
  let solved;
  let active;

  const setText = (id, value) => { $(id).textContent = value; };
  document.documentElement.lang = language;
  document.title = `${language === "en" ? "Level" : "Niveau"} ${level} - ECHOES`;
  setText("partLabel", translations.part);
  setText("levelLabel", `${language === "en" ? "LEVEL" : "NIVEAU"} ${level}`);
  setText("eyebrow", translations.eyebrow(level));
  setText("levelTitle", title);
  setText("description", translations.descriptions[levelIndex]);
  setText("rules", translations.rules);
  setText("systemMessage", translations.system);
  setText("puzzleTitle", title);
  setText("footerLabel", translations.footer);
  setText("footerProgress", translations.footerProgress(level));
  board.setAttribute("aria-label", language === "en" ? "Generated maze" : "Labyrinthe généré");
  setText("startPuzzleButton", translations.start);
  setText("resetButton", translations.reset);
  setText("nextLevelButton", level < 40 ? translations.next : translations.replay);
  const legendIcons = [
    ["maze-wall", "maze-shard", "maze-portal", "maze-hazard"],
    ["maze-wall", "maze-shard", "maze-fog", "maze-hazard"],
    ["maze-wall", "maze-shard", "maze-ice", "maze-hazard"],
    ["maze-wall", "maze-shard", "maze-guard", "maze-hazard"],
    ["maze-wall", "maze-shard", "maze-fragile", "maze-hazard"],
    ["maze-wall", "maze-shard", "maze-key", "maze-gate"],
    ["maze-wall", "maze-shard", "maze-portal", "maze-unstable"],
    ["maze-wall", "maze-shard", "maze-portal", "maze-hazard"],
    ["maze-wall", "maze-shard", "maze-ice", "maze-hazard"],
  ];
  document.querySelectorAll("#legend li").forEach((item, index) => {
    const label = translations.legend[levelIndex][index];
    item.hidden = !label;
    item.querySelector("span").textContent = label;
    item.querySelector("i").className = `maze-legend ${legendIcons[levelIndex][index]}`;
  });
  document.querySelectorAll("[data-direction]").forEach((button) => {
    button.setAttribute("aria-label", translations.controls[Number(button.dataset.direction)]);
  });

  const randomIndex = (length) => Math.floor(Math.random() * length);
  const cellKey = ({ x, y }) => `${x},${y}`;
  const sameCell = (a, b) => a && b && a.x === b.x && a.y === b.y;
  const inside = (x, y) => x > 0 && y > 0 && x < size - 1 && y < size - 1;
  const walkable = (x, y) => inside(x, y) && map[y][x] === 0;
  const neighbours = ({ x, y }) => directions
    .map(({ x: dx, y: dy }) => ({ x: x + dx, y: y + dy }))
    .filter(({ x: nx, y: ny }) => walkable(nx, ny));

  const generateMaze = () => {
    map = Array.from({ length: size }, () => Array(size).fill(1));
    const stack = [start];
    map[start.y][start.x] = 0;
    while (stack.length) {
      const current = stack[stack.length - 1];
      const options = directions
        .map(({ x: dx, y: dy }) => ({ x: current.x + dx * 2, y: current.y + dy * 2, dx, dy }))
        .filter(({ x, y }) => inside(x, y) && map[y][x] === 1);
      if (!options.length) {
        stack.pop();
        continue;
      }
      const next = options[randomIndex(options.length)];
      map[current.y + next.dy][current.x + next.dx] = 0;
      map[next.y][next.x] = 0;
      stack.push({ x: next.x, y: next.y });
    }
    map[exit.y][exit.x] = 0;
  };

  const findRoute = () => {
    const queue = [start];
    const previous = new Map([[cellKey(start), null]]);
    for (let index = 0; index < queue.length; index += 1) {
      const current = queue[index];
      if (sameCell(current, exit)) break;
      neighbours(current).forEach((next) => {
        const key = cellKey(next);
        if (previous.has(key)) return;
        previous.set(key, cellKey(current));
        queue.push(next);
      });
    }
    const cells = [];
    let cursor = cellKey(exit);
    while (cursor) {
      const [x, y] = cursor.split(",").map(Number);
      cells.unshift({ x, y });
      cursor = previous.get(cursor);
    }
    return cells;
  };

  const takeRandomCells = (candidates, count) => {
    const shuffled = [...candidates];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swap = randomIndex(index + 1);
      [shuffled[index], shuffled[swap]] = [shuffled[swap], shuffled[index]];
    }
    return shuffled.slice(0, count);
  };
  const randomOpenCells = (count, reserved = []) => {
    const reservedKeys = new Set([
      cellKey(start),
      cellKey(exit),
      ...route.map(cellKey),
      ...reserved.map(cellKey),
    ]);
    const open = [];
    for (let y = 1; y < size - 1; y += 1) {
      for (let x = 1; x < size - 1; x += 1) {
        const cell = { x, y };
        if (walkable(x, y) && !reservedKeys.has(cellKey(cell))) open.push(cell);
      }
    }
    return takeRandomCells(open, Math.min(count, open.length));
  };

  const configureFeatures = () => {
    shards = takeRandomCells(
      route.slice(Math.max(2, Math.floor(route.length * 0.14)), route.length - 2),
      shardCount,
    );
    keyCell = level === 37 ? route[Math.floor(route.length * 0.3)] : null;
    gateCell = level === 37 ? route[Math.floor(route.length * 0.58)] : null;
    portals = [];
    hazards = [];
    guards = [];
    ice = [];
    collapse = [];
    unstable = [];
    const reserved = [...shards, keyCell, gateCell].filter(Boolean);

    if ([32, 38, 39, 40].includes(level)) {
      const pairCount = level >= 39 ? 2 : 1;
      portals = randomOpenCells(pairCount * 2, [...reserved, ...portals]);
      portals.forEach((portal, index) => { portal.pair = index ^ 1; });
      reserved.push(...portals);
    }
    if ([34, 40].includes(level)) {
      ice = randomOpenCells(level === 40 ? 8 : 10, reserved);
      reserved.push(...ice);
    }
    if ([35, 39, 40].includes(level)) {
      hazards = randomOpenCells(level === 40 ? 8 : 5, reserved);
      reserved.push(...hazards);
    }
    if ([35, 40].includes(level)) {
      guards = randomOpenCells(level === 40 ? 3 : 2, [...reserved, ...hazards]);
      guards.forEach((guard) => {
        guard.direction = directions[randomIndex(directions.length)];
        guard.nextMove = 0;
      });
      reserved.push(...guards);
    }
    if ([36, 40].includes(level)) {
      collapse = randomOpenCells(level === 40 ? 10 : 12, reserved);
      collapse.forEach((cell) => { cell.timer = 0; });
      reserved.push(...collapse);
    }
    if ([38, 40].includes(level)) {
      unstable = randomOpenCells(level === 40 ? 8 : 6, reserved);
      unstable.forEach((cell) => { cell.open = true; });
    }
  };

  const rememberNearby = () => {
    if (!discovered) discovered = new Set();
    for (let y = player.y - 3; y <= player.y + 3; y += 1) {
      for (let x = player.x - 3; x <= player.x + 3; x += 1) {
        if (inside(x, y) && Math.abs(player.x - x) + Math.abs(player.y - y) <= 4) {
          discovered.add(cellKey({ x, y }));
        }
      }
    }
  };

  const updateReadouts = () => {
    setText("shardReadout", translations.shards(shards.filter((cell) => cell.collected).length, shardCount));
    setText("energyReadout", translations.lives(energy));
  };

  const render = () => {
    const fragmentCells = new Set(shards.filter((cell) => !cell.collected).map(cellKey));
    const portalCells = new Map(portals.map((cell) => [cellKey(cell), cell]));
    const hazardCells = new Set(hazards.map(cellKey));
    const guardCells = new Set(guards.map(cellKey));
    const iceCells = new Set(ice.map(cellKey));
    const fragileCells = new Set(collapse.filter((cell) => cell.timer >= 0).map(cellKey));
    const collapsedCells = new Set(collapse.filter((cell) => cell.timer < 0).map(cellKey));
    const unstableCells = new Map(unstable.map((cell) => [cellKey(cell), cell]));
    const cells = document.createDocumentFragment();

    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const cell = { x, y };
        const key = cellKey(cell);
        const button = document.createElement("button");
        const isFogged = level === 33 && !discovered.has(key);
        button.type = "button";
        button.className = "maze-cell";
        button.tabIndex = -1;
        button.disabled = isFogged || map[y][x] === 1 || collapsedCells.has(key);
        if (map[y][x] === 1) button.classList.add("is-wall");
        if (isFogged) button.classList.add("is-fogged");
        if (cellKey(start) === key) button.classList.add("is-start");
        if (cellKey(exit) === key) button.classList.add("is-exit");
        if (fragmentCells.has(key)) button.classList.add("has-shard");
        if (portalCells.has(key)) button.classList.add("has-portal");
        if (hazardCells.has(key)) button.classList.add("has-hazard");
        if (guardCells.has(key)) button.classList.add("has-guard");
        if (iceCells.has(key)) button.classList.add("is-ice");
        if (fragileCells.has(key)) button.classList.add("has-fragile");
        if (collapsedCells.has(key)) button.classList.add("is-collapsed");
        if (keyCell && sameCell(keyCell, cell) && !hasKey) button.classList.add("has-key");
        if (gateCell && sameCell(gateCell, cell)) {
          button.classList.add(hasKey ? "gate-open" : "gate-closed");
          button.disabled = !hasKey;
        }
        if (unstableCells.has(key)) {
          button.classList.add(unstableCells.get(key).open ? "is-stable" : "is-unstable");
          if (!unstableCells.get(key).open) button.disabled = true;
        }
        if (player && sameCell(player, cell)) {
          button.classList.add("has-player");
          button.setAttribute("aria-label", translations.player);
          button.textContent = "●";
        } else if (cellKey(exit) === key) {
          button.setAttribute("aria-label", translations.exit);
          button.textContent = "✦";
        } else if (fragmentCells.has(key)) {
          button.setAttribute("aria-label", language === "en" ? "Fragment" : "Fragment");
          button.textContent = "◆";
        } else if (portalCells.has(key)) {
          button.setAttribute("aria-label", translations.portal);
          button.textContent = "◎";
        } else if (hazardCells.has(key)) {
          button.setAttribute("aria-label", translations.hazard);
          button.textContent = "×";
        } else if (guardCells.has(key)) {
          button.setAttribute("aria-label", translations.guard);
          button.textContent = "◈";
        } else if (keyCell && sameCell(keyCell, cell) && !hasKey) {
          button.setAttribute("aria-label", translations.key);
          button.textContent = "⚿";
        } else if (iceCells.has(key)) {
          button.setAttribute("aria-label", language === "en" ? "Ice" : "Glace");
          button.textContent = "❄";
        } else if (fragileCells.has(key)) {
          button.setAttribute("aria-label", language === "en" ? "Fragile tile" : "Dalle fragile");
          button.textContent = "▱";
        } else if (cellKey(start) === key) {
          button.setAttribute("aria-label", language === "en" ? "Start" : "Départ");
          button.textContent = "⌂";
        } else {
          button.setAttribute("aria-label", isFogged ? "" : " ");
        }
        button.addEventListener("click", () => moveTo(cell));
        cells.appendChild(button);
      }
    }
    board.replaceChildren(cells);
    board.classList.toggle("has-fog", level === 33);
    board.classList.toggle("is-playing", active && !solved);
    updateReadouts();
  };

  const loseEnergy = () => {
    energy -= 1;
    if (energy <= 0) {
      active = false;
      setText("puzzleStatus", translations.dead);
      $("puzzleStatus").className = "puzzle-status error";
      $("startPuzzleButton").hidden = false;
      $("startPuzzleButton").textContent = translations.start;
      render();
      return true;
    }
    player = { ...start };
    rememberNearby();
    setText("puzzleStatus", translations.hit);
    $("puzzleStatus").className = "puzzle-status error";
    return false;
  };

  const moveGuard = (guard) => {
    if (moves < guard.nextMove) return;
    guard.nextMove = moves + 3;
    const available = neighbours(guard).filter((cell) =>
      !sameCell(cell, start) && !sameCell(cell, exit) &&
      !route.some((routeCell) => sameCell(routeCell, cell)));
    if (!available.length) return;
    const next = available[randomIndex(available.length)];
    guard.x = next.x;
    guard.y = next.y;
  };

  const settleOnCell = () => {
    const shard = shards.find((cell) => sameCell(cell, player) && !cell.collected);
    if (shard) shard.collected = true;
    if (keyCell && sameCell(keyCell, player)) {
      hasKey = true;
      keyCell = null;
    }

    const portal = portals.find((cell) => sameCell(cell, player));
    if (portal) {
      const paired = portals[portal.pair];
      if (paired) player = { x: paired.x, y: paired.y };
    }

    const hitHazard = hazards.some((cell) => sameCell(cell, player));
    const hitGuard = guards.some((cell) => sameCell(cell, player));
    if (hitHazard || hitGuard) {
      if (loseEnergy()) return;
    }
    if (gateCell && sameCell(gateCell, player) && !hasKey) {
      player = { ...route[Math.max(0, route.findIndex((cell) => sameCell(cell, gateCell)) - 1)] };
      setText("puzzleStatus", translations.gateLocked);
      $("puzzleStatus").className = "puzzle-status error";
    }

    if (collapse.some((cell) => sameCell(cell, player))) {
      const tile = collapse.find((cell) => sameCell(cell, player));
      tile.timer = 7;
    }
    if (sameCell(player, exit)) {
      const allCollected = shards.every((cell) => cell.collected);
      if (allCollected && (!gateCell || hasKey)) {
        completeLevel();
        return;
      }
      player = { ...route[Math.max(0, route.length - 2)] };
    }
    rememberNearby();
    render();
  };

  const moveTo = (cell, direction = null) => {
    if (!active || solved) return;
    const dx = cell.x - player.x;
    const dy = cell.y - player.y;
    if (Math.abs(dx) + Math.abs(dy) !== 1) return;
    if (!walkable(cell.x, cell.y)) return;
    const key = cellKey(cell);
    if (gateCell && sameCell(gateCell, cell) && !hasKey) {
      setText("puzzleStatus", translations.gateLocked);
      $("puzzleStatus").className = "puzzle-status error";
      return;
    }
    const unstableCell = unstable.find((tile) => sameCell(tile, cell));
    if (unstableCell && !unstableCell.open) return;
    if (collapse.some((tile) => sameCell(tile, cell) && tile.timer < 0)) return;

    moves += 1;
    player = { ...cell };
    if (level === 34 && ice.some((tile) => sameCell(tile, player)) && direction) {
      let slides = 0;
      while (slides < size && ice.some((tile) => sameCell(tile, player))) {
        const next = { x: player.x + direction.x, y: player.y + direction.y };
        if (!walkable(next.x, next.y)) break;
        if (gateCell && sameCell(gateCell, next) && !hasKey) break;
        player = next;
        slides += 1;
      }
    }

    if (level === 38 || level === 40) {
      if (moves % 4 === 0) unstable.forEach((tile) => { tile.open = !tile.open; });
    }
    guards.forEach(moveGuard);
    collapse.forEach((tile) => {
      if (tile.timer > 0 && !sameCell(tile, player)) {
        tile.timer -= 1;
        if (tile.timer === 0) tile.timer = -1;
      }
    });
    settleOnCell();
  };

  const completeLevel = () => {
    active = false;
    solved = true;
    completed.add(level);
    localStorage.setItem(progressKey, JSON.stringify([...completed].sort((a, b) => a - b)));
    const saved = currentUser === "guest" || Boolean(window.EchoesSave?.saveProgress({
      currentPage: `level-${level + 1}`,
      currentLevel: level + 1,
      completedLevels: [...completed].sort((a, b) => a - b),
    }));
    setText("puzzleStatus", saved ? translations.solved : translations.saveError);
    $("puzzleStatus").className = `puzzle-status ${saved ? "success" : "error"}`;
    setText("systemMessage", translations.complete(level));
    $("puzzlePanel").classList.add("is-solved");
    $("startPuzzleButton").hidden = true;
    $("nextLevelButton").hidden = false;
    renderProgress();
    render();
    $("nextLevelButton").focus();
  };

  const renderProgress = () => {
    const progress = $("levelProgress");
    progress.setAttribute("aria-label", translations.progress);
    progress.replaceChildren();
    for (let current = 31; current <= 40; current += 1) {
      const marker = document.createElement("span");
      marker.className = "level-square";
      if (completed.has(current)) marker.classList.add("completed");
      if (current === level) marker.classList.add("current");
      progress.appendChild(marker);
    }
  };

  const resetGame = () => {
    generateMaze();
    route = findRoute();
    configureFeatures();
    player = { ...start };
    discovered = new Set();
    energy = 3;
    moves = 0;
    hasKey = false;
    solved = false;
    active = true;
    rememberNearby();
    $("puzzlePanel").classList.remove("is-solved");
    $("nextLevelButton").hidden = true;
    $("startPuzzleButton").hidden = true;
    setText("puzzleStatus", translations.playing);
    $("puzzleStatus").className = "puzzle-status";
    render();
  };

  const startNewMap = () => {
    resetGame();
    active = false;
    setText("puzzleStatus", translations.waiting);
    $("startPuzzleButton").hidden = false;
    $("startPuzzleButton").textContent = translations.start;
    render();
  };

  $("startPuzzleButton").addEventListener("click", () => {
    if (solved) return;
    if (!map || energy <= 0) {
      resetGame();
      return;
    }
    active = true;
    $("startPuzzleButton").hidden = true;
    setText("puzzleStatus", translations.playing);
    $("puzzleStatus").className = "puzzle-status";
  });
  $("resetButton").addEventListener("click", startNewMap);
  $("nextLevelButton").addEventListener("click", () => {
    if (!solved) return;
    window.location.href = level < 40 ? `niveau-${level + 1}.html` : "niveau-31.html";
  });
  document.querySelectorAll("[data-direction]").forEach((button) => {
    const direction = directions[Number(button.dataset.direction)];
    button.addEventListener("click", () => {
      if (player) moveTo({ x: player.x + direction.x, y: player.y + direction.y }, direction);
    });
  });
  document.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    const direction = directions.find((item) => item.key.toLowerCase() === key) ||
      (key === "w" || key === "z" ? directions[0] :
        key === "a" || key === "q" ? directions[1] :
          key === "s" ? directions[2] :
            key === "d" ? directions[3] : null);
    if (!direction) return;
    event.preventDefault();
    if (player) moveTo({ x: player.x + direction.x, y: player.y + direction.y }, direction);
  });

  renderProgress();
  startNewMap();
})();
