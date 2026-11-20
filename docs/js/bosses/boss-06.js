(() => {
  const panel = document.querySelector(".boss06-panel");
  if (!panel) return;

  const english = localStorage.getItem("echoes-language") === "en";
  const keyId = "resonance-6";
  const nextUrl = document.body.dataset.nextUrl;
  const phases = [
    { fluxGoal: 9, heatLimit: 10, startHeat: 2, turns: 5, pulses: [1, 1, 2, 1, 2] },
    { fluxGoal: 12, heatLimit: 12, startHeat: 3, turns: 6, pulses: [1, 2, 1, 3, 2, 1] },
    { fluxGoal: 15, heatLimit: 14, startHeat: 3, turns: 7, pulses: [2, 3, 1, 3, 2, 3, 1] },
  ];
  const copy = english
    ? {
        start: "ENTER THE FIGHT",
        next: "ENTER THE MEMORY FORGE",
        reset: "RESTART FIGHT",
        title: "The Core Regulator",
        kicker: "BOSS // OVERLOAD PROTOCOL",
        description: "Charge the flux, control the heat, and block the Regulator's pulses. Three phases demand precise resource management.",
        arena: "Stabilize the core",
        helpTitle: "FIGHT PROTOCOL",
        help: "<li><strong>Overcharge:</strong> +3 flux, +2 heat. Ground: +1 flux, -3 heat.</li><li><strong>Shield:</strong> +1 flux, -1 heat, and cancels the telegraphed pulse this turn.</li><li>Choose one command per turn. The shown pulse adds heat after your command unless you shield.</li><li>Reach the flux goal within the turn limit without exceeding the heat cap. A failure costs one integrity and restarts the phase.</li>",
        phase: (n) => `REACTOR PHASE ${n} / 3`,
        action: (n, limit) => `ACTION ${n} / ${limit}`,
        pulse: (n) => `+${n} HEAT`,
        flux: "FLUX",
        heat: "HEAT",
        pulseLabel: "NEXT PULSE",
        overcharge: "OVERCHARGE",
        overchargeDetail: "+3 FLUX // +2 HEAT",
        ground: "GROUND",
        groundDetail: "+1 FLUX // -3 HEAT",
        shield: "SHIELD",
        shieldDetail: "+1 FLUX // BLOCK PULSE",
        integrity: (n) => `${n} integrity remaining`,
        objective: (goal, cap) => `FLUX ${goal} REQUIRED // HEAT MUST STAY AT OR BELOW ${cap}`,
        status: "Read the announced pulse, then choose a command to balance flux and heat.",
        actionResult: (flux, heat, pulse) => `Command resolved. Flux ${flux}; heat ${heat}${pulse ? `; incoming pulse +${pulse}` : "; pulse blocked"}.`,
        phaseClear: "Core stabilized. The Regulator is escalating its next phase.",
        failure: "Reactor destabilized. One integrity lost; this phase restarts.",
        lost: "The core went critical. Restart the fight to challenge the Regulator again.",
        victory: "The Core Regulator is defeated. Resonance key 06 is yours.",
        rewardError: "Key 06 could not be saved. Check your save and retry.",
        recovered: "KEY 06 // RECOVERED",
        toRecover: "KEY 06 // TO RECOVER",
      }
    : {
        start: "ENTRER DANS LE COMBAT",
        next: "ENTRER DANS LA FORGE MÉMOIRE",
        reset: "RECOMMENCER LE COMBAT",
        title: "Le Régulateur du noyau",
        kicker: "BOSS // PROTOCOLE DE SURCHARGE",
        description: "Charge le flux, maîtrise la chaleur et bloque les impulsions du Régulateur. Trois phases exigent une gestion précise des ressources.",
        arena: "Stabiliser le noyau",
        helpTitle: "PROTOCOLE DE COMBAT",
        help: "<li><strong>Surcharge :</strong> +3 flux, +2 chaleur. Mise à la terre : +1 flux, -3 chaleur.</li><li><strong>Blindage :</strong> +1 flux, -1 chaleur et annule l'impulsion annoncée ce tour.</li><li>Choisis un ordre par tour. L'impulsion indiquée s'ajoute à la chaleur après l'ordre, sauf si tu blindes.</li><li>Atteins l'objectif de flux avant la limite de tours sans dépasser la limite de chaleur. Un échec coûte une intégrité et relance la phase.</li>",
        phase: (n) => `PHASE DU RÉACTEUR ${n} / 3`,
        action: (n, limit) => `ACTION ${n} / ${limit}`,
        pulse: (n) => `+${n} CHALEUR`,
        flux: "FLUX",
        heat: "CHALEUR",
        pulseLabel: "IMPULSION SUIVANTE",
        overcharge: "SURCHARGE",
        overchargeDetail: "+3 FLUX // +2 CHALEUR",
        ground: "MISE À LA TERRE",
        groundDetail: "+1 FLUX // -3 CHALEUR",
        shield: "BLINDAGE",
        shieldDetail: "+1 FLUX // BLOQUE L'IMPULSION",
        integrity: (n) => `${n} unités d'intégrité restantes`,
        objective: (goal, cap) => `FLUX ${goal} REQUIS // CHALEUR MAXIMALE ${cap}`,
        status: "Lis l'impulsion annoncée, puis choisis une commande pour équilibrer flux et chaleur.",
        actionResult: (flux, heat, pulse) => `Commande exécutée. Flux ${flux}; chaleur ${heat}${pulse ? `; impulsion reçue +${pulse}` : "; impulsion bloquée"}.`,
        phaseClear: "Noyau stabilisé. Le Régulateur intensifie la phase suivante.",
        failure: "Réacteur déstabilisé. Une intégrité perdue; cette phase recommence.",
        lost: "Le noyau est devenu critique. Recommence le combat pour défier le Régulateur.",
        victory: "Le Régulateur du noyau est vaincu. La clé de résonance 06 est à toi.",
        rewardError: "La clé 06 n'a pas pu être enregistrée. Vérifie ta sauvegarde et réessaie.",
        recovered: "CLÉ 06 // RÉCUPÉRÉE",
        toRecover: "CLÉ 06 // À RÉCUPÉRER",
      };

  const startButton = document.getElementById("startBossButton");
  const nextButton = document.getElementById("nextLevelButton");
  const resetButton = document.getElementById("resetButton");
  const overchargeButton = document.getElementById("overchargeButton");
  const groundButton = document.getElementById("groundButton");
  const shieldButton = document.getElementById("shieldButton");
  const status = document.getElementById("puzzleStatus");
  const phaseReadout = document.getElementById("phaseReadout");
  const turnReadout = document.getElementById("turnReadout");
  const phaseObjective = document.getElementById("phaseObjective");
  const pulseReadout = document.getElementById("pulseReadout");
  const integrityReadout = document.getElementById("integrityReadout");
  const fluxMeter = document.getElementById("fluxMeter");
  const heatMeter = document.getElementById("heatMeter");
  const fluxFill = document.getElementById("fluxFill");
  const heatFill = document.getElementById("heatFill");
  const fluxReadout = document.getElementById("fluxReadout");
  const heatReadout = document.getElementById("heatReadout");
  const keyCount = document.getElementById("keyCount");
  const keyHud = document.getElementById("keyHud");
  const keyHudNote = document.getElementById("keyHudNote");
  const keySlot = document.getElementById("keyHudSlot");
  const keyImage = keySlot.querySelector("img");
  let phaseIndex = 0;
  let turn = 0;
  let flux = 0;
  let heat = phases[0].startHeat;
  let integrity = 4;
  let started = false;
  let ended = false;

  const currentPhase = () => phases[phaseIndex];
  const setStatus = (message, error = false) => {
    status.textContent = message;
    status.classList.toggle("error", error);
    status.classList.toggle("success", !error && ended);
    document.getElementById("systemMessage").textContent = message.toUpperCase();
  };
  const updateReadouts = () => {
    const config = currentPhase();
    phaseReadout.textContent = copy.phase(phaseIndex + 1);
    turnReadout.textContent = copy.action(Math.min(turn + 1, config.turns), config.turns);
    phaseObjective.textContent = copy.objective(config.fluxGoal, config.heatLimit);
    pulseReadout.textContent = copy.pulse(config.pulses[turn] || 0);
    integrityReadout.textContent = copy.integrity(integrity);
    fluxReadout.textContent = `${flux} / ${config.fluxGoal}`;
    heatReadout.textContent = `${heat} / ${config.heatLimit}`;
    fluxFill.style.width = `${Math.min(100, (flux / config.fluxGoal) * 100)}%`;
    heatFill.style.width = `${Math.min(100, (heat / config.heatLimit) * 100)}%`;
    fluxMeter.setAttribute("aria-valuemax", String(config.fluxGoal));
    fluxMeter.setAttribute("aria-valuenow", String(flux));
    fluxMeter.setAttribute("aria-label", `${copy.flux}: ${flux} / ${config.fluxGoal}`);
    heatMeter.setAttribute("aria-valuemax", String(config.heatLimit));
    heatMeter.setAttribute("aria-valuenow", String(heat));
    heatMeter.setAttribute("aria-label", `${copy.heat}: ${heat} / ${config.heatLimit}`);
    heatMeter.classList.toggle("is-danger", heat >= config.heatLimit * 0.8);
    [overchargeButton, groundButton, shieldButton].forEach((button) => {
      button.disabled = !started || ended;
    });
  };

  const resetPhase = () => {
    flux = 0;
    heat = currentPhase().startHeat;
    turn = 0;
    panel.classList.remove("is-overheated");
    updateReadouts();
  };

  const loseIntegrity = () => {
    integrity -= 1;
    if (integrity <= 0) {
      ended = true;
      started = false;
      startButton.hidden = true;
      setStatus(copy.lost, true);
      updateReadouts();
      return;
    }
    resetPhase();
    setStatus(copy.failure, true);
  };

  const grantKey = () => {
    if (!window.EchoesSave.unlockKey(keyId)) {
      setStatus(copy.rewardError, true);
      return false;
    }
    if (!window.EchoesLevels.markCompleted("boss-06")) {
      setStatus(copy.rewardError, true);
      return false;
    }
    window.EchoesSave.saveProgress({
      currentPage: "level-30",
      currentLevel: 30,
    });
    keyCount.textContent = "6 / 6";
    keyHud.classList.add("is-unlocked");
    keyHudNote.textContent = copy.recovered;
    keySlot.classList.add("is-visible");
    nextButton.hidden = false;
    return true;
  };

  const win = () => {
    ended = true;
    started = false;
    panel.classList.add("is-victory");
    setStatus(copy.victory);
    updateReadouts();
    if (grantKey()) nextButton.hidden = false;
  };

  const finishPhase = () => {
    if (phaseIndex + 1 >= phases.length) {
      win();
      return;
    }
    phaseIndex += 1;
    resetPhase();
    setStatus(`${copy.phaseClear} ${copy.objective(currentPhase().fluxGoal, currentPhase().heatLimit)}`);
  };

  const act = (command) => {
    if (!started || ended) return;
    const config = currentPhase();
    const action = {
      overcharge: { flux: 3, heat: 2, shield: false },
      ground: { flux: 1, heat: -3, shield: false },
      shield: { flux: 1, heat: -1, shield: true },
    }[command];
    if (!action) return;
    flux += action.flux;
    heat = Math.max(0, heat + action.heat);
    const pulse = action.shield ? 0 : config.pulses[turn];
    heat += pulse;
    turn += 1;

    if (heat > config.heatLimit) {
      panel.classList.add("is-overheated");
      updateReadouts();
      loseIntegrity();
      return;
    }
    if (flux >= config.fluxGoal) {
      updateReadouts();
      finishPhase();
      return;
    }
    if (turn >= config.turns) {
      updateReadouts();
      loseIntegrity();
      return;
    }
    updateReadouts();
    setStatus(copy.actionResult(flux, heat, pulse));
  };

  const resetFight = () => {
    phaseIndex = 0;
    turn = 0;
    flux = 0;
    heat = phases[0].startHeat;
    integrity = 4;
    started = false;
    ended = false;
    panel.classList.remove("is-overheated", "is-victory");
    startButton.hidden = false;
    nextButton.hidden = true;
    setStatus(copy.status);
    updateReadouts();
  };

  document.documentElement.lang = english ? "en" : "fr";
  document.getElementById("bossPart").textContent = english ? "PART 6 // ORIGIN" : "PARTIE 6 // ORIGINE";
  document.getElementById("bossLevel").textContent = english ? "BOSS 06 // THE REGULATOR" : "BOSS 06 // LE RÉGULATEUR";
  document.getElementById("bossKicker").textContent = copy.kicker;
  document.getElementById("bossTitle").textContent = copy.title;
  document.getElementById("bossDescription").textContent = copy.description;
  document.getElementById("panelKicker").textContent = english ? "FIGHT // REACTOR MANAGEMENT" : "COMBAT // GESTION DU RÉACTEUR";
  document.getElementById("arenaTitle").textContent = copy.arena;
  document.getElementById("helpTitle").textContent = copy.helpTitle;
  document.getElementById("helpList").innerHTML = copy.help;
  document.getElementById("pulseLabel").textContent = copy.pulseLabel;
  document.getElementById("phaseObjective").setAttribute(
    "aria-label",
    english ? "Current reactor phase objective" : "Objectif de la phase du réacteur",
  );
  document.getElementById("fluxLabel").textContent = copy.flux;
  document.getElementById("heatLabel").textContent = copy.heat;
  document.getElementById("keyHudLabel").textContent = english ? "RESONANCES" : "RÉSONANCES";
  document.getElementById("footerLabel").textContent = english ? "ECHO // ACTIVE ORIGIN" : "ÉCHO // ORIGINE ACTIVE";
  overchargeButton.querySelector("strong").textContent = copy.overcharge;
  overchargeButton.querySelector("span").textContent = copy.overchargeDetail;
  groundButton.querySelector("strong").textContent = copy.ground;
  groundButton.querySelector("span").textContent = copy.groundDetail;
  shieldButton.querySelector("strong").textContent = copy.shield;
  shieldButton.querySelector("span").textContent = copy.shieldDetail;
  startButton.textContent = copy.start;
  nextButton.textContent = copy.next;
  resetButton.textContent = copy.reset;
  keyCount.textContent = "6 / 6";
  keyImage.src = "../../assets/svg/cles/key-06-usb.svg";
  keyImage.alt = english ? "Resonance key 06" : "Clé de résonance 06";
  keyHudNote.textContent = copy.toRecover;
  document.getElementById("levelProgress").setAttribute("aria-label", english ? "Part 6 progress" : "Progression de la Partie 6");
  for (let level = 26; level <= 30; level += 1) {
    const marker = document.createElement("span");
    marker.className = `level-square${level === 30 ? " current" : ""}`;
    marker.setAttribute("aria-hidden", "true");
    document.getElementById("levelProgress").appendChild(marker);
  }
  startButton.addEventListener("click", () => {
    started = true;
    startButton.hidden = true;
    updateReadouts();
    setStatus(copy.objective(currentPhase().fluxGoal, currentPhase().heatLimit));
  });
  overchargeButton.addEventListener("click", () => act("overcharge"));
  groundButton.addEventListener("click", () => act("ground"));
  shieldButton.addEventListener("click", () => act("shield"));
  resetButton.addEventListener("click", resetFight);
  nextButton.addEventListener("click", () => {
    window.location.href = nextUrl;
  });

  updateReadouts();
  if (window.EchoesSave.getKeys().includes(keyId)) {
    startButton.hidden = true;
    nextButton.hidden = false;
    keyHud.classList.add("is-unlocked");
    keySlot.classList.add("is-visible");
    keyHudNote.textContent = copy.recovered;
    setStatus(copy.victory);
  } else {
    setStatus(copy.status);
  }
})();
