(() => {
  // DEV MODE // shared navigator injected on every page.
  const script = document.currentScript;
  if (!script) {
    return;
  }

  const rootUrl = new URL("../../", script.src);
  const style = document.createElement("link");
  style.rel = "stylesheet";
  style.href = new URL("../css/dev-mode.css", script.src).href;
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
      end: 10,
      folder: "partie-1_niveau-1_à_10",
      special: [
        {
          label: "CLEE_01 // BOSS",
          file: "clee_01_boss_level.html",
        },
        {
          label: "RÉCUPÉRATION",
          file: "boss-recovery.html",
        },
        {
          label: "CLÉE_01 // CINÉMATIQUE",
          file: "clee_01_cinematic.html",
        },
      ],
    },
    {
      number: 2,
      name: "Fractures",
      start: 11,
      end: 20,
      folder: "partie-2_niveau-11_à_20",
    },
    {
      number: 3,
      name: "Éclipse",
      start: 21,
      end: 30,
      folder: "partie-3_niveau-21_à_30",
    },
    {
      number: 4,
      name: "Resonance",
      start: 31,
      end: 40,
      folder: "partie-4_niveau-31_à_40",
    },
    {
      number: 5,
      name: "Convergence",
      start: 41,
      end: 50,
      folder: "partie-5_niveau-41_à_50",
    },
    {
      number: 6,
      name: "Last Echo",
      start: 51,
      end: 60,
      folder: "partie-6_niveau-51_à_60",
    },
  ];

  // Renvoie le dossier de partie correspondant à un numéro de niveau.
  const folderForLevel = (level) => {
    if (level <= 10) return "partie-1_niveau-1_à_10";
    if (level <= 20) return "partie-2_niveau-11_à_20";
    if (level <= 30) return "partie-3_niveau-21_à_30";
    if (level <= 40) return "partie-4_niveau-31_à_40";
    if (level <= 50) return "partie-5_niveau-41_à_50";
    return "partie-6_niveau-51_à_60";
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
      <span class="dev-mode-icon" aria-hidden="true">☰</span>
      <span>DEV MODE</span>
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
      <a class="dev-mode-home" href="${new URL("index.html", rootUrl).href}">Home</a>
      <a class="dev-mode-home" href="${new URL("docs/html/partie-bonus/bonus-01.html", rootUrl).href}">Partie bonus</a>
      <label class="dev-mode-accessibility">
        <input type="checkbox" data-color-assist />
        <span>REPÈRES COULEURS ACCESSIBLES</span>
      </label>
      <div class="dev-mode-navigation">
        <div class="dev-mode-parts">
          ${parts
            .map(
              (part) => `
                <button class="dev-mode-part-toggle" type="button" data-part="${part.number}" aria-expanded="false">
                  <span>PART ${part.number}</span>
                  <span class="dev-mode-part-name">${part.name}</span>
                  <span class="dev-mode-part-count">${part.end - part.start + 1} niveaux</span>
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
                    ${Array.from(
                      { length: part.end - part.start + 1 },
                      (_, index) => {
                        const level = part.start + index;
                        return `<a href="${levelLink(level)}">${String(level).padStart(2, "0")}</a>`;
                      },
                    ).join("")}
                  </div>
                  ${
                    part.special
                      ? `<div class="dev-mode-specials">
                          <span class="dev-mode-special-title">ACCÈS SPÉCIAUX</span>
                          ${part.special
                            .map(
                              (item) =>
                                `<a class="dev-mode-special-link" href="${specialLink(part, item.file)}${item.file === "clee_01_cinematic.html" ? "?dev=1" : ""}">${item.label}</a>`,
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

  const colorAssist = menu.querySelector("[data-color-assist]");
  // Active ou désactive le mode d'aide aux couleurs et le mémorise.
  const setColorAssist = (enabled) => {
    document.body.classList.toggle("echo-color-assist", enabled);
    colorAssist.checked = enabled;
    localStorage.setItem(colorAssistKey, String(enabled));
  };
  setColorAssist(localStorage.getItem(colorAssistKey) === "true");
  colorAssist.addEventListener("change", () => setColorAssist(colorAssist.checked));

  const toggle = menu.querySelector(".dev-mode-toggle");
  const panel = menu.querySelector(".dev-mode-panel");
  const close = menu.querySelector(".dev-mode-close");
  const levelPanel = menu.querySelector(".dev-mode-level-panel");
  const partToggles = menu.querySelectorAll(".dev-mode-part-toggle");

  // Opens or closes the level navigator.
  const setOpen = (isOpen) => {
    panel.hidden = !isOpen;
    toggle.setAttribute("aria-expanded", String(isOpen));
    menu.classList.toggle("is-open", isOpen);
  };

  toggle.addEventListener("click", () => {
    if (!panel.hidden) {
      setOpen(false);
      return;
    }
    setOpen(true);
    showLevels("1");
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
