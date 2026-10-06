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
        "Deux fragments vibrent en parallèle. Aligne les formes sur les deux lignes pour les harmoniser sans les désynchroniser.",
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
      slot: (line, position, shape) =>
        `${line}, emplacement ${position} : ${shape}`,
      tray: "Fragments à aligner",
      start: "DÉMARRER LE PUZZLE",
      ready: "Glisse un fragment vers son emplacement ou sélectionne-le puis choisis une case.",
      playing: "« Deux fragments… deux résonances. Harmonise-les. »",
      selected: (shape) => `${shape} sélectionné. Choisis son emplacement dans la bonne ligne.`,
      wrong: "Désynchronisation ! Les deux lignes se décalent. Recommence leur alignement.",
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
        "Two fragments vibrate in parallel. Align the shapes on both lines and bring them into harmony without desynchronizing them.",
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
      slot: (line, position, shape) =>
        `${line}, slot ${position}: ${shape}`,
      tray: "Fragments to align",
      start: "START PUZZLE",
      ready: "Drag a fragment to its slot, or select it and choose a slot.",
      playing: "“Two fragments… two resonances. Bring them into harmony.”",
      selected: (shape) => `${shape} selected. Choose its slot on the matching line.`,
      wrong: "Desynchronization! Both lines shift out of place. Align them again.",
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
  const systemMessage = $("systemMessage");
  const shapes = ["circle", "triangle", "diamond", "square"];
  const lineShapes = [shapes, ["triangle", "circle", "square", "diamond"]];
  const pieces = lineShapes.flatMap((row, line) =>
    row.map((shape, position) => ({
      id: `${line}-${position}`,
      shape,
      line,
      position,
    })),
  );
  const slotKey = (line, position) => `${line}-${position}`;
  const placed = new Map();
  let selectedPiece = null;
  let started = false;
  let solved = false;

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

  const setStatus = (message, state = "") => {
    status.textContent = message;
    status.className = `puzzle-status${state ? ` ${state}` : ""}`;
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
        slot.setAttribute("aria-label", copy.slot(copy.line[line], position + 1, copy.shape[shape]));
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
        } else {
          slot.innerHTML = `<span class="slot-hint" aria-hidden="true"><span class="shape-icon shape-${shape}"></span><span class="slot-index">0${position + 1}</span></span>`;
        }
        slot.disabled = !started || solved;
        slots.appendChild(slot);
      });
      lane.appendChild(slots);
      board.appendChild(lane);
    }

    const trayOrder = ["0-2", "1-1", "0-0", "1-0", "1-3", "0-1", "1-2", "0-3"];
    trayOrder.forEach((id) => {
      if ([...placed.values()].includes(id)) return;
      const piece = pieces.find((item) => item.id === id);
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

  const placePiece = (key, pieceId = selectedPiece) => {
    if (!started || solved || !pieceId || placed.has(key)) return;
    const piece = pieces.find((item) => item.id === pieceId);
    const [line, position] = key.split("-").map(Number);
    if (!piece) return;

    if (piece.line !== line || piece.position !== position) {
      placed.clear();
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
    placed.clear();
    selectedPiece = null;
    started = false;
    solved = false;
    board.classList.remove("is-synchronized", "is-desynchronized");
    systemMessage.textContent = copy.system;
    startButton.disabled = false;
    nextButton.hidden = true;
    setStatus(copy.ready);
    render();
  };

  startButton.addEventListener("click", () => {
    started = true;
    startButton.disabled = true;
    render();
    setStatus(copy.playing);
    tray.querySelector(".resonance-piece")?.focus();
  });
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

  render();
})();
