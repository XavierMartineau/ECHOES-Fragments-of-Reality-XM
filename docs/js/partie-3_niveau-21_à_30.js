/* PARTIE 3 // NIVEAUX 21-30
 * Shared page bootstrap: back navigation, current-level detection, and save. */
const currentLevel = Number(
  window.location.pathname.match(/niveau-(\d+)/)?.[1] || 0,
);
const autoSave = () =>
  window.EchoesSave?.saveProgress({
    currentPage: `level-${currentLevel}`,
    currentLevel,
  });
if (window.EchoesSave) autoSave();
else {
  const script = document.createElement("script");
  script.src = "../../js/save-system.js";
  script.onload = autoSave;
  document.head.appendChild(script);
}
