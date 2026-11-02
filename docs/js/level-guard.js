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

  if (item.type === "level" && serie?.levels?.includes(item.number)) {
    const panel = document.querySelector(".puzzle-panel");
    if (panel) {
      const language =
        localStorage.getItem("echoes-language") === "en" ? "en" : "fr";
      const levelName = language === "en" ? "LEVEL" : "NIVEAU";
      const startButton = document.getElementById("startPuzzleButton");
      const previousInertStates = [...panel.children].map((child) => [
        child,
        child.inert,
      ]);
      previousInertStates.forEach(([child]) => {
        child.inert = true;
      });

      const overlay = document.createElement("div");
      overlay.className = "level-challenge-launch";
      overlay.setAttribute("role", "group");
      overlay.setAttribute(
        "aria-label",
        language === "en"
          ? `Start part ${item.series}, level ${item.displayNumber}`
          : `Lancer la partie ${item.series}, niveau ${item.displayNumber}`,
      );
      overlay.innerHTML = `
        <div class="level-launch-card">
          <span class="level-launch-kicker">${language === "en" ? "CHALLENGE // READY" : "ÉPREUVE // PRÊTE"}</span>
          <span class="level-launch-emblem" aria-hidden="true">
            <svg viewBox="0 0 64 64" focusable="false">
              <path class="level-launch-emblem-frame" d="M32 3 55 16v27L32 61 9 43V16L32 3Z" />
              <circle class="level-launch-emblem-ring" cx="32" cy="27" r="11" />
              <path class="level-launch-emblem-key" d="M35.8 23.2a5.4 5.4 0 1 0-2.1 4.3L43 36.8h4.2v-4.2h-4.1v-4.1h-4.2l-1.6-1.6" />
              <path class="level-launch-emblem-spark" d="m14 13 3-4m33 4-3-4m-15-6v5" />
            </svg>
          </span>
          <p class="level-launch-title">${language === "en" ? `PART ${item.series} // ${levelName} ${item.displayNumber}` : `PARTIE ${item.series} // ${levelName} ${item.displayNumber}`}</p>
          <button class="level-launch-button" type="button">
            <span>${language === "en" ? "START CHALLENGE" : "LANCER LE DÉFI"}</span>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M4 12h15m-6-6 6 6-6 6" />
            </svg>
          </button>
          <p class="level-launch-caption">${language === "en" ? "ACTIVATE TO ENTER THE PUZZLE" : "ACTIVER POUR ENTRER DANS LE PUZZLE"}</p>
        </div>`;
      panel.appendChild(overlay);

      const restorePanel = () => {
        previousInertStates.forEach(([child, wasInert]) => {
          child.inert = wasInert;
        });
        overlay.remove();
      };
      overlay
        .querySelector(".level-launch-button")
        .addEventListener("click", () => {
          restorePanel();
          if (!startButton || startButton.disabled) return;
          startButton.hidden = false;
          startButton.click();
          if (!startButton.hidden) startButton.hidden = true;
        });
      overlay.querySelector(".level-launch-button").focus();
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
