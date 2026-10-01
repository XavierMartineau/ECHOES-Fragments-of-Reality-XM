function installBackButton() {
  let footer = document.querySelector(".level-footer");
  if (!footer) {
    footer = document.createElement("footer");
    footer.className = "level-footer";
    document.body.appendChild(footer);
  }
  if (!footer.querySelector(".site-credit")) {
    const credit = document.createElement("span");
    credit.className = "site-credit";
    credit.textContent = "© 2026 Xavier Martineau // TOUS DROITS RÉSERVÉS";
    footer.appendChild(credit);
  }
  const button = document.createElement("button");
  button.className = "level-back-button";
  button.type = "button";
  button.textContent = "← RETOUR";
  button.setAttribute("aria-label", "Retour à la page précédente");
  button.addEventListener("click", () =>
    window.history.length > 1
      ? window.history.back()
      : (window.location.href = "../../../index.html"),
  );
  document.body.prepend(button);
}
installBackButton();
