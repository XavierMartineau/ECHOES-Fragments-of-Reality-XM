// LEVEL GUARD // bloque les niveaux verrouillés et enregistre chaque niveau terminé.
(() => {
  // Fond animé de la partie (voir scene-bg.js).
  if (document.currentScript) {
    const scene = document.createElement("script");
    scene.src = new URL("scene-bg.js?v=1", document.currentScript.src).href;
    document.body.appendChild(scene);
  }

  const levels = window.EchoesLevels;
  const save = window.EchoesSave;
  if (!levels || !save) return;

  // Mode développeur : les pages archivées restent accessibles avec le raccourci développeur.
  const devModeUnlocked =
    localStorage.getItem("echoes-dev-unlock") === "1" ||
    sessionStorage.getItem("echoes-dev-unlock") === "1";

  const item = levels.itemForPath();
  if (!item) {
    if (
      !devModeUnlocked &&
      /(?:niveau|boss)-\d+\.html$/i.test(window.location.pathname)
    ) {
      window.location.replace(levels.hubUrl);
    }
    return;
  }

  const username = save.getCurrentUser();
  if (!devModeUnlocked && !username) {
    window.location.replace(levels.loginUrl);
    return;
  }
  if (!devModeUnlocked && !levels.canOpen(item.id, username)) {
    window.location.replace(levels.hubUrl);
    return;
  }

  // Animation de réussite unique par niveau (voir level-victory.js).
  if (!devModeUnlocked && document.currentScript) {
    const style = document.createElement("link");
    style.rel = "stylesheet";
    style.href = new URL("../css/level-victory.css?v=2", document.currentScript.src).href;
    document.head.appendChild(style);
    const effect = document.createElement("script");
    effect.src = new URL("level-victory.js?v=3", document.currentScript.src).href;
    document.body.appendChild(effect);
  }

  const progressMarkers = new Map();
  const serie = levels.series.find((entry) => entry.id === item.series);
  if (item.type === "level" && serie?.levels) {
    const language =
      localStorage.getItem("echoes-language") === "en" ? "en" : "fr";
    const levelWord = language === "en" ? "Level" : "Niveau";
    const nextWord = language === "en" ? "LEVEL" : "NIVEAU";
    const levelLabel = `${levelWord} ${String(item.displayNumber).padStart(2, "0")}`;
    document.title = `ECHOES - ${levelLabel}`;

    const heading = document.querySelector(
      '[data-i18n="level"], [data-copy="level"], #levelLabel, .level-meta > strong',
    );
    if (heading) heading.textContent = levelLabel;

    const counter =
      document.querySelector(
        '#footerProgress, [data-i18n="counter"], [data-copy="counter"]',
      ) ||
      [...document.querySelectorAll(".level-footer > span")].find((element) =>
        /^\s*\d+\s*\/\s*\d+\s*$/.test(element.textContent),
      );
    if (counter) counter.textContent = `${item.displayNumber} / ${serie.levels.length}`;

    const nextButton = document.getElementById("nextLevelButton");
    if (nextButton) {
      if (item.displayNumber < serie.levels.length) {
        nextButton.textContent = nextButton.textContent.replace(
          /\b(?:NIVEAU|LEVEL)\s+\d+\b/i,
          `${nextWord} ${item.displayNumber + 1}`,
        );
      } else if (serie.boss && /\b(?:NIVEAU|LEVEL)\s+\d+\b/i.test(nextButton.textContent)) {
        nextButton.textContent =
          language === "en" ? "FACE THE BOSS" : "AFFRONTER LE BOSS";
      }
    }

    const progress = document.getElementById("levelProgress");
    if (progress) {
      const progressItems = username ? levels.getProgress(username).items : [];
      const stateById = new Map(
        progressItems.map((entry) => [entry.id, entry.state]),
      );
      progress.replaceChildren();
      serie.levels.forEach((number, index) => {
        const id = `level-${number}`;
        const state = stateById.get(id);
        const marker = document.createElement("span");
        marker.className = `level-square${state === "completed" ? " completed" : ""}${id === item.id ? " current" : ""}`;
        marker.setAttribute("aria-label", `${levelWord} ${index + 1}`);
        progress.appendChild(marker);
        progressMarkers.set(id, marker);
      });
      progress.setAttribute(
        "aria-label",
        language === "en"
          ? "Progress for levels 1 to 5"
          : "Progression des niveaux 1 à 5",
      );
    }
  }

  if (devModeUnlocked) return;

  const complete = () => {
    const completed = levels.markCompleted(item.id, username);
    if (completed) progressMarkers.get(item.id)?.classList.add("completed");
    return completed;
  };

  // Le bouton "niveau suivant" apparaît uniquement quand le niveau est réussi.
  document.addEventListener("DOMContentLoaded", () => {
    const next = document.getElementById("nextLevelButton");
    if (!next) return;
    if (!next.hidden) complete();
    new MutationObserver(() => {
      if (!next.hidden) complete();
    }).observe(next, { attributes: true, attributeFilter: ["hidden"] });
    next.addEventListener("click", complete);
  });
})();
