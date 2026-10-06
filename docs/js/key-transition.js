// ============================================================================
// Transition de clé : dialogue de récompense et mise à jour du compteur de clés après le boss de la Clé 01.
// ============================================================================
(() => {
  const keyHud = document.querySelector(".key-hud, .key-redesign-hud");
  const keyValue = keyHud?.querySelector(".key-hud-value");
  const dialogueShell = document.getElementById("rewardDialogue");
  const dialogueText = document.getElementById("dialogueText");
  const dialogueHint = document.getElementById("dialogueHint");
  const rewardAction = document.getElementById("rewardAction");
  const continueButton = document.getElementById("continueToInterlude");
  const rewardStep = document.getElementById("rewardStep");
  const terminal = document.getElementById("echoTerminal");
  const terminalMessage = document.getElementById("terminalMessage");
  const feedback = document.getElementById("rewardFeedback");
  const vault = document.getElementById("rewardVault");
  const rewardKey = document.getElementById("rewardKey");
  const travelerKeyDisplay = document.getElementById("travelerKeyDisplay");
  const keyHudSlot = document.getElementById("keyHudSlot");
  const forceReplay = new URLSearchParams(window.location.search).has("dev");
  const alreadyUnlocked =
    !forceReplay && window.EchoesSave?.getKeys?.().includes("resonance-1");
  const messages = [
    {
      speaker: "VOYAGEUR",
      className: "traveler",
      text: "Le gardien est tombé. Pourtant... cette lumière bat encore sous les ruines.",
    },
    {
      speaker: "ECHO",
      className: "echo",
      text: "Arrête-toi. Ce n'est pas une lumière. C'est une mémoire qui cherche un porteur.",
      glitch: true,
    },
    {
      speaker: "VOYAGEUR",
      className: "traveler",
      text: "Une clé ? Elle ressemble au symbole gravé sur le noyau du gardien.",
    },
    {
      speaker: "ECHO",
      className: "echo",
      text: "Oui. La première Clé de Résonance. Elle ne s'ouvre pas avec la force, mais avec ton signal.",
    },
    {
      speaker: "VOYAGEUR",
      className: "traveler",
      text: "Alors je vais lui répondre. Echo, reste avec moi pendant la synchronisation.",
    },
    {
      speaker: "ECHO",
      className: "echo",
      text: "Je suis là. Confirme la récupération et laisse la clé rejoindre ton réseau.",
    },
  ];
  const postKeyMessages = [
    {
      speaker: "ECHO",
      className: "echo",
      text: "La synchronisation est terminée. La clé est désormais liée à ton empreinte.",
    },
    {
      speaker: "VOYAGEUR",
      className: "traveler",
      text: "J'entends le signal. Quel chemin devons-nous prendre maintenant ?",
    },
    {
      speaker: "ECHO",
      className: "echo",
      text: "Suis le cercle brisé. Derrière lui se trouve la prochaine fracture de la réalité.",
    },
  ];
  // Traduit un message de dialogue selon la langue choisie.
  const translateMessage = (message) => {
    const tr = window.echoesTranslate;
    if (tr) {
      message.text = tr(message.text);
      message.speaker = tr(message.speaker);
    }
  };
  messages.forEach(translateMessage);
  postKeyMessages.forEach(translateMessage);
  let messageIndex = 0;
  let isStarted = false;
  let isTyping = false;
  let typeTimer = 0;
  let autoAdvanceTimer = 0;
  let rewardAnimationTimer = 0;
  let rewardIsAnimating = false;
  let postKeyIndex = 0;

  // Change l'étape affichée de la séquence de récompense.
  const setStep = (step) => {
    rewardStep.textContent = `${String(step).padStart(2, "0")} // 05`;
  };

  // Débloque la clé et met à jour le compteur de clés.
  const unlockReward = () => {
    if (rewardIsAnimating) return;
    rewardIsAnimating = true;
    window.EchoesSave?.unlockKey?.("resonance-1");
    keyValue.textContent = "1 / 6";
    keyHud.classList.add("is-unlocked");
    keyHudSlot?.classList.add("is-arriving");
    vault.classList.remove("is-unlocked");
    vault.classList.add("is-unlocked", "is-arriving");
    rewardKey.setAttribute("aria-hidden", "false");
    rewardAction.hidden = true;
    continueButton.hidden = true;
    terminalMessage.textContent = "RÉSONANCE 01 // OBJET EN APPROCHE";
    feedback.textContent = "La clé traverse le champ de résonance...";
    dialogueHint.textContent = "Animation de récupération en cours...";
    rewardAnimationTimer = window.setTimeout(() => {
      vault.classList.remove("is-arriving");
      keyHudSlot?.classList.remove("is-arriving");
      keyHudSlot?.classList.add("is-visible");
      feedback.textContent = "CLÉ 01 RÉCUPÉRÉE // PROGRESSION ENREGISTRÉE";
      feedback.classList.add("is-success");
      terminalMessage.textContent = "NOUVEAU CANAL // INDICE DE LA SUITE";
      dialogueHint.textContent = "Transmission automatique // indice entrant...";
      rewardIsAnimating = false;
      typePostKeyMessage();
    }, 1900);
  };

  // Termine la transmission qui suit l'obtention de la clé.
  const finishPostKeyTransmission = () => {
    setStep(5);
    terminalMessage.textContent = "TRANSMISSION COMPLÈTE // PASSAGE OUVERT";
    dialogueHint.textContent = "Indice reçu // niveau suivant disponible";
    feedback.textContent = "CLÉ 01 RÉCUPÉRÉE // INDICE ENREGISTRÉ";
    continueButton.hidden = false;
    continueButton.focus();
  };

  // Écrit le message post-clé lettre par lettre.
  const typePostKeyMessage = () => {
    if (postKeyIndex >= postKeyMessages.length) {
      window.setTimeout(finishPostKeyTransmission, 450);
      return;
    }
    const message = postKeyMessages[postKeyIndex];
    travelerKeyDisplay?.classList.remove("is-visible");
    const line = document.createElement("p");
    const speaker = document.createElement("strong");
    const text = document.createElement("span");
    line.className = `dialogue-line ${message.className} post-key-line${message.className === "echo" ? " glitch-line" : ""}`;
    speaker.className = `speaker ${message.className}`;
    speaker.textContent = `${message.speaker} `;
    text.className = "dialogue-line-text";
    line.append(speaker, text);
    dialogueText.appendChild(line);
    let characterIndex = 0;
    const write = () => {
      text.textContent += message.text[characterIndex];
      characterIndex += 1;
      if (characterIndex < message.text.length) {
        typeTimer = window.setTimeout(write, ".!?".includes(message.text[characterIndex - 1]) ? 160 : 30);
        return;
      }
      postKeyIndex += 1;
      dialogueHint.textContent =
        postKeyIndex < postKeyMessages.length
          ? "Transmission automatique // prochaine réplique..."
          : "Transmission automatique // indice final...";
      autoAdvanceTimer = window.setTimeout(typePostKeyMessage, 850);
    };
    write();
  };

  // Termine le dialogue en cours et passe à l'étape suivante.
  const finishDialogue = () => {
    setStep(4);
    terminalMessage.textContent = "RÉCOMPENSE DISPONIBLE // CONFIRMATION REQUISE";
    feedback.textContent = "Clique sur le bouton pour confirmer la récupération.";
    rewardAction.hidden = false;
    rewardAction.textContent = "CONFIRMER LA RÉCUPÉRATION";
    rewardAction.onclick = unlockReward;
  };

  // Écrit un message de dialogue lettre par lettre.
  const typeMessage = (message) => {
    isTyping = true;
    const line = document.createElement("p");
    const speaker = document.createElement("strong");
    const text = document.createElement("span");
    const isEcho = message.className === "echo";
    travelerKeyDisplay?.classList.toggle("is-visible", !isEcho && messageIndex === 2);
    line.className = `dialogue-line ${message.className}${isEcho || message.glitch ? " glitch-line" : ""}`;
    speaker.className = `speaker ${message.className}`;
    speaker.textContent = `${message.speaker} `;
    text.className = "dialogue-line-text";
    line.append(speaker, text);
    dialogueText.appendChild(line);
    if (isEcho) {
      dialogueShell.classList.add("is-glitching");
      terminal.classList.add("is-glitching");
      terminalMessage.textContent = "SIGNAL CORROMPU // ANALYSE DU NOYAU";
    } else {
      dialogueShell.classList.remove("is-glitching");
      terminal.classList.remove("is-glitching");
    }
    let characterIndex = 0;
    const write = () => {
      text.textContent += message.text[characterIndex];
      characterIndex += 1;
      if (characterIndex < message.text.length) {
        typeTimer = window.setTimeout(write, ".!?".includes(message.text[characterIndex - 1]) ? 180 : 30);
      } else {
        isTyping = false;
        dialogueHint.textContent =
          messageIndex < messages.length
            ? "Transmission automatique // prochaine réplique..."
            : "Transmission terminée // confirmation disponible";
        if (messageIndex < messages.length) {
          autoAdvanceTimer = window.setTimeout(advanceDialogue, 900);
        } else {
          autoAdvanceTimer = window.setTimeout(finishDialogue, 500);
        }
      }
    };
    write();
  };

  // Passe à la réplique suivante (ou termine l'écriture en cours).
  const advanceDialogue = () => {
    window.clearTimeout(autoAdvanceTimer);
    if (isTyping) {
      window.clearTimeout(typeTimer);
      const current = dialogueText.lastElementChild?.querySelector(".dialogue-line-text");
      if (current) current.textContent = messages[messageIndex - 1].text;
      isTyping = false;
      dialogueHint.textContent =
        messageIndex < messages.length
          ? "Transmission automatique // prochaine réplique..."
          : "Transmission terminée // confirmation disponible";
      autoAdvanceTimer = window.setTimeout(
        messageIndex < messages.length ? advanceDialogue : finishDialogue,
        messageIndex < messages.length ? 900 : 500,
      );
      return;
    }
    if (messageIndex >= messages.length) return;
    typeMessage(messages[messageIndex]);
    messageIndex += 1;
  };

  // Démarre le dialogue de récompense.
  const startDialogue = () => {
    if (isStarted || alreadyUnlocked) return;
    isStarted = true;
    dialogueShell.classList.add("is-active");
    dialogueHint.textContent = "Transmission active // les répliques s'enchaînent";
    setStep(2);
    advanceDialogue();
  };

  dialogueShell.addEventListener("click", () => {
    if (!isStarted) startDialogue();
    else advanceDialogue();
  });
  dialogueShell.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!isStarted) startDialogue();
      else advanceDialogue();
    }
  });
  rewardAction.addEventListener("click", () => {
    if (!isStarted) startDialogue();
  });
  continueButton.addEventListener("click", () => {
    window.location.href = "niveau-05.html";
  });

  if (alreadyUnlocked) {
    isStarted = true;
    dialogueShell.classList.add("is-active");
    dialogueText.innerHTML = '<p class="dialogue-line echo"><strong class="speaker">ECHO </strong><span class="dialogue-line-text">La première clé est déjà enregistrée.</span></p>';
    dialogueHint.textContent = "Transmission terminée";
    terminalMessage.textContent = "RÉCOMPENSE DÉJÀ VALIDÉE // RÉSONANCE 01";
    unlockReward();
  }
})();
