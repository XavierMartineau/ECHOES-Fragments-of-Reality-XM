(() => {
  const svg = document.getElementById("bossSvg");
  if (!svg) return;

  const $ = (id) => document.getElementById(id);
  const language = localStorage.getItem("echoes-language") === "en" ? "en" : "fr";
  const text = {
    fr: {
      part: "PARTIE 3 // ÉCLIPSE",
      level: "CLÉE_03 // OCCULTEUR",
      eyebrow: "CLEE_03 // GARDIEN DE L'ÉCLIPSE",
      title: "L'Occulteur",
      description: "Trois couronnes d'ombre étouffent le soleil. Aligne leurs brèches sur le rayon, au bon instant, avant que ta cohérence ne s'éteigne.",
      kicker: "COMBAT // TIMING ORBITAL",
      arena: "La couronne noire",
      lives: "COHÉRENCE",
      helpTitle: "COMMENT COMBATTRE",
      help: [
        "Entre dans l'éclipse : les anneaux se mettent à tourner autour du soleil.",
        "Appuie sur « Aligner » (ou sur Espace) quand la brèche de l'anneau brillant passe sous le repère ▼ vert. Les anneaux se verrouillent du plus extérieur au plus intérieur.",
        "Une erreur coûte 1 cohérence et libère l'anneau précédent.",
        "Phase 1 : chaque verrouillage accélère les anneaux restants. Phases 2 et 3 : chaque verrouillage inverse leur sens, et en phase 3 les anneaux changent de sens au hasard.",
      ],
      start: "ENTRER DANS L'ÉCLIPSE",
      lock: "ALIGNER (ESPACE)",
      next: "CONTINUER VERS LE NIVEAU 31",
      reset: "Réinitialiser",
      save: "SAUVEGARDER",
      saved: "SAUVEGARDÉ",
      keyLabel: "RÉSONANCES",
      keyNote: "CLÉ 03 // À RÉCUPÉRER",
      keyRecovered: "CLÉ 03 // RÉCUPÉRÉE",
      keyAlt: "Clé de résonance 03",
      footer: "ÉCHO // ÉCLIPSE TOTALE",
      assembly: "CLÉ 03 // ASSEMBLAGE",
      cineTitle: "CLÉ 03 RÉCUPÉRÉE",
      cineSub: "Les trois fragments se rejoignent. L'éclipse est levée.",
      phase: (n, total) => `PHASE ${n} / ${total}`,
      ready: "Observe la rotation, puis aligne chaque brèche sur le repère vert.",
      go: (n) => `Phase ${n} : à toi de jouer.`,
      locked: "Anneau verrouillé.",
      missed: "Raté ! L'ombre se resserre : −1 cohérence.",
      missedUnlock: "Raté ! −1 cohérence, l'anneau précédent se libère.",
      twistSpeed: "Les anneaux restants accélèrent.",
      twistFlip: "Les anneaux restants s'inversent.",
      phaseDone: (n) => `Couronne ${n} brisée.`,
      victory: "L'éclipse se dissipe. La clé 03 est à toi.",
      defeated: "Cohérence épuisée. L'éclipse t'a englouti.",
      saveError: "Impossible de sauvegarder la clé.",
      system: "SYSTEME:: ÉCLIPSE TOTALE // TROIS COURONNES",
    },
    en: {
      part: "PART 3 // ECLIPSE",
      level: "KEY_03 // OCCULTER",
      eyebrow: "KEY_03 // WARDEN OF THE ECLIPSE",
      title: "The Occulter",
      description: "Three crowns of shadow smother the sun. Align their gaps with the beam at the right moment before your coherence fades.",
      kicker: "COMBAT // ORBITAL TIMING",
      arena: "The black crown",
      lives: "COHERENCE",
      helpTitle: "HOW TO FIGHT",
      help: [
        "Enter the eclipse: the rings start spinning around the sun.",
        "Press “Align” (or Space) when the gap of the glowing ring passes under the green ▼ marker. Rings lock from outermost to innermost.",
        "A mistake costs 1 coherence and frees the previous ring.",
        "Phase 1: every lock speeds up the remaining rings. Phases 2 and 3: every lock reverses their direction, and in phase 3 rings randomly change direction.",
      ],
      start: "ENTER THE ECLIPSE",
      lock: "ALIGN (SPACE)",
      next: "CONTINUE TO LEVEL 31",
      reset: "Reset",
      save: "SAVE",
      saved: "SAVED",
      keyLabel: "RESONANCES",
      keyNote: "KEY 03 // TO RECOVER",
      keyRecovered: "KEY 03 // RECOVERED",
      keyAlt: "Resonance key 03",
      footer: "ECHO // TOTAL ECLIPSE",
      assembly: "KEY 03 // ASSEMBLY",
      cineTitle: "KEY 03 RECOVERED",
      cineSub: "The three fragments join together. The eclipse is lifted.",
      phase: (n, total) => `PHASE ${n} / ${total}`,
      ready: "Watch the rotation, then align each gap with the green marker.",
      go: (n) => `Phase ${n}: your move.`,
      locked: "Ring locked.",
      missed: "Missed! The shadow tightens: −1 coherence.",
      missedUnlock: "Missed! −1 coherence, the previous ring is freed.",
      twistSpeed: "The remaining rings speed up.",
      twistFlip: "The remaining rings reverse.",
      phaseDone: (n) => `Crown ${n} broken.`,
      victory: "The eclipse lifts. Key 03 is yours.",
      defeated: "Coherence depleted. The eclipse swallowed you.",
      saveError: "Unable to save the key.",
      system: "SYSTEM:: TOTAL ECLIPSE // THREE CROWNS",
    },
  }[language];

  const phases = [
    { gap: 30, speeds: [70, 95, 120, 150], twist: "speed" },
    { gap: 24, speeds: [80, 105, 135, 165, 195], twist: "flip" },
    { gap: 18, speeds: [90, 120, 150, 185, 220, 255], twist: "flip" },
  ];
  const maxLives = 4;
  const ringStroke = 15;
  const NS = "http://www.w3.org/2000/svg";

  const status = $("puzzleStatus");
  const startButton = $("startBossButton");
  const lockButton = $("lockButton");
  const nextButton = $("nextLevelButton");
  const resetButton = $("resetButton");
  const saveButton = $("bossSaveButton");
  const panel = document.querySelector(".boss03-panel");
  const keyHud = $("keyHud");
  const keyHudSlot = $("keyHudSlot");
  const ringsLayer = $("rings");
  const beam = $("beam");
  const arena = $("arena");
  const cinematic = $("keyCinematic");
  document.body.appendChild(cinematic);
  const coreKey = $("coreKey");
  const pieceHeight = 87;
  const pieceView = (index) => `0 ${index * pieceHeight} 180 ${pieceHeight}`;
  const makePiece = (index, className) => {
    const holder = document.createElementNS(NS, "svg");
    holder.setAttribute("viewBox", pieceView(index));
    holder.setAttribute("class", className);
    holder.setAttribute("aria-hidden", "true");
    const image = document.createElementNS(NS, "image");
    image.setAttribute("href", "../../assets/images/key-03-usb.svg");
    image.setAttribute("width", "180");
    image.setAttribute("height", "260");
    holder.appendChild(image);
    return holder;
  };
  const slots = [0, 1, 2].map((index) => {
    const slot = document.createElement("span");
    slot.className = "boss03-slot";
    slot.appendChild(makePiece(index, "boss03-slot-piece"));
    $("assemblySlots").appendChild(slot);
    return slot;
  });

  let phase = 0;
  let earned = 0;
  let rings = [];
  let lives = maxLives;
  let running = false;
  let ended = false;
  let lastTime = 0;
  let frame = 0;
  let speedBoost = 1;

  const setText = (id, value) => { $(id).textContent = value; };
  document.documentElement.lang = language;
  setText("bossPart", text.part);
  setText("bossLevel", text.level);
  setText("bossEyebrow", text.eyebrow);
  setText("bossTitle", text.title);
  setText("bossDescription", text.description);
  setText("bossKicker", text.kicker);
  setText("arenaTitle", text.arena);
  setText("livesLabel", text.lives);
  setText("helpTitle", text.helpTitle);
  setText("keyLabel", text.keyLabel);
  setText("bossFooter", text.footer);
  setText("assemblyLabel", text.assembly);
  setText("cinematicTitle", text.cineTitle);
  setText("cinematicSub", text.cineSub);
  setText("cineContinue", text.next);
  setText("systemMessage", text.system);
  saveButton.textContent = text.save;
  resetButton.textContent = text.reset;
  nextButton.textContent = text.next;
  $("helpList").replaceChildren(...text.help.map((line) => {
    const item = document.createElement("li");
    item.textContent = line;
    return item;
  }));
  $("levelProgress").setAttribute("aria-label", language === "en" ? "Part 3 progress" : "Progression de la Partie 3");
  for (let level = 21; level <= 30; level += 1) {
    const marker = document.createElement("span");
    marker.className = "level-square";
    marker.setAttribute("aria-hidden", "true");
    $("levelProgress").appendChild(marker);
  }

  const setStatus = (message, variant = "") => {
    status.textContent = message;
    status.className = `puzzle-status${variant ? ` ${variant}` : ""}`;
  };

  const point = (radius, degrees) => {
    const radians = (degrees * Math.PI) / 180;
    return [radius * Math.sin(radians), -radius * Math.cos(radians)];
  };

  const arcPath = (radius, gap) => {
    const half = gap / 2;
    const [x1, y1] = point(radius, half);
    const [x2, y2] = point(radius, 360 - half);
    return `M${x1.toFixed(2)} ${y1.toFixed(2)}A${radius} ${radius} 0 1 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  };

  const normalize = (degrees) => ((((degrees + 180) % 360) + 360) % 360) - 180;

  const updateKeyHud = () => {
    const keys = window.EchoesSave?.getKeys?.() || [];
    setText("keyCount", "3 / 6");
    const owned = keys.includes("resonance-3");
    keyHud.classList.toggle("is-unlocked", owned);
    setText("keyHudNote", owned ? text.keyRecovered : text.keyNote);
    keyHudSlot.classList.toggle("is-visible", owned);
    if (owned) {
      keyHudSlot.removeAttribute("aria-hidden");
      keyHudSlot.querySelector("img").alt = text.keyAlt;
    }
    return owned;
  };

  const renderLives = () => {
    const holder = $("livesReadout");
    holder.replaceChildren();
    for (let index = 0; index < maxLives; index += 1) {
      const life = document.createElement("span");
      life.className = `boss03-life${index >= lives ? " is-lost" : ""}`;
      holder.appendChild(life);
    }
    holder.setAttribute("aria-label", `${lives} / ${maxLives}`);
  };

  const buildRings = () => {
    const config = phases[phase];
    const count = config.speeds.length;
    ringsLayer.replaceChildren();
    rings = config.speeds.map((speed, index) => {
      const radius = count === 1 ? 120 : 170 - (100 * index) / (count - 1);
      const group = document.createElementNS(NS, "g");
      group.setAttribute("class", "boss03-ring");
      const track = document.createElementNS(NS, "circle");
      track.setAttribute("r", radius);
      track.setAttribute("class", "boss03-ring-track");
      const arc = document.createElementNS(NS, "path");
      arc.setAttribute("d", arcPath(radius, config.gap));
      arc.setAttribute("class", "boss03-ring-arc");
      arc.setAttribute("stroke-width", ringStroke);
      const spin = document.createElementNS(NS, "g");
      spin.appendChild(arc);
      [config.gap / 2, 360 - config.gap / 2].forEach((edge) => {
        const [x, y] = point(radius, edge);
        const dot = document.createElementNS(NS, "circle");
        dot.setAttribute("cx", x.toFixed(2));
        dot.setAttribute("cy", y.toFixed(2));
        dot.setAttribute("r", 5);
        dot.setAttribute("class", "boss03-ring-edge");
        spin.appendChild(dot);
      });
      group.append(track, spin);
      ringsLayer.appendChild(group);
      return {
        spin,
        group,
        speed,
        dir: index % 2 === 0 ? 1 : -1,
        angle: ((index * 97 + phase * 41) % 300) + 40,
        locked: false,
      };
    });
    speedBoost = 1;
  };

  const activeIndex = () => rings.findIndex((ring) => !ring.locked);

  const draw = () => {
    const current = activeIndex();
    rings.forEach((ring, index) => {
      ring.spin.setAttribute("transform", `rotate(${ring.angle.toFixed(2)})`);
      ring.group.classList.toggle("is-locked", ring.locked);
      ring.group.classList.toggle("is-active", running && index === current);
    });
    setText("phaseReadout", text.phase(Math.min(phase + 1, phases.length), phases.length));
    coreKey.setAttribute("y", String(-20 - Math.min(phase, 2) * pieceHeight * 0.4667));
    slots.forEach((slot, index) => slot.classList.toggle("is-earned", index < earned));
    setText("assemblyCount", `${earned} / 3`);
    lockButton.disabled = !running;
    renderLives();
  };

  const tick = (now) => {
    if (!running) return;
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    const factor = speedBoost;
    rings.forEach((ring) => {
      if (phase === 2 && !ring.locked && Math.random() < dt / 2.2) ring.dir *= -1;
      if (!ring.locked) ring.angle = normalize(ring.angle + ring.dir * ring.speed * factor * dt);
    });
    draw();
    frame = requestAnimationFrame(tick);
  };

  const flash = (className) => {
    panel.classList.remove(className);
    void panel.offsetWidth;
    panel.classList.add(className);
  };

  const startPhase = () => {
    buildRings();
    running = true;
    lastTime = performance.now();
    setStatus(text.go(phase + 1));
    draw();
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(tick);
  };

  const playCinematic = () => {
    const keyHolder = $("cineKey");
    keyHolder.replaceChildren(...[0, 1, 2].map((index) => makePiece(index, `boss03-cine-piece piece-${index}`)));
    const sparks = $("cineSparks");
    sparks.replaceChildren();
    for (let index = 0; index < 36; index += 1) {
      const spark = document.createElement("i");
      const angle = (index / 36) * Math.PI * 2;
      const distance = 160 + Math.random() * 220;
      spark.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
      spark.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
      spark.style.setProperty("--delay", `${3.1 + Math.random() * 0.5}s`);
      spark.style.setProperty("--hue", ["#ff4fd8", "#ffd24d", "#c6ff4d", "#38f2ff"][index % 4]);
      sparks.appendChild(spark);
    }
    cinematic.classList.remove("is-playing");
    cinematic.hidden = false;
    void cinematic.offsetWidth;
    cinematic.classList.add("is-playing");
    $("cineContinue").hidden = true;
    window.setTimeout(() => {
      $("cineContinue").hidden = false;
      $("cineContinue").focus();
    }, 4300);
  };

  const finish = () => {
    running = false;
    ended = true;
    cancelAnimationFrame(frame);
    panel.classList.add("is-victory");
    setText("systemMessage", text.victory.toUpperCase());
    const unlocked = window.EchoesSave?.unlockKey?.("resonance-3");
    if (!unlocked) {
      setStatus(text.saveError, "error");
      draw();
      return;
    }
    window.EchoesSave?.saveProgress({ currentPage: "level-31", currentLevel: 31 });
    updateKeyHud();
    playCinematic();
    startButton.hidden = true;
    nextButton.hidden = false;
    setStatus(text.victory, "success");
    nextButton.focus();
    draw();
  };

  const completePhase = () => {
    running = false;
    cancelAnimationFrame(frame);
    beam.classList.remove("is-firing");
    void beam.getBoundingClientRect();
    beam.classList.add("is-firing");
    flash("is-strike");
    earned = phase + 1;
    coreKey.classList.remove("is-hit");
    void coreKey.getBoundingClientRect();
    coreKey.classList.add("is-hit");
    slots[phase].classList.remove("is-pop");
    void slots[phase].offsetWidth;
    slots[phase].classList.add("is-pop");
    setStatus(text.phaseDone(phase + 1), "success");
    draw();
    window.setTimeout(() => {
      if (ended) return;
      phase += 1;
      if (phase >= phases.length) finish();
      else startPhase();
    }, 1500);
  };

  const lose = () => {
    running = false;
    ended = true;
    cancelAnimationFrame(frame);
    panel.classList.add("is-defeat");
    setStatus(text.defeated, "error");
    draw();
  };

  const align = () => {
    if (!running) return;
    const index = activeIndex();
    if (index < 0) return;
    const ring = rings[index];
    const tolerance = phases[phase].gap / 2;
    if (Math.abs(normalize(ring.angle)) <= tolerance) {
      ring.angle = 0;
      ring.locked = true;
      if (activeIndex() < 0) {
        draw();
        completePhase();
        return;
      }
      const twist = phases[phase].twist;
      if (twist === "speed") speedBoost *= 1.2;
      if (twist === "flip") rings.forEach((other) => { if (!other.locked) other.dir *= -1; });
      setStatus(`${text.locked} ${twist === "speed" ? text.twistSpeed : twist === "flip" ? text.twistFlip : ""}`.trim());
      flash("is-lock");
      draw();
      return;
    }
    lives -= 1;
    flash("is-hit");
    if (lives <= 0) {
      lose();
      return;
    }
    const previous = index - 1;
    rings.forEach((other) => { if (!other.locked) other.angle = normalize(other.angle + 90 + Math.random() * 180); });
    if (previous >= 0) {
      rings[previous].locked = false;
      rings[previous].angle = normalize(rings[previous].angle + 180);
      setStatus(text.missedUnlock, "error");
    } else {
      setStatus(text.missed, "error");
    }
    draw();
  };

  const reset = () => {
    cancelAnimationFrame(frame);
    phase = 0;
    earned = 0;
    cinematic.hidden = true;
    cinematic.classList.remove("is-playing");
    lives = maxLives;
    running = false;
    ended = false;
    panel.classList.remove("is-victory", "is-defeat", "is-strike", "is-hit", "is-lock");
    const owned = updateKeyHud();
    startButton.hidden = false;
    nextButton.hidden = !owned;
    startButton.textContent = text.start;
    lockButton.textContent = text.lock;
    buildRings();
    setStatus(text.ready);
    setText("systemMessage", text.system);
    draw();
  };

  startButton.addEventListener("click", () => {
    if (running || ended) return;
    startPhase();
  });
  lockButton.addEventListener("click", align);
  resetButton.addEventListener("click", reset);
  $("cineContinue").addEventListener("click", () => {
    window.location.href = "../partie-4_niveau-31_à_40/niveau-31.html";
  });
  nextButton.addEventListener("click", () => {
    window.location.href = "../partie-4_niveau-31_à_40/niveau-31.html";
  });
  saveButton.addEventListener("click", () => {
    if (!window.EchoesSave?.saveProgress({ currentPage: "boss-03", currentLevel: 30 })) return;
    saveButton.textContent = text.saved;
    window.setTimeout(() => { saveButton.textContent = text.save; }, 1800);
  });
  document.addEventListener("keydown", (event) => {
    if (event.code !== "Space" || event.repeat) return;
    const tag = event.target?.tagName;
    if (tag === "BUTTON" || tag === "SUMMARY" || tag === "INPUT") return;
    event.preventDefault();
    align();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) return;
    lastTime = performance.now();
  });

  reset();
})();
