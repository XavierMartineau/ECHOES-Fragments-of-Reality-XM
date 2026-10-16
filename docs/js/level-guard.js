// LEVEL GUARD // bloque les niveaux verrouillés et enregistre chaque niveau terminé.
(() => {
  // Fond animé de la partie (voir scene-bg.js).
  if (document.currentScript) {
    const scene = document.createElement("script");
    scene.src = new URL("scene-bg.js?v=1", document.currentScript.src).href;
    document.body.appendChild(scene);
  }

  const levels = window.EchoesLevels;
  const save = window.EchoesSave;
  if (!levels || !save) return;

  const item = levels.itemForPath();
  if (!item) return;

  // Mode développeur : le DEV MODE pose le drapeau en session ; manuellement : localStorage.setItem("echoes-dev-unlock", "1")
  if (
    localStorage.getItem("echoes-dev-unlock") === "1" ||
    sessionStorage.getItem("echoes-dev-unlock") === "1"
  )
    return;

  const username = save.getCurrentUser();
  if (!username) {
    window.location.replace(levels.loginUrl);
    return;
  }
  if (!levels.canOpen(item.id, username)) {
    window.location.replace(levels.hubUrl);
    return;
  }

  const complete = () => levels.markCompleted(item.id, username);

  // Le bouton "niveau suivant" apparaît uniquement quand le niveau est réussi.
  document.addEventListener("DOMContentLoaded", () => {
    const next = document.getElementById("nextLevelButton");
    if (!next) return;
    if (!next.hidden) complete();
    new MutationObserver(() => {
      if (!next.hidden) complete();
    }).observe(next, { attributes: true, attributeFilter: ["hidden"] });
    next.addEventListener("click", complete);
  });
})();
