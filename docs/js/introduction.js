// INTRODUCTION // ECHO dialogue flow, language, and mission start.
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
const isDesktopDevice =
  /Windows|Macintosh|Linux/.test(navigator.userAgent) &&
  !/Android|iPhone|iPad|Mobile/.test(navigator.userAgent);
document.body.classList.toggle("desktop-layout", isDesktopDevice);
const dialogueShell = document.getElementById("dialogueShell");
const dialogueText = document.getElementById("dialogueText");
const dialogueHint = document.getElementById("dialogueHint");
const missionButton = document.getElementById("missionButton");

const translations = window.translations;
const translatableElements = document.querySelectorAll("[data-i18n]");

if (localStorage.getItem("echoes-reduced-effects") === "true") {
  document.body.classList.add("reduced-effects");
}

let hasStarted = false;
let currentLanguage = localStorage.getItem("echoes-language") || "fr";
let dialogueMessages = [];
let dialogueScrollFrame = 0;

// Applies translated interface labels and selects the dialogue collection.
function applyLanguage(language) {
  currentLanguage = translations[language] ? language : "fr";
  const dictionary = translations[currentLanguage];

  translatableElements.forEach((element) => {
    const key = element.dataset.i18n;
    if (dictionary[key]) element.textContent = dictionary[key];
  });

  dialogueMessages = dictionary.introMessages;
  document.documentElement.lang = currentLanguage;
  localStorage.setItem("echoes-language", currentLanguage);
}

// Anime le spectre audio quand ECHO parle ou glitche.
function setSpectrumActivity(isEchoSpeaking, isGlitching = false) {
  window.EchoAI.setState(isEchoSpeaking, isGlitching);
}

// Fait défiler le dialogue pour garder la dernière ligne visible.
function keepDialogueInView() {
  if (dialogueScrollFrame) return;
  dialogueScrollFrame = window.requestAnimationFrame(() => {
    dialogueText.scrollTop = dialogueText.scrollHeight;
    const activeLine = dialogueText.lastElementChild;
    if (activeLine) {
      const bottomSpace = 140;
      const lineBottom =
        activeLine.getBoundingClientRect().bottom + window.scrollY;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const targetScroll = Math.min(
        maxScroll,
        Math.max(0, lineBottom - window.innerHeight + bottomSpace),
      );
      window.scrollTo({ top: targetScroll, behavior: "auto" });
    }
    dialogueScrollFrame = 0;
  });
}

// Types dialogue text progressively and advances the introduction sequence.
function typeMessage(messageIndex = 0) {
  if (messageIndex >= dialogueMessages.length) {
    dialogueHint.textContent = translations[currentLanguage].introActive;
    dialogueShell.classList.add("is-fading-out");
    setSpectrumActivity(
      false,
      document.body.classList.contains("simulation-failure"),
    );
    window.setTimeout(() => {
      missionButton.hidden = false;
      missionButton.classList.add("mission-ready");
    }, 700);
    return;
  }

  const message = dialogueMessages[messageIndex];
  const line = document.createElement("p");
  const speaker = document.createElement("strong");
  const text = document.createElement("span");
  let characterIndex = 0;

  line.className = "dialogue-line";
  if (message.alarm) {
    line.classList.add("alarm-line");
  }
  if (message.className.includes("system")) {
    line.classList.add("system-line");
  }
  if (message.glitch) {
    line.classList.add("glitch-line");
    dialogueShell.classList.add("is-glitching");
  }
  if (message.failure) {
    document.body.classList.add("simulation-failure");
    line.classList.add("error-code-line");
  }
  speaker.className = `speaker ${message.className}`;
  speaker.textContent = `${message.speaker} `;
  text.className = "dialogue-line-text";
  setSpectrumActivity(
    message.className.includes("echo"),
    message.failure === true ||
      (document.body.classList.contains("simulation-failure") &&
        message.className.includes("echo")),
  );
  line.append(speaker, text);
  dialogueText.appendChild(line);
  if (characterIndex % 3 === 0 || characterIndex === message.text.length) {
    keepDialogueInView();
  }

  // Écrit le texte du dialogue lettre par lettre.
  function typeCharacter() {
    text.textContent += message.text[characterIndex];
    characterIndex += 1;
    keepDialogueInView();

    if (characterIndex < message.text.length) {
      const character = message.text[characterIndex - 1];
      const isEchoError = message.failure === true;
      const baseDelay = isEchoError
        ? window.innerWidth <= 700
          ? 30
          : 22
        : window.innerWidth <= 700
          ? 92
          : 28;
      const punctuationDelay = ".!?".includes(character)
        ? isEchoError
          ? window.innerWidth <= 700
            ? 90
            : 65
          : window.innerWidth <= 700
            ? 420
            : 120
        : character === ","
          ? isEchoError
            ? window.innerWidth <= 700
              ? 45
              : 35
            : window.innerWidth <= 700
              ? 190
              : 55
          : 0;
      const delay = baseDelay + punctuationDelay;
      window.setTimeout(typeCharacter, delay);
    } else {
      const delay = message.failure
        ? window.innerWidth <= 700
          ? 360
          : 280
        : window.innerWidth <= 700
          ? 1350
          : 420;
      window.setTimeout(() => typeMessage(messageIndex + 1), delay);
    }
  }

  typeCharacter();
}

// Lance la transmission d'introduction.
function startTransmission() {
  if (hasStarted) return;

  hasStarted = true;
  dialogueShell.classList.remove("is-fading-out");
  dialogueText.textContent = "";
  dialogueShell.classList.add("is-active");
  dialogueHint.textContent = translations[currentLanguage].introStarting;
  typeMessage();
}

dialogueShell.addEventListener("click", startTransmission);
dialogueShell.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    startTransmission();
  }
});

missionButton.addEventListener("click", () => {
  missionButton.classList.add("mission-launched");
  missionButton.querySelector("[data-i18n]").textContent =
    translations[currentLanguage].introMissionStarted;
  missionButton.disabled = true;
  const done = window.EchoesSave.getSave()?.completedBosses || [];
  window.EchoesSave.saveProgress({
    currentPage: "level-1",
    currentLevel: 1,
    completedBosses: [...new Set([...done, "intro"])],
  });
  window.setTimeout(() => {
    window.location.href = "partie-1_niveau-1_à_10/niveau-01.html";
  }, 650);
});

applyLanguage(currentLanguage);
window.EchoAI.init(document.getElementById("echoAiCanvas"));
