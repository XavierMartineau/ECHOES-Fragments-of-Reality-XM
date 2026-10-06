/* PARTIE 2 // NIVEAUX 11-20
 * This file owns the shared back-navigation and autosave bootstrap for every
 * page in this range. Every puzzle controller for these levels lives below this bootstrap. */
const currentLevel = Number(
  window.location.pathname.match(/niveau-(\d+)/)?.[1] || 0,
);
// Sauvegarde automatiquement la progression de la page courante.
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
/* Anneaux de résonance : aligner les anneaux (#alignmentBoard), séquence aléatoire, indice et chrono de 30 s. */
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
  // Crée les pièces du puzzle.
  const createPieces = () =>
    shapes.flatMap((shape) =>
      [1, 2].map((copyNumber) => ({
        id: `${shape}-${copyNumber}`,
        shape,
      })),
    );
  const pieces = createPieces();
  // Identifiant d'un emplacement (ligne-position).
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

  // Affiche un message d'état (réussite, erreur ou info).
  const setStatus = (message, state = "") => {
    status.textContent = message;
    status.className = `puzzle-status${state ? ` ${state}` : ""}`;
  };

  // Mélange les formes.
  const shuffleShapes = () => {
    const row = [...shapes];
    for (let index = row.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [row[index], row[swapIndex]] = [row[swapIndex], row[index]];
    }
    return row;
  };

  // Met à jour le chronomètre affiché.
  const updateTimer = () => {
    const seconds = Math.max(0, Math.ceil(remainingMilliseconds / 1000));
    timerReadout.textContent = `00:${String(seconds).padStart(2, "0")}`;
    timerReadout.classList.toggle("is-warning", seconds <= 10);
  };

  // Arrête le chronomètre.
  const stopTimer = () => {
    if (timerInterval !== null) {
      window.clearInterval(timerInterval);
      timerInterval = null;
    }
  };

  // Termine la manche chronométrée quand le temps est écoulé.
  const endTimedRound = () => {
    stopTimer();
    remainingMilliseconds = 0;
    updateTimer();
    started = false;
    hintButton.disabled = true;
    render();
    setStatus(copy.timerExpired, "error");
  };

  // Démarre le chronomètre.
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

  // Redessine le plateau selon l'état courant.
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

  // Enregistre la réussite du niveau.
  const saveCompletion = () => {
    window.EchoesSave?.saveProgress({
      currentPage: "level-11",
      currentLevel: 11,
    });
  };

  // Joue la séquence que le joueur doit retenir.
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

  // Place la pièce sélectionnée sur un emplacement.
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

  // Remet le puzzle à zéro.
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

  // Affiche un indice.
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
/* Lumière croisée : mémoriser puis rejouer les intersections lumineuses (#crossIntersections). */
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

  // Affiche un message d'état (réussite, erreur ou info).
  const setStatus = (message, state = "") => {
    status.textContent = message;
    status.className = `puzzle-status${state ? ` ${state}` : ""}`;
  };

  // Met à jour l'affichage de la progression.
  const renderProgress = () => {
    readout.textContent = `${round} / ${patterns.length}`;
  };

  // Active ou désactive l'état de lecture de la séquence.
  const setPlayback = (active) => {
    points.forEach((point) =>
      point.classList.toggle("is-lit", Number(point.dataset.index) === active),
    );
  };

  // Enregistre la réussite du niveau.
  const saveCompletion = () => {
    window.EchoesSave?.saveProgress({
      currentPage: "level-12",
      currentLevel: 12,
    });
  };

  // Joue la séquence lumineuse.
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

  // Active un point d'énergie.
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

  // Remet le puzzle à zéro.
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
/* Glissement holographique : puzzle coulissant pour reconstruire le motif fractal (#tileBoard). */
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

  // Affiche un message d'état (réussite, erreur ou info).
  const setStatus = (message, state = "") => {
    status.textContent = message;
    status.className = `puzzle-status${state ? ` ${state}` : ""}`;
  };

  // Indique si deux cases sont voisines.
  const isNeighbor = (first, second) =>
    Math.abs(Math.floor(first / 3) - Math.floor(second / 3)) +
      Math.abs((first % 3) - (second % 3)) ===
    1;

  // Met à jour le compteur de progression.
  const updateProgress = () => {
    const placed = tiles.filter((tile, index) => tile === goal[index] && tile !== 0).length;
    readout.textContent = `${placed} / 8`;
    return placed;
  };

  // Redessine le plateau selon l'état courant.
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

  // Génère un plateau mélangé résoluble.
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

  // Enregistre la réussite du niveau.
  const saveCompletion = () => {
    window.EchoesSave?.saveProgress({
      currentPage: "level-13",
      currentLevel: 13,
    });
  };

  // Déplace une tuile vers la case vide.
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

  // Remet le puzzle à zéro.
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
/* Prisme : orienter des miroirs pour guider un faisceau jusqu'au récepteur (#prismBoard). */
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

  // Affiche un message d'état (réussite, erreur ou info).
  const setStatus = (message, state = "") => {
    status.textContent = message;
    status.className = `puzzle-status${state ? ` ${state}` : ""}`;
  };

  // Calcule le trajet du faisceau à travers les miroirs.
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

  // Redessine le plateau selon l'état courant.
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

  // Met à jour le compteur de progression.
  const updateProgress = () => {
    const aligned = [...mirrors.values()].filter((mirror) => mirror.direction === mirror.target).length;
    readout.textContent = `${aligned} / ${mirrors.size}`;
  };

  // Enregistre la réussite du niveau.
  const saveCompletion = () => {
    window.EchoesSave?.saveProgress({ currentPage: "level-14", currentLevel: 14 });
  };

  // Termine le niveau.
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

  // Remet le puzzle à zéro.
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
/* Veines de lumière : routage de vingt paires de flux sur une grille 14 x 14 (#flowBoard). */
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
  // Renvoie un entier aléatoire entre 0 et max-1.
  const randomInt = (max) => Math.floor(Math.random() * max);
  // Mélange une liste au hasard.
  const shuffle = (list) => {
    for (let i = list.length - 1; i > 0; i -= 1) {
      const j = randomInt(i + 1);
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  };
  // Renvoie les cases voisines d'une case.
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

  // Génère les chemins à relier.
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

  // Choisit la couleur de texte lisible sur une couleur de fond.
  const inkFor = (hex) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    return 0.299 * r + 0.587 * g + 0.114 * b > 120 ? "#050c1d" : "#ffffff";
  };

  // Génère la disposition de départ du plateau.
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

  // Affiche un message d'état (réussite, erreur ou info).
  const setStatus = (message, variant = "") => {
    status.textContent = message;
    status.className = `puzzle-status${variant ? ` ${variant}` : ""}`;
  };

  // Renvoie la couleur associée à un identifiant.
  const colorFor = (id) => colors.find((color) => color.id === id);

  // Redessine le plateau selon l'état courant.
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

  // Anime un chemin terminé.
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

  // Efface le chemin d'une couleur.
  const clearPath = (colorId) => {
    owners.forEach((owner, index) => {
      if (owner === colorId && !endpoints.has(index)) owners[index] = null;
    });
    completedPaths.delete(colorId);
  };

  // Commence un chemin depuis un point de départ.
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

  // Indique si deux cases sont voisines.
  const isNeighbor = (first, second) => {
    const rowDelta = Math.abs(Math.floor(first / size) - Math.floor(second / size));
    const columnDelta = Math.abs((first % size) - (second % size));
    return rowDelta + columnDelta === 1;
  };

  // Prolonge le chemin vers la case suivante.
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

  // Réagit au clic sur une case.
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

  // Remet le puzzle à zéro.
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
/* Réseau dormant : inversion logique 3 x 3 en trois manches, une impulsion inverse une cellule et ses voisines (#logicBoard). */
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

  // Affiche un message d'état (réussite, erreur ou info).
  const setStatus = (message, variant = "") => {
    status.textContent = message;
    status.className = `puzzle-status${variant ? ` ${variant}` : ""}`;
  };

  // Redessine le plateau selon l'état courant.
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

  // Met à jour les affichages chiffrés.
  const renderReadouts = () => {
    readout.textContent = `${round} / ${scrambles.length}`;
    moveReadout.textContent = `${copy.moves}: ${moves}`;
  };

  // Active ou désactive une impulsion.
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

  // Enregistre la réussite du niveau.
  const saveCompletion = () => {
    window.EchoesSave?.saveProgress({ currentPage: "level-16", currentLevel: 16 });
  };

  // Termine la manche et passe à la suivante ou au bouton Continuer.
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

  // Construit la manche courante.
  const buildRound = () => {
    state = Array(9).fill(false);
    scrambles[round].forEach(togglePulse);
    moves = 0;
    renderReadouts();
    render();
  };

  // Remet le puzzle à zéro.
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

/* ===== NIVEAU 17 ===== */
/* Balance du vide : répartir des masses sur deux plateaux pour obtenir le même poids, trois manches (#scaleBoard). */
(() => {
  const board = document.getElementById("scaleBoard");
  if (!board) return;

  const language = localStorage.getItem("echoes-language") === "en" ? "en" : "fr";
  const copy = {
    fr: {
      part: "PARTIE 2 // FRACTURES",
      level: "NIVEAU 17",
      eyebrow: "Fragment 017 // La balance du vide",
      title: "La balance du vide",
      description: "Deux plateaux, un seul équilibre. Répartis chaque masse sur les plateaux pour que les deux côtés pèsent exactement pareil.",
      systemLabel: "ECHO://EQUILIBRE",
      puzzleKicker: "PUZZLE // ÉQUILIBRE",
      puzzleTitle: "Plateaux de la balance",
      next: "CONTINUER VERS LE NIVEAU 18",
      reset: "Réinitialiser",
      ready: "Touche une masse, puis touche le plateau gauche, la réserve ou le plateau droit qui s'illumine.",
      roundSuccess: "Équilibre atteint. Un nouvel ensemble de masses apparaît.",
      success: "Les trois balances sont équilibrées. Le vide se stabilise.",
      system: "SYSTEME:: BALANCE 017 DESEQUILIBREE // REPARTITION REQUISE",
      systemSuccess: "SYSTEME:: BALANCE 017 EQUILIBREE // PROTOCOLE 018 DEBLOQUE",
      left: "Plateau gauche",
      right: "Plateau droit",
      tray: "Réserve",
      mass: "Masse",
      moves: "Déplacements",
      progress: "Progression de la Partie 2",
      save: "SAUVEGARDER",
      saved: "SAUVEGARDÉ",
      saveHint: "Progression sauvegardée.",
      footer: "ÉCHO // FRACTURES ACTIVES",
      counter: "17 / 60",
    },
    en: {
      part: "PART 2 // FRACTURES",
      level: "LEVEL 17",
      eyebrow: "Fragment 017 // The void scale",
      title: "The void scale",
      description: "Two pans, one balance. Spread every mass across the pans so both sides weigh exactly the same.",
      systemLabel: "ECHO://BALANCE",
      puzzleKicker: "PUZZLE // BALANCE",
      puzzleTitle: "Scale pans",
      next: "CONTINUE TO LEVEL 18",
      reset: "Reset",
      ready: "Tap a mass, then tap the glowing left pan, reserve or right pan.",
      roundSuccess: "Balance reached. A new set of masses appears.",
      success: "All three scales are balanced. The void settles.",
      system: "SYSTEM:: SCALE 017 UNBALANCED // DISTRIBUTION REQUIRED",
      systemSuccess: "SYSTEM:: SCALE 017 BALANCED // PROTOCOL 018 UNLOCKED",
      left: "Left pan",
      right: "Right pan",
      tray: "Reserve",
      mass: "Mass",
      moves: "Moves",
      progress: "Part 2 progress",
      save: "SAVE",
      saved: "SAVED",
      saveHint: "Progress saved.",
      footer: "ECHO // ACTIVE FRACTURES",
      counter: "17 / 60",
    },
  }[language];

  const $ = (id) => document.getElementById(id);
  const status = $("puzzleStatus");
  const readout = $("progressReadout");
  const moveReadout = $("moveReadout");
  const resetButton = $("resetButton");
  const nextButton = $("nextLevelButton");
  const saveButton = $("saveGameButton");
  const systemMessage = $("systemMessage");
  const containers = [$("scaleTray"), $("scaleLeft"), $("scaleRight")];
  const totals = [null, $("scaleLeftTotal"), $("scaleRightTotal")];
  const beam = $("scaleBeam");
  const zoneNames = [copy.tray, copy.left, copy.right];
  const rounds = [
    [3, 5, 7, 9, 4],
    [2, 3, 5, 6, 8, 10],
    [4, 7, 9, 11, 13, 6, 8],
  ];
  let zones = [];
  let round = 0;
  let moves = 0;
  let solved = false;
  let locked = false;
  let advanceTimer = 0;
  let selected = null;
  const zoneElements = containers.map((container) => container.parentElement);

  document.documentElement.lang = language;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const value = copy[element.dataset.i18n];
    if (typeof value === "string") element.textContent = value;
  });
  $("levelProgress").setAttribute("aria-label", copy.progress);
  $("scaleLeftLabel").textContent = copy.left;
  $("scaleRightLabel").textContent = copy.right;
  $("scaleTrayLabel").textContent = copy.tray;
  resetButton.textContent = copy.reset;
  nextButton.textContent = copy.next;
  saveButton.textContent = copy.save;

  // Affiche un message d'état (réussite, erreur ou info).
  const setStatus = (message, variant = "") => {
    status.textContent = message;
    status.className = `puzzle-status${variant ? ` ${variant}` : ""}`;
  };

  // Calcule les totaux utilisés pour la comparaison.
  const sums = () => {
    const result = [0, 0, 0];
    rounds[Math.min(round, rounds.length - 1)].forEach((weight, index) => {
      result[zones[index]] += weight;
    });
    return result;
  };

  // Redessine le plateau selon l'état courant.
  const render = () => {
    containers.forEach((container) => container.replaceChildren());
    rounds[Math.min(round, rounds.length - 1)].forEach((weight, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `scale-weight zone-${zones[index]}${selected === index ? " is-selected" : ""}`;
      button.textContent = String(weight);
      button.disabled = solved || locked;
      button.setAttribute("aria-label", `${copy.mass} ${weight}: ${zoneNames[zones[index]]}`);
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        selected = selected === index ? null : index;
        render();
      });
      containers[zones[index]].appendChild(button);
    });
    zoneElements.forEach((zone, zoneIndex) => {
      const targetable = selected !== null && !solved && !locked && zones[selected] !== zoneIndex;
      zone.classList.toggle("is-target", targetable);
    });
    const [, left, right] = sums();
    totals[1].textContent = String(left);
    totals[2].textContent = String(right);
    const angle = Math.max(-9, Math.min(9, (right - left) * 1.4));
    beam.style.transform = `rotate(${angle}deg)`;
    readout.textContent = `${round} / ${rounds.length}`;
    moveReadout.textContent = `${copy.moves}: ${moves}`;
  };

  // Construit la manche courante.
  const buildRound = () => {
    zones = rounds[round].map(() => 0);
    moves = 0;
    selected = null;
    render();
  };

  // Termine la manche et passe à la suivante ou au bouton Continuer.
  const completeRound = () => {
    round += 1;
    if (round === rounds.length) {
      solved = true;
      board.classList.add("is-solved");
      setStatus(copy.success, "success");
      systemMessage.textContent = copy.systemSuccess;
      nextButton.hidden = false;
      window.EchoesSave?.saveProgress({ currentPage: "level-17", currentLevel: 17 });
      readout.textContent = `${round} / ${rounds.length}`;
      render();
      nextButton.focus();
      return;
    }
    locked = true;
    readout.textContent = `${round} / ${rounds.length}`;
    setStatus(copy.roundSuccess, "success");
    advanceTimer = window.setTimeout(() => {
      locked = false;
      buildRound();
      setStatus(copy.ready);
    }, 1000);
  };

  // Déplace la masse sélectionnée vers la zone choisie (réserve, plateau gauche ou droit).
  function moveWeight(index, zoneIndex) {
    if (solved || locked || index === null) return;
    zones[index] = zoneIndex;
    selected = null;
    moves += 1;
    render();
    const [tray, left, right] = sums();
    if (tray === 0 && left === right) completeRound();
  }

  zoneElements.forEach((zone, zoneIndex) => {
    zone.addEventListener("click", () => {
      if (selected !== null && zones[selected] !== zoneIndex) moveWeight(selected, zoneIndex);
    });
  });

  // Remet le puzzle à zéro.
  const reset = () => {
    window.clearTimeout(advanceTimer);
    selected = null;
    round = 0;
    solved = false;
    locked = false;
    board.classList.remove("is-solved");
    systemMessage.textContent = copy.system;
    nextButton.hidden = true;
    setStatus(copy.ready);
    buildRound();
  };

  resetButton.addEventListener("click", reset);
  nextButton.addEventListener("click", () => {
    window.location.href = "niveau-18.html";
  });
  saveButton.addEventListener("click", () => {
    if (!window.EchoesSave?.saveProgress({ currentPage: "level-17", currentLevel: 17 })) return;
    saveButton.textContent = copy.saved;
    setStatus(copy.saveHint);
    window.setTimeout(() => {
      saveButton.textContent = copy.save;
    }, 1800);
  });

  for (let level = 11; level <= 20; level += 1) {
    const marker = document.createElement("span");
    marker.className = `level-square${level === 17 ? " current" : ""}`;
    marker.setAttribute("aria-hidden", "true");
    $("levelProgress").appendChild(marker);
  }

  reset();
})();

/* ===== NIVEAU 18 ===== */
/* Tour des échos : transférer une pile de 3, 4 puis 5 disques (tours de Hanoï, #towerBoard). */
(() => {
  const board = document.getElementById("towerBoard");
  if (!board) return;

  const language = localStorage.getItem("echoes-language") === "en" ? "en" : "fr";
  const copy = {
    fr: {
      part: "PARTIE 2 // FRACTURES",
      level: "NIVEAU 18",
      eyebrow: "Fragment 018 // La tour des échos",
      title: "La tour des échos",
      description: "Déplace toute la pile de disques vers la tour de droite. Un seul disque à la fois, et jamais un grand disque sur un plus petit.",
      systemLabel: "ECHO://TOUR",
      puzzleKicker: "PUZZLE // TRANSFERT DE PILE",
      puzzleTitle: "Tours d'écho",
      next: "CONTINUER VERS LE NIVEAU 19",
      reset: "Réinitialiser",
      ready: "Choisis une tour source, puis une tour de destination.",
      picked: "Disque sélectionné. Choisis la tour de destination.",
      empty: "Cette tour est vide.",
      illegal: "Impossible : un disque ne peut pas reposer sur un plus petit.",
      roundSuccess: "Pile transférée. Une tour plus haute apparaît.",
      success: "Les trois piles sont transférées. L'écho se stabilise.",
      system: "SYSTEME:: TOUR 018 DESALIGNEE // TRANSFERT REQUIS",
      systemSuccess: "SYSTEME:: TOUR 018 ALIGNEE // PROTOCOLE 019 DEBLOQUE",
      tower: "Tour",
      discs: "disques",
      moves: "Coups",
      progress: "Progression de la Partie 2",
      save: "SAUVEGARDER",
      saved: "SAUVEGARDÉ",
      saveHint: "Progression sauvegardée.",
      footer: "ÉCHO // FRACTURES ACTIVES",
      counter: "18 / 60",
    },
    en: {
      part: "PART 2 // FRACTURES",
      level: "LEVEL 18",
      eyebrow: "Fragment 018 // The echo tower",
      title: "The echo tower",
      description: "Move the whole stack of discs to the right tower. One disc at a time, and never a larger disc on a smaller one.",
      systemLabel: "ECHO://TOWER",
      puzzleKicker: "PUZZLE // STACK TRANSFER",
      puzzleTitle: "Echo towers",
      next: "CONTINUE TO LEVEL 19",
      reset: "Reset",
      ready: "Pick a source tower, then a destination tower.",
      picked: "Disc selected. Pick the destination tower.",
      empty: "This tower is empty.",
      illegal: "Not allowed: a disc cannot rest on a smaller one.",
      roundSuccess: "Stack transferred. A taller tower appears.",
      success: "All three stacks are transferred. The echo settles.",
      system: "SYSTEM:: TOWER 018 MISALIGNED // TRANSFER REQUIRED",
      systemSuccess: "SYSTEM:: TOWER 018 ALIGNED // PROTOCOL 019 UNLOCKED",
      tower: "Tower",
      discs: "discs",
      moves: "Moves",
      progress: "Part 2 progress",
      save: "SAVE",
      saved: "SAVED",
      saveHint: "Progress saved.",
      footer: "ECHO // ACTIVE FRACTURES",
      counter: "18 / 60",
    },
  }[language];

  const $ = (id) => document.getElementById(id);
  const status = $("puzzleStatus");
  const readout = $("progressReadout");
  const moveReadout = $("moveReadout");
  const resetButton = $("resetButton");
  const nextButton = $("nextLevelButton");
  const saveButton = $("saveGameButton");
  const systemMessage = $("systemMessage");
  const pegs = [...board.querySelectorAll(".tower-peg")];
  const discCounts = [3, 4, 5];
  let towers = [[], [], []];
  let selected = -1;
  let round = 0;
  let moves = 0;
  let solved = false;
  let locked = false;
  let advanceTimer = 0;

  document.documentElement.lang = language;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const value = copy[element.dataset.i18n];
    if (typeof value === "string") element.textContent = value;
  });
  $("levelProgress").setAttribute("aria-label", copy.progress);
  resetButton.textContent = copy.reset;
  nextButton.textContent = copy.next;
  saveButton.textContent = copy.save;

  // Affiche un message d'état (réussite, erreur ou info).
  const setStatus = (message, variant = "") => {
    status.textContent = message;
    status.className = `puzzle-status${variant ? ` ${variant}` : ""}`;
  };

  // Redessine le plateau selon l'état courant.
  const render = () => {
    const count = discCounts[Math.min(round, discCounts.length - 1)];
    pegs.forEach((peg, index) => {
      const stack = peg.querySelector(".tower-stack");
      stack.replaceChildren();
      towers[index].forEach((size, position) => {
        const disc = document.createElement("span");
        disc.className = "tower-disc";
        disc.style.width = `${26 + (size / count) * 66}%`;
        disc.style.setProperty("--disc-hue", String(190 + size * 26));
        if (selected === index && position === towers[index].length - 1) disc.classList.add("is-lifted");
        stack.appendChild(disc);
      });
      peg.classList.toggle("is-selected", selected === index);
      peg.disabled = solved || locked;
      peg.setAttribute("aria-label", `${copy.tower} ${index + 1}: ${towers[index].length} ${copy.discs}`);
    });
    readout.textContent = `${round} / ${discCounts.length}`;
    moveReadout.textContent = `${copy.moves}: ${moves}`;
  };

  // Construit la manche courante.
  const buildRound = () => {
    const count = discCounts[round];
    towers = [Array.from({ length: count }, (_, i) => count - i), [], []];
    selected = -1;
    moves = 0;
    render();
  };

  // Termine la manche et passe à la suivante ou au bouton Continuer.
  const completeRound = () => {
    round += 1;
    selected = -1;
    if (round === discCounts.length) {
      solved = true;
      board.classList.add("is-solved");
      setStatus(copy.success, "success");
      systemMessage.textContent = copy.systemSuccess;
      nextButton.hidden = false;
      window.EchoesSave?.saveProgress({ currentPage: "level-18", currentLevel: 18 });
      render();
      nextButton.focus();
      return;
    }
    locked = true;
    render();
    setStatus(copy.roundSuccess, "success");
    advanceTimer = window.setTimeout(() => {
      locked = false;
      buildRound();
      setStatus(copy.ready);
    }, 1000);
  };

  // Réagit au clic sur un piquet (déplacement d'un disque).
  const pressPeg = (index) => {
    if (solved || locked) return;
    if (selected === -1) {
      if (!towers[index].length) {
        setStatus(copy.empty);
        return;
      }
      selected = index;
      setStatus(copy.picked);
      render();
      return;
    }
    if (selected === index) {
      selected = -1;
      setStatus(copy.ready);
      render();
      return;
    }
    const disc = towers[selected][towers[selected].length - 1];
    const target = towers[index][towers[index].length - 1];
    if (target !== undefined && target < disc) {
      setStatus(copy.illegal);
      selected = -1;
      render();
      return;
    }
    towers[selected].pop();
    towers[index].push(disc);
    selected = -1;
    moves += 1;
    setStatus(copy.ready);
    render();
    if (towers[2].length === discCounts[round]) completeRound();
  };

  // Remet le puzzle à zéro.
  const reset = () => {
    window.clearTimeout(advanceTimer);
    round = 0;
    solved = false;
    locked = false;
    board.classList.remove("is-solved");
    systemMessage.textContent = copy.system;
    nextButton.hidden = true;
    setStatus(copy.ready);
    buildRound();
  };

  pegs.forEach((peg, index) => peg.addEventListener("click", () => pressPeg(index)));
  resetButton.addEventListener("click", reset);
  nextButton.addEventListener("click", () => {
    window.location.href = "niveau-19.html";
  });
  saveButton.addEventListener("click", () => {
    if (!window.EchoesSave?.saveProgress({ currentPage: "level-18", currentLevel: 18 })) return;
    saveButton.textContent = copy.saved;
    setStatus(copy.saveHint);
    window.setTimeout(() => {
      saveButton.textContent = copy.save;
    }, 1800);
  });

  for (let level = 11; level <= 20; level += 1) {
    const marker = document.createElement("span");
    marker.className = `level-square${level === 18 ? " current" : ""}`;
    marker.setAttribute("aria-hidden", "true");
    $("levelProgress").appendChild(marker);
  }

  reset();
})();

/* ===== NIVEAU 19 ===== */
/* Sudoku de lettres (français, ou anglais si la langue choisie au départ est « en ») : 9 lettres au lieu de chiffres, la ligne en surbrillance révèle un mot caché (#sudokuBoard). */
(() => {
  const board = document.getElementById("sudokuBoard");
  if (!board) return;

  const language = localStorage.getItem("echoes-language") === "en" ? "en" : "fr";
  const hiddenWord = language === "en" ? "FRAGMENTS" : "BOUCLIERS";
  const copy = {
    fr: {
      part: "PARTIE 2 // FRACTURES",
      level: "NIVEAU 19",
      eyebrow: "Fragment 019 // Le sudoku des lettres",
      title: "Le sudoku des lettres",
      description: "Un sudoku où les chiffres sont remplacés par 9 lettres. Chaque lettre apparaît une seule fois par ligne, par colonne et par bloc de 3 x 3. Une fois la grille finie, la ligne en surbrillance révèle le mot caché.",
      systemLabel: "ECHO://LEXIQUE",
      puzzleKicker: "PUZZLE // LANGAGE",
      puzzleTitle: "Grille de lettres",
      next: "CONTINUER VERS LE NIVEAU 20",
      reset: "Nouvelle grille",
      check: "VÉRIFIER",
      wordTitle: "MOT CACHÉ",
      ready: "Touche une case, tape une lettre ou choisis-en une plus bas. Pas d'accents.",
      wrong: "Certaines lettres sont fausses : elles sont marquées en rouge.",
      allGood: "Aucune erreur pour l'instant. Continue !",
      success: "Grille complète. Le mot caché est révélé : ",
      system: "SYSTEME:: LEXIQUE 019 VERROUILLE // GRILLE A COMPLETER",
      systemSuccess: "SYSTEME:: LEXIQUE 019 COMPLET // PROTOCOLE 020 DEBLOQUE",
      words: "cases",
      progress: "Progression de la Partie 2",
      save: "SAUVEGARDER",
      saved: "SAUVEGARDÉ",
      saveHint: "Progression sauvegardée.",
      footer: "ÉCHO // FRACTURES ACTIVES",
      counter: "19 / 60",
    },
    en: {
      part: "PART 2 // FRACTURES",
      level: "LEVEL 19",
      eyebrow: "Fragment 019 // The letter sudoku",
      title: "The letter sudoku",
      description: "A sudoku where digits are replaced by 9 letters. Each letter appears once per row, per column and per 3 x 3 block. Once the grid is done, the highlighted row reveals the hidden word.",
      systemLabel: "ECHO://LEXICON",
      puzzleKicker: "PUZZLE // LANGUAGE",
      puzzleTitle: "Letter grid",
      next: "CONTINUE TO LEVEL 20",
      reset: "New grid",
      check: "CHECK",
      wordTitle: "HIDDEN WORD",
      ready: "Tap a cell, type a letter or pick one below.",
      wrong: "Some letters are wrong: they are marked in red.",
      allGood: "No mistakes so far. Keep going!",
      success: "Grid complete. The hidden word is revealed: ",
      system: "SYSTEM:: LEXICON 019 LOCKED // GRID TO COMPLETE",
      systemSuccess: "SYSTEM:: LEXICON 019 COMPLETE // PROTOCOL 020 UNLOCKED",
      words: "cells",
      progress: "Part 2 progress",
      save: "SAVE",
      saved: "SAVED",
      saveHint: "Progress saved.",
      footer: "ECHO // ACTIVE FRACTURES",
      counter: "19 / 60",
    },
  }[language];

  const $ = (id) => document.getElementById(id);
  const status = $("puzzleStatus");
  const readout = $("progressReadout");
  const resetButton = $("resetButton");
  const nextButton = $("nextLevelButton");
  const saveButton = $("saveGameButton");
  const checkButton = $("checkButton");
  const systemMessage = $("systemMessage");
  const grid = $("sdGrid");
  const wordBox = $("sdWord");
  const letterBox = $("sdLetters");
  const letters = [...hiddenWord];
  const cells = [];
  let solution = [];
  let wordRow = 4;
  let solved = false;
  let activeCell = null;

  document.documentElement.lang = language;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const value = copy[element.dataset.i18n];
    if (typeof value === "string") element.textContent = value;
  });
  $("levelProgress").setAttribute("aria-label", copy.progress);
  $("sdWordTitle").textContent = copy.wordTitle;
  resetButton.textContent = copy.reset;
  checkButton.textContent = copy.check;
  nextButton.textContent = copy.next;
  saveButton.textContent = copy.save;

  // Affiche un message d'état (réussite, erreur ou info).
  const setStatus = (message, variant = "") => {
    status.textContent = message;
    status.className = `puzzle-status${variant ? ` ${variant}` : ""}`;
  };

  // Tire un entier au hasard entre 0 et max - 1.
  const rand = (max) => Math.floor(Math.random() * max);

  // Mélange un tableau (Fisher-Yates).
  const shuffle = (list) => {
    for (let i = list.length - 1; i > 0; i -= 1) {
      const j = rand(i + 1);
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  };

  // Construit une solution valide dont une ligne (wordRow) se lit comme le mot caché.
  const buildSolution = () => {
    const rows = [];
    const bands = shuffle([0, 1, 2]);
    let hiddenIndex = 0;
    bands.forEach((band) => {
      shuffle([0, 1, 2]).forEach((offset) => {
        const source = band * 3 + offset;
        if (source === 4) hiddenIndex = rows.length;
        rows.push(source);
      });
    });
    wordRow = hiddenIndex;
    return rows.map((source) =>
      Array.from({ length: 9 }, (_, col) => letters[((3 * (source % 3) + Math.floor(source / 3) + col) % 9 + 5) % 9]),
    );
  };

  // Compte les solutions d'une grille (s'arrête à 2) pour garantir qu'elle est unique.
  const countSolutions = (values) => {
    const work = values.map((row) => row.slice());
    let count = 0;
    const options = (r, c) => {
      const used = new Set();
      for (let i = 0; i < 9; i += 1) {
        used.add(work[r][i]);
        used.add(work[i][c]);
      }
      const br = r - (r % 3);
      const bc = c - (c % 3);
      for (let i = 0; i < 3; i += 1) for (let j = 0; j < 3; j += 1) used.add(work[br + i][bc + j]);
      return letters.filter((letter) => !used.has(letter));
    };
    const solve = () => {
      let best = null;
      for (let r = 0; r < 9 && best !== 0; r += 1) {
        for (let c = 0; c < 9; c += 1) {
          if (work[r][c]) continue;
          const choice = options(r, c);
          if (!best || choice.length < best.list.length) best = { r, c, list: choice };
          if (choice.length === 0) return;
        }
      }
      if (!best) {
        count += 1;
        return;
      }
      for (const letter of best.list) {
        work[best.r][best.c] = letter;
        solve();
        work[best.r][best.c] = "";
        if (count > 1) return;
      }
    };
    solve();
    return count;
  };

  // Retire des cases tant que la grille garde une solution unique (la ligne du mot caché d'abord).
  const buildPuzzle = () => {
    const puzzle = solution.map((row) => row.slice());
    const order = shuffle(Array.from({ length: 81 }, (_, i) => i));
    order.sort((a, b) => (Math.floor(b / 9) === wordRow) - (Math.floor(a / 9) === wordRow));
    let removed = 0;
    for (const index of order) {
      if (removed >= 52) break;
      const r = Math.floor(index / 9);
      const c = index % 9;
      const keep = puzzle[r][c];
      puzzle[r][c] = "";
      if (countSolutions(puzzle) === 1) removed += 1;
      else puzzle[r][c] = keep;
    }
    return puzzle;
  };

  // Construit les cases de la grille et la palette de lettres.
  const build = () => {
    for (let row = 0; row < 9; row += 1) {
      for (let col = 0; col < 9; col += 1) {
        const box = document.createElement("div");
        box.className = "sd-cell";
        if (col % 3 === 2 && col < 8) box.classList.add("sd-right");
        if (row % 3 === 2 && row < 8) box.classList.add("sd-bottom");
        const input = document.createElement("input");
        input.type = "text";
        input.maxLength = 2;
        input.autocomplete = "off";
        input.autocapitalize = "characters";
        input.spellcheck = false;
        input.setAttribute("aria-label", `${row + 1}-${col + 1}`);
        const cell = { row, col, box, input, given: false };
        input.addEventListener("focus", () => {
          activeCell = cell;
          highlight();
        });
        input.addEventListener("input", () => typeLetter(cell));
        input.addEventListener("keydown", (event) => handleKey(event, cell));
        box.appendChild(input);
        grid.appendChild(box);
        cells.push(cell);
      }
    }
    letters.forEach((letter) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "sd-letter";
      button.textContent = letter;
      button.addEventListener("click", () => {
        if (!activeCell || activeCell.given || solved) return;
        activeCell.input.value = letter;
        typeLetter(activeCell);
      });
      letterBox.appendChild(button);
    });
    letters.forEach(() => {
      const slot = document.createElement("span");
      slot.className = "sd-slot";
      wordBox.appendChild(slot);
    });
  };

  // Renvoie la case aux coordonnées données.
  const at = (row, col) => cells[row * 9 + col];

  // Met en évidence la case active et sa ligne, sa colonne et son bloc.
  const highlight = () => {
    cells.forEach((cell) => {
      const near =
        activeCell &&
        (cell.row === activeCell.row ||
          cell.col === activeCell.col ||
          (Math.floor(cell.row / 3) === Math.floor(activeCell.row / 3) &&
            Math.floor(cell.col / 3) === Math.floor(activeCell.col / 3)));
      cell.box.classList.toggle("is-word", Boolean(near));
      cell.box.classList.toggle("is-active", cell === activeCell);
    });
  };

  // Déplace le focus avec les flèches.
  const moveArrow = (cell, dRow, dCol) => {
    const target = at(Math.min(8, Math.max(0, cell.row + dRow)), Math.min(8, Math.max(0, cell.col + dCol)));
    target.input.focus();
  };

  // Gère la saisie d'une lettre (majuscule, sans accent, limitée aux 9 lettres du puzzle).
  const typeLetter = (cell) => {
    if (cell.given) return;
    const raw = cell.input.value.normalize("NFD").replace(/[^A-Za-z]/g, "").toUpperCase();
    const last = raw.slice(-1);
    cell.input.value = letters.includes(last) ? last : "";
    cell.box.classList.remove("is-wrong");
    refresh();
  };

  // Gère les touches de navigation et d'effacement.
  const handleKey = (event, cell) => {
    if (solved) return;
    const arrows = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    if (arrows[event.key]) {
      event.preventDefault();
      moveArrow(cell, ...arrows[event.key]);
    } else if (event.key === "Enter") {
      event.preventDefault();
      check();
    }
  };

  // Met à jour les doublons, la progression, le mot caché et la victoire.
  const refresh = () => {
    let filled = 0;
    cells.forEach((cell) => {
      if (cell.input.value) filled += 1;
      const value = cell.input.value;
      const clash =
        value &&
        cells.some(
          (other) =>
            other !== cell &&
            other.input.value === value &&
            (other.row === cell.row ||
              other.col === cell.col ||
              (Math.floor(other.row / 3) === Math.floor(cell.row / 3) &&
                Math.floor(other.col / 3) === Math.floor(cell.col / 3))),
        );
      cell.box.classList.toggle("is-clash", Boolean(clash));
    });
    readout.textContent = `${filled} / 81 ${copy.words}`;
    wordBox.querySelectorAll(".sd-slot").forEach((slot, index) => {
      slot.textContent = at(wordRow, index).input.value;
    });
    if (cells.every((cell) => cell.input.value === solution[cell.row][cell.col])) win();
  };

  // Marque en rouge les lettres qui ne correspondent pas à la solution.
  const check = () => {
    if (solved) return;
    let errors = 0;
    cells.forEach((cell) => {
      const bad = cell.input.value !== "" && cell.input.value !== solution[cell.row][cell.col];
      cell.box.classList.toggle("is-wrong", bad);
      if (bad) errors += 1;
    });
    setStatus(errors ? copy.wrong : copy.allGood, errors ? "error" : "success");
  };

  // Termine le niveau : révèle le mot caché et débloque la suite.
  const win = () => {
    solved = true;
    board.classList.add("is-solved");
    cells.forEach((cell) => {
      cell.input.disabled = true;
      cell.box.classList.remove("is-active", "is-word", "is-wrong", "is-clash");
    });
    setStatus(`${copy.success}${hiddenWord}`, "success");
    systemMessage.textContent = copy.systemSuccess;
    nextButton.hidden = false;
    window.EchoesSave?.saveProgress({ currentPage: "level-19", currentLevel: 19 });
    nextButton.focus();
  };

  // Génère une nouvelle grille et remet l'état à zéro.
  const reset = () => {
    solved = false;
    activeCell = null;
    board.classList.remove("is-solved");
    solution = buildSolution();
    const puzzle = buildPuzzle();
    cells.forEach((cell) => {
      const value = puzzle[cell.row][cell.col];
      cell.given = value !== "";
      cell.input.value = value;
      cell.input.disabled = false;
      cell.input.readOnly = cell.given;
      cell.input.tabIndex = cell.given ? -1 : 0;
      cell.box.classList.toggle("is-given", cell.given);
      cell.box.classList.toggle("is-hidden-row", cell.row === wordRow);
      cell.box.classList.remove("is-active", "is-word", "is-wrong", "is-clash");
    });
    systemMessage.textContent = copy.system;
    nextButton.hidden = true;
    refresh();
    setStatus(copy.ready);
  };

  resetButton.addEventListener("click", reset);
  checkButton.addEventListener("click", check);
  nextButton.addEventListener("click", () => {
    window.location.href = "niveau-20.html";
  });
  saveButton.addEventListener("click", () => {
    if (!window.EchoesSave?.saveProgress({ currentPage: "level-19", currentLevel: 19 })) return;
    saveButton.textContent = copy.saved;
    setStatus(copy.saveHint, "success");
    window.setTimeout(() => {
      saveButton.textContent = copy.save;
    }, 1400);
  });

  for (let level = 11; level <= 20; level += 1) {
    const marker = document.createElement("span");
    marker.className = `level-square${level === 19 ? " current" : ""}`;
    marker.setAttribute("aria-hidden", "true");
    $("levelProgress").appendChild(marker);
  }

  build();
  reset();
})();
/* ===== NIVEAU 20 ===== */
/* Cadenas des symboles : déduire la valeur de chaque symbole, répondre à 4 opérations, puis régler un chiffre du cadenas avec la somme (#codeBoard). */
(() => {
  const board = document.getElementById("codeBoard");
  if (!board) return;

  const language = localStorage.getItem("echoes-language") === "en" ? "en" : "fr";
  const copy = {
    fr: {
      part: "PARTIE 2 // FRACTURES",
      level: "NIVEAU 20",
      eyebrow: "Fragment 020 // Le cadenas des symboles",
      title: "Le cadenas des symboles",
      description: "Chaque symbole cache un chiffre. Déduis-les grâce aux indices, réponds aux quatre opérations, additionne les résultats : le dernier chiffre de la somme règle une molette du cadenas.",
      systemLabel: "ECHO://CADENAS",
      puzzleKicker: "PUZZLE // DÉCHIFFRAGE",
      puzzleTitle: "Cadenas à quatre chiffres",
      next: "CONTINUER VERS LE NIVEAU 21",
      reset: "Réinitialiser",
      clues: "INDICES",
      questions: "À RÉSOUDRE",
      padlock: "CADENAS",
      choose: "?",
      ready: "Déduis la valeur de chaque symbole, puis écris les résultats (chiffres uniquement).",
      okAnswer: "Bonne réponse.",
      badAnswer: "Ce résultat n'est pas bon. Recalcule avec la valeur des symboles.",
      sumReady: "Les quatre résultats sont bons. Additionne-les puis règle la molette éclairée avec le dernier chiffre de la somme.",
      sumLabel: "Somme",
      badDigit: "Ce n'est pas le bon chiffre. Additionne les quatre résultats et garde le dernier chiffre.",
      stageDone: "Molette réglée. Nouvelle série de symboles.",
      success: "Le cadenas s'ouvre. Les quatre chiffres sont corrects.",
      system: "SYSTEME:: CADENAS 020 VERROUILLE // QUATRE CHIFFRES REQUIS",
      systemSuccess: "SYSTEME:: CADENAS 020 OUVERT // PROTOCOLE 021 DEBLOQUE",
      wheel: "Molette",
      stage: "Série",
      progress: "Progression de la Partie 2",
      save: "SAUVEGARDER",
      saved: "SAUVEGARDÉ",
      saveHint: "Progression sauvegardée.",
      footer: "ÉCHO // FRACTURES ACTIVES",
      counter: "20 / 60",
    },
    en: {
      part: "PART 2 // FRACTURES",
      level: "LEVEL 20",
      eyebrow: "Fragment 020 // The symbol padlock",
      title: "The symbol padlock",
      description: "Each symbol hides a number. Deduce them from the clues, answer the four operations, add the results: the last digit of the sum sets one wheel of the padlock.",
      systemLabel: "ECHO://PADLOCK",
      puzzleKicker: "PUZZLE // DECODING",
      puzzleTitle: "Four-digit padlock",
      next: "CONTINUE TO LEVEL 21",
      reset: "Reset",
      clues: "CLUES",
      questions: "TO SOLVE",
      padlock: "PADLOCK",
      choose: "?",
      ready: "Deduce the value of each symbol, then type the results (digits only).",
      okAnswer: "Correct answer.",
      badAnswer: "That result is wrong. Recalculate with the symbol values.",
      sumReady: "All four results are right. Add them up, then set the lit wheel to the last digit of the sum.",
      sumLabel: "Sum",
      badDigit: "Wrong digit. Add the four results and keep the last digit.",
      stageDone: "Wheel set. A new series of symbols appears.",
      success: "The padlock opens. All four digits are correct.",
      system: "SYSTEM:: PADLOCK 020 SEALED // FOUR DIGITS REQUIRED",
      systemSuccess: "SYSTEM:: PADLOCK 020 OPEN // PROTOCOL 021 UNLOCKED",
      wheel: "Wheel",
      stage: "Series",
      progress: "Part 2 progress",
      save: "SAVE",
      saved: "SAVED",
      saveHint: "Progress saved.",
      footer: "ECHO // ACTIVE FRACTURES",
      counter: "20 / 60",
    },
  }[language];

  const $ = (id) => document.getElementById(id);
  const status = $("puzzleStatus");
  const readout = $("progressReadout");
  const resetButton = $("resetButton");
  const nextButton = $("nextLevelButton");
  const saveButton = $("saveGameButton");
  const systemMessage = $("systemMessage");
  const cluesBox = $("codeClues");
  const questionsBox = $("codeQuestions");
  const sumBox = $("codeSum");
  const padlockBox = $("codePadlock");
  const symbols = ["●", "◆", "▲", "■", "★"];
  const stageCount = 4;
  let stage = 0;
  let values = [];
  let questions = [];
  let answered = 0;
  let digits = Array(stageCount).fill(null);
  let solved = false;
  let locked = false;
  let advanceTimer = 0;

  document.documentElement.lang = language;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const value = copy[element.dataset.i18n];
    if (typeof value === "string") element.textContent = value;
  });
  $("levelProgress").setAttribute("aria-label", copy.progress);
  resetButton.textContent = copy.reset;
  nextButton.textContent = copy.next;
  saveButton.textContent = copy.save;

  // Affiche un message d'état (réussite, erreur ou info).
  const setStatus = (message, variant = "") => {
    status.textContent = message;
    status.className = `puzzle-status${variant ? ` ${variant}` : ""}`;
  };

  // Mélange une liste au hasard.
  const shuffle = (list) => {
    const copyList = [...list];
    for (let i = copyList.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copyList[i], copyList[j]] = [copyList[j], copyList[i]];
    }
    return copyList;
  };

  // Tire quatre symboles avec des valeurs différentes et construit indices et questions de la série.
  const buildStage = () => {
    const symbolIds = shuffle([0, 1, 2, 3, 4]).slice(0, 4);
    const nums = shuffle([1, 2, 3, 4, 5, 6]).slice(0, 4);
    const [a, b, c, d] = symbolIds;
    const [va, vb, vc, vd] = nums;
    values = [];
    symbolIds.forEach((id, index) => {
      values[id] = nums[index];
    });
    const useProduct = stage >= 1;
    cluesBox.replaceChildren();
    const clueLines = [
      { terms: [a, a], op: "+", result: va + va },
      { terms: [a, b], op: "+", result: va + vb },
      { terms: [b, c], op: useProduct ? "×" : "+", result: useProduct ? vb * vc : vb + vc },
      { terms: [c, d], op: "+", result: vc + vd },
    ];
    clueLines.forEach((line) => {
      cluesBox.appendChild(buildLine(line.terms, line.op, String(line.result)));
    });
    questions = [
      { terms: [a, b], op: "×", result: va * vb },
      { terms: [b, c], op: "+", result: vb + vc },
      { terms: [c, d], op: "×", result: vc * vd },
      { terms: [d, a, b], op: "+", result: vd + va + vb },
    ];
    questionsBox.replaceChildren();
    questions.forEach((question, index) => {
      const select = document.createElement("input");
      select.className = "code-answer";
      select.type = "text";
      select.inputMode = "numeric";
      select.maxLength = 2;
      select.autocomplete = "off";
      select.placeholder = copy.choose;
      select.setAttribute("aria-label", `${copy.questions} ${index + 1}`);
      select.addEventListener("input", () => {
        select.value = select.value.replace(/\D/g, "");
        select.classList.remove("is-wrong");
        if (select.value.length >= String(question.result).length) checkAnswer(select, question);
      });
      const line = buildLine(question.terms, question.op, null);
      line.appendChild(select);
      questionsBox.appendChild(line);
    });
    answered = 0;
    sumBox.textContent = "";
    sumBox.hidden = true;
  };

  // Construit une ligne d'équation avec des symboles colorés.
  const buildLine = (terms, op, result) => {
    const line = document.createElement("div");
    line.className = "code-equation";
    terms.forEach((id, index) => {
      if (index > 0) {
        const sign = document.createElement("span");
        sign.className = "code-op";
        sign.textContent = op;
        line.appendChild(sign);
      }
      const symbol = document.createElement("span");
      symbol.className = "code-symbol";
      symbol.dataset.symbol = String(id);
      symbol.textContent = symbols[id];
      line.appendChild(symbol);
    });
    const equal = document.createElement("span");
    equal.className = "code-op";
    equal.textContent = "=";
    line.appendChild(equal);
    if (result !== null) {
      const value = document.createElement("strong");
      value.className = "code-result";
      value.textContent = result;
      line.appendChild(value);
    }
    return line;
  };

  // Vérifie le résultat choisi dans une liste déroulante.
  const checkAnswer = (select, question) => {
    if (solved || locked || select.value === "") return;
    if (Number(select.value) !== question.result) {
      select.classList.add("is-wrong");
      setStatus(copy.badAnswer, "error");
      return;
    }
    select.classList.remove("is-wrong");
    select.classList.add("is-correct");
    select.disabled = true;
    answered += 1;
    if (answered < questions.length) {
      setStatus(copy.okAnswer, "success");
      return;
    }
    const total = questions.reduce((sum, item) => sum + item.result, 0);
    sumBox.textContent = `${copy.sumLabel} = ${questions.map((item) => item.result).join(" + ")}`;
    sumBox.hidden = false;
    setStatus(copy.sumReady, "success");
    renderPadlock();
    sumBox.dataset.total = String(total);
  };

  // Dessine les molettes du cadenas et allume celle de la série en cours.
  const renderPadlock = () => {
    padlockBox.replaceChildren();
    for (let index = 0; index < stageCount; index += 1) {
      const select = document.createElement("input");
      select.className = "code-wheel";
      select.type = "text";
      select.inputMode = "numeric";
      select.maxLength = 1;
      select.autocomplete = "off";
      select.placeholder = copy.choose;
      select.setAttribute("aria-label", `${copy.wheel} ${index + 1}`);
      if (digits[index] !== null) {
        select.value = String(digits[index]);
        select.disabled = true;
        select.classList.add("is-correct");
      } else {
        const active = index === stage && answered === questions.length && !solved;
        select.disabled = !active;
        select.classList.toggle("is-active", active);
        select.addEventListener("input", () => {
          select.value = select.value.replace(/\D/g, "");
          checkDigit(select, index);
        });
      }
      padlockBox.appendChild(select);
    }
    readout.textContent = `${digits.filter((digit) => digit !== null).length} / ${stageCount}`;
  };

  // Vérifie le chiffre choisi sur la molette (dernier chiffre de la somme).
  const checkDigit = (select, index) => {
    if (solved || locked || select.value === "") return;
    const expected = Number(sumBox.dataset.total) % 10;
    if (Number(select.value) !== expected) {
      select.value = "";
      setStatus(copy.badDigit, "error");
      return;
    }
    digits[index] = expected;
    stage += 1;
    if (stage === stageCount) {
      solved = true;
      board.classList.add("is-solved");
      renderPadlock();
      setStatus(copy.success, "success");
      systemMessage.textContent = copy.systemSuccess;
      nextButton.hidden = false;
      window.EchoesSave?.saveProgress({ currentPage: "level-20", currentLevel: 20 });
      nextButton.focus();
      return;
    }
    locked = true;
    renderPadlock();
    setStatus(copy.stageDone, "success");
    advanceTimer = window.setTimeout(() => {
      locked = false;
      buildStage();
      renderPadlock();
      setStatus(copy.ready);
    }, 1200);
  };

  // Remet le puzzle à zéro.
  const reset = () => {
    window.clearTimeout(advanceTimer);
    stage = 0;
    digits = Array(stageCount).fill(null);
    solved = false;
    locked = false;
    board.classList.remove("is-solved");
    systemMessage.textContent = copy.system;
    nextButton.hidden = true;
    buildStage();
    renderPadlock();
    setStatus(copy.ready);
  };

  resetButton.addEventListener("click", reset);
  nextButton.addEventListener("click", () => {
    window.location.href = "niveau-21.html";
  });
  saveButton.addEventListener("click", () => {
    if (!window.EchoesSave?.saveProgress({ currentPage: "level-20", currentLevel: 20 })) return;
    saveButton.textContent = copy.saved;
    setStatus(copy.saveHint, "success");
    window.setTimeout(() => {
      saveButton.textContent = copy.save;
    }, 1400);
  });

  for (let level = 11; level <= 20; level += 1) {
    const marker = document.createElement("span");
    marker.className = `level-square${level === 20 ? " current" : ""}`;
    marker.setAttribute("aria-hidden", "true");
    $("levelProgress").appendChild(marker);
  }

  reset();
})();