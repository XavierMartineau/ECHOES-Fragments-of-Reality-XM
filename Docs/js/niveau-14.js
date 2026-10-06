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
