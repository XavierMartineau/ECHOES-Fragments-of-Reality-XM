(() => {
  const board = document.getElementById("logicBoard");
  if (!board) return;

  const language = localStorage.getItem("echoes-language") === "en" ? "en" : "fr";
  const copy = {
    fr: {
      part: "PARTIE 2 // FRACTURES",
      level: "NIVEAU 16",
      eyebrow: "Fragment 016 // Le réseau dormant",
      title: "Le réseau dormant",
      description: "Le réseau s'est éteint. Chaque impulsion inverse une cellule et ses voisines : éteins toute la grille.",
      systemLabel: "ECHO://RESEAU",
      puzzleKicker: "PUZZLE // INVERSION LOGIQUE",
      puzzleTitle: "Grille d'impulsions",
      start: "RÉVEILLER LE RÉSEAU",
      next: "CONTINUER VERS LE NIVEAU 17",
      reset: "Réinitialiser",
      ready: "Réveille le réseau, puis éteins toutes les cellules.",
      playing: "Chaque impulsion inverse la cellule choisie et ses voisines directes.",
      roundSuccess: "Réseau stabilisé. Une nouvelle grille de plus grande complexité apparaît.",
      success: "Les trois réseaux sont stabilisés. La fracture s'apaise.",
      system: "SYSTEME:: RESEAU 016 EN VEILLE // IMPULSION REQUISE",
      systemSuccess: "SYSTEME:: RESEAU 016 STABILISE // PROTOCOLE 017 DEBLOQUE",
      cell: "Cellule",
      on: "allumée",
      off: "éteinte",
      moves: "Impulsions",
      board: "Grille logique",
      progress: "Progression de la Partie 2",
      save: "SAUVEGARDER",
      saved: "SAUVEGARDÉ",
      saveHint: "Progression sauvegardée.",
      footer: "ÉCHO // FRACTURES ACTIVES",
      counter: "16 / 60",
    },
    en: {
      part: "PART 2 // FRACTURES",
      level: "LEVEL 16",
      eyebrow: "Fragment 016 // The dormant network",
      title: "The dormant network",
      description: "The network has gone dark. Each pulse toggles a cell and its neighbors: switch off the entire grid.",
      systemLabel: "ECHO://NETWORK",
      puzzleKicker: "PUZZLE // LOGIC INVERSION",
      puzzleTitle: "Pulse grid",
      start: "WAKE THE NETWORK",
      next: "CONTINUE TO LEVEL 17",
      reset: "Reset",
      ready: "Wake the network, then switch off every cell.",
      playing: "Each pulse toggles the selected cell and its direct neighbors.",
      roundSuccess: "Network stabilized. A more complex grid appears.",
      success: "All three networks are stable. The fracture subsides.",
      system: "SYSTEM:: NETWORK 016 STANDBY // PULSE REQUIRED",
      systemSuccess: "SYSTEM:: NETWORK 016 STABILIZED // PROTOCOL 017 UNLOCKED",
      cell: "Cell",
      on: "on",
      off: "off",
      moves: "Pulses",
      board: "Logic grid",
      progress: "Part 2 progress",
      save: "SAVE",
      saved: "SAVED",
      saveHint: "Progress saved.",
      footer: "ECHO // ACTIVE FRACTURES",
      counter: "16 / 60",
    },
  }[language];

  const $ = (id) => document.getElementById(id);
  const status = $("puzzleStatus");
  const readout = $("progressReadout");
  const moveReadout = $("moveReadout");
  const startButton = $("startPuzzleButton");
  const resetButton = $("resetButton");
  const nextButton = $("nextLevelButton");
  const saveButton = $("saveGameButton");
  const systemMessage = $("systemMessage");
  const scrambles = [
    [0, 4, 8],
    [1, 3, 4, 5, 7],
    [0, 2, 3, 4, 5, 6, 8],
  ];
  const cells = [];
  let state = Array(9).fill(false);
  let round = 0;
  let moves = 0;
  let started = false;
  let solved = false;
  let advanceTimer = 0;

  document.documentElement.lang = language;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const value = copy[element.dataset.i18n];
    if (typeof value === "string") element.textContent = value;
  });
  $("levelProgress").setAttribute("aria-label", copy.progress);
  board.setAttribute("aria-label", copy.board);
  startButton.textContent = copy.start;
  resetButton.textContent = copy.reset;
  nextButton.textContent = copy.next;
  saveButton.textContent = copy.save;

  const setStatus = (message, variant = "") => {
    status.textContent = message;
    status.className = `puzzle-status${variant ? ` ${variant}` : ""}`;
  };

  const render = () => {
    cells.forEach((cell, index) => {
      cell.classList.toggle("is-on", state[index]);
      cell.disabled = !started || solved;
      cell.setAttribute("aria-pressed", String(state[index]));
      cell.setAttribute(
        "aria-label",
        `${copy.cell} ${Math.floor(index / 3) + 1}, ${index % 3 + 1}: ${state[index] ? copy.on : copy.off}`,
      );
    });
  };

  const renderReadouts = () => {
    readout.textContent = `${round} / ${scrambles.length}`;
    moveReadout.textContent = `${copy.moves}: ${moves}`;
  };

  const togglePulse = (index) => {
    const row = Math.floor(index / 3);
    const column = index % 3;
    [index, index - 3, index + 3, index - 1, index + 1].forEach((neighbor) => {
      if (neighbor < 0 || neighbor >= state.length) return;
      const neighborRow = Math.floor(neighbor / 3);
      const neighborColumn = neighbor % 3;
      if (Math.abs(row - neighborRow) + Math.abs(column - neighborColumn) !== 1 && neighbor !== index) return;
      state[neighbor] = !state[neighbor];
    });
  };

  const saveCompletion = () => {
    window.EchoesSave?.saveProgress({ currentPage: "level-16", currentLevel: 16 });
  };

  const completeRound = () => {
    round += 1;
    renderReadouts();
    if (round === scrambles.length) {
      solved = true;
      board.classList.add("is-solved");
      setStatus(copy.success, "success");
      systemMessage.textContent = copy.systemSuccess;
      nextButton.hidden = false;
      startButton.disabled = true;
      render();
      saveCompletion();
      nextButton.focus();
      return;
    }

    started = false;
    render();
    setStatus(copy.roundSuccess, "success");
    advanceTimer = window.setTimeout(() => {
      started = true;
      buildRound();
      if (!solved) setStatus(copy.playing);
    }, 900);
  };

  const buildRound = () => {
    state = Array(9).fill(false);
    scrambles[round].forEach(togglePulse);
    moves = 0;
    renderReadouts();
    render();
  };

  const reset = () => {
    window.clearTimeout(advanceTimer);
    round = 0;
    moves = 0;
    started = false;
    solved = false;
    board.classList.remove("is-solved");
    systemMessage.textContent = copy.system;
    nextButton.hidden = true;
    startButton.disabled = false;
    setStatus(copy.ready);
    buildRound();
  };

  for (let index = 0; index < 9; index += 1) {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "logic-cell";
    cell.addEventListener("click", () => {
      if (!started || solved) return;
      togglePulse(index);
      moves += 1;
      renderReadouts();
      render();
      if (state.every((isOn) => !isOn)) completeRound();
      else setStatus(copy.playing);
    });
    board.appendChild(cell);
    cells.push(cell);
  }

  startButton.addEventListener("click", () => {
    started = true;
    startButton.disabled = true;
    render();
    setStatus(copy.playing);
  });
  resetButton.addEventListener("click", reset);
  nextButton.addEventListener("click", () => {
    window.location.href = "niveau-17.html";
  });
  saveButton.addEventListener("click", () => {
    if (!window.EchoesSave?.saveProgress({ currentPage: "level-16", currentLevel: 16 })) return;
    saveButton.textContent = copy.saved;
    setStatus(copy.saveHint);
    window.setTimeout(() => {
      saveButton.textContent = copy.save;
    }, 1800);
  });

  for (let level = 11; level <= 20; level += 1) {
    const marker = document.createElement("span");
    marker.className = `level-square${level === 16 ? " current" : ""}`;
    marker.setAttribute("aria-hidden", "true");
    $("levelProgress").appendChild(marker);
  }

  reset();
})();
