// ============================================================================
// Boss 2 (après le niveau 20) : logique du plateau, des phases et de la victoire.
// ============================================================================
(() => {
  const board = document.getElementById("tacticalBoard");
  if (!board) return;

  const language =
    localStorage.getItem("echoes-language") === "en" ? "en" : "fr";
  const keyNumber = Number(document.body.dataset.keyNumber) || 2;
  const keyCode = String(keyNumber).padStart(2, "0");
  const keyId = `resonance-${keyNumber}`;
  const keySrc = `../../assets/svg/cles/key-${keyCode}-usb.svg`;
  const levelStart = Number(document.body.dataset.levelStart) || 6;
  const levelEnd = Number(document.body.dataset.levelEnd) || 10;
  const nextLevel = Number(document.body.dataset.nextLevel) || levelEnd;
  const nextUrl = document.body.dataset.nextUrl;
  const anchorsPerPhase = Math.min(
    3,
    2 + Math.floor((keyNumber - 2) / 2),
  );
  const maxCoherence = Math.max(4, 10 - keyNumber);
  const actionsPerStrike = Math.max(2, 7 - keyNumber);
  const totalAnchors = anchorsPerPhase * 3;
  const copy = {
    fr: {
      part: "PARTIE 4 // RÉSONANCE",
      level: "CLEE_02 // GARDIEN",
      eyebrow: "CLEE_02 // ARCHONTE DES FRACTURES",
      title: "L'Architecte du Néant",
      description:
        "À chaque phase, l'arène change. Traverse ses lignes de frappe, atteins les ancres et brise ses trois armures avant que ta cohérence ne cède.",
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
      helpPulse:
        "Rejoins l'ancre active ◆ puis appuie sur « Pulser l'ancre ». Stabilise deux ancres dans chacune des trois phases.",
      helpThreat:
        `La rangée ou colonne rouge sera frappée quand le compteur arrive à zéro. Chaque déplacement ou impulsion fait avancer le compteur; l'impact survient toutes les ${actionsPerStrike} actions.`,
      helpShield:
        `Le bouclier annule le prochain impact sans consommer une action. Tu en as deux et ${maxCoherence} unités de cohérence.`,
      start: "ENTRER DANS L'ARÈNE",
      pulse: "PULSER L'ANCRE",
      shield: "BOUCLIER",
      next: "CONTINUER VERS LE NIVEAU 21",
      reset: "Réinitialiser",
      ready:
        "Déplace-toi d'une case à la fois. Évite la ligne rouge, puis pulse l'ancre active.",
      movement:
        "Choisis une case voisine. Les cases rouges seront frappées après le compte à rebours.",
      wrongMove: "Tu ne peux avancer que d'une case orthogonale.",
      hit: "La fracture t'a atteint. Tu es repoussé au point d'ancrage.",
      shieldHit: "Le bouclier a absorbé l'impact.",
      anchor: "Ancre stabilisée. La suivante est maintenant active.",
      phaseSuccess: "Armure brisée. L'arène se recompose.",
      victory: "L'Archonte est vaincu. La Clé 02 est à toi.",
      defeated:
        "Ta cohérence s'est effondrée. Réinitialise le combat pour recommencer.",
      shieldReady: "Bouclier actif : le prochain impact est annulé.",
      shieldEmpty: "Il ne te reste plus de bouclier.",
      anchorReady: "Ancre atteinte. Appuie sur « Pulser l'ancre ».",
      rewardError:
        "Impossible d'enregistrer la Clé 02. Réinitialise et réessaie.",
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
      phase: (index) =>
        `PHASE ${index + 1} // ${["CARTOGRAPHIER L'IMPACT", "DÉJOUER LE MIROIR", "SCELLER LA FRACTURE"][index]}`,
      phaseIntro: (index) =>
        `Phase ${index + 1} : stabilise les deux ancres, puis évite la prochaine frappe.`,
      hitCount: (count) => `${count} unités de cohérence restantes`,
      shieldCount: (count) => `BOUCLIER (${count})`,
      progress: (count) => `${count} / ${totalAnchors}`,
      footer: "ÉCHO // FRACTURES ACTIVES",
      counter: "BOSS // 02",
    },
    en: {
      part: "PART 4 // RESONANCE",
      level: "KEY 02 // WARDEN",
      eyebrow: "CLEE_02 // ARCHON OF FRACTURES",
      title: "The Architect of the Void",
      description:
        "The arena changes with every phase. Cross its attack lines, reach the anchors, and break all three armor layers before your coherence collapses.",
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
      helpPulse:
        "Reach the active ◆ anchor, then press “Pulse anchor”. Stabilize two anchors in each of the three phases.",
      helpThreat:
        `The red row or column will be struck when the countdown reaches zero. Each move or pulse advances it; a strike comes every ${actionsPerStrike} actions.`,
      helpShield:
        `A ward cancels the next impact without using an action. You have two wards and ${maxCoherence} coherence units.`,
      start: "ENTER THE ARENA",
      pulse: "PULSE ANCHOR",
      shield: "WARD",
      next: "CONTINUE TO LEVEL 21",
      reset: "Reset",
      ready:
        "Move one tile at a time. Avoid the red line, then pulse the active anchor.",
      movement:
        "Choose an adjacent tile. Red tiles will be hit when the countdown ends.",
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
      phase: (index) =>
        `PHASE ${index + 1} // ${["MAP THE IMPACT", "OUTPLAY THE MIRROR", "SEAL THE FRACTURE"][index]}`,
      phaseIntro: (index) =>
        `Phase ${index + 1}: stabilize both anchors, then avoid the next strike.`,
      hitCount: (count) => `${count} coherence units remaining`,
      shieldCount: (count) => `WARD (${count})`,
      progress: (count) => `${count} / ${totalAnchors}`,
      footer: "ECHO // ACTIVE FRACTURES",
      counter: "BOSS // 02",
    },
  }[language];
  Object.entries(copy).forEach(([key, value]) => {
    if (typeof value === "string") copy[key] = value.replace(/02/g, keyCode);
  });
  copy.part = document.body.dataset.partLabel || copy.part;
  copy.next =
    language === "en"
      ? `CONTINUE TO LEVEL ${document.body.dataset.nextLevel || nextLevel}`
      : `CONTINUER VERS LE NIVEAU ${document.body.dataset.nextLevel || nextLevel}`;
  copy.helpPulse =
    language === "en"
      ? `Reach the active ◆ anchor, then press “Pulse anchor”. Stabilize ${anchorsPerPhase} anchors in each of the three phases.`
      : `Rejoins l'ancre active ◆ puis appuie sur « Pulser l'ancre ». Stabilise ${anchorsPerPhase} ancres dans chacune des trois phases.`;
  copy.phaseIntro = (index) =>
    language === "en"
      ? `Phase ${index + 1}: stabilize ${anchorsPerPhase} anchors, then avoid the next strike.`
      : `Phase ${index + 1} : stabilise ${anchorsPerPhase} ancres, puis évite la prochaine frappe.`;
  if (keyNumber === 4) {
    copy.title =
      language === "en" ? "The Rift Cartographer" : "Le Cartographe des Failles";
    copy.eyebrow =
      language === "en"
        ? `KEY_${keyCode} // RIFT CARTOGRAPHER`
        : `CLÉ_${keyCode} // CARTOGRAPHE DES FAILLES`;
    copy.description =
      language === "en"
        ? "Three shifting maps overlap. Stabilize three anchors in every phase, with six coherence units and only three actions before each strike."
        : "Trois cartes mouvantes se superposent. Stabilise trois ancres par phase avec six unités de cohérence et seulement trois actions avant chaque frappe.";
  } else if (keyNumber >= 5) {
    copy.title =
      language === "en" ? "The Convergence Matrix" : "La Matrice de Convergence";
    copy.eyebrow =
      language === "en"
        ? `KEY_${keyCode} // CONVERGENCE MATRIX`
        : `CLÉ_${keyCode} // MATRICE DE CONVERGENCE`;
    copy.description =
      language === "en"
        ? "The arena is collapsing around four anchor routes. Stabilize three anchors in every phase, keep five coherence units, and react within two actions before each strike."
        : "L'arène s'effondre autour de quatre routes d'ancres. Stabilise trois ancres par phase, conserve cinq unités de cohérence et réagis en deux actions avant chaque frappe.";
  }

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
  const keyHud = $("keyHud");
  const keyCount = $("keyCount");
  const keyHudNote = $("keyHudNote");
  const keyHudSlot = $("keyHudSlot");
  const keySlotImage = keyHudSlot.querySelector("img");
  const core = $("bossCore");
  const rewardKey = $("bossRewardKey");
  const size = 5;
  const home = 22;
  const phases = [
    {
      spawn: home,
      walls: [6, 8, 16, 18],
      anchors: [15, 4],
      strikes: [
        ["row", 4],
        ["column", 0],
        ["row", 1],
        ["column", 4],
      ],
    },
    {
      spawn: home,
      walls: [1, 5, 9, 15, 19, 23],
      anchors: [10, 2],
      strikes: [
        ["column", 2],
        ["row", 2],
        ["column", 4],
        ["row", 0],
      ],
    },
    {
      spawn: 24,
      walls: [2, 6, 8, 16, 18],
      anchors: [0, 20],
      strikes: [
        ["row", 3],
        ["column", 1],
        ["row", 4],
        ["column", 3],
        ["row", 1],
        ["column", 0],
      ],
    },
  ];
  const extraAnchors = [0, 24, 2, 14, 10, 4, 20, 1, 21, 3, 23];
  phases.forEach((entry) => {
    const additional = extraAnchors.filter(
      (cell) =>
        !entry.walls.includes(cell) &&
        cell !== entry.spawn &&
        !entry.anchors.includes(cell),
    );
    entry.anchors.push(
      ...additional.slice(0, anchorsPerPhase - entry.anchors.length),
    );
  });
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
  $("levelProgress").setAttribute(
    "aria-label",
    copy.part,
  );
  keyHud.setAttribute("aria-label", copy.keyHudAria);
  keyCount.textContent = `${keyNumber} / 6`;
  keySlotImage.src = keySrc;
  rewardKey.src = keySrc;
  for (let level = levelStart; level <= levelEnd; level += 1) {
    const marker = document.createElement("span");
    marker.className = `level-square${level === levelEnd ? " current" : ""}`;
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
    keyCount.textContent = `${keyNumber} / 6`;
    if (!keys.includes(keyId)) return;
    keyHud.classList.add("is-unlocked");
    keyHudNote.textContent = copy.keyRecovered;
    keyHudSlot.setAttribute("aria-label", copy.keySlotAria);
    keyHudSlot.removeAttribute("aria-hidden");
    keyHudSlot.classList.add("is-visible");
    core.classList.add("is-unlocked", "is-collected");
  };

  const currentStrike = () =>
    phases[phase].strikes[strikeIndex % phases[phase].strikes.length];

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
      ]
        .filter(Boolean)
        .join(" ");
      life.setAttribute("aria-hidden", "true");
      livesReadout.appendChild(life);
    }
    livesReadout.setAttribute("aria-label", copy.hitCount(coherence));
  };

  const fragments = window.EchoesKeyFragments.mount({
    keyNumber,
    src: keySrc,
    core,
    before: document.querySelector(".boss02-actions"),
  });

  const render = () => {
    fragments.set(panel.classList.contains("is-victory") ? 3 : phase);
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
      cell.textContent = isWall
        ? "▩"
        : isPlayer
          ? "◉"
          : isSealed
            ? "✓"
            : isActiveAnchor
              ? "◆"
              : isAnchor
                ? "◇"
                : "";
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
      cell.setAttribute(
        "aria-label",
        `${language === "en" ? "Row" : "Rangée"} ${Math.floor(index / size) + 1}, ${language === "en" ? "column" : "colonne"} ${(index % size) + 1}: ${description}${isThreatened ? `, ${copy.incoming.toLowerCase()}` : ""}`,
      );
    });
    const inAnchor = player === activeAnchor;
    pulseButton.disabled = !started || ended || !inAnchor;
    shieldButton.disabled = !started || ended || shields === 0 || shieldArmed;
    shieldButton.textContent = `${copy.shieldCount(shields)}${shieldArmed ? " ✓" : ""}`;
    phaseReadout.textContent = copy.phase(phase);
    armorReadout.textContent = copy.progress(armorBroken);
    const [axis, lane] = strike;
    strikeReadout.textContent =
      axis === "row" ? copy.hitRow(lane) : copy.hitColumn(lane);
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
    fragments.set(3);
    $("systemMessage").textContent = copy.victory.toUpperCase();
    window.EchoesSave?.saveProgress({
      currentPage: `level-${nextLevel}`,
      currentLevel: nextLevel,
    });
    keyCount.textContent = `${keyNumber} / 6`;
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
    nextButton.hidden = true;
    setStatus(copy.victory, "success");
    window.setTimeout(() => {
      window.EchoesKeyFragments.playCinematic({
        keyNumber,
        src: keySrc,
        onComplete: () => {
          if (!window.EchoesSave?.unlockKey?.(keyId)) {
            setStatus(copy.rewardError, "error");
            render();
            return;
          }
          if (!window.EchoesLevels?.markCompleted?.(`boss-${keyCode}`)) {
            setStatus(copy.rewardError, "error");
            render();
            return;
          }
          nextButton.hidden = false;
        },
        onContinue: () => nextButton.click(),
      });
    }, 2000);
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
    const rowDistance = Math.abs(
      Math.floor(player / size) - Math.floor(index / size),
    );
    const columnDistance = Math.abs((player % size) - (index % size));
    if (rowDistance + columnDistance !== 1) {
      setStatus(copy.wrongMove, "error");
      return;
    }
    player = index;
    const outcome = consumeAction();
    if (!ended) {
      const message =
        player === phases[phase].anchors[anchorIndex]
          ? copy.anchorReady
          : copy.movement;
      setStatus(outcome?.message || message, outcome?.variant || "");
    }
  }

  const activateAnchor = () => {
    if (!started || ended || player !== phases[phase].anchors[anchorIndex])
      return;
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
      setStatus(
        outcome?.message || copy.phaseSuccess,
        outcome?.variant || "success",
      );
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
    if (
      (delta === -1 || delta === 1) &&
      Math.floor(target / size) !== Math.floor(player / size)
    )
      return;
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
    window.location.href = nextUrl;
  });

  buildBoard();
  updateKeyHud();
  resetButton.textContent = copy.reset;
  render();
})();
