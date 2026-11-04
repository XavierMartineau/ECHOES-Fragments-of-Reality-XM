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
      <linearGradient id="homeLineGradient" gradientUnits="userSpaceOnUse" spreadMethod="repeat" x1="0" y1="0" x2="1000" y2="0">
        <stop offset="0" stop-color="#79f7ff" />
        <stop offset="0.35" stop-color="#79f7ff" />
        <stop offset="0.5" stop-color="#ffffff" />
        <stop offset="0.65" stop-color="#b36cff" />
        <stop offset="1" stop-color="#79f7ff" />
      </linearGradient>
    </defs>
    <path d="M0 ${MID}H${W}" fill="none" stroke="url(#homeLineGradient)" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round" />
    <circle class="home-line-head" r="4" fill="#fff" opacity="0" />`;
  header.appendChild(svg);
  const path = svg.querySelector("path");
  const head = svg.querySelector(".home-line-head");
  const grad = svg.querySelector("linearGradient");
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
  // Ligne vivante : une houle permanente, plus des battements qui la traversent avec une tête lumineuse.
  const pulses = [];
  let nextSpawn = 600;

  const yAt = (x, time) => {
    const swell = 1.6 * Math.sin(x * 0.045 - time * 0.0022) + 1.1 * Math.sin(x * 0.11 + time * 0.0031);
    let y = MID + swell * 0.6;
    for (const p of pulses) y -= AMP * p.amp * beat((x - (p.x - SPAN / 2)) / SPAN);
    return y;
  };

  const draw = (time) => {
    let d = "";
    for (let i = 0; i <= POINTS; i += 1) {
      const x = i * STEP;
      d += (i ? "L" : "M") + x.toFixed(1) + " " + yAt(x, time).toFixed(1);
    }
    path.setAttribute("d", d);
    grad.setAttribute("x1", ((time * 0.12) % W).toFixed(1));
    grad.setAttribute("x2", (((time * 0.12) % W) + W).toFixed(1));
    const lead = pulses[0];
    if (lead) {
      head.setAttribute("cx", lead.x.toFixed(1));
      head.setAttribute("cy", yAt(lead.x, time).toFixed(1));
      head.setAttribute("opacity", "1");
    } else {
      head.setAttribute("opacity", "0");
    }
  };

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  let raf = 0;
  let last = 0;
  let lastTime = 0;

  const frame = (now) => {
    raf = requestAnimationFrame(frame);
    if (document.hidden || now - last < 33) return;
    const dt = lastTime ? Math.min(now - lastTime, 100) : 33;
    last = now;
    lastTime = now;
    nextSpawn -= dt;
    if (nextSpawn <= 0) {
      pulses.push({ x: -SPAN / 2, speed: W / (2400 + Math.random() * 900), amp: 0.7 + Math.random() * 0.3 });
      nextSpawn = 1400 + Math.random() * 2400;
    }
    for (const p of pulses) p.x += p.speed * dt;
    while (pulses.length && pulses[0].x > W + SPAN / 2) pulses.shift();
    draw(now);
  };

  if (reduced.matches) {
    path.setAttribute("d", flat);
  } else {
    raf = requestAnimationFrame(frame);
  }
  document.addEventListener("visibilitychange", () => {
    lastTime = 0;
  });
})();
