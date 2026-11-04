// ============================================================================
// DEV MODE (léger) : bouton injecté sur chaque page, qui ouvre la page indépendante docs/html/dev-mode.html.
// Tout le panneau (navigation, clés, progression, réglages) vit dans dev-mode-page.js, chargé uniquement à la demande.
// ============================================================================
(() => {
  const script = document.currentScript;
  if (!script) {
    return;
  }

  const rootUrl = new URL("../../", script.src);
  const style = document.createElement("link");
  style.rel = "stylesheet";
  style.href = new URL("../css/composants/dev-mode.css?v=28", script.src).href;
  document.head.appendChild(style);

  // Garde le titre de l'onglet synchronisé avec la langue du niveau.
  const levelMatch = window.location.pathname.match(/niveau-(\d+)\.html$/i);
  if (levelMatch) {
    const currentLevel = String(Number(levelMatch[1])).padStart(2, "0");
    const titlePrefix =
      localStorage.getItem("echoes-language") === "en" ? "Level" : "Niveau";
    document.title = `ECHOES - ${titlePrefix} ${currentLevel}`;
  }

  // Réglages enregistrés depuis la page DEV MODE.
  document.body.classList.toggle(
    "echo-color-assist",
    localStorage.getItem("echoes-color-assist") === "true",
  );
  if (localStorage.getItem("echoes-dev-fps") === "1") {
    const box = document.createElement("div");
    box.className = "dev-fps";
    box.setAttribute("aria-hidden", "true");
    document.body.appendChild(box);
    let frames = 0;
    let last = performance.now();
    const tick = (now) => {
      frames += 1;
      if (now - last >= 1000) {
        box.textContent = `${Math.round((frames * 1000) / (now - last))} FPS`;
        frames = 0;
        last = now;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  const menu = document.createElement("aside");
  menu.className = "dev-mode";
  menu.innerHTML = `
    <button class="dev-mode-toggle" type="button" aria-label="Ouvrir le DEV MODE">
      <svg class="dev-mode-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
        <path d="M7 5 2.5 10 7 15M13 5l4.5 5L13 15M11.2 3.5 8.8 16.5" />
      </svg>
      <span class="dev-mode-label">DEV MODE</span>
      <i class="dev-mode-led" aria-hidden="true"></i>
    </button>
  `;

  const footer = document.querySelector(
    ".level-footer, .site-footer, .console-footer, footer",
  );
  const footerAlreadyHasCopyright =
    footer &&
    (footer.querySelector(".site-copyright") ||
      footer.querySelector('[data-i18n="footerYear"]') ||
      footer.querySelector('[data-i18n="footerRights"]') ||
      footer.textContent.includes("© 2026"));
  if (footer && !footerAlreadyHasCopyright) {
    const copyright = document.createElement("span");
    copyright.className = "site-copyright";
    copyright.textContent =
      localStorage.getItem("echoes-language") === "en"
        ? "© 2026 Xavier Martineau · All rights reserved."
        : "© 2026 Xavier Martineau · Tous droits réservés.";
    footer.appendChild(copyright);
  }
  if (footer) {
    footer.insertAdjacentElement("beforebegin", menu);
  } else {
    document.body.appendChild(menu);
  }

  // Ouvre la page DEV MODE en mémorisant la page d'origine pour le retour.
  menu.querySelector(".dev-mode-toggle").addEventListener("click", () => {
    const target = new URL("docs/html/dev-mode.html", rootUrl);
    target.searchParams.set("from", window.location.href);
    window.location.href = target.href;
  });
})();
