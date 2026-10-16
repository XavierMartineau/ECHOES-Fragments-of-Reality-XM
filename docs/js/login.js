// LOGIN PAGE // identifie le joueur par son nom d'utilisateur puis ouvre la sélection des niveaux.
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const usernameInput = document.getElementById("username");
const language = localStorage.getItem("echoes-language") === "en" ? "en" : "fr";
const dictionary = window.translations[language];

document.documentElement.lang = language;
document.querySelectorAll("[data-i18n]").forEach((element) => {
  const key = element.dataset.i18n;
  if (dictionary[key]) element.textContent = dictionary[key];
});

// Restaure le dernier nom d'utilisateur utilisé sur cet appareil.
usernameInput.value = window.EchoesSave.getCurrentUser() || "";

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const result = window.EchoesSave.enterAsUser(usernameInput.value);

  if (!result.ok) {
    loginError.hidden = false;
    loginError.textContent = dictionary.usernameRequired;
    usernameInput.setAttribute("aria-invalid", "true");
    usernameInput.focus();
    return;
  }

  window.location.href = "niveaux.html";
});

usernameInput.addEventListener("input", () => {
  loginError.hidden = true;
  usernameInput.removeAttribute("aria-invalid");
});
