// KEY TRAY // affiche les 6 clés de résonance (débloquées en couleur, verrouillées en silhouette).
window.EchoesKeyTray = (() => {
  const language = localStorage.getItem("echoes-language") === "en" ? "en" : "fr";
  const copy = {
    fr: { title: "CLÉS DE RÉSONANCE", key: "Clé", owned: "récupérée", missing: "non récupérée" },
    en: { title: "RESONANCE KEYS", key: "Key", owned: "collected", missing: "not collected" },
  }[language];

  // Remplit un conteneur avec les clés du joueur courant.
  function render(container, { compact = false } = {}) {
    const keys = window.EchoesLevels.getKeys();
    const count = keys.filter((key) => key.owned).length;
    container.classList.add("key-tray");
    container.classList.toggle("is-compact", compact);
    container.innerHTML = `
      <div class="key-tray-head">
        <span class="key-tray-title">${copy.title}</span>
        <strong class="key-tray-count">${count} / ${keys.length}</strong>
      </div>
      <ul class="key-tray-list">
        ${keys
          .map(
            (key, index) => `<li style="--i:${index}" class="key-slot ${key.owned ? "is-owned" : "is-missing"}"
              aria-label="${copy.key} ${key.number} — ${key.owned ? copy.owned : copy.missing}">
              <span class="key-slot-frame"><img src="${key.image}" alt="" loading="lazy" /></span>
              <span class="key-slot-number">0${key.number}</span>
            </li>`,
          )
          .join("")}
      </ul>`;
  }

  // Sur les pages de boss, ajoute le plateau de clés en bas de l'écran.
  function injectOnBossPage() {
    const item = window.EchoesLevels?.itemForPath();
    if (!item || item.type !== "boss") return;
    const style = document.createElement("link");
    style.rel = "stylesheet";
    style.href = new URL("../css/key-tray.css?v=2", document.currentScript.src).href;
    document.head.appendChild(style);
    const tray = document.createElement("aside");
    tray.className = "key-tray-floating";
    tray.setAttribute("aria-label", copy.title);
    document.body.appendChild(tray);
    render(tray, { compact: true });
    document.addEventListener("echoes:key-unlocked", () => render(tray, { compact: true }));
  }

  if (document.currentScript?.dataset.autoBoss !== undefined) {
    document.addEventListener("DOMContentLoaded", injectOnBossPage);
  }

  return { render };
})();
