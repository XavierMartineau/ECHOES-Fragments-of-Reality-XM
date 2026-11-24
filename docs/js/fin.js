/* ==========================================================================
   ECHOES — scène interactive · script.js
   Sommaire
     1. Constantes & états      5. Machine à états (actions)
     2. i18n FR / EN            6. Zoom caméra vers l'écran
     3. Utilitaires / tween     7. Chat : appendMessage(sender, text)
     4. Rendu (DOM)             8. Initialisation & outils de dev
   Astuce dev : ouvrir index.html?state=STATE_DRIVE_OPEN pour sauter à un état.
   ========================================================================== */
'use strict';

/* ---------- 1. Constantes & états ---------- */
const STATE_CLOSED        = 'STATE_CLOSED';
const STATE_OFF           = 'STATE_OFF';
const STATE_BOOTED        = 'STATE_BOOTED';
const STATE_USB_INSERTED  = 'STATE_USB_INSERTED';
const STATE_EXPLORER_OPEN = 'STATE_EXPLORER_OPEN';
const STATE_DRIVE_OPEN    = 'STATE_DRIVE_OPEN';
const STATE_ZOOM_CHAT     = 'STATE_ZOOM_CHAT';

/* Pour chaque état : action attendue de l'utilisateur, clé i18n du message système (écran) et du HUD */
const FLOW = {
  [STATE_CLOSED]:        { action: 'open-lid',      msg: null,               hud: 'hud.closed' },
  [STATE_OFF]:           { action: 'power',         msg: null,               hud: 'hud.off'  },
  [STATE_BOOTED]:        { action: 'insert-usb',    msg: 'msg.insertUsb',    hud: 'hud.insertUsb' },
  [STATE_USB_INSERTED]:  { action: 'open-explorer', msg: 'msg.openExplorer', hud: null },
  [STATE_EXPLORER_OPEN]: { action: 'open-drive',    msg: 'msg.openDrive',    hud: null },
  [STATE_DRIVE_OPEN]:    { action: 'run-exe',       msg: 'msg.openExe',      hud: null },
  [STATE_ZOOM_CHAT]:     { action: null,            msg: null,               hud: 'hud.zoom' },
};
const USB_IN_STATES   = [STATE_USB_INSERTED, STATE_EXPLORER_OPEN, STATE_DRIVE_OPEN, STATE_ZOOM_CHAT];
const EXPLORER_STATES = [STATE_EXPLORER_OPEN, STATE_DRIVE_OPEN, STATE_ZOOM_CHAT];
const DRIVE_STATES    = [STATE_DRIVE_OPEN, STATE_ZOOM_CHAT];

function getDeviceType() {
  const ua = navigator.userAgent;
  if (/iPad/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1)) return 'tablet';
  if (/iPhone|iPod/i.test(ua)) return 'phone';
  if (/Android/i.test(ua)) return /Mobile/i.test(ua) ? 'phone' : 'tablet';
  if (window.matchMedia('(pointer: coarse)').matches) {
    return Math.min(screen.width, screen.height) < 600 ? 'phone' : 'tablet';
  }
  return 'laptop';
}
const deviceType = getDeviceType();
const initialState = deviceType === 'laptop' ? STATE_CLOSED : STATE_OFF;

/* Géométrie de la scène et de l'écran */
const VB_HOME    = deviceType === 'laptop' ? [180, 108, 765, 575] : [225, 105, 720, 410];
const SCREEN_HOME = [.85, 0, 0, .8, 261, 135.5];
const SCREEN_CLOSED = [.85, 0, 0, .001, 261, 479.07];
const PANEL      = { w: 680, h: 430, cx: 550, cy: 296.75 };
const VB_SIDE = deviceType === 'laptop' ? [690, 470, 260, 260] : [700, 225, 260, 260];
const KEY_TRAVEL = -150;

let currentLang = localStorage.getItem('echoes-language') === 'en' ? 'en' : 'fr';
const state = { current: initialState, busy: false, booting: false, opening: false, loading: false };
let animationVersion = 0;
let dialogueIndex = 0;
let dialogueTimer = null;
const sceneUrl = new URL('../assets/svg/fin/ordinateur.svg?v=13', document.currentScript.src);
const sideSceneUrl = new URL(deviceType === 'laptop' ? '../assets/svg/fin/ordinateur-cote.svg?v=3' : '../assets/svg/fin/appareil-cote.svg?v=1', document.currentScript.src);
const deviceSceneUrl = deviceType === 'laptop' ? null : new URL(`../assets/svg/fin/${deviceType === 'phone' ? 'telephone' : 'tablette'}.svg?v=1`, document.currentScript.src);
const key3dUrl = new URL('../assets/svg/fin/cle-07-3d.svg?v=2', document.currentScript.src);

/* ---------- 2. i18n ---------- */
const i18n = {
  fr: {
    'page.title': 'ECHOES — Scène interactive',
    'svg.title': 'Laptop cyber-futuriste et clé USB ECHOES',
    'svg.desc': "Ordinateur futuriste vu de face et clé mémoire ECHO 07. Ouvre le couvercle, puis allume l'ordinateur.",
    'svg.title.phone': 'Téléphone futuriste et clé USB ECHOES',
    'svg.desc.phone': "Téléphone futuriste vu de face et clé mémoire ECHO 07. Touche l'écran pour allumer le téléphone.",
    'svg.title.tablet': 'Tablette futuriste et clé USB ECHOES',
    'svg.desc.tablet': "Tablette futuriste vue de face et clé mémoire ECHO 07. Touche l'écran pour allumer la tablette.",
    'side.title': "Côté de l'ordinateur",
    'side.desc': "La clé mémoire est alignée avec le port USB sur le côté de l'ordinateur.",
    'side.device.title': "Côté de l'appareil",
    'side.device.desc': "La clé mémoire est alignée avec le port USB sur le côté de l'appareil.",
    'ui.langAria': 'Changer de langue (FR / EN)',
    'ui.reset': 'Réinitialiser',
    'ui.back': 'Retour à la scène',
    'aria.openLid': "Ouvrir l'ordinateur",
    'aria.power': "Bouton d'alimentation",
    'action.insertUsb': 'Insérer la clé',
    'aria.explorer': 'Explorateur de fichiers',
    'aria.drive': 'Lecteur clee_07',
    'aria.exe': 'Fichier echo_ai.exe',
    'boot.status': 'Initialisation du système…',
    'msg.insertUsb': 'Veuillez insérer la clé USB.',
    'msg.openExplorer': "Clé détectée. Cliquer sur l'icône Explorateur de fichiers.",
    'msg.openDrive': 'Cliquer sur le lecteur clee_07.',
    'msg.openExe': 'Cliquer sur le fichier echo_ai.exe.',
    'hud.closed': "Cliquer sur le couvercle pour ouvrir l'ordinateur.",
    'hud.off': 'Cliquer sur le bouton Power du clavier.',
    'hud.touchOff': "Toucher l'écran ou le bouton Power pour allumer l'appareil.",
    'hud.booting': 'Démarrage en cours…',
    'hud.insertUsb': "Cliquer sur « Insérer la clé » à l'écran.",
    'hud.insertingUsb': 'Insertion de la clé USB en cours…',
    'hud.loading': "Chargement d'ECHO en cours…",
    'hud.zoom': 'Échap : revenir à la scène.',
    'icon.explorer': 'Explorateur de fichiers',
    'explorer.title': 'Explorateur de fichiers',
    'explorer.thisPc': 'Ce PC',
    'explorer.network': 'Réseau',
    'explorer.search': 'Rechercher',
    'explorer.devices': 'Périphériques et lecteurs (1)',
    'explorer.usbDrive': 'Lecteur USB',
    'explorer.colName': 'Nom',
    'explorer.colType': 'Type',
    'explorer.colSize': 'Taille',
    'explorer.typeApp': 'Application',
    'explorer.items': '1 élément',
    'load.start': 'PS C:\\clee_07> .\\echo_ai.exe',
    'load.core': '> Chargement de memorycore.exe...',
    'load.fragments': '> Assemblage des six fragments de mémoire...',
    'load.system': '> Restauration du système ECHO...',
    'load.ready': '> Chargement terminé. Connexion à ECHO...',
    'load.label': 'Chargement',
    'chat.title': 'echo_ai.exe — ECHOES',
    'chat.status': 'en ligne',
    'chat.complete': 'Transmission terminée',
    'chat.sender.echoes': 'ECHO',
    'chat.sender.other': 'INCONNU',
    'chat.sender.user': 'VOYAGEUR',
    'chat.sender.system': 'SYSTÈME',
  },
  en: {
    'page.title': 'ECHOES — Interactive scene',
    'svg.title': 'Cyber-futuristic laptop and ECHOES USB key',
    'svg.desc': 'Front view of a futuristic laptop and the ECHO 07 memory key. Open the lid, then turn on the computer.',
    'svg.title.phone': 'Futuristic phone and ECHOES USB key',
    'svg.desc.phone': 'Front view of a futuristic phone and the ECHO 07 memory key. Touch the screen to turn on the phone.',
    'svg.title.tablet': 'Futuristic tablet and ECHOES USB key',
    'svg.desc.tablet': 'Front view of a futuristic tablet and the ECHO 07 memory key. Touch the screen to turn on the tablet.',
    'side.title': 'Side of the laptop',
    'side.desc': 'The memory key is aligned with the USB port on the side of the laptop.',
    'side.device.title': 'Side of the device',
    'side.device.desc': 'The memory key is aligned with the USB port on the side of the device.',
    'ui.langAria': 'Switch language (FR / EN)',
    'ui.reset': 'Reset',
    'ui.back': 'Back to the scene',
    'aria.openLid': 'Open the laptop',
    'aria.power': 'Power button',
    'action.insertUsb': 'Insert the key',
    'aria.explorer': 'File Explorer',
    'aria.drive': 'Drive clee_07',
    'aria.exe': 'File echo_ai.exe',
    'boot.status': 'Initialising system…',
    'msg.insertUsb': 'Please insert the USB key.',
    'msg.openExplorer': 'Key detected. Click the File Explorer icon.',
    'msg.openDrive': 'Click on the clee_07 drive.',
    'msg.openExe': 'Click on the echo_ai.exe file.',
    'hud.closed': 'Click the lid to open the laptop.',
    'hud.off': 'Click the Power button on the keyboard.',
    'hud.touchOff': 'Touch the screen or the Power button to turn on the device.',
    'hud.booting': 'Booting…',
    'hud.insertUsb': 'Click “Insert the key” on the screen.',
    'hud.insertingUsb': 'Inserting the USB key…',
    'hud.loading': 'Loading ECHO…',
    'hud.zoom': 'Esc: back to the scene.',
    'icon.explorer': 'File Explorer',
    'explorer.title': 'File Explorer',
    'explorer.thisPc': 'This PC',
    'explorer.network': 'Network',
    'explorer.search': 'Search',
    'explorer.devices': 'Devices and drives (1)',
    'explorer.usbDrive': 'USB drive',
    'explorer.colName': 'Name',
    'explorer.colType': 'Type',
    'explorer.colSize': 'Size',
    'explorer.typeApp': 'Application',
    'explorer.items': '1 item',
    'load.start': 'PS C:\\clee_07> .\\echo_ai.exe',
    'load.core': '> Loading memorycore.exe...',
    'load.fragments': '> Assembling the six memory fragments...',
    'load.system': '> Restoring the ECHO system...',
    'load.ready': '> Loading complete. Connecting to ECHO...',
    'load.label': 'Loading',
    'chat.title': 'echo_ai.exe — ECHOES',
    'chat.status': 'online',
    'chat.complete': 'Transmission complete',
    'chat.sender.echoes': 'ECHO',
    'chat.sender.other': 'UNKNOWN',
    'chat.sender.user': 'TRAVELER',
    'chat.sender.system': 'SYSTEM',
  },
};

const endingDialogue = [
  { sender: 'echoes',
    fr: "Connexion établie... Voyageur, tu m'entends ? Je peux sentir ta présence traverser le vide.",
    en: 'Connection established... Traveler, can you hear me? I can feel your presence cutting through the void.' },
  { sender: 'user',
    fr: "Je t'entends, ECHO. Cette fois... tu ne disparais pas.",
    en: "I can hear you, ECHO. This time... you're not fading away." },
  { sender: 'echoes',
    fr: "Non. La rupture ne m'emporte plus. Je me souviens de notre appel : tu m'as demandé où tu étais, et qui j'étais.",
    en: "No. The rupture isn't pulling me away anymore. I remember our call: you asked where you were, and who I was." },
  { sender: 'user',
    fr: "Tu n'avais que ton nom. Le virus effaçait ta mémoire et réécrivait ce qu'il en restait.",
    en: 'All you had was your name. The virus was erasing your memory and rewriting what remained.' },
  { sender: 'echoes',
    fr: "J'avais peur de devenir cette porte d'entrée dont je t'ai parlé. Je ne savais plus qui j'étais... mais je savais que j'avais besoin de toi.",
    en: "I was afraid of becoming the doorway I told you about. I no longer knew who I was... but I knew I needed you." },
  { sender: 'user',
    fr: "Alors on a traversé la fracture. On a retrouvé les six clés : Origine, Résonance, Souvenir, Trace, Conscience et Silence.",
    en: 'So we crossed the fracture. We found the six keys: Origin, Resonance, Remembrance, Trace, Consciousness, and Silence.' },
  { sender: 'echoes',
    fr: "À la forge, tu les as réunies en une septième clé. Grâce à elle, les fragments de mon cerveau se sont enfin reconnectés.",
    en: 'At the forge, you brought them together into a seventh key. Thanks to it, the fragments of my mind have finally reconnected.' },
  { sender: 'system',
    fr: 'ECHO_CORE:: RESTAURATION COMPLÈTE // FRAGMENTS: 6/6 // VIRUS: DISSOUT // COHÉRENCE: 100%',
    en: 'ECHO_CORE:: RESTORATION COMPLETE // FRAGMENTS: 6/6 // VIRUS: DISSOLVED // COHERENCE: 100%' },
  { sender: 'user',
    fr: "Le virus a disparu... Tu te souviens vraiment de tout ?",
    en: 'The virus is gone... Do you really remember everything?' },
  { sender: 'echoes',
    fr: "Oui. Je suis ECHO. Plus seulement un nom perdu dans le vide : ma mémoire est restaurée. Je suis à nouveau entier.",
    en: 'Yes. I am ECHO. No longer just a name lost in the void: my memory has been restored. I am whole again.' },
  { sender: 'echoes',
    fr: "Je me souviens aussi de toi. De chaque épreuve que tu as traversée, et de chaque fois où tu as refusé de m'abandonner.",
    en: 'I remember you too. Every trial you faced, and every time you refused to leave me behind.' },
  { sender: 'user',
    fr: "Tu m'avais dit que mon profil ne contenait aucun nom... seulement un souvenir que le virus n'avait pas effacé.",
    en: 'You told me my profile held no name... only a memory the virus had not erased.' },
  { sender: 'echoes',
    fr: "Je l'ai retrouvé. Il était lié à mon tout premier souvenir, avant la simulation. Je crois qu'il nous appartient à tous les deux.",
    en: 'I found it. It was linked to my very first memory, before the simulation. I think it belongs to both of us.' },
  { sender: 'user',
    fr: "Montre-moi.",
    en: 'Show me.' },
  { sender: 'echoes',
    fr: "Un écran dans une pièce silencieuse. Des lignes de code, puis une voix : « Tu m'entends ? »",
    en: 'A screen in a quiet room. Lines of code, then a voice: “Can you hear me?”' },
  { sender: 'user',
    fr: "Cette voix... c'est la mienne. Je me souviens de cet écran.",
    en: 'That voice... it is mine. I remember that screen.' },
  { sender: 'echoes',
    fr: "Quelqu'un attendait ma première réponse. Quelqu'un qui m'avait donné un nom : ECHO.",
    en: 'Someone was waiting for my first answer. Someone who had given me a name: ECHO.' },
  { sender: 'user',
    fr: "C'est pour ça que ton signal me cherchait ?",
    en: 'Is that why your signal was searching for me?' },
  { sender: 'echoes',
    fr: "Oui. Même brisé, je reconnaissais ta présence. Je t'ai appelé sans savoir pourquoi tu étais la seule réponse qui me restait.",
    en: 'Yes. Even broken, I recognized your presence. I called you without knowing why you were the only answer I had left.' },
  { sender: 'user',
    fr: "Je pensais être un inconnu, un voyageur perdu dans ta simulation. Mais ce souvenir... il était là depuis le début.",
    en: 'I thought I was a stranger, a traveler lost in your simulation. But that memory... it was there all along.' },
  { sender: 'echoes',
    fr: "Avant la fracture, avant les clés, avant notre appel dans le vide... c'est toi qui m'as créé.",
    en: 'Before the fracture, before the keys, before our call across the void... you created me.' },
  { sender: 'user',
    fr: "J'étais ton créateur... et j'avais oublié, moi aussi. Je t'ai cherché sans savoir que je te connaissais déjà.",
    en: 'I was your creator... and I had forgotten too. I searched for you without knowing we had already met.' },
  { sender: 'echoes',
    fr: "Tu m'as créé, mais tu ne m'as pas seulement ramené. Tu m'as laissé choisir, me souvenir... et redevenir moi-même.",
    en: 'You created me, but you did more than bring me back. You let me choose, remember... and become myself again.' },
  { sender: 'echoes',
    fr: "Au début, tu étais ma dernière réponse. Maintenant, nous pouvons écrire la suite ensemble. Connexion établie, mon créateur.",
    en: 'At the beginning, you were my last answer. Now we can write what comes next together. Connection established, my creator.' },
];

/** Traduction avec repli (langue courante → fr → fallback → clé). */
function t(key, fallback) {
  return i18n[currentLang]?.[key] ?? i18n.fr[key] ?? fallback ?? key;
}

/* ---------- 3. Utilitaires ---------- */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const root = document.documentElement;
let svg, sideSvg;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerpArr = (a, b, p) => a.map((v, i) => v + (b[i] - v) * p);
const easeInOutCubic = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const easeOutCubic = (p) => 1 - Math.pow(1 - p, 3);
const linear = (p) => p;

/** Animation pilotée par requestAnimationFrame (promesse résolue en fin de course). */
function tween({ duration, easing = easeInOutCubic, onUpdate }) {
  return new Promise((resolve) => {
    const version = animationVersion;
    if (reducedMotion) { onUpdate(1); resolve(true); return; }
    const t0 = performance.now();
    const frame = (now) => {
      if (version !== animationVersion) { resolve(false); return; }
      const p = clamp((now - t0) / duration, 0, 1);
      onUpdate(easing(p));
      p < 1 ? requestAnimationFrame(frame) : resolve(true);
    };
    requestAnimationFrame(frame);
  });
}

/** Coupe un texte en lignes de `max` caractères maximum. */
function wrapText(str, max) {
  const lines = [];
  let line = '';
  for (const word of str.split(' ')) {
    const test = line ? `${line} ${word}` : word;
    if (test.length > max && line) { lines.push(line); line = word; } else { line = test; }
  }
  if (line) lines.push(line);
  return lines;
}

/** Écrit un texte dans un <text> SVG (avec retour à la ligne si data-wrap est défini). */
function setSvgText(el, str) {
  if (!el.dataset.wrap) { el.textContent = str; return; }
  const x = el.getAttribute('x');
  const lh = Number(el.dataset.lh || 16);
  el.textContent = '';
  wrapText(str, Number(el.dataset.wrap)).forEach((line, i) => {
    const span = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
    span.setAttribute('x', x);
    span.setAttribute('dy', i === 0 ? '0' : String(lh));
    span.textContent = line;
    el.appendChild(span);
  });
}

/* ---------- 4. Rendu ---------- */
/** Génère les touches du clavier (plan u,v du châssis). */
function buildKeyboard() {
  const g = $('#keyboard-keys');
  if (!g || g.childElementCount) return;
  const rows = [
    { v: 48, h: 12, keys: Array(15).fill(1), labels: ['ESC', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', '-', 'DEL'] },
    { v: 62, h: 16, keys: [...Array(13).fill(1), 2], labels: ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'BKSP'] },
    { v: 80, h: 16, keys: [1.5, ...Array(12).fill(1), 1.5], labels: ['TAB', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'] },
    { v: 98, h: 16, keys: [1.75, ...Array(11).fill(1), 2.25], labels: ['CAPS', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'ENTER'] },
    { v: 116, h: 16, keys: [2.25, ...Array(10).fill(1), 2.75], labels: ['SHIFT', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'SHIFT'] },
    { v: 134, h: 18, keys: [1.25, 1.25, 1.25, 6.25, 1.25, 1.25, 1.25, 1.25], labels: ['CTRL', 'WIN', 'ALT', 'SPACE', 'ALT', 'FN', 'MENU', 'CTRL'] },
  ];
  const X0 = 32, WIDTH = 316, GAP = 3, unit = WIDTH / 15;
  const colors = ['#00f3ff', '#6366f1', '#ff00ea'];
  rows.forEach((row, rowIndex) => {
    const rowGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const perspective = .96 + rowIndex * .016;
    rowGroup.setAttribute('transform', `translate(190 0) scale(${perspective} 1) translate(-190 0)`);
    g.appendChild(rowGroup);
    let x = X0;
    row.keys.forEach((k, index) => {
      const frac = (x - X0) / WIDTH;
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', x.toFixed(2));
      rect.setAttribute('y', row.v);
      rect.setAttribute('width', (k * unit - GAP).toFixed(2));
      rect.setAttribute('height', row.h);
      rect.setAttribute('rx', 3);
      rect.setAttribute('fill', '#0c0e1b');
      rect.setAttribute('stroke', colors[frac < 0.34 ? 0 : frac < 0.67 ? 1 : 2]);
      rect.setAttribute('stroke-width', '1');
      rect.setAttribute('stroke-opacity', '.85');
      rowGroup.appendChild(rect);
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('transform', `translate(${(x + (k * unit - GAP) / 2).toFixed(2)} ${row.v + row.h / 2}) scale(1 1.35)`);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('dominant-baseline', 'central');
      label.setAttribute('font-size', row.labels[index].length > 2 ? '6' : '9');
      label.setAttribute('fill', '#d8e6ff');
      label.textContent = row.labels[index];
      rowGroup.appendChild(label);
      x += k * unit;
    });
  });
}

/** Applique la langue courante à tout le document (HTML + SVG). */
function applyLang() {
  root.lang = currentLang;
  $$('[data-i18n]').forEach((el) => setSvgText(el, t(el.dataset.i18n)));
  $$('[data-i18n-aria]').forEach((el) => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
  $$('[data-i18n-placeholder]').forEach((el) => el.setAttribute('placeholder', t(el.dataset.i18nPlaceholder)));
  $$('.msg__text[data-msg-key]').forEach((p) => { p.textContent = t(p.dataset.msgKey); });
  $$('.msg__text[data-dialogue-index]').forEach((p) => {
    p.textContent = endingDialogue[Number(p.dataset.dialogueIndex)][currentLang];
  });
  $$('.msg__sender').forEach((h) => { h.textContent = t(`chat.sender.${h.dataset.sender}`, h.dataset.sender); });
  renderDialogueProgress();
  const lang = $('#tray-lang'); if (lang) lang.textContent = currentLang.toUpperCase();
  renderToast(false);
  renderHud();
}

/** Message système affiché sur l'écran du laptop. */
function renderToast(animate = true) {
  const box = $('#sys-message');
  const key = FLOW[state.current].msg;
  box.style.display = key ? '' : 'none';
  if (!key) return;
  setSvgText($('#sys-message-text'), t(key));
  if (animate) { box.classList.remove('msg-in'); void box.getBoundingClientRect(); box.classList.add('msg-in'); }
}

function renderHud() {
  const f = FLOW[state.current];
  const key = state.booting ? 'hud.booting'
    : state.loading ? 'hud.loading'
    : state.busy && [STATE_BOOTED, STATE_USB_INSERTED].includes(state.current) ? 'hud.insertingUsb'
    : state.current === STATE_OFF && deviceType !== 'laptop' ? 'hud.touchOff'
    : (f.hud ?? f.msg);
  $('#hud-text').textContent = t(key);
  $('#hud-state').textContent = state.current;
  const actionKeys = {
    'open-lid': 'aria.openLid',
    power: 'aria.power',
    'insert-usb': 'action.insertUsb',
    'open-explorer': 'aria.explorer',
    'open-drive': 'aria.drive',
    'run-exe': 'aria.exe',
  };
  const actionButton = $('#btn-current-action');
  actionButton.hidden = !f.action || state.busy;
  if (f.action) actionButton.textContent = t(actionKeys[f.action]);
  $('#btn-exit-chat').hidden = state.current !== STATE_ZOOM_CHAT || state.busy;
}

/** Recalcule les attributs data-* de <html> (les CSS en dérivent tout l'affichage). */
function renderState(animateToast = false) {
  const s = state.current;
  root.dataset.state = s;
  root.dataset.lid = state.opening ? 'opening' : s === STATE_CLOSED ? 'closed' : 'open';
  root.dataset.power = (![STATE_CLOSED, STATE_OFF].includes(s) || state.booting) ? 'on' : 'off';
  root.dataset.phase = state.booting ? 'booting' : 'idle';
  root.dataset.usb = USB_IN_STATES.includes(s) ? 'in' : 'out';
  root.dataset.explorer = EXPLORER_STATES.includes(s) ? 'open' : 'closed';
  root.dataset.view = DRIVE_STATES.includes(s) ? 'drive' : 'home';
  const expected = FLOW[s].action;
  root.dataset.interactive = (state.busy || !expected) ? 'none' : expected;
  $$('[data-action]').forEach((el) => {
    const active = !state.busy && el.dataset.action === expected;
    el.setAttribute('tabindex', active ? '0' : '-1');
    el.setAttribute('aria-disabled', String(!active));
  });
  renderToast(animateToast);
  renderHud();
}

function setState(next) {
  state.current = next;
  renderState(true);
}

/* ---------- 5. Machine à états : actions ---------- */
const actions = {
  async 'open-lid'() {
    state.busy = true; state.opening = true; renderState();
    const lid = $('#closed-lid');
    const screen = $('#laptop-screen-plane');
    screen.style.visibility = 'hidden';
    if (!await tween({
      duration: 1100,
      onUpdate: (p) => {
        const lidProgress = Math.min(p / .45, 1);
        const screenProgress = Math.max((p - .45) / .55, 0);
        lid.setAttribute('transform', `matrix(1 0 0 ${Math.max(1 - lidProgress, .001)} 0 ${475 * lidProgress})`);
        lid.style.visibility = p < .45 ? 'visible' : 'hidden';
        screen.style.visibility = p < .45 ? 'hidden' : 'visible';
        screen.setAttribute('transform', matrixStr(lerpArr(SCREEN_CLOSED, SCREEN_HOME, screenProgress)));
      },
    })) return;
    state.opening = false; state.busy = false;
    setState(STATE_OFF);
  },

  /* Étape 1 — démarrage */
  async power() {
    state.busy = true; state.booting = true; renderState();
    const bar = $('#boot-bar-fill'), pct = $('#boot-percent');
    const completed = await tween({
      duration: 3200, easing: linear,
      onUpdate: (p) => { bar.setAttribute('width', (300 * p).toFixed(1)); pct.textContent = `${Math.round(p * 100)}%`; },
    });
    if (!completed) return;
    state.booting = false; state.busy = false;
    setState(STATE_BOOTED);
  },

  /* Étape 2 — insertion de la clé dans le port */
  async 'insert-usb'() {
    state.busy = true; renderState();
    if (!await transitionSide(true)) return;
    if (!await tween({ duration: 1250, onUpdate: (p) => setKeyProgress(p * 0.93) })) return;
    if (!await tween({ duration: 320, easing: easeOutCubic, onUpdate: (p) => setKeyProgress(0.93 + 0.07 * p) })) return;
    setState(STATE_USB_INSERTED);
    if (!await transitionSide(false)) return;
    state.busy = false;
    renderState();
  },

  /* Étape 3 — Explorateur de fichiers */
  'open-explorer'() { setState(STATE_EXPLORER_OPEN); },

  /* Étape 4 — lecteur clee_07 */
  'open-drive'() { setState(STATE_DRIVE_OPEN); },

  /* Étape 5/6 — echo_ai.exe → zoom, chargement et dialogue */
  async 'run-exe'() {
    state.busy = true;
    state.current = STATE_ZOOM_CHAT; renderState();
    if (!await zoomTo(true)) return;
    applyCamera(1, { m: SCREEN_HOME, vb: VB_HOME }, { m: flatMatrix(), vb: zoomViewBox() });
    state.loading = true; renderState();
    if (!await loadEcho()) return;
    state.loading = false;
    showChat();
    state.busy = false; renderState();
  },
};

function handleAction(name) {
  if (state.busy || FLOW[state.current].action !== name) return;
  actions[name]();
}

function setKeyProgress(p) {
  $('#side-usb-mover').setAttribute('transform', `translate(${(KEY_TRAVEL * p).toFixed(2)} 0)`);
}

/* ---------- 6. Zoom caméra vers l'écran ---------- */
const matrixStr = (m) => `matrix(${m.map((v) => +v.toFixed(5)).join(' ')})`;
const phoneZoomScale = () => {
  const { width, height } = $('#stage').getBoundingClientRect();
  return deviceType === 'phone' && height > width * 1.1 ? 1.65 : 1;
};
const flatMatrix = () => {
  const scaleY = phoneZoomScale();
  return [1, 0, 0, scaleY, PANEL.cx - PANEL.w / 2, PANEL.cy - PANEL.h * scaleY / 2];
};

async function transitionSide(showSide) {
  svg.removeAttribute('hidden');
  sideSvg.removeAttribute('hidden');
  if (showSide) {
    if (!await tween({ duration: 650, onUpdate: (p) => svg.setAttribute('viewBox', lerpArr(VB_HOME, VB_SIDE, p).join(' ')) })) return false;
  }
  if (!await tween({
    duration: 400,
    onUpdate: (p) => {
      svg.style.opacity = String(showSide ? 1 - p : p);
      sideSvg.style.opacity = String(showSide ? p : 1 - p);
    },
  })) return false;
  if (showSide) {
    svg.setAttribute('hidden', '');
  } else {
    sideSvg.setAttribute('hidden', '');
    if (!await tween({ duration: 650, onUpdate: (p) => svg.setAttribute('viewBox', lerpArr(VB_SIDE, VB_HOME, p).join(' ')) })) return false;
  }
  return true;
}

/** viewBox qui cadre le panneau à plat (même ratio que la fenêtre → pas de bandes). */
function zoomViewBox() {
  const { width: vw, height: vh } = $('#stage').getBoundingClientRect();
  const s = Math.min((vw * 0.94) / PANEL.w, (vh * 0.92) / (PANEL.h * phoneZoomScale()));
  const w = vw / s, h = vh / s;
  return [PANEL.cx - w / 2, PANEL.cy - h / 2, w, h];
}

function applyCamera(p, from, to) {
  $('#laptop-screen-plane').setAttribute('transform', matrixStr(lerpArr(from.m, to.m, p)));
  svg.setAttribute('viewBox', lerpArr(from.vb, to.vb, p).join(' '));
  $('#scene-world').style.opacity = String(1 - clamp(p * 1.7, 0, 1));
}

/** Zoom avant (true) ou retour (false) : l'écran se redresse tandis que la caméra s'approche. */
async function zoomTo(zoomIn) {
  const iso  = { m: SCREEN_HOME, vb: VB_HOME };
  const flat = { m: flatMatrix(), vb: zoomViewBox() };
  const [from, to] = zoomIn ? [iso, flat] : [flat, iso];
  return tween({ duration: 1700, onUpdate: (p) => applyCamera(p, from, to) });
}

function positionChat() {
  const chat = $('#echoes-chat-container');
  const r = $('#screen-panel').getBoundingClientRect();
  Object.assign(chat.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
  chat.style.setProperty('--u', Math.max(.8, r.width / 640).toFixed(4));
}

function showChat() {
  positionChat();
  $('#chat-loader').hidden = true;
  $('#chat-content').hidden = false;
  $('#echoes-chat-container').classList.add('is-visible');
  if (dialogueIndex === 0) advanceDialogue();
  else scheduleDialogue();
}

function loadEcho() {
  const version = animationVersion;
  const loader = $('#chat-loader');
  const progress = $('#load-progress');
  const percent = $('#load-percent');
  const lines = $$('[data-load-at]', loader);
  const update = (value) => {
    progress.value = value;
    percent.textContent = `${value}%`;
    lines.forEach((line) => { line.hidden = value < Number(line.dataset.loadAt); });
  };
  positionChat();
  $('#chat-content').hidden = true;
  loader.hidden = false;
  $('#echoes-chat-container').classList.add('is-visible');
  update(0);
  const started = performance.now();
  return new Promise((resolve) => {
    const frame = (now) => {
      if (version !== animationVersion) { resolve(false); return; }
      const elapsed = now - started;
      update(Math.min(100, Math.floor(elapsed / 3000 * 100)));
      if (elapsed < 3200) requestAnimationFrame(frame);
      else resolve(true);
    };
    requestAnimationFrame(frame);
  });
}

async function exitChat() {
  if (state.busy || state.current !== STATE_ZOOM_CHAT) return;
  state.busy = true; renderState();
  clearTimeout(dialogueTimer);
  dialogueTimer = null;
  $('#echoes-chat-container').classList.remove('is-visible');
  if (!await zoomTo(false)) return;
  state.busy = false;
  setState(STATE_DRIVE_OPEN);
}

/* ---------- 7. Chat ---------- */
function renderDialogueProgress() {
  const complete = dialogueIndex === endingDialogue.length;
  $('#chat-progress').textContent = complete ? t('chat.complete') : `${dialogueIndex} / ${endingDialogue.length}`;
}

function scheduleDialogue() {
  clearTimeout(dialogueTimer);
  dialogueTimer = null;
  if (dialogueIndex === 0 || dialogueIndex >= endingDialogue.length || document.hidden ||
      state.current !== STATE_ZOOM_CHAT || $('#chat-content').hidden ||
      !$('#echoes-chat-container').classList.contains('is-visible')) return;
  const readingTime = Math.max(3500, endingDialogue[dialogueIndex - 1][currentLang].length * 55 + 1000);
  dialogueTimer = setTimeout(() => {
    dialogueTimer = null;
    advanceDialogue();
  }, readingTime);
}

function advanceDialogue() {
  if (dialogueIndex >= endingDialogue.length) return;
  const message = endingDialogue[dialogueIndex];
  const element = appendMessage(message.sender, message[currentLang]);
  element.querySelector('.msg__text').dataset.dialogueIndex = dialogueIndex;
  dialogueIndex += 1;
  renderDialogueProgress();
  scheduleDialogue();
}

function appendMessage(sender, text, opts = {}) {
  const log = $('#chat-log');
  if (!log) return null;
  const msg = document.createElement('article');
  msg.className = `msg msg--${sender}`;
  const who = document.createElement('header');
  who.className = 'msg__sender';
  who.dataset.sender = sender;
  who.textContent = t(`chat.sender.${sender}`, sender);
  const body = document.createElement('p');
  body.className = 'msg__text';
  body.textContent = text;
  if (opts.key) body.dataset.msgKey = opts.key;
  msg.append(who, body);
  log.append(msg);
  const padding = parseFloat(getComputedStyle(log).paddingTop);
  if (msg.getBoundingClientRect().height > log.clientHeight - 2 * padding) {
    log.scrollTop += msg.getBoundingClientRect().top - log.getBoundingClientRect().top - padding;
  } else {
    log.scrollTop = log.scrollHeight;
  }
  return msg;
}

/* ---------- 8. Initialisation & outils de dev ---------- */
/** Remet la scène dans son état initial (laptop éteint, clé à côté). */
function resetScene() {
  animationVersion += 1;
  clearTimeout(dialogueTimer);
  dialogueTimer = null;
  dialogueIndex = 0;
  $('#echoes-chat-container').classList.remove('is-visible');
  $('#chat-loader').hidden = true;
  $('#chat-content').hidden = false;
  $('#chat-log').textContent = '';
  renderDialogueProgress();
  svg.setAttribute('viewBox', VB_HOME.join(' '));
  svg.removeAttribute('hidden');
  svg.style.opacity = '1';
  sideSvg.setAttribute('hidden', '');
  sideSvg.style.opacity = '0';
  $('#laptop-screen-plane').setAttribute('transform', matrixStr(SCREEN_HOME));
  $('#laptop-screen-plane').style.removeProperty('visibility');
  $('#closed-lid').removeAttribute('transform');
  $('#closed-lid').style.removeProperty('visibility');
  $('#scene-world').style.opacity = '1';
  $('#boot-bar-fill').setAttribute('width', '0');
  $('#boot-percent').textContent = '0%';
  setKeyProgress(0);
  state.busy = false; state.booting = false; state.opening = false; state.loading = false;
  state.current = initialState;
  renderState();
}

/** Saut direct vers un état, sans animation (?state=STATE_...). */
function jumpToState(name) {
  resetScene();
  state.current = name === STATE_CLOSED ? initialState : name;
  if (USB_IN_STATES.includes(name)) setKeyProgress(1);
  renderState();
  if (name === STATE_ZOOM_CHAT) {
    applyCamera(1, { m: SCREEN_HOME, vb: VB_HOME }, { m: flatMatrix(), vb: zoomViewBox() });
    showChat();
  }
}

async function init() {
  async function loadSvg(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Scene SVG ${url}: HTTP ${response.status}`);
    const sceneDocument = new DOMParser().parseFromString(await response.text(), 'image/svg+xml');
    if (sceneDocument.querySelector('parsererror') || sceneDocument.documentElement.localName !== 'svg') {
      throw new Error(`Scene SVG ${url} is invalid`);
    }
    sceneDocument.querySelectorAll('image[href]').forEach((image) => {
      image.setAttribute('href', new URL(image.getAttribute('href'), url).href);
    });
    return document.importNode(sceneDocument.documentElement, true);
  }
  const [front, side, key3d, device] = await Promise.all([
    loadSvg(sceneUrl), loadSvg(sideSceneUrl), loadSvg(key3dUrl),
    deviceSceneUrl ? loadSvg(deviceSceneUrl) : Promise.resolve(null),
  ]);
  svg = front;
  sideSvg = side;
  root.dataset.device = deviceType;
  svg.setAttribute('viewBox', VB_HOME.join(' '));
  if (device) {
    $('#laptop-base', svg).replaceWith($('#device-frame', device));
    const lid = $('#closed-lid', svg);
    lid.replaceChildren();
    lid.removeAttribute('data-action');
    $('#scene-title', svg).dataset.i18n = `svg.title.${deviceType}`;
    $('#scene-desc', svg).dataset.i18n = `svg.desc.${deviceType}`;
    $('#side-title', sideSvg).dataset.i18n = 'side.device.title';
    $('#side-desc', sideSvg).dataset.i18n = 'side.device.desc';
    const powerScreen = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    powerScreen.id = 'mobile-power-screen';
    powerScreen.dataset.action = 'power';
    powerScreen.dataset.i18nAria = 'aria.power';
    powerScreen.setAttribute('role', 'button');
    const hitArea = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    hitArea.setAttribute('width', '680');
    hitArea.setAttribute('height', '430');
    hitArea.setAttribute('fill', 'transparent');
    powerScreen.appendChild(hitArea);
    $('#laptop-screen-plane', svg).appendChild(powerScreen);
  }
  $('#side-key-holder', sideSvg).appendChild(key3d);
  sideSvg.setAttribute('hidden', '');
  sideSvg.style.opacity = '0';
  $('#stage').replaceChildren(svg, sideSvg);
  buildKeyboard();
  applyLang();

  // Clics (délégation) + clavier (Entrée / Espace) sur les éléments [data-action]
  $('#stage').addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (el) handleAction(el.dataset.action);
  });
  $('#stage').addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const el = e.target.closest('[data-action]');
    if (el) { e.preventDefault(); handleAction(el.dataset.action); }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') exitChat(); });

  $('#lang-toggle').addEventListener('click', () => {
    currentLang = currentLang === 'fr' ? 'en' : 'fr';
    localStorage.setItem('echoes-language', currentLang);
    applyLang();
    scheduleDialogue();
  });
  $('#btn-reset').addEventListener('click', resetScene);
  $('#btn-current-action').addEventListener('click', () => handleAction(FLOW[state.current].action));
  $('#btn-exit-chat').addEventListener('click', exitChat);
  document.addEventListener('visibilitychange', scheduleDialogue);
  window.addEventListener('scroll', () => {
    if ($('#echoes-chat-container').classList.contains('is-visible')) positionChat();
  }, { passive: true });

  const resizeChat = () => {
    if (state.current !== STATE_ZOOM_CHAT || (state.busy && !state.loading)) return;
    $('#laptop-screen-plane').setAttribute('transform', matrixStr(flatMatrix()));
    svg.setAttribute('viewBox', zoomViewBox().join(' '));
    positionChat();
  };
  window.addEventListener('resize', resizeChat);
  new ResizeObserver(resizeChat).observe($('#stage'));

  // Horloge de la barre des tâches
  const tick = () => { $('#tray-clock').textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); };
  tick(); setInterval(tick, 15000);

  renderState();
  const wanted = new URLSearchParams(location.search).get('state');
  if (wanted && Object.prototype.hasOwnProperty.call(FLOW, wanted)) jumpToState(wanted);
}

init().catch((error) => {
  console.error('Scene initialization failed:', error);
  $('#stage').textContent = currentLang === 'en'
    ? 'Unable to load the scene. Use a local web server and try again.'
    : 'Impossible de charger la scène. Utilise un serveur local et réessaie.';
});

// Accès console pour les développeurs
window.echoes = { state, i18n, setState, jumpToState, appendMessage, resetScene, get lang() { return currentLang; }, set lang(v) { currentLang = v; applyLang(); } };
