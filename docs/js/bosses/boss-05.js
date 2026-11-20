(() => {
  const track = document.getElementById("timingTrack");
  if (!track) return;

  const english = localStorage.getItem("echoes-language") === "en";
  const keyId = "resonance-5";
  const nextUrl = document.body.dataset.nextUrl;
  const copy = english
    ? {
        start: "START ROUND",
        next: "CONTINUE TO LEVEL 26",
        reset: "RESTART FIGHT",
        title: "The Pulse Duelist",
        kicker: "BOSS // RESONANCE TIMING TRIAL",
        description: "Read the moving pulse, then strike only when it crosses the illuminated capture window. Clear three rounds as the tempo rises and the window narrows.",
        arena: "Capture the signal",
        help: "Press START ROUND. The marker sweeps back and forth along the track; the gold window is the only safe strike point. Press STRIKE while the marker is inside it. Each round asks for more clean hits at a faster tempo. A missed window costs one integrity.",
        status: "Start the first round, watch the moving marker, and strike only inside the gold window.",
        phase: (n) => `TEMPO ${n} / 3`,
        beat: (hit, total) => `CLEAN HITS ${hit} / ${total}`,
        strike: "STRIKE",
        startNext: "START NEXT TEMPO",
        hit: "Clean strike. Keep the timing; the next capture window is shifting.",
        miss: "Window missed. One integrity lost. The target stays active for the next sweep.",
        roundClear: "Tempo cleared. Take a breath, then start the next round.",
        lost: "Your signal broke apart. Reset the fight to challenge the duelist again.",
        victory: "The Pulse Duelist is defeated. Resonance key 05 is yours.",
        rewardError: "Key 05 could not be saved. Check your save and retry.",
        integrity: (n) => `${n} integrity remaining`,
        recovered: "KEY 05 // RECOVERED",
        toRecover: "KEY 05 // TO RECOVER",
      }
    : {
        start: "LANCER LA PHASE",
        next: "CONTINUER VERS LE NIVEAU 26",
        reset: "RECOMMENCER LE COMBAT",
        title: "Le Dueliste du tempo",
        kicker: "BOSS // ÉPREUVE DE RÉSONANCE TEMPORELLE",
        description: "Lis le déplacement du signal, puis frappe uniquement lorsqu'il traverse la fenêtre de capture lumineuse. Réussis trois phases : le tempo accélère et la fenêtre rétrécit.",
        arena: "Capturer le signal",
        help: "Appuie sur LANCER LA PHASE. Le curseur balaie la piste dans les deux sens; la fenêtre dorée est le seul instant où frapper. Appuie sur FRAPPER quand le curseur la traverse. Chaque phase exige davantage de frappes propres à un tempo plus rapide. Une fenêtre manquée coûte une unité d'intégrité.",
        status: "Lance la première phase, observe le curseur et frappe uniquement dans la fenêtre dorée.",
        phase: (n) => `TEMPO ${n} / 3`,
        beat: (hit, total) => `FRAPPES NETTES ${hit} / ${total}`,
        strike: "FRAPPER",
        startNext: "LANCER LE TEMPO SUIVANT",
        hit: "Frappe précise. Garde le rythme : la prochaine fenêtre se déplace.",
        miss: "Fenêtre manquée. Une unité d'intégrité perdue. Retente au prochain passage.",
        roundClear: "Tempo réussi. Reprends ton souffle, puis lance la phase suivante.",
        lost: "Ton signal s'est brisé. Recommence le combat pour défier le Dueliste.",
        victory: "Le Dueliste du tempo est vaincu. La clé de résonance 05 est à toi.",
        rewardError: "La clé 05 n'a pas pu être enregistrée. Vérifie ta sauvegarde et réessaie.",
        integrity: (n) => `${n} unités d'intégrité restantes`,
        recovered: "CLÉ 05 // RÉCUPÉRÉE",
        toRecover: "CLÉ 05 // À RÉCUPÉRER",
      };

  const rounds = [
    { hits: 4, legMs: 1500, tolerance: 0.09, targets: [0.26, 0.72, 0.42, 0.82] },
    { hits: 5, legMs: 1250, tolerance: 0.075, targets: [0.72, 0.3, 0.83, 0.48, 0.22] },
    { hits: 6, legMs: 1000, tolerance: 0.06, targets: [0.3, 0.77, 0.43, 0.84, 0.22, 0.61] },
  ];
  const startButton = document.getElementById("startBossButton");
  const strikeButton = document.getElementById("strikeButton");
  const nextButton = document.getElementById("nextLevelButton");
  const resetButton = document.getElementById("resetButton");
  const status = document.getElementById("puzzleStatus");
  const phaseReadout = document.getElementById("phaseReadout");
  const beatReadout = document.getElementById("beatReadout");
  const integrityReadout = document.getElementById("integrityReadout");
  const cursor = document.getElementById("timingCursor");
  const targetZone = document.getElementById("targetZone");
  const keyCount = document.getElementById("keyCount");
  const keyHud = document.getElementById("keyHud");
  const keyHudNote = document.getElementById("keyHudNote");
  const keySlot = document.getElementById("keyHudSlot");
  const keyImage = keySlot.querySelector("img");
  let roundIndex = 0;
  let hits = 0;
  let integrity = 5;
  let started = false;
  let ended = false;
  let inside = false;
  let claimedWindow = false;
  let animationId = 0;
  let elapsed = 0;
  let previousTime = 0;

  const currentRound = () => rounds[roundIndex];
  const targetPosition = () => {
    const sequence = currentRound().targets;
    return sequence[hits % sequence.length];
  };
  const setStatus = (message, error = false) => {
    status.textContent = message;
    status.classList.toggle("error", error);
    status.classList.toggle("success", !error && ended);
    document.getElementById("systemMessage").textContent = message.toUpperCase();
  };
  const updateReadouts = () => {
    phaseReadout.textContent = copy.phase(roundIndex + 1);
    beatReadout.textContent = copy.beat(hits, currentRound().hits);
    integrityReadout.textContent = copy.integrity(integrity);
    targetZone.style.left = `${targetPosition() * 100}%`;
    targetZone.style.width = `${currentRound().tolerance * 200}%`;
  };
  const stopTrack = () => {
    started = false;
    window.cancelAnimationFrame(animationId);
    strikeButton.disabled = true;
  };

  const grantKey = () => {
    if (!window.EchoesSave.unlockKey(keyId)) {
      setStatus(copy.rewardError, true);
      return false;
    }
    if (!window.EchoesLevels.markCompleted("boss-05")) {
      setStatus(copy.rewardError, true);
      return false;
    }
    window.EchoesSave.saveProgress({
      currentPage: "level-26",
      currentLevel: 26,
    });
    keyCount.textContent = "5 / 6";
    keyHud.classList.add("is-unlocked");
    keyHudNote.textContent = copy.recovered;
    keySlot.classList.add("is-visible");
    nextButton.hidden = false;
    return true;
  };

  const win = () => {
    ended = true;
    stopTrack();
    document.querySelector(".boss05-panel").classList.add("is-victory");
    setStatus(copy.victory);
    if (grantKey()) nextButton.hidden = false;
  };

  const lose = () => {
    ended = true;
    stopTrack();
    startButton.hidden = true;
    setStatus(copy.lost, true);
  };

  const missWindow = () => {
    if (claimedWindow || ended || !started) return;
    claimedWindow = true;
    integrity -= 1;
    integrityReadout.textContent = copy.integrity(integrity);
    if (integrity <= 0) {
      lose();
      return;
    }
    setStatus(copy.miss, true);
  };

  const animateTrack = (time) => {
    if (!started || ended) return;
    if (!previousTime) previousTime = time;
    elapsed += Math.min(time - previousTime, 50);
    previousTime = time;
    const leg = currentRound().legMs;
    const cycle = (elapsed % (leg * 2)) / leg;
    const position = 0.035 + 0.93 * (cycle <= 1 ? cycle : 2 - cycle);
    cursor.style.left = `${position * 100}%`;
    const inWindow = Math.abs(position - targetPosition()) <= currentRound().tolerance;
    if (inWindow && !inside) {
      inside = true;
      claimedWindow = false;
      targetZone.classList.add("is-live");
    } else if (!inWindow && inside) {
      inside = false;
      targetZone.classList.remove("is-live");
      missWindow();
    }
    animationId = window.requestAnimationFrame(animateTrack);
  };

  const beginRound = () => {
    if (ended) return;
    started = true;
    inside = false;
    claimedWindow = false;
    elapsed = 0;
    previousTime = 0;
    startButton.hidden = true;
    strikeButton.disabled = false;
    updateReadouts();
    setStatus(copy.status);
    animationId = window.requestAnimationFrame(animateTrack);
  };

  const strike = () => {
    if (!started || ended) return;
    if (!inside || claimedWindow) {
      setStatus(copy.status);
      return;
    }
    claimedWindow = true;
    hits += 1;
    document.getElementById("timingTrack").classList.remove("is-hit");
    void track.offsetWidth;
    track.classList.add("is-hit");
    if (hits >= currentRound().hits) {
      stopTrack();
      roundIndex += 1;
      if (roundIndex >= rounds.length) {
        win();
        return;
      }
      hits = 0;
      startButton.textContent = copy.startNext;
      startButton.hidden = false;
      setStatus(copy.roundClear);
    } else {
      claimedWindow = true;
      updateReadouts();
      setStatus(copy.hit);
    }
  };

  const resetFight = () => {
    window.cancelAnimationFrame(animationId);
    roundIndex = 0;
    hits = 0;
    integrity = 5;
    started = false;
    ended = false;
    inside = false;
    claimedWindow = false;
    elapsed = 0;
    previousTime = 0;
    document.querySelector(".boss05-panel").classList.remove("is-victory");
    targetZone.classList.remove("is-live");
    track.classList.remove("is-hit");
    startButton.textContent = copy.start;
    startButton.hidden = false;
    nextButton.hidden = true;
    updateReadouts();
    setStatus(copy.status);
  };

  document.documentElement.lang = english ? "en" : "fr";
  document.getElementById("bossTitle").textContent = copy.title;
  document.getElementById("bossKicker").textContent = copy.kicker;
  document.getElementById("bossDescription").textContent = copy.description;
  document.getElementById("arenaTitle").textContent = copy.arena;
  document.getElementById("helpText").textContent = copy.help;
  document.querySelector(".boss05-panel .panel-kicker").textContent = english
    ? "FIGHT // PRECISION AND RHYTHM"
    : "COMBAT // PRÉCISION ET RYTHME";
  document.querySelector(".boss05-help summary").textContent = english
    ? "FIGHT PROTOCOL"
    : "PROTOCOLE DE COMBAT";
  document.querySelector(".boss05-key-hud > span:first-child").textContent = english
    ? "RESONANCES"
    : "RÉSONANCES";
  document.querySelector(".level-meta > span").textContent = english
    ? "PART 5 // CONVERGENCE"
    : "PARTIE 5 // CONVERGENCE";
  document.querySelector(".level-meta > strong").textContent = english
    ? "BOSS 05 // THE TEMPO"
    : "BOSS 05 // LE TEMPO";
  document.querySelector(".boss05-status-readouts > span").textContent = english
    ? "CAPTURE ZONE // GOLD"
    : "ZONE D'IMPACT // OR";
  document.querySelector(".level-footer > span:first-child").textContent = english
    ? "ECHO // ACTIVE TEMPO"
    : "ÉCHO // TEMPO ACTIF";
  document.querySelector(".level-footer > span:last-child").textContent = "BOSS // 05";
  track.setAttribute("aria-label", english
    ? "Moving cursor to catch in the gold window"
    : "Curseur mobile à capturer dans la fenêtre dorée");
  startButton.textContent = copy.start;
  strikeButton.textContent = copy.strike;
  nextButton.textContent = copy.next;
  resetButton.textContent = copy.reset;
  keyCount.textContent = "5 / 6";
  keyImage.src = "../../assets/svg/cles/key-05-usb.svg";
  keyImage.alt = english ? "Resonance key 05" : "Clé de résonance 05";
  keyHudNote.textContent = copy.toRecover;
  document.getElementById("levelProgress").setAttribute("aria-label", english ? "Part 5 progress" : "Progression de la Partie 5");
  for (let level = 21; level <= 25; level += 1) {
    const marker = document.createElement("span");
    marker.className = `level-square${level === 25 ? " current" : ""}`;
    marker.setAttribute("aria-hidden", "true");
    document.getElementById("levelProgress").appendChild(marker);
  }
  startButton.addEventListener("click", beginRound);
  strikeButton.addEventListener("click", strike);
  resetButton.addEventListener("click", resetFight);
  nextButton.addEventListener("click", () => {
    window.location.href = nextUrl;
  });

  updateReadouts();
  strikeButton.disabled = true;
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
