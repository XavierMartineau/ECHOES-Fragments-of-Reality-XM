/*
 * PARTIE 1 // NIVEAUX 01-15
 *
 * Reference map:
 * - Levels 01-07: legacy puzzle blocks below the active-level router.
 * - Level 08: .advanced-sort-board -> color sorting.
 * - Level 09: .constellation-board -> three star sequences.
 * - Level 10: .color-sequence-board -> color memory sequence.
 * - Level 11: .pairs-board -> memory matching, 6/12/21 cards.
 * - Level 12: .ordering-board -> ordered card deposits.
 * - Level 13: .fractal-board -> five-panel fractal pattern.
 * - Level 14: .combined-sequence-board -> combined ordered sequence.
 * - Level 15: reserved placeholder; intentionally not constructed yet.
 *
 * Each page identifies its controller through one marker in this table.
 */
const levelScriptByMarker = [
  [".light-sequence", 2],
  [".sort-board", 3],
  [".rotation-board", 4],
  [".sound-board", 5],
  [".pattern-board", 6],
  [".gate-board", 7],
  [".advanced-sort-board", 8],
  [".constellation-board", 9],
  [".color-sequence-board", 10],
  [".pairs-board", 11],
  [".ordering-board", 12],
  [".fractal-board", 13],
  [".combined-sequence-board", 14],
];
function ensureLevelFooter() {
  let footer = document.querySelector(".level-footer");
  if (!footer) {
    footer = document.createElement("footer");
    footer.className = "level-footer";
    document.body.appendChild(footer);
  }
  if (!footer.querySelector(".site-credit")) {
    const credit = document.createElement("span");
    credit.className = "site-credit";
    credit.textContent = "© 2026 Xavier Martineau // TOUS DROITS RÉSERVÉS";
    footer.appendChild(credit);
  }
}

function installProgressDots() {
  // Creates the small success indicators from each puzzle's readout (0 / N).
  document.querySelectorAll(".progress-readout").forEach((readout) => {
    const actions = readout
      .closest(".puzzle-panel")
      ?.querySelector(".puzzle-actions");
    if (!actions) return;

    let dots = actions.querySelector(".sequence-progress-dots");
    if (!dots) {
      dots = document.createElement("div");
      dots.className = "sequence-progress-dots";
      dots.setAttribute("role", "img");
      dots.setAttribute("aria-label", "Progression du puzzle");
      actions.appendChild(dots);
    }

    const updateDots = () => {
      const match = readout.textContent.match(/(\d+)\s*\/\s*(\d+)/);
      if (!match) return;
      const current = Number(match[1]);
      const total = Number(match[2]);
      dots.replaceChildren(
        ...Array.from({ length: total }, (_, index) => {
          const dot = document.createElement("span");
          dot.className = `sequence-progress-dot${index < current ? " is-complete" : ""}`;
          dot.setAttribute("aria-hidden", "true");
          return dot;
        }),
      );
      dots.setAttribute("aria-label", `Progression : ${current} sur ${total}`);
    };

    updateDots();
    new MutationObserver(updateDots).observe(readout, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  });
}

installProgressDots();

const activeLevelScript = levelScriptByMarker.find(([marker]) =>
  document.querySelector(marker),
);

if (activeLevelScript) {
  // Shared bootstrap for levels 2-14: language, save state, footer, and next link.
  const language =
    localStorage.getItem("echoes-language") === "en" ? "en" : "fr";
  const accountId = window.EchoesSave?.getCurrentUser?.() || "guest";
  const progressStorageKey = `echoes-completed-levels-${encodeURIComponent(accountId)}`;
  const legacyCompletedLevels = JSON.parse(
    localStorage.getItem("echoes-completed-levels") || "[]",
  );
  const completedLevels = new Set([
    ...legacyCompletedLevels,
    ...JSON.parse(localStorage.getItem(progressStorageKey) || "[]"),
  ]);
  if (accountId !== "guest" && completedLevels.size) {
    localStorage.setItem(
      progressStorageKey,
      JSON.stringify([...completedLevels].sort((a, b) => a - b)),
    );
  }
  const levelNumber = activeLevelScript[1];
  const futureCopy = {
    6: {
      level: "NIVEAU 06",
      title: "Observation des motifs",
      description: "Trouve les trois symboles identiques.",
      puzzleTitle: "Motifs caches",
      startPuzzle: "DEMARRER LE PUZZLE",
      statusReady: "Repere les trois symboles identiques.",
      systemInput:
        "SYSTEME:: OBJECTIF 006 // TROUVER 3 SYMBOLES IDENTIQUES SUR 20",
      statusSuccess: "Motif restaure.",
      statusError: "Ce symbole ne correspond pas.",
      systemSuccess: "SYSTEME:: MOTIF 006 RESTAURE // MEMOIRE SYNCHRONISEE",
      systemError: "SYSTEME:: MOTIF INCOMPATIBLE",
      reset: "Reinitialiser",
      save: "SAUVEGARDER",
    },
    7: {
      level: "NIVEAU 07",
      title: "Porte lumineuse",
      description: "Active les trois symboles dans le bon ordre.",
      puzzleTitle: "Sequence de la porte",
      startPuzzle: "DEMARRER LE PUZZLE",
      statusReady: "Active les symboles dans le bon ordre.",
      systemInput:
        "SYSTEME:: OBJECTIF 007 // ACTIVER LA PORTE DANS LE BON ORDRE",
      statusSuccess: "La porte est ouverte.",
      statusError: "La sequence est incorrecte.",
      systemSuccess: "SYSTEME:: PORTE 007 OUVERTE",
      systemError: "SYSTEME:: SEQUENCE REFUSEE",
      reset: "Reinitialiser",
      save: "SAUVEGARDER",
    },
    8: {
      level: "NIVEAU 08",
      title: "Tri des symboles",
      description: "Classe les symboles selon leur couleur.",
      puzzleTitle: "Classification chromatique",
      startPuzzle: "DEMARRER LE PUZZLE",
      statusReady: "Classe chaque symbole dans sa couleur.",
      statusSuccess: "Classification restauree.",
      statusError: "Mauvaise couleur.",
      systemSuccess: "SYSTEME:: COULEURS 008 RESTAUREES",
      systemError: "SYSTEME:: COULEUR INCOMPATIBLE",
      reset: "Reinitialiser",
      save: "SAUVEGARDER",
    },
    9: {
      level: "NIVEAU 09",
      title: "Miroirs simples",
      description: "Oriente les miroirs vers le recepteur.",
      puzzleTitle: "Reflexion holographique",
      startPuzzle: "DEMARRER LE PUZZLE",
      statusReady: "Aligne les trois miroirs.",
      statusSuccess: "Le rayon atteint le recepteur.",
      statusError: "Le rayon est devie.",
      systemSuccess: "SYSTEME:: REFLEXION 009 RESTAUREE",
      systemError: "SYSTEME:: RAYON DESYNCHRONISE",
      reset: "Reinitialiser",
      save: "SAUVEGARDER",
    },
    10: {
      level: "NIVEAU 10",
      title: "Premiere illusion",
      description: "Trouve la seule forme reelle.",
      puzzleTitle: "Hologrammes instables",
      startPuzzle: "DEMARRER LE PUZZLE",
      statusReady: "Identifie l'hologramme reel.",
      statusSuccess: "La verite holographique est revelee.",
      statusError: "Cette forme est une illusion.",
      systemSuccess: "SYSTEME:: ILLUSION 010 STABILISEE",
      systemError: "SYSTEME:: PROJECTION DETECTEE",
      reset: "Reinitialiser",
      save: "SAUVEGARDER",
    },
    11: {
      level: "NIVEAU 11",
      title: "Double alignement",
      description: "Active les deux lignes holographiques dans le bon ordre.",
      puzzleTitle: "Synchronisation double",
      statusReady: "Active les modules dans l'ordre indique.",
      statusSuccess: "Les deux lignes sont synchronisees.",
      statusError: "Mauvais module. La sequence recommence.",
      reset: "Reinitialiser",
      save: "SAUVEGARDER",
    },
    12: {
      level: "NIVEAU 12",
      title: "Lumiere croisee",
      description: "Active les intersections lumineuses dans le bon ordre.",
      puzzleTitle: "Reseau de lumiere",
      statusReady: "Active les intersections dans l'ordre indique.",
      statusSuccess: "Le reseau lumineux est stabilise.",
      statusError: "Mauvaise intersection. La sequence recommence.",
      reset: "Reinitialiser",
      save: "SAUVEGARDER",
    },
    13: {
      level: "NIVEAU 13",
      title: "Glissement holographique",
      description: "Reconstruis le motif fractal dans les neuf panneaux.",
      puzzleTitle: "Motif fractal",
      statusReady: "Active les panneaux du motif lumineux.",
      statusSuccess: "Le motif fractal est reconstruit.",
      statusError: "Le motif reste instable.",
      reset: "Reinitialiser",
      save: "SAUVEGARDER",
    },
    14: {
      level: "NIVEAU 14",
      title: "Sequence combinee",
      description: "Reproduis la combinaison lumineuse dans le bon ordre.",
      puzzleTitle: "Protocole combine",
      statusReady: "Observe puis reproduis la combinaison.",
      statusSuccess: "Les signaux combines sont stabilises.",
      statusError: "Signal incorrect. La sequence recommence.",
      reset: "Reinitialiser",
      save: "SAUVEGARDER",
    },
  };
  const levelCopy =
    window.translations?.[language]?.[`level${levelNumber}`] ||
    futureCopy[levelNumber];
  const shuffle = (items) => {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [result[index], result[randomIndex]] = [
        result[randomIndex],
        result[index],
      ];
    }
    return result;
  };
  const installBackButton = () => {
    ensureLevelFooter();
    const previousPage = `niveau-${String(levelNumber - 1).padStart(2, "0")}.html`;
    const button = document.createElement("button");
    button.className = "level-back-button";
    button.type = "button";
    button.textContent = "← RETOUR";
    button.setAttribute("aria-label", "Retour à la page précédente");
    button.addEventListener("click", () => {
      window.location.href = previousPage;
    });
    document.body.prepend(button);
  };
  const renderProgress = () => {
    const progress = document.getElementById("levelProgress");
    if (!progress) return;
    progress.replaceChildren();
    for (let level = 1; level <= 15; level += 1) {
      const square = document.createElement("span");
      square.className = "level-square";
      square.setAttribute("aria-label", `${levelCopy.level} ${level}`);
      if (completedLevels.has(level)) square.classList.add("completed");
      if (level === levelNumber) square.classList.add("current");
      progress.appendChild(square);
    }
  };
  const saveCompletion = () => {
    completedLevels.add(levelNumber);
    const levels = [...completedLevels].sort((a, b) => a - b);
    localStorage.setItem(progressStorageKey, JSON.stringify(levels));
    window.EchoesSave.saveProgress({
      currentPage: `level-${levelNumber}`,
      currentLevel: levelNumber,
      completedLevels: levels,
    });
    renderProgress();
  };
  const successMessage = (message) => {
    const sector = Math.ceil(levelNumber / 15);
    const nextSector = Math.min(sector + 1, 6);
    const remaining = sector * 15 - levelNumber;
    return `${message} // ${remaining} NIVEAUX AVANT SECTEUR ${nextSector}`;
  };
  // Applies the selected language to the static labels of the active level.
  const applyCopy = () => {
    document.documentElement.lang = language;
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      if (levelCopy[element.dataset.i18n])
        element.textContent = levelCopy[element.dataset.i18n];
    });
    document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
      const value = levelCopy[element.dataset.i18nAria];
      if (value)
        element.setAttribute(
          "aria-label",
          Array.isArray(value) ? value.join(" / ") : value,
        );
    });
    document.getElementById("saveGameButton").textContent = levelCopy.save;
    document.getElementById("resetButton").textContent = levelCopy.reset;
    const nextButton = document.getElementById("nextLevelButton");
    if (nextButton) {
      nextButton.textContent =
        language === "en"
          ? `CONTINUE TO LEVEL ${levelNumber + 1}`
          : `CONTINUER VERS LE NIVEAU ${levelNumber + 1}`;
    }
  };
  installBackButton();
  applyCopy();
  renderProgress();
  window.EchoesSave?.saveProgress({
    currentPage: `level-${levelNumber}`,
    currentLevel: levelNumber,
    completedLevels: [...completedLevels].sort((a, b) => a - b),
  });

  // ===== NIVEAU 2 // SEQUENCE LUMINEUSE =====
  if (document.querySelector(".light-sequence")) {
    const board = document.getElementById("puzzleBoard");
    const lights = [...document.querySelectorAll(".sequence-light")];
    const status = document.getElementById("puzzleStatus");
    const readout = document.getElementById("progressReadout");
    const system = document.getElementById("systemMessage");
    const start = document.getElementById("sequenceStartButton");
    const reset = document.getElementById("resetButton");
    const save = document.getElementById("saveGameButton");
    const next = document.getElementById("nextLevelButton");
    const transmission = document.querySelector(".system-transmission");
    const sequence = shuffle([0, 1, 2, 3]);
    let input = [];
    let watching = false;
    let solved = false;
    let started = false;
    start.textContent = levelCopy.watchSequence;
    let token = 0;
    const update = () => {
      readout.textContent = `${input.length} / ${sequence.length}`;
    };
    const state = (index, value) => {
      lights[index].classList.remove("is-active", "is-error", "is-correct");
      if (value) lights[index].classList.add(`is-${value}`);
    };
    const play = () => {
      token += 1;
      const currentToken = token;
      watching = true;
      input = [];
      update();
      status.textContent = levelCopy.statusWatching;
      start.disabled = true;
      sequence.forEach((index, order) =>
        window.setTimeout(() => {
          if (currentToken !== token) return;
          state(index, "active");
          window.setTimeout(
            () => currentToken === token && state(index, null),
            420,
          );
        }, order * 720),
      );
      window.setTimeout(() => {
        if (currentToken !== token) return;
        watching = false;
        start.disabled = false;
        status.textContent = levelCopy.statusPlaying;
      }, sequence.length * 720);
    };
    const solve = () => {
      solved = true;
      lights.forEach((_, index) => state(index, "correct"));
      board.classList.add("solved");
      status.textContent = levelCopy.statusSuccess;
      status.className = "puzzle-status success";
      transmission.classList.add("success");
      saveCompletion();
      system.textContent = successMessage(levelCopy.systemSuccess);
      window.setTimeout(() => {
        next.hidden = false;
        next.focus();
      }, 500);
    };
    lights.forEach((light) =>
      light.addEventListener("click", () => {
        if (!started || watching || solved) return;
        const index = Number(light.dataset.light);
        input.push(index);
        update();
        if (index !== sequence[input.length - 1]) {
          state(index, "error");
          status.textContent = levelCopy.statusError;
          status.className = "puzzle-status error";
          system.textContent = levelCopy.systemError;
          window.setTimeout(play, 650);
          return;
        }
        state(index, "correct");
        if (input.length === sequence.length) solve();
      }),
    );
    start.addEventListener("click", () => {
      if (solved) {
        solved = false;
        board.classList.remove("solved");
        lights.forEach((_, index) => state(index, null));
        transmission.classList.remove("success");
        input = [];
        status.className = "puzzle-status";
        status.textContent = levelCopy.statusReady;
        system.textContent = levelCopy.systemInput;
        update();
      }
      started = true;
      play();
    });
    reset.addEventListener("click", () => {
      token += 1;
      input = [];
      solved = false;
      watching = false;
      board.classList.remove("solved");
      lights.forEach((_, index) => state(index, null));
      transmission.classList.remove("success");
      next.hidden = true;
      start.disabled = false;
      started = false;
      status.className = "puzzle-status";
      status.textContent = levelCopy.statusReady;
      system.textContent = levelCopy.systemInput;
      update();
    });
    save.addEventListener("click", () =>
      window.EchoesSave.saveProgress({
        currentPage: "level-2",
        currentLevel: 2,
        completedLevels: [...completedLevels].sort((a, b) => a - b),
      }),
    );
    next.addEventListener("click", () => {
      window.location.href = "niveau-03.html";
    });
    status.textContent = levelCopy.statusReady;
    if (completedLevels.has(2)) {
      next.hidden = false;
      start.disabled = false;
    }
    update();
  }

  // ===== NIVEAU 3 // CLASSIFICATION DES FORMES =====
  if (document.querySelector(".sort-board")) {
    const board = document.getElementById("puzzleBoard");
    const pieceTray = document.getElementById("sortPieces");
    const slotTray = document.getElementById("sortSlots");
    const status = document.getElementById("puzzleStatus");
    const readout = document.getElementById("progressReadout");
    const system = document.getElementById("systemMessage");
    const start = document.getElementById("startPuzzleButton");
    const reset = document.getElementById("resetButton");
    const save = document.getElementById("saveGameButton");
    const next = document.getElementById("nextLevelButton");
    const transmission = document.querySelector(".system-transmission");
    const shapes = [
      "triangle",
      "circle",
      "square",
      "hexagon",
      "diamond",
      "star",
    ];
    const solution = shuffle(shapes);
    let selected = null;
    let placed = 0;
    let started = false;
    const pieceIndex = (shape) => shapes.indexOf(shape);
    const update = () => {
      readout.textContent = `${placed} / ${solution.length}`;
    };
    solution.forEach((shape, index) => {
      const slot = document.createElement("button");
      slot.className = `sort-slot slot-${shape}`;
      slot.type = "button";
      slot.dataset.shape = shape;
      slot.dataset.slot = index;
      slotTray.appendChild(slot);
    });
    shuffle(solution).forEach((shape) => {
      const piece = document.createElement("button");
      piece.className = `sort-piece shape-${shape}`;
      piece.type = "button";
      piece.dataset.shape = shape;
      piece.setAttribute(
        "aria-label",
        levelCopy.pieceLabels[pieceIndex(shape)],
      );
      pieceTray.appendChild(piece);
    });
    const pieces = [...pieceTray.querySelectorAll(".sort-piece")];
    const slots = [...slotTray.querySelectorAll(".sort-slot")];
    pieces.forEach((piece) =>
      piece.addEventListener("click", () => {
        if (!started || piece.disabled) return;
        pieces.forEach((item) => item.classList.remove("is-selected"));
        slots.forEach((slot) => slot.classList.remove("is-target"));
        selected = piece;
        piece.classList.add("is-selected");
        slots
          .find((slot) => slot.dataset.shape === piece.dataset.shape)
          ?.classList.add("is-target");
        status.textContent = levelCopy.statusSelected;
      }),
    );
    const place = (slot) => {
      if (!started || !selected || slot.classList.contains("is-filled")) return;
      if (selected.dataset.shape !== slot.dataset.shape) {
        slot.classList.add("is-error");
        status.textContent = levelCopy.statusError;
        status.className = "puzzle-status error";
        system.textContent = levelCopy.systemError;
        window.setTimeout(() => slot.classList.remove("is-error"), 500);
        return;
      }
      slot.classList.add("is-filled");
      slot.appendChild(selected);
      selected.classList.add("is-placed");
      selected.disabled = true;
      selected = null;
      placed += 1;
      update();
      if (placed === solution.length) {
        board.classList.add("solved");
        status.textContent = levelCopy.statusSuccess;
        status.className = "puzzle-status success";
        transmission.classList.add("success");
        saveCompletion();
        system.textContent = successMessage(levelCopy.systemSuccess);
        window.setTimeout(() => {
          next.hidden = false;
          next.focus();
        }, 450);
      }
    };
    pieces.forEach((piece) => (piece.disabled = true));
    slots.forEach((slot) => (slot.disabled = true));
    start.textContent = levelCopy.startPuzzle;
    start.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      placed = 0;
      selected = null;
      board.classList.remove("solved");
      transmission.classList.remove("success");
      slots.forEach((slot) => {
        slot.className = `sort-slot slot-${slot.dataset.shape}`;
        const piece = slot.querySelector(".sort-piece");
        if (piece) pieceTray.appendChild(piece);
      });
      pieces.forEach((piece) => {
        piece.disabled = false;
        piece.className = `sort-piece shape-${piece.dataset.shape}`;
      });
      update();
      started = true;
      pieces.forEach((piece) => (piece.disabled = false));
      slots.forEach((slot) => (slot.disabled = false));
      start.disabled = true;
      status.textContent = levelCopy.statusReady;
    });
    slots.forEach((slot) => slot.addEventListener("click", () => place(slot)));
    reset.addEventListener("click", () => window.location.reload());
    save.addEventListener("click", () =>
      window.EchoesSave.saveProgress({
        currentPage: "level-3",
        currentLevel: 3,
        completedLevels: [...completedLevels].sort((a, b) => a - b),
      }),
    );
    next.addEventListener("click", () => {
      window.location.href = "niveau-04.html";
    });
    if (completedLevels.has(3)) {
      next.hidden = false;
      start.disabled = false;
    }
    update();
  }

  // ===== NIVEAU 4 // ROTATION HOLOGRAPHIQUE =====
  if (document.querySelector(".rotation-board")) {
    const board = document.getElementById("puzzleBoard");
    const object = document.getElementById("rotationObject");
    const target = document.querySelector(".rotation-target");
    const start = document.getElementById("startPuzzleButton");
    const rotate = document.getElementById("rotateButton");
    const reset = document.getElementById("resetButton");
    const angleReadout = document.getElementById("currentAngle");
    const targetReadout = document.getElementById("targetAngle");
    const readout = document.getElementById("progressReadout");
    const status = document.getElementById("puzzleStatus");
    const system = document.getElementById("systemMessage");
    const next = document.getElementById("nextLevelButton");
    const transmission = document.querySelector(".system-transmission");
    const targetAngles = shuffle([45, 135, 225, 315]);
    let angle = 0;
    let index = 0;
    let current = null;
    let solved = false;
    let started = false;
    const load = () => {
      current = { targetAngle: targetAngles[index] };
      angle = 0;
      object.classList.remove("is-cleared");
      target.style.transform = `rotate(${current.targetAngle}deg)`;
      targetReadout.textContent = `${current.targetAngle}°`;
      angleReadout.textContent = "0°";
      readout.textContent = `${index} / 4`;
    };
    rotate.addEventListener("click", () => {
      if (!started || solved) return;
      angle = (angle + 45) % 360;
      object.style.setProperty("--object-angle", `${angle}deg`);
      angleReadout.textContent = `${angle}°`;
      if (angle !== current.targetAngle) return;
      index += 1;
      rotate.disabled = true;
      readout.textContent = `${index} / 4`;
      if (index === 4) {
        window.setTimeout(() => {
          solved = true;
          board.classList.add("solved");
          status.textContent = levelCopy.statusSuccess;
          status.className = "puzzle-status success";
          transmission.classList.add("success");
          saveCompletion();
          system.textContent = successMessage(levelCopy.systemSuccess);
          next.hidden = false;
          next.focus();
        }, 450);
        return;
      }
      window.setTimeout(() => {
        load();
        rotate.disabled = false;
      }, 650);
    });
    rotate.disabled = true;
    start.textContent = levelCopy.startPuzzle;
    start.addEventListener("click", () => {
      if (solved) {
        solved = false;
        index = 0;
        board.classList.remove("solved");
        transmission.classList.remove("success");
        load();
        next.hidden = false;
      }
      started = true;
      start.disabled = false;
      rotate.disabled = false;
      status.textContent = levelCopy.statusReady;
    });
    reset.addEventListener("click", () => window.location.reload());
    next.addEventListener("click", () => {
      window.location.href = "niveau-05.html";
    });
    load();
    if (completedLevels.has(4)) {
      next.hidden = false;
      start.disabled = false;
      rotate.disabled = true;
    }
  }

  // ===== NIVEAU 5 // SEQUENCE SONORE =====
  if (document.querySelector(".sound-board")) {
    const board = document.getElementById("puzzleBoard");
    const notes = [...document.querySelectorAll(".sound-note")];
    const status = document.getElementById("puzzleStatus");
    const readout = document.getElementById("progressReadout");
    const system = document.getElementById("systemMessage");
    const start = document.getElementById("sequenceStartButton");
    const reset = document.getElementById("resetButton");
    const next = document.getElementById("nextLevelButton");
    const transmission = document.querySelector(".system-transmission");
    const sequence = shuffle([0, 1, 2, 3]);
    const frequencies = [196, 261.63, 392, 523.25];
    let input = [];
    let watching = false;
    let solved = false;
    let started = false;
    start.textContent = levelCopy.watchSequence;
    let context;
    const tone = (index) => {
      context ||= new AudioContext();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = frequencies[index];
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.18, context.currentTime + 0.025);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        context.currentTime + 0.38,
      );
      oscillator.connect(gain).connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.4);
    };
    const play = () => {
      watching = true;
      input = [];
      readout.textContent = "0 / 4";
      start.disabled = true;
      sequence.forEach((index, order) =>
        window.setTimeout(() => {
          tone(index);
          notes[index].classList.add("is-active");
          window.setTimeout(
            () => notes[index].classList.remove("is-active"),
            420,
          );
        }, order * 720),
      );
      window.setTimeout(() => {
        watching = false;
        start.disabled = false;
        status.textContent = levelCopy.statusPlaying;
      }, 2880);
    };
    const finish = () => {
      solved = true;
      board.classList.add("solved");
      notes.forEach((note) => note.classList.add("is-correct"));
      status.textContent = levelCopy.statusSuccess;
      status.className = "puzzle-status success";
      transmission.classList.add("success");
      saveCompletion();
      system.textContent = successMessage(levelCopy.systemSuccess);
      next.hidden = false;
      next.focus();
    };
    notes.forEach((note) =>
      note.addEventListener("click", () => {
        if (!started || watching || solved) return;
        const index = Number(note.dataset.note);
        tone(index);
        input.push(index);
        readout.textContent = `${input.length} / 4`;
        if (index !== sequence[input.length - 1]) {
          note.classList.add("is-error");
          status.textContent = levelCopy.statusError;
          system.textContent = levelCopy.systemError;
          window.setTimeout(play, 650);
          return;
        }
        note.classList.add("is-correct");
        if (input.length === 4) finish();
      }),
    );
    start.addEventListener("click", () => {
      if (solved) {
        solved = false;
        board.classList.remove("solved");
        notes.forEach((note) =>
          note.classList.remove("is-correct", "is-error"),
        );
        transmission.classList.remove("success");
        input = [];
        readout.textContent = "0 / 4";
        status.className = "puzzle-status";
        status.textContent = levelCopy.statusReady;
        system.textContent = levelCopy.systemInput;
      }
      started = true;
      play();
    });
    reset.addEventListener("click", () => window.location.reload());
    next.addEventListener("click", () => {
      window.location.href = "niveau-06.html";
    });
    status.textContent = levelCopy.statusReady;
    if (completedLevels.has(5)) {
      next.hidden = false;
      start.disabled = false;
    }
  }

  // ===== NIVEAU 6 // OBSERVATION DES MOTIFS =====
  if (document.querySelector(".pattern-board")) {
    const grid = document.getElementById("patternGrid");
    const start = document.getElementById("startPuzzleButton");
    const next = document.getElementById("nextLevelButton");
    const reset = document.getElementById("resetButton");
    const status = document.getElementById("puzzleStatus");
    const readout = document.getElementById("progressReadout");
    const system = document.getElementById("systemMessage");
    const transmission = document.querySelector(".system-transmission");
    let targetIndexes;
    let started = false;
    let found = 0;
    let targetGlyph = "★";
    const targetGlyphs = ["★", "✚", "☾", "✹", "✪"];
    const symbols = [
      "◇",
      "○",
      "△",
      "⬡",
      "□",
      "✧",
      "✺",
      "✧",
      "⬢",
      "✣",
      "◈",
      "✥",
      "▽",
      "⬟",
      "✤",
      "◊",
      "❖",
      "⊙",
      "⌁",
      "≈",
    ];
    system.textContent = levelCopy.systemInput;
    const renderPattern = () => {
      targetIndexes = new Set(
        shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3),
      );
      targetGlyph =
        targetGlyphs[Math.floor(Math.random() * targetGlyphs.length)];
      grid.replaceChildren();
      symbols.forEach((symbol, index) => {
        const button = document.createElement("button");
        button.className = `pattern-symbol${targetIndexes.has(index) ? " pattern-target" : ""}`;
        button.type = "button";
        button.textContent = targetIndexes.has(index) ? targetGlyph : symbol;
        button.dataset.match = targetIndexes.has(index) ? "true" : "false";
        button.disabled = true;
        grid.appendChild(button);
        button.addEventListener("click", () => {
          if (!started || button.disabled) return;
          if (button.dataset.match === "true") {
            button.classList.add("is-correct");
            button.disabled = true;
            found += 1;
            readout.textContent = `${found} / 3`;
            if (found === 3) {
              status.textContent = levelCopy.statusSuccess;
              status.className = "puzzle-status success";
              transmission.classList.add("success");
              saveCompletion();
              system.textContent = successMessage(levelCopy.systemSuccess);
              next.hidden = false;
            }
          } else {
            button.classList.add("is-error");
            status.textContent = levelCopy.statusError;
            window.setTimeout(() => button.classList.remove("is-error"), 400);
          }
        });
      });
    };
    renderPattern();
    const clearPatternState = () => {
      grid.classList.remove("is-solved");
      grid.querySelectorAll(".pattern-symbol").forEach((button) => {
        button.classList.remove("is-correct", "is-error");
      });
    };
    start.textContent = levelCopy.startPuzzle;
    start.addEventListener("click", () => {
      document.body.classList.remove("level-corruption");
      transmission.classList.remove("error");
      system.classList.remove("echo-corrupted-message");
      started = true;
      start.disabled = true;
      grid
        .querySelectorAll("button")
        .forEach((button) => (button.disabled = false));
      status.textContent = levelCopy.statusReady;
    });
    reset.addEventListener("click", () => {
      started = false;
      found = 0;
      clearPatternState();
      renderPattern();
      grid
        .querySelectorAll("button")
        .forEach((button) => (button.disabled = true));
      readout.textContent = "0 / 3";
      status.className = "puzzle-status";
      status.textContent = levelCopy.statusReady;
      transmission.classList.remove("success");
      system.textContent = levelCopy.systemInput;
      start.disabled = false;
      next.hidden = true;
    });
    next.addEventListener("click", () => {
      window.location.href = "niveau-07.html";
    });
    if (completedLevels.has(6)) {
      next.hidden = false;
      start.disabled = false;
      started = false;
      found = 0;
      readout.textContent = "0 / 3";
    }
  }

  // ===== NIVEAU 7 // PORTE LUMINEUSE =====
  if (document.querySelector(".gate-board")) {
    const buttons = [...document.querySelectorAll("[data-gate]")];
    const start = document.getElementById("startPuzzleButton");
    const next = document.getElementById("nextLevelButton");
    const reset = document.getElementById("resetButton");
    const status = document.getElementById("puzzleStatus");
    const readout = document.getElementById("progressReadout");
    const system = document.getElementById("systemMessage");
    const transmission = document.querySelector(".system-transmission");
    const gateDoor = document.getElementById("gateDoor");
    const sequenceStatus = document.getElementById("gateSequenceStatus");
    const stageLengths = [3, 4, 5];
    const difficultyLabels = ["FACILE", "MOYEN", "DIFFICILE"];
    let order = [];
    let input = [];
    let started = false;
    let watching = false;
    const failureTransmission = `ECHO:: P0urqu0i as-tu f@it ça, Voyageur ?\nECHO:: Je te faisais c0nfiance... tr??st_failure = TRUE\nECHO_C0RE:: MEM0RY_LINK // c0herence: 07%\nMISSION_FAILED:: ECHO_CORE PIRATE // MEM0IRE DETRUITE\nTRANSMISSION:: TERM1NATED // s1gnal_l0st`;
    const typeFailureTransmission = () => {
      system.textContent = "";
      let index = 0;
      const typeCharacter = () => {
        system.textContent += failureTransmission[index++];
        if (index < failureTransmission.length)
          window.setTimeout(typeCharacter, 18);
      };
      typeCharacter();
    };
    let stageIndex = 0;
    system.textContent = levelCopy.systemInput;
    buttons.forEach((button) => (button.disabled = true));
    const loadStage = () => {
      order = shuffle(
        buttons
          .slice(0, stageLengths[stageIndex])
          .map((button) => Number(button.dataset.gate)),
      );
      input = [];
      buttons.forEach((button, index) => {
        button.disabled = index >= stageLengths[stageIndex];
        button.classList.remove("is-correct", "is-error", "is-preview");
      });
      readout.textContent = `${stageIndex + 1} / 3`;
      sequenceStatus.textContent = `SIGNAL:// ${difficultyLabels[stageIndex]} // ${stageLengths[stageIndex]} BOUTONS ACTIFS`;
    };
    const playStage = () => {
      watching = true;
      sequenceStatus.textContent = `SIGNAL:// LECTURE ${difficultyLabels[stageIndex]}`;
      order.forEach((gate, index) =>
        window.setTimeout(() => {
          buttons[gate].classList.add("is-preview");
          window.setTimeout(
            () => buttons[gate].classList.remove("is-preview"),
            420,
          );
        }, index * 700),
      );
      window.setTimeout(() => {
        watching = false;
        status.textContent = levelCopy.statusReady;
        sequenceStatus.textContent = `SIGNAL:// ${difficultyLabels[stageIndex]} MÉMORISÉ`;
      }, order.length * 700);
    };
    loadStage();
    start.textContent = levelCopy.startPuzzle;
    start.addEventListener("click", () => {
      started = true;
      start.disabled = true;
      buttons
        .slice(0, stageLengths[stageIndex])
        .forEach((button) => (button.disabled = false));
      playStage();
    });
    buttons.forEach((button) =>
      button.addEventListener("click", () => {
        if (
          !started ||
          watching ||
          Number(button.dataset.gate) >= stageLengths[stageIndex]
        )
          return;
        const value = Number(button.dataset.gate);
        input.push(value);
        readout.textContent = `${stageIndex + 1} / 3`;
        if (value !== order[input.length - 1]) {
          status.textContent = levelCopy.statusError;
          status.className = "puzzle-status error";
          system.textContent = levelCopy.systemError;
          document.body.classList.add("level-corruption");
          transmission.classList.add("error");
          system.classList.add("echo-corrupted-message");
          typeFailureTransmission();
          input = [];
          readout.textContent = `${stageIndex + 1} / 3`;
          buttons.forEach((item) => item.classList.remove("is-correct"));
          sequenceStatus.textContent =
            "SIGNAL:// DÉSYNCHRONISATION // NOUVELLE LECTURE REQUISE";
          return;
        }
        button.classList.add("is-correct");
        if (input.length === order.length) {
          stageIndex += 1;
          if (stageIndex < stageLengths.length) {
            buttons.forEach((item) => item.classList.remove("is-correct"));
            status.textContent = `NIVEAU ${stageIndex + 1} CHARGÉ // ${difficultyLabels[stageIndex]}`;
            start.disabled = true;
            window.setTimeout(() => {
              loadStage();
              playStage();
            }, 550);
            return;
          }
          status.textContent = levelCopy.statusSuccess;
          status.className = "puzzle-status success";
          transmission.classList.add("success");
          gateDoor.classList.add("is-open");
          sequenceStatus.textContent = "GATE:// OUVERT // ACCÈS STABILISÉ";
          saveCompletion();
          system.textContent = successMessage(levelCopy.systemSuccess);
          next.hidden = false;
        }
      }),
    );
    reset.addEventListener("click", () => window.location.reload());
    next.addEventListener("click", () => {
      window.location.href = "niveau-08.html";
    });
    if (completedLevels.has(7)) next.hidden = false;
  }
} else {
  // ===== NIVEAU 1 =====
  // Le puzzle d'alignement est géré directement dans ce bloc.
  function installBackButton(fallbackHref = "../../../index.html") {
    ensureLevelFooter();
    if (document.querySelector(".level-back-button")) return;
    const style = document.createElement("style");
    style.textContent = `.level-back-button{position:fixed;top:auto;bottom:52px;left:18px;z-index:20;padding:9px 12px;border:1px solid rgba(121,247,255,.5);background:rgba(5,7,17,.9);color:#79f7ff;cursor:pointer;font:0.58rem var(--font-display,"Orbitron",sans-serif);letter-spacing:.08rem;text-transform:uppercase}.level-back-button:hover,.level-back-button:focus-visible{background:rgba(121,247,255,.18);box-shadow:0 0 18px rgba(121,247,255,.32);outline:none}@media(max-width:560px){.level-back-button{top:auto;bottom:46px;left:14px}.level-header{padding-top:64px}.level-shell{padding-bottom:96px}.level-meta{flex-wrap:wrap;max-width:100%}.level-meta strong,.level-meta span{overflow-wrap:anywhere}.level-description,.system-transmission p,.puzzle-status{overflow-wrap:anywhere}}`;
    document.head.appendChild(style);
    const button = document.createElement("button");
    button.className = "level-back-button";
    button.type = "button";
    button.textContent = "← RETOUR";
    button.setAttribute("aria-label", "Retour à la page précédente");
    button.addEventListener("click", () => {
      const referrer = document.referrer;
      if (referrer && new URL(referrer).origin === window.location.origin) {
        window.history.back();
      } else {
        window.location.href = fallbackHref;
      }
    });
    document.body.prepend(button);
  }

  installBackButton();

  const board = document.getElementById("puzzleBoard");
  const pieces = [...document.querySelectorAll(".puzzle-piece")];
  const slots = [...document.querySelectorAll(".target-slot")];
  const pieceTray = document.getElementById("pieceTray");
  const status = document.getElementById("puzzleStatus");
  const progressReadout = document.getElementById("progressReadout");
  const systemMessage = document.getElementById("systemMessage");
  const startPuzzleButton = document.getElementById("startPuzzleButton");
  const resetButton = document.getElementById("resetButton");
  const levelProgress = document.getElementById("levelProgress");
  const saveGameButton = document.getElementById("saveGameButton");
  const nextLevelButton = document.getElementById("nextLevelButton");
  const systemTransmission = document.querySelector(".system-transmission");

  function shuffleArray(items) {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[randomIndex]] = [
        shuffled[randomIndex],
        shuffled[index],
      ];
    }
    return shuffled;
  }

  let solution = shuffleArray(["circle", "triangle", "square"]);
  let targetByShape = Object.fromEntries(
    solution.map((shape, index) => [shape, index]),
  );
  const language =
    localStorage.getItem("echoes-language") === "en" ? "en" : "fr";
  const levelCopy = window.translations?.[language]?.level1;
  const systemMessages = {
    input: levelCopy.systemInput,
    success: levelCopy.systemSuccess,
    error: levelCopy.systemError,
  };
  const sectorProgressMessage = (message) => {
    const remaining = 15 - currentLevel;
    return `${message} // ${remaining} NIVEAUX AVANT SECTEUR 2`;
  };
  const currentLevel = 1;
  const accountId = window.EchoesSave?.getCurrentUser?.() || "guest";
  const progressStorageKey = `echoes-completed-levels-${encodeURIComponent(accountId)}`;
  const legacyCompletedLevels = JSON.parse(
    localStorage.getItem("echoes-completed-levels") || "[]",
  );
  const completedLevels = new Set([
    ...legacyCompletedLevels,
    ...JSON.parse(localStorage.getItem(progressStorageKey) || "[]"),
  ]);
  if (accountId !== "guest" && completedLevels.size) {
    localStorage.setItem(
      progressStorageKey,
      JSON.stringify([...completedLevels].sort((a, b) => a - b)),
    );
  }
  let selectedPiece = null;
  let placedShapes = [null, null, null];
  let puzzleStarted = false;

  document.documentElement.lang = language;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    if (levelCopy[key]) element.textContent = levelCopy[key];
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
    const values = levelCopy[element.dataset.i18nAria];
    if (!values) return;
    if (Array.isArray(values)) {
      element.setAttribute("aria-label", values.join(" / "));
      element.querySelectorAll(".target-slot").forEach((slot, index) => {
        if (values[index]) slot.setAttribute("aria-label", values[index]);
      });
    } else {
      element.setAttribute("aria-label", values);
    }
  });
  saveGameButton.textContent = levelCopy.save;
  resetButton.textContent = levelCopy.reset;
  status.textContent = levelCopy.statusReady;
  const shapeLabels =
    language === "en"
      ? { triangle: "Triangle", circle: "Circle", square: "Diamond" }
      : { triangle: "Triangle", circle: "Cercle", square: "Losange" };
  systemMessages.input =
    language === "en"
      ? `SYSTEM:: INPUT REQUIRED // TARGET ORDER: ${solution
          .map((shape) => shapeLabels[shape].toUpperCase())
          .join(" > ")}`
      : `SYSTEME:: ENTREE REQUISE // ORDRE CIBLES: ${solution
          .map((shape) => shapeLabels[shape].toUpperCase())
          .join(" > ")}`;
  systemMessage.textContent = systemMessages.input;
  pieces.forEach((piece) => {
    piece.setAttribute("aria-label", shapeLabels[piece.dataset.shape]);
  });

  function shufflePieces() {
    const shuffledPieces = [...pieces].sort(() => Math.random() - 0.5);
    shuffledPieces.forEach((piece) => pieceTray.appendChild(piece));
  }

  function prepareRound() {
    solution = shuffleArray(["circle", "triangle", "square"]);
    targetByShape = Object.fromEntries(
      solution.map((shape, index) => [shape, index]),
    );
    placedShapes = [null, null, null];
    selectedPiece = null;
    board.classList.remove("solved");
    slots.forEach((slot) => {
      slot.className = "target-slot";
      slot.replaceChildren();
    });
    pieces.forEach((piece) => {
      piece.className = `puzzle-piece ${piece.className
        .split(" ")
        .filter((name) => name.startsWith("piece-"))
        .join(" ")}`;
      piece.classList.remove("selected", "placed");
      piece.removeAttribute("aria-disabled");
    });
    clearSlotPreviews();
    shufflePieces();
    systemMessages.input =
      language === "en"
        ? `SYSTEM:: TARGET ORDER: ${solution.map((shape) => shapeLabels[shape].toUpperCase()).join(" > ")}`
        : `SYSTEME:: ORDRE CIBLES: ${solution.map((shape) => shapeLabels[shape].toUpperCase()).join(" > ")}`;
    systemMessage.textContent = systemMessages.input;
    updateProgress();
  }

  // Renders the 15-level progress strip shown in the level header.
  function renderProgress() {
    levelProgress.replaceChildren();
    for (let level = 1; level <= 15; level += 1) {
      const square = document.createElement("span");
      square.className = "level-square";
      square.dataset.level = level;
      square.title = `Niveau ${level}`;
      square.setAttribute("aria-label", `Niveau ${level}`);
      if (completedLevels.has(level)) square.classList.add("completed");
      if (level === currentLevel) square.classList.add("current");
      levelProgress.appendChild(square);
    }
  }

  // Persists the current level and redraws its completed marker.
  function markCurrentLevelCompleted() {
    completedLevels.add(currentLevel);
    localStorage.setItem(
      progressStorageKey,
      JSON.stringify([...completedLevels].sort((a, b) => a - b)),
    );
    window.EchoesSave.saveProgress({
      currentPage: "level-1",
      currentLevel: currentLevel,
      completedLevels: [...completedLevels].sort((a, b) => a - b),
    });
    systemMessages.success = sectorProgressMessage(levelCopy.systemSuccess);
    renderProgress();
  }

  // Updates the puzzle-local counter used by the progress dots.
  function updateProgress() {
    const correctPlacements = placedShapes.reduce(
      (count, shape, index) => count + (shape === solution[index] ? 1 : 0),
      0,
    );
    progressReadout.textContent = `${correctPlacements} / 3`;
  }

  function typeSystemMessage(message, onComplete) {
    systemMessage.textContent = "";
    let characterIndex = 0;

    function typeCharacter() {
      systemMessage.textContent += message[characterIndex];
      characterIndex += 1;
      systemTransmission.scrollIntoView({ behavior: "auto", block: "center" });

      if (characterIndex < message.length) {
        window.setTimeout(typeCharacter, 20);
      } else if (onComplete) {
        onComplete();
      }
    }

    typeCharacter();
  }

  function selectPiece(piece) {
    if (!puzzleStarted || piece.classList.contains("placed")) return;
    pieces.forEach((item) => item.classList.remove("selected"));
    clearSlotPreviews();
    selectedPiece = piece;
    piece.classList.add("selected");
    showSlotPreview(piece.dataset.shape);
    status.textContent = levelCopy.statusSelected;
    status.className = "puzzle-status";
  }

  function clearSlotPreviews() {
    slots.forEach((slot) => {
      slot.classList.remove(
        "preview-triangle",
        "preview-circle",
        "preview-square",
      );
    });
  }

  function showSlotPreview(shape) {
    const targetSlot = slots[targetByShape[shape]];
    if (targetSlot && !targetSlot.classList.contains("filled")) {
      targetSlot.classList.add(`preview-${shape}`);
    }
  }

  function placePiece(piece, slot) {
    if (!puzzleStarted || !piece || slot.classList.contains("filled")) return;

    const shape = piece.dataset.shape;
    const slotIndex = Number(slot.dataset.slot);
    const visualPiece = document.createElement("span");
    visualPiece.className = `puzzle-piece ${piece.className.replace(" selected", "")} placed`;
    visualPiece.setAttribute("aria-hidden", "true");
    slot.appendChild(visualPiece);
    clearSlotPreviews();
    slot.classList.add("filled", `slot-${shape}`);
    placedShapes[slotIndex] = shape;
    piece.classList.remove("selected");
    piece.classList.add("placed");
    piece.setAttribute("aria-disabled", "true");
    selectedPiece = null;
    updateProgress();

    if (placedShapes.every(Boolean)) checkSolution();
  }

  function checkSolution() {
    const isCorrect = placedShapes.every(
      (shape, index) => shape === solution[index],
    );

    if (isCorrect) {
      slots.forEach((slot) => slot.classList.add("correct"));
      board.classList.add("solved");
      status.textContent = levelCopy.statusSuccess;
      status.className = "puzzle-status success";
      systemTransmission.classList.add("success");
      updateProgress();
      markCurrentLevelCompleted();
      nextLevelButton.hidden = false;
      typeSystemMessage(systemMessages.success, () => {
        nextLevelButton.focus();
      });
      return;
    }

    slots.forEach((slot, index) => {
      slot.classList.toggle(
        "incorrect",
        placedShapes[index] !== solution[index],
      );
    });
    status.textContent = levelCopy.statusError;
    status.className = "puzzle-status error";
    systemMessage.textContent = systemMessages.error;
    systemTransmission.classList.remove("success");
  }

  function resetPuzzle() {
    placedShapes = [null, null, null];
    selectedPiece = null;
    puzzleStarted = false;
    board.classList.remove("solved");
    slots.forEach((slot) => {
      slot.className = "target-slot";
      slot.replaceChildren();
    });
    clearSlotPreviews();
    pieces.forEach((piece) => {
      piece.classList.remove("selected", "placed");
      piece.removeAttribute("aria-disabled");
    });
    status.textContent = levelCopy.statusReady;
    status.className = "puzzle-status";
    nextLevelButton.hidden = true;
    startPuzzleButton.disabled = false;
    pieces.forEach((piece) => (piece.disabled = true));
    slots.forEach((slot) => (slot.disabled = true));
    prepareRound();
    systemTransmission.classList.remove("success");
    updateProgress();
  }

  pieces.forEach((piece) => {
    piece.addEventListener("click", () => selectPiece(piece));
    piece.addEventListener("dragstart", (event) => {
      selectPiece(piece);
      event.dataTransfer.setData("text/plain", piece.dataset.shape);
    });
  });

  slots.forEach((slot) => {
    slot.addEventListener("click", () => placePiece(selectedPiece, slot));
    slot.addEventListener("dragover", (event) => event.preventDefault());
    slot.addEventListener("drop", (event) => {
      event.preventDefault();
      placePiece(selectedPiece, slot);
    });
  });

  resetButton.addEventListener("click", resetPuzzle);
  saveGameButton.addEventListener("click", () => {
    window.EchoesSave.saveProgress({
      currentPage: "level-1",
      currentLevel: currentLevel,
      completedLevels: [...completedLevels].sort((a, b) => a - b),
    });
    saveGameButton.textContent = language === "en" ? "SAVED" : "SAUVEGARDÉ";
  });

  nextLevelButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    window.EchoesSave.saveProgress({
      currentPage: "level-2",
      currentLevel: 2,
      completedLevels: [...completedLevels].sort((a, b) => a - b),
    });
    window.location.assign(
      new URL("niveau-02.html", window.location.href).href,
    );
  });
  startPuzzleButton.textContent = levelCopy.startPuzzle;
  nextLevelButton.textContent =
    language === "en" ? "CONTINUE TO LEVEL 2" : "CONTINUER VERS LE NIVEAU 2";
  pieces.forEach((piece) => (piece.disabled = true));
  slots.forEach((slot) => (slot.disabled = true));
  startPuzzleButton.addEventListener("click", () => {
    if (completedLevels.has(1)) {
      resetPuzzle();
      nextLevelButton.hidden = false;
    }
    puzzleStarted = true;
    startPuzzleButton.disabled = true;
    pieces.forEach((piece) => (piece.disabled = false));
    slots.forEach((slot) => (slot.disabled = false));
    status.textContent = levelCopy.statusReady;
  });
  if (completedLevels.has(1)) {
    puzzleStarted = false;
    startPuzzleButton.disabled = false;
    nextLevelButton.hidden = false;
  }
  prepareRound();
  updateProgress();
  renderProgress();
  window.EchoesSave?.saveProgress({
    currentPage: "level-1",
    currentLevel: 1,
    completedLevels: [...completedLevels].sort((a, b) => a - b),
  });
}

// Shared controller for the newer puzzle pages (levels 8-14).
// Each page supplies only its board builder; this function owns start, reset,
// persistence, language-independent navigation, and completion feedback.
function installAdvancedLevel(levelNumber, buildPuzzle) {
  const startButton = document.getElementById("startPuzzleButton");
  const resetButton = document.getElementById("resetButton");
  const nextButton = document.getElementById("nextLevelButton");
  const status = document.getElementById("puzzleStatus");
  const systemMessage = document.getElementById("systemMessage");
  const levelCopy =
    window.translations?.[
      localStorage.getItem("echoes-language") === "en" ? "en" : "fr"
    ]?.[`level${levelNumber}`];
  const language =
    localStorage.getItem("echoes-language") === "en" ? "en" : "fr";
  const accountId = window.EchoesSave?.getCurrentUser?.() || "guest";
  const progressKey = `echoes-completed-levels-${encodeURIComponent(accountId)}`;
  const completedLevels = new Set([
    ...JSON.parse(localStorage.getItem("echoes-completed-levels") || "[]"),
    ...JSON.parse(localStorage.getItem(progressKey) || "[]"),
  ]);
  let started = false;
  let completed = false;
  let onStart = () => {};
  let resetCurrentRound = null;

  const setStatus = (message, state = "") => {
    status.textContent = message;
    status.className = `puzzle-status${state ? ` ${state}` : ""}`;
    if (systemMessage) systemMessage.textContent = message.toUpperCase();
  };

  const finish = () => {
    completed = true;
    completedLevels.add(levelNumber);
    const levels = [...completedLevels].sort((a, b) => a - b);
    localStorage.setItem(progressKey, JSON.stringify(levels));
    window.EchoesSave?.saveProgress({
      currentPage: `level-${levelNumber}`,
      currentLevel: levelNumber,
      completedLevels: levels,
    });
    nextButton.hidden = false;
    startButton.disabled = true;
    setStatus(levelCopy?.statusSuccess || "Level stabilized.", "success");
    nextButton.focus();
  };

  const reset = () => {
    started = false;
    completed = false;
    resetCurrentRound = null;
    startButton.disabled = false;
    nextButton.hidden = true;
    resetButton.classList.remove("reset-error");
    setStatus(levelCopy?.statusReady || "Ready.");
    onStart = () => {};
    buildPuzzle({
      started: () => started,
      finish,
      setStatus,
      registerStart: (callback) => {
        onStart = callback;
      },
      registerReset: (callback) => {
        resetCurrentRound = callback;
      },
    });
  };

  startButton.addEventListener("click", () => {
    started = true;
    startButton.disabled = true;
    setStatus(levelCopy?.statusReady || "Choose a target.");
    onStart();
  });
  resetButton.addEventListener("click", () => {
    if (started && resetCurrentRound) {
      resetButton.classList.remove("reset-error");
      resetCurrentRound();
      return;
    }
    reset();
  });
  nextButton.addEventListener("click", () => {
    window.location.href = `niveau-${String(levelNumber + 1).padStart(2, "0")}.html`;
  });

  const wasCompleted = completedLevels.has(levelNumber);
  reset();
  if (wasCompleted) {
    completed = true;
    startButton.disabled = true;
    nextButton.hidden = false;
  }
}

// Level 08 // Advanced color sorting: select a symbol, then place it in its target.
if (document.querySelector(".advanced-sort-board")) {
  installAdvancedLevel(8, ({ started, finish, setStatus }) => {
    const grid = document.getElementById("colorSortGrid");
    const colors = [
      ["cyan", "CYAN"],
      ["violet", "VIOLET"],
      ["green", "VERT"],
      ["pink", "ROSE"],
      ["yellow", "JAUNE"],
      ["blue", "BLEU"],
    ];
    let visualColors;
    do {
      visualColors = [...colors].sort(() => Math.random() - 0.5);
    } while (
      visualColors.some(
        ([color], index) => color === colors[index][0],
      )
    );
    const visualColorByName = Object.fromEntries(
      colors.map(([color], index) => [color, visualColors[index][0]]),
    );
    let selected = null;
    let placed = 0;
    grid.innerHTML = `
      <div class="color-sort-targets">
        ${colors.map(([color, label]) => `<button class="color-target color-${visualColorByName[color]}" data-color="${color}" type="button">${label}</button>`).join("")}
      </div>
      <div class="color-sort-pieces">
        ${[...colors]
          .reverse()
          .map(
            ([color, label]) =>
              `<button class="color-symbol color-${visualColorByName[color]}" data-color="${color}" type="button" draggable="true">${label}</button>`,
          )
          .join("")}
      </div>
    `;
    const targets = [...grid.querySelectorAll(".color-target")];
    const pieces = [...grid.querySelectorAll(".color-symbol")];
    const update = () => {
      grid
        .closest(".puzzle-panel")
        .querySelector(".progress-readout").textContent = `${placed} / 6`;
    };
    const choose = (piece) => {
      if (!started() || piece.disabled) return;
      pieces.forEach((item) => item.classList.remove("is-selected"));
      selected = piece;
      piece.classList.add("is-selected");
    };
    const place = (target) => {
      if (!started() || !selected || target.classList.contains("is-filled"))
        return;
      if (selected.dataset.color !== target.dataset.color) {
        setStatus("Mauvaise couleur. Essaie une autre zone.", "error");
        return;
      }
      target.classList.add("is-filled");
      selected.disabled = true;
      selected.classList.remove("is-selected");
      selected = null;
      placed += 1;
      update();
      if (placed === colors.length) finish();
    };
    pieces.forEach((piece) => {
      piece.addEventListener("click", () => choose(piece));
      piece.addEventListener("dragstart", (event) => {
        choose(piece);
        event.dataTransfer.setData("text/plain", piece.dataset.color);
      });
    });
    targets.forEach((target) => {
      target.addEventListener("click", () => place(target));
      target.addEventListener("dragover", (event) => event.preventDefault());
      target.addEventListener("drop", (event) => {
        event.preventDefault();
        place(target);
      });
    });
    update();
  });
}

// Level 09 // Stellar sequence: reproduce three ordered constellations.
if (document.querySelector(".constellation-board")) {
  installAdvancedLevel(9, ({ started, finish, setStatus }) => {
    const field = document.getElementById("constellationField");
    const sequences = [
      [2, 5, 1, 6],
      [4, 1, 6, 3],
      [3, 6, 2, 5],
    ];
    const positions = [
      [18, 28],
      [42, 18],
      [76, 26],
      [24, 70],
      [57, 78],
      [82, 62],
    ];
    let round = 0;
    let step = 0;
    let acceptingInput = true;
    field.innerHTML = `
      <svg class="constellation-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <polyline points=""></polyline>
      </svg>
      <div class="constellation-space" aria-hidden="true">
        ${Array.from({ length: 12 }, (_, index) => `<span class="flying-star flying-star-${index + 1}"></span>`).join("")}
      </div>
      ${positions.map((_, index) => `<button class="constellation-star star-${index + 1}" data-star="${index + 1}" type="button" aria-label="Etoile ${index + 1}"><span>${String(index + 1).padStart(2, "0")}</span></button>`).join("")}
      <div class="constellation-sequence-display">
        <span>SEQUENCE ACTIVE</span>
        <strong></strong>
      </div>
    `;
    const stars = [...field.querySelectorAll(".constellation-star")];
    const line = field.querySelector("polyline");
    const sequenceDisplay = field.querySelector(
      ".constellation-sequence-display strong",
    );
    const panel = field.closest(".puzzle-panel");
    const progress = panel.querySelector(".progress-readout");

    const render = () => {
      const activeStars = sequences[round]
        .slice(0, step)
        .map((value) => positions[value - 1]);
      line.setAttribute(
        "points",
        activeStars.map(([x, y]) => `${x},${y}`).join(" "),
      );
      stars.forEach((star) => {
        const value = Number(star.dataset.star);
        star.classList.toggle(
          "is-active",
          activeStars.some(
            ([x, y]) =>
              positions[value - 1][0] === x && positions[value - 1][1] === y,
          ),
        );
      });
      sequenceDisplay
        .querySelectorAll(".sequence-number")
        .forEach((number, index) => {
          number.classList.toggle("is-selected", index < step);
        });
      field.dataset.round = String(round + 1);
    };

    const showSequence = () => {
      const sequenceValues = sequences[round];
      const sequence = sequenceValues
        .map((value) => String(value).padStart(2, "0"))
        .join(" > ");
      sequenceDisplay.innerHTML = sequenceValues
        .map(
          (value, index) =>
            `<span class="sequence-number star-sequence-${value}"><span class="sequence-label">${String(value).padStart(2, "0")}</span></span>${index < sequenceValues.length - 1 ? '<span class="sequence-separator">&gt;</span>' : ""}`,
        )
        .join("");
      setStatus(`Manche ${round + 1} / 3 : active la séquence ${sequence}.`);
    };

    const nextRound = () => {
      round += 1;
      step = 0;
      acceptingInput = true;
      render();
      showSequence();
    };

    stars.forEach((star) => {
      star.addEventListener("click", () => {
        if (!started() || !acceptingInput) return;
        const selected = Number(star.dataset.star);
        const expected = sequences[round][step];
        if (selected !== expected) {
          step = 0;
          render();
          setStatus("Mauvaise étoile. La séquence recommence.", "error");
          return;
        }
        step += 1;
        star.classList.add("is-confirmed");
        render();
        if (step < sequences[round].length) {
          setStatus(`Étoile ${step} / ${sequences[round].length} confirmée.`);
          return;
        }
        acceptingInput = false;
        round += 1;
        progress.textContent = `${round} / 3`;
        if (round === sequences.length) {
          finish();
          return;
        }
        setStatus(
          `Manche ${round} / 3 réussie. Nouvelle constellation en préparation...`,
          "success",
        );
        window.setTimeout(() => {
          step = 0;
          acceptingInput = true;
          render();
          showSequence();
        }, 700);
      });
    });
    progress.textContent = "0 / 3";
    render();
    showSequence();
  });
}

// Level 10 // Color memory: watch one color at a time, then reproduce the sequence.
if (document.querySelector(".color-sequence-board")) {
  installAdvancedLevel(10, ({ started, finish, setStatus, registerStart }) => {
    const grid = document.getElementById("colorSequenceGrid");
    const replayButton = document.getElementById("replaySequenceButton");
    const colors = ["cyan", "pink", "yellow", "violet", "blue"];
    const labels = {
      cyan: "CYAN",
      pink: "ROSE",
      yellow: "JAUNE",
      violet: "VIOLET",
      blue: "BLEU",
    };
    let input = [];
    let showing = false;
    let playToken = 0;
    let lastSequenceKey = "";
    const generateSequence = () => {
      let nextSequence;
      do {
        nextSequence = [];
        for (let index = 0; index < 5; index += 1) {
          const previousColor = nextSequence[index - 1];
          const available = colors.filter((color) => color !== previousColor);
          nextSequence.push(
            available[Math.floor(Math.random() * available.length)],
          );
        }
      } while (nextSequence.join(">") === lastSequenceKey);
      lastSequenceKey = nextSequence.join(">");
      return nextSequence;
    };
    let sequence = generateSequence();
    grid.innerHTML = colors
      .map(
        (color, index) =>
          `<button class="color-sequence-option color-sequence-${color}" data-color="${color}" type="button" aria-label="Couleur ${labels[color]}"><span>${String(index + 1).padStart(2, "0")}</span></button>`,
      )
      .join("");
    const options = [...grid.querySelectorAll(".color-sequence-option")];
    const progress = grid
      .closest(".puzzle-panel")
      .querySelector(".progress-readout");
    const replayLabel =
      document.documentElement.lang === "en"
        ? "REPLAY SEQUENCE"
        : "REJOUER LA SEQUENCE";
    const successLabel =
      document.documentElement.lang === "en"
        ? "SEQUENCE COMPLETE"
        : "SEQUENCE REUSSIE";

    const clearStates = () => {
      grid.classList.remove("is-complete");
      replayButton.classList.remove("is-success");
      replayButton.textContent = replayLabel;
      replayButton.disabled = false;
      options.forEach((option) =>
        option.classList.remove("is-preview", "is-picked", "is-error"),
      );
    };

    const playSequence = () => {
      const token = ++playToken;
      input = [];
      showing = true;
      replayButton.textContent = replayLabel;
      replayButton.classList.remove("is-success");
      replayButton.disabled = true;
      clearStates();
      setStatus("Observe la séquence de couleurs...");
      sequence.forEach((color, index) => {
        window.setTimeout(() => {
          if (token !== playToken) return;
          options.forEach((item) => item.classList.remove("is-preview"));
          const option = grid.querySelector(`[data-color="${color}"]`);
          option.classList.add("is-preview");
          window.setTimeout(() => {
            if (token === playToken) option.classList.remove("is-preview");
          }, 500);
          if (index === sequence.length - 1) {
            window.setTimeout(() => {
              if (token !== playToken) return;
              showing = false;
              replayButton.disabled = false;
              setStatus("A toi. Reproduis la séquence de couleurs.");
            }, 450);
          }
        }, index * 900);
      });
    };

    registerStart(() => {
      replayButton.hidden = false;
      playSequence();
    });

    replayButton.addEventListener("click", () => {
      if (!started() || showing) return;
      sequence = generateSequence();
      playSequence();
    });

    options.forEach((option) => {
      option.addEventListener("click", () => {
        if (!started() || showing) return;
        const color = option.dataset.color;
        const expected = sequence[input.length];
        if (color !== expected) {
          input = [];
          options.forEach((item) => item.classList.remove("is-picked"));
          option.classList.add("is-error");
          setStatus(
            "Mauvaise couleur. Observe puis recommence la séquence.",
            "error",
          );
          return;
        }
        input.push(color);
        option.classList.add("is-picked");
        progress.textContent = `${input.length} / ${sequence.length}`;
        if (input.length === sequence.length) {
          grid.classList.add("is-complete");
          options.forEach((item, index) => {
            item.style.setProperty("--success-delay", `${index * 80}ms`);
          });
          replayButton.hidden = false;
          replayButton.disabled = true;
          replayButton.textContent = successLabel;
          replayButton.classList.add("is-success");
          finish();
          return;
        }
        setStatus(`Couleur ${input.length} / ${sequence.length} confirmée.`);
      });
    });
    replayButton.hidden = true;
    replayButton.textContent = replayLabel;
    progress.textContent = "0 / 5";
  });
}

// Shared ordered-button puzzle used by levels 12 and 14.
function installOrderedGridLevel(
  levelNumber,
  gridId,
  className,
  count,
  sequence,
) {
  installAdvancedLevel(levelNumber, ({ started, finish, setStatus }) => {
    const grid = document.getElementById(gridId);
    let step = 0;
    grid.innerHTML = Array.from(
      { length: count },
      (_, index) =>
        `<button class="future-puzzle-button ${className}-item tone-${(index % 5) + 1}" data-index="${index}" type="button" aria-label="Module ${index + 1}">${String(index + 1).padStart(2, "0")}</button>`,
    ).join("");
    const buttons = [...grid.querySelectorAll(".future-puzzle-button")];
    const progress = grid
      .closest(".puzzle-panel")
      .querySelector(".progress-readout");
    const resetStep = () => {
      step = 0;
      buttons.forEach((button) =>
        button.classList.remove("is-correct", "is-error"),
      );
    };
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        if (!started()) return;
        const index = Number(button.dataset.index);
        if (index !== sequence[step]) {
          resetStep();
          button.classList.add("is-error");
          setStatus("Mauvais module. La sequence recommence.", "error");
          return;
        }
        step += 1;
        button.classList.add("is-correct");
        progress.textContent = `${step} / ${sequence.length}`;
        if (step === sequence.length) {
          finish();
          return;
        }
        setStatus(`Module ${step} / ${sequence.length} confirme.`);
      });
    });
    progress.textContent = `0 / ${sequence.length}`;
  });
}

// Level 11 // Memory pairs: all cards must be matched by color/symbol.
if (document.querySelector(".pairs-board")) {
  installAdvancedLevel(11, ({ started, finish, setStatus, registerStart }) => {
    const grid = document.getElementById("resonancePairsGrid");
    const progress = grid
      .closest(".puzzle-panel")
      .querySelector(".progress-readout");
    const roundCardCounts = [6, 12, 20];
    const round = { index: 0, selected: [], found: 0, locked: false };
    const symbols = ["◇", "◈", "✦", "⬡", "✚", "✧", "✺", "★", "✥", "⬢"];
    const symbolTones = {
      "◇": "cyan",
      "◈": "violet",
      "✦": "pink",
      "⬡": "yellow",
      "✚": "green",
      "✧": "blue",
      "✺": "magenta",
      "★": "orange",
      "✥": "lime",
      "⬢": "white",
    };

    const createRound = (showFaces) => {
      const cardCount = roundCardCounts[round.index];
      const groupSize = 2;
      const groupCount = cardCount / groupSize;
      const cards = symbols
        .slice(0, groupCount)
        .flatMap((symbol) => Array.from({ length: groupSize }, () => symbol));
      cards.sort(() => Math.random() - 0.5);
      round.selected = [];
      round.found = 0;
      round.locked = false;
      grid.innerHTML = cards
        .map(
          (symbol, index) =>
            `<button class="resonance-card resonance-${symbolTones[symbol]}${showFaces ? " is-open" : ""}" style="--stack-index:${index}" data-symbol="${symbol}" type="button" aria-label="Carte ${index + 1}"><span>?</span><strong>${symbol}</strong></button>`,
        )
        .join("");
      grid.classList.remove("is-stacking", "is-shuffling", "is-dealing");
      grid.dataset.groupSize = String(groupSize);
      progress.textContent = `${round.index} / 3`;
      setStatus(
        `Manche ${round.index + 1} / 3 // ${cardCount} cartes // paires.`,
      );
      grid.querySelectorAll(".resonance-card").forEach((card) => {
        card.addEventListener("click", () => {
          if (
            !started() ||
            round.locked ||
            card.classList.contains("is-found") ||
            card.classList.contains("is-open")
          )
            return;
          card.classList.add("is-open");
          round.selected.push(card);
          if (round.selected.length < groupSize) return;
          round.locked = true;
          const selectedSymbols = round.selected.map(
            (item) => item.dataset.symbol,
          );
          if (selectedSymbols.every((value) => value === selectedSymbols[0])) {
            round.selected.forEach((item) => item.classList.add("is-found"));
            round.found += 1;
            round.selected = [];
            round.locked = false;
            setStatus(
              `Manche ${round.index + 1} / 3 // groupe trouvé : ${round.found} / ${groupCount}.`,
            );
            if (round.found === groupCount) {
              round.index += 1;
              progress.textContent = `${round.index} / 3`;
              if (round.index === roundCardCounts.length) {
                finish();
                return;
              }
              setStatus(
                `Manche ${round.index} / 3 réussie. Nouvelles cartes chargées.`,
                "success",
              );
              window.setTimeout(playShuffle, 650);
            }
            return;
          }
          setStatus(
            `Manche ${round.index + 1} / 3 // cartes différentes. Recommence.`,
            "error",
          );
          window.setTimeout(() => {
            round.selected.forEach((item) => item.classList.remove("is-open"));
            round.selected = [];
            round.locked = false;
          }, 650);
        });
      });
    };

    const playShuffle = () => {
      createRound(true);
      round.locked = true;
      setStatus(`Manche ${round.index + 1} / 3 // observation des cartes...`);
      window.setTimeout(() => {
        grid.classList.add("is-stacking");
        setStatus(
          `Manche ${round.index + 1} / 3 // rassemblement du paquet...`,
        );
      }, 1000);
      window.setTimeout(() => {
        grid.classList.add("is-shuffling");
        setStatus(`Manche ${round.index + 1} / 3 // mélange en cours...`);
      }, 1650);
      window.setTimeout(() => {
        grid.classList.remove("is-stacking", "is-shuffling");
        grid.classList.add("is-dealing");
        grid
          .querySelectorAll(".resonance-card")
          .forEach((card) => card.classList.remove("is-open"));
        setStatus(
          `Manche ${round.index + 1} / 3 // redistribution des cartes...`,
        );
      }, 2450);
      window.setTimeout(() => {
        grid.classList.remove("is-dealing");
        round.locked = false;
        setStatus(
          `Manche ${round.index + 1} / 3 // retourne deux cartes pour trouver une paire.`,
        );
      }, 3300);
    };

    registerStart(() => playShuffle());
    progress.textContent = "0 / 3";
    createRound(true);
  });
}
// Level 12 // Crossed light: activate the intersections in sequence.
if (document.querySelector(".cross-light-board")) {
  installOrderedGridLevel(
    12,
    "crossLightGrid",
    "cross-light",
    9,
    [0, 4, 8, 1, 5],
  );
}
// Level 14 // Combined protocol: reproduce the ordered mixed signal.
if (document.querySelector(".combined-sequence-board")) {
  installOrderedGridLevel(
    14,
    "combinedSequenceGrid",
    "combined-sequence",
    5,
    [0, 2, 4, 1, 3],
  );
}

// Level 12 // Ordering workshop: select six cards and deposit them in order.
if (document.querySelector(".ordering-board")) {
  installAdvancedLevel(12, ({ started, finish, setStatus, registerStart, registerReset }) => {
    const cardCount = 6;
    const grid = document.getElementById("orderingGrid");
    const ruleLabel = document.getElementById("orderingRule");
    const progress = grid
      .closest(".puzzle-panel")
      .querySelector(".progress-readout");
    const uniqueRandomValues = (count, minimum, maximum) => {
      const values = new Set();
      while (values.size < count) {
        values.add(
          Math.floor(Math.random() * (maximum - minimum + 1)) + minimum,
        );
      }
      return [...values];
    };
    const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);
    const makeNumericRound = (index) => {
      const descending = index % 2 === 1;
      return {
        rule: descending
          ? "Nombres : du plus grand au plus petit"
          : "Nombres : du plus petit au plus grand",
        items: uniqueRandomValues(cardCount, 1, 100),
        compare: descending
          ? (first, second) => second - first
          : (first, second) => first - second,
      };
    };
    const makeDateRound = (index) => {
      const descending = index % 2 === 1;
      return {
        rule: descending
          ? "Dates : de la plus récente à la plus ancienne"
          : "Dates : de la plus ancienne à la plus récente",
        items: uniqueRandomValues(cardCount, -1900, 2026),
        compare: descending
          ? (first, second) => second - first
          : (first, second) => first - second,
      };
    };
    const wordBank = [
      "NEON",
      "AUBE",
      "RIFT",
      "ECHO",
      "ORBIT",
      "FLUX",
      "SONDE",
      "DELTA",
      "COMETE",
      "NEXUS",
      "SIGNAL",
      "OMBRE",
      "ASTRE",
      "MIRAGE",
      "PULSAR",
      "QUASAR",
      "RELAIS",
      "VORTEX",
      "LUMEN",
      "PHASE",
      "PORTE",
      "COSMOS",
      "ECLAT",
      "ZENITH",
    ];
    const makeWordRound = (index) => {
      const descending = index % 2 === 1;
      const selectedWords = [];
      const usedInitials = new Set();
      for (const word of shuffle(wordBank)) {
        const initial = word.charAt(0).toLocaleUpperCase("fr-FR");
        if (usedInitials.has(initial)) continue;
        selectedWords.push(word);
        usedInitials.add(initial);
        if (selectedWords.length === cardCount) break;
      }
      return {
        rule: descending
          ? "Mots : ordre alphabétique inverse"
          : "Mots : ordre alphabétique",
        items: selectedWords,
        compare: descending
          ? (first, second) => second.localeCompare(first)
          : (first, second) => first.localeCompare(second),
      };
    };
    const roundFactories = [
      ...Array.from({ length: 12 }, (_, index) => () =>
        makeNumericRound(index),
      ),
      ...Array.from({ length: 10 }, (_, index) => () => makeDateRound(index)),
      ...Array.from({ length: 10 }, (_, index) => () => makeWordRound(index)),
    ];
    const rounds = shuffle(roundFactories)
      .slice(0, 4)
      .map((createRound) => createRound());
    let round = 0;
    let step = 0;
    let order = [];
    let selectedCard = null;

    const loadRound = () => {
      const current = rounds[round];
      const items = current.items;
      order = [...items].sort(current.compare);
      const isWordRound = current.rule.startsWith("Mots");
      step = 0;
      selectedCard = null;
      ruleLabel.innerHTML = `
        <span class="ordering-round">MANCHE ${round + 1} / 4</span>
        <strong class="ordering-rule-detail">${current.rule}</strong>
      `;
      progress.textContent = `${round} / 4`;
      const shuffledItems = [...items].sort(() => Math.random() - 0.5);
      grid.innerHTML = `
        <div class="ordering-card-tray" aria-label="Cartes disponibles">
          ${shuffledItems
            .map(
              (item) =>
                `<button class="ordering-card${isWordRound ? " ordering-word-card" : ""}" data-value="${String(item)}" type="button" ${isWordRound ? 'style="font-size: 0.72rem; font-weight: 800;"' : ""}><span>${String(item)}</span></button>`,
            )
            .join("")}
        </div>
        <div class="ordering-slot-tray" aria-label="Emplacements de dépôt">
          ${items
            .map(
              (_, index) =>
                `<button class="ordering-slot" data-slot="${index}" type="button" aria-label="Emplacement ${index + 1}"></button>`,
            )
            .join("")}
          <div class="ordering-slot-hint">
            Cases noires : dépose ou remplace une carte ici
          </div>
        </div>`;

      const cards = [...grid.querySelectorAll(".ordering-card")];
      const slots = [...grid.querySelectorAll(".ordering-slot")];
      const cardTray = grid.querySelector(".ordering-card-tray");
      cards.forEach((card, index) => {
        card.dataset.startIndex = String(index);
      });
      const returnCardToTray = (value) => {
        const card = cards.find((item) => item.dataset.value === value);
        if (!card) return;
        card.classList.remove("is-placed", "is-selected");
        card.disabled = false;
        cardTray.appendChild(card);
        [...cardTray.querySelectorAll(".ordering-card")]
          .sort(
            (first, second) =>
              Number(first.dataset.startIndex) -
              Number(second.dataset.startIndex),
          )
          .forEach((item) => cardTray.appendChild(item));
      };
      const removeCardFromSlot = (value) => {
        const sourceSlot = slots.find((item) => item.dataset.value === value);
        if (!sourceSlot) return;
        sourceSlot.replaceChildren();
        sourceSlot.classList.remove("is-filled", "is-correct", "is-error");
        delete sourceSlot.dataset.value;
      };
      const selectPlacedCard = (placedCard) => {
        if (!started()) return;
        const value = placedCard.textContent;
        const card = cards.find((item) => item.dataset.value === value);
        if (!card) return;
        removeCardFromSlot(value);
        card.classList.remove("is-placed");
        card.disabled = false;
        cards.forEach((item) => item.classList.remove("is-selected"));
        slots.forEach((slot) => {
          if (!slot.classList.contains("is-filled")) {
            slot.classList.add("is-selectable");
          }
        });
        selectedCard = card;
        card.classList.add("is-selected");
        setStatus(
          `Carte ${value} sélectionnée. Choisis une autre case libre.`,
        );
      };
      cards.forEach((card) => {
        card.addEventListener("click", () => {
          if (!started() || card.classList.contains("is-placed")) return;
          cards.forEach((item) => item.classList.remove("is-selected"));
          slots.forEach((slot) => {
            if (!slot.classList.contains("is-filled")) {
              slot.classList.add("is-selectable");
            }
          });
          selectedCard = card;
          card.classList.add("is-selected");
          setStatus(
            `Carte ${card.dataset.value} sélectionnée. Choisis n'importe quelle case libre.`,
          );
        });
      });
      slots.forEach((slot) => {
        slot.addEventListener("click", () => {
          if (!started()) return;
          if (!selectedCard) {
            setStatus(
              slot.classList.contains("is-filled")
                ? "Sélectionne une autre carte pour remplacer celle-ci."
                : "Sélectionne d'abord une carte en haut.",
              "error",
            );
            return;
          }
          const previousCard = slot.dataset.value;
          if (previousCard) returnCardToTray(previousCard);
          const placedCard = document.createElement("span");
          placedCard.className = `ordering-placed-card${isWordRound ? " ordering-word-card" : ""}`;
          if (isWordRound) {
            placedCard.style.fontSize = "0.72rem";
            placedCard.style.fontWeight = "800";
          }
          placedCard.textContent = selectedCard.dataset.value;
          placedCard.draggable = true;
          placedCard.tabIndex = 0;
          placedCard.setAttribute("role", "button");
          placedCard.setAttribute(
            "aria-label",
            `Déplacer la carte ${selectedCard.dataset.value}`,
          );
          placedCard.addEventListener("click", (event) => {
            event.stopPropagation();
            selectPlacedCard(placedCard);
          });
          placedCard.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              selectPlacedCard(placedCard);
            }
          });
          placedCard.addEventListener("dragstart", (event) => {
            selectPlacedCard(placedCard);
            event.dataTransfer.setData("text/plain", placedCard.textContent);
          });
          slot.replaceChildren(placedCard);
          slot.classList.remove("is-selectable");
          slot.classList.add("is-filled", "is-correct");
          slot.dataset.value = selectedCard.dataset.value;
          selectedCard.classList.remove("is-selected");
          selectedCard.classList.add("is-placed");
          selectedCard.disabled = true;
          selectedCard = null;
          slots.forEach((item) => item.classList.remove("is-selectable"));
          const filledCount = slots.filter((item) => item.dataset.value).length;
          progress.textContent = `${round} / 4`;
          setStatus(`Carte déposée : ${filledCount} / ${cardCount}. Remplis toutes les cases.`);
          if (filledCount === order.length) {
            const placedOrder = slots.map((item) => item.dataset.value);
            const isCorrect = placedOrder.every(
              (value, index) => value === String(order[index]),
            );
            if (!isCorrect) {
              slots.forEach((item) => item.classList.add("is-error"));
              cards.forEach((item) => item.classList.add("is-error"));
              resetButton.classList.add("reset-error");
              setStatus(
                "Ordre incorrect. Toutes les cases sont rouges : réinitialise pour recommencer.",
                "error",
              );
              return;
            }
            round += 1;
            progress.textContent = `${round} / 4`;
            if (round === rounds.length) {
              finish();
              return;
            }
            setStatus(
              `Manche ${round} / 4 réussie. Nouvelle règle chargée.`,
              "success",
            );
            window.setTimeout(loadRound, 650);
          }
        });
      });
    };
    registerStart(() =>
      setStatus(`Dépose les ${cardCount} cartes selon : ${rounds[round].rule}.`),
    );
    registerReset(() => {
      loadRound();
      setStatus(`La manche ${round + 1} / 4 recommence. Dépose les ${cardCount} cartes selon : ${rounds[round].rule}.`);
    });
    loadRound();
  });
}

// Level 13 // Fractal pattern: toggle the five target panels in a 3x3 grid.
if (document.querySelector(".fractal-board")) {
  installAdvancedLevel(13, ({ started, finish, setStatus, registerStart }) => {
    const grid = document.getElementById("fractalGrid");
    const target = new Set([0, 2, 4, 6, 8]);
    const active = new Set();
    grid.innerHTML = Array.from(
      { length: 9 },
      (_, index) =>
        `<button class="future-puzzle-button fractal-item tone-${(index % 5) + 1}" data-index="${index}" type="button" aria-label="Panneau ${index + 1}">${String(index + 1).padStart(2, "0")}</button>`,
    ).join("");
    const buttons = [...grid.querySelectorAll(".future-puzzle-button")];
    const progress = grid
      .closest(".puzzle-panel")
      .querySelector(".progress-readout");
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        if (!started()) return;
        const index = Number(button.dataset.index);
        if (!target.has(index)) {
          button.classList.add("is-error");
          setStatus("Ce panneau ne fait pas partie du motif cible.", "error");
          window.setTimeout(() => button.classList.remove("is-error"), 450);
          return;
        }
        if (active.has(index)) active.delete(index);
        else active.add(index);
        button.classList.toggle("is-correct", active.has(index));
        const correct = [...active].filter((value) => target.has(value)).length;
        progress.textContent = `${correct} / ${target.size}`;
        if (
          active.size === target.size &&
          [...active].every((value) => target.has(value))
        ) {
          finish();
          return;
        }
        setStatus(`${correct} / ${target.size} panneaux corrects.`);
      });
    });
    registerStart(() => setStatus("Active les panneaux 01, 03, 05, 07 et 09."));
    progress.textContent = "0 / 5";
  });
}

// ============================================================================
// NIVEAUX 6 A 15 // BLOCS RESERVES
// Ces sections documentent les prochains scripts de la dimension Initiation.
// Elles resteront activées lorsque les pages et les mécaniques seront créées.
// ============================================================================

// ===== NIVEAU 6 // OBSERVATION DES MOTIFS =====
// TODO: ajouter la recherche des trois symboles identiques dans le mur holographique.

// ===== NIVEAU 7 // PORTE LUMINEUSE =====
// TODO: ajouter la séquence d'activation de la porte holographique.

// ===== NIVEAU 11 // DOUBLE ALIGNEMENT =====
// TODO: ajouter l'alignement synchronise des deux lignes holographiques.

// ===== NIVEAU 12 // LUMIERE CROISEE =====
// TODO: ajouter l'activation des intersections lumineuses dans le bon ordre.

// ===== NIVEAU 13 // GLISSEMENT HOLOGRAPHIQUE =====
// TODO: ajouter la reconstruction du motif fractal en neuf panneaux.

// ===== NIVEAU 14 // SEQUENCE COMBINEE =====
// TODO: ajouter la combinaison des sequences lumineuse et sonore.

// ===== NIVEAU 15 // ACTIVATION DE TROIS POINTS =====
// TODO: ajouter l'activation logique des trois points d'energie.
