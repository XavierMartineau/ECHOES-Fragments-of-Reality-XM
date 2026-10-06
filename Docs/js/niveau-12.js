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
