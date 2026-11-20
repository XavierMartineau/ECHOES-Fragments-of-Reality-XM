// FINAL FORGE // match the six resonance keys to their numbered sockets.
(() => {
  const save = window.EchoesSave;
  const levels = window.EchoesLevels;
  if (!save || !levels) return;

  const language =
    localStorage.getItem("echoes-language") === "en" ? "en" : "fr";
  const copy = {
    fr: {
      label: "CLÉ",
      select: (number) => `Clé ${number} sélectionnée. Choisis l'emplacement ${number}.`,
      placed: (number) => `Clé ${number} correctement installée.`,
      wrong: (key, slot) => `Mauvais emplacement : la clé ${key} va dans la matrice ${key}, pas ${slot}.`,
      progress: (count) => `${count} / 6 MODULES`,
      status: "Sélectionne une clé ou fais-la glisser vers son emplacement.",
      ready: "Les six clés sont alignées. Active la forge pour créer la clé 07.",
      missing: "Les six clés de résonance sont requises avant de lancer la forge.",
      saving: "Forge activée : synchronisation de la clé mémoire 07…",
      error: "La clé 07 n'a pas pu être enregistrée. Réessaie sans quitter la forge.",
      forged: "Assemblage réussi. La clé mémoire 07 est maintenant dans ta collection.",
      owned: "La clé mémoire 07 est déjà forgée et enregistrée.",
      finish: "FORGER LA CLÉ 07",
      retry: "RÉESSAYER L'ENREGISTREMENT",
      exit: "Retourner à la campagne",
      complete: "CLÉ MÉMOIRE 07 FORGÉE",
      empty: "MATRICE LIBRE",
      installed: "INSTALLÉE",
      anvil: "NOYAU INACTIF",
      anvilReady: "NOYAU ACTIF",
    },
    en: {
      label: "KEY",
      select: (number) => `Key ${number} selected. Choose socket ${number}.`,
      placed: (number) => `Key ${number} is correctly installed.`,
      wrong: (key, slot) => `Wrong socket: key ${key} belongs in matrix ${key}, not ${slot}.`,
      progress: (count) => `${count} / 6 MODULES`,
      status: "Select a key or drag it to its socket.",
      ready: "All six keys are aligned. Activate the forge to create key 07.",
      missing: "All six resonance keys are required before the forge can start.",
      saving: "Forge activated: synchronizing memory key 07…",
      error: "Key 07 could not be saved. Retry without leaving the forge.",
      forged: "Assembly complete. Memory key 07 is now in your collection.",
      owned: "Memory key 07 has already been forged and saved.",
      finish: "FORGE KEY 07",
      retry: "RETRY SAVE",
      exit: "Return to campaign",
      complete: "MEMORY KEY 07 FORGED",
      empty: "EMPTY MATRIX",
      installed: "INSTALLED",
      anvil: "CORE INACTIVE",
      anvilReady: "CORE ACTIVE",
    },
  }[language];
  const keySevenId = "resonance-7";
  const keyIds = Array.from({ length: 6 }, (_, index) => `resonance-${index + 1}`);
  const tray = document.getElementById("forgeKeyTray");
  const slots = document.getElementById("forgeSlots");
  const status = document.getElementById("forgeStatus");
  const readout = document.getElementById("forgeReadout");
  const progress = document.getElementById("forgeProgress");
  const finishButton = document.getElementById("forgeFinishButton");
  const exitButton = document.getElementById("forgeExitButton");
  const keySeven = document.getElementById("keySeven");
  const coreLabel = document.getElementById("forgeCoreLabel");
  const placed = new Set();
  const keyButtons = new Map();
  const slotButtons = new Map();
  let selectedKey = null;
  let forged = false;

  const setStatus = (message, isError = false) => {
    status.textContent = message;
    status.classList.toggle("error", isError);
    status.classList.toggle("success", !isError && forged);
  };

  const updateProgress = () => {
    const count = placed.size;
    readout.textContent = `${count} / 6`;
    progress.textContent = copy.progress(count);
    finishButton.hidden = count !== 6 || forged;
    if (count === 6 && !forged) setStatus(copy.ready);
  };

  const makeKeyButton = (key) => {
    const button = document.createElement("button");
    button.className = "forge-key";
    button.type = "button";
    button.draggable = true;
    button.dataset.keyNumber = String(key.number);
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-label", `${copy.label} ${key.number}`);
    button.innerHTML = `<img src="${key.image}" alt="" /><span>${copy.label} ${String(key.number).padStart(2, "0")}</span>`;
    button.addEventListener("click", () => selectKey(key.number));
    button.addEventListener("dragstart", (event) => {
      if (placed.has(key.number)) {
        event.preventDefault();
        return;
      }
      selectedKey = key.number;
      event.dataTransfer.setData("text/plain", String(key.number));
      event.dataTransfer.effectAllowed = "move";
      button.classList.add("is-selected");
    });
    button.addEventListener("dragend", () => {
      button.classList.remove("is-selected");
    });
    keyButtons.set(key.number, button);
    tray.appendChild(button);
  };

  const makeSlotButton = (number) => {
    const button = document.createElement("button");
    button.className = "forge-slot";
    button.type = "button";
    button.dataset.slotNumber = String(number);
    button.setAttribute("aria-label", `${copy.label} ${number}: ${copy.empty}`);
    button.innerHTML = `
      <span class="forge-slot-number">MATRICE ${String(number).padStart(2, "0")}</span>
      <img alt="" hidden />
      <span class="forge-slot-label">${copy.empty}</span>`;
    button.addEventListener("click", () => {
      if (selectedKey !== null) placeKey(selectedKey, number);
    });
    button.addEventListener("dragover", (event) => {
      if (placed.has(number) || forged) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      button.classList.add("is-target");
    });
    button.addEventListener("dragleave", () => {
      button.classList.remove("is-target");
    });
    button.addEventListener("drop", (event) => {
      event.preventDefault();
      button.classList.remove("is-target");
      const keyNumber = Number(event.dataTransfer.getData("text/plain"));
      if (Number.isInteger(keyNumber)) placeKey(keyNumber, number);
    });
    slotButtons.set(number, button);
    slots.appendChild(button);
  };

  const selectKey = (number) => {
    if (forged || placed.has(number)) return;
    selectedKey = number;
    keyButtons.forEach((button, key) => {
      button.classList.toggle("is-selected", key === number);
      button.setAttribute("aria-pressed", String(key === number));
    });
    setStatus(copy.select(number));
    slotButtons.get(number)?.focus();
  };

  const placeKey = (keyNumber, slotNumber) => {
    if (forged || placed.has(keyNumber) || placed.has(slotNumber)) return;
    if (keyNumber !== slotNumber) {
      const slot = slotButtons.get(slotNumber);
      slot.classList.add("is-wrong");
      setStatus(copy.wrong(keyNumber, slotNumber), true);
      window.setTimeout(() => slot.classList.remove("is-wrong"), 300);
      return;
    }

    placed.add(keyNumber);
    const keyButton = keyButtons.get(keyNumber);
    const slot = slotButtons.get(slotNumber);
    const image = slot.querySelector("img");
    image.src = levels.keys[keyNumber - 1].image;
    image.hidden = false;
    slot.querySelector(".forge-slot-label").textContent = copy.installed;
    slot.classList.add("is-correct");
    slot.setAttribute("aria-label", `${copy.label} ${slotNumber}: ${copy.installed}`);
    keyButton.classList.remove("is-selected");
    keyButton.classList.add("is-placed");
    keyButton.draggable = false;
    keyButton.disabled = true;
    keyButton.setAttribute("aria-pressed", "false");
    selectedKey = null;
    setStatus(copy.placed(keyNumber));
    updateProgress();
  };

  const showForgedKey = () => {
    forged = true;
    document.body.classList.add("is-forged");
    keySeven.hidden = false;
    coreLabel.textContent = copy.anvilReady;
    finishButton.hidden = true;
    exitButton.hidden = false;
    finishButton.disabled = false;
    exitButton.textContent = copy.exit;
  };

  const forgeKey = () => {
    if (placed.size !== keyIds.length || forged) return;
    finishButton.disabled = true;
    finishButton.textContent = copy.saving;
    setStatus(copy.saving);
    if (
      !save.getKeys().includes(keySevenId) &&
      !save.unlockKey(keySevenId)
    ) {
      finishButton.disabled = false;
      finishButton.textContent = copy.retry;
      setStatus(copy.error, true);
      return;
    }
    if (!levels.markCompleted("finale")) {
      finishButton.disabled = false;
      finishButton.textContent = copy.retry;
      setStatus(copy.error, true);
      return;
    }
    showForgedKey();
    finishButton.textContent = copy.finish;
    setStatus(copy.forged);
  };

  levels.keys.forEach(makeKeyButton);
  for (let number = 1; number <= 6; number += 1) makeSlotButton(number);
  finishButton.textContent = copy.finish;
  exitButton.textContent = copy.exit;
  coreLabel.textContent = copy.anvil;
  document.getElementById("forgeMessage").textContent =
    language === "en" ? "SYSTEM READY // SIX KEYS REQUIRED" : "SYSTÈME EN ATTENTE // SIX CLÉS REQUISES";
  document.getElementById("forgeEyebrow").textContent =
    language === "en" ? "MEMORY FORGE // PROTOCOL 07" : "FORGE MÉMOIRE // PROTOCOLE 07";
  document.getElementById("forgeKicker").textContent =
    language === "en" ? "AFTER LEVEL 30 // ECHO'S WORKSHOP" : "APRÈS LE NIVEAU 30 // ATELIER D'ECHO";
  document.getElementById("forgeTitle").textContent =
    language === "en" ? "The memory forge" : "La forge de mémoire";
  document.getElementById("forgeDescription").textContent =
    language === "en"
      ? "The six resonance keys must be reassembled in order. Place each key in the socket with the matching number to activate the core."
      : "Les six clés de résonance doivent être réassemblées dans l'ordre. Place chaque clé dans l'emplacement portant le même numéro pour activer le noyau.";
  document.getElementById("forgePanelKicker").textContent =
    language === "en" ? "ASSEMBLY // MEMORY CORE" : "ASSEMBLAGE // NOYAU DE MÉMOIRE";
  document.getElementById("forgePanelTitle").textContent =
    language === "en" ? "Resonance matrices" : "Les matrices d'accordage";
  document.getElementById("forgeFooter").textContent =
    language === "en" ? "ECHO // MEMORY FORGE" : "ÉCHO // FORGE DE MÉMOIRE";
  document.getElementById("forgeInstructions").innerHTML =
    language === "en"
      ? "<p><strong>1.</strong> Drag each key to the matrix with the same number.</p><p><strong>2.</strong> On touch screens or with a keyboard, select a key, then its socket.</p><p><strong>3.</strong> A mismatched socket rejects the key; all six matches are required.</p>"
      : "<p><strong>1.</strong> Fais glisser chaque clé vers la matrice du même numéro.</p><p><strong>2.</strong> Sur écran tactile ou au clavier, sélectionne une clé puis son emplacement.</p><p><strong>3.</strong> Une mauvaise matrice refuse la clé; les six correspondances sont nécessaires.</p>";
  exitButton.addEventListener("click", () => {
    window.location.href = levels.hubUrl;
  });
  finishButton.addEventListener("click", forgeKey);

  const ownedKeys = save.getKeys();
  if (!keyIds.every((keyId) => ownedKeys.includes(keyId))) {
    tray.querySelectorAll("button").forEach((button) => {
      button.disabled = true;
      button.draggable = false;
    });
    setStatus(copy.missing, true);
    return;
  }
  if (ownedKeys.includes(keySevenId)) {
    showForgedKey();
    levels.markCompleted("finale");
    setStatus(copy.owned);
    document.getElementById("forgeMessage").textContent = copy.complete;
  } else {
    setStatus(copy.status);
  }
  updateProgress();
})();
