(() => {
  const path = window.location.pathname;
  const levelMatch = path.match(/niveau-(\d+)/i);
  const level = levelMatch ? Number(levelMatch[1]) : 0;
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
  const [accent, secondary] = palettes[Math.max(0, Math.min(part, palettes.length - 1))];
  const root = document.body;
  root.classList.add("echo-ambient-page");
  root.dataset.level = String(level || "intro");
  root.dataset.part = String(part);
  root.style.setProperty("--ambient-accent", accent);
  root.style.setProperty("--ambient-secondary", secondary);
  root.style.setProperty("--ambient-level-shift", `${(level % 10) * 7}deg`);

  if (root.querySelector(".echo-ambient-field")) return;
  const field = document.createElement("div");
  field.className = "echo-ambient-field";
  field.setAttribute("aria-hidden", "true");
  const scan = document.createElement("span");
  scan.className = "echo-ambient-scan";
  field.appendChild(scan);
  root.prepend(field);
})();
