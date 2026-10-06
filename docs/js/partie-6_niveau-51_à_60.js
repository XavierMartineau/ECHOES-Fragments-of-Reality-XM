/* PARTIE 6 // NIVEAUX 51-60
 * Démarrage commun des pages de cette partie : retour en arrière, détection du
 * niveau courant (d'après "niveau-NN" dans l'URL) et sauvegarde automatique.
 * Les niveaux 51 à 60 sont encore des pages « En construction » : aucun contrôleur
 * de puzzle n'existe pour l'instant. Chaque futur niveau ajoutera ici son propre
 * bloc intitulé « NIVEAU N » (voir partie-2_niveau-11_à_20.js comme modèle).
 */
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
