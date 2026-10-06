// ============================================================================
// Ambiance visuelle : choisit l'arrière-plan selon le niveau ou le boss.
// ============================================================================
(() => {
  const path = window.location.pathname;
  const levelMatch = path.match(/niveau-(\d+)\.html(?:$|[?#])/i);
  const isBoss = path.includes("clee_01_boss_level");
  const isSecondBoss = path.includes("boss-02");
  const level = levelMatch
    ? Number(levelMatch[1])
    : isBoss
      ? 10
      : isSecondBoss
        ? 20
        : 0;
  const part = level ? Math.ceil(level / 10) : path.includes("bonus") ? 7 : 0;
  const palettes = [
    ["#79f7ff", "#b36cff"],
    ["#ff5c8a", "#ffb347"],
    ["#8dff6a", "#44b8ff"],
    ["#ffdf6b", "#ff6bd6"],
    ["#ff8a4d", "#8b7dff"],
    ["#d46bff", "#56f0d2"],
    ["#ff79d1", "#79a8ff"],
  ];
  let [accent, secondary] = palettes[Math.max(0, Math.min(part, palettes.length - 1))];
  if (isBoss) [accent, secondary] = ["#ff456d", "#8d1dff"];
  if (isSecondBoss) [accent, secondary] = ["#45e5d2", "#ffbd69"];
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

  if (root.querySelector(".echo-ambient-field")) return;
  const field = document.createElement("div");
  field.className = "echo-ambient-field";
  field.setAttribute("aria-hidden", "true");
  const scan = document.createElement("span");
  scan.className = "echo-ambient-scan";
  field.appendChild(scan);
  root.prepend(field);
})();
