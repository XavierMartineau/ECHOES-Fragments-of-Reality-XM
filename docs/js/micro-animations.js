// ============================================================================
// Micro-animations : charge la feuille d'effets, ondulations au clic et particules (désactivé si mouvement réduit).
// ============================================================================
(() => {
  const script = document.currentScript;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (script) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = new URL("../css/micro-animations.css", script.src).href;
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
      document.addEventListener("pointerleave", () => glow.classList.remove("is-on"));
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
      }).observe(element, { childList: true, characterData: true, subtree: true });
    });
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
