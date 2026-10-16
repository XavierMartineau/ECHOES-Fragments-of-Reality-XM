// LEVEL GUARD // bloque les niveaux verrouillés et enregistre chaque niveau terminé.
(() => {
  const levels = window.EchoesLevels;
  const save = window.EchoesSave;
  if (!levels || !save) return;

  const item = levels.itemForPath();
  if (!item) return;

  // Mode développeur : localStorage.setItem("echoes-dev-unlock", "1")
  if (localStorage.getItem("echoes-dev-unlock") === "1") return;

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
