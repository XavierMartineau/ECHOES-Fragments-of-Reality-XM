// ============================================================================
// Effets d'interface : micro-animations (ondulations, particules) et ambiance visuelle (arri?re-plan par niveau, panneau des cl?s).
// ============================================================================
(() => {
  const script = document.currentScript;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (script) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = new URL("../css/composants/ui-effects.css", script.src).href;
    document.head.appendChild(link);
  }
  if (reduced) return;

  // Initialise les effets (ondulations, particules).
  const init = () => {
    const root = document.body;

    const targets = document.querySelectorAll(
      "main > *, .level-shell > *, .login-card, .intro-card, .puzzle-panel, .level-intro",
    );
    let order = 0;
    targets.forEach((element) => {
      if (element.closest("[data-no-fx]")) return;
      element.style.setProperty("--fx-i", String(Math.min(order++, 8)));
      element.classList.add("fx-rise");
    });

    const particles = document.createElement("div");
    particles.className = "fx-particles";
    particles.setAttribute("aria-hidden", "true");
    for (let index = 0; index < 14; index += 1) {
      const dot = document.createElement("span");
      dot.style.setProperty("--fx-left", `${Math.random() * 100}%`);
      dot.style.setProperty("--fx-size", `${2 + Math.random() * 3}px`);
      dot.style.setProperty("--fx-dur", `${12 + Math.random() * 14}s`);
      dot.style.setProperty("--fx-delay", `${-Math.random() * 20}s`);
      dot.style.setProperty("--fx-dx", `${(Math.random() - 0.5) * 120}px`);
      particles.appendChild(dot);
    }
    root.appendChild(particles);

    if (window.matchMedia("(hover: hover)").matches) {
      const glow = document.createElement("div");
      glow.className = "fx-glow";
      glow.setAttribute("aria-hidden", "true");
      root.appendChild(glow);
      let frame = 0;
      let x = 0;
      let y = 0;
      window.addEventListener(
        "pointermove",
        (event) => {
          x = event.clientX;
          y = event.clientY;
          if (frame) return;
          frame = requestAnimationFrame(() => {
            glow.style.transform = `translate(${x}px, ${y}px)`;
            glow.classList.add("is-on");
            frame = 0;
          });
        },
        { passive: true },
      );
      document.addEventListener("pointerleave", () =>
        glow.classList.remove("is-on"),
      );
    }

    document.addEventListener(
      "pointerdown",
      (event) => {
        if (!event.target.closest("button, a, [role='button']")) return;
        const ring = document.createElement("span");
        ring.className = "fx-ripple";
        ring.style.left = `${event.clientX}px`;
        ring.style.top = `${event.clientY}px`;
        ring.setAttribute("aria-hidden", "true");
        root.appendChild(ring);
        ring.addEventListener("animationend", () => ring.remove());
        for (let index = 0; index < 6; index += 1) {
          const spark = document.createElement("span");
          const angle = (Math.PI * 2 * index) / 6 + Math.random();
          const distance = 20 + Math.random() * 22;
          spark.className = "fx-spark";
          spark.style.left = `${event.clientX}px`;
          spark.style.top = `${event.clientY}px`;
          spark.style.setProperty("--fx-x", `${Math.cos(angle) * distance}px`);
          spark.style.setProperty("--fx-y", `${Math.sin(angle) * distance}px`);
          spark.setAttribute("aria-hidden", "true");
          root.appendChild(spark);
          spark.addEventListener("animationend", () => spark.remove());
        }
      },
      { passive: true },
    );

    const flashTargets = document.querySelectorAll(
      "#puzzleStatus, .system-transmission p, .progress-readout, #timerReadout, .status-text",
    );
    flashTargets.forEach((element) => {
      let last = element.textContent;
      new MutationObserver(() => {
        if (element.textContent === last) return;
        last = element.textContent;
        element.classList.remove("fx-flash");
        void element.offsetWidth;
        element.classList.add("fx-flash");
      }).observe(element, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    });
  };

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
})();

// ============================================================================
// Animations « premium » : balayage lumineux, relief 3D des panneaux, révélation au défilement.
// ============================================================================
(() => {
  const script = document.currentScript;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced) return;

  const init = () => {
    const scan = document.createElement("div");
    scan.className = "fx-scanline";
    scan.setAttribute("aria-hidden", "true");
    document.body.appendChild(scan);

    if (window.matchMedia("(hover: hover)").matches) {
      document.querySelectorAll(".puzzle-panel").forEach((panel) => {
        panel.addEventListener("pointermove", (event) => {
          if (event.target.closest("input, button")) return;
          const box = panel.getBoundingClientRect();
          const px = (event.clientX - box.left) / box.width - 0.5;
          const py = (event.clientY - box.top) / box.height - 0.5;
          panel.style.transform = `perspective(1400px) rotateX(${(-py * 1.4).toFixed(2)}deg) rotateY(${(px * 1.4).toFixed(2)}deg)`;
        });
        panel.addEventListener("pointerleave", () => {
          panel.style.transform = "";
        });
      });
    }

    if ("IntersectionObserver" in window) {
      const seen = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-in");
            seen.unobserve(entry.target);
          });
        },
        { threshold: 0.12 },
      );
      document.querySelectorAll(".level-footer").forEach((element) => {
        if (element.getBoundingClientRect().top < window.innerHeight) return;
        element.classList.add("fx-reveal");
        seen.observe(element);
      });
    }

  };

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
})();

// --- Ambiance visuelle : choisit l'arri?re-plan selon le niveau ou le boss ---
(() => {
  const path = window.location.pathname;
  const levelMatch = path.match(/niveau-(\d+)\.html(?:$|[?#])/i);
  const isBoss = path.includes("boss-01");
  const isSecondBoss = path.includes("boss-02");
  const isThirdBoss = path.includes("boss-03");
  const level = levelMatch
    ? Number(levelMatch[1])
    : isBoss
      ? 10
      : isSecondBoss
        ? 20
        : isThirdBoss
          ? 30
          : 0;
  const part = level ? Math.ceil(level / 10) : path.includes("bonus") ? 7 : 0;
  const palettes = [
    ["#79f7ff", "#b36cff"],
    ["#79f7ff", "#b36cff"],
    ["#4b9eff", "#d4dce7"],
    ["#ff4fd8", "#ffe39a"],
    ["#38d6ff", "#bd63ff"],
    ["#ff5a6e", "#ffd0a8"],
    ["#ffd24d", "#fff6c8"],
    ["#ff79d1", "#79a8ff"],
  ];
  let [accent, secondary] =
    palettes[Math.max(0, Math.min(part, palettes.length - 1))];
  if (isBoss) [accent, secondary] = ["#ff456d", "#8d1dff"];
  if (isSecondBoss) [accent, secondary] = ["#45e5d2", "#ffbd69"];
  if (isThirdBoss) [accent, secondary] = ["#ff4fd8", "#ffd24d"];
  const root = document.body;
  const specialMode = isBoss ? "boss" : isSecondBoss ? "boss-two" : "";
  if (specialMode) root.classList.add(`echo-special-${specialMode}`);
  root.classList.add("echo-ambient-page");
  root.dataset.level = String(level || "intro");
  root.dataset.part = String(part);
  root.dataset.special = specialMode;
  root.style.setProperty("--ambient-accent", accent);
  root.style.setProperty("--ambient-secondary", secondary);
  root.style.setProperty("--ambient-level-shift", `${(level % 10) * 7}deg`);
  root.style.setProperty("--ambient-speed", `${22 + (level % 6) * 2}s`);

  const levelHeader = root.querySelector(".level-header");
  if (levelHeader && !root.querySelector(".key-collection")) {
    const english = localStorage.getItem("echoes-language") === "en";
    const keyStylesheet = document.createElement("link");
    keyStylesheet.rel = "stylesheet";
    keyStylesheet.href = new URL(
      "../css/composants/key-collection-ui.css?v=1",
      document.currentScript.src,
    ).href;
    document.head.appendChild(keyStylesheet);
    const dock = document.createElement("aside");
    dock.className = "key-collection-dock";
    const collection = document.createElement("section");
    collection.className = "key-collection";
    collection.id = "keyCollection";
    collection.setAttribute("aria-labelledby", "keyCollectionTitle");

    const heading = document.createElement("h2");
    heading.className = "key-collection-title";
    heading.id = "keyCollectionTitle";
    heading.textContent = english ? "KEYS UI" : "UI clées";

    const list = document.createElement("ol");
    list.className = "key-collection-list";
    list.setAttribute(
      "aria-label",
      english ? "Resonance keys" : "Clés de résonance",
    );
    const keyNames = english
      ? ["Signal", "Fracture", "Eclipse", "Recycler", "Shield", "Master"]
      : ["Signal", "Fracture", "Éclipse", "Recycleur", "Bouclier", "Maîtresse"];
    const entries = [];
    for (let index = 1; index <= 6; index += 1) {
      const number = String(index).padStart(2, "0");
      const item = document.createElement("li");
      item.className = "key-collection-item";
      item.dataset.keyId = `resonance-${index}`;

      const imageFrame = document.createElement("span");
      imageFrame.className = "key-collection-image";
      imageFrame.setAttribute("aria-hidden", "true");
      const image = document.createElement("img");
      image.src = `../../assets/svg/cles/key-${number}-usb.svg`;
      image.alt = "";
      imageFrame.appendChild(image);

      const name = document.createElement("span");
      name.className = "key-collection-name";
      name.textContent = keyNames[index - 1];
      const state = document.createElement("span");
      state.className = "key-collection-state";

      item.append(imageFrame, name, state);
      list.appendChild(item);
      entries.push({ id: item.dataset.keyId, item, state });
    }

    collection.append(heading, list);
    const toggle = document.createElement("button");
    toggle.className = "key-collection-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-controls", collection.id);
    toggle.setAttribute("aria-expanded", "true");
    const toggleIcon = document.createElement("span");
    toggleIcon.setAttribute("aria-hidden", "true");
    toggleIcon.textContent = "‹";
    toggle.appendChild(toggleIcon);
    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
      toggle.setAttribute(
        "aria-label",
        english
          ? isOpen
            ? "Open keys panel"
            : "Close keys panel"
          : isOpen
            ? "Ouvrir l’interface des clés"
            : "Fermer l’interface des clés",
      );
      toggleIcon.textContent = isOpen ? "›" : "‹";
      dock.classList.toggle("is-collapsed", isOpen);
    });
    toggle.setAttribute(
      "aria-label",
      english ? "Close keys panel" : "Fermer l’interface des clés",
    );
    dock.append(collection, toggle);
    levelHeader.insertAdjacentElement("afterend", dock);
    if (window.matchMedia("(max-width: 900px)").matches) toggle.click();

    const refreshKeys = () => {
      const keys = window.EchoesSave?.getKeys?.() || [];
      entries.forEach(({ id, item, state }, index) => {
        const unlocked = keys.includes(id);
        item.classList.toggle("is-unlocked", unlocked);
        item.setAttribute(
          "aria-label",
          english
            ? `${keyNames[index]} key, ${unlocked ? "unlocked" : "locked"}`
            : `Clé ${keyNames[index]}, ${unlocked ? "débloquée" : "verrouillée"}`,
        );
        state.textContent = english
          ? unlocked
            ? "UNLOCKED"
            : "LOCKED"
          : unlocked
            ? "DÉBLOQUÉE"
            : "VERROUILLÉE";
      });
    };
    refreshKeys();
    document.addEventListener("echoes:key-unlocked", refreshKeys);
    window.addEventListener("storage", refreshKeys);
  }

  if (root.querySelector(".echo-ambient-field")) return;
  const field = document.createElement("div");
  field.className = "echo-ambient-field";
  field.setAttribute("aria-hidden", "true");
  const scan = document.createElement("span");
  scan.className = "echo-ambient-scan";
  field.appendChild(scan);
  root.prepend(field);
})();
