// RÉUSSITE // animation unique par niveau, jouée quand le bouton « niveau suivant » apparaît.
// Dix mises en scène (anneaux, confettis, rayons, étincelles, bulles, spirale, étoiles,
// hexagones, balayage, losanges) tournent selon le numéro ; la couleur vient de la partie.
(() => {
  const levels = window.EchoesLevels;
  if (!levels) return;
  const item = levels.itemForPath();
  if (!item || (item.type !== "level" && item.type !== "boss")) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lite = document.documentElement.classList.contains("fx-lite");
  const english = document.documentElement.lang === "en";
  const accent =
    levels.series.find((serie) => serie.id === item.series)?.theme.accent || "#79f7ff";
  const palette = [accent, "#ffffff", "#ffd166"];
  const number = Math.floor(item.number);
  const variant = number % 10;
  const rand = (min, max) => min + Math.random() * (max - min);
  const amount = (count) => (lite ? Math.ceil(count / 2) : count);

  let layer = null;
  const spawn = (styles, content) => {
    const element = document.createElement("span");
    element.className = "vx-piece";
    element.setAttribute("aria-hidden", "true");
    Object.assign(element.style, styles);
    if (content) element.innerHTML = content;
    layer.appendChild(element);
    return element;
  };
  const run = (element, frames, options) => {
    const animation = element.animate(frames, {
      fill: "forwards",
      easing: "cubic-bezier(.2,.7,.3,1)",
      ...options,
    });
    animation.onfinish = () => element.remove();
  };
  const center = (x, y) => `translate(${x}px, ${y}px)`;

  const hexagon =
    '<svg viewBox="-50 -50 100 100" width="100%" height="100%"><polygon points="0,-46 40,-23 40,23 0,46 -40,23 -40,-23" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>';

  const effects = [
    // 0 // anneaux concentriques
    (box, cx, cy) => {
      for (let i = 0; i < 4; i += 1) {
        const ring = spawn({
          left: `${cx - 30}px`, top: `${cy - 30}px`, width: "60px", height: "60px",
          border: `3px solid ${palette[i % 2]}`, borderRadius: "50%",
        });
        run(ring, [
          { transform: "scale(.2)", opacity: 1 },
          { transform: `scale(${7 + i * 1.5})`, opacity: 0 },
        ], { duration: 1300, delay: i * 140 });
      }
    },
    // 1 // confettis qui tombent du haut du panneau
    (box) => {
      for (let i = 0; i < amount(48); i += 1) {
        const piece = spawn({
          left: `${box.left + rand(0, box.width)}px`, top: `${box.top - 10}px`,
          width: `${rand(6, 11)}px`, height: `${rand(10, 18)}px`,
          background: palette[i % 3],
        });
        const drift = rand(-60, 60);
        run(piece, [
          { transform: "translate(0,0) rotate(0)", opacity: 1 },
          { transform: `translate(${drift}px, ${box.height * 0.7}px) rotate(${rand(300, 900)}deg)`, opacity: 0 },
        ], { duration: rand(1300, 2100), delay: rand(0, 350), easing: "cubic-bezier(.3,.1,.6,1)" });
      }
    },
    // 2 // rayons lumineux
    (box, cx, cy) => {
      const count = amount(18);
      for (let i = 0; i < count; i += 1) {
        const angle = (360 / count) * i;
        const ray = spawn({
          left: `${cx - 2}px`, top: `${cy - 60}px`, width: "4px", height: "120px",
          background: `linear-gradient(${palette[i % 2]}, transparent)`,
          transformOrigin: "50% 60px",
        });
        run(ray, [
          { transform: `rotate(${angle}deg) translateY(-20px) scaleY(.2)`, opacity: 0 },
          { transform: `rotate(${angle}deg) translateY(-90px) scaleY(1)`, opacity: 1, offset: 0.35 },
          { transform: `rotate(${angle + 40}deg) translateY(-260px) scaleY(.4)`, opacity: 0 },
        ], { duration: 1300 });
      }
    },
    // 3 // étincelles radiales avec gravité
    (box, cx, cy) => {
      for (let i = 0; i < amount(44); i += 1) {
        const spark = spawn({
          left: `${cx - 3}px`, top: `${cy - 3}px`, width: "6px", height: "6px",
          borderRadius: "50%", background: palette[i % 3], boxShadow: `0 0 10px ${palette[i % 3]}`,
        });
        const angle = rand(0, Math.PI * 2);
        const dist = rand(90, 260);
        run(spark, [
          { transform: "translate(0,0)", opacity: 1 },
          { transform: `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist + 90}px)`, opacity: 0 },
        ], { duration: rand(1000, 1700) });
      }
    },
    // 4 // bulles qui montent depuis le bas
    (box) => {
      for (let i = 0; i < amount(28); i += 1) {
        const size = rand(10, 30);
        const bubble = spawn({
          left: `${box.left + rand(0, box.width)}px`, top: `${box.bottom - size}px`,
          width: `${size}px`, height: `${size}px`, borderRadius: "50%",
          border: `2px solid ${palette[i % 3]}`, background: "rgba(255,255,255,.08)",
        });
        run(bubble, [
          { transform: "translate(0,0) scale(.6)", opacity: 0 },
          { transform: `translate(${rand(-20, 20)}px, ${-box.height * 0.25}px) scale(1)`, opacity: 0.9, offset: 0.3 },
          { transform: `translate(${rand(-40, 40)}px, ${-box.height * 0.75}px) scale(1.15)`, opacity: 0 },
        ], { duration: rand(1400, 2200), delay: rand(0, 500), easing: "ease-out" });
      }
    },
    // 5 // spirale de points
    (box, cx, cy) => {
      const count = amount(36);
      for (let i = 0; i < count; i += 1) {
        const dot = spawn({
          left: `${cx - 4}px`, top: `${cy - 4}px`, width: "8px", height: "8px",
          borderRadius: "50%", background: palette[i % 3], boxShadow: `0 0 12px ${palette[i % 3]}`,
        });
        const base = (Math.PI * 2 * i) / count;
        const frames = [];
        for (let step = 0; step <= 8; step += 1) {
          const t = step / 8;
          const angle = base + t * 4;
          frames.push({
            transform: `${center(Math.cos(angle) * t * 240, Math.sin(angle) * t * 240)} scale(${1 - t * 0.5})`,
            opacity: t < 0.8 ? 1 : (1 - t) * 5,
          });
        }
        run(dot, frames, { duration: 1500, delay: i * 18, easing: "linear" });
      }
    },
    // 6 // étoiles qui éclosent
    (box, cx, cy) => {
      for (let i = 0; i < amount(16); i += 1) {
        const star = spawn({
          left: `${cx - 12}px`, top: `${cy - 12}px`, color: palette[i % 3],
          fontSize: `${rand(18, 34)}px`, lineHeight: "24px", textShadow: "0 0 12px currentColor",
        }, "✦");
        const angle = rand(0, Math.PI * 2);
        const dist = rand(70, 240);
        run(star, [
          { transform: "translate(0,0) scale(0) rotate(0)", opacity: 0 },
          { transform: `${center(Math.cos(angle) * dist * 0.6, Math.sin(angle) * dist * 0.6)} scale(1.5) rotate(90deg)`, opacity: 1, offset: 0.45 },
          { transform: `${center(Math.cos(angle) * dist, Math.sin(angle) * dist)} scale(0) rotate(200deg)`, opacity: 0 },
        ], { duration: rand(1100, 1600), delay: rand(0, 250) });
      }
    },
    // 7 // hexagones qui se dilatent
    (box, cx, cy) => {
      for (let i = 0; i < 4; i += 1) {
        const hex = spawn({
          left: `${cx - 40}px`, top: `${cy - 40}px`, width: "80px", height: "80px",
          color: palette[i % 3], filter: `drop-shadow(0 0 8px ${palette[i % 3]})`,
        }, hexagon);
        run(hex, [
          { transform: "scale(.2) rotate(0)", opacity: 1 },
          { transform: `scale(${5 + i}) rotate(${i % 2 ? -60 : 60}deg)`, opacity: 0 },
        ], { duration: 1400, delay: i * 160 });
      }
    },
    // 8 // lignes de balayage qui descendent sur le panneau
    (box) => {
      for (let i = 0; i < 3; i += 1) {
        const line = spawn({
          left: `${box.left}px`, top: `${box.top}px`, width: `${box.width}px`, height: i ? "2px" : "4px",
          background: `linear-gradient(90deg, transparent, ${palette[i === 0 ? 0 : 1]}, transparent)`,
          boxShadow: `0 0 18px ${accent}`,
        });
        run(line, [
          { transform: "translateY(0)", opacity: 0 },
          { transform: `translateY(${box.height * 0.1}px)`, opacity: 1, offset: 0.1 },
          { transform: `translateY(${box.height}px)`, opacity: 0.9, offset: 0.9 },
          { transform: `translateY(${box.height}px)`, opacity: 0 },
        ], { duration: 1200, delay: i * 180, easing: "ease-in-out" });
      }
    },
    // 9 // losanges qui jaillissent des côtés
    (box, cx, cy) => {
      for (let i = 0; i < amount(26); i += 1) {
        const fromLeft = i % 2 === 0;
        const size = rand(8, 16);
        const diamond = spawn({
          left: `${fromLeft ? box.left : box.right}px`, top: `${box.bottom - rand(0, box.height * 0.4)}px`,
          width: `${size}px`, height: `${size}px`, background: palette[i % 3],
          boxShadow: `0 0 10px ${palette[i % 3]}`,
        });
        run(diamond, [
          { transform: "translate(0,0) rotate(45deg)", opacity: 1 },
          { transform: `translate(${(fromLeft ? 1 : -1) * rand(40, box.width * 0.5)}px, ${-rand(box.height * 0.3, box.height * 0.9)}px) rotate(${rand(225, 405)}deg)`, opacity: 0 },
        ], { duration: rand(1200, 1900), delay: rand(0, 300) });
      }
    },
  ];

  const play = () => {
    const panel = document.querySelector(".puzzle-panel");
    if (!panel) return;
    layer?.remove();
    layer = document.createElement("div");
    layer.className = "vx-layer";
    layer.setAttribute("aria-hidden", "true");
    layer.style.setProperty("--vx", accent);
    document.body.appendChild(layer);

    const rect = panel.getBoundingClientRect();
    const top = Math.max(rect.top, 0);
    const bottom = Math.min(rect.bottom, window.innerHeight);
    const box = {
      left: Math.max(rect.left, 0), right: Math.min(rect.right, window.innerWidth),
      top, bottom, width: Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0),
      height: Math.max(bottom - top, 160),
    };
    const cx = box.left + box.width / 2;
    const cy = box.top + box.height / 2;

    const label = item.type === "boss"
      ? english ? "BOSS DEFEATED" : "BOSS VAINCU"
      : english ? `LEVEL ${number} CLEARED` : `NIVEAU ${number} RÉUSSI`;
    const banner = document.createElement("div");
    banner.className = "vx-banner";
    banner.textContent = label;
    banner.style.left = `${cx}px`;
    banner.style.top = `${Math.min(Math.max(cy, 90), window.innerHeight - 90)}px`;
    layer.appendChild(banner);
    banner.animate(
      reduced
        ? [{ opacity: 0 }, { opacity: 1, offset: 0.15 }, { opacity: 1, offset: 0.8 }, { opacity: 0 }]
        : [
            { opacity: 0, transform: "translate(-50%,-50%) scale(.7)" },
            { opacity: 1, transform: "translate(-50%,-50%) scale(1.06)", offset: 0.15 },
            { opacity: 1, transform: "translate(-50%,-50%) scale(1)", offset: 0.75 },
            { opacity: 0, transform: "translate(-50%,-80%) scale(1)" },
          ],
      { duration: 2000, fill: "forwards", easing: "ease-out" },
    ).onfinish = () => layer?.remove();

    if (!reduced) effects[variant](box, cx, cy);
  };

  const watch = () => {
    const next = document.getElementById("nextLevelButton");
    if (!next) return;
    new MutationObserver(() => {
      if (!next.hidden) play();
    }).observe(next, { attributes: true, attributeFilter: ["hidden"] });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", watch);
  else watch();
})();
