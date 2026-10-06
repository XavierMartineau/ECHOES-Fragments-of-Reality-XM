(() => {
  const board = document.querySelector(".boss-board");
  if (!board) return;

  const english = localStorage.getItem("echoes-language") === "en";
  const text = (fr, en) => english ? en : fr;
  const symbols = ["◇", "✦", "⬡"];
  const levels = document.getElementById("levelProgress");
  const panel = document.querySelector(".boss01-panel");
  const progress = document.getElementById("progressReadout");
  const livesReadout = document.getElementById("bossLives");
  const stageLabel = document.getElementById("bossStageLabel");
  const prompt = document.getElementById("bossPrompt");
  const target = document.getElementById("bossTarget");
  const choices = document.getElementById("bossChoices");
  const core = document.getElementById("bossCore");
  const replayButton = document.getElementById("replayButton");
  const startButton = document.getElementById("startPuzzleButton");
  const resetButton = document.getElementById("resetButton");
  const nextButton = document.getElementById("nextLevelButton");
  const status = document.getElementById("puzzleStatus");
  const saveButton = document.getElementById("saveGameButton");
  const stageDots = [...document.querySelectorAll("[data-stage-dot]")];

  const copy = {
    part: text("PARTIE 1 // INITIATION", "PART 1 // INITIATION"),
    level: text("CLEE_01 // GARDIEN", "CLEE_01 // GUARDIAN"),
    title: text("Le Gardien du Signal", "The Signal Guardian"),
    description: text(
      "Trois petits défis pour accorder le signal : repère les sceaux, répète une courte mélodie, puis touche le noyau quand il s’illumine. Difficulté 1/6.",
      "Three quick challenges to tune the signal: match the seals, repeat a short melody, then tap the core when it lights up. Difficulty 1/6.",
    ),
    arenaTitle: text("Le cœur du signal", "The heart of the signal"),
    lives: text("ÉNERGIE", "ENERGY"),
    save: text("SAUVEGARDER", "SAVE"),
    reset: text("Recommencer", "Reset"),
    start: text("DÉMARRER L’ÉPREUVE", "START THE TRIAL"),
    next: text("RÉCUPÉRER LA CLÉ 01", "CLAIM KEY 01"),
    ready: text(
      "Trois défis courts. Une erreur coûte une unité d’énergie; tu en as six.",
      "Three short challenges. Each mistake costs one energy unit; you have six.",
    ),
    startHint: text(
      "Observe les trois sceaux, puis choisis celui qui correspond.",
      "Watch the three seals, then choose the matching one.",
    ),
    wrong: text("Ce n’est pas le bon sceau. Réessaie.", "That is not the matching seal. Try again."),
    stageOneWin: text(
      "Bien joué. Le Gardien envoie une courte mélodie.",
      "Good job. The Guardian sends a short melody.",
    ),
    stageTwoHint: text(
      "Mémorise les trois symboles, puis répète-les dans le même ordre.",
      "Remember the three symbols, then repeat them in the same order.",
    ),
    sequenceHint: text("À toi : reproduis la mélodie.", "Your turn: repeat the melody."),
    sequenceError: text(
      "La mélodie recommence. Tu peux la revoir quand tu veux.",
      "The melody starts over. You can replay it whenever you like.",
    ),
    stageTwoWin: text(
      "Mélodie accordée. Touche le noyau quand il s’illumine en vert.",
      "Melody tuned. Tap the core when it glows green.",
    ),
    stageThreeHint: text(
      "Attends le halo vert, puis clique le noyau. Réussis deux fois.",
      "Wait for the green glow, then click the core. Do it twice.",
    ),
    wait: text("Attends que le noyau s’illumine en vert.", "Wait for the core to glow green."),
    defeated: text(
      "Ton énergie est épuisée. Clique sur Réinitialiser pour retenter l’épreuve.",
      "You ran out of energy. Click Reset to try the trial again.",
    ),
    victory: text("Le Gardien est apaisé. La Clé 01 t’attend.", "The Guardian is calm. Key 01 awaits."),
    livesRemaining: (count) => text(`${count} unités d’énergie restantes`, `${count} energy units remaining`),
    saveSuccess: text("Progression enregistrée.", "Progress saved."),
    saveFailure: text("Connecte-toi pour enregistrer ta progression.", "Sign in to save your progress."),
    sealLabel: (number) => text(`Sceau ${number}`, `Seal ${number}`),
    stageOne: text("STAGE 1 // LES SCEAUX", "STAGE 1 // THE SEALS"),
    stageOnePrompt: text("Trouve le même sceau", "Find the matching seal"),
    stageTwo: text("STAGE 2 // LA MÉLODIE", "STAGE 2 // THE MELODY"),
    stageTwoPrompt: text("Observe, puis répète", "Watch, then repeat"),
    stageThree: text("STAGE 3 // LE NOYAU", "STAGE 3 // THE CORE"),
    stageThreePrompt: text("Clique quand le noyau est vert", "Click when the core turns green"),
    stageThreeWait: text("ATTENDS LE SIGNAL", "WAIT FOR THE SIGNAL"),
    now: text("MAINTENANT !", "NOW!"),
    signalCaught: text("Signal capté. Encore une fois !", "Signal caught. One more time!"),
    correctSeal: text("Sceau accordé. Voici le suivant.", "Seal tuned. Here is the next one."),
    resetHint: text("Le combat reprend. Observe les trois sceaux.", "The fight resumes. Watch the three seals."),
  };

  let stage = 0;
  let stageStep = 0;
  let energy = 6;
  let active = false;
  let won = false;
  let inputLocked = false;
  let sequenceTimers = [];
  let pulseTimer = 0;
  let finishBoss = () => {};

  document.querySelectorAll("[data-boss-copy]").forEach((element) => {
    const key = element.dataset.bossCopy;
    if (copy[key]) element.textContent = copy[key];
  });

  for (let level = 1; level <= 10; level += 1) {
    const marker = document.createElement("span");
    marker.className = `level-square${level === 10 ? " completed" : ""}`;
    marker.setAttribute("aria-hidden", "true");
    levels.appendChild(marker);
  }
  levels.setAttribute("aria-label", text("Progression de la Partie 1", "Part 1 progress"));

  const clearTimers = () => {
    sequenceTimers.forEach(window.clearTimeout);
    sequenceTimers = [];
    window.clearTimeout(pulseTimer);
    core.classList.remove("is-lit");
    core.setAttribute("aria-label", text(
      "Noyau du gardien, attends le signal vert",
      "Guardian core, wait for the green signal",
    ));
    inputLocked = false;
  };

  const setStatus = (message, variant = "") => {
    status.textContent = message;
    status.className = `puzzle-status boss01-status${variant ? ` ${variant}` : ""}`;
  };

  const updateLives = () => {
    livesReadout.replaceChildren();
    for (let index = 0; index < 6; index += 1) {
      const heart = document.createElement("span");
      heart.className = `boss01-heart${index >= energy ? " is-lost" : ""}`;
      heart.setAttribute("aria-hidden", "true");
      livesReadout.appendChild(heart);
    }
    livesReadout.setAttribute(
      "aria-label",
      text(`${energy} unités d’énergie restantes`, `${energy} energy units remaining`),
    );
  };

  const updateProgress = () => {
    progress.textContent = `${won ? 3 : stage} / 3`;
    stageDots.forEach((dot, index) => {
      dot.classList.toggle("is-current", !won && index === stage);
      dot.classList.toggle("is-complete", won || index < stage);
    });
  };

  const setChoices = (onChoice) => {
    choices.replaceChildren();
    symbols.forEach((symbol, index) => {
      const button = document.createElement("button");
      button.className = "boss01-choice";
      button.type = "button";
      button.textContent = symbol;
      button.setAttribute("aria-label", copy.sealLabel(index + 1));
      button.addEventListener("click", () => onChoice(symbol, button));
      choices.appendChild(button);
    });
  };

  const loseEnergy = () => {
    energy = Math.max(0, energy - 1);
    updateLives();
    if (energy > 0) return false;
    active = false;
    clearTimers();
    replayButton.hidden = true;
    startButton.hidden = true;
    setStatus(copy.defeated, "error");
    return true;
  };

  const enterStage = (index) => {
    clearTimers();
    stage = index;
    stageStep = 0;
    updateProgress();
    if (stage === 0) {
      stageLabel.textContent = copy.stageOne;
      prompt.textContent = copy.stageOnePrompt;
      target.classList.remove("is-preview");
      replayButton.hidden = true;
      target.textContent = symbols[stageStep];
      setChoices((symbol, button) => {
        if (!active || inputLocked) return;
        if (symbol !== symbols[stageStep]) {
          button.classList.add("is-wrong");
          if (!loseEnergy()) setStatus(copy.wrong, "error");
          return;
        }
        button.classList.add("is-correct");
        stageStep += 1;
        if (stageStep === symbols.length) {
          inputLocked = true;
          setStatus(copy.stageOneWin, "success");
          window.setTimeout(() => enterStage(1), 650);
          return;
        }
        target.textContent = symbols[stageStep];
        setStatus(copy.correctSeal, "success");
      });
      setStatus(copy.startHint);
      return;
    }

    if (stage === 1) {
      stageLabel.textContent = copy.stageTwo;
      prompt.textContent = copy.stageTwoPrompt;
      target.classList.remove("is-preview");
      target.textContent = "· · ·";
      replayButton.hidden = false;
      setChoices((symbol, button) => {
        if (!active || inputLocked) return;
        if (symbol !== symbols[stageStep]) {
          button.classList.add("is-wrong");
          if (loseEnergy()) return;
          stageStep = 0;
          setStatus(copy.sequenceError, "error");
          return;
        }
        button.classList.add("is-correct");
        stageStep += 1;
        if (stageStep === symbols.length) {
          inputLocked = true;
          setStatus(copy.stageTwoWin, "success");
          window.setTimeout(() => enterStage(2), 650);
        }
      });
      setStatus(copy.stageTwoHint);
      playSequence();
      return;
    }

    stageLabel.textContent = copy.stageThree;
    prompt.textContent = copy.stageThreePrompt;
    target.textContent = copy.stageThreeWait;
    choices.replaceChildren();
    replayButton.hidden = true;
    setStatus(copy.stageThreeHint);
    schedulePulse();
  };

  function playSequence() {
    if (!active || stage !== 1) return;
    clearTimers();
    stageStep = 0;
    inputLocked = true;
    target.textContent = "· · ·";
    choices.querySelectorAll(".boss01-choice").forEach((button) => {
      button.classList.remove("is-correct", "is-wrong");
    });
    replayButton.disabled = true;
    symbols.forEach((symbol, index) => {
      sequenceTimers.push(window.setTimeout(() => {
        target.textContent = symbol;
        target.classList.add("is-preview");
        sequenceTimers.push(window.setTimeout(() => target.classList.remove("is-preview"), 430));
      }, 720 * index + 450));
    });
    sequenceTimers.push(window.setTimeout(() => {
      if (!active || stage !== 1) return;
      target.textContent = "· · ·";
      inputLocked = false;
      replayButton.disabled = false;
      setStatus(copy.sequenceHint);
    }, 720 * symbols.length + 500));
  }

  function schedulePulse() {
    if (!active || stage !== 2) return;
    pulseTimer = window.setTimeout(() => {
      if (!active || stage !== 2) return;
      core.classList.add("is-lit");
      target.textContent = copy.now;
      core.setAttribute("aria-label", text(
        "Noyau illuminé en vert, clique maintenant",
        "Core glowing green, click now",
      ));
      pulseTimer = window.setTimeout(() => {
        core.classList.remove("is-lit");
        core.setAttribute("aria-label", text(
          "Noyau du gardien, attends le signal vert",
          "Guardian core, wait for the green signal",
        ));
        target.textContent = copy.stageThreeWait;
        schedulePulse();
      }, 1200);
    }, 900);
  }

  const resetFight = () => {
    if (won) return;
    clearTimers();
    active = false;
    stage = 0;
    stageStep = 0;
    energy = 6;
    inputLocked = false;
    panel.classList.remove("is-victory");
    startButton.hidden = false;
    startButton.disabled = false;
    replayButton.hidden = true;
    replayButton.disabled = false;
    nextButton.hidden = true;
    updateLives();
    updateProgress();
    enterStage(0);
    setStatus(copy.ready);
  };

  core.addEventListener("click", () => {
    if (!active || stage !== 2) return;
    if (!core.classList.contains("is-lit")) {
      if (!loseEnergy()) setStatus(text("Attends le halo vert.", "Wait for the green glow."), "error");
      return;
    }
    clearTimers();
    stageStep += 1;
    target.textContent = `${stageStep} / 2`;
    if (stageStep === 2) {
      active = false;
      won = true;
      panel.classList.add("is-victory");
      updateProgress();
      setStatus(copy.victory, "success");
      finishBoss();
      return;
    }
    setStatus(copy.signalCaught, "success");
    schedulePulse();
  });

  replayButton.addEventListener("click", playSequence);
  saveButton.addEventListener("click", () => {
    const saved = window.EchoesSave?.saveProgress({
      currentPage: "boss-01",
      currentLevel: 11,
    });
    setStatus(saved ? copy.saveSuccess : copy.saveFailure, saved ? "success" : "error");
  });

  startButton.addEventListener("click", () => {
    active = true;
    startButton.disabled = true;
    startButton.hidden = true;
    setStatus(copy.startHint);
    enterStage(0);
  });
  resetButton.addEventListener("click", resetFight);
  nextButton.addEventListener("click", () => {
    window.location.href = "clee_01_cinematic.html";
  });
  finishBoss = () => {
    nextButton.hidden = false;
    startButton.disabled = true;
    playPuzzleSuccessAnimation();
    nextButton.focus();
    const accountId = window.EchoesSave?.getCurrentUser?.();
    if (!accountId) return;
    const progressKey = `echoes-completed-levels-${encodeURIComponent(accountId)}`;
    const completed = new Set([
      ...readCompletedLevels("echoes-completed-levels"),
      ...readCompletedLevels(progressKey),
      11,
    ]);
    const completedLevels = [...completed].sort((a, b) => a - b);
    localStorage.setItem(progressKey, JSON.stringify(completedLevels));
    window.EchoesSave?.saveProgress({
      currentPage: "level-11",
      currentLevel: 11,
      completedLevels,
    });
  };

  updateLives();
  updateProgress();
  enterStage(0);
  setStatus(copy.ready);
})();
