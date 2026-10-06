// LOGIN PAGE // authenticates the player and routes to a new or saved game.
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const saveChoice = document.getElementById("saveChoice");
const saveSummary = document.getElementById("saveSummary");
const newGameButton = document.getElementById("newGameButton");
const resumeButton = document.getElementById("resumeButton");
const deleteSaveButton = document.getElementById("deleteSaveButton");
const passwordInput = document.getElementById("password");
const passwordToggle = document.getElementById("passwordToggle");
const translations = window.translations;
const language = localStorage.getItem("echoes-language") === "en" ? "en" : "fr";
const dictionary = translations[language];
let passwordVisible = false;

document.documentElement.lang = language;
document.querySelectorAll("[data-i18n]").forEach((element) => {
  const key = element.dataset.i18n;
  if (dictionary[key]) element.textContent = dictionary[key];
});

// Keeps the password control and its accessibility state synchronized.
function updatePasswordToggle() {
  passwordToggle.textContent =
    dictionary[passwordVisible ? "hidePassword" : "showPassword"];
  passwordToggle.setAttribute("aria-pressed", String(passwordVisible));
}

passwordToggle.addEventListener("click", () => {
  passwordVisible = !passwordVisible;
  passwordInput.type = passwordVisible ? "text" : "password";
  updatePasswordToggle();
});
updatePasswordToggle();

let currentUsername = null;

// Maps a saved level number to the relative level HTML page.
function destinationForSave(save) {
  const levelMatch = /^level-(\d+)$/.exec(save?.currentPage || "");
  if (levelMatch) {
    const level = Number(levelMatch[1]);
    const parts = [
      { start: 1, end: 10, folder: "partie-1_niveau-1_à_10" },
      { start: 11, end: 20, folder: "partie-2_niveau-11_à_20" },
      { start: 21, end: 30, folder: "partie-3_niveau-21_à_30" },
      { start: 31, end: 40, folder: "partie-4_niveau-31_à_40" },
      { start: 41, end: 50, folder: "partie-5_niveau-41_à_50" },
      { start: 51, end: 60, folder: "partie-6_niveau-51_à_60" },
    ];
    const part = parts.find(({ start, end }) => level >= start && level <= end);
    if (part && level <= 60) {
      const encodedFolder = encodeURIComponent(part.folder);
      return `${encodedFolder}/niveau-${String(level).padStart(2, "0")}.html`;
    }
  }
  return "introduction.html";
}

// Displays the resume/new-game choice after successful authentication.
function showSaveChoice(username) {
  currentUsername = username;
  const save = window.EchoesSave.getSave(username);
  saveChoice.hidden = false;
  resumeButton.hidden = !save;
  deleteSaveButton.hidden = !save;
  saveSummary.textContent = save
    ? `${dictionary.saveFound} ${save.currentLevel || 0}.`
    : dictionary.saveEmpty;
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const result = window.EchoesSave.loginOrCreate(
    formData.get("username"),
    formData.get("password"),
  );

  if (!result.ok) {
    loginError.hidden = false;
    loginError.textContent = dictionary.loginError;
    return;
  }

  loginError.hidden = true;
  showSaveChoice(result.username);
});

newGameButton.addEventListener("click", () => {
  window.EchoesSave.startNewGame(currentUsername);
  window.location.href = "introduction.html";
});

resumeButton.addEventListener("click", () => {
  const save = window.EchoesSave.getSave(currentUsername);
  window.location.href = destinationForSave(save);
});

deleteSaveButton.addEventListener("click", () => {
  if (!window.confirm(dictionary.deleteSaveConfirm)) return;
  window.EchoesSave.deleteSave(currentUsername);
  resumeButton.hidden = true;
  deleteSaveButton.hidden = true;
  saveSummary.textContent = dictionary.saveEmpty;
});
