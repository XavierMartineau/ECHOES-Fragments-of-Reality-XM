// LEVEL SELECT HUB // grille des niveaux, progression globale, réinitialisation.
(() => {
  const save = window.EchoesSave;
  const levels = window.EchoesLevels;
  const language = localStorage.getItem("echoes-language") === "en" ? "en" : "fr";

  const text = {
    fr: {
      player: "JOUEUR",
      kicker: "CAMPAGNE // SÉLECTION DES NIVEAUX",
      title: "Choisis ton niveau",
      continue: "Continuer",
      intro: "Revoir l'introduction",
      switchUser: "Changer de joueur",
      reset: "Réinitialiser la progression",
      resetTitle: "Réinitialiser la progression ?",
      resetMessage: (name) =>
        `Toute la progression et les réponses de « ${name} » seront définitivement effacées.`,
      cancel: "Annuler",
      confirm: "Tout effacer",
      progress: (done, total) => `${done} / ${total} niveaux terminés`,
      part: "PARTIE",
      level: "Niveau",
      current: "En cours",
      completed: "terminé",
      locked: "verrouillé",
      soon: "bientôt disponible",
      available: "disponible",
      boss: "Boss",
      finalKicker: "ÉPILOGUE",
      finalTitle: "La fin finale",
      finalHint: "Termine tous les boss et récupère les 6 clés de résonance.",
      finalSoon: "Bientôt disponible",
      finalTag: "NIVEAU FINAL",
    },
    en: {
      player: "PLAYER",
      kicker: "CAMPAIGN // LEVEL SELECT",
      title: "Choose your level",
      continue: "Continue",
      intro: "Replay the introduction",
      switchUser: "Switch player",
      reset: "Reset progress",
      resetTitle: "Reset progress?",
      resetMessage: (name) =>
        `All progress and answers for "${name}" will be permanently erased.`,
      cancel: "Cancel",
      confirm: "Erase everything",
      progress: (done, total) => `${done} / ${total} levels completed`,
      part: "PART",
      level: "Level",
      current: "Current",
      completed: "completed",
      locked: "locked",
      soon: "coming soon",
      available: "available",
      boss: "Boss",
      finalKicker: "EPILOGUE",
      finalTitle: "The final end",
      finalHint: "Beat every boss and collect the 6 resonance keys.",
      finalSoon: "Coming soon",
      finalTag: "FINAL LEVEL",
    },
  }[language];

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const HEX = "M50 3 L94 28 L94 84 L50 109 L6 84 L6 28 Z";
  const FINAL_SHAPE =
    "M40 6 L560 6 L594 40 L594 66 L580 90 L594 114 L594 140 L560 174 L40 174 L6 140 L6 114 L20 90 L6 66 L6 40 Z";
  const BOSS_SHAPE =
    "M24 4 L176 4 L196 28 L196 40 L190 56 L196 72 L196 84 L176 108 L24 108 L4 84 L4 72 L10 56 L4 40 L4 28 Z";
  const LOCK_PATH =
    "M-9 -3V-9a9 9 0 0 1 18 0v6h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-22a2 2 0 0 1-2-2V-1a2 2 0 0 1 2-2h2Zm5 0h8v-6a4 4 0 0 0-8 0v6Zm4 8a2.4 2.4 0 0 0-1.2 4.5V17h2.4v-3.5A2.4 2.4 0 0 0 0 5Z";
  const SKULL_PATH =
    "M0-22c-12 0-20 8-20 19 0 7 3.800 11.500 8 14V20c0 1.100.9 2 2 2h2v4h4v-4h8v4h4v-4h2c1.100 0 2-.9 2-2v-9c4.200-2.500 8-7 8-14 0-11-8-19-20-19ZM-8 3a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm16 0a5 5 0 1 1 0-10 5 5 0 0 1 0 10ZM0 8l3.500 6h-7Z";

  // Mélange deux couleurs hexadécimales.
  function mix(from, to, amount) {
    const parse = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    const [a, b] = [parse(from), parse(to)];
    return `#${a.map((v, i) => Math.round(v + (b[i] - v) * amount).toString(16).padStart(2, "0")).join("")}`;
  }
  const shade = (hex, amount) => mix(hex, "#000000", amount);
  const tint = (hex, amount) => mix(hex, "#ffffff", amount);

  // Dégradés SVG : communs, puis un jeu par partie pour garder sa couleur.
  function injectDefs() {
    const stops = (list) =>
      list.map(([offset, color]) => `<stop offset="${offset}" stop-color="${color}"/>`).join("");
    const grad = (id, list, vertical = true) =>
      `<linearGradient id="${id}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="1">${stops(list)}</linearGradient>`;
    const perSeries = levels.series
      .map(({ id, theme }) => {
        const { accent, accent2 } = theme;
        return [
          grad(`grad-open-${id}`, [[0, shade(accent, 0.55)], [0.55, shade(accent, 0.75)], [1, shade(accent, 0.9)]]),
          grad(`grad-rim-open-${id}`, [[0, tint(accent, 0.6)], [0.5, accent], [1, shade(accent, 0.6)]]),
          grad(`grad-done-${id}`, [[0, shade(accent, 0.2)], [0.55, shade(accent, 0.45)], [1, shade(accent, 0.75)]]),
          grad(`grad-rim-done-${id}`, [[0, tint(accent, 0.85)], [0.5, tint(accent, 0.2)], [1, shade(accent, 0.35)]]),
          grad(`grad-current-${id}`, [[0, accent], [0.55, shade(accent, 0.35)], [1, shade(accent, 0.65)]]),
          grad(`grad-rim-current-${id}`, [[0, "#ffffff"], [0.5, tint(accent2, 0.4)], [1, accent]]),
          grad(`grad-boss-${id}`, [[0, shade(accent2, 0.35)], [0.5, shade(accent2, 0.65)], [1, shade(accent2, 0.9)]], false),
          grad(`grad-bossdone-${id}`, [[0, shade(accent2, 0.2)], [0.5, shade(accent, 0.5)], [1, shade(accent2, 0.85)]], false),
          grad(`grad-rim-boss-${id}`, [[0, tint(accent2, 0.75)], [0.5, accent2], [1, shade(accent, 0.4)]], false),
        ].join("");
      })
      .join("");
    const markup = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
      ${grad("grad-locked", [[0, "#2a3042"], [1, "#12151f"]])}
      ${grad("grad-rim-locked", [[0, "#586079"], [1, "#222738"]])}
      ${perSeries}
      <linearGradient id="grad-gloss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <linearGradient id="grad-sweep" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <clipPath id="clip-boss"><path d="${BOSS_SHAPE}"/></clipPath>
    </defs></svg>`;
    document.body.insertAdjacentHTML("afterbegin", markup);
  }

  // Applique les couleurs d'une partie à une section.
  function applyTheme(element, { id, theme }) {
    const { accent, accent2 } = theme;
    const vars = {
      "--accent": accent,
      "--accent2": accent2,
      "--accent-light": tint(accent, 0.55),
      "--accent-soft": `${accent}55`,
      "--boss-text": tint(accent2, 0.78),
    };
    ["open", "rim-open", "done", "rim-done", "current", "rim-current", "boss", "bossdone", "rim-boss"].forEach(
      (name) => (vars[`--g-${name}`] = `url(#grad-${name}-${id})`),
    );
    Object.entries(vars).forEach(([key, value]) => element.style.setProperty(key, value));
  }

  // Anime un nombre de 0 à sa valeur finale.
  function countUp(element, target, suffix) {
    if (reducedMotion || !target) {
      element.textContent = `${target}${suffix}`;
      return;
    }
    const startTime = performance.now();
    const step = (now) => {
      const ratio = Math.min((now - startTime) / 1100, 1);
      element.textContent = `${Math.round(target * (1 - (1 - ratio) ** 3))}${suffix}`;
      if (ratio < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // Révèle chaque série quand elle entre dans l'écran.
  function observeSeries() {
    const sections = [...seriesList.querySelectorAll(".series")];
    if (!("IntersectionObserver" in window) || reducedMotion) {
      sections.forEach((section) => section.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }),
      { threshold: 0.12 },
    );
    sections.forEach((section) => observer.observe(section));
  }

  // Construit le SVG d'une tuile de niveau.
  function tileSvg(item, caption) {
    const locked = item.state === "locked" || item.state === "soon";
    const base = `<path class="tile-glow" d="${HEX}"/><path class="tile-rim" d="${HEX}"/>
      <path class="tile-face" d="${HEX}" transform="translate(50 56) scale(.88) translate(-50 -56)"/>
      <path class="tile-inner" d="${HEX}" transform="translate(50 56) scale(.74) translate(-50 -56)"/>
      <circle class="tile-orbit" cx="50" cy="56" r="49"/>
      <path class="tile-gloss" d="M50 12 L86 33 L86 52 Q50 64 14 52 L14 33 Z"/>`;
    let body;
    if (locked) {
      body = `<g class="tile-icon" transform="translate(50 46) scale(1.25)"><path d="${LOCK_PATH}"/></g>
        <text class="tile-num" x="50" y="92">${item.number}</text>`;
    } else {
      body = `<text class="tile-num" x="50" y="70">${item.number}</text>`;
      if (item.state === "completed") {
        body += `<g transform="translate(80 26)"><circle class="tile-badge-bg" r="12"/><path class="tile-badge-icon" d="M-5 0.500L-1.500 4 5.500-3.500"/></g>`;
      }
      if (caption) body += `<text class="tile-caption" x="50" y="92">${caption}</text>`;
    }
    return `<svg class="tile" viewBox="0 0 100 112" aria-hidden="true" focusable="false">${base}${body}</svg>`;
  }

  // Construit le SVG d'un emblème de boss.
  function bossSvg(item, label) {
    const locked = item.state === "locked" || item.state === "soon";
    const done = item.state === "completed";
    const key = levels.getKeys(username).find((entry) => entry.id === item.key);
    const keyMarkup = key
      ? `<image class="tile-key ${key.owned ? "is-owned" : "is-missing"}" href="${key.image}" x="20" y="24" width="30" height="44" preserveAspectRatio="xMidYMid meet"/>
         <text class="tile-key-label" x="35" y="82">0${key.number}</text>`
      : "";
    return `<svg class="tile" viewBox="0 0 200 112" aria-hidden="true" focusable="false">
      <path class="tile-glow" d="${BOSS_SHAPE}"/><path class="tile-rim" d="${BOSS_SHAPE}"/>
      <path class="tile-face" d="${BOSS_SHAPE}" transform="translate(100 56) scale(.95 .9) translate(-100 -56)"/>
      <g clip-path="url(#clip-boss)"><rect class="tile-sweep" x="30" y="0" width="60" height="112" transform="skewX(-20)"/></g>
      <path class="tile-inner" d="${BOSS_SHAPE}" transform="translate(100 56) scale(.88 .8) translate(-100 -56)"/>
      <path class="tile-gloss" d="M24 8 L176 8 L190 28 L190 48 Q100 62 10 48 L10 28 Z"/>
      <g transform="translate(100 46) scale(.95)"><g class="tile-skull"><path d="${SKULL_PATH}"/></g></g>
      <text class="tile-boss-label" x="100" y="94">${label}</text>
      ${keyMarkup}
      ${locked ? `<g class="tile-icon" transform="translate(168 30)"><path d="${LOCK_PATH}"/></g>` : ""}
      ${done ? `<g transform="translate(168 30)"><circle class="tile-badge-bg" r="13"/><path class="tile-badge-icon" d="M-5.500 0.500L-1.500 4.500 6-3.500"/></g>` : ""}
    </svg>`;
  }

  // Construit le grand emblème du niveau final.
  function finaleSvg(item) {
    const locked = item.state === "locked" || item.state === "soon";
    const keys = levels.getKeys(username);
    const slots = keys
      .map((key, index) => {
        const x = 300 + (index - 2.5) * 46;
        return `<image class="tile-key ${key.owned ? "is-owned" : "is-missing"}" href="${key.image}" x="${x - 15}" y="118" width="30" height="42" preserveAspectRatio="xMidYMid meet"/>`;
      })
      .join("");
    const rays = Array.from({ length: 16 }, (_, i) => `<path d="M300 90 L${300 + Math.cos((i / 16) * Math.PI * 2) * 360} ${90 + Math.sin((i / 16) * Math.PI * 2) * 360}" />`).join("");
    return `<svg class="tile" viewBox="0 0 600 180" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="grad-final-core" cx="50%" cy="45%" r="60%"><stop offset="0" stop-color="#5a1b9a"/><stop offset=".6" stop-color="#1b0a3d"/><stop offset="1" stop-color="#07030f"/></radialGradient>
        <linearGradient id="grad-final-rim" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#79f7ff"/><stop offset=".35" stop-color="#ff7bf0"/><stop offset=".7" stop-color="#ffd27a"/><stop offset="1" stop-color="#79f7ff"/></linearGradient>
        <clipPath id="clip-final"><path d="${FINAL_SHAPE}"/></clipPath>
      </defs>
      <path class="final-glow" d="${FINAL_SHAPE}"/>
      <path class="final-rim" d="${FINAL_SHAPE}"/>
      <path class="final-face" d="${FINAL_SHAPE}" transform="translate(300 90) scale(.985 .94) translate(-300 -90)"/>
      <g clip-path="url(#clip-final)"><g class="final-rays" transform-origin="300 90">${rays}</g></g>
      <circle class="final-orbit" cx="300" cy="62" r="32"/><circle class="final-orbit slow" cx="300" cy="62" r="42"/>
      <text class="final-tag" x="300" y="34">${text.finalTag}</text>
      <text class="final-title" x="300" y="76">${text.finalTitle}</text>
      <text class="final-hint" x="300" y="104">${locked ? text.finalHint : ""}</text>
      ${slots}
      ${locked ? `<g class="tile-icon final-lock" transform="translate(556 40) scale(1.3)"><path d="${LOCK_PATH}"/></g>` : ""}
    </svg>`;
  }

  const username = save.getCurrentUser();
  if (!username) {
    window.location.replace(levels.loginUrl);
    return;
  }

  injectDefs();
  document.documentElement.lang = language;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const value = text[element.dataset.i18n];
    if (typeof value === "string") element.textContent = value;
  });
  document.getElementById("playerName").textContent = username;

  const seriesList = document.getElementById("seriesList");
  const continueButton = document.getElementById("continueButton");

  // Crée la carte d'un niveau selon son état.
  function createCard(item, animate) {
    const isBoss = item.type === "boss";
    const isFinal = item.type === "final";
    const playable = ["completed", "current", "unlocked"].includes(item.state);
    const card = document.createElement(playable ? "a" : "div");
    const name = isBoss || isFinal ? item.label[language] : `${text.level} ${item.number}`;
    const stateLabel = {
      completed: text.completed,
      current: text.current,
      unlocked: text.available,
      locked: text.locked,
      soon: text.soon,
    }[item.state];

    card.className = `level-card state-${item.state}${isBoss ? " is-boss" : ""}${isFinal ? " is-final" : ""}${animate ? " just-unlocked" : ""}`;
    card.dataset.levelId = item.id;
    card.setAttribute("aria-label", `${name} — ${stateLabel}`);
    if (playable) card.href = levels.urlFor(item);
    else card.setAttribute("aria-disabled", "true");

    card.innerHTML = isFinal
      ? finaleSvg(item)
      : isBoss
        ? bossSvg(item, text.boss)
        : tileSvg(item, item.state === "current" ? text.current : "");
    return card;
  }

  // Affiche la grille complète et la progression.
  function render() {
    const progress = levels.getProgress(username);
    const seen = new Set(save.getSave(username)?.ui?.seen || []);
    let delay = 0;

    seriesList.replaceChildren();
    levels.series.forEach((serie) => {
      const entries = progress.items.filter((item) => item.series === serie.id);
      const playable = entries.filter((item) => item.ready);
      const done = playable.filter((item) => item.state === "completed").length;
      const section = document.createElement("section");
      section.className = "series";
      applyTheme(section, serie);
      section.setAttribute("aria-labelledby", `series-${serie.id}`);
      section.innerHTML = `
        <header class="series-header">
          <div>
            <p class="series-kicker">${text.part} ${serie.id}</p>
            <h2 id="series-${serie.id}">${serie.name[language]}</h2>
          </div>
          <span class="series-count">${playable.length ? `${done} / ${playable.length}` : text.soon}</span>
        </header>
        <div class="level-grid"></div>`;
      const grid = section.querySelector(".level-grid");
      entries.forEach((item, index) => {
        const fresh =
          ["current", "unlocked"].includes(item.state) && !seen.has(item.id);
        const card = createCard(item, fresh && !reducedMotion);
        card.style.setProperty("--i", index);
        if (fresh) {
          card.style.animationDelay = `${delay}ms`;
          delay += 140;
        }
        grid.appendChild(card);
      });
      seriesList.appendChild(section);
    });

    const finalItem = progress.items.find((item) => item.type === "final");
    if (finalItem) {
      const section = document.createElement("section");
      section.className = "series series-final";
      section.setAttribute("aria-labelledby", "series-final");
      section.innerHTML = `
        <header class="series-header">
          <div>
            <p class="series-kicker">${text.finalKicker}</p>
            <h2 id="series-final">${text.finalTitle}</h2>
          </div>
          <span class="series-count">${finalItem.ready ? "" : text.finalSoon}</span>
        </header>
        <div class="level-grid final-grid"></div>`;
      section.querySelector(".final-grid").appendChild(createCard(finalItem, false));
      seriesList.appendChild(section);
    }

    levels.keys.length && window.EchoesKeyTray.render(document.getElementById("keyTray"));

    const unlockedIds = progress.items
      .filter((item) => ["current", "unlocked", "completed"].includes(item.state))
      .map((item) => item.id);
    save.saveProgress({ ui: { seen: unlockedIds } }, username);

    countUp(document.getElementById("progressPercent"), progress.percent, " %");
    document.getElementById("progressCount").textContent = text.progress(
      progress.completedCount,
      progress.total,
    );
    const fill = document.getElementById("progressFill");
    fill.style.width = "0%";
    requestAnimationFrame(() => requestAnimationFrame(() => (fill.style.width = `${progress.percent}%`)));
    document.getElementById("progressTrack").setAttribute("aria-valuenow", String(progress.percent));

    const current = progress.items.find((item) => item.id === progress.currentId);
    if (current) {
      continueButton.href = levels.urlFor(current);
      continueButton.textContent = text.continue;
    } else {
      continueButton.href = "#";
      continueButton.hidden = true;
    }

    observeSeries();
    document
      .querySelector(".level-card.state-current")
      ?.scrollIntoView({ block: "center", behavior: reducedMotion ? "auto" : "smooth" });
  }

  document.getElementById("switchUserButton").addEventListener("click", () => {
    save.logout();
    window.location.href = "login.html";
  });

  const resetDialog = document.getElementById("resetDialog");
  document.getElementById("resetMessage").textContent = text.resetMessage(username);
  document.getElementById("resetButton").addEventListener("click", () => {
    if (typeof resetDialog.showModal === "function") {
      resetDialog.showModal();
    } else if (window.confirm(text.resetMessage(username))) {
      resetDialog.returnValue = "confirm";
      resetDialog.dispatchEvent(new Event("close"));
    }
  });
  resetDialog.addEventListener("close", () => {
    if (resetDialog.returnValue !== "confirm") return;
    save.resetProgress(username);
    save.logout();
    window.location.href = "login.html";
  });

  render();
})();
