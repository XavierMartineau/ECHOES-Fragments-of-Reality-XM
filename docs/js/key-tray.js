// KEY TRAY // affiche les 6 clés de résonance (débloquées en couleur, verrouillées en silhouette).
window.EchoesKeyTray = (() => {
  const language =
    localStorage.getItem("echoes-language") === "en" ? "en" : "fr";
  const copy = {
    fr: {
      title: "CLÉS DE RÉSONANCE",
      key: "Clé",
      owned: "récupérée",
      missing: "non récupérée",
    },
    en: {
      title: "RESONANCE KEYS",
      key: "Key",
      owned: "collected",
      missing: "not collected",
    },
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
            (
              key,
              index,
            ) => `<li style="--i:${index}" class="key-slot ${key.owned ? "is-owned" : "is-missing"}"
              aria-label="${copy.key} ${key.number} — ${key.owned ? copy.owned : copy.missing}">
              <span class="key-slot-frame"><img src="${key.image}" alt="" loading="lazy" /></span>
              <span class="key-slot-number">0${key.number}</span>
            </li>`,
          )
          .join("")}
      </ul>`;
  }

  return { render };
})();
