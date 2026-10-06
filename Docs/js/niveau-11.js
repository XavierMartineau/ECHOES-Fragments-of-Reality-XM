/* NIVEAU 11 // LE CERCLE BRISÉ
 * Three rounds of concentric rings. Each ring has one gap; rotate every ring
 * until all gaps line up under the top marker. */
(() => {
  const board = document.getElementById("ringSvg");
  if (!board) return;

  const language =
    localStorage.getItem("echoes-language") === "en" ? "en" : "fr";
  const copy = {
    fr: {
      part: "PARTIE 2 // FRACTURES",
      level: "NIVEAU 11",
      eyebrow: "Fragment 011 // Le cercle brisé",
      title: "Le cercle brisé",
      description:
        "Suis le cercle brisé. Fais pivoter chaque anneau jusqu'à ce que toutes les ouvertures s'alignent sous la marque lumineuse.",
      systemInput:
        "SYSTEME:: CERCLE FRACTURE // CLE_01 DETECTEE // ANNEAUX EN ATTENTE",
      puzzleKicker: "PUZZLE // ALIGNEMENT",
      puzzleTitle: "Anneaux de résonance",
      footer: "ÉCHO // FRACTURES ACTIVES",
      start: "DÉMARRER LE PUZZLE",
      next: "CONTINUER VERS LE NIVEAU 12",
      reset: "Réinitialiser",
      ready: "Fais pivoter les anneaux pour aligner les ouvertures.",
      playing: "Aligne toutes les ouvertures sous la marque.",
      round: "Cercle stabilisé. Un anneau supplémentaire apparaît.",
      success: "Le cercle est reconstitué. Le chemin vers la Partie 2 s'ouvre.",
      ring: "Anneau",
      rotate: "pivoter",
      aria: "Anneaux à faire pivoter",
      controls: "Contrôles des anneaux",
      systemSuccess: "SYSTEME:: CERCLE 011 RECONSTITUE // PROTOCOLE SUIVANT DEBLOQUE",
    },
    en: {
      part: "PART 2 // FRACTURES",
      level: "LEVEL 11",
      eyebrow: "Fragment 011 // The broken circle",
      title: "The broken circle",
      description:
        "Follow the broken circle. Rotate each ring until every opening lines up under the glowing mark.",
      systemInput:
        "SYSTEM:: FRACTURED CIRCLE // KEY_01 DETECTED // RINGS WAITING",
      puzzleKicker: "PUZZLE // ALIGNMENT",
      puzzleTitle: "Resonance rings",
      footer: "ECHO // ACTIVE FRACTURES",
      start: "START PUZZLE",
      next: "CONTINUE TO LEVEL 12",
      reset: "Reset",
      ready: "Rotate the rings to align the openings.",
      playing: "Align every opening under the mark.",
      round: "Circle stabilized. An extra ring appears.",
      success: "The circle is whole again. The path into Part 2 opens.",
      ring: "Ring",
      rotate: "rotate",
      aria: "Rings to rotate",
      controls: "Ring controls",
      systemSuccess: "SYSTEM:: CIRCLE 011 RESTORED // NEXT PROTOCOL UNLOCKED",
    },
  }[language];

  const $ = (id) => document.getElementById(id);
  const status = $("puzzleStatus");
  const readout = $("progressReadout");
  const controls = $("ringControls");
  const startButton = $("startPuzzleButton");
  const resetButton = $("resetButton");
  const nextButton = $("nextLevelButton");
  const systemMessage = $("systemMessage");
  const ringCounts = [2, 3, 4];
  const radii = [86, 70, 54, 38];
  const STEP = 45;
  const SVG_NS = "http://www.w3.org/2000/svg";

  document.documentElement.lang = language;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const value = copy[element.dataset.i18n];
    if (typeof value === "string") element.textContent = value;
  });
  board.setAttribute("aria-label", copy.aria);
  controls.setAttribute("aria-label", copy.controls);
  startButton.textContent = copy.start;
  nextButton.textContent = copy.next;
  resetButton.textContent = copy.reset;
  status.textContent = copy.ready;

  let round = 0;
  let started = false;
  let solved = false;
  let rings = [];

  const setStatus = (message, state = "") => {
    status.textContent = message;
    status.className = `puzzle-status${state ? ` ${state}` : ""}`;
  };

  const clearRings = () => {
    board.querySelectorAll(".ring-group").forEach((node) => node.remove());
    controls.replaceChildren();
    rings = [];
  };

  const isAligned = () => rings.every((ring) => ring.angle % 360 === 0);

  const render = (ring) => {
    ring.group.style.transform = `rotate(${ring.angle}deg)`;
    ring.group.classList.toggle("is-aligned", ring.angle % 360 === 0);
  };

  const rotateRing = (ring) => {
    if (!started || solved) return;
    ring.angle += STEP;
    render(ring);
    if (isAligned()) completeRound();
  };

  const buildRound = () => {
    clearRings();
    const count = ringCounts[round];
    for (let index = 0; index < count; index += 1) {
      const group = document.createElementNS(SVG_NS, "g");
      group.setAttribute("class", "ring-group");
      group.setAttribute("tabindex", "0");
      group.setAttribute("role", "button");
      const label = `${copy.ring} ${index + 1} - ${copy.rotate}`;
      group.setAttribute("aria-label", label);
      const circle = document.createElementNS(SVG_NS, "circle");
      circle.setAttribute("class", `ring-arc ring-arc-${index}`);
      circle.setAttribute("cx", "100");
      circle.setAttribute("cy", "100");
      circle.setAttribute("r", String(radii[index]));
      circle.setAttribute("pathLength", "360");
      circle.setAttribute("stroke-dasharray", "320 40");
      circle.setAttribute("transform", "rotate(-70 100 100)");
      group.appendChild(circle);
      board.appendChild(group);

      let turns = Math.floor(Math.random() * 7) + 1;
      if (index === 0 && count > 1 && turns % 8 === 0) turns = 1;
      const ring = { group, angle: turns * STEP };
      rings.push(ring);
      render(ring);

      group.addEventListener("click", () => rotateRing(ring));
      group.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          rotateRing(ring);
        }
      });

      const button = document.createElement("button");
      button.type = "button";
      button.className = `ring-control ring-control-${index}`;
      button.textContent = `${copy.ring} ${index + 1} ↻`;
      button.setAttribute("aria-label", label);
      button.addEventListener("click", () => rotateRing(ring));
      controls.appendChild(button);
    }
    // A random start can already be solved; nudge one ring if so.
    if (isAligned()) {
      rings[0].angle += STEP;
      render(rings[0]);
    }
  };

  const saveCompletion = () => {
    window.EchoesSave?.saveProgress({
      currentPage: "level-11",
      currentLevel: 11,
    });
  };

  function completeRound() {
    round += 1;
    readout.textContent = `${round} / ${ringCounts.length}`;
    if (round >= ringCounts.length) {
      solved = true;
      board.classList.add("is-solved");
      setStatus(copy.success, "success");
      systemMessage.textContent = copy.systemSuccess;
      nextButton.hidden = false;
      startButton.disabled = true;
      saveCompletion();
      return;
    }
    setStatus(copy.round, "success");
    window.setTimeout(() => {
      buildRound();
      if (started && !solved) setStatus(copy.playing);
    }, 900);
  }

  const reset = () => {
    round = 0;
    started = false;
    solved = false;
    board.classList.remove("is-solved");
    readout.textContent = `0 / ${ringCounts.length}`;
    nextButton.hidden = true;
    startButton.disabled = false;
    setStatus(copy.ready);
    buildRound();
  };

  startButton.addEventListener("click", () => {
    started = true;
    setStatus(copy.playing);
  });
  resetButton.addEventListener("click", reset);
  nextButton.addEventListener("click", () => {
    window.location.href = "niveau-12.html";
  });

  reset();
})();
