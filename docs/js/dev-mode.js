// ============================================================================
// DEV MODE : navigateur de niveaux injecté sur chaque page, réglages de performance et raccourcis de test.
// ============================================================================
(() => {
  // DEV MODE // shared navigator injected on every page.
  const script = document.currentScript;
  if (!script) {
    return;
  }

  const rootUrl = new URL("../../", script.src);
  const style = document.createElement("link");
  style.rel = "stylesheet";
  style.href = new URL("../css/composants/dev-mode.css?v=25", script.src).href;
  document.head.appendChild(style);

  // Keeps the browser tab title synchronized with the current level language.
  const levelMatch = window.location.pathname.match(/niveau-(\d+)\.html$/i);
  if (levelMatch) {
    const currentLevel = String(Number(levelMatch[1])).padStart(2, "0");
    const titlePrefix =
      localStorage.getItem("echoes-language") === "en" ? "Level" : "Niveau";
    document.title = `ECHOES - ${titlePrefix} ${currentLevel}`;
  }

  const parts = [
    {
      number: 1,
      name: "Initiation",
      start: 1,
      end: 5,
      levels: [1, 2, 3, 4, 5],
      folder: "partie-1_niveau-1_à_5",
    },
    {
      number: 2,
      name: "Fractures",
      start: 6,
      end: 10,
      levels: [6, 7, 8, 9, 10],
      folder: "partie-2_niveau-6_à_10",
      special: [
        {
          label: "BOSS 01 // CLEE_01",
          file: "boss-01.html",
        },
      ],
    },
    {
      number: 3,
      name: "Éclipse",
      start: 11,
      end: 15,
      levels: [11, 12, 13, 14, 15],
      folder: "partie-3_niveau-11_à_15",
    },
    {
      number: 4,
      name: "Résonance",
      start: 16,
      end: 20,
      levels: [16, 17, 18, 19, 20],
      folder: "partie-4_niveau-16_à_20",
      special: [
        {
          label: "BOSS 02 // CLEE_02",
          file: "boss-02.html",
        },
      ],
    },
    {
      number: 5,
      name: "Convergence",
      start: 21,
      end: 25,
      levels: [21, 22, 23, 24, 25],
      folder: "partie-5_niveau-21_à_25",
    },
    {
      number: 6,
      name: "Origine",
      start: 26,
      end: 30,
      levels: [26, 27, 28, 29, 30],
      folder: "partie-6_niveau-26_à_30",
      special: [
        {
          label: "BOSS 03 // CLEE_03",
          file: "boss-03.html",
        },
      ],
    },
  ];

  // Renvoie le dossier de partie correspondant à un numéro de niveau.
  const folderForLevel = (level) => {
    if (level <= 5) return "partie-1_niveau-1_à_5";
    if (level <= 10) return "partie-2_niveau-6_à_10";
    if (level <= 15) return "partie-3_niveau-11_à_15";
    if (level <= 20) return "partie-4_niveau-16_à_20";
    if (level <= 25) return "partie-5_niveau-21_à_25";
    if (level <= 30) return "partie-6_niveau-26_à_30";
    return "partie-6_niveau-26_à_30";
  };

  // Construit le lien vers la page d'un niveau.
  const levelLink = (level) =>
    new URL(
      `docs/html/${folderForLevel(level)}/niveau-${String(level).padStart(2, "0")}.html`,
      rootUrl,
    ).href;
  // Construit le lien vers une page spéciale (boss, cinématique, récupération).
  const specialLink = (part, file) =>
    new URL(`docs/html/${part.folder}/${file}`, rootUrl).href;

  const menu = document.createElement("aside");
  menu.className = "dev-mode";
  const colorAssistKey = "echoes-color-assist";
  menu.innerHTML = `
    <button class="dev-mode-toggle" type="button" aria-expanded="false" aria-controls="devModePanel">
      <svg class="dev-mode-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
        <path d="M7 5 2.5 10 7 15M13 5l4.5 5L13 15M11.2 3.5 8.8 16.5" />
      </svg>
      <span class="dev-mode-label">DEV MODE</span>
      <i class="dev-mode-led" aria-hidden="true"></i>
    </button>
    <div class="dev-mode-panel" id="devModePanel" hidden>
      <div class="dev-mode-heading">
        <div>
          <span class="dev-mode-kicker">ECHO // NAVIGATOR</span>
          <strong>Developer Access</strong>
          <small class="dev-mode-hint">Choisis une partie, puis un niveau</small>
        </div>
        <button class="dev-mode-close" type="button" aria-label="Close menu">×</button>
      </div>
      <span class="dev-mode-section">Raccourcis</span>
      <div class="dev-mode-links">
        <a class="dev-mode-home" href="${new URL("index.html", rootUrl).href}">Home</a>
        <a class="dev-mode-home" href="${new URL("docs/html/login.html", rootUrl).href}">Connexion</a>
        <a class="dev-mode-home" href="${new URL("docs/html/niveaux.html", rootUrl).href}">Hub des niveaux</a>
      </div>
      <span class="dev-mode-section">Options</span>
      <div class="dev-mode-options">
        <label class="dev-mode-accessibility">
          <span>Repères couleurs accessibles</span>
          <input type="checkbox" data-color-assist />
        </label>
        <label class="dev-mode-accessibility">
          <span>Curseur premium</span>
          <input type="checkbox" data-fx-toggle="echoes-fx-cursor" />
        </label>
        <label class="dev-mode-accessibility">
          <span>Fonds animés contextuels</span>
          <input type="checkbox" data-fx-toggle="echoes-fx-scene" />
        </label>
        <label class="dev-mode-accessibility">
          <span>Mode performance (appareils lents)</span>
          <input type="checkbox" data-fx-toggle="echoes-perf" data-on="lite" data-off="auto" />
        </label>
      </div>
      <span class="dev-mode-section">État du joueur</span>
      <div class="dev-mode-info" data-dev-info role="status"></div>
      <span class="dev-mode-section">Clés de résonance</span>
      <div class="dev-mode-options dev-mode-progress">
        <div class="dev-mode-links">
          <button class="dev-mode-home" type="button" data-give-keys>Donner les clés 1 à 6</button>
          <button class="dev-mode-home" type="button" data-clear-keys>Retirer toutes les clés</button>
        </div>
        <div class="dev-mode-key-grid">
          ${[1, 2, 3, 4, 5, 6]
            .map(
              (n) =>
                `<button class="dev-mode-home dev-mode-key-btn" type="button" data-key-toggle="${n}" aria-pressed="false">Clé 0${n}</button>`,
            )
            .join("")}
        </div>
      </div>
      <span class="dev-mode-section">Progression (test)</span>
      <div class="dev-mode-options dev-mode-progress">
        <div class="dev-mode-number-row">
          <span>Passer jusqu'au niveau</span>
          <input class="dev-mode-number" type="number" min="1" max="30" value="30" data-skip-level aria-label="Niveau cible" />
        </div>
        <button class="dev-mode-home" type="button" data-skip-go>Skip jusqu'à ce niveau</button>
        <div class="dev-mode-links">
          <button class="dev-mode-home" type="button" data-level-prev>Niveau précédent</button>
          <button class="dev-mode-home" type="button" data-level-next>Niveau suivant</button>
          <button class="dev-mode-home" type="button" data-complete-level>Terminer ce niveau</button>
          <button class="dev-mode-home" type="button" data-complete-all>Tout terminer</button>
        </div>
        <button class="dev-mode-home dev-mode-danger" type="button" data-reset-progress>Réinitialiser la progression</button>
        <small class="dev-mode-hint" data-progress-msg role="status"></small>
      </div>
      <span class="dev-mode-section">Outils</span>
      <div class="dev-mode-options">
        <label class="dev-mode-accessibility">
          <span>Compteur de FPS</span>
          <input type="checkbox" data-fps-toggle />
        </label>
        <div class="dev-mode-links">
          <button class="dev-mode-home" type="button" data-copy-save>Copier la sauvegarde</button>
          <button class="dev-mode-home" type="button" data-lock-dev>Verrouiller le DEV MODE</button>
        </div>
      </div>
      <span class="dev-mode-section">Parties</span>
      <div class="dev-mode-navigation">
        <div class="dev-mode-parts">
          ${parts
            .map(
              (part) => `
                <button class="dev-mode-part-toggle" type="button" data-part="${part.number}" aria-expanded="false">
                  <span>PART ${part.number}</span>
                  <span class="dev-mode-part-name">${part.name}</span>
                  <span class="dev-mode-part-count">${part.levels ? part.levels.length : part.end - part.start + 1} niveaux</span>
                  <span class="dev-mode-chevron" aria-hidden="true">›</span>
                </button>
              `,
            )
            .join("")}
        </div>
        <div class="dev-mode-level-panel" hidden>
          ${parts
            .map(
              (part) => `
                <div class="dev-mode-level-group" data-levels-for="${part.number}" hidden>
                  <span class="dev-mode-level-title">PART ${part.number} // NIVEAUX ${part.start}–${part.end}</span>
                  <div class="dev-mode-levels">
                    ${(part.levels || Array.from(
                      { length: part.end - part.start + 1 },
                      (_, index) => part.start + index,
                    ))
                      .map(
                        (level, index) =>
                          `<a href="${levelLink(level)}">${String(level).padStart(2, "0")}</a>`,
                      )
                      .join("")}
                  </div>
                  ${
                    part.special
                      ? `<div class="dev-mode-specials">
                          <span class="dev-mode-special-title">ACCÈS SPÉCIAUX</span>
                          ${part.special
                            .map(
                              (item) =>
                                `<a class="dev-mode-special-link" href="${specialLink(part, item.file)}">${item.label}</a>`,
                            )
                            .join("")}
                        </div>`
                      : ""
                  }
                </div>
              `,
            )
            .join("")}
        </div>
      </div>
    </div>
  `;

  const footer = document.querySelector(
    ".level-footer, .site-footer, .console-footer, footer",
  );
  const footerAlreadyHasCopyright =
    footer &&
    (footer.querySelector(".site-copyright") ||
      footer.querySelector('[data-i18n="footerYear"]') ||
      footer.querySelector('[data-i18n="footerRights"]') ||
      footer.textContent.includes("© 2026"));
  if (footer && !footerAlreadyHasCopyright) {
    const copyright = document.createElement("span");
    copyright.className = "site-copyright";
    copyright.textContent =
      localStorage.getItem("echoes-language") === "en"
        ? "© 2026 Xavier Martineau · All rights reserved."
        : "© 2026 Xavier Martineau · Tous droits réservés.";
    footer.appendChild(copyright);
  }
  if (footer) {
    footer.insertAdjacentElement("beforebegin", menu);
  } else {
    document.body.appendChild(menu);
  }

  // Naviguer via le DEV MODE ouvre n'importe quel niveau, même verrouillé (voir level-guard.js).
  menu.addEventListener("click", (event) => {
    if (event.target.closest("a[href]"))
      sessionStorage.setItem("echoes-dev-unlock", "1");
  });

  // Progression de test : écrit directement dans la sauvegarde (saveProgress ignore la progression en dev).
  const progressMsg = menu.querySelector("[data-progress-msg]");
  const patchSave = (build) => {
    const user = window.EchoesSave?.getCurrentUser();
    if (!user) {
      progressMsg.textContent = "Connecte-toi d'abord (page Connexion).";
      return false;
    }
    const save = window.EchoesSave.getSave(user) || {};
    const next = {
      ...save,
      ...build(save),
      username: user.trim().toLowerCase(),
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(
      `echoes-save-${encodeURIComponent(user.trim().toLowerCase())}`,
      JSON.stringify(next),
    );
    return true;
  };
  const allKeys = [1, 2, 3, 4, 5, 6].map((n) => `resonance-${n}`);
  const q = (selector) => menu.querySelector(selector);
  const say = (text) => {
    progressMsg.textContent = text;
  };
  const currentKeys = () => window.EchoesSave?.getKeys?.() || [];

  // Écrit la liste de clés (compte connecté ou invité) puis prévient les interfaces de clés.
  const writeKeys = (nextKeys) => {
    const user = window.EchoesSave?.getCurrentUser();
    if (user) {
      if (!patchSave(() => ({ keys: nextKeys }))) return false;
    } else {
      localStorage.setItem("echoes-guest-keys", JSON.stringify(nextKeys));
    }
    allKeys.forEach((id) =>
      document.dispatchEvent(new CustomEvent("echoes:key-unlocked", { detail: { keyId: id } })),
    );
    refreshInfo();
    return true;
  };
  // Les HUD de boss et le hub lisent les clés au chargement : on recharge pour que toutes les interfaces soient à jour.
  const refreshPageSoon = () => setTimeout(() => window.location.reload(), 500);

  const keyButtons = menu.querySelectorAll("[data-key-toggle]");
  const info = q("[data-dev-info]");
  const refreshInfo = () => {
    const keys = currentKeys();
    keyButtons.forEach((button) => {
      const owned = keys.includes(`resonance-${button.dataset.keyToggle}`);
      button.classList.toggle("is-owned", owned);
      button.setAttribute("aria-pressed", String(owned));
    });
    const user = window.EchoesSave?.getCurrentUser();
    const save = (user && window.EchoesSave.getSave(user)) || {};
    const done = (save.completedLevels || []).length;
    info.innerHTML = [
      ["Joueur", user || "invité (non connecté)"],
      ["Niveau actuel", levelMatch ? Number(levelMatch[1]) : "—"],
      ["Niveaux terminés", `${done} / 30`],
      ["Clés", `${keys.filter((id) => allKeys.includes(id)).length} / 6`],
    ]
      .map(([label, value]) => `<span><em>${label}</em><b>${value}</b></span>`)
      .join("");
  };

  q("[data-give-keys]").addEventListener("click", () => {
    if (writeKeys([...new Set([...currentKeys(), ...allKeys])])) {
      say("Clés 1 à 6 données.");
      refreshPageSoon();
    }
  });
  q("[data-clear-keys]").addEventListener("click", () => {
    if (writeKeys([])) {
      say("Toutes les clés retirées.");
      refreshPageSoon();
    }
  });
  keyButtons.forEach((button) =>
    button.addEventListener("click", () => {
      const id = `resonance-${button.dataset.keyToggle}`;
      const keys = currentKeys();
      const next = keys.includes(id) ? keys.filter((key) => key !== id) : [...keys, id];
      if (writeKeys(next)) {
        say(`Clé 0${button.dataset.keyToggle} ${next.includes(id) ? "donnée" : "retirée"}.`);
        refreshPageSoon();
      }
    }),
  );

  const currentLevelNumber = levelMatch ? Number(levelMatch[1]) : null;
  const goToLevel = (number) => {
    sessionStorage.setItem("echoes-dev-unlock", "1");
    window.location.href = levelLink(number);
  };
  q("[data-level-prev]").addEventListener("click", () => {
    if (!currentLevelNumber) return say("Ouvre d'abord un niveau.");
    if (currentLevelNumber <= 1) return say("Déjà au premier niveau.");
    goToLevel(currentLevelNumber - 1);
  });
  q("[data-level-next]").addEventListener("click", () => {
    if (!currentLevelNumber) return say("Ouvre d'abord un niveau.");
    if (currentLevelNumber >= 30) return say("Déjà au dernier niveau.");
    goToLevel(currentLevelNumber + 1);
  });
  q("[data-complete-level]").addEventListener("click", () => {
    if (!currentLevelNumber) return say("Ouvre d'abord un niveau.");
    if (
      patchSave((save) => ({
        completedLevels: [...new Set([...(save.completedLevels || []), currentLevelNumber])].sort((a, b) => a - b),
        completedBosses: [...new Set([...(save.completedBosses || []), "intro"])],
        currentLevel: Math.max(Number(save.currentLevel) || 0, Math.min(30, currentLevelNumber + 1)),
      }))
    ) {
      say(`Niveau ${currentLevelNumber} marqué comme terminé.`);
      refreshInfo();
    }
  });
  q("[data-complete-all]").addEventListener("click", () => {
    if (
      patchSave((save) => ({
        currentPage: "level",
        currentLevel: 30,
        completedLevels: Array.from({ length: 30 }, (_, i) => i + 1),
        completedBosses: [...new Set([...(save.completedBosses || []), "intro", "boss-02", "boss-04", "boss-06"])],
        keys: [...new Set([...(save.keys || []), ...allKeys])],
      }))
    ) {
      say("Tout est terminé (niveaux 1–30, boss, 6 clés).");
      refreshInfo();
      refreshPageSoon();
    }
  });
  q("[data-reset-progress]").addEventListener("click", () => {
    if (!window.confirm("Réinitialiser la progression de ce joueur ?")) return;
    const user = window.EchoesSave?.getCurrentUser();
    if (user) {
      const ok = patchSave(() => ({
        currentPage: "introduction",
        currentLevel: 0,
        completedLevels: [],
        completedBosses: [],
        keys: [],
      }));
      if (!ok) return;
      localStorage.removeItem(`echoes-completed-levels-${encodeURIComponent(user.trim().toLowerCase())}`);
    }
    localStorage.removeItem("echoes-guest-keys");
    localStorage.removeItem("echoes-completed-levels");
    say("Progression réinitialisée.");
    refreshInfo();
    refreshPageSoon();
  });

  // Compteur de FPS : simple surcouche mise à jour une fois par seconde.
  let fpsBox = null;
  let fpsFrame = 0;
  const setFps = (enabled) => {
    if (!enabled) {
      cancelAnimationFrame(fpsFrame);
      fpsBox?.remove();
      fpsBox = null;
      return;
    }
    fpsBox = document.createElement("div");
    fpsBox.className = "dev-fps";
    fpsBox.setAttribute("aria-hidden", "true");
    document.body.appendChild(fpsBox);
    let frames = 0;
    let last = performance.now();
    const tick = (now) => {
      frames += 1;
      if (now - last >= 1000) {
        fpsBox.textContent = `${Math.round((frames * 1000) / (now - last))} FPS`;
        frames = 0;
        last = now;
      }
      fpsFrame = requestAnimationFrame(tick);
    };
    fpsFrame = requestAnimationFrame(tick);
  };
  const fpsToggle = q("[data-fps-toggle]");
  fpsToggle.checked = localStorage.getItem("echoes-dev-fps") === "1";
  setFps(fpsToggle.checked);
  fpsToggle.addEventListener("change", () => {
    fpsToggle.checked
      ? localStorage.setItem("echoes-dev-fps", "1")
      : localStorage.removeItem("echoes-dev-fps");
    setFps(fpsToggle.checked);
  });

  q("[data-copy-save]").addEventListener("click", async () => {
    const user = window.EchoesSave?.getCurrentUser();
    const data = JSON.stringify(
      { user: user || null, save: user ? window.EchoesSave.getSave(user) : null, keys: currentKeys() },
      null,
      2,
    );
    try {
      await navigator.clipboard.writeText(data);
      say("Sauvegarde copiée dans le presse-papiers.");
    } catch {
      window.prompt("Copie la sauvegarde :", data);
    }
  });
  q("[data-lock-dev]").addEventListener("click", () => {
    localStorage.removeItem("echoes-dev-ok");
    setOpen(false);
  });
  refreshInfo();
  menu.querySelector("[data-skip-go]").addEventListener("click", () => {
    const target = Math.min(30, Math.max(1, Number(q("[data-skip-level]").value) || 1));
    const levels = Array.from({ length: target - 1 }, (_, i) => i + 1);
    const bosses = [];
    const keys = [];
    [[10, "boss-02", "resonance-1"], [20, "boss-04", "resonance-2"], [30, "boss-06", "resonance-3"]].forEach(
      ([end, id, key]) => {
        if (target > end) {
          bosses.push(id);
          keys.push(key);
        }
      },
    );
    const ok = patchSave((save) => ({
      currentPage: "level",
      currentLevel: target,
      completedLevels: [...new Set([...(save.completedLevels || []), ...levels])].sort((a, b) => a - b),
      completedBosses: [...new Set([...(save.completedBosses || []), "intro", ...bosses])],
      keys: [...new Set([...(save.keys || []), ...keys])],
    }));
    if (ok) {
      sessionStorage.setItem("echoes-dev-unlock", "1");
      window.location.href = levelLink(target);
    }
  });

  const colorAssist = menu.querySelector("[data-color-assist]");

  // Réglages visuels : « echoes-fx-cursor » et « echoes-fx-scene » valent "off" quand désactivés,
  // « echoes-perf » vaut "lite" en mode performance. Lus par ui-effects.js et scene-bg.js.
  menu.querySelectorAll("[data-fx-toggle]").forEach((box) => {
    const key = box.dataset.fxToggle;
    const on = box.dataset.on || "on";
    const off = box.dataset.off || "off";
    const inverted = !box.dataset.on;
    const value = localStorage.getItem(key);
    box.checked = inverted ? value !== off : value === on;
    box.addEventListener("change", () => {
      if (inverted) {
        box.checked ? localStorage.removeItem(key) : localStorage.setItem(key, off);
      } else {
        box.checked ? localStorage.setItem(key, on) : localStorage.removeItem(key);
      }
      window.location.reload();
    });
  });
  // Active ou désactive le mode d'aide aux couleurs et le mémorise.
  const setColorAssist = (enabled) => {
    document.body.classList.toggle("echo-color-assist", enabled);
    colorAssist.checked = enabled;
    localStorage.setItem(colorAssistKey, String(enabled));
  };
  setColorAssist(localStorage.getItem(colorAssistKey) === "true");
  colorAssist.addEventListener("change", () =>
    setColorAssist(colorAssist.checked),
  );

  const toggle = menu.querySelector(".dev-mode-toggle");
  const panel = menu.querySelector(".dev-mode-panel");
  const close = menu.querySelector(".dev-mode-close");
  const levelPanel = menu.querySelector(".dev-mode-level-panel");
  const partToggles = menu.querySelectorAll(".dev-mode-part-toggle");

  // Opens or closes the level navigator.
  const setOpen = (isOpen) => {
    if (isOpen) refreshInfo();
    panel.hidden = !isOpen;
    toggle.setAttribute("aria-expanded", String(isOpen));
    menu.classList.toggle("is-open", isOpen);
  };

  const DEV_ACCESS_CODE = "popol";
  const DEV_ACCESS_KEY = "echoes-dev-ok";
  const DEV_ACCESS_DURATION = 24 * 60 * 60 * 1000;

  const openGate = () => {
    const gate = document.createElement("div");
    gate.className = "dev-gate";
    gate.innerHTML = `
      <div class="dev-gate-card" role="dialog" aria-modal="true" aria-labelledby="devGateTitle">
        <h2 id="devGateTitle">ACCÈS DEV MODE</h2>
        <p class="dev-gate-text">Entre le code d’accès pour ouvrir le mode développeur.</p>
        <form class="dev-gate-form">
          <input class="dev-gate-input" type="password" maxlength="32" autocomplete="off" autocapitalize="none" spellcheck="false" aria-label="Code d’accès" placeholder="Code d’accès" required />
          <button type="submit" class="dev-gate-ok">VALIDER</button>
        </form>
        <p class="dev-gate-msg" role="status"></p>
        <button type="button" class="dev-gate-cancel">Annuler</button>
      </div>`;
    document.body.appendChild(gate);
    const q = (s) => gate.querySelector(s);
    const msg = q(".dev-gate-msg");
    const form = q(".dev-gate-form");
    const input = q(".dev-gate-input");
    const done = () => gate.remove();
    q(".dev-gate-cancel").addEventListener("click", done);
    gate.addEventListener("keydown", (e) => { if (e.key === "Escape") { e.stopPropagation(); done(); } });
    input.focus();

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (input.value.trim().toLowerCase() === DEV_ACCESS_CODE) {
        localStorage.setItem(DEV_ACCESS_KEY, String(Date.now() + DEV_ACCESS_DURATION));
        done();
        setOpen(true);
        showLevels("1");
        return;
      }
      input.value = "";
      msg.textContent = "Code incorrect. Réessaie.";
      input.focus();
    });
  };

  toggle.addEventListener("click", () => {
    if (!panel.hidden) {
      setOpen(false);
      return;
    }
    if (Number(localStorage.getItem(DEV_ACCESS_KEY)) > Date.now()) {
      setOpen(true);
      showLevels("1");
    } else if (!document.querySelector(".dev-gate")) {
      openGate();
    }
  });
  close.addEventListener("click", () => setOpen(false));

  // Swaps the level column while keeping the six-part menu compact.
  const showLevels = (partNumber) => {
    levelPanel.hidden = false;

    menu.querySelectorAll(".dev-mode-level-group").forEach((group) => {
      group.hidden = group.dataset.levelsFor !== partNumber;
    });

    partToggles.forEach((partToggle) => {
      const isActive = partToggle.dataset.part === partNumber;
      partToggle.setAttribute("aria-expanded", String(isActive));
      partToggle.classList.toggle("is-active", isActive);
    });
  };

  partToggles.forEach((partToggle) => {
    partToggle.addEventListener("focus", () => {
      showLevels(partToggle.dataset.part);
    });
    partToggle.addEventListener("click", () => {
      showLevels(partToggle.dataset.part);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setOpen(false);
    }
  });
})();
