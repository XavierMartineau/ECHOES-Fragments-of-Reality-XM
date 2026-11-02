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
      const examples = [
        [
          {
            fr: "Les indices séparent les couleurs bien placées des couleurs présentes au mauvais endroit.",
            en: "Feedback separates colors in the right place from colors in the wrong place.",
            steps: [
              { fr: "Compose une proposition de cinq couleurs différentes.", en: "Build a guess from five different colors.", tokens: ["●", "◆", "▲", "★", "?" ] },
              { fr: "Lis les deux compteurs, puis change l'ordre sans répéter une couleur.", en: "Read both counters, then change the order without repeating a color.", tokens: ["POSITION", "COULEUR", "ORDRE", "↻"] },
            ],
          },
          {
            fr: "Un indice décrit des groupes de cases allumées. Une case vide sépare toujours deux groupes.",
            en: "A clue describes runs of lit cells. One empty cell always separates two runs.",
            steps: [
              { fr: "L'indice 2 1 donne deux cases, une pause, puis une case.", en: "The clue 2 1 means two cells, a gap, then one cell.", tokens: ["2 1", "■", "■", "·", "■"] },
              { fr: "Croise l'indice de la ligne avec ceux des colonnes.", en: "Cross-check the row clue against the column clues.", tokens: ["LIGNE", "↕", "COLONNE", "✓"] },
            ],
          },
          {
            fr: "Chaque miroir renvoie le faisceau selon son orientation ; certains miroirs ne servent pas au bon trajet.",
            en: "Each mirror reflects the beam according to its angle; some mirrors are decoys.",
            steps: [
              { fr: "Le faisceau avance jusqu'au miroir et change de direction.", en: "The beam travels to a mirror and changes direction.", tokens: ["▶", "→", "/", "↑", "◎"] },
              { fr: "Teste le trajet, puis ne pivote que les miroirs traversés.", en: "Test the beam, then rotate only mirrors it reaches.", tokens: ["MIROIR", "↻", "FAISCEAU", "→"] },
            ],
          },
          {
            fr: "Déplace un disque à la fois ; un disque plus grand ne peut jamais reposer sur un plus petit.",
            en: "Move one disk at a time; a larger disk can never sit on a smaller one.",
            steps: [
              { fr: "Le plus petit disque peut changer de tour librement.", en: "The smallest disk can move freely between towers.", tokens: ["●", "A", "→", "B"] },
              { fr: "Libère le disque inférieur avant de le déplacer.", en: "Clear the smaller disks before moving a larger one.", tokens: ["●", "●●", "●●●", "→"] },
            ],
          },
          {
            fr: "Un chiffre ne se répète ni dans sa ligne, ni dans sa colonne, ni dans son bloc de 2 × 3.",
            en: "A digit cannot repeat in its row, column, or 2 × 3 box.",
            steps: [
              { fr: "Cherche un chiffre absent de la ligne et de la colonne.", en: "Look for a digit missing from both the row and column.", tokens: ["LIGNE", "1 2 _", "COLONNE", "✓"] },
              { fr: "Vérifie aussi les six cases du bloc avant de le placer.", en: "Check the six cells in the box before placing it.", tokens: ["2 × 3", "1 2 3", "4 5 6"] },
            ],
          },
        ],
        [
          {
            fr: "Déduis la valeur des symboles avant de résoudre cinq opérations dans chaque série.",
            en: "Deduce the symbols' values before solving five operations in each series.",
            steps: [
              { fr: "Un même symbole garde toujours la même valeur.", en: "The same symbol always keeps the same value.", tokens: ["● + ●", "=", "8"] },
              { fr: "Calcule chaque résultat, puis additionne les cinq réponses.", en: "Calculate each result, then add all five answers.", tokens: ["RÉSULTAT", "+", "RÉSULTAT", "…", "Σ"] },
            ],
          },
          {
            fr: "Déplace chaque masse vers un plateau ou la réserve ; les deux côtés doivent finir au même poids.",
            en: "Move each weight to a pan or the reserve; both pans must end at the same weight.",
            steps: [
              { fr: "Additionne les masses d'un côté, sans oublier les poids différents.", en: "Add the weights on one side, including their different values.", tokens: ["3", "+", "5", "=", "8"] },
              { fr: "Répartis les masses jusqu'à obtenir deux totaux égaux.", en: "Move the weights until both totals are equal.", tokens: ["GAUCHE 8", "=", "DROITE 8"] },
            ],
          },
          {
            fr: "Déplace toute la pile en respectant l'ordre, et utilise la tour centrale comme étape.",
            en: "Move the full stack in order, using the middle tower as a staging point.",
            steps: [
              { fr: "Un disque ne se déplace que s'il est au sommet.", en: "Only a top disk can be moved.", tokens: ["SOMMET", "●", "→", "TOUR"] },
              { fr: "Ne pose jamais un grand disque sur un petit.", en: "Never place a larger disk on a smaller one.", tokens: ["●", "●●", "✕", "●●●"] },
            ],
          },
          {
            fr: "Les mots peuvent être cachés dans huit directions ; certaines lettres communes forment un second code.",
            en: "Words can hide in eight directions; shared letters form a second code.",
            steps: [
              { fr: "Repère un mot en ligne, en diagonale ou à l'envers.", en: "Find a word across, diagonally, or backwards.", tokens: ["G", "A", "L", "A", "X", "I", "E"] },
              { fr: "Note les lettres partagées dans l'ordre des numéros.", en: "Record shared letters in their numbered order.", tokens: ["1", "→", "2", "→", "…", "7"] },
            ],
          },
          {
            fr: "Une impulsion inverse la case choisie et ses voisines directes, pas les diagonales.",
            en: "A pulse toggles its chosen cell and direct neighbors, not the diagonals.",
            steps: [
              { fr: "L'impulsion centrale touche cinq cases en croix.", en: "A center pulse affects five cells in a cross.", tokens: ["·", "■", "·", "■", "✦", "■", "·", "■", "·"] },
              { fr: "Cherche une suite d'impulsions qui éteint toute la grille.", en: "Find a sequence of pulses that switches off the whole grid.", tokens: ["IMPULSION", "→", "VOISINES", "→", "ÉTEINT"] },
            ],
          },
        ],
        [
          {
            fr: "Le lancer déplace le pion ; une échelle le fait monter et un serpent le fait redescendre.",
            en: "A roll moves the token; a ladder sends it up and a snake sends it back.",
            steps: [
              { fr: "Arriver sur le pied d'une échelle fait gagner des cases.", en: "Landing at a ladder's foot moves you forward.", tokens: ["DÉPART", "→", "ÉCHELLE", "↑"] },
              { fr: "Repère les serpents avant de choisir ta prochaine stratégie.", en: "Watch for snakes before choosing your next strategy.", tokens: ["CASE", "↓", "SERPENT", "RECUL"] },
            ],
          },
          {
            fr: "Suis les points de contrôle dans l'ordre, sans mur, détour ni case revisitée.",
            en: "Follow checkpoints in order without hitting a wall, detouring, or revisiting cells.",
            steps: [
              { fr: "Chaque clic doit rejoindre une case voisine.", en: "Each move must go to an adjacent cell.", tokens: ["S", "→", "1", "→", "2"] },
              { fr: "Respecte aussi le nombre de pas et de virages attendus.", en: "Also match the required number of steps and turns.", tokens: ["PAS", "✓", "VIRAGE", "✓", "E"] },
            ],
          },
          {
            fr: "Dans cette épreuve, une consigne précise quelle forme et quelle couleur sélectionner.",
            en: "Each round gives a rule that tells you which shape and color to select.",
            steps: [
              { fr: "Combine les deux critères : couleur ET forme.", en: "Combine both criteria: color AND shape.", tokens: ["BLEU", "+", "△", "=", "CIBLE"] },
              { fr: "Lis la consigne à chaque manche : le type de défi peut changer.", en: "Read each round's prompt: the challenge type can change.", tokens: ["TEXTE", "→", "FORME", "→", "GRILLE"] },
            ],
          },
          {
            fr: "Les indices donnent les groupes de cases remplies sur chaque ligne et chaque colonne.",
            en: "Clues give the groups of filled cells in each row and column.",
            steps: [
              { fr: "Un indice 4 correspond à quatre cases pleines consécutives.", en: "A clue of 4 means four consecutive filled cells.", tokens: ["4", "■", "■", "■", "■"] },
              { fr: "Croise les deux directions pour éliminer les cases impossibles.", en: "Cross both directions to rule out impossible cells.", tokens: ["LIGNE", "×", "COLONNE", "→", "?"] },
            ],
          },
          {
            fr: "Trace le chemin exact entre départ et sortie en respectant points de contrôle et obstacles.",
            en: "Trace the exact route from start to exit, respecting checkpoints and obstacles.",
            steps: [
              { fr: "Planifie les étapes dans l'ordre avant de tracer.", en: "Plan the checkpoints in order before tracing.", tokens: ["S", "→", "1", "→", "2", "→", "E"] },
              { fr: "Une case interdite ou un détour invalide le trajet.", en: "A blocked cell or detour invalidates the route.", tokens: ["×", "MUR", "✓", "CHEMIN", "×"] },
            ],
          },
        ],
        [
          {
            fr: "Les cases fragiles disparaissent après le passage : collecte les fragments avant de te retrouver bloqué.",
            en: "Fragile tiles collapse after you leave them: collect fragments before you get trapped.",
            steps: [
              { fr: "Passe sur un fragment pour le récupérer.", en: "Walk over a fragment to collect it.", tokens: ["●", "→", "◆", "→", "SORTIE"] },
              { fr: "Évite de revenir sur une dalle qui s'est effondrée.", en: "Avoid stepping back onto a collapsed tile.", tokens: ["DALLE", "→", "VIDE", "×"] },
            ],
          },
          {
            fr: "La clé ouvre le passage verrouillé ; récupère-la avant de rejoindre la sortie.",
            en: "The key opens the locked gate; collect it before heading to the exit.",
            steps: [
              { fr: "La porte reste fermée tant que la clé manque.", en: "The gate stays closed until you have the key.", tokens: ["CLÉ", "?", "PORTE", "×"] },
              { fr: "Récupère la clé, puis reviens ouvrir la porte.", en: "Collect the key, then return to unlock the gate.", tokens: ["CLÉ", "✓", "PORTE", "→", "E"] },
            ],
          },
          {
            fr: "Les passages instables changent d'état ; observe leur ouverture avant d'avancer.",
            en: "Unstable passages change state; watch for an opening before moving through.",
            steps: [
              { fr: "Un passage fermé ne peut pas être traversé.", en: "A closed passage cannot be crossed.", tokens: ["OUVERT", "→", "FERMÉ", "×"] },
              { fr: "Choisis un chemin praticable quand la faille s'ouvre.", en: "Choose a safe route when the fault opens.", tokens: ["ATTENDS", "…", "OUVERT", "→", "●"] },
            ],
          },
          {
            fr: "Chaque paire de portails relie deux zones ; utilise leur position pour planifier la route.",
            en: "Each portal pair connects two areas; use their positions to plan your route.",
            steps: [
              { fr: "Entrer dans un portail ressort à son portail jumeau.", en: "Entering a portal sends you to its twin.", tokens: ["◎ A", "→", "◎ A"] },
              { fr: "Repère la bonne paire et continue la collecte après le transfert.", en: "Find the matching pair and continue collecting after the jump.", tokens: ["◎ A", "↔", "◎ A", "→", "◆"] },
            ],
          },
          {
            fr: "La carte finale combine plusieurs mécaniques : fragments, glissade, portails et anomalies.",
            en: "The final map combines several mechanics: fragments, ice, portals, and hazards.",
            steps: [
              { fr: "Anticipe la glissade : la bille continue jusqu'au prochain obstacle.", en: "Plan for ice: the ball keeps sliding until the next obstacle.", tokens: ["●", "→", "≋", "→", "■"] },
              { fr: "Combine les mécaniques pour récupérer les fragments sans toucher les dangers.", en: "Combine mechanics to collect fragments while avoiding hazards.", tokens: ["◆", "+", "◎", "+", "×", "→", "E"] },
            ],
          },
        ],
      ];
      const example = examples[item.series - 1]?.[item.displayNumber - 1];
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
      const exampleSection = document.createElement("section");
      exampleSection.className = "level-example";
      const exampleToggle = document.createElement("button");
      exampleToggle.className = "level-example-toggle";
      exampleToggle.type = "button";
      exampleToggle.setAttribute("aria-expanded", "true");
      exampleToggle.textContent =
        language === "en" ? "VISUAL EXAMPLE" : "EXEMPLE VISUEL";
      const exampleContent = document.createElement("div");
      exampleContent.className = "level-example-content";
      const exampleDescription = document.createElement("p");
      exampleDescription.className = "level-example-description";
      exampleDescription.textContent = example?.[language] || "";
      const exampleVisual = document.createElement("div");
      exampleVisual.className = "level-example-visual";
      exampleVisual.setAttribute("aria-live", "polite");
      const exampleStep = document.createElement("p");
      exampleStep.className = "level-example-step";
      const exampleNext = document.createElement("button");
      exampleNext.className = "level-example-next";
      exampleNext.type = "button";
      exampleNext.textContent =
        language === "en" ? "NEXT EXAMPLE STEP" : "ÉTAPE SUIVANTE";
      let stepIndex = 0;
      const showExampleStep = () => {
        const step = example?.steps[stepIndex];
        exampleStep.textContent = step?.[language] || "";
        exampleVisual.replaceChildren(
          ...(step?.tokens || []).map((token, index) => {
            const chip = document.createElement("span");
            chip.className = `level-example-token level-example-token-${index % 4}`;
            chip.textContent = token;
            return chip;
          }),
        );
        exampleNext.textContent =
          language === "en"
            ? `NEXT STEP ${stepIndex + 1} / ${example?.steps.length || 0}`
            : `ÉTAPE ${stepIndex + 1} / ${example?.steps.length || 0}`;
      };
      exampleNext.addEventListener("click", () => {
        stepIndex = (stepIndex + 1) % (example?.steps.length || 1);
        showExampleStep();
      });
      exampleToggle.setAttribute(
        "aria-controls",
        `level-example-${item.series}-${item.displayNumber}`,
      );
      exampleContent.id = `level-example-${item.series}-${item.displayNumber}`;
      exampleToggle.addEventListener("click", () => {
        const expanded =
          exampleToggle.getAttribute("aria-expanded") !== "true";
        exampleToggle.setAttribute("aria-expanded", String(expanded));
        exampleContent.hidden = !expanded;
      });
      exampleContent.append(exampleDescription, exampleVisual, exampleStep, exampleNext);
      exampleSection.append(exampleToggle, exampleContent);
      overlay.querySelector(".level-launch-card").append(exampleSection);
      showExampleStep();
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
          panel
            .querySelector(".puzzle-actions")
            ?.prepend(exampleSection);
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
