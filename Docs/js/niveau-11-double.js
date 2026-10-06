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
