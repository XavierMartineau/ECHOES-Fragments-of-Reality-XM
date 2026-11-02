(() => {
  const board = document.querySelector(".boss-board");
  if (!board) return;

  const english = localStorage.getItem("echoes-language") === "en";
  const text = (fr, en) => (english ? en : fr);
  const symbols = ["◇", "✦", "⬡"];
  const pads = [
    { color: "#79f7ff", name: text("cyan", "cyan") },
    { color: "#c08aff", name: text("violet", "violet") },
    { color: "#80ffcf", name: text("vert", "green") },
    { color: "#ffbd69", name: text("ambre", "amber") },
  ];
  const melodyLength = 4;
  let melody = [];
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
    level: text("CLÉ 01 // SENTINELLE", "KEY 01 // SENTINEL"),
    eyebrow: text("ARCHIVE 01 // SCEAU FRAGMENTÉ", "ARCHIVE 01 // FRACTURED SEAL"),
    panelKicker: text("DUEL // NOYAU DE LA SENTINELLE", "DUEL // SENTINEL CORE"),
    title: text("La Sentinelle de la Clé", "The Key Sentinel"),
    description: text(
      "Le Gardien a fragmenté la Clé 01 en trois épreuves. Décode ses glyphes, mémorise sa séquence lumineuse et intercepte la pulsation au bon instant. Six charges te permettront de résister aux erreurs.",
      "The Guardian has split Key 01 into three trials. Decode its glyphs, memorize its light sequence, and intercept the pulse at the right moment. You have six charges to withstand mistakes.",
    ),
    arenaTitle: text("Chambre d’accordage", "Tuning chamber"),
    lives: text("ÉNERGIE", "ENERGY"),
    save: text("SAUVEGARDER", "SAVE"),
    reset: text("Reprendre depuis le début", "Restart the encounter"),
    start: text("DÉFIER LA SENTINELLE", "CHALLENGE THE SENTINEL"),
    next: text("RÉCUPÉRER LA CLÉ 01", "CLAIM KEY 01"),
    keyCode: text("CLÉ_01", "KEY_01"),
    keyNote: text("CLÉ 01 // À LIBÉRER", "KEY 01 // TO BE RELEASED"),
    keyOwned: text("CLÉ 01 // LIBÉRÉE", "KEY 01 // RELEASED"),
    footerState: text("ARCHIVE // INITIATION ACTIVE", "ARCHIVE // INITIATION ACTIVE"),
    ready: text(
      "La Sentinelle verrouille la Clé 01. Six charges disponibles : chaque erreur en consomme une.",
      "The Sentinel has sealed Key 01. Six charges remain; each mistake consumes one.",
    ),
    startHint: text(
      "Un glyphe sert de modèle. Sélectionne les trois correspondances dans l’ordre.",
      "A glyph is your reference. Select all three matches in order.",
    ),
    wrong: text(
      "Ce glyphe ne correspond pas au modèle. Une charge vient d’être perdue.",
      "That glyph does not match the reference. One charge has been lost.",
    ),
    stageOneWin: text(
      "Les trois glyphes sont reconnus. La Sentinelle transmet son code lumineux.",
      "All three glyphs are recognized. The Sentinel is transmitting its light code.",
    ),
    stageTwoHint: text(
      "Mémorise l’ordre des quatre éclats : la séquence ne sera jouée qu’une fois.",
      "Memorize the order of the four flashes: the sequence will play only once.",
    ),
    sequenceHint: text(
      "À toi de jouer : reproduis le code avec les quatre pastilles.",
      "Your turn: enter the code using the four pads.",
    ),
    sequenceError: text(
      "Mauvaise fréquence. La séquence repart du début; tu peux la revoir avant de retenter.",
      "Wrong frequency. The sequence has reset; replay it before trying again.",
    ),
    stageTwoWin: text(
      "Code lumineux déchiffré. Le noyau va émettre deux pulsations vertes : intercepte-les.",
      "Light code decoded. The core will emit two green pulses: intercept them.",
    ),
    stageThreeHint: text(
      "Dernière épreuve : intercepte deux pulsations vertes. Un clic anticipé coûte une charge.",
      "Final trial: intercept two green pulses. Clicking too early costs one charge.",
    ),
    wait: text(
      "Trop tôt : le noyau n’a pas encore envoyé sa pulsation.",
      "Too early: the core has not sent its pulse yet.",
    ),
    defeated: text(
      "Tes six charges sont épuisées. Recommence le combat pour tenter une nouvelle percée.",
      "All six charges are spent. Restart the encounter to make another attempt.",
    ),
    victory: text(
      "Le sceau est brisé. La Clé 01 vient d’être libérée.",
      "The seal is broken. Key 01 has been released.",
    ),
    rewardError: text(
      "La Clé 01 n’a pas pu être enregistrée. Vérifie ta sauvegarde puis réessaie.",
      "Key 01 could not be saved. Check your save and try again.",
    ),
    livesRemaining: (count) =>
      text(
        `${count} unités d’énergie restantes`,
        `${count} energy units remaining`,
      ),
    saveSuccess: text("Progression enregistrée.", "Progress saved."),
    saveFailure: text(
      "Connecte-toi pour enregistrer ta progression.",
      "Sign in to save your progress.",
    ),
    sealLabel: (number) => text(`Sceau ${number}`, `Seal ${number}`),
    stageOne: text("ÉPREUVE 1 // DÉCODAGE", "TRIAL 1 // DECODE"),
    stageOnePrompt: text("Choisis le glyphe affiché", "Select the displayed glyph"),
    stageTwo: text("ÉPREUVE 2 // MÉMOIRE", "TRIAL 2 // MEMORY"),
    stageTwoPrompt: text(
      "Rejoue l’ordre des éclats lumineux",
      "Repeat the order of the light flashes",
    ),
    padLabel: (name) => text(`Pastille ${name}`, `${name} pad`),
    stageThree: text("ÉPREUVE 3 // RÉFLEXES", "TRIAL 3 // REFLEXES"),
    stageThreePrompt: text(
      "Intercepte les deux pulsations vertes",
      "Intercept both green pulses",
    ),
    stageThreeWait: text("PULSATION EN ATTENTE", "PULSE PENDING"),
    stageStripLabel: text(
      "Progression des trois épreuves",
      "Progress through the three trials",
    ),
    choicesLabel: text("Choix de glyphes", "Glyph choices"),
    coreWaitAria: text(
      "Noyau en attente de sa prochaine pulsation",
      "Core waiting for its next pulse",
    ),
    coreLitAria: text(
      "Pulsation verte active, clique maintenant",
      "Green pulse active, click now",
    ),
    now: text("MAINTENANT !", "NOW!"),
    signalCaught: text(
      "Première pulsation interceptée. Garde le rythme pour la seconde.",
      "First pulse intercepted. Keep the rhythm for the second.",
    ),
    correctSeal: text(
      "Correspondance validée. Déchiffre le glyphe suivant.",
      "Match confirmed. Decode the next glyph.",
    ),
    resetHint: text(
      "La Sentinelle est de nouveau prête. La Clé reste scellée.",
      "The Sentinel is ready again. The key remains sealed.",
    ),
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
  document
    .querySelector(".boss01-stage-strip")
    ?.setAttribute("aria-label", copy.stageStripLabel);
  choices.setAttribute("aria-label", copy.choicesLabel);
  levels.setAttribute(
    "aria-label",
    text("Progression de la Partie 1", "Part 1 progress"),
  );

  const clearTimers = () => {
    sequenceTimers.forEach(window.clearTimeout);
    sequenceTimers = [];
    window.clearTimeout(pulseTimer);
    core.classList.remove("is-lit");
    core.setAttribute("aria-label", copy.coreWaitAria);
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
      text(
        `${energy} unités d’énergie restantes`,
        `${energy} energy units remaining`,
      ),
    );
  };

  const fragments = window.EchoesKeyFragments.mount({
    keyNumber: 1,
    src: "../../assets/svg/key-01-usb.svg",
    core,
    before: document.querySelector(".boss01-actions"),
  });

  const updateProgress = () => {
    fragments.set(won ? 3 : stage);
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

  const setPads = (onPad) => {
    choices.replaceChildren();
    pads.forEach((pad, index) => {
      const button = document.createElement("button");
      button.className = "boss01-choice boss01-pad";
      button.type = "button";
      button.style.setProperty("--pad", pad.color);
      button.setAttribute("aria-label", copy.padLabel(pad.name));
      button.dataset.pad = String(index);
      button.addEventListener("click", () => onPad(index, button));
      choices.appendChild(button);
    });
  };

  const setChoicesEnabled = (enabled) => {
    choices.querySelectorAll("button").forEach((button) => {
      button.disabled = !enabled;
    });
  };

  const flashPad = (index, duration = 420) => {
    const button = choices.querySelector(`[data-pad="${index}"]`);
    if (!button) return;
    button.classList.add("is-flash");
    window.setTimeout(() => button.classList.remove("is-flash"), duration);
  };

  const loseEnergy = () => {
    energy = Math.max(0, energy - 1);
    updateLives();
    if (energy > 0) return false;
    active = false;
    clearTimers();
    replayButton.hidden = true;
    startButton.hidden = true;
    choices.hidden = true;
    setStatus(copy.defeated, "error");
    return true;
  };

  const enterStage = (index) => {
    clearTimers();
    target.style.color = "";
    stage = index;
    stageStep = 0;
    core.disabled = stage !== 2;
    choices.hidden = !active;
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
          setChoicesEnabled(false);
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
      melody = [];
      while (melody.length < melodyLength) {
        const next = Math.floor(Math.random() * pads.length);
        if (next !== melody[melody.length - 1]) melody.push(next);
      }
      setPads((index, button) => {
        if (!active || inputLocked) return;
        flashPad(index, 260);
        if (index !== melody[stageStep]) {
          button.classList.add("is-wrong");
          window.setTimeout(() => button.classList.remove("is-wrong"), 420);
          if (loseEnergy()) return;
          stageStep = 0;
          target.textContent = "· · ·";
          target.style.color = "";
          setStatus(copy.sequenceError, "error");
          return;
        }
        stageStep += 1;
        target.textContent = "●".repeat(stageStep);
        target.style.color = pads[index].color;
        if (stageStep === melody.length) {
          inputLocked = true;
          setChoicesEnabled(false);
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
    setChoicesEnabled(false);
    target.textContent = "· · ·";
    target.style.color = "";
    choices.querySelectorAll(".boss01-choice").forEach((button) => {
      button.classList.remove("is-correct", "is-wrong", "is-flash");
    });
    replayButton.disabled = true;
    melody.forEach((padIndex, index) => {
      sequenceTimers.push(
        window.setTimeout(
          () => {
            flashPad(padIndex, 520);
            target.textContent = "●";
            target.style.color = pads[padIndex].color;
            target.classList.add("is-preview");
            sequenceTimers.push(
              window.setTimeout(() => {
                target.classList.remove("is-preview");
                target.textContent = "· · ·";
                target.style.color = "";
              }, 520),
            );
          },
          800 * index + 450,
        ),
      );
    });
    sequenceTimers.push(
      window.setTimeout(
        () => {
          if (!active || stage !== 1) return;
          target.textContent = "· · ·";
          target.style.color = "";
          inputLocked = false;
          setChoicesEnabled(true);
          replayButton.disabled = false;
          setStatus(copy.sequenceHint);
        },
        800 * melody.length + 500,
      ),
    );
  }

  function schedulePulse() {
    if (!active || stage !== 2) return;
    pulseTimer = window.setTimeout(() => {
      if (!active || stage !== 2) return;
      core.classList.add("is-lit");
      target.textContent = copy.now;
      core.setAttribute("aria-label", copy.coreLitAria);
      pulseTimer = window.setTimeout(() => {
        core.classList.remove("is-lit");
        core.setAttribute("aria-label", copy.coreWaitAria);
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
    choices.hidden = true;
    nextButton.hidden = true;
    updateLives();
    updateProgress();
    enterStage(0);
    setStatus(copy.ready);
  };

  core.addEventListener("click", () => {
    if (!active || stage !== 2) return;
    if (!core.classList.contains("is-lit")) {
      if (!loseEnergy())
        setStatus(
          copy.wait,
          "error",
        );
      return;
    }
    clearTimers();
    stageStep += 1;
    target.textContent = `${stageStep} / 2`;
    if (stageStep === 2) {
      active = false;
      won = true;
      choices.hidden = true;
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
    setStatus(
      saved ? copy.saveSuccess : copy.saveFailure,
      saved ? "success" : "error",
    );
  });

  startButton.addEventListener("click", () => {
    active = true;
    startButton.disabled = true;
    startButton.hidden = true;
    choices.hidden = false;
    setStatus(copy.startHint);
    enterStage(0);
  });
  resetButton.addEventListener("click", resetFight);
  nextButton.addEventListener("click", () => {
    window.location.href =
      "../partie-2_niveau-11_à_20/partie-2_niveau-1.html";
  });
  finishBoss = () => {
    nextButton.hidden = true;
    startButton.disabled = true;
    playPuzzleSuccessAnimation();
    window.setTimeout(() => {
      window.EchoesKeyFragments.playCinematic({
        keyNumber: 1,
        src: "../../assets/svg/key-01-usb.svg",
        onComplete: () => {
          if (!window.EchoesSave?.unlockKey?.("resonance-1")) {
            setStatus(copy.rewardError, "error");
            return;
          }
          nextButton.hidden = false;
        },
        onContinue: () => nextButton.click(),
      });
    }, 1400);
    const accountId = window.EchoesSave?.getCurrentUser?.();
    if (!accountId) return;
    const progressKey = `echoes-completed-levels-${encodeURIComponent(accountId)}`;
    const completed = new Set([
      ...readCompletedLevels("echoes-completed-levels"),
      ...readCompletedLevels(progressKey),
    ]);
    const completedLevels = [...completed].sort((a, b) => a - b);
    if (!window.EchoesSave?.isDevMode?.()) {
      localStorage.setItem(progressKey, JSON.stringify(completedLevels));
    }
    window.EchoesSave?.saveProgress({
      currentPage: "level-11",
      currentLevel: 11,
      completedLevels,
    });
  };

  const showKeyOwned = () => {
    const hud = document.getElementById("keyHud");
    if (!hud || !window.EchoesSave?.getKeys?.().includes("resonance-1")) return;
    hud.classList.add("is-unlocked");
    document.getElementById("keyHudNote").textContent = copy.keyOwned;
    const slot = document.getElementById("keyHudSlot");
    slot.removeAttribute("aria-hidden");
    slot.classList.add("is-visible");
  };

  showKeyOwned();
  updateLives();
  updateProgress();
  enterStage(0);
  setStatus(copy.ready);
})();
