const board = document.getElementById("puzzleBoard");
const lights = [...document.querySelectorAll(".sequence-light")];
const status = document.getElementById("puzzleStatus");
const progressReadout = document.getElementById("progressReadout");
const systemMessage = document.getElementById("systemMessage");
const resetButton = document.getElementById("resetButton");
const startButton = document.getElementById("sequenceStartButton");
const levelProgress = document.getElementById("levelProgress");
const saveGameButton = document.getElementById("saveGameButton");
const nextLevelButton = document.getElementById("nextLevelButton");
const systemTransmission = document.querySelector(".system-transmission");

const language = localStorage.getItem("echoes-language") === "en" ? "en" : "fr";
const levelCopy = window.translations?.[language]?.level2;
const currentLevel = 2;
const progressStorageKey = "echoes-completed-levels";
const completedLevels = new Set(
  JSON.parse(localStorage.getItem(progressStorageKey) || "[]"),
);
const sequence = [0, 2, 1, 3];
let playerSequence = [];
let isShowingSequence = false;
let isSolved = false;
let playbackToken = 0;

const systemMessages = {
  input: levelCopy.systemInput,
  success: levelCopy.systemSuccess,
  error: levelCopy.systemError,
};

document.documentElement.lang = language;
document.querySelectorAll("[data-i18n]").forEach((element) => {
  const key = element.dataset.i18n;
  if (levelCopy[key]) element.textContent = levelCopy[key];
});
document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
  const value = levelCopy[element.dataset.i18nAria];
  if (!value) return;
  element.setAttribute(
    "aria-label",
    Array.isArray(value) ? value.join(" / ") : value,
  );
  if (Array.isArray(value)) {
    lights.forEach((light, index) => {
      if (value[index]) light.setAttribute("aria-label", value[index]);
    });
  }
});
saveGameButton.textContent = levelCopy.save;
resetButton.textContent = levelCopy.reset;
startButton.textContent = levelCopy.watchSequence;
status.textContent = levelCopy.statusReady;

function renderProgress() {
  levelProgress.replaceChildren();
  for (let level = 1; level <= 15; level += 1) {
    const square = document.createElement("span");
    square.className = "level-square";
    square.title = `${levelCopy.level} ${level}`;
    square.setAttribute("aria-label", `${levelCopy.level} ${level}`);
    if (completedLevels.has(level)) square.classList.add("completed");
    if (level === currentLevel) square.classList.add("current");
    levelProgress.appendChild(square);
  }
}

function updateProgress() {
  progressReadout.textContent = `${playerSequence.length} / ${sequence.length}`;
}

function setLightState(index, state) {
  const light = lights[index];
  if (!light) return;
  light.classList.remove("is-active", "is-error", "is-correct");
  if (state) light.classList.add(`is-${state}`);
}

function stopPlayback() {
  playbackToken += 1;
  lights.forEach((_, index) => setLightState(index, null));
  isShowingSequence = false;
}

function playSequence() {
  stopPlayback();
  if (isSolved) return;
  isShowingSequence = true;
  playerSequence = [];
  updateProgress();
  status.textContent = levelCopy.statusWatching;
  status.className = "puzzle-status";
  startButton.disabled = true;
  lights.forEach((_, index) => setLightState(index, null));
  const token = playbackToken;

  sequence.forEach((lightIndex, sequenceIndex) => {
    window.setTimeout(() => {
      if (token !== playbackToken) return;
      setLightState(lightIndex, "active");
      window.setTimeout(() => {
        if (token === playbackToken) setLightState(lightIndex, null);
      }, 420);
    }, sequenceIndex * 720);
  });

  window.setTimeout(() => {
    if (token !== playbackToken) return;
    isShowingSequence = false;
    startButton.disabled = false;
    status.textContent = levelCopy.statusPlaying;
  }, sequence.length * 720);
}

function markCurrentLevelCompleted() {
  completedLevels.add(currentLevel);
  localStorage.setItem(
    progressStorageKey,
    JSON.stringify([...completedLevels].sort((a, b) => a - b)),
  );
  window.EchoesSave.saveProgress({
    currentPage: "level-2",
    currentLevel,
    completedLevels: [...completedLevels].sort((a, b) => a - b),
  });
  renderProgress();
}

function typeSystemMessage(message) {
  systemMessage.textContent = "";
  let characterIndex = 0;
  const typeCharacter = () => {
    systemMessage.textContent += message[characterIndex];
    characterIndex += 1;
    if (characterIndex < message.length) window.setTimeout(typeCharacter, 18);
  };
  typeCharacter();
}

function solvePuzzle() {
  isSolved = true;
  stopPlayback();
  lights.forEach((_, index) => setLightState(index, "correct"));
  board.classList.add("solved");
  status.textContent = levelCopy.statusSuccess;
  status.className = "puzzle-status success";
  systemTransmission.classList.add("success");
  startButton.disabled = true;
  markCurrentLevelCompleted();
  typeSystemMessage(systemMessages.success);
  window.setTimeout(() => {
    nextLevelButton.hidden = false;
    nextLevelButton.focus();
  }, 500);
}

function handleLightClick(event) {
  if (isShowingSequence || isSolved) return;
  const lightIndex = Number(event.currentTarget.dataset.light);
  const expectedIndex = sequence[playerSequence.length];
  playerSequence.push(lightIndex);
  updateProgress();

  if (lightIndex !== expectedIndex) {
    setLightState(lightIndex, "error");
    status.textContent = levelCopy.statusError;
    status.className = "puzzle-status error";
    systemTransmission.classList.remove("success");
    typeSystemMessage(systemMessages.error);
    window.setTimeout(() => {
      playerSequence = [];
      lights.forEach((_, index) => setLightState(index, null));
      updateProgress();
      playSequence();
    }, 650);
    return;
  }

  setLightState(lightIndex, "correct");
  if (playerSequence.length === sequence.length) solvePuzzle();
}

function resetPuzzle() {
  stopPlayback();
  isSolved = false;
  playerSequence = [];
  board.classList.remove("solved");
  lights.forEach((_, index) => setLightState(index, null));
  status.textContent = levelCopy.statusReady;
  status.className = "puzzle-status";
  systemTransmission.classList.remove("success");
  startButton.disabled = false;
  nextLevelButton.hidden = true;
  systemMessage.textContent = systemMessages.input;
  updateProgress();
}

lights.forEach((light) => light.addEventListener("click", handleLightClick));
startButton.addEventListener("click", playSequence);
resetButton.addEventListener("click", resetPuzzle);
saveGameButton.addEventListener("click", () => {
  window.EchoesSave.saveProgress({
    currentPage: "level-2",
    currentLevel,
    completedLevels: [...completedLevels].sort((a, b) => a - b),
  });
  saveGameButton.textContent = language === "en" ? "SAVED" : "SAUVEGARDÉ";
});
nextLevelButton.addEventListener("click", () => {
  window.EchoesSave.saveProgress({
    currentPage: "level-3",
    currentLevel: 3,
    completedLevels: [...completedLevels].sort((a, b) => a - b),
  });
  window.location.href = "niveau-03.html";
});

updateProgress();
renderProgress();
playSequence();
