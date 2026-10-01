const board = document.getElementById("puzzleBoard");
let pieces = [];
const slots = [...document.querySelectorAll(".sort-slot")];
const status = document.getElementById("puzzleStatus");
const progressReadout = document.getElementById("progressReadout");
const systemMessage = document.getElementById("systemMessage");
const resetButton = document.getElementById("resetButton");
const levelProgress = document.getElementById("levelProgress");
const saveGameButton = document.getElementById("saveGameButton");
const nextLevelButton = document.getElementById("nextLevelButton");
const systemTransmission = document.querySelector(".system-transmission");
const language = localStorage.getItem("echoes-language") === "en" ? "en" : "fr";
const levelCopy = window.translations?.[language]?.level3;
const currentLevel = 3;
const progressStorageKey = "echoes-completed-levels";
const completedLevels = new Set(
  JSON.parse(localStorage.getItem(progressStorageKey) || "[]"),
);
const solution = ["triangle", "circle", "square", "hexagon", "diamond", "star"];
let selectedPiece = null;
let placedCount = 0;

function applyCopy() {
  document.documentElement.lang = language;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const copy = levelCopy[element.dataset.i18n];
    if (copy) element.textContent = copy;
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
    const copy = levelCopy[element.dataset.i18nAria];
    if (copy) element.setAttribute("aria-label", copy);
  });
  pieces.forEach((piece, index) =>
    piece.setAttribute("aria-label", levelCopy.pieceLabels[index]),
  );
  slots.forEach((slot, index) =>
    slot.setAttribute("aria-label", levelCopy.slotLabels[index]),
  );
  saveGameButton.textContent = levelCopy.save;
  resetButton.textContent = levelCopy.reset;
  status.textContent = levelCopy.statusReady;
}

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
  progressReadout.textContent = `${placedCount} / ${solution.length}`;
}

function markCompleted() {
  completedLevels.add(currentLevel);
  const sortedLevels = [...completedLevels].sort((a, b) => a - b);
  localStorage.setItem(progressStorageKey, JSON.stringify(sortedLevels));
  window.EchoesSave.saveProgress({
    currentPage: "level-3",
    currentLevel,
    completedLevels: sortedLevels,
  });
  renderProgress();
}

function completePuzzle() {
  board.classList.add("solved");
  status.textContent = levelCopy.statusSuccess;
  status.className = "puzzle-status success";
  systemTransmission.classList.add("success");
  pieces.forEach((piece) => piece.classList.add("is-locked"));
  slots.forEach((slot) => slot.classList.add("is-correct"));
  markCompleted();
  systemMessage.textContent = levelCopy.systemSuccess;
  window.setTimeout(() => {
    nextLevelButton.hidden = false;
    nextLevelButton.focus();
  }, 450);
}

function placePiece(piece, slot) {
  if (!piece || slot.classList.contains("is-filled")) return;
  if (piece.dataset.shape !== slot.dataset.shape) {
    slot.classList.add("is-error");
    status.textContent = levelCopy.statusError;
    status.className = "puzzle-status error";
    systemMessage.textContent = levelCopy.systemError;
    window.setTimeout(() => slot.classList.remove("is-error"), 500);
    return;
  }
  slot.classList.add("is-filled");
  slot.appendChild(piece);
  piece.classList.remove("is-selected");
  piece.classList.add("is-placed");
  piece.disabled = true;
  selectedPiece = null;
  placedCount += 1;
  updateProgress();
  if (placedCount === solution.length) completePuzzle();
}

function resetPuzzle() {
  selectedPiece = null;
  placedCount = 0;
  board.classList.remove("solved");
  systemTransmission.classList.remove("success");
  status.className = "puzzle-status";
  status.textContent = levelCopy.statusReady;
  systemMessage.textContent = levelCopy.systemInput;
  slots.forEach((slot) => {
    slot.className = "sort-slot";
    const piece = slot.querySelector(".sort-piece");
    if (piece) document.getElementById("sortPieces").appendChild(piece);
  });
  pieces.forEach((piece) => {
    piece.disabled = false;
    piece.className = `sort-piece shape-${piece.dataset.shape}`;
  });
  nextLevelButton.hidden = true;
  updateProgress();
}

resetButton.addEventListener("click", resetPuzzle);
saveGameButton.addEventListener("click", () => {
  window.EchoesSave.saveProgress({
    currentPage: "level-3",
    currentLevel,
    completedLevels: [...completedLevels].sort((a, b) => a - b),
  });
  saveGameButton.textContent = language === "en" ? "SAVED" : "SAUVEGARDÉ";
});
nextLevelButton.addEventListener("click", () => {
  window.EchoesSave.saveProgress({
    currentPage: "level-4",
    currentLevel: 4,
    completedLevels: [...completedLevels].sort((a, b) => a - b),
  });
  window.location.href = "niveau-04.html";
});

solution.forEach((shape, index) => {
  const slot = document.createElement("button");
  slot.className = `sort-slot slot-${shape}`;
  slot.type = "button";
  slot.dataset.shape = shape;
  slot.dataset.slot = index;
  document.getElementById("sortSlots").appendChild(slot);
  const piece = document.createElement("button");
  piece.className = `sort-piece shape-${shape}`;
  piece.type = "button";
  piece.dataset.shape = shape;
  piece.setAttribute("aria-label", levelCopy.pieceLabels[index]);
  document.getElementById("sortPieces").appendChild(piece);
});
pieces = [...document.querySelectorAll(".sort-piece")];
pieces.forEach((piece) => {
  piece.addEventListener("click", () => {
    if (piece.disabled) return;
    pieces.forEach((item) => item.classList.remove("is-selected"));
    selectedPiece = piece;
    piece.classList.add("is-selected");
    status.textContent = levelCopy.statusSelected;
  });
});
slots.push(...document.querySelectorAll(".sort-slot"));
slots.forEach((slot) =>
  slot.addEventListener("click", () => placePiece(selectedPiece, slot)),
);
applyCopy();
renderProgress();
updateProgress();
