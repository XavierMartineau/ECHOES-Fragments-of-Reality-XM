const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const saveChoice = document.getElementById("saveChoice");
const saveSummary = document.getElementById("saveSummary");
const newGameButton = document.getElementById("newGameButton");
const resumeButton = document.getElementById("resumeButton");
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

function destinationForSave(save) {
  if (save?.currentPage === "level-1") {
    return "partie-1_niveau-1_%C3%A0_15/niveau-01.html";
  }
  return "introduction.html";
}

function showSaveChoice(username) {
  currentUsername = username;
  const save = window.EchoesSave.getSave(username);
  saveChoice.hidden = false;
  resumeButton.hidden = !save;
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
