const save = window.EchoesSave;
const levels = window.EchoesLevels;
const english = localStorage.getItem("echoes-language") === "en";
const text = english ? {
  loading: "Loading the forge…",
  instructions: "Place each key in its matching socket, then pull the lever.",
  missing: "Collect the six resonance keys before using the forge.",
  empty: n => `Socket ${n}, empty`,
  occupied: (n, k, correct) => `Socket ${n}, key ${k}, ${correct ? "correct" : "incorrect"}`,
  placed: (k, n, correct) => `Key ${k} placed in socket ${n}: ${correct ? "correct" : "incorrect"}.`,
  removed: n => `Key removed from socket ${n}.`,
  ready: "All six sockets are correct. The lever is unlocked.",
  locked: "Place all six correct keys before pulling the lever.",
  complete: "Key 07 forged.",
  forging: "The six signals are merging. Key 07 is taking shape…",
  cinematicSub: "The six resonance keys have united to create the memory key.",
  error: "Could not save key 07. Pull the lever again to retry.",
  loadError: "Unable to load the forge. Use a local web server and try again.",
  picker: n => `Choose a key for socket ${n}`,
  key: n => `Key ${n}`,
  used: "already placed",
  remove: "Remove key",
  close: "Close",
  reset: "Restart",
  exit: "Return to campaign",
  lever: "Pull the forge lever",
  eyebrow: "FINAL ENDING // PROTOCOL 07",
  kicker: "AFTER LEVEL 30 // ECHO'S WORKSHOP",
  heading: "The memory forge",
  description: "Drag the six keys onto their matching circles. Once all six lights are on, pull the lever to forge key 07.",
  panelKicker: "SIX KEYS // ONE MEMORY",
  panelHeading: "The resonance forge",
  help: "Drag a key from the tray to its circle, or select a key and then a circle. Double-click a placed key to return it to the tray. On touch or keyboard, select a circle to remove it.",
  touchHelp: "Tap a circle, choose its key, then tap the lever when all six lights are on.",
  orientationTitle: "Turn your device sideways",
  orientationDescription: "Turn your phone or iPad horizontally to display the forge and all six keys.",
  dockTitle: "RESONANCE KEYS // DRAG TO THE FORGE",
  dockLabel: "Available keys",
  progress: n => `${n} / 6 SIGNALS`,
  selected: n => `Key ${n} selected. Choose a socket.`,
} : {
  loading: "Chargement de la forge…",
  instructions: "Place chaque clé dans son emplacement, puis abaisse le levier.",
  missing: "Récupère les six clés de résonance avant d'utiliser la forge.",
  empty: n => `Emplacement ${n}, vide`,
  occupied: (n, k, correct) => `Emplacement ${n}, clé ${k}, ${correct ? "correcte" : "incorrecte"}`,
  placed: (k, n, correct) => `Clé ${k} placée sur l'emplacement ${n} : ${correct ? "correct" : "incorrect"}.`,
  removed: n => `Clé retirée de l'emplacement ${n}.`,
  ready: "Les six emplacements sont validés. Le levier est débloqué.",
  locked: "Place les six bonnes clés avant de tirer le levier.",
  complete: "Clé 07 forgée.",
  forging: "Les six signaux fusionnent. La clé 07 prend forme…",
  cinematicSub: "Les six clés de résonance se sont réunies pour créer la clé mémoire.",
  error: "Impossible d'enregistrer la clé 07. Tire de nouveau le levier pour réessayer.",
  loadError: "Impossible de charger la forge. Utilise un serveur local et réessaie.",
  picker: n => `Choisis une clé pour l'emplacement ${n}`,
  key: n => `Clé ${n}`,
  used: "déjà placée",
  remove: "Retirer la clé",
  close: "Fermer",
  reset: "Recommencer",
  exit: "Retour à la campagne",
  lever: "Tirer le levier de la forge",
  eyebrow: "FIN FINALE // PROTOCOLE 07",
  kicker: "APRÈS LE NIVEAU 30 // ATELIER D'ECHO",
  heading: "La forge de mémoire",
  description: "Glisse les six clés sur les cercles correspondants. Lorsque les six voyants sont allumés, abaisse le levier pour forger la clé 07.",
  panelKicker: "SIX CLÉS // UNE MÉMOIRE",
  panelHeading: "La forge des résonances",
  help: "Glisse une clé du tiroir vers son cercle, ou sélectionne une clé puis un cercle. Double-clique sur une clé placée pour la remettre dans le tiroir. Sur tactile ou au clavier, sélectionne le cercle pour la retirer.",
  touchHelp: "Touche un cercle, choisis sa clé, puis touche le levier quand les six voyants sont allumés.",
  orientationTitle: "Tourne ton appareil à l’horizontale",
  orientationDescription: "Place ton téléphone ou ton iPad sur le côté pour afficher la forge et les six clés.",
  dockTitle: "CLÉS DE RÉSONANCE // GLISSER VERS LA FORGE",
  dockLabel: "Clés disponibles",
  progress: n => `${n} / 6 SIGNAUX`,
  selected: n => `Clé ${n} sélectionnée. Choisis un emplacement.`,
};

const stage = document.getElementById("forgeStage");
const status = document.getElementById("forgeStatus");
const dock = document.getElementById("forgeDock");
const picker = document.getElementById("forgePicker");
const pickerKeys = document.getElementById("forgePickerKeys");
const pickerTitle = document.getElementById("forgePickerTitle");
const pickerClose = document.getElementById("forgePickerClose");
const removeButton = document.getElementById("forgeRemove");
const resetButton = document.getElementById("forgeReset");
const exit = document.getElementById("forgeExit");
const devMode = localStorage.getItem("echoes-dev-unlock") === "1" ||
  sessionStorage.getItem("echoes-dev-unlock") === "1";
const numbers = [1, 2, 3, 4, 5, 6];
const state = { slots: Object.fromEntries(numbers.map(n => [n, null])), pulled: false };
let svg;
let lever;
let pickerSlot = null;
let hoverSlot = null;
let drag = null;
let leverDrag = null;
let locked = true;
let selectedKey = null;
let pendingSlotClick = null;
let scrollFrame = null;
let forging = false;

function cancelPendingSlotClick() {
  if (pendingSlotClick) window.clearTimeout(pendingSlotClick.timer);
  pendingSlotClick = null;
}

function announce(message, error = false) {
  status.textContent = message;
  status.classList.toggle("is-error", error);
}

function snapshot() {
  return { slots: { ...state.slots }, pulled: state.pulled };
}

function changed() {
  document.dispatchEvent(new CustomEvent("forge:change", { detail: snapshot() }));
}

function ready() {
  return numbers.every(n => state.slots[n] === n);
}

function element(id) {
  return svg.querySelector(`#${id}`);
}

function render() {
  const correctCount = numbers.filter(n => state.slots[n] === n).length;
  document.getElementById("forgeProgress").textContent = text.progress(correctCount);
  numbers.forEach(n => {
    const key = state.slots[n];
    const correct = key === n;
    const slot = element(`slot-${n}`);
    const shape = element(`key-${n}`);
    if (key === null) slot.removeAttribute("data-holds");
    else slot.setAttribute("data-holds", String(key));
    slot.classList.toggle("is-hover", hoverSlot === n || pickerSlot === n);
    slot.classList.toggle("is-active", correct);
    slot.classList.toggle("is-correct", correct);
    slot.classList.toggle("is-wrong", key !== null && !correct);
    shape.classList.toggle("is-correct", correct);
    shape.classList.toggle("is-wrong", key !== null && !correct);
    ["link", "lever-lamp", "pip"].forEach(prefix =>
      element(`${prefix}-${n}`).classList.toggle("is-active", correct));
    slot.setAttribute("aria-label", key === null ? text.empty(n) : text.occupied(n, key, correct));
    slot.setAttribute("aria-disabled", String(locked || state.pulled));
  });
  lever.classList.toggle("is-ready", ready() && !locked);
  lever.classList.toggle("is-pulled", state.pulled);
  lever.setAttribute("aria-disabled", String(locked || !ready() || state.pulled));
  element("key-7").classList.toggle("is-correct", state.pulled && !forging);
  element("core-heat").style.opacity = String(state.pulled ? 1 : .16 + correctCount * .14);
  ["key7-fill", "core-aura"].forEach(id => {
    if (state.pulled) element(id).style.opacity = "1";
    else element(id).style.removeProperty("opacity");
  });
  const used = Object.values(state.slots);
  dock.querySelectorAll("button").forEach(button => {
    const placed = used.includes(Number(button.dataset.key));
    button.classList.toggle("is-placed", placed);
    button.classList.toggle("is-selected", Number(button.dataset.key) === selectedKey);
    button.setAttribute("aria-pressed", String(Number(button.dataset.key) === selectedKey));
    button.setAttribute("aria-label", `${text.key(button.dataset.key)}${placed ? ` — ${text.used}` : ""}`);
    button.disabled = placed || locked || state.pulled;
  });
  pickerKeys.querySelectorAll("button").forEach(button => {
    const placed = used.includes(Number(button.dataset.key));
    button.classList.toggle("is-used", placed);
    button.setAttribute("aria-label", `${text.key(button.dataset.key)}${placed ? ` — ${text.used}` : ""}`);
    button.disabled = locked || state.pulled;
  });
  removeButton.hidden = pickerSlot === null || state.slots[pickerSlot] === null;
  resetButton.disabled = forging;
}

function placeKey(key, slot) {
  if (locked || state.pulled) return;
  cancelPendingSlotClick();
  selectedKey = null;
  const wasReady = ready();
  numbers.forEach(n => {
    if (state.slots[n] === key) state.slots[n] = null;
  });
  state.slots[slot] = key;
  render();
  announce(!wasReady && ready() ? text.ready : text.placed(key, slot, key === slot));
  changed();
}

function selectKey(key) {
  if (locked || state.pulled) return;
  selectedKey = selectedKey === key ? null : key;
  render();
  announce(selectedKey === null ? text.instructions : text.selected(key));
}

function removeKey(slot) {
  if (locked || state.pulled || state.slots[slot] === null) return;
  cancelPendingSlotClick();
  state.slots[slot] = null;
  render();
  announce(text.removed(slot));
  changed();
}

function makeKeyButton(n) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "forge-key";
  button.dataset.key = String(n);
  button.setAttribute("aria-label", text.key(n));
  const image = document.createElement("img");
  image.src = levels.keys[n - 1].image;
  image.alt = "";
  image.draggable = false;
  const label = document.createElement("span");
  label.textContent = String(n).padStart(2, "0");
  button.append(image, label);
  button.addEventListener("contextmenu", event => event.preventDefault());
  return button;
}

function closePicker() {
  const previous = pickerSlot;
  pickerSlot = null;
  picker.hidden = true;
  document.body.classList.remove("forge-dialog-open");
  render();
  if (previous !== null) element(`slot-${previous}`).focus();
}

function openPicker(n) {
  if (locked || state.pulled) return;
  cancelPendingSlotClick();
  pickerSlot = n;
  pickerTitle.textContent = text.picker(n);
  picker.hidden = false;
  document.body.classList.add("forge-dialog-open");
  render();
  pickerKeys.querySelector("button").focus();
}

function initTouchPicker() {
  numbers.forEach(n => {
    const button = makeKeyButton(n);
    button.addEventListener("click", () => {
      if (pickerSlot === null) return;
      placeKey(n, pickerSlot);
      closePicker();
    });
    pickerKeys.appendChild(button);
    const slot = element(`slot-${n}`);
    slot.setAttribute("tabindex", "0");
    slot.setAttribute("role", "button");
    slot.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (selectedKey !== null) placeKey(selectedKey, n);
        else openPicker(n);
      }
    });
  });
  pickerClose.addEventListener("click", closePicker);
  removeButton.addEventListener("click", () => {
    if (pickerSlot !== null) removeKey(pickerSlot);
    closePicker();
  });
  picker.addEventListener("pointerdown", event => {
    if (event.target === picker) closePicker();
  });
}

function slotAt(x, y) {
  const target = document.elementFromPoint(x, y);
  const slot = target && target.closest(".slot");
  return slot && svg.contains(slot) ? Number(slot.dataset.key) : null;
}

function autoScrollDrag() {
  if (!drag || !drag.moved) {
    scrollFrame = null;
    return;
  }
  const edge = 60;
  const distance = drag.clientY < edge ? drag.clientY - edge :
    drag.clientY > window.innerHeight - edge ? drag.clientY - (window.innerHeight - edge) : 0;
  if (distance) {
    window.scrollBy(0, Math.sign(distance) * Math.min(18, Math.abs(distance) / 3));
    hoverSlot = slotAt(drag.clientX, drag.clientY);
    render();
  }
  scrollFrame = window.requestAnimationFrame(autoScrollDrag);
}

function finishDrag(event, cancelled = false) {
  if (!drag || (event && event.pointerId !== drag.pointerId)) return;
  const current = drag;
  drag = null;
  if (scrollFrame !== null) window.cancelAnimationFrame(scrollFrame);
  scrollFrame = null;
  const destination = !cancelled && event ? slotAt(event.clientX, event.clientY) : null;
  hoverSlot = null;
  if (current.moved && destination !== null) {
    placeKey(current.key, destination);
    current.ghost.remove();
  } else {
    if (!current.moved && !cancelled) {
      if (current.fromSlot !== null && current.pointerType !== "touch") {
        if (pendingSlotClick && pendingSlotClick.slot === current.fromSlot) {
          removeKey(current.fromSlot);
        } else {
          cancelPendingSlotClick();
          const slot = current.fromSlot;
          pendingSlotClick = { slot, timer: window.setTimeout(() => {
            pendingSlotClick = null;
            if (state.slots[slot] !== null) openPicker(slot);
          }, 400) };
        }
      } else if (current.fromSlot !== null) openPicker(current.fromSlot);
      else selectKey(current.key);
    }
    const rect = current.source.getBoundingClientRect();
    current.ghost.classList.add("is-returning");
    current.ghost.style.left = `${rect.left + rect.width / 2}px`;
    current.ghost.style.top = `${rect.top + rect.height / 2}px`;
    window.setTimeout(() => current.ghost.remove(), 250);
  }
  if (current.source.hasPointerCapture(current.pointerId)) {
    current.source.releasePointerCapture(current.pointerId);
  }
  render();
}

function startDrag(event, key, fromSlot = null) {
  if (locked || state.pulled || event.button !== 0 || drag || leverDrag) return;
  event.preventDefault();
  const source = event.currentTarget;
  const ghost = document.createElement("img");
  ghost.src = levels.keys[key - 1].image;
  ghost.alt = "";
  ghost.className = "forge-ghost";
  ghost.style.left = `${event.clientX}px`;
  ghost.style.top = `${event.clientY}px`;
  document.body.appendChild(ghost);
  drag = { key, fromSlot, source, ghost, pointerId: event.pointerId, pointerType: event.pointerType, x: event.clientX, y: event.clientY, clientX: event.clientX, clientY: event.clientY, moved: false };
  source.setPointerCapture(event.pointerId);
}

function initDesktopDrag() {
  numbers.forEach(n => {
    const button = makeKeyButton(n);
    button.addEventListener("pointerdown", event => startDrag(event, n));
    button.addEventListener("click", event => {
      if (event.detail === 0 && !locked && !state.pulled) {
        selectKey(n);
      }
    });
    dock.appendChild(button);
    const slot = element(`slot-${n}`);
    slot.querySelector(".slot-hit").addEventListener("pointerdown", event => {
      if (selectedKey !== null) {
        event.preventDefault();
        placeKey(selectedKey, n);
      } else if (state.slots[n] !== null) {
        startDrag(event, state.slots[n], n);
      } else if (!locked && !state.pulled) {
        openPicker(n);
      }
    });
    slot.addEventListener("contextmenu", event => event.preventDefault());
  });
  document.addEventListener("pointermove", event => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    drag.moved ||= Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > 5;
    if (drag.moved) cancelPendingSlotClick();
    drag.clientX = event.clientX;
    drag.clientY = event.clientY;
    if (drag.moved && scrollFrame === null) scrollFrame = window.requestAnimationFrame(autoScrollDrag);
    drag.ghost.style.left = `${event.clientX}px`;
    drag.ghost.style.top = `${event.clientY}px`;
    hoverSlot = slotAt(event.clientX, event.clientY);
    render();
  });
  document.addEventListener("pointerup", event => finishDrag(event));
  document.addEventListener("pointercancel", event => finishDrag(event, true));
  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    cancelPendingSlotClick();
    if (drag) finishDrag(null, true);
    if (!picker.hidden) closePicker();
    if (selectedKey !== null) {
      selectedKey = null;
      render();
      announce(text.instructions);
    }
  });
}

function completeForge() {
  if (locked || state.pulled) return;
  if (!ready()) {
    announce(text.locked, true);
    return;
  }
  try {
    if (!devMode && ((!save.getKeys().includes("resonance-7") && !save.unlockKey("resonance-7")) ||
        !levels.markCompleted("finale"))) {
      announce(text.error, true);
      return;
    }
  } catch (error) {
    console.error("Forge save failed:", error);
    announce(text.error, true);
    return;
  }
  state.pulled = true;
  forging = true;
  render();
  announce(text.forging);
  changed();
  if (navigator.vibrate) navigator.vibrate([80, 40, 120]);
  const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 4000;
  window.setTimeout(() => {
    forging = false;
    render();
    announce(text.complete);
    document.dispatchEvent(new CustomEvent("forge:complete", { detail: snapshot() }));
    window.EchoesKeyFragments.playCinematic({
      keyNumber: 7,
      src: new URL("../assets/svg/cles/key-07-usb.svg", import.meta.url).href,
      subtitle: text.cinematicSub,
    });
  }, duration);
}

function initLever() {
  const hit = lever.querySelector(".lever-hit");
  lever.setAttribute("tabindex", "0");
  lever.setAttribute("role", "button");
  lever.setAttribute("aria-label", text.lever);
  lever.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      completeForge();
    }
  });
  hit.addEventListener("pointerdown", event => {
    if (event.button !== 0 || state.pulled) return;
    event.preventDefault();
    if (locked || !ready()) {
      announce(text.locked, true);
      return;
    }
    leverDrag = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, angle: -50, moved: false, pointerType: event.pointerType };
    lever.classList.add("is-dragging");
    hit.setPointerCapture(event.pointerId);
  });
  hit.addEventListener("pointermove", event => {
    if (!leverDrag || event.pointerId !== leverDrag.pointerId) return;
    leverDrag.moved ||= Math.hypot(event.clientX - leverDrag.x, event.clientY - leverDrag.y) > 8;
    const matrix = svg.getScreenCTM();
    if (!matrix) return;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    leverDrag.angle = Math.max(-50, Math.min(50, Math.atan2(point.y - 376, point.x - 934) * 180 / Math.PI));
    lever.style.setProperty("--lever-angle", `${leverDrag.angle}deg`);
  });
  const end = (event, cancelled) => {
    if (!leverDrag || event.pointerId !== leverDrag.pointerId) return;
    const pull = !cancelled && (leverDrag.angle >= 40 || (leverDrag.pointerType === "touch" && !leverDrag.moved));
    leverDrag = null;
    lever.classList.remove("is-dragging");
    lever.style.removeProperty("--lever-angle");
    if (hit.hasPointerCapture(event.pointerId)) hit.releasePointerCapture(event.pointerId);
    if (pull) completeForge();
  };
  hit.addEventListener("pointerup", event => end(event, false));
  hit.addEventListener("pointercancel", event => end(event, true));
}

async function loadSvg() {
  const url = new URL("../assets/svg/forge/forge.svg", import.meta.url);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Forge SVG: HTTP ${response.status}`);
  const documentSvg = new DOMParser().parseFromString(await response.text(), "image/svg+xml");
  if (documentSvg.querySelector("parsererror") || documentSvg.documentElement.localName !== "svg") {
    throw new Error("Forge SVG is invalid");
  }
  svg = document.importNode(documentSvg.documentElement, true);
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  svg.setAttribute("role", "group");
  stage.replaceChildren(svg);
  lever = element("lever");
  const ids = numbers.flatMap(n => [`slot-${n}`, `key-${n}`, `link-${n}`, `lever-lamp-${n}`, `pip-${n}`]);
  ids.push("lever", "key-7", "core-heat", "key7-fill", "core-aura");
  if (ids.some(id => !element(id)) || !lever.querySelector(".lever-hit") ||
      numbers.some(n => !element(`slot-${n}`).querySelector(".slot-hit"))) {
    throw new Error("Forge SVG is missing required controls");
  }
}

async function init() {
  document.documentElement.lang = english ? "en" : "fr";
  [
    ["forgeEyebrow", text.eyebrow], ["forgeKicker", text.kicker],
    ["forgeHeading", text.heading], ["forgeDescription", text.description],
    ["forgePanelKicker", text.panelKicker], ["forgePanelHeading", text.panelHeading],
    ["forgeHelp", text.help], ["forgeDockTitle", text.dockTitle],
    ["forgeTouchHelp", text.touchHelp], ["forgeOrientationTitle", text.orientationTitle],
    ["forgeOrientationDescription", text.orientationDescription],
  ].forEach(([id, value]) => { document.getElementById(id).textContent = value; });
  dock.setAttribute("aria-label", text.dockLabel);
  announce(text.loading);
  exit.textContent = text.exit;
  resetButton.textContent = text.reset;
  pickerClose.setAttribute("aria-label", text.close);
  removeButton.textContent = text.remove;
  if (!save || !levels || !window.EchoesKeyFragments) throw new Error("Campaign or key animation system is unavailable");
  await loadSvg();
  locked = !devMode && !numbers.every(n => save.getKeys().includes(`resonance-${n}`));
  initTouchPicker();
  initDesktopDrag();
  initLever();
  resetButton.addEventListener("click", () => {
    cancelPendingSlotClick();
    if (drag) finishDrag(null, true);
    if (!picker.hidden) closePicker();
    numbers.forEach(n => { state.slots[n] = null; });
    state.pulled = false;
    selectedKey = null;
    hoverSlot = null;
    render();
    announce(locked ? text.missing : text.instructions, locked);
    changed();
  });
  if (!devMode && !locked && save.getKeys().includes("resonance-7")) {
    numbers.forEach(n => { state.slots[n] = n; });
    try {
      state.pulled = levels.markCompleted("finale");
      announce(state.pulled ? text.complete : text.error, !state.pulled);
    } catch (error) {
      console.error("Forge completion save failed:", error);
      announce(text.error, true);
    }
  } else {
    announce(locked ? text.missing : text.instructions, locked);
  }
  render();
}

init().catch(error => {
  console.error("Forge initialization failed:", error);
  announce(text.loadError, true);
});
