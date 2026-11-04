// Ligne du haut de l'accueil : la ligne elle-même se déforme quand une impulsion la traverse.
(() => {
  const header = document.querySelector(".home-topbar");
  if (!header) return;

  const NS = "http://www.w3.org/2000/svg";
  const W = 1000;
  const H = 30;
  const MID = H / 2;
  const POINTS = 160;
  const STEP = W / POINTS;

  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("class", "home-topbar-line");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.setAttribute("preserveAspectRatio", "none");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  svg.innerHTML = `
    <defs>
      <linearGradient id="homeLineGradient" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stop-color="#79f7ff" />
        <stop offset="0.48" stop-color="#79f7ff" />
        <stop offset="0.52" stop-color="#b36cff" />
        <stop offset="1" stop-color="#b36cff" />
      </linearGradient>
    </defs>
    <path d="M0 ${MID}H${W}" fill="none" stroke="url(#homeLineGradient)" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round" />`;
  header.appendChild(svg);
  const path = svg.querySelector("path");
  const flat = `M0 ${MID}H${W}`;

  // Forme d'un battement : petit creux, grand pic, plongeon, retour (u va de 0 à 1).
  const beat = (u) => {
    if (u < 0 || u > 1) return 0;
    const pieces = [
      [0.0, 0.18, 0],
      [0.18, 0.3, -0.18],
      [0.3, 0.42, 1],
      [0.42, 0.56, -1],
      [0.56, 0.68, 0.35],
      [0.68, 1, 0],
    ];
    let prev = 0;
    for (const [from, to, peak] of pieces) {
      if (u >= from && u <= to) {
        const t = (u - from) / (to - from);
        const eased = (1 - Math.cos(Math.PI * t)) / 2;
        return prev + (peak - prev) * eased;
      }
      prev = peak;
    }
    return 0;
  };

  const SPAN = 150;
  const AMP = MID - 3;
  const draw = (center) => {
    let d = "";
    for (let i = 0; i <= POINTS; i += 1) {
      const x = i * STEP;
      const y = MID - AMP * beat((x - (center - SPAN / 2)) / SPAN);
      d += (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
    }
    path.setAttribute("d", d);
  };

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  let raf = 0;
  let timer = 0;

  // Une impulsion traverse la ligne, puis elle redevient droite jusqu'à la suivante.
  const run = () => {
    if (reduced.matches || document.hidden) {
      schedule(4000);
      return;
    }
    const duration = 3200;
    const start = performance.now();
    let last = 0;
    const frame = (now) => {
      const t = (now - start) / duration;
      if (t >= 1) {
        path.setAttribute("d", flat);
        raf = 0;
        schedule(2500 + Math.random() * 3500);
        return;
      }
      if (now - last >= 33) {
        last = now;
        draw(-SPAN / 2 + t * (W + SPAN));
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
  };
  const schedule = (delay) => {
    clearTimeout(timer);
    timer = setTimeout(run, delay);
  };

  schedule(1200);
})();
