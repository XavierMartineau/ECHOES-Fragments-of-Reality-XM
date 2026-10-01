const levelScriptByMarker = [
  [".light-sequence", 2],
  [".sort-board", 3],
  [".rotation-board", 4],
  [".sound-board", 5],
  [".pattern-board", 6],
  [".gate-board", 7],
  [".advanced-sort-board", 8],
  [".mirror-board", 9],
  [".illusion-board", 10],
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
const activeLevelScript = levelScriptByMarker.find(([marker]) =>
  document.querySelector(marker),
);

if (activeLevelScript) {
  const language =
    localStorage.getItem("echoes-language") === "en" ? "en" : "fr";
  const progressStorageKey = "echoes-completed-levels";
  const completedLevels = new Set(
    JSON.parse(localStorage.getItem(progressStorageKey) || "[]"),
  );
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
  };
  installBackButton();
  applyCopy();
  renderProgress();

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
      system.textContent = levelCopy.systemSuccess;
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
      solved = true;
      started = true;
      board.classList.add("solved");
      lights.forEach((_, index) => state(index, "correct"));
      transmission.classList.add("success");
      status.textContent = levelCopy.statusSuccess;
      status.className = "puzzle-status success";
      system.textContent = levelCopy.systemSuccess;
      start.disabled = false;
      next.hidden = false;
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
        system.textContent = levelCopy.systemSuccess;
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
      board.classList.add("solved");
      transmission.classList.add("success");
      status.textContent = levelCopy.statusSuccess;
      status.className = "puzzle-status success";
      system.textContent = levelCopy.systemSuccess;
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
          system.textContent = levelCopy.systemSuccess;
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
      solved = true;
      started = true;
      board.classList.add("solved");
      transmission.classList.add("success");
      status.textContent = levelCopy.statusSuccess;
      status.className = "puzzle-status success";
      system.textContent = levelCopy.systemSuccess;
      start.disabled = false;
      rotate.disabled = true;
      next.hidden = false;
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
      system.textContent = levelCopy.systemSuccess;
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
      solved = true;
      started = true;
      board.classList.add("solved");
      notes.forEach((note) => note.classList.add("is-correct"));
      transmission.classList.add("success");
      status.textContent = levelCopy.statusSuccess;
      status.className = "puzzle-status success";
      system.textContent = levelCopy.systemSuccess;
      start.disabled = false;
      next.hidden = false;
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
              system.textContent = levelCopy.systemSuccess;
              saveCompletion();
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
  const currentLevel = 1;
  const progressStorageKey = "echoes-completed-levels";
  const completedLevels = new Set(
    JSON.parse(localStorage.getItem(progressStorageKey) || "[]"),
  );
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
    renderProgress();
  }

  function updateProgress() {
    const placedCount = placedShapes.filter(Boolean).length;
    progressReadout.textContent = `${placedCount} / ${solution.length}`;
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
      markCurrentLevelCompleted();
      typeSystemMessage(systemMessages.success, () => {
        window.setTimeout(() => {
          nextLevelButton.hidden = false;
          nextLevelButton.focus();
        }, 450);
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
    systemMessage.textContent = systemMessages.input;
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

  nextLevelButton.addEventListener("click", () => {
    window.EchoesSave.saveProgress({
      currentPage: "level-2",
      currentLevel: 2,
      completedLevels: [...completedLevels].sort((a, b) => a - b),
    });
    window.location.href = "niveau-02.html";
  });
  startPuzzleButton.textContent = levelCopy.startPuzzle;
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
    board.classList.add("solved");
    slots.forEach((slot) => slot.classList.add("correct"));
    systemTransmission.classList.add("success");
    status.textContent = levelCopy.statusSuccess;
    status.className = "puzzle-status success";
    systemMessage.textContent = systemMessages.success;
    startPuzzleButton.disabled = false;
    nextLevelButton.hidden = false;
  }
  shufflePieces();
  if (!completedLevels.has(1)) systemMessage.textContent = systemMessages.input;
  updateProgress();
  renderProgress();
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

// ===== NIVEAU 8 // TRI DES SYMBOLES =====
// TODO: ajouter le tri des symboles par forme et par couleur.

// ===== NIVEAU 9 // MIROIRS SIMPLES =====
// TODO: ajouter la rotation des miroirs et le guidage du rayon lumineux.

// ===== NIVEAU 10 // PREMIERE ILLUSION =====
// TODO: ajouter l'identification du véritable hologramme.

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
