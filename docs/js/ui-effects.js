// ============================================================================
// Effets d'interface : micro-animations (ondulations, particules) et ambiance visuelle (arrière-plan par niveau, panneau des clés) et curseur premium.
// Sur l'accueil et le hub (pages légères), seul le curseur premium est actif.
// ============================================================================
(() => {
  if (document.body.matches(".index-page, .hub-page")) return;
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
  if (document.body.matches(".index-page, .hub-page")) return;
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

// --- Ambiance visuelle : choisit l'arrière-plan selon le niveau ou le boss ---
(() => {
  if (document.body.matches(".index-page, .hub-page")) return;
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
  const part = level ? Math.ceil(level / 10) : 0;
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

// --- Curseur premium (point + anneau à inertie), scrollbars thématiques et sélection de texte ---
// Couleur pilotée par --fx-rgb (posée par scene-bg.js selon l'univers de la page).
(() => {
  if (window.__echoesUiFx || document.querySelector(".level-header")) return;
  window.__echoesUiFx = true;

  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const style = document.createElement("style");
  style.textContent = `
    :root{--fx-rgb:121,247,255}
    ::selection{background:rgba(var(--fx-rgb),.28);color:#fff}
    ::-webkit-scrollbar{width:10px;height:10px}
    ::-webkit-scrollbar-track{background:linear-gradient(90deg,transparent 40%,rgba(var(--fx-rgb),.07) 50%,transparent 60%)}
    ::-webkit-scrollbar-thumb{background:linear-gradient(180deg,rgba(var(--fx-rgb),.75),rgba(179,108,255,.7));border-radius:10px;border:3px solid transparent;background-clip:padding-box;box-shadow:0 0 10px rgba(var(--fx-rgb),.35);transition:background .3s}
    ::-webkit-scrollbar-thumb:hover{background:linear-gradient(180deg,rgb(var(--fx-rgb)),rgba(210,150,255,.95));background-clip:padding-box;border-width:2px}
    ::-webkit-scrollbar-thumb:active{background:#fff;background-clip:padding-box}
    ::-webkit-scrollbar-corner{background:transparent}
    @supports not selector(::-webkit-scrollbar){*{scrollbar-width:thin;scrollbar-color:rgba(var(--fx-rgb),.7) transparent}}
    :focus-visible{outline:2px solid rgba(var(--fx-rgb),.85);outline-offset:3px;border-radius:4px}
    .fx-cursor-on,.fx-cursor-on *{cursor:none!important}
    .fx-cursor-on input:not([type=checkbox]):not([type=radio]):not([type=range]),.fx-cursor-on textarea,.fx-cursor-on [contenteditable]{cursor:text!important}
    #fx-dot,#fx-ring{position:fixed;left:0;top:0;pointer-events:none;z-index:2147483647;opacity:0;transition:opacity .2s,width .2s,height .2s,margin .2s,border-color .2s,background .2s,border-radius .2s,box-shadow .2s}
    #fx-dot{width:6px;height:6px;margin:-3px 0 0 -3px;border:1px solid #fff;border-radius:50%;background:rgb(var(--fx-rgb));box-shadow:0 0 10px 2px rgba(var(--fx-rgb),.7);transition:opacity .2s,width .16s,height .16s,margin .16s,background .2s,box-shadow .2s}
    #fx-ring{width:34px;height:34px;margin:-17px 0 0 -17px;border-radius:50%;border:1px solid rgba(var(--fx-rgb),.62);box-shadow:0 0 14px rgba(var(--fx-rgb),.2),inset 0 0 8px rgba(var(--fx-rgb),.1)}
    #fx-ring::before,#fx-ring::after{content:"";position:absolute;left:50%;top:50%;background:rgba(var(--fx-rgb),.9);opacity:0;transition:opacity .16s}
    #fx-ring::before{width:9px;height:1px;margin:0 0 0 -4px}
    #fx-ring::after{width:1px;height:9px;margin:-4px 0 0 0}
    .fx-on #fx-dot,.fx-on #fx-ring{opacity:1}
    .fx-hover #fx-ring{width:42px;height:42px;margin:-21px 0 0 -21px;border-color:#fff;background:rgba(var(--fx-rgb),.1);box-shadow:0 0 18px rgba(var(--fx-rgb),.4),inset 0 0 10px rgba(var(--fx-rgb),.14)}
    .fx-hover #fx-ring::before,.fx-hover #fx-ring::after{opacity:.8}
    .fx-hover #fx-dot{width:4px;height:4px;margin:-2px 0 0 -2px;box-shadow:0 0 12px 3px rgba(var(--fx-rgb),.85)}
    .fx-grab #fx-ring{border-radius:9px;border-style:dashed}
    .fx-grabbing #fx-ring{width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:7px;background:rgba(var(--fx-rgb),.2)}
    .fx-crosshair #fx-ring{border-radius:8px}
    .fx-down #fx-ring{width:24px;height:24px;margin:-12px 0 0 -12px;background:rgba(var(--fx-rgb),.28);box-shadow:0 0 22px rgba(var(--fx-rgb),.55)}
    .fx-click #fx-ring{border-color:#fff;box-shadow:0 0 24px rgba(var(--fx-rgb),.7),inset 0 0 10px rgba(var(--fx-rgb),.2)}
    .fx-disabled #fx-ring{border-style:dashed;border-color:rgba(160,170,190,.5);background:none;box-shadow:none}
    .fx-disabled #fx-ring::before,.fx-disabled #fx-ring::after{opacity:0}
    .fx-disabled #fx-dot{background:#8a93a8;box-shadow:none}
    .fx-text #fx-ring{opacity:0!important}
    .fx-text #fx-dot{width:2px;height:18px;margin:-9px 0 0 -1px;border-radius:1px}
    @media (prefers-reduced-motion:reduce){#fx-ring,#fx-dot{transition:none}}
  `;
  document.head.appendChild(style);

  if (!fine || localStorage.getItem("echoes-fx-cursor") === "off") return;

  const root = document.documentElement;
  const dot = document.createElement("div");
  dot.id = "fx-dot";
  const ring = document.createElement("div");
  ring.id = "fx-ring";
  document.body.append(ring, dot);
  root.classList.add("fx-cursor-on");

  const INTERACTIVE = "a[href],button,[role=button],summary,select,label[for],input[type=checkbox],input[type=radio],input[type=range],.level-card,.dev-mode-toggle,[data-cursor=hover]";
  const DRAGGABLE = "[draggable=true],[data-cursor=grab],.drag-handle,.puzzle-piece,.resonance-piece,.alignment-token,.sorting-token,.color-symbol,.geometry-point";
  const CROSSHAIR = "[data-cursor=crosshair],.flow-cell,.rhythm-pulse";
  const TEXT = "input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=button]):not([type=submit]),textarea,[contenteditable=true]";
  let x = -100;
  let y = -100;
  let rx = x;
  let ry = y;
  let started = false;
  let frame = 0;
  let pressed = false;
  let overDraggable = false;
  let clickTimer;

  const render = () => {
    frame = 0;
    const easing =
      reduce || document.body.classList.contains("index-page") ? 1 : 0.2;
    rx += (x - rx) * easing;
    ry += (y - ry) * easing;
    dot.style.transform = `translate3d(${x}px,${y}px,0)`;
    ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;
    if (Math.abs(x - rx) > 0.1 || Math.abs(y - ry) > 0.1)
      frame = requestAnimationFrame(render);
  };

  const scheduleRender = () => {
    if (!frame) frame = requestAnimationFrame(render);
  };

  window.addEventListener("pointermove", (e) => {
    x = e.clientX;
    y = e.clientY;
    if (!started) {
      started = true;
      rx = x;
      ry = y;
      root.classList.add("fx-on");
    }
    const el = e.target instanceof Element ? e.target : null;
    const hit = el && el.closest(INTERACTIVE);
    const draggable = el && el.closest(DRAGGABLE);
    const crosshair = el && el.closest(CROSSHAIR);
    const pointerTarget = hit || draggable || crosshair;
    const disabled = pointerTarget &&
      (pointerTarget.matches(":disabled") ||
        pointerTarget.getAttribute("aria-disabled") === "true");
    overDraggable = !!draggable && !disabled;
    root.classList.toggle("fx-hover", !!pointerTarget && !disabled);
    root.classList.toggle("fx-disabled", !!disabled);
    root.classList.toggle("fx-grab", overDraggable && !e.buttons);
    root.classList.toggle("fx-grabbing", overDraggable && !!e.buttons);
    root.classList.toggle("fx-crosshair", !!crosshair);
    root.classList.toggle("fx-text", !!(el && el.closest(TEXT)));
    scheduleRender();
  }, { passive: true });
  window.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    pressed = true;
    root.classList.remove("fx-click");
    root.classList.add("fx-down");
  }, { passive: true });
  window.addEventListener("pointerup", (e) => {
    if (e.button !== 0) return;
    const wasPressed = pressed;
    pressed = false;
    root.classList.remove("fx-down", "fx-grabbing");
    root.classList.toggle("fx-grab", overDraggable);
    if (!wasPressed) return;
    root.classList.add("fx-click");
    window.clearTimeout(clickTimer);
    clickTimer = window.setTimeout(() => root.classList.remove("fx-click"), 180);
  }, { passive: true });
  window.addEventListener("pointercancel", () => {
    pressed = false;
    root.classList.remove("fx-down", "fx-grabbing");
    root.classList.toggle("fx-grab", overDraggable);
  }, { passive: true });
  document.addEventListener("pointerleave", () => {
    pressed = false;
    overDraggable = false;
    root.classList.remove(
      "fx-on",
      "fx-hover",
      "fx-grab",
      "fx-grabbing",
      "fx-crosshair",
      "fx-text",
      "fx-down",
    );
  });
  document.addEventListener("pointerenter", () => started && root.classList.add("fx-on"));
})();


// ============================================================================
// Socle commun : accessibilité (lien d'évitement, réglage « réduire les effets ») .
// ============================================================================
(() => {
  const script = document.currentScript;
  const root = document.documentElement;
  const en = (() => {
    try {
      return localStorage.getItem("echoes-language") === "en";
    } catch (e) {
      return false;
    }
  })();
  const read = (key) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  };

  const style = document.createElement("style");
  style.textContent = `
    .skip-link{position:fixed;left:12px;top:-60px;z-index:100000;padding:10px 16px;border-radius:8px;background:#05070f;color:#79f7ff;border:1px solid #79f7ff;font:600 .85rem sans-serif;text-decoration:none;transition:top .15s}
    .skip-link:focus{top:calc(12px + env(safe-area-inset-top))}
    .fx-toggle{position:fixed;left:calc(12px + env(safe-area-inset-left));bottom:calc(12px + env(safe-area-inset-bottom));z-index:9000;min-width:44px;min-height:44px;padding:0 12px;border-radius:22px;border:1px solid rgba(121,247,255,.45);background:rgba(5,7,15,.82);color:#cfeff5;font:600 .72rem sans-serif;letter-spacing:.04em;cursor:pointer;opacity:.7;transition:opacity .2s,background .2s}
    .fx-toggle:hover,.fx-toggle:focus-visible,.fx-toggle[aria-pressed="true"]{opacity:1}
    .fx-toggle[aria-pressed="true"]{background:rgba(121,247,255,.22)}
    .fx-reduce *,.fx-reduce *::before,.fx-reduce *::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important;scroll-behavior:auto!important}
  `;
  document.head.appendChild(style);

  const main = document.querySelector("main");
  if (main) {
    if (!main.id) main.id = "main-content";
    if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");
    const skip = document.createElement("a");
    skip.className = "skip-link";
    skip.href = `#${main.id}`;
    skip.textContent = en ? "Skip to content" : "Aller au contenu";
    document.body.prepend(skip);
  }

  const reduceOnStart =
    read("echoes-reduce") === "1" ||
    (read("echoes-reduce") === null &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "fx-toggle";
  const labels = en
    ? ["Reduce effects", "Effects reduced"]
    : ["Réduire les effets", "Effets réduits"];
  const apply = (on, save) => {
    root.classList.toggle("fx-reduce", on);
    toggle.setAttribute("aria-pressed", String(on));
    toggle.textContent = on ? labels[1] : labels[0];
    if (save) {
      try {
        localStorage.setItem("echoes-reduce", on ? "1" : "0");
      } catch (e) {}
    }
    window.dispatchEvent(new CustomEvent("echoes:reduce", { detail: on }));
  };
  toggle.addEventListener("click", () =>
    apply(!root.classList.contains("fx-reduce"), true),
  );
  // Le bouton n'existe que sur l'accueil ; le réglage mémorisé s'applique ensuite partout.
  if (document.body.classList.contains("index-page")) document.body.appendChild(toggle);
  apply(reduceOnStart, false);
})();
