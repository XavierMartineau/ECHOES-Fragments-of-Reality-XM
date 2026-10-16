// SCENE BG // moteur d'arrière-plan contextuel : choisit le motif du puzzle (scene-motifs.js), l'anime en canvas
// et expose sa couleur à l'interface (--fx-rgb). Chargé en fin de page par level-guard.js / niveaux.html.
(() => {
  if (window.__echoesScene) return;
  window.__echoesScene = true;

  const store = (key) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  };
  // Les fonds animés peuvent être coupés depuis le DEV MODE.
  if (store("echoes-fx-scene") === "off") return;

  // Réseau lent : économie de données, 2G/3G, faible débit, forte latence ou page lente à arriver.
  // Le verdict est mémorisé pour la session : les pages suivantes démarrent directement en mode léger.
  const slowConnection = () => {
    const c = navigator.connection || {};
    let slow =
      c.saveData === true ||
      /(^|-)2g$|^3g$/.test(c.effectiveType || "") ||
      (c.downlink > 0 && c.downlink < 1.5) ||
      c.rtt > 500;
    try {
      const nav = performance.getEntriesByType("navigation")[0];
      if (nav && nav.responseEnd > 2500) slow = true;
      if (slow) sessionStorage.setItem("echoes-slow", "1");
      return slow || sessionStorage.getItem("echoes-slow") === "1";
    } catch (e) {
      return slow;
    }
  };

  // Appareil lent : réglage manuel, réseau lent, peu de cœurs ou peu de mémoire.
  let lite =
    store("echoes-perf") === "lite" ||
    slowConnection() ||
    (navigator.hardwareConcurrency || 8) <= 4 ||
    (navigator.deviceMemory || 8) <= 4;
  document.documentElement.classList.toggle("fx-lite", lite);

  const me = document.currentScript;
  const base = me ? me.src : location.href;
  const path = decodeURIComponent(location.pathname);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const load = (file) =>
    new Promise((ok, ko) => {
      const el = document.createElement("script");
      el.src = new URL(file, base).href;
      el.onload = ok;
      el.onerror = ko;
      document.head.appendChild(el);
    });

  function detect(M) {
    const boss = Number((path.match(/boss-0?(\d)/i) || [])[1]);
    const level = Number((path.match(/niveau-(\d+)/i) || [])[1]);
    const part = Number((path.match(/partie-(\d)/i) || [])[1]);
    if (/niveaux\.html/i.test(path)) return M.make("hub", ["#79f7ff", "#b36cff", "#e8ffff"], 1, 0.6);
    if (boss) return M.boss(boss);
    if (level && level <= 40) return M.level(level);
    if (part === 5) return M.make("converge", ["#ffb84d", "#ff7a45", "#fff1c4"], 4, 0.85);
    if (part === 6) return M.make("memcore", ["#f5e6a8", "#ffd27a", "#ffffff"], 4, 1);
    if (/partie-bonus/i.test(path)) return M.make("wave", ["#ff79d1", "#79a8ff", "#ffd24d"], 2, 0.6);
    return null;
  }

  function start(scene) {
    const css = scene.pal[0].join(",");
    const css2 = (scene.pal[1] || scene.pal[0]).join(",");
    document.documentElement.style.setProperty("--fx-rgb", css);

    const style = document.createElement("style");
    style.textContent = `
      .background-glow,.grid-overlay,.echo-ambient-field,.hub-background{display:none!important}
      body::before{display:none!important}
      #echoes-scene{position:fixed;inset:0;z-index:-1;overflow:hidden;pointer-events:none;background:#04060e}
      #echoes-scene canvas{position:absolute;inset:0;width:100%;height:100%;animation:sb-fade 1.4s ease-out both}
      #echoes-scene .sb-vig{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 45%,rgba(3,5,12,.3),transparent 60%),radial-gradient(ellipse at center,transparent 42%,rgba(0,0,0,${0.55 + scene.tier * 0.06}) 100%)}
      #echoes-scene .sb-veil{position:absolute;inset:0;background:linear-gradient(180deg,rgba(8,12,26,.34),rgba(4,6,14,.5))}
      #echoes-scene .sb-neb{position:absolute;inset:-12%;background:radial-gradient(42% 38% at 22% 24%,rgba(${css},.2),transparent 70%),radial-gradient(46% 42% at 80% 72%,rgba(${css2},.22),transparent 70%),radial-gradient(40% 34% at 56% 48%,rgba(${css},.1),transparent 70%);animation:sb-neb 26s ease-in-out infinite alternate;will-change:transform}
      #echoes-scene .sb-neb.b{background:radial-gradient(34% 30% at 76% 20%,rgba(${css2},.16),transparent 70%),radial-gradient(38% 34% at 18% 80%,rgba(${css},.16),transparent 70%);animation-duration:34s;animation-direction:alternate-reverse}
      .sb-reveal{position:fixed;inset:0;z-index:99999;pointer-events:none;background:#04060e;animation:sb-wipe .9s cubic-bezier(.65,0,.25,1) forwards}
      .sb-reveal i{position:absolute;top:0;bottom:0;width:2px;left:0;background:rgb(${css});box-shadow:0 0 18px 4px rgba(${css},.8),0 0 60px 14px rgba(${css},.35);animation:sb-line .9s cubic-bezier(.65,0,.25,1) forwards}
      @keyframes sb-fade{from{opacity:0}to{opacity:1}}
      @keyframes sb-neb{from{transform:translate3d(-3%,-2%,0) scale(1)}to{transform:translate3d(3%,3%,0) scale(1.1)}}
      @keyframes sb-wipe{from{clip-path:inset(0 0 0 0)}to{clip-path:inset(0 0 0 100%)}}
      @keyframes sb-line{from{left:0}to{left:100%}}
      @media (prefers-reduced-motion:reduce){.sb-neb{animation:none}.sb-reveal{display:none}}
      .fx-lite .sb-neb{animation:none;will-change:auto}
    `;
    document.head.appendChild(style);

    const wrap = document.createElement("div");
    wrap.id = "echoes-scene";
    wrap.setAttribute("aria-hidden", "true");
    const canvas = document.createElement("canvas");
    wrap.appendChild(canvas);
    ["sb-neb", "sb-neb b", "sb-veil", "sb-vig"].forEach((cls) => {
      const d = document.createElement("div");
      d.className = cls;
      wrap.appendChild(d);
    });
    document.body.prepend(wrap);

    if (!reduceMotion && !lite) {
      const reveal = document.createElement("div");
      reveal.className = "sb-reveal";
      reveal.innerHTML = "<i></i>";
      document.body.appendChild(reveal);
      const drop = () => reveal.remove();
      reveal.addEventListener("animationend", (e) => e.target === reveal && drop());
      setTimeout(drop, 1600);
    }

    const c = canvas.getContext("2d");
    const s = { w: 0, h: 0, dpr: 1, k: 1, t: 0, dt: 0.016, mx: 0, my: 0, pal: scene.pal, rich: scene.rich, tier: scene.tier, m: {} };
    let tx = 0;
    let ty = 0;
    let lastMove = -10;

    function resize() {
      s.dpr = lite ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
      s.w = window.innerWidth;
      s.h = window.innerHeight;
      s.k = lite ? 0.45 : s.w < 700 ? 0.55 : 1;
      canvas.width = Math.round(s.w * s.dpr);
      canvas.height = Math.round(s.h * s.dpr);
      c.setTransform(s.dpr, 0, 0, s.dpr, 0, 0);
      scene.init(s);
      render();
    }

    function render() {
      c.save();
      c.clearRect(0, 0, s.w, s.h);
      scene.draw(c, s);
      c.restore();
    }

    window.addEventListener("pointermove", (e) => {
      tx = (e.clientX / s.w) * 2 - 1;
      ty = (e.clientY / s.h) * 2 - 1;
      lastMove = s.t;
    }, { passive: true });

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    });

    // Gouverneur de performance : si les images dépassent le budget, on dégrade par paliers
    // (qualité réduite, puis cadence réduite, puis image fixe) au lieu de saccader.
    let slow = 0;
    let sampleT = 0;
    let sampleN = 0;
    let stage = lite ? 1 : 0;
    function govern(frameMs) {
      sampleT += frameMs;
      sampleN++;
      if (sampleN < 45) return;
      const avg = sampleT / sampleN;
      sampleT = 0;
      sampleN = 0;
      slow = avg > (stage === 0 ? 26 : 40) ? slow + 1 : 0;
      if (slow < 2) return;
      slow = 0;
      stage++;
      if (stage === 1) {
        lite = true;
        try { sessionStorage.setItem("echoes-slow", "1"); } catch (e) {}
        document.documentElement.classList.add("fx-lite");
        resize();
      } else if (stage >= 2) {
        wrap.querySelectorAll(".sb-neb").forEach((n) => n.remove());
        frozen = true;
        render();
      }
    }

    let last = 0;
    let frozen = false;
    function frame(now) {
      if (frozen) return;
      requestAnimationFrame(frame);
      if (document.hidden) return;
      if (now - last < (lite || s.w < 800 ? 32 : 14)) return;
      const elapsed = now - last;
      s.dt = Math.min(0.05, elapsed / 1000);
      if (last) govern(elapsed);
      last = now;
      s.t += s.dt;
      if (s.t - lastMove > 4) {
        tx = Math.sin(s.t * 0.11) * 0.35;
        ty = Math.cos(s.t * 0.09) * 0.2;
      }
      s.mx += (tx - s.mx) * Math.min(1, s.dt * 3);
      s.my += (ty - s.my) * Math.min(1, s.dt * 3);
      render();
    }

    resize();
    if (!reduceMotion) requestAnimationFrame(frame);
  }

  load("ui-fx.js?v=1").catch(() => {});
  load("scene-motifs.js?v=1")
    .then(() => {
      const scene = detect(window.EchoesSceneMotifs);
      if (scene) start(scene);
    })
    .catch(() => {});
})();
