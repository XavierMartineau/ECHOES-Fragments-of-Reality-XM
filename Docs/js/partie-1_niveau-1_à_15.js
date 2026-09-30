const board = document.getElementById("puzzleBoard");
const pieces = [...document.querySelectorAll(".puzzle-piece")];
const slots = [...document.querySelectorAll(".target-slot")];
const status = document.getElementById("puzzleStatus");
const progressReadout = document.getElementById("progressReadout");
const systemMessage = document.getElementById("systemMessage");
const resetButton = document.getElementById("resetButton");
const levelProgress = document.getElementById("levelProgress");

const solution = ["triangle", "circle", "square"];
const currentLevel = 1;
const progressStorageKey = "echoes-completed-levels";
const completedLevels = new Set(
  JSON.parse(localStorage.getItem(progressStorageKey) || "[]"),
);
let selectedPiece = null;
let placedShapes = [null, null, null];

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
  renderProgress();
}

function updateProgress() {
  const placedCount = placedShapes.filter(Boolean).length;
  progressReadout.textContent = `${placedCount} / ${solution.length}`;
}

function selectPiece(piece) {
  if (piece.classList.contains("placed")) return;
  pieces.forEach((item) => item.classList.remove("selected"));
  selectedPiece = piece;
  piece.classList.add("selected");
  status.textContent =
    "Forme sélectionnée. Choisis son emplacement holographique.";
  status.className = "puzzle-status";
}

function placePiece(piece, slot) {
  if (!piece || slot.classList.contains("filled")) return;

  const shape = piece.dataset.shape;
  const slotIndex = Number(slot.dataset.slot);
  const visualPiece = document.createElement("span");
  visualPiece.className = `puzzle-piece ${piece.className.replace(" selected", "")} placed`;
  visualPiece.setAttribute("aria-hidden", "true");
  slot.appendChild(visualPiece);
  slot.classList.add("filled");
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
    status.textContent = "Résonance stabilisée. Le fragment répond à ECHO.";
    status.className = "puzzle-status success";
    systemMessage.textContent =
      "SYSTEM:: ALIGNMENT ACCEPTED // FRAGMENT STABILITY +1 // NEXT PROTOCOL UNLOCKED";
    markCurrentLevelCompleted();
    return;
  }

  slots.forEach((slot, index) => {
    slot.classList.toggle("incorrect", placedShapes[index] !== solution[index]);
  });
  status.textContent =
    "Désynchronisation détectée. Les formes ne répondent pas au même rythme.";
  status.className = "puzzle-status error";
  systemMessage.textContent =
    "SYSTEM:: ALIGNMENT ERROR // PATTERN DESYNC // RESEQUENCE REQUIRED";
}

function resetPuzzle() {
  placedShapes = [null, null, null];
  selectedPiece = null;
  board.classList.remove("solved");
  slots.forEach((slot) => {
    slot.className = "target-slot";
    slot.replaceChildren();
  });
  pieces.forEach((piece) => {
    piece.classList.remove("selected", "placed");
    piece.removeAttribute("aria-disabled");
  });
  status.textContent =
    "Sélectionne une forme ou fais-la glisser vers un emplacement.";
  status.className = "puzzle-status";
  systemMessage.textContent =
    "SYSTEM:: INPUT REQUIRED // 3 GEOMETRIC FRAGMENTS DETECTED // ALIGNMENT PROTOCOL READY";
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
updateProgress();
renderProgress();
