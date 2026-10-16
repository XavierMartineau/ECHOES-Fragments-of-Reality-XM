(() => {
  // DEV MODE // shared navigator injected on every page.
  const script = document.currentScript;
  if (!script) {
    return;
  }

  const rootUrl = new URL("../../", script.src);
  const style = document.createElement("link");
  style.rel = "stylesheet";
  style.href = new URL("../css/dev-mode.css?v=21", script.src).href;
  document.head.appendChild(style);
  const uiStyle = document.createElement("link");
  uiStyle.rel = "stylesheet";
  uiStyle.href = new URL("../css/dev-mode-ui.css?v=1", script.src).href;
  document.head.appendChild(uiStyle);

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
          label: "BOSS 01 // CLEE_01",
          file: "boss-01.html",
        },
      ],
    },
    {
      number: 2,
      name: "Fractures",
      start: 11,
      end: 20,
      folder: "partie-2_niveau-11_à_20",
      special: [
        {
          label: "CLEE_02 // BOSS",
          file: "boss-02.html",
        },
      ],
    },
    {
      number: 3,
      name: "Éclipse",
      start: 21,
      end: 30,
      folder: "partie-3_niveau-21_à_30",
      special: [
        {
          label: "CLEE_03 // BOSS",
          file: "boss-03.html",
        },
      ],
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
        <a class="dev-mode-home" href="${new URL("docs/html/partie-bonus/bonus-01.html", rootUrl).href}">Partie bonus</a>
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
      <span class="dev-mode-section">Parties</span>
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

  const colorAssist = menu.querySelector("[data-color-assist]");

  // Réglages visuels : « echoes-fx-cursor » et « echoes-fx-scene » valent "off" quand désactivés,
  // « echoes-perf » vaut "lite" en mode performance. Lus par ui-fx.js et scene-bg.js.
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
    panel.hidden = !isOpen;
    toggle.setAttribute("aria-expanded", String(isOpen));
    menu.classList.toggle("is-open", isOpen);
  };

  // Verification par code envoye par e-mail (EmailJS). Cote client uniquement : dissuasif, pas infaillible.
  const OWNER_EMAIL = "xavier.g.martinea@gmail.com";
  const CODE_TTL = 10 * 60 * 1000;
  const LOCK_TIME = 5 * 60 * 1000;
  const MAX_TRIES = 3;
  const store = {
    get: (k) => { try { return JSON.parse(sessionStorage.getItem(k) || localStorage.getItem(k) || "null"); } catch (e) { return null; } },
    set: (k, v, persist) => { try { (persist ? localStorage : sessionStorage).setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } },
  };
  const MASKED_EMAIL = "*****.g.*****@gmail.com";
  const sha = async (text) => {
    if (!window.crypto || !crypto.subtle) return text;
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const openGate = () => {
    const gate = document.createElement("div");
    gate.className = "dev-gate";
    gate.innerHTML = `
      <div class="dev-gate-card" role="dialog" aria-modal="true" aria-labelledby="devGateTitle">
        <h2 id="devGateTitle">ACCÈS DEV MODE</h2>
        <p class="dev-gate-text">Un code à 4 chiffres va être envoyé par Gmail à <strong>${MASKED_EMAIL}</strong>.</p>
        <button type="button" class="dev-gate-send">ENVOYER LE CODE</button>
        <form class="dev-gate-form" hidden>
          <input class="dev-gate-input" inputmode="numeric" maxlength="4" autocomplete="one-time-code" aria-label="Code à 4 chiffres" placeholder="••••" />
          <button type="submit" class="dev-gate-ok">VALIDER</button>
        </form>
        <p class="dev-gate-msg" role="status"></p>
        <button type="button" class="dev-gate-cancel">Annuler</button>
      </div>`;
    document.body.appendChild(gate);
    const q = (s) => gate.querySelector(s);
    const msg = q(".dev-gate-msg");
    const form = q(".dev-gate-form");
    const send = q(".dev-gate-send");
    const input = q(".dev-gate-input");
    const done = () => gate.remove();
    q(".dev-gate-cancel").addEventListener("click", done);
    gate.addEventListener("keydown", (e) => { if (e.key === "Escape") { e.stopPropagation(); done(); } });

    const lockLeft = () => Math.max(0, (store.get("echoes-dev-lock") || 0) - Date.now());
    const showLock = () => {
      const s = Math.ceil(lockLeft() / 1000);
      msg.textContent = `Trop d'essais. Réessaie dans ${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}.`;
      send.disabled = true;
      input.disabled = true;
    };
    const tick = setInterval(() => {
      if (!gate.isConnected) return clearInterval(tick);
      if (lockLeft() > 0) showLock();
      else if (send.disabled && !store.get("echoes-dev-pending")) { send.disabled = false; msg.textContent = ""; }
    }, 1000);
    if (lockLeft() > 0) showLock();

    send.addEventListener("click", async () => {
      if (lockLeft() > 0) return showLock();
      const cfg0 = () => window.ECHOES_EMAILJS || {};
      if (!cfg0().publicKey) {
        await new Promise((resolve) => {
          const s = document.createElement("script");
          s.src = new URL("emailjs-config.js", script.src).href;
          s.onload = s.onerror = resolve;
          document.head.appendChild(s);
        });
      }
      const cfg = cfg0();
      if (!cfg.publicKey || !cfg.serviceId || !cfg.templateId) {
        msg.textContent = "EmailJS n'est pas configuré (docs/js/emailjs-config.js).";
        return;
      }
      send.disabled = true;
      msg.textContent = "Envoi du code…";
      const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 10000).padStart(4, "0");
      try {
        const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            service_id: cfg.serviceId,
            template_id: cfg.templateId,
            user_id: cfg.publicKey,
            template_params: { to_email: OWNER_EMAIL, code, minutes: 10 },
          }),
        });
        if (!res.ok) throw new Error(String(res.status));
      } catch (e) {
        msg.textContent = "Échec de l'envoi du code. Réessaie.";
        send.disabled = false;
        return;
      }
      store.set("echoes-dev-pending", { hash: await sha(code), exp: Date.now() + CODE_TTL, tries: 0 });
      msg.textContent = "Code envoyé. Valable 10 minutes.";
      form.hidden = false;
      send.textContent = "RENVOYER LE CODE";
      send.disabled = false;
      input.focus();
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (lockLeft() > 0) return showLock();
      const pending = store.get("echoes-dev-pending");
      if (!pending || Date.now() > pending.exp) {
        msg.textContent = "Code expiré. Demande-en un nouveau.";
        sessionStorage.removeItem("echoes-dev-pending");
        return;
      }
      if ((await sha(input.value.trim())) === pending.hash) {
        sessionStorage.removeItem("echoes-dev-pending");
        store.set("echoes-dev-ok", Date.now() + 12 * 60 * 60 * 1000, true);
        done();
        setOpen(true);
        showLevels("1");
        return;
      }
      pending.tries += 1;
      input.value = "";
      if (pending.tries >= MAX_TRIES) {
        sessionStorage.removeItem("echoes-dev-pending");
        store.set("echoes-dev-lock", Date.now() + LOCK_TIME, true);
        showLock();
      } else {
        store.set("echoes-dev-pending", pending);
        msg.textContent = `Code incorrect. ${MAX_TRIES - pending.tries} essai(s) restant(s).`;
      }
    });
  };

  toggle.addEventListener("click", () => {
    if (!panel.hidden) {
      setOpen(false);
      return;
    }
    if ((store.get("echoes-dev-ok") || 0) > Date.now()) {
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
