const board = document.getElementById("puzzleBoard");
const pieces = [...document.querySelectorAll(".puzzle-piece")];
const slots = [...document.querySelectorAll(".target-slot")];
const pieceTray = document.getElementById("pieceTray");
const status = document.getElementById("puzzleStatus");
const progressReadout = document.getElementById("progressReadout");
const systemMessage = document.getElementById("systemMessage");
const resetButton = document.getElementById("resetButton");
const levelProgress = document.getElementById("levelProgress");
const saveGameButton = document.getElementById("saveGameButton");
const nextLevelButton = document.getElementById("nextLevelButton");
const systemTransmission = document.querySelector(".system-transmission");

const solution = ["circle", "triangle", "square"];
const targetByShape = { circle: 0, triangle: 1, square: 2 };
const language = localStorage.getItem("echoes-language") === "en" ? "en" : "fr";
const levelCopy = window.translations?.[language]?.level1;
const systemMessages = {
  input: levelCopy.systemInput,
  success: levelCopy.systemSuccess,
  error: levelCopy.systemError,
};
const currentLevel = 1;
const progressStorageKey = "echoes-completed-levels";
const completedLevels = new Set(
  JSON.parse(localStorage.getItem(progressStorageKey) || "[]"),
);
let selectedPiece = null;
let placedShapes = [null, null, null];

document.documentElement.lang = language;
document.querySelectorAll("[data-i18n]").forEach((element) => {
  const key = element.dataset.i18n;
  if (levelCopy[key]) element.textContent = levelCopy[key];
});
document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
  const values = levelCopy[element.dataset.i18nAria];
  if (!values) return;
  if (Array.isArray(values)) {
    element.setAttribute("aria-label", values.join(" / "));
    element.querySelectorAll(".target-slot").forEach((slot, index) => {
      if (values[index]) slot.setAttribute("aria-label", values[index]);
    });
  } else {
    element.setAttribute("aria-label", values);
  }
});
saveGameButton.textContent = levelCopy.save;
resetButton.textContent = levelCopy.reset;
status.textContent = levelCopy.statusReady;
const shapeLabels =
  language === "en"
    ? { triangle: "Triangle", circle: "Circle", square: "Diamond" }
    : { triangle: "Triangle", circle: "Cercle", square: "Losange" };
pieces.forEach((piece) => {
  piece.setAttribute("aria-label", shapeLabels[piece.dataset.shape]);
});

function shufflePieces() {
  const shuffledPieces = [...pieces].sort(() => Math.random() - 0.5);
  shuffledPieces.forEach((piece) => pieceTray.appendChild(piece));
}

function renderProgress() {
  levelProgress.replaceChildren();
  for (let level = 1; level <= 15; level += 1) {
    const square = document.createElement("span");
    square.className = "level-square";
    square.dataset.level = level;
    square.title = `Niveau ${level}`;
    square.setAttribute("aria-label", `Niveau ${level}`);
    if (completedLevels.has(level)) square.classList.add("completed");
    if (level === currentLevel) square.classList.add("current");
    levelProgress.appendChild(square);
  }
}

function markCurrentLevelCompleted() {
  completedLevels.add(currentLevel);
  localStorage.setItem(
    progressStorageKey,
    JSON.stringify([...completedLevels].sort((a, b) => a - b)),
  );
  window.EchoesSave.saveProgress({
    currentPage: "level-1",
    currentLevel: currentLevel,
    completedLevels: [...completedLevels].sort((a, b) => a - b),
  });
  renderProgress();
}

function updateProgress() {
  const placedCount = placedShapes.filter(Boolean).length;
  progressReadout.textContent = `${placedCount} / ${solution.length}`;
}

function typeSystemMessage(message, onComplete) {
  systemMessage.textContent = "";
  let characterIndex = 0;

  function typeCharacter() {
    systemMessage.textContent += message[characterIndex];
    characterIndex += 1;
    systemTransmission.scrollIntoView({ behavior: "auto", block: "center" });

    if (characterIndex < message.length) {
      window.setTimeout(typeCharacter, 20);
    } else if (onComplete) {
      onComplete();
    }
  }

  typeCharacter();
}

function selectPiece(piece) {
  if (piece.classList.contains("placed")) return;
  pieces.forEach((item) => item.classList.remove("selected"));
  clearSlotPreviews();
  selectedPiece = piece;
  piece.classList.add("selected");
  showSlotPreview(piece.dataset.shape);
  status.textContent = levelCopy.statusSelected;
  status.className = "puzzle-status";
}

function clearSlotPreviews() {
  slots.forEach((slot) => {
    slot.classList.remove(
      "preview-triangle",
      "preview-circle",
      "preview-square",
    );
  });
}

function showSlotPreview(shape) {
  const targetSlot = slots[targetByShape[shape]];
  if (targetSlot && !targetSlot.classList.contains("filled")) {
    targetSlot.classList.add(`preview-${shape}`);
  }
}

function placePiece(piece, slot) {
  if (!piece || slot.classList.contains("filled")) return;

  const shape = piece.dataset.shape;
  const slotIndex = Number(slot.dataset.slot);
  const visualPiece = document.createElement("span");
  visualPiece.className = `puzzle-piece ${piece.className.replace(" selected", "")} placed`;
  visualPiece.setAttribute("aria-hidden", "true");
  slot.appendChild(visualPiece);
  clearSlotPreviews();
  slot.classList.add("filled", `slot-${shape}`);
  placedShapes[slotIndex] = shape;
  piece.classList.remove("selected");
  piece.classList.add("placed");
  piece.setAttribute("aria-disabled", "true");
  selectedPiece = null;
  updateProgress();

  if (placedShapes.every(Boolean)) checkSolution();
}

function checkSolution() {
  const isCorrect = placedShapes.every(
    (shape, index) => shape === solution[index],
  );

  if (isCorrect) {
    slots.forEach((slot) => slot.classList.add("correct"));
    board.classList.add("solved");
    status.textContent = levelCopy.statusSuccess;
    status.className = "puzzle-status success";
    systemTransmission.classList.add("success");
    markCurrentLevelCompleted();
    typeSystemMessage(systemMessages.success, () => {
      window.setTimeout(() => {
        nextLevelButton.hidden = false;
        nextLevelButton.focus();
      }, 450);
    });
    return;
  }

  slots.forEach((slot, index) => {
    slot.classList.toggle("incorrect", placedShapes[index] !== solution[index]);
  });
  status.textContent = levelCopy.statusError;
  status.className = "puzzle-status error";
  systemMessage.textContent = systemMessages.error;
  systemTransmission.classList.remove("success");
}

function resetPuzzle() {
  placedShapes = [null, null, null];
  selectedPiece = null;
  board.classList.remove("solved");
  slots.forEach((slot) => {
    slot.className = "target-slot";
    slot.replaceChildren();
  });
  clearSlotPreviews();
  pieces.forEach((piece) => {
    piece.classList.remove("selected", "placed");
    piece.removeAttribute("aria-disabled");
  });
  status.textContent = levelCopy.statusReady;
  status.className = "puzzle-status";
  nextLevelButton.hidden = true;
  systemMessage.textContent = systemMessages.input;
  systemTransmission.classList.remove("success");
  updateProgress();
}

pieces.forEach((piece) => {
  piece.addEventListener("click", () => selectPiece(piece));
  piece.addEventListener("dragstart", (event) => {
    selectPiece(piece);
    event.dataTransfer.setData("text/plain", piece.dataset.shape);
  });
});

slots.forEach((slot) => {
  slot.addEventListener("click", () => placePiece(selectedPiece, slot));
  slot.addEventListener("dragover", (event) => event.preventDefault());
  slot.addEventListener("drop", (event) => {
    event.preventDefault();
    placePiece(selectedPiece, slot);
  });
});

resetButton.addEventListener("click", resetPuzzle);
saveGameButton.addEventListener("click", () => {
  window.EchoesSave.saveProgress({
    currentPage: "level-1",
    currentLevel: currentLevel,
    completedLevels: [...completedLevels].sort((a, b) => a - b),
  });
  saveGameButton.textContent = language === "en" ? "SAVED" : "SAUVEGARDÉ";
});

nextLevelButton.addEventListener("click", () => {
  window.EchoesSave.saveProgress({
    currentPage: "level-2",
    currentLevel: 2,
    completedLevels: [...completedLevels].sort((a, b) => a - b),
  });
  window.location.href = "niveau-02.html";
});
shufflePieces();
systemMessage.textContent = systemMessages.input;
updateProgress();
renderProgress();
