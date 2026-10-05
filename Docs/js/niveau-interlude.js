(() => {
  const consolePanel = document.getElementById("transmissionConsole");
  const dialogue = document.getElementById("interludeDialogue");
  const hint = document.getElementById("interludeHint");
  const status = document.getElementById("interludeStatus");
  const startButton = document.getElementById("stabilizeSignal");
  const continueButton = document.getElementById("continueToLevel5");
  const step = document.getElementById("transmissionStep");
  const keyValue = document.querySelector(".key-hud-value");
  const messages = [
    { speaker: "ECHO", className: "echo", text: "Voyageur... je reçois enfin ton signal." },
    { speaker: "VOYAGEUR", className: "traveler", text: "La clé est en sécurité. Qu'est-ce que tu vois ?" },
    { speaker: "ECHO", className: "echo", text: "Merci de l'avoir récupérée. Cherche maintenant la porte marquée d'un cercle brisé." },
  ];
  let index = 0;
  let started = false;
  let typing = false;
  let typeTimer = 0;
  let nextTimer = 0;

  const updateKeyHud = () => {
    const unlocked = window.EchoesSave?.getKeys?.()?.includes("resonance-1");
    if (unlocked) keyValue.textContent = "1 / 6";
  };

  const finish = () => {
    step.textContent = "03 // 03";
    hint.textContent = "Transmission reçue // passage suivant disponible";
    status.textContent = "INDICE ENREGISTRÉ // LA PORTE DU CERCLE BRISÉ T'ATTEND";
    status.classList.add("is-success");
    startButton.hidden = true;
    continueButton.hidden = false;
    consolePanel.classList.add("is-complete");
    continueButton.focus();
  };

  const typeLine = (message) => {
    typing = true;
    const line = document.createElement("p");
    const speaker = document.createElement("strong");
    const text = document.createElement("span");
    line.className = `transmission-line ${message.className}`;
    speaker.className = `speaker ${message.className}`;
    speaker.textContent = message.speaker;
    text.className = "transmission-line-text";
    line.append(speaker, text);
    dialogue.append(line);
    let character = 0;
    const write = () => {
      text.textContent += message.text[character];
      character += 1;
      if (character < message.text.length) {
        typeTimer = window.setTimeout(write, ".!?".includes(message.text[character - 1]) ? 160 : 28);
        return;
      }
      typing = false;
      if (index < messages.length) {
        hint.textContent = "Transmission automatique // prochaine réplique...";
        nextTimer = window.setTimeout(nextLine, 850);
      } else {
        window.setTimeout(finish, 450);
      }
    };
    write();
  };

  const nextLine = () => {
    window.clearTimeout(nextTimer);
    if (index >= messages.length) return;
    step.textContent = `${String(index + 1).padStart(2, "0")} // 03`;
    typeLine(messages[index]);
    index += 1;
  };

  const begin = () => {
    if (started) return;
    started = true;
    startButton.hidden = true;
    dialogue.replaceChildren();
    consolePanel.classList.add("is-active");
    status.textContent = "Synchronisation de la fréquence...";
    hint.textContent = "Transmission active // écoute en cours";
    nextLine();
  };

  startButton.addEventListener("click", begin);
  consolePanel.addEventListener("click", () => {
    if (!started) begin();
  });
  continueButton.addEventListener("click", () => {
    window.location.href = "niveau-05.html";
  });
  updateKeyHud();
})();
