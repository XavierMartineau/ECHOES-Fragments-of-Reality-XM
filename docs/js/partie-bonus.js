// ============================================================================
// Partie bonus : réveil du fragment bonus au clic sur le bouton.
// ============================================================================
const bonusButton = document.getElementById("bonusButton");
const bonusStatus = document.getElementById("bonusStatus");

bonusButton.addEventListener("click", () => {
  bonusButton.disabled = true;
  bonusStatus.textContent = "Fragment bonus réveillé. La réalité a répondu.";
});
