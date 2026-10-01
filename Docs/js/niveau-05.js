const board = document.getElementById("puzzleBoard");
const notes = [...document.querySelectorAll(".sound-note")];
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
const levelCopy = window.translations?.[language]?.level5;
const currentLevel = 5;
const sequence = [0, 2, 1, 3];
const frequencies = [196, 261.63, 392, 523.25];
const progressStorageKey = "echoes-completed-levels";
const completedLevels = new Set(
  JSON.parse(localStorage.getItem(progressStorageKey) || "[]"),
);
let playerSequence = [];
let isShowingSequence = false;
let isSolved = false;
let playbackToken = 0;
let audioContext;

const getAudioContext = () => {
  audioContext ||= new AudioContext();
  return audioContext;
};

function playTone(index) {
  const context = getAudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = frequencies[index];
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.18, context.currentTime + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.38);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.4);
}

document.documentElement.lang = language;
document.querySelectorAll("[data-i18n]").forEach((element) => {
  const copy = levelCopy[element.dataset.i18n];
  if (copy) element.textContent = copy;
});
document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
  const copy = levelCopy[element.dataset.i18nAria];
  if (copy) element.setAttribute("aria-label", copy);
});
notes.forEach((note, index) =>
  note.setAttribute("aria-label", levelCopy.noteLabels[index]),
);
saveGameButton.textContent = levelCopy.save;
resetButton.textContent = levelCopy.reset;
startButton.textContent = levelCopy.watchSequence;
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

function updateProgress() {
  progressReadout.textContent = `${playerSequence.length} / ${sequence.length}`;
}

function setNoteState(index, state) {
  notes[index]?.classList.remove("is-active", "is-error", "is-correct");
  if (state) notes[index]?.classList.add(`is-${state}`);
}

function stopPlayback() {
  playbackToken += 1;
  notes.forEach((_, index) => setNoteState(index, null));
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
  const token = playbackToken;
  sequence.forEach((noteIndex, sequenceIndex) => {
    window.setTimeout(() => {
      if (token !== playbackToken) return;
      playTone(noteIndex);
      setNoteState(noteIndex, "active");
      window.setTimeout(() => {
        if (token === playbackToken) setNoteState(noteIndex, null);
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

function completePuzzle() {
  isSolved = true;
  stopPlayback();
  notes.forEach((_, index) => setNoteState(index, "correct"));
  board.classList.add("solved");
  status.textContent = levelCopy.statusSuccess;
  status.className = "puzzle-status success";
  systemTransmission.classList.add("success");
  startButton.disabled = true;
  const sortedLevels = [...completedLevels, currentLevel]
    .filter((value, index, list) => list.indexOf(value) === index)
    .sort((a, b) => a - b);
  localStorage.setItem(progressStorageKey, JSON.stringify(sortedLevels));
  window.EchoesSave.saveProgress({
    currentPage: "level-5",
    currentLevel,
    completedLevels: sortedLevels,
  });
  systemMessage.textContent = levelCopy.systemSuccess;
  window.setTimeout(() => {
    nextLevelButton.hidden = false;
    nextLevelButton.focus();
  }, 500);
}

notes.forEach((note) =>
  note.addEventListener("click", () => {
    if (isShowingSequence || isSolved) return;
    const index = Number(note.dataset.note);
    playTone(index);
    playerSequence.push(index);
    updateProgress();
    if (index !== sequence[playerSequence.length - 1]) {
      setNoteState(index, "error");
      status.textContent = levelCopy.statusError;
      status.className = "puzzle-status error";
      systemTransmission.classList.remove("success");
      systemMessage.textContent = levelCopy.systemError;
      window.setTimeout(playSequence, 650);
      return;
    }
    setNoteState(index, "correct");
    if (playerSequence.length === sequence.length) completePuzzle();
  }),
);
startButton.addEventListener("click", playSequence);
resetButton.addEventListener("click", () => {
  stopPlayback();
  isSolved = false;
  playerSequence = [];
  board.classList.remove("solved");
  systemTransmission.classList.remove("success");
  startButton.disabled = false;
  nextLevelButton.hidden = true;
  status.className = "puzzle-status";
  status.textContent = levelCopy.statusReady;
  systemMessage.textContent = levelCopy.systemInput;
  updateProgress();
});
saveGameButton.addEventListener("click", () => {
  window.EchoesSave.saveProgress({
    currentPage: "level-5",
    currentLevel,
    completedLevels: [...completedLevels].sort((a, b) => a - b),
  });
  saveGameButton.textContent = language === "en" ? "SAVED" : "SAUVEGARDÉ";
});
nextLevelButton.addEventListener("click", () => {
  window.EchoesSave.saveProgress({
    currentPage: "level-6",
    currentLevel: 6,
    completedLevels: [...completedLevels].sort((a, b) => a - b),
  });
  window.location.href = "niveau-06.html";
});

renderProgress();
updateProgress();
playSequence();
