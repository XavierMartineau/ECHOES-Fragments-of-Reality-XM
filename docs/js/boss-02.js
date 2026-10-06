(() => {
  const board = document.getElementById("tacticalBoard");
  if (!board) return;

  const language = localStorage.getItem("echoes-language") === "en" ? "en" : "fr";
  const copy = {
    fr: {
      part: "PARTIE 2 // FRACTURES",
      level: "CLEE_02 // GARDIEN",
      eyebrow: "CLEE_02 // ARCHONTE DES FRACTURES",
      title: "L'Architecte du Néant",
      description: "À chaque phase, l'arène change. Traverse ses lignes de frappe, atteins les ancres et brise ses trois armures avant que ta cohérence ne cède.",
      systemLabel: "ECHO://PROTOCOLE_02",
      kicker: "COMBAT // NAVIGATION TACTIQUE",
      arenaTitle: "L'arène fracturée",
      keyLabel: "RÉSONANCES",
      keyNote: "CLÉ 02 // À RÉCUPÉRER",
      keyRecovered: "CLÉ 02 // RÉCUPÉRÉE",
      keyHudAria: "Progression des clés",
      keySlotAria: "Clé de résonance 02 récupérée",
      keyAlt: "Clé de résonance 02",
      coherence: "COHÉRENCE",
      incoming: "PROCHAINE FRACTURE",
      helpTitle: "COMMENT COMBATTRE",
      helpStart: "Démarre le combat avec le bouton ci-dessous.",
      helpMove: "Clique une case voisine pour te déplacer. Évite les murs ▩.",
      helpPulse: "Rejoins l'ancre active ◆ puis appuie sur « Pulser l'ancre ». Stabilise deux ancres dans chacune des trois phases.",
      helpThreat: "La rangée ou colonne rouge sera frappée quand le compteur arrive à zéro. Un déplacement ou une impulsion fait avancer le compteur.",
      helpShield: "Le bouclier annule le prochain impact sans consommer une action. Tu en as deux; tu as aussi huit unités de cohérence.",
      start: "ENTRER DANS L'ARÈNE",
      pulse: "PULSER L'ANCRE",
      shield: "BOUCLIER",
      next: "CONTINUER VERS LE NIVEAU 21",
      reset: "Réinitialiser",
      save: "SAUVEGARDER",
      ready: "Déplace-toi d'une case à la fois. Évite la ligne rouge, puis pulse l'ancre active.",
      movement: "Choisis une case voisine. Les cases rouges seront frappées après le compte à rebours.",
      wrongMove: "Tu ne peux avancer que d'une case orthogonale.",
      hit: "La fracture t'a atteint. Tu es repoussé au point d'ancrage.",
      shieldHit: "Le bouclier a absorbé l'impact.",
      anchor: "Ancre stabilisée. La suivante est maintenant active.",
      phaseSuccess: "Armure brisée. L'arène se recompose.",
      victory: "L'Archonte est vaincu. La Clé 02 est à toi.",
      defeated: "Ta cohérence s'est effondrée. Réinitialise le combat pour recommencer.",
      shieldReady: "Bouclier actif : le prochain impact est annulé.",
      shieldEmpty: "Il ne te reste plus de bouclier.",
      anchorReady: "Ancre atteinte. Appuie sur « Pulser l'ancre ».",
      saved: "Point de reprise enregistré.",
      saveRequired: "Connecte-toi pour enregistrer ton point de reprise.",
      rewardError: "Impossible d'enregistrer la Clé 02. Réinitialise et réessaie.",
      player: "toi",
      playerAtAnchor: "toi, sur l'ancre active",
      wall: "mur",
      anchorCell: "ancre",
      activeAnchorCell: "ancre active",
      sealedCell: "ancre stabilisée",
      openCell: "case libre",
      hitRow: (row) => `RANGÉE ${row + 1}`,
      hitColumn: (column) => `COLONNE ${column + 1}`,
      countdown: (count) => `Impact dans ${count} actions`,
      phase: (index) => `PHASE ${index + 1} // ${["CARTOGRAPHIER L'IMPACT", "DÉJOUER LE MIROIR", "SCELLER LA FRACTURE"][index]}`,
      phaseIntro: (index) => `Phase ${index + 1} : stabilise les deux ancres, puis évite la prochaine frappe.`,
      hitCount: (count) => `${count} unités de cohérence restantes`,
      shieldCount: (count) => `BOUCLIER (${count})`,
      progress: (count) => `${count} / 6`,
      footer: "ÉCHO // FRACTURES ACTIVES",
      counter: "BOSS // 02",
    },
    en: {
      part: "PART 2 // FRACTURES",
      level: "KEY 02 // WARDEN",
      eyebrow: "CLEE_02 // ARCHON OF FRACTURES",
      title: "The Architect of the Void",
      description: "The arena changes with every phase. Cross its attack lines, reach the anchors, and break all three armor layers before your coherence collapses.",
      systemLabel: "ECHO://PROTOCOL_02",
      kicker: "COMBAT // TACTICAL NAVIGATION",
      arenaTitle: "The fractured arena",
      keyLabel: "RESONANCES",
      keyNote: "KEY 02 // TO RECOVER",
      keyRecovered: "KEY 02 // RECOVERED",
      keyHudAria: "Key progression",
      keySlotAria: "Resonance key 02 recovered",
      keyAlt: "Resonance key 02",
      coherence: "COHERENCE",
      incoming: "INCOMING FRACTURE",
      helpTitle: "HOW TO FIGHT",
      helpStart: "Start the fight with the button below.",
      helpMove: "Click an adjacent tile to move. Avoid ▩ walls.",
      helpPulse: "Reach the active ◆ anchor, then press “Pulse anchor”. Stabilize two anchors in each of the three phases.",
      helpThreat: "The red row or column will be struck when the countdown reaches zero. Moving or pulsing advances the countdown.",
      helpShield: "A ward cancels the next impact without using an action. You have two wards and eight coherence units.",
      start: "ENTER THE ARENA",
      pulse: "PULSE ANCHOR",
      shield: "WARD",
      next: "CONTINUE TO LEVEL 21",
      reset: "Reset",
      save: "SAVE",
      ready: "Move one tile at a time. Avoid the red line, then pulse the active anchor.",
      movement: "Choose an adjacent tile. Red tiles will be hit when the countdown ends.",
      wrongMove: "You can only move one orthogonal tile.",
      hit: "The fracture caught you. You were forced back to the anchor point.",
      shieldHit: "Your ward absorbed the impact.",
      anchor: "Anchor stabilized. The next one is now active.",
      phaseSuccess: "Armor broken. The arena is rebuilding.",
      victory: "The Archon is defeated. Key 02 is yours.",
      defeated: "Your coherence collapsed. Reset the fight to try again.",
      shieldReady: "Ward active: the next impact is cancelled.",
      shieldEmpty: "No wards remain.",
      anchorReady: "Anchor reached. Press “Pulse anchor”.",
      saved: "Checkpoint saved.",
      saveRequired: "Sign in to save your checkpoint.",
      rewardError: "Could not register Key 02. Reset the fight and try again.",
      player: "you",
      playerAtAnchor: "you, on the active anchor",
      wall: "wall",
      anchorCell: "anchor",
      activeAnchorCell: "active anchor",
      sealedCell: "stabilized anchor",
      openCell: "open tile",
      hitRow: (row) => `ROW ${row + 1}`,
      hitColumn: (column) => `COLUMN ${column + 1}`,
      countdown: (count) => `Impact in ${count} actions`,
      phase: (index) => `PHASE ${index + 1} // ${["MAP THE IMPACT", "OUTPLAY THE MIRROR", "SEAL THE FRACTURE"][index]}`,
      phaseIntro: (index) => `Phase ${index + 1}: stabilize both anchors, then avoid the next strike.`,
      hitCount: (count) => `${count} coherence units remaining`,
      shieldCount: (count) => `WARD (${count})`,
      progress: (count) => `${count} / 6`,
      footer: "ECHO // ACTIVE FRACTURES",
      counter: "BOSS // 02",
    },
  }[language];

  const $ = (id) => document.getElementById(id);
  const panel = document.querySelector(".boss02-panel");
  const phaseReadout = $("phaseReadout");
  const strikeReadout = $("strikeReadout");
  const actionsReadout = $("actionsReadout");
  const armorReadout = $("armorReadout");
  const livesReadout = $("livesReadout");
  const status = $("puzzleStatus");
  const startButton = $("startBossButton");
  const pulseButton = $("pulseButton");
  const shieldButton = $("shieldButton");
  const nextButton = $("nextLevelButton");
  const resetButton = $("resetButton");
  const saveButton = $("bossSaveButton");
  const keyHud = $("keyHud");
  const keyCount = $("keyCount");
  const keyHudNote = $("keyHudNote");
  const keyHudSlot = $("keyHudSlot");
  const keySlotImage = keyHudSlot.querySelector("img");
  const core = $("bossCore");
  const rewardKey = $("bossRewardKey");
  const size = 5;
  const maxCoherence = 8;
  const actionsPerStrike = 4;
  const home = 22;
  const phases = [
    { spawn: home, walls: [6, 8, 16, 18], anchors: [15, 4], strikes: [["row", 4], ["column", 0], ["row", 1], ["column", 4]] },
    { spawn: home, walls: [1, 5, 9, 15, 19, 23], anchors: [10, 2], strikes: [["column", 2], ["row", 2], ["column", 4], ["row", 0]] },
    { spawn: 24, walls: [2, 6, 8, 16, 18], anchors: [0, 20], strikes: [["row", 3], ["column", 1], ["row", 4], ["column", 3], ["row", 1], ["column", 0]] },
  ];
  const cells = [];
  let phase = 0;
  let anchorIndex = 0;
  let player = home;
  let coherence = maxCoherence;
  let shields = 2;
  let shieldArmed = false;
  let strikeIndex = 0;
  let actionsUntilStrike = actionsPerStrike;
  let armorBroken = 0;
  let started = false;
  let ended = false;

  document.documentElement.lang = language;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const value = copy[element.dataset.i18n];
    if (typeof value === "string") element.textContent = value;
  });
  $("levelProgress").setAttribute("aria-label", language === "en" ? "Part 2 progress" : "Progression de la Partie 2");
  keyHud.setAttribute("aria-label", copy.keyHudAria);
  for (let level = 11; level <= 20; level += 1) {
    const marker = document.createElement("span");
    marker.className = `level-square${level === 20 ? " current" : ""}`;
    marker.setAttribute("aria-hidden", "true");
    $("levelProgress").appendChild(marker);
  }

  const setStatus = (message, variant = "") => {
    status.textContent = message;
    status.className = `puzzle-status${variant ? ` ${variant}` : ""}`;
    $("systemMessage").textContent = message.toUpperCase();
  };

  const updateKeyHud = () => {
    const keys = window.EchoesSave?.getKeys?.() || [];
    keyCount.textContent = `${Math.min(keys.length, 6)} / 6`;
    if (!keys.includes("resonance-2")) return;
    keyHud.classList.add("is-unlocked");
    keyHudNote.textContent = copy.keyRecovered;
    keyHudSlot.setAttribute("aria-label", copy.keySlotAria);
    keyHudSlot.removeAttribute("aria-hidden");
    keyHudSlot.classList.add("is-visible");
    core.classList.add("is-unlocked", "is-collected");
  };

  const currentStrike = () => phases[phase].strikes[strikeIndex % phases[phase].strikes.length];

  const strikeContains = (position, strike) => {
    const row = Math.floor(position / size);
    const column = position % size;
    return strike[0] === "row" ? row === strike[1] : column === strike[1];
  };

  const updateLives = () => {
    livesReadout.replaceChildren();
    for (let index = 0; index < maxCoherence; index += 1) {
      const life = document.createElement("span");
      life.className = [
        "boss02-life",
        index >= coherence ? "is-lost" : "",
        index < armorBroken && index < coherence ? "is-stabilized" : "",
      ].filter(Boolean).join(" ");
      life.setAttribute("aria-hidden", "true");
      livesReadout.appendChild(life);
    }
    livesReadout.setAttribute("aria-label", copy.hitCount(coherence));
  };

  const render = () => {
    const activeAnchor = phases[phase].anchors[anchorIndex];
    const strike = currentStrike();
    const walls = phases[phase].walls;
    cells.forEach((cell, index) => {
      const isWall = walls.includes(index);
      const isPlayer = player === index;
      const isAnchor = phases[phase].anchors.includes(index);
      const anchorOrder = phases[phase].anchors.indexOf(index);
      const isSealed = anchorOrder >= 0 && anchorOrder < anchorIndex;
      const isActiveAnchor = index === activeAnchor;
      const isThreatened = strikeContains(index, strike);
      cell.classList.toggle("is-wall", isWall);
      cell.classList.toggle("is-player", isPlayer);
      cell.classList.toggle("is-anchor", isAnchor && !isSealed);
      cell.classList.toggle("is-active-anchor", isActiveAnchor);
      cell.classList.toggle("is-sealed", isSealed);
      cell.classList.toggle("is-threatened", isThreatened && !isWall);
      cell.textContent = isWall ? "▩" : isPlayer ? "◉" : isSealed ? "✓" : isActiveAnchor ? "◆" : isAnchor ? "◇" : "";
      cell.disabled = !started || ended || isWall;
      const description = isWall
        ? copy.wall
        : isPlayer && isActiveAnchor
          ? copy.playerAtAnchor
        : isPlayer
          ? copy.player
          : isSealed
            ? copy.sealedCell
            : isActiveAnchor
              ? copy.activeAnchorCell
            : isAnchor
              ? copy.anchorCell
              : copy.openCell;
      cell.setAttribute("aria-label", `${language === "en" ? "Row" : "Rangée"} ${Math.floor(index / size) + 1}, ${language === "en" ? "column" : "colonne"} ${index % size + 1}: ${description}${isThreatened ? `, ${copy.incoming.toLowerCase()}` : ""}`);
    });
    const inAnchor = player === activeAnchor;
    pulseButton.disabled = !started || ended || !inAnchor;
    shieldButton.disabled = !started || ended || shields === 0 || shieldArmed;
    shieldButton.textContent = `${copy.shieldCount(shields)}${shieldArmed ? " ✓" : ""}`;
    phaseReadout.textContent = copy.phase(phase);
    armorReadout.textContent = copy.progress(armorBroken);
    const [axis, lane] = strike;
    strikeReadout.textContent = axis === "row" ? copy.hitRow(lane) : copy.hitColumn(lane);
    actionsReadout.textContent = copy.countdown(actionsUntilStrike);
    updateLives();
  };

  const buildBoard = () => {
    for (let index = 0; index < size * size; index += 1) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "boss02-cell";
      cell.addEventListener("click", () => move(index));
      board.appendChild(cell);
      cells.push(cell);
    }
  };

  const finishFight = () => {
    ended = true;
    started = false;
    panel.classList.add("is-victory");
    $("systemMessage").textContent = copy.victory.toUpperCase();
    const rewardUnlocked = window.EchoesSave?.unlockKey?.("resonance-2");
    if (!rewardUnlocked) {
      setStatus(copy.rewardError, "error");
      nextButton.hidden = true;
      render();
      return;
    }
    window.EchoesSave?.saveProgress({ currentPage: "level-21", currentLevel: 21 });
    const keys = window.EchoesSave?.getKeys?.() || [];
    keyCount.textContent = `${Math.min(keys.length, 6)} / 6`;
    keyHud.classList.add("is-unlocked");
    keyHudNote.textContent = copy.keyRecovered;
    keyHudSlot.setAttribute("aria-label", copy.keySlotAria);
    keySlotImage.alt = copy.keyAlt;
    rewardKey.alt = copy.keyAlt;
    rewardKey.removeAttribute("aria-hidden");
    core.classList.remove("is-collected");
    core.classList.add("is-unlocked", "is-arriving");
    keyHudSlot.classList.add("is-arriving");
    window.setTimeout(() => {
      core.classList.remove("is-arriving");
      core.classList.add("is-collected");
      keyHudSlot.classList.remove("is-arriving");
      keyHudSlot.removeAttribute("aria-hidden");
      keyHudSlot.classList.add("is-visible");
    }, 1900);
    startButton.hidden = true;
    nextButton.hidden = false;
    setStatus(copy.victory, "success");
    nextButton.focus();
    render();
  };

  const lose = () => {
    ended = true;
    started = false;
    setStatus(copy.defeated, "error");
    startButton.hidden = true;
    render();
  };

  const resolveStrike = () => {
    const strike = currentStrike();
    let outcome = null;
    if (strikeContains(player, strike)) {
      panel.classList.remove("is-hit");
      void panel.offsetWidth;
      panel.classList.add("is-hit");
      if (shieldArmed) {
        shieldArmed = false;
        outcome = { message: copy.shieldHit, variant: "success" };
      } else {
        coherence = Math.max(0, coherence - 1);
        player = phases[phase].spawn;
        outcome = { message: copy.hit, variant: "error" };
        if (coherence === 0) {
          lose();
          return outcome;
        }
      }
    }
    strikeIndex += 1;
    actionsUntilStrike = actionsPerStrike;
    return outcome;
  };

  const consumeAction = () => {
    actionsUntilStrike -= 1;
    const outcome = actionsUntilStrike === 0 ? resolveStrike() : null;
    if (!ended) render();
    return outcome;
  };

  function move(index) {
    if (!started || ended || phases[phase].walls.includes(index)) return;
    const rowDistance = Math.abs(Math.floor(player / size) - Math.floor(index / size));
    const columnDistance = Math.abs((player % size) - (index % size));
    if (rowDistance + columnDistance !== 1) {
      setStatus(copy.wrongMove, "error");
      return;
    }
    player = index;
    const outcome = consumeAction();
    if (!ended) {
      const message = player === phases[phase].anchors[anchorIndex]
        ? copy.anchorReady
        : copy.movement;
      setStatus(outcome?.message || message, outcome?.variant || "");
    }
  }

  const activateAnchor = () => {
    if (!started || ended || player !== phases[phase].anchors[anchorIndex]) return;
    armorBroken += 1;
    anchorIndex += 1;
    const outcome = consumeAction();
    if (ended) return;
    if (anchorIndex === phases[phase].anchors.length) {
      if (phase === phases.length - 1) {
        finishFight();
        return;
      }
      phase += 1;
      anchorIndex = 0;
      player = phases[phase].spawn;
      strikeIndex = 0;
      actionsUntilStrike = actionsPerStrike;
      setStatus(outcome?.message || copy.phaseSuccess, outcome?.variant || "success");
      render();
      return;
    }
    setStatus(outcome?.message || copy.anchor, outcome?.variant || "success");
    render();
  };

  board.addEventListener("keydown", (event) => {
    const directions = {
      ArrowUp: -size,
      ArrowDown: size,
      ArrowLeft: -1,
      ArrowRight: 1,
      w: -size,
      s: size,
      a: -1,
      d: 1,
    };
    const delta = directions[event.key];
    if (delta === undefined || !started || ended) return;
    event.preventDefault();
    const target = player + delta;
    if (target < 0 || target >= size * size) return;
    if ((delta === -1 || delta === 1) && Math.floor(target / size) !== Math.floor(player / size)) return;
    move(target);
  });

  startButton.addEventListener("click", () => {
    started = true;
    startButton.hidden = true;
    setStatus(copy.phaseIntro(phase));
    render();
  });
  pulseButton.addEventListener("click", activateAnchor);
  shieldButton.addEventListener("click", () => {
    if (!started || ended || shields === 0 || shieldArmed) return;
    shields -= 1;
    shieldArmed = true;
    setStatus(copy.shieldReady, "success");
    render();
  });
  resetButton.addEventListener("click", () => {
    phase = 0;
    anchorIndex = 0;
    player = phases[0].spawn;
    coherence = maxCoherence;
    shields = 2;
    shieldArmed = false;
    strikeIndex = 0;
    actionsUntilStrike = actionsPerStrike;
    armorBroken = 0;
    started = false;
    ended = false;
    panel.classList.remove("is-hit", "is-victory");
    startButton.hidden = false;
    nextButton.hidden = true;
    setStatus(copy.ready);
    render();
  });
  nextButton.addEventListener("click", () => {
    window.location.href = "../partie-3_niveau-21_à_30/niveau-21.html";
  });
  saveButton.addEventListener("click", () => {
    const saved = window.EchoesSave?.saveProgress({
      currentPage: "boss-02",
      currentLevel: 20,
    });
    setStatus(saved ? copy.saved : copy.saveRequired, saved ? "success" : "error");
  });

  buildBoard();
  updateKeyHud();
  resetButton.textContent = copy.reset;
  render();
})();
