function installBackButton() {
  if (document.querySelector(".level-back-button")) return;
  const button = document.createElement("button");
  button.className = "level-back-button";
  button.type = "button";
  button.textContent = "← RETOUR";
  button.setAttribute("aria-label", "Retour à la page précédente");
  button.addEventListener("click", () =>
    window.history.length > 1
      ? window.history.back()
      : (window.location.href = "../../../../index.html"),
  );
  document.body.prepend(button);
}
installBackButton();

const board = document.getElementById("puzzleBoard");
const object = document.getElementById("rotationObject");
const rotateButton = document.getElementById("rotateButton");
const resetButton = document.getElementById("resetButton");
const currentAngle = document.getElementById("currentAngle");
const progressReadout = document.getElementById("progressReadout");
const status = document.getElementById("puzzleStatus");
const systemMessage = document.getElementById("systemMessage");
const levelProgress = document.getElementById("levelProgress");
const saveGameButton = document.getElementById("saveGameButton");
const nextLevelButton = document.getElementById("nextLevelButton");
const systemTransmission = document.querySelector(".system-transmission");
const language = localStorage.getItem("echoes-language") === "en" ? "en" : "fr";
const levelCopy = window.translations?.[language]?.level4;
const currentLevel = 4;
const targetAngle = 120;
const progressStorageKey = "echoes-completed-levels";
const completedLevels = new Set(
  JSON.parse(localStorage.getItem(progressStorageKey) || "[]"),
);
let angle = 0;
let isSolved = false;

document.documentElement.lang = language;
document.querySelectorAll("[data-i18n]").forEach((element) => {
  const copy = levelCopy[element.dataset.i18n];
  if (copy) element.textContent = copy;
});
rotateButton.textContent = levelCopy.rotateButton;
resetButton.textContent = levelCopy.reset;
saveGameButton.textContent = levelCopy.save;
status.textContent = levelCopy.statusReady;

function renderProgress() {
  levelProgress.replaceChildren();
  for (let level = 1; level <= 15; level += 1) {
    const square = document.createElement("span");
    square.className = "level-square";
    square.setAttribute("aria-label", `${levelCopy.level} ${level}`);
    if (completedLevels.has(level)) square.classList.add("completed");
    if (level === currentLevel) square.classList.add("current");
    levelProgress.appendChild(square);
  }
}

function renderAngle() {
  object.style.setProperty("--object-angle", `${angle}deg`);
  currentAngle.textContent = `${angle}°`;
  progressReadout.textContent = `${angle}° / ${targetAngle}°`;
}

function completePuzzle() {
  isSolved = true;
  board.classList.add("solved");
  status.textContent = levelCopy.statusSuccess;
  status.className = "puzzle-status success";
  systemTransmission.classList.add("success");
  rotateButton.disabled = true;
  const sortedLevels = [...completedLevels, currentLevel]
    .filter((value, index, list) => list.indexOf(value) === index)
    .sort((a, b) => a - b);
  localStorage.setItem(progressStorageKey, JSON.stringify(sortedLevels));
  window.EchoesSave.saveProgress({
    currentPage: "level-4",
    currentLevel,
    completedLevels: sortedLevels,
  });
  levelProgress
    .querySelector(`[aria-label="${levelCopy.level} ${currentLevel}"]`)
    ?.classList.add("completed");
  systemMessage.textContent = levelCopy.systemSuccess;
  window.setTimeout(() => {
    nextLevelButton.hidden = false;
    nextLevelButton.focus();
  }, 450);
}

rotateButton.addEventListener("click", () => {
  if (isSolved) return;
  angle = (angle + 30) % 360;
  renderAngle();
  if (angle === targetAngle) completePuzzle();
});
resetButton.addEventListener("click", () => {
  isSolved = false;
  angle = 0;
  board.classList.remove("solved");
  systemTransmission.classList.remove("success");
  rotateButton.disabled = false;
  nextLevelButton.hidden = true;
  status.className = "puzzle-status";
  status.textContent = levelCopy.statusReady;
  systemMessage.textContent = levelCopy.systemInput;
  renderAngle();
});
saveGameButton.addEventListener("click", () => {
  window.EchoesSave.saveProgress({
    currentPage: "level-4",
    currentLevel,
    completedLevels: [...completedLevels].sort((a, b) => a - b),
  });
  saveGameButton.textContent = language === "en" ? "SAVED" : "SAUVEGARDÉ";
});
nextLevelButton.addEventListener("click", () => {
  window.EchoesSave.saveProgress({
    currentPage: "level-5",
    currentLevel: 5,
    completedLevels: [...completedLevels].sort((a, b) => a - b),
  });
  window.location.href = "niveau-05.html";
});

renderProgress();
renderAngle();
