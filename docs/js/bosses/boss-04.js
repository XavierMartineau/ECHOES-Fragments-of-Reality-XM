(() => {
  const board = document.getElementById("mirrorBoard");
  if (!board) return;

  const english = localStorage.getItem("echoes-language") === "en";
  const keyNumber = 4;
  const keyId = "resonance-4";
  const nextUrl = document.body.dataset.nextUrl;
  const copy = english
    ? {
        start: "START THE FIGHT",
        fire: "FIRE THE BEAM",
        next: "CONTINUE TO LEVEL 21",
        reset: "RESET FIGHT",
        title: "The Prism Warden",
        kicker: "BOSS // PRISM ROUTING PROTOCOL",
        description: "Rotate the mirrors to route the beam from source to receiver. Each stage adds another turn or a decoy mirror. A failed pulse costs one coherence.",
        arena: "Mirror routing",
        help: "Click a mirror to rotate it between / and \\. Trace the beam from S to the gold receiver. Test the route with FIRE THE BEAM; only a missed pulse costs coherence. Solve three increasingly complex boards.",
        status: "Rotate the mirrors, trace the route from S to the receiver, then fire a test pulse.",
        stage: (n) => `PRISM ROUTE ${n} / 3`,
        hint: (n) => [`Two reflections reach the receiver. Ignore the decoy.`, `Three reflections are required; the last turn points the beam north.`, `Route through three reflections. The final mirror turns the beam south.`][n],
        miss: "The beam missed. One coherence lost; the mirror positions are unchanged.",
        hit: "Receiver aligned. The prism is opening the next route…",
        lost: "Your coherence collapsed. Reset the fight to recalibrate the prism.",
        victory: "The Prism Warden is defeated. Resonance key 04 is yours.",
        rewardError: "Key 04 could not be saved. Check your save and retry.",
        integrity: (n) => `${n} coherence remaining`,
        source: "SOURCE",
        receiver: "RECEIVER",
        wall: "ABSORBER",
        mirror: (orientation) => `Mirror ${orientation}; click to rotate`,
        open: "Empty path",
        key: "RESONANCE 04",
        gotKey: "KEY 04 // RECOVERED",
        needKey: "KEY 04 // TO RECOVER",
      }
    : {
        start: "DÉMARRER LE COMBAT",
        fire: "ÉMETTRE LE FAISCEAU",
        next: "CONTINUER VERS LE NIVEAU 21",
        reset: "RECOMMENCER LE COMBAT",
        title: "Le Gardien prismatique",
        kicker: "BOSS // PROTOCOLE DE ROUTAGE PRISMATIQUE",
        description: "Oriente les miroirs pour guider le faisceau de la source au récepteur. Chaque phase ajoute un virage ou un miroir-leurre. Un tir manqué coûte une unité de cohérence.",
        arena: "Routage des miroirs",
        help: "Clique un miroir pour le basculer entre / et \\. Trace le faisceau de S au récepteur doré. Teste le trajet avec ÉMETTRE LE FAISCEAU; seul un tir manqué coûte de la cohérence. Résous trois plateaux de plus en plus complexes.",
        status: "Oriente les miroirs, trace le trajet de S au récepteur, puis teste le faisceau.",
        stage: (n) => `ROUTE PRISMATIQUE ${n} / 3`,
        hint: (n) => [`Deux réflexions atteignent le récepteur. Ignore le leurre.`, `Trois réflexions sont nécessaires; le dernier virage dirige le faisceau vers le nord.`, `Effectue trois réflexions. Le dernier miroir renvoie le faisceau vers le sud.`][n],
        miss: "Le faisceau a manqué le récepteur. Une unité de cohérence perdue; les miroirs gardent leur position.",
        hit: "Récepteur aligné. Le prisme ouvre la route suivante…",
        lost: "Ta cohérence s'est effondrée. Recommence le combat pour recalibrer le prisme.",
        victory: "Le Gardien prismatique est vaincu. La clé de résonance 04 est à toi.",
        rewardError: "La clé 04 n'a pas pu être enregistrée. Vérifie ta sauvegarde et réessaie.",
        integrity: (n) => `${n} unités de cohérence restantes`,
        source: "SOURCE",
        receiver: "RÉCEPTEUR",
        wall: "ABSORBEUR",
        mirror: (orientation) => `Miroir ${orientation}; cliquer pour pivoter`,
        open: "Trajet libre",
        key: "RÉSONANCE 04",
        gotKey: "CLÉ 04 // RÉCUPÉRÉE",
        needKey: "CLÉ 04 // À RÉCUPÉRER",
      };

  const routes = [
    {
      source: [2, 0],
      target: [0, 4],
      mirrors: [
        { cell: [2, 1], solution: "/" },
        { cell: [0, 1], solution: "/" },
        { cell: [4, 3], solution: "\\" },
      ],
      walls: [[2, 3]],
    },
    {
      source: [3, 0],
      target: [0, 3],
      mirrors: [
        { cell: [3, 1], solution: "/" },
        { cell: [1, 1], solution: "/" },
        { cell: [1, 3], solution: "/" },
        { cell: [4, 2], solution: "\\" },
      ],
      walls: [[2, 3], [3, 4]],
    },
    {
      source: [3, 0],
      target: [3, 3],
      mirrors: [
        { cell: [3, 1], solution: "/" },
        { cell: [1, 1], solution: "/" },
        { cell: [1, 3], solution: "\\" },
        { cell: [0, 0], solution: "/" },
        { cell: [4, 4], solution: "\\" },
      ],
      walls: [[2, 2], [4, 1], [0, 4]],
    },
  ];

  const directions = {
    N: [-1, 0],
    E: [0, 1],
    S: [1, 0],
    W: [0, -1],
  };
  const slash = { N: "E", E: "N", S: "W", W: "S" };
  const backslash = { N: "W", W: "N", S: "E", E: "S" };
  const startButton = document.getElementById("startBossButton");
  const fireButton = document.getElementById("fireButton");
  const nextButton = document.getElementById("nextLevelButton");
  const resetButton = document.getElementById("resetButton");
  const status = document.getElementById("puzzleStatus");
  const stageReadout = document.getElementById("phaseReadout");
  const integrityReadout = document.getElementById("integrityReadout");
  const hint = document.getElementById("routeHint");
  const keyCount = document.getElementById("keyCount");
  const keyHud = document.getElementById("keyHud");
  const keyHudNote = document.getElementById("keyHudNote");
  const keySlot = document.getElementById("keyHudSlot");
  const keyImage = keySlot.querySelector("img");
  let stage = 0;
  let integrity = 5;
  let started = false;
  let ended = false;
  let busy = false;
  let tiles = [];
  let mirrors = new Map();

  const setStatus = (message, error = false) => {
    status.textContent = message;
    status.classList.toggle("error", error);
    status.classList.toggle("success", !error && ended);
    document.getElementById("systemMessage").textContent = message.toUpperCase();
  };

  const indexOf = ([row, column]) => row * 5 + column;
  const makeBoard = () => {
    board.replaceChildren();
    tiles = [];
    mirrors = new Map();
    const config = routes[stage];
    const sourceIndex = indexOf(config.source);
    const targetIndex = indexOf(config.target);
    const walls = new Set(config.walls.map(indexOf));
    config.mirrors.forEach((mirror) => {
      mirrors.set(indexOf(mirror.cell), { ...mirror, orientation: mirror.solution === "/" ? "\\" : "/" });
    });

    for (let index = 0; index < 25; index += 1) {
      const tile = document.createElement("button");
      const mirror = mirrors.get(index);
      tile.type = "button";
      tile.className = "boss04-tile";
      tile.disabled = !started || ended || !mirror;
      if (index === sourceIndex) {
        tile.classList.add("is-source");
        tile.innerHTML = `<span>➜</span><small>${copy.source}</small>`;
      } else if (index === targetIndex) {
        tile.classList.add("is-receiver");
        tile.innerHTML = `<span>◎</span><small>${copy.receiver}</small>`;
      } else if (mirror) {
        tile.classList.add("is-mirror");
        tile.innerHTML = `<span class="mirror-glyph">${mirror.orientation}</span>`;
        tile.setAttribute("aria-label", copy.mirror(mirror.orientation));
        tile.addEventListener("click", () => {
          mirror.orientation = mirror.orientation === "/" ? "\\" : "/";
          tile.querySelector(".mirror-glyph").textContent = mirror.orientation;
          tile.setAttribute("aria-label", copy.mirror(mirror.orientation));
          tile.classList.toggle("is-slash", mirror.orientation === "/");
          tile.classList.toggle("is-slash", mirror.orientation === "/");
        });
        tile.classList.toggle("is-slash", mirror.orientation === "/");
      } else if (walls.has(index)) {
        tile.classList.add("is-wall");
        tile.textContent = "◆";
        tile.setAttribute("aria-label", copy.wall);
      } else {
        tile.classList.add("is-open");
        tile.setAttribute("aria-label", copy.open);
      }
      tiles.push(tile);
      board.appendChild(tile);
    }
    stageReadout.textContent = copy.stage(stage + 1);
    integrityReadout.textContent = copy.integrity(integrity);
    hint.textContent = copy.hint(stage);
  };

  const traceBeam = () => {
    const config = routes[stage];
    let [row, column] = config.source;
    let direction = "E";
    const target = indexOf(config.target);
    const walls = new Set(config.walls.map(indexOf));
    const path = [];
    const seen = new Set();
    for (let step = 0; step < 32; step += 1) {
      const [dr, dc] = directions[direction];
      row += dr;
      column += dc;
      if (row < 0 || column < 0 || row >= 5 || column >= 5) return { hit: false, path };
      const index = row * 5 + column;
      path.push(index);
      if (index === target) return { hit: true, path };
      if (walls.has(index)) return { hit: false, path };
      const state = `${index}:${direction}`;
      if (seen.has(state)) return { hit: false, path };
      seen.add(state);
      const mirror = mirrors.get(index);
      if (mirror) direction = (mirror.orientation === "/" ? slash : backslash)[direction];
    }
    return { hit: false, path };
  };

  const showBeam = (path) => {
    path.forEach((index, step) => {
      window.setTimeout(() => {
        if (tiles[index]) tiles[index].classList.add("is-beam");
      }, step * 65);
    });
    window.setTimeout(() => tiles.forEach((tile) => tile.classList.remove("is-beam")), path.length * 65 + 650);
  };

  const grantKey = () => {
    if (!window.EchoesSave.unlockKey("resonance-4")) {
      setStatus(copy.rewardError, true);
      return false;
    }
    if (!window.EchoesLevels.markCompleted("boss-04")) {
      setStatus(copy.rewardError, true);
      return false;
    }
    window.EchoesSave.saveProgress({
      currentPage: "level-21",
      currentLevel: 21,
    });
    keyCount.textContent = "4 / 6";
    keyHud.classList.add("is-unlocked");
    keyHudNote.textContent = copy.gotKey;
    keySlot.classList.add("is-visible");
    nextButton.hidden = false;
    return true;
  };

  const win = () => {
    ended = true;
    started = false;
    document.querySelector(".boss04-panel").classList.add("is-victory");
    setStatus(copy.victory);
    fireButton.disabled = true;
    if (grantKey()) nextButton.hidden = false;
    tiles.forEach((tile) => (tile.disabled = true));
  };

  const fire = () => {
    if (!started || ended || busy) return;
    busy = true;
    fireButton.disabled = true;
    const result = traceBeam();
    showBeam(result.path);
    if (result.hit) {
      stage += 1;
      if (stage === routes.length) {
        window.setTimeout(win, result.path.length * 65 + 180);
      } else {
        window.setTimeout(() => {
          busy = false;
          makeBoard();
          setStatus(copy.hit);
          fireButton.disabled = false;
        }, result.path.length * 65 + 650);
      }
    } else {
      integrity -= 1;
      integrityReadout.textContent = copy.integrity(integrity);
      if (integrity <= 0) {
        ended = true;
        started = false;
        setStatus(copy.lost, true);
        fireButton.disabled = true;
        tiles.forEach((tile) => (tile.disabled = true));
        return;
      }
      window.setTimeout(() => {
        busy = false;
        setStatus(copy.miss, true);
        fireButton.disabled = false;
      }, result.path.length * 65 + 650);
    }
  };

  const resetFight = () => {
    stage = 0;
    integrity = 5;
    started = false;
    ended = false;
    busy = false;
    document.querySelector(".boss04-panel").classList.remove("is-victory");
    startButton.hidden = false;
    fireButton.disabled = true;
    nextButton.hidden = true;
    makeBoard();
    setStatus(copy.status);
  };

  document.documentElement.lang = english ? "en" : "fr";
  document.getElementById("bossTitle").textContent = copy.title;
  document.getElementById("bossKicker").textContent = copy.kicker;
  document.getElementById("bossDescription").textContent = copy.description;
  document.getElementById("arenaTitle").textContent = copy.arena;
  document.getElementById("helpText").textContent = copy.help;
  document.querySelector(".boss04-panel .panel-kicker").textContent = english
    ? "FIGHT // OPTICAL PRECISION"
    : "COMBAT // OPTIQUE DE PRÉCISION";
  document.querySelector(".boss04-help summary").textContent = english
    ? "FIGHT PROTOCOL"
    : "PROTOCOLE DE COMBAT";
  document.querySelector(".boss04-key-hud > span:first-child").textContent = english
    ? "RESONANCES"
    : "RÉSONANCES";
  document.querySelector(".level-meta > span").textContent = english
    ? "PART 4 // RESONANCE"
    : "PARTIE 4 // RÉSONANCE";
  document.querySelector(".level-meta > strong").textContent = english
    ? "BOSS 04 // THE PRISM"
    : "BOSS 04 // LE PRISME";
  document.querySelector(".level-footer > span:first-child").textContent = english
    ? "ECHO // ACTIVE PRISM"
    : "ÉCHO // PRISME ACTIF";
  document.querySelector(".level-footer > span:last-child").textContent = "BOSS // 04";
  board.setAttribute("aria-label", english ? "Prismatic routing board" : "Plateau de routage prismatique");
  startButton.textContent = copy.start;
  fireButton.textContent = copy.fire;
  nextButton.textContent = copy.next;
  resetButton.textContent = copy.reset;
  keyCount.textContent = "4 / 6";
  keyImage.src = "../../assets/svg/cles/key-04-usb.svg";
  keyImage.alt = english ? "Resonance key 04" : "Clé de résonance 04";
  keyHudNote.textContent = copy.needKey;
  document.getElementById("levelProgress").setAttribute("aria-label", english ? "Part 4 progress" : "Progression de la Partie 4");
  for (let level = 16; level <= 20; level += 1) {
    const marker = document.createElement("span");
    marker.className = `level-square${level === 20 ? " current" : ""}`;
    marker.setAttribute("aria-hidden", "true");
    document.getElementById("levelProgress").appendChild(marker);
  }
  startButton.addEventListener("click", () => {
    started = true;
    startButton.hidden = true;
    tiles.forEach((tile) => {
      if (tile.classList.contains("is-mirror")) tile.disabled = false;
    });
    fireButton.disabled = false;
    setStatus(copy.status);
  });
  fireButton.addEventListener("click", fire);
  resetButton.addEventListener("click", resetFight);
  nextButton.addEventListener("click", () => {
    window.location.href = nextUrl;
  });

  if (window.EchoesSave.getKeys().includes(keyId)) {
    startButton.hidden = true;
    nextButton.hidden = false;
    keyHud.classList.add("is-unlocked");
    keySlot.classList.add("is-visible");
    keyHudNote.textContent = copy.gotKey;
    setStatus(copy.victory);
  } else {
    setStatus(copy.status);
  }
  makeBoard();
})();
