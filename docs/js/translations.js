// Chargeur de dictionnaires : seule la langue enregistrée est téléchargée (fr par défaut).
// Doit rester un script synchrone (sans defer) pour que window.translations existe avant les autres scripts.
(() => {
  let lang = "fr";
  try {
    if (localStorage.getItem("echoes-language") === "en") lang = "en";
  } catch (e) {}
  const url = new URL(`translations.${lang}.js?v=1`, document.currentScript.src).href;
  document.write(`<script src="${url}"><\/script>`);
})();