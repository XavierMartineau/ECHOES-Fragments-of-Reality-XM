// LAG FIX : mesure les FPS réels et allège automatiquement le rendu quand le jeu rame.
// Chargé sur toutes les pages. Sans effet sur un appareil rapide : le mode allégé ne s'active qu'en dessous du seuil.
(() => {
  const script = document.currentScript;
  const root = document.documentElement;
  const LOW_FPS = 45;
  const SAMPLE_MS = 1500;
  const STRIKES = 2;

  // Journal du DEV MODE : erreurs et avertissements gardés (60 max) seulement quand le DEV MODE est déverrouillé.
  try {
    if (Number(localStorage.getItem("echoes-dev-ok")) > Date.now()) {
      const LOG_KEY = "echoes-dev-log";
      const push = (type, text) => {
        try {
          const list = JSON.parse(localStorage.getItem(LOG_KEY) || "[]");
          list.push({ t: Date.now(), type, page: location.pathname.split("/").pop() || "index", text: String(text).slice(0, 300) });
          localStorage.setItem(LOG_KEY, JSON.stringify(list.slice(-60)));
        } catch (e) {}
      };
      window.addEventListener("error", (e) => push("error", `${e.message} (${(e.filename || "").split("/").pop()}:${e.lineno})`));
      window.addEventListener("unhandledrejection", (e) => push("promise", (e.reason && e.reason.message) || e.reason));
      ["error", "warn"].forEach((level) => {
        const original = console[level];
        console[level] = function (...args) {
          push(level, args.map((a) => (a && a.message) || String(a)).join(" "));
          return original.apply(this, args);
        };
      });
    }
  } catch (e) {}

  if (script) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = new URL("fps-boost.css?v=1", script.src).href;
    document.head.appendChild(link);
  }

  // Onglet masqué : on fige les animations CSS.
  document.addEventListener("visibilitychange", () => {
    root.classList.toggle("lagfix-hidden", document.hidden);
  });

  const setLite = () => {
    root.classList.add("lagfix-lite", "fx-lite");
  };

  // Réglage manuel du DEV MODE, mouvements réduits ou mesure déjà faite pendant la session : mode allégé direct.
  if (
    localStorage.getItem("echoes-perf") === "lite" ||
    sessionStorage.getItem("echoes-lagfix") === "lite" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    setLite();
    return;
  }

  // Mesure continue : 2 mesures consécutives sous le seuil => mode allégé pour la session.
  let frames = 0;
  let windowStart = 0;
  let strikes = 0;
  let warmup = 2; // les premières secondes (chargement des images) sont ignorées
  const tick = (now) => {
    if (document.hidden) {
      frames = 0;
      windowStart = 0;
    } else {
      if (!windowStart) windowStart = now;
      frames += 1;
      const elapsed = now - windowStart;
      if (elapsed >= SAMPLE_MS) {
        const fps = (frames * 1000) / elapsed;
        frames = 0;
        windowStart = now;
        if (warmup > 0) {
          warmup -= 1;
        } else if (fps < LOW_FPS) {
          strikes += 1;
          if (strikes >= STRIKES) {
            sessionStorage.setItem("echoes-lagfix", "lite");
            setLite();
            return;
          }
        } else {
          strikes = 0;
        }
      }
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
})();
