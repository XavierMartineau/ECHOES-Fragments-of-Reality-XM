function installBackButton() {
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
