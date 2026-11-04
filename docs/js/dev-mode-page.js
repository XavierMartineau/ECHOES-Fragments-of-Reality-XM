// DEV MODE (page indépendante) : navigation, progression de test, clés et réglages.
(() => {
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => document.querySelectorAll(selector);

  const parts = [
    { number: 1, name: "Initiation", start: 1, end: 5, folder: "partie-1_niveau-1_à_5" },
    { number: 2, name: "Fractures", start: 6, end: 10, folder: "partie-2_niveau-6_à_10", special: [{ label: "BOSS 01 // CLEE_01", file: "boss-01.html" }] },
    { number: 3, name: "Éclipse", start: 11, end: 15, folder: "partie-3_niveau-11_à_15" },
    { number: 4, name: "Résonance", start: 16, end: 20, folder: "partie-4_niveau-16_à_20", special: [{ label: "BOSS 02 // CLEE_02", file: "boss-02.html" }] },
    { number: 5, name: "Convergence", start: 21, end: 25, folder: "partie-5_niveau-21_à_25" },
    { number: 6, name: "Origine", start: 26, end: 30, folder: "partie-6_niveau-26_à_30", special: [{ label: "BOSS 03 // CLEE_03", file: "boss-03.html" }] },
  ];
  const folderFor = (level) => parts.find((part) => level <= part.end)?.folder || parts[5].folder;
  const levelLink = (level) =>
    `${encodeURIComponent(folderFor(level))}/niveau-${String(level).padStart(2, "0")}.html`;
  const allKeys = [1, 2, 3, 4, 5, 6].map((n) => `resonance-${n}`);
  const Save = window.EchoesSave;

  // Retour vers la page d'où l'on vient (même origine uniquement).
  const params = new URLSearchParams(window.location.search);
  let from = params.get("from") || "";
  try {
    if (from && new URL(from, window.location.href).origin !== window.location.origin) from = "";
  } catch {
    from = "";
  }
  if (from) $("#dmBack").href = from;
  $("#dmGateCancel").href = from || "../../index.html";
  const fromLevel = Number((/niveau-(\d+)\.html/i.exec(from) || [])[1]) || null;

  // Le curseur à réticule est celui de tout le site (ui-effects.js).

  const msg = (text) => {
    $("#dmMsg").textContent = text;
  };

  // ---- Accès par code ----
  const ACCESS_CODE = "popol";
  const ACCESS_KEY = "echoes-dev-ok";
  const ACCESS_DURATION = 24 * 60 * 60 * 1000;
  const unlocked = () => Number(localStorage.getItem(ACCESS_KEY)) > Date.now();

  const start = () => {
    $("#dmGate").hidden = true;
    $("#dmBody").hidden = false;
    sessionStorage.setItem("echoes-dev-unlock", "1");
    init();
  };

  if (unlocked()) {
    start();
  } else {
    $("#dmGate").hidden = false;
    $("#dmGateInput").focus();
    $("#dmGateForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const input = $("#dmGateInput");
      if (input.value.trim().toLowerCase() === ACCESS_CODE) {
        localStorage.setItem(ACCESS_KEY, String(Date.now() + ACCESS_DURATION));
        start();
        return;
      }
      input.value = "";
      $("#dmGateMsg").textContent = "Code incorrect. Réessaie.";
      input.focus();
    });
  }

  function init() {
    // ---- Sauvegarde ----
    const currentKeys = () => Save.getKeys() || [];
    const patchSave = (build) => {
      const user = Save.getCurrentUser();
      if (!user) {
        msg("Connecte-toi d'abord (page Connexion).");
        return false;
      }
      const name = user.trim().toLowerCase();
      const next = { ...(Save.getSave(user) || {}), ...build(Save.getSave(user) || {}), username: name, updatedAt: new Date().toISOString() };
      localStorage.setItem(`echoes-save-${encodeURIComponent(name)}`, JSON.stringify(next));
      return true;
    };
    const writeKeys = (nextKeys) => {
      if (Save.getCurrentUser()) return patchSave(() => ({ keys: nextKeys }));
      localStorage.setItem("echoes-guest-keys", JSON.stringify(nextKeys));
      return true;
    };

    // ---- État et clés ----
    const keyGrid = $("#dmKeyGrid");
    keyGrid.innerHTML = [1, 2, 3, 4, 5, 6]
      .map((n) => `<button class="dm-btn dm-key" type="button" data-key-toggle="${n}" aria-pressed="false">Clé 0${n}</button>`)
      .join("");
    const refresh = () => {
      const keys = currentKeys();
      $$("[data-key-toggle]").forEach((button) => {
        const owned = keys.includes(`resonance-${button.dataset.keyToggle}`);
        button.classList.toggle("is-owned", owned);
        button.setAttribute("aria-pressed", String(owned));
      });
      const user = Save.getCurrentUser();
      const done = ((user && Save.getSave(user)) || {}).completedLevels?.length || 0;
      $("#dmInfo").innerHTML = [
        ["Joueur", user || "invité (non connecté)"],
        ["Niveau d'origine", fromLevel || "—"],
        ["Niveaux terminés", `${done} / 30`],
        ["Clés", `${keys.filter((id) => allKeys.includes(id)).length} / 6`],
      ]
        .map(([label, value]) => `<div class="dm-info"><em>${label}</em><b>${value}</b></div>`)
        .join("");
    };

    $("[data-give-keys]").addEventListener("click", () => {
      if (writeKeys([...new Set([...currentKeys(), ...allKeys])])) {
        msg("Clés 1 à 6 données : elles s'afficheront dans toutes les interfaces de clés.");
        refresh();
      }
    });
    $("[data-clear-keys]").addEventListener("click", () => {
      if (writeKeys([])) {
        msg("Toutes les clés retirées.");
        refresh();
      }
    });
    $$("[data-key-toggle]").forEach((button) =>
      button.addEventListener("click", () => {
        const id = `resonance-${button.dataset.keyToggle}`;
        const keys = currentKeys();
        const next = keys.includes(id) ? keys.filter((key) => key !== id) : [...keys, id];
        if (writeKeys(next)) {
          msg(`Clé 0${button.dataset.keyToggle} ${next.includes(id) ? "donnée" : "retirée"}.`);
          refresh();
        }
      }),
    );

    // ---- Progression ----
    $("[data-skip-go]").addEventListener("click", () => {
      const target = Math.min(30, Math.max(1, Number($("[data-skip-level]").value) || 1));
      const levels = Array.from({ length: target - 1 }, (_, i) => i + 1);
      const bosses = [];
      const keys = [];
      [[10, "boss-02", "resonance-1"], [20, "boss-04", "resonance-2"], [30, "boss-06", "resonance-3"]].forEach(([end, id, key]) => {
        if (target > end) {
          bosses.push(id);
          keys.push(key);
        }
      });
      const ok = patchSave((save) => ({
        currentPage: "level",
        currentLevel: target,
        completedLevels: [...new Set([...(save.completedLevels || []), ...levels])].sort((a, b) => a - b),
        completedBosses: [...new Set([...(save.completedBosses || []), "intro", ...bosses])],
        keys: [...new Set([...(save.keys || []), ...keys])],
      }));
      if (ok) window.location.href = levelLink(target);
    });
    $("[data-complete-all]").addEventListener("click", () => {
      const ok = patchSave((save) => ({
        currentPage: "level",
        currentLevel: 30,
        completedLevels: Array.from({ length: 30 }, (_, i) => i + 1),
        completedBosses: [...new Set([...(save.completedBosses || []), "intro", "boss-02", "boss-04", "boss-06"])],
        keys: [...new Set([...(save.keys || []), ...allKeys])],
      }));
      if (ok) {
        msg("Tout est terminé (niveaux 1–30, boss, 6 clés).");
        refresh();
      }
    });
    $("[data-reset-progress]").addEventListener("click", () => {
      if (!window.confirm("Réinitialiser la progression de ce joueur ?")) return;
      const user = Save.getCurrentUser();
      if (user) {
        const ok = patchSave(() => ({ currentPage: "introduction", currentLevel: 0, completedLevels: [], completedBosses: [], keys: [] }));
        if (!ok) return;
        localStorage.removeItem(`echoes-completed-levels-${encodeURIComponent(user.trim().toLowerCase())}`);
      }
      localStorage.removeItem("echoes-guest-keys");
      localStorage.removeItem("echoes-completed-levels");
      msg("Progression réinitialisée.");
      refresh();
    });

    // ---- Options ----
    // « echoes-fx-cursor » et « echoes-fx-scene » valent "off" quand désactivés, « echoes-perf » vaut "lite" en mode performance.
    $$("[data-fx-toggle]").forEach((box) => {
      const key = box.dataset.fxToggle;
      const on = box.dataset.on || "on";
      const off = box.dataset.off || "off";
      const inverted = !box.dataset.on;
      const value = localStorage.getItem(key);
      box.checked = inverted ? value !== off : value === on;
      box.addEventListener("change", () => {
        if (inverted) box.checked ? localStorage.removeItem(key) : localStorage.setItem(key, off);
        else box.checked ? localStorage.setItem(key, on) : localStorage.removeItem(key);
        msg("Réglage enregistré : il s'applique au prochain chargement du jeu.");
      });
    });
    const colorAssist = $("[data-color-assist]");
    colorAssist.checked = localStorage.getItem("echoes-color-assist") === "true";
    colorAssist.addEventListener("change", () => {
      localStorage.setItem("echoes-color-assist", String(colorAssist.checked));
      msg("Réglage enregistré.");
    });
    const fps = $("[data-fps-toggle]");
    fps.checked = localStorage.getItem("echoes-dev-fps") === "1";
    fps.addEventListener("change", () => {
      fps.checked ? localStorage.setItem("echoes-dev-fps", "1") : localStorage.removeItem("echoes-dev-fps");
      msg("Compteur de FPS " + (fps.checked ? "activé" : "désactivé") + " dans le jeu.");
    });

    // ---- Outils ----
    $("[data-copy-save]").addEventListener("click", async () => {
      const user = Save.getCurrentUser();
      const data = JSON.stringify({ user: user || null, save: user ? Save.getSave(user) : null, keys: currentKeys() }, null, 2);
      try {
        await navigator.clipboard.writeText(data);
        msg("Sauvegarde copiée dans le presse-papiers.");
      } catch {
        window.prompt("Copie la sauvegarde :", data);
      }
    });
    $("[data-lock-dev]").addEventListener("click", () => {
      localStorage.removeItem(ACCESS_KEY);
      window.location.href = from || "../../index.html";
    });

    // ---- Parties et niveaux ----
    $("#dmParts").innerHTML = parts
      .map(
        (part) => `<button class="dm-part" type="button" data-part="${part.number}" aria-expanded="false">
          <span class="dm-part-n">PART ${part.number}</span><strong>${part.name}</strong><small>5 niveaux</small></button>`,
      )
      .join("");
    $("#dmLevels").innerHTML = parts
      .map((part) => {
        const levels = Array.from({ length: part.end - part.start + 1 }, (_, i) => part.start + i);
        return `<div class="dm-levels" data-levels-for="${part.number}" hidden>
          <h3>PART ${part.number} // NIVEAUX ${part.start}–${part.end}</h3>
          <div class="dm-level-grid">${levels.map((n) => `<a href="${levelLink(n)}">${String(n).padStart(2, "0")}</a>`).join("")}</div>
          ${(part.special || []).map((item) => `<a class="dm-boss" href="${encodeURIComponent(part.folder)}/${item.file}">${item.label}</a>`).join("")}
        </div>`;
      })
      .join("");
    const showPart = (number) => {
      $$("[data-levels-for]").forEach((group) => (group.hidden = group.dataset.levelsFor !== number));
      $$(".dm-part").forEach((button) => {
        const active = button.dataset.part === number;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-expanded", String(active));
      });
    };
    $$(".dm-part").forEach((button) => button.addEventListener("click", () => showPart(button.dataset.part)));
    showPart(String((parts.find((part) => fromLevel && fromLevel <= part.end) || parts[0]).number));

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !event.target.closest?.("input")) window.location.href = $("#dmBack").href;
    });
    refresh();
  }
})();
