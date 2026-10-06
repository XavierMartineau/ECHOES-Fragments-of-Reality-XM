// ============================================================================
// Sélecteur de langue FR/EN : construit le bouton et mémorise le choix dans localStorage.
// ============================================================================
(() => {
  const translations = window.translations || {};
  const availableLanguages = Object.keys(translations);
  if (availableLanguages.length < 2) return;

  const existing = document.querySelector(".lang-switcher");
  if (!document.body.classList.contains("index-page")) {
    existing?.remove();
    document.querySelector(".global-language-switcher")?.remove();
    document.documentElement.lang =
      localStorage.getItem("echoes-language") === "en" ? "en" : "fr";
    return;
  }

  const switcher = existing || document.createElement("nav");
  if (!existing) {
    switcher.className = "global-language-switcher";
    switcher.setAttribute("aria-label", "Choix de langue");
    switcher.innerHTML = availableLanguages
      .map(
        (language) =>
          `<button class="global-lang-btn" type="button" data-language="${language}">${language.toUpperCase()}</button>`,
      )
      .join("");
    document.body.appendChild(switcher);
  }

  const buttons = switcher.querySelectorAll(
    existing ? ".lang-btn" : ".global-lang-btn",
  );
  const currentLanguage = localStorage.getItem("echoes-language") === "en"
    ? "en"
    : "fr";

  document.documentElement.lang = currentLanguage;
  switcher.setAttribute(
    "aria-label",
    currentLanguage === "en" ? "Language selection" : "Choix de langue",
  );
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    const value = translations[currentLanguage][key];
    if (typeof value === "string") element.textContent = value;
  });
  buttons.forEach((button) => {
    const language = button.dataset.lang || button.dataset.language;
    button.classList.toggle("active", language === currentLanguage);
    button.addEventListener("click", () => {
      if (translations[language]) {
        localStorage.setItem("echoes-language", language);
        window.location.reload();
      }
    });
  });
})();
