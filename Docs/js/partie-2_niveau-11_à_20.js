/* PARTIE 2 // NIVEAUX 11-20
 * This file owns the shared back-navigation and autosave bootstrap for every
 * page in this range. Every puzzle controller for these levels lives below this bootstrap. */
const currentLevel = Number(
  window.location.pathname.match(/niveau-(\d+)/)?.[1] || 0,
);
const autoSave = () =>
  window.EchoesSave?.saveProgress({
    currentPage: `level-${currentLevel}`,
    currentLevel,
  });
if (window.EchoesSave) autoSave();
else {
  const script = document.createElement("script");
  script.src = "../../js/save-system.js";
  script.onload = autoSave;
  document.head.appendChild(script);
}

/* ===== NIVEAU 11 ===== */
(() => {
  const board = document.getElementById("alignmentBoard");
  if (!board) return;

  const language = localStorage.getItem("echoes-language") === "en" ? "en" : "fr";
  const copy = {
    fr: {
      part: "PARTIE 2 // FRACTURES",
      level: "NIVEAU 11",
      eyebrow: "Fragment 011 // Résonance double",
      title: "Double alignement",
      description:
        "Deux fragments vibrent en parallèle. Mémorise les formes affichées sur les deux lignes, puis reconstitue-les sans indice visuel.",
      systemLabel: "ECHO://RESONANCE",
      puzzleKicker: "PUZZLE // DOUBLE ALIGNEMENT",
      puzzleTitle: "Lignes de résonance",
      trayTitle: "FRAGMENTS À ALIGNER",
      footer: "ÉCHO // FRACTURES ACTIVES",
      counter: "11 / 60",
      board: "Alignement des deux lignes holographiques",
      line: ["FRAGMENT A", "FRAGMENT B"],
      shape: {
        circle: "cercle",
        triangle: "triangle",
        diamond: "losange",
        square: "carré",
      },
      slot: (line, position) => `${line}, emplacement ${position}`,
      tray: "Fragments à aligner",
      start: "OBSERVER LES DEUX LIGNES",
      ready: "Observe les deux lignes, mémorise leur ordre, puis replace les fragments sans indice visuel.",
      showing: (line, position, shape) =>
        `${line}, emplacement ${position} : ${shape}`,
      playing: "La séquence est masquée. Reproduis maintenant les deux lignes de mémoire.",
      selected: (shape) => `${shape} sélectionné. Place-le sur n'importe quel emplacement de même forme.`,
      wrong: "Cette forme ne correspond pas à l'emplacement. Choisis une forme identique.",
      hintButton: "INDICE (-5 S)",
      hintShowing: (line, position, shape) =>
        `Indice : l'emplacement ${position} de ${line} contient un ${shape}.`,
      hintNoSlots: "Toutes les formes visibles ont déjà été placées.",
      timerExpired: "Temps écoulé. Réinitialise le niveau pour retenter la séquence.",
      timeLeft: (seconds) => `Temps restant : ${seconds} secondes.`,
      success: "Les deux lignes vibrent à l'unisson. La résonance est stabilisée.",
      next: "CONTINUER VERS LE NIVEAU 12",
      reset: "Réinitialiser",
      system: "SYSTEME:: DEUX FRAGMENTS DETECTES // SYNCHRONISATION EN ATTENTE",
      systemSuccess: "SYSTEME:: DOUBLE RESONANCE STABILISEE // PROTOCOLE 012 DEBLOQUE",
      save: "SAUVEGARDER",
      saved: "SAUVEGARDÉ",
      saveHint: "Progression sauvegardée.",
      counter: "11 / 60",
      progress: "Progression de la Partie 2",
    },
    en: {
      part: "PART 2 // FRACTURES",
      level: "LEVEL 11",
      eyebrow: "Fragment 011 // Double resonance",
      title: "Double alignment",
      description:
        "Two fragments vibrate in parallel. Memorize the shapes shown on both lines, then rebuild them without visual hints.",
      systemLabel: "ECHO://RESONANCE",
      puzzleKicker: "PUZZLE // DOUBLE ALIGNMENT",
      puzzleTitle: "Resonance lines",
      trayTitle: "FRAGMENTS TO ALIGN",
      footer: "ECHO // ACTIVE FRACTURES",
      counter: "11 / 60",
      board: "Align the two holographic lines",
      line: ["FRAGMENT A", "FRAGMENT B"],
      shape: {
        circle: "circle",
        triangle: "triangle",
        diamond: "diamond",
        square: "square",
      },
      slot: (line, position) => `${line}, slot ${position}`,
      tray: "Fragments to align",
      start: "OBSERVE BOTH LINES",
      ready: "Observe both lines and memorize their order, then place the fragments without visual hints.",
      showing: (line, position, shape) =>
        `${line}, slot ${position}: ${shape}`,
      playing: "The sequence is hidden. Rebuild both lines from memory.",
      selected: (shape) => `${shape} selected. Place it in any slot with the same shape.`,
      wrong: "That shape does not match this slot. Choose an identical shape.",
      hintButton: "HINT (-5 S)",
      hintShowing: (line, position, shape) =>
        `Hint: slot ${position} in ${line} contains a ${shape}.`,
      hintNoSlots: "All visible shapes have already been placed.",
      timerExpired: "Time is up. Reset the level to try the sequence again.",
      timeLeft: (seconds) => `Time remaining: ${seconds} seconds.`,
      success: "Both lines now vibrate in unison. The resonance is stable.",
      next: "CONTINUE TO LEVEL 12",
      reset: "Reset",
      system: "SYSTEM:: TWO FRAGMENTS DETECTED // SYNCHRONIZATION PENDING",
      systemSuccess: "SYSTEM:: DOUBLE RESONANCE STABILIZED // PROTOCOL 012 UNLOCKED",
      save: "SAVE",
      saved: "SAVED",
      saveHint: "Progress saved.",
      counter: "11 / 60",
      progress: "Part 2 progress",
    },
  }[language];

  const $ = (id) => document.getElementById(id);
  const tray = $("resonancePieces");
  const status = $("puzzleStatus");
  const readout = $("progressReadout");
  const startButton = $("startPuzzleButton");
  const resetButton = $("resetButton");
  const nextButton = $("nextLevelButton");
  const saveButton = $("saveGameButton");
  const hintButton = $("hintButton");
  const timerReadout = $("timerReadout");
  const systemMessage = $("systemMessage");
  const TIMER_SECONDS = 30;
  const HINT_PENALTY_SECONDS = 5;
  const shapes = ["circle", "triangle", "diamond", "square"];
  const createPieces = () =>
    shapes.flatMap((shape) =>
      [1, 2].map((copyNumber) => ({
        id: `${shape}-${copyNumber}`,
        shape,
      })),
    );
  const pieces = createPieces();
  const slotKey = (line, position) => `${line}-${position}`;
  const placed = new Map();
  let selectedPiece = null;
  let started = false;
  let solved = false;
  let lineShapes = [];
  let previewSlot = null;
  let previewType = "";
  let playbackId = 0;
  let trayOrder = [];
  let remainingMilliseconds = TIMER_SECONDS * 1000;
  let timerDeadline = 0;
  let timerInterval = null;
  let hintTimeout = null;

  document.documentElement.lang = language;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const value = copy[element.dataset.i18n];
    if (typeof value === "string") element.textContent = value;
  });
  board.setAttribute("aria-label", copy.board);
  tray.setAttribute("aria-label", copy.tray);
  $("levelProgress").setAttribute("aria-label", copy.progress);
  startButton.textContent = copy.start;
  resetButton.textContent = copy.reset;
  nextButton.textContent = copy.next;
  hintButton.textContent = copy.hintButton;

  const setStatus = (message, state = "") => {
    status.textContent = message;
    status.className = `puzzle-status${state ? ` ${state}` : ""}`;
  };

  const shuffleShapes = () => {
    const row = [...shapes];
    for (let index = row.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [row[index], row[swapIndex]] = [row[swapIndex], row[index]];
    }
    return row;
  };

  const updateTimer = () => {
    const seconds = Math.max(0, Math.ceil(remainingMilliseconds / 1000));
    timerReadout.textContent = `00:${String(seconds).padStart(2, "0")}`;
    timerReadout.classList.toggle("is-warning", seconds <= 10);
  };

  const stopTimer = () => {
    if (timerInterval !== null) {
      window.clearInterval(timerInterval);
      timerInterval = null;
    }
  };

  const endTimedRound = () => {
    stopTimer();
    remainingMilliseconds = 0;
    updateTimer();
    started = false;
    hintButton.disabled = true;
    render();
    setStatus(copy.timerExpired, "error");
  };

  const startTimer = () => {
    remainingMilliseconds = TIMER_SECONDS * 1000;
    timerDeadline = Date.now() + remainingMilliseconds;
    updateTimer();
    stopTimer();
    timerInterval = window.setInterval(() => {
      remainingMilliseconds = Math.max(0, timerDeadline - Date.now());
      updateTimer();
      if (remainingMilliseconds === 0) endTimedRound();
    }, 100);
  };

  const render = () => {
    board.replaceChildren();
    tray.replaceChildren();
    for (let line = 0; line < 2; line += 1) {
      const lane = document.createElement("section");
      lane.className = "resonance-lane";
      lane.setAttribute("aria-label", copy.line[line]);
      const heading = document.createElement("h3");
      heading.className = "resonance-lane-title";
      heading.textContent = copy.line[line];
      lane.appendChild(heading);

      const slots = document.createElement("div");
      slots.className = `resonance-slots resonance-line-${line}`;
      lineShapes[line].forEach((shape, position) => {
        const key = slotKey(line, position);
        const currentPieceId = placed.get(key);
        const slot = document.createElement("button");
        slot.type = "button";
        slot.className = "resonance-slot";
        slot.setAttribute("aria-label", copy.slot(copy.line[line], position + 1));
        slot.dataset.line = String(line);
        slot.dataset.position = String(position);
        slot.addEventListener("click", () => placePiece(key));
        slot.addEventListener("dragover", (event) => {
          if (started && !solved) event.preventDefault();
        });
        slot.addEventListener("drop", (event) => {
          event.preventDefault();
          const pieceId = event.dataTransfer?.getData("text/plain");
          if (pieceId) placePiece(key, pieceId);
        });
        if (currentPieceId) {
          const piece = pieces.find((item) => item.id === currentPieceId);
          slot.classList.add("is-filled", `shape-${piece.shape}`);
          slot.innerHTML = `<span class="shape-icon shape-${piece.shape}" aria-hidden="true"></span>`;
        } else if (previewSlot === key) {
          slot.classList.add("is-preview", `is-${previewType}`, `shape-${shape}`);
          slot.innerHTML = `<span class="shape-icon shape-${shape}" aria-hidden="true"></span>`;
        } else {
          slot.innerHTML = `<span class="slot-index" aria-hidden="true">0${position + 1}</span>`;
        }
        slot.disabled = !started || solved;
        slots.appendChild(slot);
      });
      lane.appendChild(slots);
      board.appendChild(lane);
    }

    trayOrder.forEach((piece) => {
      if ([...placed.values()].includes(piece.id)) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = `resonance-piece shape-${piece.shape}`;
      button.dataset.piece = piece.id;
      button.draggable = started && !solved;
      button.disabled = !started || solved;
      button.classList.toggle("is-selected", selectedPiece === piece.id);
      button.setAttribute("aria-label", copy.shape[piece.shape]);
      button.innerHTML = `<span class="shape-icon shape-${piece.shape}" aria-hidden="true"></span>`;
      button.addEventListener("click", () => {
        selectedPiece = selectedPiece === piece.id ? null : piece.id;
        setStatus(copy.selected(copy.shape[piece.shape]));
        render();
        tray.querySelector(`[data-piece="${piece.id}"]`)?.focus();
      });
      button.addEventListener("dragstart", (event) => {
        event.dataTransfer?.setData("text/plain", piece.id);
        if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
        selectedPiece = piece.id;
      });
      tray.appendChild(button);
    });
    readout.textContent = `${placed.size} / 8`;
  };

  const saveCompletion = () => {
    window.EchoesSave?.saveProgress({
      currentPage: "level-11",
      currentLevel: 11,
    });
  };

  const showSequence = async () => {
    playbackId += 1;
    const activePlayback = playbackId;
    started = false;
    startButton.disabled = true;
    nextButton.hidden = true;
    for (let replay = 0; replay < 2; replay += 1) {
      for (let line = 0; line < lineShapes.length; line += 1) {
        for (let position = 0; position < lineShapes[line].length; position += 1) {
          if (activePlayback !== playbackId || solved) return;
          const shape = lineShapes[line][position];
          previewSlot = slotKey(line, position);
          previewType = "sequence";
          setStatus(copy.showing(copy.line[line], position + 1, copy.shape[shape]));
          render();
          await new Promise((resolve) => window.setTimeout(resolve, 1000));
        }
      }
    }
    if (activePlayback !== playbackId || solved) return;
    previewSlot = null;
    previewType = "";
    started = true;
    startButton.textContent = language === "en" ? "SEQUENCE OBSERVED" : "SÉQUENCE OBSERVÉE";
    render();
    hintButton.disabled = false;
    startTimer();
    setStatus(copy.playing);
    tray.querySelector(".resonance-piece")?.focus();
  };

  const placePiece = (key, pieceId = selectedPiece) => {
    if (!started || solved || !pieceId || placed.has(key)) return;
    const piece = pieces.find((item) => item.id === pieceId);
    const [line, position] = key.split("-").map(Number);
    if (!piece) return;

    const expectedShape = lineShapes[line]?.[position];
    if (!expectedShape || piece.shape !== expectedShape) {
      selectedPiece = null;
      board.classList.remove("is-desynchronized");
      void board.offsetWidth;
      board.classList.add("is-desynchronized");
      setStatus(copy.wrong, "error");
      render();
      return;
    }

    placed.set(key, pieceId);
    selectedPiece = null;
    render();
    if (placed.size === 8) {
      solved = true;
      stopTimer();
      hintButton.disabled = true;
      board.classList.add("is-synchronized");
      render();
      setStatus(copy.success, "success");
      systemMessage.textContent = copy.systemSuccess;
      nextButton.hidden = false;
      startButton.disabled = true;
      saveCompletion();
      nextButton.focus();
    } else {
      setStatus(copy.playing);
    }
  };

  const reset = () => {
    playbackId += 1;
    stopTimer();
    if (hintTimeout !== null) {
      window.clearTimeout(hintTimeout);
      hintTimeout = null;
    }
    placed.clear();
    selectedPiece = null;
    started = false;
    solved = false;
    previewSlot = null;
    previewType = "";
    lineShapes = [shuffleShapes(), shuffleShapes()];
    trayOrder = [...pieces].sort(() => Math.random() - 0.5);
    remainingMilliseconds = TIMER_SECONDS * 1000;
    timerDeadline = 0;
    updateTimer();
    board.classList.remove("is-synchronized", "is-desynchronized");
    systemMessage.textContent = copy.system;
    startButton.disabled = false;
    startButton.textContent = copy.start;
    hintButton.disabled = true;
    nextButton.hidden = true;
    setStatus(copy.ready);
    render();
  };

  const showHint = () => {
    if (!started || solved || remainingMilliseconds <= 0) return;
    const availableSlots = [];
    lineShapes.forEach((row, line) => {
      row.forEach((shape, position) => {
        const key = slotKey(line, position);
        if (!placed.has(key)) availableSlots.push({ key, line, position, shape });
      });
    });

    timerDeadline = Math.max(Date.now(), timerDeadline - HINT_PENALTY_SECONDS * 1000);
    remainingMilliseconds = Math.max(0, timerDeadline - Date.now());
    updateTimer();
    if (remainingMilliseconds <= 0) {
      endTimedRound();
      return;
    }
    if (availableSlots.length === 0) {
      setStatus(copy.hintNoSlots);
      return;
    }

    if (hintTimeout !== null) window.clearTimeout(hintTimeout);
    const hint = availableSlots[Math.floor(Math.random() * availableSlots.length)];
    previewSlot = hint.key;
    previewType = "hint";
    render();
    setStatus(copy.hintShowing(copy.line[hint.line], hint.position + 1, copy.shape[hint.shape]));
    hintTimeout = window.setTimeout(() => {
      previewSlot = null;
      previewType = "";
      hintTimeout = null;
      render();
      if (started) setStatus(copy.timeLeft(Math.ceil(remainingMilliseconds / 1000)));
    }, 1400);
  };

  startButton.addEventListener("click", showSequence);
  hintButton.addEventListener("click", showHint);
  resetButton.addEventListener("click", reset);
  nextButton.addEventListener("click", () => {
    window.location.href = "niveau-12.html";
  });
  saveButton.addEventListener("click", () => {
    const saved = window.EchoesSave?.saveProgress({
      currentPage: "level-11",
      currentLevel: 11,
    });
    if (!saved) return;
    saveButton.textContent = copy.saved;
    setStatus(copy.saveHint);
    window.setTimeout(() => {
      saveButton.textContent = copy.save;
    }, 1800);
  });

  const progress = $("levelProgress");
  for (let level = 11; level <= 20; level += 1) {
    const marker = document.createElement("span");
    marker.className = `level-square${level === 11 ? " current" : ""}`;
    marker.setAttribute("aria-hidden", "true");
    progress.appendChild(marker);
  }

  reset();
})();

/* ===== NIVEAU 12 ===== */
(() => {
  const board = document.getElementById("crossIntersections");
  if (!board) return;

  const language = localStorage.getItem("echoes-language") === "en" ? "en" : "fr";
  const copy = {
    fr: {
      part: "PARTIE 2 // FRACTURES",
      level: "NIVEAU 12",
      eyebrow: "Fragment 012 // Lumière croisée",
      title: "Lumière croisée",
      description:
        "La lumière se croise… mais ne se brise jamais. Observe les intersections qui s'illuminent, puis réactive-les dans le même ordre.",
      systemLabel: "ECHO://PHOTON",
      puzzleKicker: "PUZZLE // SÉQUENCE CROISÉE",
      puzzleTitle: "Intersections lumineuses",
      footer: "ÉCHO // FRACTURES ACTIVES",
      counter: "12 / 60",
      intersections: "Intersections lumineuses",
      point: (number) => `Intersection lumineuse ${number}`,
      start: "OBSERVER LA SÉQUENCE",
      replay: "REVOIR LA SÉQUENCE",
      ready: "Observe la séquence lumineuse, puis reproduis-la dans le même ordre.",
      showing: "Observe le chemin de lumière…",
      playing: "À toi : active les intersections dans le même ordre.",
      wrong: "La lumière a dévié. Réobserve la séquence et recommence ce motif.",
      roundSuccess: "Résonance stabilisée. Le motif suivant se révèle.",
      success: "La lumière a retrouvé son chemin. La fracture est stabilisée.",
      next: "CONTINUER VERS LE NIVEAU 13",
      reset: "Réinitialiser",
      system: "SYSTEME:: FAISCEAUX CROISES // INTERSECTIONS EN ATTENTE",
      systemSuccess: "SYSTEME:: SEQUENCE 012 RECONSTITUEE // PROTOCOLE 013 DEBLOQUE",
      save: "SAUVEGARDER",
      saved: "SAUVEGARDÉ",
      saveHint: "Progression sauvegardée.",
      progress: "Progression de la Partie 2",
    },
    en: {
      part: "PART 2 // FRACTURES",
      level: "LEVEL 12",
      eyebrow: "Fragment 012 // Crossed light",
      title: "Crossed light",
      description:
        "The light crosses without breaking. Watch the intersections illuminate, then activate them again in the same order.",
      systemLabel: "ECHO://PHOTON",
      puzzleKicker: "PUZZLE // CROSSED SEQUENCE",
      puzzleTitle: "Light intersections",
      footer: "ECHO // ACTIVE FRACTURES",
      counter: "12 / 60",
      intersections: "Crossed light intersections",
      point: (number) => `Light intersection ${number}`,
      start: "OBSERVE THE SEQUENCE",
      replay: "REPLAY THE SEQUENCE",
      ready: "Watch the light sequence, then repeat it in the same order.",
      showing: "Follow the path of light…",
      playing: "Your turn: activate the intersections in the same order.",
      wrong: "The light path slipped. Replay the sequence and try this pattern again.",
      roundSuccess: "Resonance stabilized. The next pattern appears.",
      success: "The light has found its path. The fracture is stable.",
      next: "CONTINUE TO LEVEL 13",
      reset: "Reset",
      system: "SYSTEM:: CROSSED BEAMS // INTERSECTIONS AWAITING INPUT",
      systemSuccess: "SYSTEM:: SEQUENCE 012 RESTORED // PROTOCOL 013 UNLOCKED",
      save: "SAVE",
      saved: "SAVED",
      saveHint: "Progress saved.",
      progress: "Part 2 progress",
    },
  }[language];

  const $ = (id) => document.getElementById(id);
  const status = $("puzzleStatus");
  const readout = $("progressReadout");
  const playButton = $("sequenceStartButton");
  const resetButton = $("resetButton");
  const nextButton = $("nextLevelButton");
  const saveButton = $("saveGameButton");
  const systemMessage = $("systemMessage");
  const patterns = [
    [0, 2, 1, 3],
    [3, 1, 0, 2, 1],
    [2, 0, 3, 1, 2, 0],
  ];
  const points = [];
  let round = 0;
  let inputIndex = 0;
  let started = false;
  let acceptingInput = false;
  let solved = false;
  let playbackId = 0;

  document.documentElement.lang = language;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const value = copy[element.dataset.i18n];
    if (typeof value === "string") element.textContent = value;
  });
  board.setAttribute("aria-label", copy.intersections);
  $("levelProgress").setAttribute("aria-label", copy.progress);
  playButton.textContent = copy.start;
  resetButton.textContent = copy.reset;
  nextButton.textContent = copy.next;

  const setStatus = (message, state = "") => {
    status.textContent = message;
    status.className = `puzzle-status${state ? ` ${state}` : ""}`;
  };

  const renderProgress = () => {
    readout.textContent = `${round} / ${patterns.length}`;
  };

  const setPlayback = (active) => {
    points.forEach((point) =>
      point.classList.toggle("is-lit", Number(point.dataset.index) === active),
    );
  };

  const saveCompletion = () => {
    window.EchoesSave?.saveProgress({
      currentPage: "level-12",
      currentLevel: 12,
    });
  };

  const playSequence = async () => {
    if (solved) return;
    playbackId += 1;
    const playback = playbackId;
    acceptingInput = false;
    inputIndex = 0;
    started = true;
    playButton.disabled = true;
    points.forEach((point) => {
      point.disabled = true;
    });
    setStatus(copy.showing);
    setPlayback(-1);
    await new Promise((resolve) => window.setTimeout(resolve, 420));
    for (const pointIndex of patterns[round]) {
      if (playback !== playbackId || solved) return;
      setPlayback(pointIndex);
      await new Promise((resolve) => window.setTimeout(resolve, 520));
      if (playback !== playbackId || solved) return;
      setPlayback(-1);
      await new Promise((resolve) => window.setTimeout(resolve, 220));
    }
    if (playback !== playbackId || solved) return;
    acceptingInput = true;
    playButton.disabled = false;
    points.forEach((point) => {
      point.disabled = false;
    });
    playButton.textContent = copy.replay;
    setStatus(copy.playing);
    points[0]?.focus();
  };

  const activatePoint = (pointIndex) => {
    if (!acceptingInput || solved) return;
    if (pointIndex !== patterns[round][inputIndex]) {
      acceptingInput = false;
      inputIndex = 0;
      setPlayback(pointIndex);
      board.classList.remove("is-error");
      void board.offsetWidth;
      board.classList.add("is-error");
      setStatus(copy.wrong, "error");
      playButton.disabled = false;
      window.setTimeout(() => setPlayback(-1), 340);
      return;
    }

    setPlayback(pointIndex);
    window.setTimeout(() => setPlayback(-1), 260);
    inputIndex += 1;
    if (inputIndex < patterns[round].length) return;

    round += 1;
    renderProgress();
    inputIndex = 0;
    if (round === patterns.length) {
      solved = true;
      acceptingInput = false;
      playbackId += 1;
      board.classList.add("is-solved");
      playButton.disabled = true;
      nextButton.hidden = false;
      setStatus(copy.success, "success");
      systemMessage.textContent = copy.systemSuccess;
      saveCompletion();
      nextButton.focus();
      return;
    }

    acceptingInput = false;
    playButton.disabled = true;
    setStatus(copy.roundSuccess, "success");
    window.setTimeout(playSequence, 900);
  };

  for (let index = 0; index < 4; index += 1) {
    const point = document.createElement("button");
    point.type = "button";
    point.className = `cross-intersection intersection-${index + 1}`;
    point.dataset.index = String(index);
    point.disabled = true;
    point.setAttribute("aria-label", copy.point(index + 1));
    point.addEventListener("click", () => activatePoint(index));
    board.appendChild(point);
    points.push(point);
  }

  const reset = () => {
    playbackId += 1;
    round = 0;
    inputIndex = 0;
    started = false;
    acceptingInput = false;
    solved = false;
    board.classList.remove("is-error", "is-solved");
    setPlayback(-1);
    points.forEach((point) => {
      point.disabled = true;
    });
    systemMessage.textContent = copy.system;
    playButton.disabled = false;
    playButton.textContent = copy.start;
    nextButton.hidden = true;
    renderProgress();
    setStatus(copy.ready);
  };

  playButton.addEventListener("click", playSequence);
  resetButton.addEventListener("click", reset);
  nextButton.addEventListener("click", () => {
    window.location.href = "niveau-13.html";
  });
  saveButton.addEventListener("click", () => {
    const saved = window.EchoesSave?.saveProgress({
      currentPage: "level-12",
      currentLevel: 12,
    });
    if (!saved) return;
    saveButton.textContent = copy.saved;
    setStatus(copy.saveHint);
    window.setTimeout(() => {
      saveButton.textContent = copy.save;
    }, 1800);
  });

  const progress = $("levelProgress");
  for (let level = 11; level <= 20; level += 1) {
    const marker = document.createElement("span");
    marker.className = `level-square${level === 12 ? " current" : ""}`;
    marker.setAttribute("aria-hidden", "true");
    progress.appendChild(marker);
  }

  reset();
})();

/* ===== NIVEAU 13 ===== */
(() => {
  const board = document.getElementById("tileBoard");
  if (!board) return;

  const language = localStorage.getItem("echoes-language") === "en" ? "en" : "fr";
  const copy = {
    fr: {
      part: "PARTIE 2 // FRACTURES",
      level: "NIVEAU 13",
      eyebrow: "Fragment 013 // Glissement holographique",
      title: "Glissement holographique",
      description:
        "Les fragments doivent glisser… jusqu'à retrouver leur forme. Déplace les panneaux voisins de la case vide pour reconstituer le motif fractal.",
      puzzleKicker: "PUZZLE // RECONSTRUCTION",
      puzzleTitle: "Motif fractal",
      referenceLabel: "MOTIF CIBLE",
      referenceHint: "Reforme le motif en déplaçant les panneaux vers la case vide.",
      board: "Panneaux holographiques mélangés",
      start: "DÉMARRER LE PUZZLE",
      next: "CONTINUER VERS LE NIVEAU 14",
      reset: "Réinitialiser",
      ready: "Démarre le puzzle, puis déplace les panneaux voisins de la case vide.",
      playing: "Les fragments doivent glisser… jusqu'à retrouver leur forme.",
      invalid: "Ce panneau ne touche pas la case vide. Choisis un panneau voisin.",
      success: "Le motif fractal est restauré. La fracture se stabilise.",
      system: "SYSTEME:: FRACTURE 013 DETECTEE // MOTIF EN ATTENTE DE RESTAURATION",
      systemSuccess: "SYSTEME:: MOTIF FRACTAL RESTAURE // PROTOCOLE 014 DEBLOQUE",
      save: "SAUVEGARDER",
      saved: "SAUVEGARDÉ",
      saveHint: "Progression sauvegardée.",
      panel: "Panneau",
      position: "position",
      inPlace: "correctement placé",
      misplaced: "à déplacer",
      footer: "ÉCHO // FRACTURES ACTIVES",
      counter: "13 / 60",
      progress: "Progression de la Partie 2",
    },
    en: {
      part: "PART 2 // FRACTURES",
      level: "LEVEL 13",
      eyebrow: "Fragment 013 // Holographic slide",
      title: "Holographic slide",
      description:
        "The fragments must slide until they regain their shape. Move the panels beside the empty space to restore the fractal pattern.",
      puzzleKicker: "PUZZLE // RECONSTRUCTION",
      puzzleTitle: "Fractal pattern",
      referenceLabel: "TARGET PATTERN",
      referenceHint: "Rebuild the pattern by sliding panels into the empty space.",
      board: "Shuffled holographic panels",
      start: "START PUZZLE",
      next: "CONTINUE TO LEVEL 14",
      reset: "Reset",
      ready: "Start the puzzle, then move panels beside the empty space.",
      playing: "The fragments must slide until they regain their shape.",
      invalid: "That panel does not touch the empty space. Choose a neighboring panel.",
      success: "The fractal pattern is restored. The fracture stabilizes.",
      system: "SYSTEM:: FRACTURE 013 DETECTED // PATTERN AWAITS RESTORATION",
      systemSuccess: "SYSTEM:: FRACTAL PATTERN RESTORED // PROTOCOL 014 UNLOCKED",
      save: "SAVE",
      saved: "SAVED",
      saveHint: "Progress saved.",
      panel: "Panel",
      position: "position",
      inPlace: "correctly placed",
      misplaced: "to move",
      footer: "ECHO // ACTIVE FRACTURES",
      counter: "13 / 60",
      progress: "Part 2 progress",
    },
  }[language];

  const $ = (id) => document.getElementById(id);
  const status = $("puzzleStatus");
  const readout = $("progressReadout");
  const startButton = $("startPuzzleButton");
  const resetButton = $("resetButton");
  const nextButton = $("nextLevelButton");
  const saveButton = $("saveGameButton");
  const systemMessage = $("systemMessage");
  const goal = [1, 2, 3, 4, 5, 6, 7, 8, 0];
  let tiles = [];
  let started = false;
  let solved = false;

  document.documentElement.lang = language;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const value = copy[element.dataset.i18n];
    if (typeof value === "string") element.textContent = value;
  });
  board.setAttribute("aria-label", copy.board);
  $("levelProgress").setAttribute("aria-label", copy.progress);

  const setStatus = (message, state = "") => {
    status.textContent = message;
    status.className = `puzzle-status${state ? ` ${state}` : ""}`;
  };

  const isNeighbor = (first, second) =>
    Math.abs(Math.floor(first / 3) - Math.floor(second / 3)) +
      Math.abs((first % 3) - (second % 3)) ===
    1;

  const updateProgress = () => {
    const placed = tiles.filter((tile, index) => tile === goal[index] && tile !== 0).length;
    readout.textContent = `${placed} / 8`;
    return placed;
  };

  const render = () => {
    board.replaceChildren();
    tiles.forEach((tile, index) => {
      if (tile === 0) {
        const empty = document.createElement("div");
        empty.className = "fractal-empty";
        empty.setAttribute("role", "gridcell");
        empty.setAttribute("aria-label", language === "en" ? "Empty space" : "Case vide");
        board.appendChild(empty);
        return;
      }

      const button = document.createElement("button");
      const homeIndex = tile - 1;
      const homeRow = Math.floor(homeIndex / 3);
      const homeColumn = homeIndex % 3;
      button.type = "button";
      button.className = "fractal-tile";
      button.dataset.panel = String(tile).padStart(2, "0");
      button.style.backgroundPosition = `${homeColumn * 50}% ${homeRow * 50}%`;
      button.disabled = !started || solved;
      button.classList.toggle("is-home", index === homeIndex);
      button.setAttribute(
        "aria-label",
        `${copy.panel} ${tile}, ${copy.position} ${index + 1}, ${
          index === homeIndex ? copy.inPlace : copy.misplaced
        }`,
      );
      button.addEventListener("click", () => moveTile(index));
      board.appendChild(button);
    });
  };

  const makeShuffledBoard = () => {
    const result = goal.slice();
    let emptyIndex = result.length - 1;
    let previousIndex = -1;
    for (let move = 0; move < 80; move += 1) {
      const choices = result
        .map((_, index) => index)
        .filter((index) => isNeighbor(index, emptyIndex) && index !== previousIndex);
      const nextIndex = choices[Math.floor(Math.random() * choices.length)];
      result[emptyIndex] = result[nextIndex];
      result[nextIndex] = 0;
      previousIndex = emptyIndex;
      emptyIndex = nextIndex;
    }
    return result;
  };

  const saveCompletion = () => {
    window.EchoesSave?.saveProgress({
      currentPage: "level-13",
      currentLevel: 13,
    });
  };

  function moveTile(index) {
    if (!started || solved) return;
    const emptyIndex = tiles.indexOf(0);
    if (!isNeighbor(index, emptyIndex)) {
      board.classList.remove("is-invalid");
      void board.offsetWidth;
      board.classList.add("is-invalid");
      setStatus(copy.invalid);
      return;
    }

    [tiles[index], tiles[emptyIndex]] = [tiles[emptyIndex], tiles[index]];
    render();
    if (updateProgress() === 8) {
      solved = true;
      board.classList.add("is-solved");
      setStatus(copy.success, "success");
      systemMessage.textContent = copy.systemSuccess;
      nextButton.hidden = false;
      startButton.disabled = true;
      saveCompletion();
      nextButton.focus();
      return;
    }
    setStatus(copy.playing);
  }

  const reset = () => {
    tiles = makeShuffledBoard();
    started = false;
    solved = false;
    board.classList.remove("is-solved", "is-invalid");
    systemMessage.textContent = copy.system;
    updateProgress();
    render();
    nextButton.hidden = true;
    startButton.disabled = false;
    setStatus(copy.ready);
  };

  startButton.addEventListener("click", () => {
    started = true;
    startButton.disabled = true;
    render();
    setStatus(copy.playing);
    const emptyIndex = tiles.indexOf(0);
    const firstMove = [...board.querySelectorAll(".fractal-tile")].find((tile) => {
      const tileIndex = tiles.indexOf(Number(tile.dataset.panel));
      return isNeighbor(tileIndex, emptyIndex);
    });
    firstMove?.focus();
  });
  resetButton.addEventListener("click", reset);
  nextButton.addEventListener("click", () => {
    window.location.href = "niveau-14.html";
  });
  saveButton.addEventListener("click", () => {
    const saved = window.EchoesSave?.saveProgress({
      currentPage: "level-13",
      currentLevel: 13,
    });
    if (saved) {
      saveButton.textContent = copy.saved;
      setStatus(copy.saveHint);
      window.setTimeout(() => {
        saveButton.textContent = copy.save;
      }, 1800);
    }
  });

  const progress = $("levelProgress");
  for (let level = 11; level <= 20; level += 1) {
    const marker = document.createElement("span");
    marker.className = `level-square${level === 13 ? " current" : ""}`;
    marker.setAttribute("aria-hidden", "true");
    progress.appendChild(marker);
  }

  reset();
})();

/* ===== NIVEAU 14 ===== */
(() => {
  const board = document.getElementById("prismBoard");
  if (!board) return;

  const language = localStorage.getItem("echoes-language") === "en" ? "en" : "fr";
  const copy = {
    fr: {
      part: "PARTIE 2 // FRACTURES",
      level: "NIVEAU 14",
      eyebrow: "Fragment 014 // Le prisme oublié",
      title: "Le prisme oublié",
      description: "Un faisceau cherche sa sortie. Fais pivoter les miroirs pour le guider jusqu'au récepteur.",
      systemLabel: "ECHO://PHOTON",
      puzzleKicker: "PUZZLE // TRAJECTOIRE LUMINEUSE",
      puzzleTitle: "Le chemin du faisceau",
      start: "ACTIVER LE FAISCEAU",
      next: "CONTINUER VERS LE NIVEAU 15",
      reset: "Réinitialiser",
      ready: "Active le faisceau, puis oriente les miroirs pour atteindre le récepteur.",
      playing: "Fais pivoter les miroirs. Le faisceau indique sa trajectoire en temps réel.",
      success: "Le faisceau atteint le récepteur. Le prisme retrouve sa résonance.",
      system: "SYSTEME:: PRISME 014 DETECTE // FAISCEAU EN ATTENTE",
      systemSuccess: "SYSTEME:: TRAJECTOIRE 014 RESTAUREE // PROTOCOLE 015 DEBLOQUE",
      source: "S",
      receiver: "R",
      sourceLabel: "Source du faisceau",
      receiverLabel: "Récepteur",
      mirror: "Miroir",
      board: "Grille de miroirs",
      progress: "Progression de la Partie 2",
      save: "SAUVEGARDER",
      saved: "SAUVEGARDÉ",
      saveHint: "Progression sauvegardée.",
      footer: "ÉCHO // FRACTURES ACTIVES",
      counter: "14 / 60",
    },
    en: {
      part: "PART 2 // FRACTURES",
      level: "LEVEL 14",
      eyebrow: "Fragment 014 // The forgotten prism",
      title: "The forgotten prism",
      description: "A beam is searching for an exit. Rotate the mirrors to guide it to the receiver.",
      systemLabel: "ECHO://PHOTON",
      puzzleKicker: "PUZZLE // LIGHT PATH",
      puzzleTitle: "The beam's path",
      start: "ACTIVATE THE BEAM",
      next: "CONTINUE TO LEVEL 15",
      reset: "Reset",
      ready: "Activate the beam, then aim the mirrors to reach the receiver.",
      playing: "Rotate the mirrors. The beam shows its path in real time.",
      success: "The beam reaches the receiver. The prism resonates again.",
      system: "SYSTEM:: PRISM 014 DETECTED // BEAM STANDBY",
      systemSuccess: "SYSTEM:: PATH 014 RESTORED // PROTOCOL 015 UNLOCKED",
      source: "S",
      receiver: "R",
      sourceLabel: "Beam source",
      receiverLabel: "Receiver",
      mirror: "Mirror",
      board: "Mirror grid",
      progress: "Part 2 progress",
      save: "SAVE",
      saved: "SAVED",
      saveHint: "Progress saved.",
      footer: "ECHO // ACTIVE FRACTURES",
      counter: "14 / 60",
    },
  }[language];

  const $ = (id) => document.getElementById(id);
  const status = $("puzzleStatus");
  const readout = $("progressReadout");
  const startButton = $("startPuzzleButton");
  const resetButton = $("resetButton");
  const nextButton = $("nextLevelButton");
  const saveButton = $("saveGameButton");
  const systemMessage = $("systemMessage");
  const mirrors = new Map([
    [11, { direction: "/", target: "\\" }],
    [21, { direction: "/", target: "\\" }],
    [24, { direction: "\\", target: "/" }],
  ]);
  const dx = [0, 1, 0, -1];
  const dy = [-1, 0, 1, 0];
  const slashReflection = [1, 0, 3, 2];
  const backslashReflection = [3, 2, 1, 0];
  let started = false;
  let solved = false;

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

  const setStatus = (message, state = "") => {
    status.textContent = message;
    status.className = `puzzle-status${state ? ` ${state}` : ""}`;
  };

  const traceBeam = () => {
    const path = [];
    const visited = new Set();
    let x = 0;
    let y = 2;
    let direction = 1;

    for (let step = 0; step < 30; step += 1) {
      if (x < 0 || x >= 5 || y < 0 || y >= 5) break;
      const index = y * 5 + x;
      if (index === 14) return { path, reached: true };
      if (visited.has(`${index}:${direction}`)) break;
      visited.add(`${index}:${direction}`);
      path.push(index);

      const mirror = mirrors.get(index);
      if (mirror) {
        const reflection = mirror.direction === "/" ? slashReflection : backslashReflection;
        direction = reflection[direction];
      }
      x += dx[direction];
      y += dy[direction];
    }
    return { path, reached: false };
  };

  const render = () => {
    const { path, reached } = traceBeam();
    const litCells = new Set(path);
    if (reached) litCells.add(14);
    board.replaceChildren();

    for (let index = 0; index < 25; index += 1) {
      const cell = mirrors.has(index)
        ? document.createElement("button")
        : document.createElement("div");
      cell.className = "prism-cell";
      if (litCells.has(index)) cell.classList.add("is-beam");
      if (index === 10) {
        cell.classList.add("prism-endpoint", "prism-source");
        cell.textContent = copy.source;
        cell.setAttribute("aria-label", copy.sourceLabel);
      } else if (index === 14) {
        cell.classList.add("prism-endpoint", "prism-receiver");
        cell.textContent = copy.receiver;
        cell.setAttribute("aria-label", copy.receiverLabel);
      } else if (mirrors.has(index)) {
        const mirror = mirrors.get(index);
        cell.type = "button";
        cell.classList.add("prism-mirror");
        cell.textContent = mirror.direction;
        cell.disabled = !started || solved;
        cell.setAttribute("aria-label", `${copy.mirror} ${mirror.direction}`);
        cell.addEventListener("click", () => {
          if (!started || solved) return;
          mirror.direction = mirror.direction === "/" ? "\\" : "/";
          render();
          updateProgress();
          const result = traceBeam();
          if (result.reached) complete();
          else setStatus(copy.playing);
        });
      } else {
        cell.classList.add("prism-empty");
        cell.setAttribute("aria-hidden", "true");
      }
      board.appendChild(cell);
    }
  };

  const updateProgress = () => {
    const aligned = [...mirrors.values()].filter((mirror) => mirror.direction === mirror.target).length;
    readout.textContent = `${aligned} / ${mirrors.size}`;
  };

  const saveCompletion = () => {
    window.EchoesSave?.saveProgress({ currentPage: "level-14", currentLevel: 14 });
  };

  const complete = () => {
    if (solved) return;
    solved = true;
    board.classList.add("is-solved");
    render();
    setStatus(copy.success, "success");
    systemMessage.textContent = copy.systemSuccess;
    nextButton.hidden = false;
    startButton.disabled = true;
    saveCompletion();
    nextButton.focus();
  };

  const reset = () => {
    mirrors.forEach((mirror) => {
      mirror.direction = "/";
    });
    mirrors.get(24).direction = "\\";
    started = false;
    solved = false;
    board.classList.remove("is-solved");
    systemMessage.textContent = copy.system;
    nextButton.hidden = true;
    startButton.disabled = false;
    render();
    updateProgress();
    setStatus(copy.ready);
  };

  startButton.addEventListener("click", () => {
    started = true;
    startButton.disabled = true;
    render();
    setStatus(copy.playing);
  });
  resetButton.addEventListener("click", reset);
  nextButton.addEventListener("click", () => {
    window.location.href = "niveau-15.html";
  });
  saveButton.addEventListener("click", () => {
    if (!window.EchoesSave?.saveProgress({ currentPage: "level-14", currentLevel: 14 })) return;
    saveButton.textContent = copy.saved;
    setStatus(copy.saveHint);
    window.setTimeout(() => {
      saveButton.textContent = copy.save;
    }, 1800);
  });

  for (let level = 11; level <= 20; level += 1) {
    const marker = document.createElement("span");
    marker.className = `level-square${level === 14 ? " current" : ""}`;
    marker.setAttribute("aria-hidden", "true");
    $("levelProgress").appendChild(marker);
  }

  reset();
})();

/* ===== NIVEAU 15 ===== */
(() => {
  const board = document.getElementById("flowBoard");
  if (!board) return;

  const language = localStorage.getItem("echoes-language") === "en" ? "en" : "fr";
  const copy = {
    fr: {
      part: "PARTIE 2 // FRACTURES",
      level: "NIVEAU 15",
      eyebrow: "Fragment 015 // Les veines de lumière",
      title: "Les veines de lumière",
      description: "Vingt paires de balises se répondent dans cette grille de 14 par 14. Relie chaque paire par un tracé sinueux, sans croiser les flux. Il n'est pas nécessaire de remplir toute la grille.",
      systemLabel: "ECHO://FLUX",
      puzzleKicker: "PUZZLE // ROUTAGE DE FLUX",
      puzzleTitle: "Réseau de résonance",
      start: "ACTIVER LE RÉSEAU",
      next: "CONTINUER VERS LE NIVEAU 16",
      reset: "Réinitialiser",
      ready: "Maintiens une balise et trace son chemin sinueux jusqu'à la balise de même couleur. Rien ne t'oblige à remplir toute la grille.",
      playing: "Relie les vingt paires sans croiser les flux. Tu peux aussi toucher les cellules une à une.",
      connecting: (color) => `Flux ${color} en cours. Continue jusqu'à sa balise jumelle.`,
      blocked: "Cette cellule est déjà occupée par un autre flux.",
      invalid: "Le chemin ne peut avancer que vers une cellule voisine.",
      lineComplete: (color) => `Paire ${color} reliée. Poursuis les autres flux.`,
      fillRemaining: "Toutes les paires sont reliées.",
      success: "Les vingt flux sont reliés sans croisement. Le réseau est rétabli.",
      system: "SYSTEME:: 20 PAIRES DETECTEES // RESEAU EN ATTENTE",
      systemSuccess: "SYSTEME:: RESEAU 015 RESTAURE // PROTOCOLE 016 DEBLOQUE",
      cell: (row, column) => `Cellule ${row}, ${column}`,
      endpoint: (color, row, column) => `Balise ${color}, ligne ${row}, colonne ${column}`,
      colors: ["red", "orange", "yellow", "lime", "green", "teal", "cyan", "sky", "blue", "indigo", "purple", "magenta", "pink", "brown", "white", "slate", "khaki", "burgundy", "olive", "peach"],
      board: "Grille de connexion 14 par 14",
      progress: "Progression de la Partie 2",
      save: "SAUVEGARDER",
      saved: "SAUVEGARDÉ",
      saveHint: "Progression sauvegardée.",
      footer: "ÉCHO // FRACTURES ACTIVES",
      counter: "15 / 60",
    },
    en: {
      part: "PART 2 // FRACTURES",
      level: "LEVEL 15",
      eyebrow: "Fragment 015 // Veins of light",
      title: "Veins of light",
      description: "Twenty pairs of beacons answer each other across this 14-by-14 grid. Connect every pair with a winding path, without crossing flows. You do not need to fill the whole grid.",
      systemLabel: "ECHO://FLOW",
      puzzleKicker: "PUZZLE // FLOW ROUTING",
      puzzleTitle: "Resonance network",
      start: "ACTIVATE THE NETWORK",
      next: "CONTINUE TO LEVEL 16",
      reset: "Reset",
      ready: "Hold a beacon and trace a winding path to the beacon of the same color. You do not have to fill the whole grid.",
      playing: "Connect all twenty pairs without crossing flows. You can also tap cells one at a time.",
      connecting: (color) => `${color} flow in progress. Continue to its matching beacon.`,
      blocked: "That cell is already occupied by another flow.",
      invalid: "A path can only move into a neighboring cell.",
      lineComplete: (color) => `${color} pair connected. Continue with the other flows.`,
      fillRemaining: "All pairs are connected.",
      success: "All twenty flows are connected without crossing. The network is restored.",
      system: "SYSTEM:: 20 PAIRS DETECTED // NETWORK STANDBY",
      systemSuccess: "SYSTEM:: NETWORK 015 RESTORED // PROTOCOL 016 UNLOCKED",
      cell: (row, column) => `Cell ${row}, ${column}`,
      endpoint: (color, row, column) => `${color} beacon, row ${row}, column ${column}`,
      colors: ["red", "orange", "yellow", "lime", "green", "teal", "cyan", "sky", "blue", "indigo", "purple", "magenta", "pink", "brown", "white", "slate", "khaki", "burgundy", "olive", "peach"],
      board: "14 by 14 connection grid",
      progress: "Part 2 progress",
      save: "SAVE",
      saved: "SAVED",
      saveHint: "Progress saved.",
      footer: "ECHO // ACTIVE FRACTURES",
      counter: "15 / 60",
    },
  }[language];

  const $ = (id) => document.getElementById(id);
  const status = $("puzzleStatus");
  const readout = $("progressReadout");
  const startButton = $("startPuzzleButton");
  const resetButton = $("resetButton");
  const nextButton = $("nextLevelButton");
  const saveButton = $("saveGameButton");
  const systemMessage = $("systemMessage");
  const size = 14;
  const palette = ["#ff1744", "#ff8f00", "#ffea00", "#b2ff00", "#00c853", "#00897b", "#00e5ff", "#80b4ff", "#2962ff", "#5e35b1", "#c158ff", "#ff00d4", "#ff8ab8", "#8d4e2a", "#ffffff", "#78909c", "#e0c9a0", "#7b1030", "#8a8a00", "#ff6e5e"];
  const symbols = [];
  copy.colors.forEach((label) => {
    const letters = label.normalize("NFD").replace(/[^a-zA-Z]/g, "").toUpperCase();
    symbols.push([...letters].find((letter) => !symbols.includes(letter)) ?? "?");
  });
  const randomInt = (max) => Math.floor(Math.random() * max);
  const shuffle = (list) => {
    for (let i = list.length - 1; i > 0; i -= 1) {
      const j = randomInt(i + 1);
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  };
  const neighborsOf = (index) => {
    const row = Math.floor(index / size);
    const column = index % size;
    const result = [];
    if (row > 0) result.push(index - size);
    if (row < size - 1) result.push(index + size);
    if (column > 0) result.push(index - 1);
    if (column < size - 1) result.push(index + 1);
    return result;
  };

  // Chemin hamiltonien aléatoire : serpentin transformé puis mélangé par "backbite".
  const buildHamiltonianPath = () => {
    let path = [];
    for (let row = 0; row < size; row += 1) {
      for (let step = 0; step < size; step += 1) {
        path.push(row * size + (row % 2 === 0 ? step : size - 1 - step));
      }
    }
    const position = new Array(size * size);
    const refresh = () => path.forEach((cell, i) => { position[cell] = i; });
    refresh();
    for (let iteration = 0; iteration < 400; iteration += 1) {
      const atEnd = Math.random() < 0.5;
      if (!atEnd) path.reverse(), refresh();
      const head = path[path.length - 1];
      const options = neighborsOf(head);
      const target = options[randomInt(options.length)];
      const at = position[target];
      if (at < path.length - 2) {
        path = path.slice(0, at + 1).concat(path.slice(at + 1).reverse());
        refresh();
      }
    }
    return path;
  };

  const pairCount = 20;
  // Chaque bloc 4x4 de la grille doit contenir des balises, sans surcharge.
  const isSpread = (routes) => {
    const blocks = Array(16).fill(0);
    routes.forEach((route) => {
      [route[0], route[route.length - 1]].forEach((cell) => {
        const row = Math.floor(Math.floor(cell / size) * 4 / size);
        const column = Math.floor((cell % size) * 4 / size);
        blocks[row * 4 + column] += 1;
      });
    });
    return blocks.every((count) => count >= 1 && count <= 5);
  };

  const generateRoutes = () => {
    for (;;) {
      const path = buildHamiltonianPath();
      const generated = [];
      let offset = randomInt(2);
      while (generated.length < pairCount) {
        let route = null;
        for (let attempt = 0; attempt < 12 && !route; attempt += 1) {
          const length = 6 + randomInt(8);
          const candidate = path.slice(offset, offset + length);
          if (candidate.length < length) break;
          const first = candidate[0];
          const last = candidate[length - 1];
          const distance = Math.abs(Math.floor(first / size) - Math.floor(last / size)) + Math.abs((first % size) - (last % size));
          if (distance >= 5) route = candidate;
        }
        if (!route) break;
        generated.push(route);
        offset += route.length + randomInt(2);
      }
      if (generated.length === pairCount && isSpread(generated)) return generated;
    }
  };
  const colors = [];
  const endpoints = new Map();
  const owners = Array(size * size).fill(null);
  const cells = [];
  const completedPaths = new Map();
  let started = false;
  let solved = false;
  let activeColor = null;
  let activePath = [];
  let isDrawing = false;

  const inkFor = (hex) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    return 0.299 * r + 0.587 * g + 0.114 * b > 120 ? "#050c1d" : "#ffffff";
  };

  const generateLayout = () => {
    const generated = generateRoutes();
    const order = shuffle(Array.from({ length: pairCount }, (_, i) => i));
    colors.length = 0;
    endpoints.clear();
    generated.forEach((route, index) => {
      const color = {
        id: `flow-${order[index]}`,
        label: copy.colors[order[index]],
        hex: palette[order[index]],
        symbol: symbols[order[index]],
        ink: inkFor(palette[order[index]]),
        start: route[0],
        end: route[route.length - 1],
      };
      colors.push(color);
      endpoints.set(color.start, { colorId: color.id, end: color.end });
      endpoints.set(color.end, { colorId: color.id, end: color.start });
    });
  };

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

  const colorFor = (id) => colors.find((color) => color.id === id);

  const render = () => {
    cells.forEach((cell, index) => {
      const owner = owners[index];
      const color = owner ? colorFor(owner) : null;
      cell.classList.toggle("is-connected", Boolean(color));
      cell.classList.toggle("is-endpoint", endpoints.has(index));
      cell.classList.toggle("is-complete", Boolean(color && completedPaths.has(owner)));
      if (endpoints.has(index) && color) cell.dataset.symbol = color.symbol;
      else delete cell.dataset.symbol;
      if (color) {
        cell.style.setProperty("--flow-color", color.hex);
        cell.style.setProperty("--flow-ink", color.ink);
      }
      else cell.style.removeProperty("--flow-color");

      const endpoint = endpoints.get(index);
      const row = Math.floor(index / size) + 1;
      const column = (index % size) + 1;
      cell.setAttribute(
        "aria-label",
        endpoint
          ? copy.endpoint(colorFor(endpoint.colorId).label, row, column)
          : copy.cell(row, column),
      );
      cell.disabled = !started || solved;
    });
    readout.textContent = `${completedPaths.size} / ${colors.length}`;
  };

  const celebratePath = (path) => {
    const step = Math.min(55, 900 / path.length);
    path.forEach((index, order) => {
      const cell = cells[index];
      cell.classList.remove("is-celebrating");
      cell.style.setProperty("--wave-delay", `${Math.round(order * step)}ms`);
      void cell.offsetWidth;
      cell.classList.add("is-celebrating");
    });
    window.setTimeout(() => {
      path.forEach((index) => cells[index].classList.remove("is-celebrating"));
    }, path.length * step + 900);
  };

  const clearPath = (colorId) => {
    owners.forEach((owner, index) => {
      if (owner === colorId && !endpoints.has(index)) owners[index] = null;
    });
    completedPaths.delete(colorId);
  };

  const beginPath = (colorId, startIndex) => {
    if (!started || solved) return;
    clearPath(colorId);
    activeColor = colorId;
    activePath = [startIndex];
    owners[startIndex] = colorId;
    isDrawing = true;
    render();
    setStatus(copy.connecting(colorFor(colorId).label));
  };

  const isNeighbor = (first, second) => {
    const rowDelta = Math.abs(Math.floor(first / size) - Math.floor(second / size));
    const columnDelta = Math.abs((first % size) - (second % size));
    return rowDelta + columnDelta === 1;
  };

  const advancePath = (nextIndex) => {
    if (!activeColor || !started || solved) return;
    const lastIndex = activePath[activePath.length - 1];
    if (nextIndex === lastIndex) return;
    if (!isNeighbor(lastIndex, nextIndex)) {
      setStatus(copy.invalid);
      return;
    }

    const matchingEndpoint = endpoints.get(nextIndex);
    if (matchingEndpoint?.colorId === activeColor && matchingEndpoint.end === activePath[0]) {
      activePath.push(nextIndex);
      owners[nextIndex] = activeColor;
      completedPaths.set(activeColor, activePath.slice());
      const completedColor = colorFor(activeColor);
      const celebratedPath = activePath.slice();
      activeColor = null;
      activePath = [];
      isDrawing = false;
      render();
      celebratePath(celebratedPath);
      if (completedPaths.size === colors.length) {
        solved = true;
        board.classList.add("is-solved");
        render();
        setStatus(copy.success, "success");
        systemMessage.textContent = copy.systemSuccess;
        nextButton.hidden = false;
        startButton.disabled = true;
        window.EchoesSave?.saveProgress({ currentPage: "level-15", currentLevel: 15 });
        nextButton.focus();
      } else if (completedPaths.size === colors.length) {
        setStatus(copy.fillRemaining);
      } else {
        setStatus(copy.lineComplete(completedColor.label), "success");
      }
      return;
    }

    const existingIndex = activePath.indexOf(nextIndex);
    if (existingIndex !== -1) {
      while (activePath.length > existingIndex + 1) {
        const removed = activePath.pop();
        if (!endpoints.has(removed)) owners[removed] = null;
      }
      render();
      return;
    }

    const occupant = owners[nextIndex];
    if (occupant && occupant !== activeColor) {
      if (matchingEndpoint) {
        setStatus(copy.blocked);
        return;
      }
      clearPath(occupant);
    } else if (occupant) {
      setStatus(copy.blocked);
      return;
    }

    if (matchingEndpoint) {
      setStatus(copy.blocked);
      return;
    }

    activePath.push(nextIndex);
    owners[nextIndex] = activeColor;
    render();
    setStatus(copy.connecting(colorFor(activeColor).label));
  };

  const activateCell = (index) => {
    const endpoint = endpoints.get(index);
    if (endpoint) {
      if (activeColor === endpoint.colorId) {
        advancePath(index);
        isDrawing = Boolean(activeColor);
      } else {
        beginPath(endpoint.colorId, index);
      }
      return;
    }

    if (activeColor) {
      advancePath(index);
      isDrawing = Boolean(activeColor);
    }
  };

  const reset = () => {
    generateLayout();
    owners.fill(null);
    completedPaths.clear();
    colors.forEach((color) => {
      owners[color.start] = color.id;
      owners[color.end] = color.id;
    });
    started = false;
    solved = false;
    activeColor = null;
    activePath = [];
    isDrawing = false;
    board.classList.remove("is-solved");
    systemMessage.textContent = copy.system;
    nextButton.hidden = true;
    startButton.disabled = false;
    render();
    setStatus(copy.ready);
  };

  for (let index = 0; index < size * size; index += 1) {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "flow-cell";
    cell.addEventListener("pointerdown", (event) => {
      if (!started || solved) return;
      activateCell(index);
      event.preventDefault();
    });
    cell.addEventListener("pointerenter", () => {
      if (isDrawing && activeColor) advancePath(index);
    });
    cell.addEventListener("click", (event) => {
      if (event.detail !== 0 || !started || solved) return;
      activateCell(index);
    });
    board.appendChild(cell);
    cells.push(cell);
  }

  document.addEventListener("pointerup", () => {
    isDrawing = false;
  });
  document.addEventListener("pointercancel", () => {
    isDrawing = false;
  });

  startButton.addEventListener("click", () => {
    started = true;
    startButton.disabled = true;
    render();
    setStatus(copy.playing);
  });
  resetButton.addEventListener("click", reset);
  nextButton.addEventListener("click", () => {
    window.location.href = "niveau-16.html";
  });
  saveButton.addEventListener("click", () => {
    if (!window.EchoesSave?.saveProgress({ currentPage: "level-15", currentLevel: 15 })) return;
    saveButton.textContent = copy.saved;
    setStatus(copy.saveHint);
    window.setTimeout(() => {
      saveButton.textContent = copy.save;
    }, 1800);
  });

  for (let level = 11; level <= 20; level += 1) {
    const marker = document.createElement("span");
    marker.className = `level-square${level === 15 ? " current" : ""}`;
    marker.setAttribute("aria-hidden", "true");
    $("levelProgress").appendChild(marker);
  }

  reset();
})();

/* ===== NIVEAU 16 ===== */
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
