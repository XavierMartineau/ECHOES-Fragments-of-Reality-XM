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
