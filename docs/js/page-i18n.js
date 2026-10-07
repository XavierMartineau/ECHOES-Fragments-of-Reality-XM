// ============================================================================
// Traduction automatique FR vers EN du texte des pages quand la langue enregistrée est « en ».
// ============================================================================
(() => {
  if (localStorage.getItem("echoes-language") !== "en") return;
  const sourceScript = document.currentScript;

  function initializeLegacyPageI18n() {
    document.documentElement.lang = "en";
    const legacyTranslations = window.translations?.en?.pageI18n;
    if (!legacyTranslations) {
      console.error("English page translations are missing from translations.js.");
      return;
    }
    const { exact } = legacyTranslations;
    const rules = legacyTranslations.rules(tr);

    // Normalise les espaces et apostrophes avant de chercher une traduction.
    const normalize = (value) => value.replace(/\s+/g, " ").replace(/[’‘]/g, "'").trim();
    const exactNormalized = new Map(
      Object.entries(exact).map(([key, value]) => [normalize(key), value]),
    );

    const upperExact = new Map(
      [...exactNormalized].map(([key, value]) => [key.toUpperCase(), value]),
    );

    // Renvoie la traduction anglaise d'un texte français (ou le texte inchangé).
    function tr(text) {
      const core = normalize(text);
      if (!core) return text;
      if (exactNormalized.has(core)) return exactNormalized.get(core);
      const upper = core === core.toUpperCase();
      if (upper) {
        const found = upperExact.get(core);
        if (found) return found.toUpperCase();
      }
      for (const [pattern, build] of rules) {
        const match = core.match(pattern);
        const built = match && build(match);
        if (built) return built;
      }
      return text;
    }

    // Traduit un nœud de texte.
    const translateText = (node) => {
      const value = node.nodeValue;
      if (!value || !value.trim()) return;
      const result = tr(value);
      if (result === value) return;
      const lead = value.match(/^\s*/)[0];
      const trail = value.match(/\s*$/)[0];
      node.nodeValue = lead + result + trail;
    };

    const attributes = ["aria-label", "title", "placeholder", "alt"];
    // Traduit les attributs textuels d'un élément (titre, placeholder…).
    const translateElement = (element) => {
      if (element.nodeType !== 1) return;
      if (["SCRIPT", "STYLE"].includes(element.tagName)) return;
      attributes.forEach((name) => {
        const value = element.getAttribute(name);
        if (!value) return;
        const result = tr(value);
        if (result !== value) element.setAttribute(name, result);
      });
    };

    // Parcourt le DOM pour tout traduire.
    const walk = (root) => {
      if (root.nodeType === 3) {
        translateText(root);
        return;
      }
      if (root.nodeType !== 1) return;
      translateElement(root);
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      while (node) {
        if (node.nodeType === 3) {
          if (!["SCRIPT", "STYLE"].includes(node.parentNode?.tagName)) translateText(node);
        } else translateElement(node);
        node = walker.nextNode();
      }
    };

    // Lance la traduction de la page.
    const run = () => {
      document.title = tr(document.title);
      walk(document.body);
    };

    const observer = new MutationObserver((mutations) => {
      observer.disconnect();
      mutations.forEach((mutation) => {
        if (mutation.type === "characterData") translateText(mutation.target);
        else if (mutation.type === "attributes") translateElement(mutation.target);
        else mutation.addedNodes.forEach(walk);
        if (mutation.type === "childList" && mutation.target.nodeType === 1) {
          mutation.target.childNodes.forEach((child) => child.nodeType === 3 && translateText(child));
        }
      });
      observe();
    });
    // Observe les changements du DOM pour traduire le contenu ajouté plus tard.
    const observe = () =>
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: attributes,
      });

    window.echoesTranslate = tr;
    // Démarre la traduction au chargement de la page.
    const start = () => {
      run();
      observe();
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
    else start();
    }

  if (window.translations?.en?.pageI18n) {
    initializeLegacyPageI18n();
  } else {
    const translationScript = document.createElement("script");
    translationScript.src = new URL("translations.js", sourceScript.src).href;
    translationScript.addEventListener("load", initializeLegacyPageI18n, { once: true });
    translationScript.addEventListener("error", () => {
      console.error("Failed to load translations.js for English page translations.");
    }, { once: true });
    document.head.appendChild(translationScript);
  }
})();
