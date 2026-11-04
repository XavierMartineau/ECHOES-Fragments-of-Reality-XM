// Ligne du haut de l'accueil : électrocardiogramme (base plate, battements réguliers qui défilent).
(() => {
  const header = document.querySelector(".home-topbar");
  if (!header) return;

  const NS = "http://www.w3.org/2000/svg";
  const W = 1000;
  const H = 30;
  const MID = H / 2;
  const POINTS = 250;
  const STEP = W / POINTS;
  const PERIOD = 230; // distance entre deux battements
  const SPEED = 0.11; // unités par ms

  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("class", "home-topbar-line");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.setAttribute("preserveAspectRatio", "none");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  svg.innerHTML = `
    <defs>
      <linearGradient id="homeLineGradient" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${W}" y2="0">
        <stop offset="0" stop-color="#79f7ff" stop-opacity="0.25" />
        <stop offset="0.3" stop-color="#79f7ff" />
        <stop offset="0.7" stop-color="#b36cff" />
        <stop offset="1" stop-color="#b36cff" stop-opacity="0.25" />
      </linearGradient>
    </defs>
    <path d="M0 ${MID}H${W}" fill="none" stroke="url(#homeLineGradient)" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round" />`;
  header.appendChild(svg);
  const path = svg.querySelector("path");

  // Un battement : onde P, creux Q, grand pic R, creux S, onde T (u de 0 à 1).
  const bump = (u, c, w, a) => {
    const d = (u - c) / w;
    return a * Math.exp(-d * d);
  };
  const ecg = (u) =>
    bump(u, 0.18, 0.035, 0.16) +
    bump(u, 0.36, 0.012, -0.22) +
    bump(u, 0.4, 0.014, 1) +
    bump(u, 0.445, 0.014, -0.4) +
    bump(u, 0.68, 0.05, 0.3);

  const AMP = MID - 3;
  const draw = (time) => {
    const shift = time * SPEED * (document.body.classList.contains("reduced-effects") ? 0.25 : 1);
    let d = "";
    for (let i = 0; i <= POINTS; i += 1) {
      const x = i * STEP;
      const u = (((x + shift) % PERIOD) + PERIOD) % PERIOD / PERIOD;
      d += (i ? "L" : "M") + x.toFixed(1) + " " + (MID - AMP * ecg(u)).toFixed(1);
    }
    path.setAttribute("d", d);
  };

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  let last = 0;
  const frame = (now) => {
    requestAnimationFrame(frame);
    if (document.hidden || now - last < 33) return;
    last = now;
    draw(now);
  };

  draw(0);
  if (!reduced.matches) requestAnimationFrame(frame);
})();
