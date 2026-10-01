const spectrumCanvas = document.getElementById("spectrumCanvas");
const isDesktopDevice =
  /Windows|Macintosh|Linux/.test(navigator.userAgent) &&
  !/Android|iPhone|iPad|Mobile/.test(navigator.userAgent);
document.body.classList.toggle("desktop-layout", isDesktopDevice);
const spectrumContext = spectrumCanvas.getContext("2d");
const dialogueShell = document.getElementById("dialogueShell");
const dialogueText = document.getElementById("dialogueText");
const dialogueHint = document.getElementById("dialogueHint");
const missionButton = document.getElementById("missionButton");
const saveGameButton = document.getElementById("saveGameButton");
const translations = window.translations;
const translatableElements = document.querySelectorAll("[data-i18n]");

if (localStorage.getItem("echoes-reduced-effects") === "true") {
  document.body.classList.add("reduced-effects");
}

let hasStarted = false;
let currentLanguage = localStorage.getItem("echoes-language") || "fr";
let dialogueMessages = [];
let spectrumActivity = 0;
let targetSpectrumActivity = 0;
let dialogueScrollFrame = 0;
let spectrumGlitch = 0;
let targetSpectrumGlitch = 0;

let spectrumSize = 0;
const spectrumParticles = Array.from({ length: 130 }, (_, particleIndex) => ({
  angle: (particleIndex / 130) * Math.PI * 2,
  radius: 0.54 + Math.random() * 0.42,
  phase: Math.random() * Math.PI * 2,
  speed: 0.5 + Math.random() * 1.4,
  size: 0.7 + Math.random() * 2.5,
  hue: particleIndex % 3 === 0 ? 190 : particleIndex % 3 === 1 ? 205 : 275,
}));

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

function resizeSpectrum() {
  const pixelRatio = window.devicePixelRatio || 1;
  const bounds = spectrumCanvas.getBoundingClientRect();
  spectrumSize = Math.min(bounds.width, bounds.height);
  spectrumCanvas.width = spectrumSize * pixelRatio;
  spectrumCanvas.height = spectrumSize * pixelRatio;
  spectrumContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
}

function drawSpectrum(timestamp) {
  const center = spectrumSize / 2;
  const innerRadius = spectrumSize * 0.24;
  const time = timestamp * 0.001;
  spectrumActivity += (targetSpectrumActivity - spectrumActivity) * 0.08;
  spectrumGlitch += (targetSpectrumGlitch - spectrumGlitch) * 0.1;

  spectrumContext.clearRect(0, 0, spectrumSize, spectrumSize);
  spectrumContext.save();
  spectrumContext.translate(center, center);

  spectrumContext.beginPath();
  spectrumContext.arc(0, 0, innerRadius * 1.08, 0, Math.PI * 2);
  spectrumContext.fillStyle =
    spectrumGlitch > 0.2 ? "rgba(20, 2, 8, 0.94)" : "rgba(2, 8, 18, 0.92)";
  spectrumContext.shadowColor =
    spectrumGlitch > 0.2
      ? "rgba(255, 45, 83, 0.8)"
      : "rgba(121, 247, 255, 0.5)";
  spectrumContext.shadowBlur = 22;
  spectrumContext.fill();
  spectrumContext.shadowBlur = 0;

  for (let barIndex = 0; barIndex < 96; barIndex += 1) {
    const angle = (barIndex / 96) * Math.PI * 2 - Math.PI / 2;
    const wave = Math.abs(
      Math.sin(time * (1.2 + (barIndex % 5) * 0.08) + barIndex * 0.48),
    );
    const height =
      spectrumSize * (0.012 + spectrumActivity * (0.045 + wave * 0.13));
    const startRadius = innerRadius * 1.18;
    const endRadius = startRadius + height;
    const hue =
      spectrumGlitch > 0.2
        ? 350 + Math.sin(barIndex * 0.8) * 18
        : 185 + Math.sin(barIndex * 0.18) * 38;
    const glitchShift =
      spectrumGlitch *
      Math.sin(time * 32 + barIndex * 2.4) *
      spectrumSize *
      0.025;

    spectrumContext.beginPath();
    spectrumContext.moveTo(
      Math.cos(angle) * startRadius + glitchShift,
      Math.sin(angle) * startRadius,
    );
    spectrumContext.lineTo(
      Math.cos(angle) * endRadius - glitchShift,
      Math.sin(angle) * endRadius + glitchShift,
    );
    spectrumContext.strokeStyle = `hsla(${hue}, 100%, 72%, ${0.04 + spectrumActivity * (0.45 + wave * 0.5)})`;
    spectrumContext.lineWidth = 0.5 + spectrumActivity * (1.5 + wave * 2.2);
    spectrumContext.shadowColor = `hsla(${hue}, 100%, 66%, 0.8)`;
    spectrumContext.shadowBlur = 8;
    spectrumContext.stroke();
  }

  spectrumParticles.forEach((particle) => {
    const pulse = Math.sin(time * particle.speed + particle.phase);
    const radius =
      spectrumSize * (particle.radius + pulse * 0.025 * spectrumActivity);
    const particleGlitch =
      spectrumGlitch *
      Math.sin(time * 28 + particle.phase) *
      spectrumSize *
      0.04;
    const x = Math.cos(particle.angle + time * 0.04) * radius + particleGlitch;
    const y = Math.sin(particle.angle + time * 0.04) * radius - particleGlitch;

    spectrumContext.beginPath();
    spectrumContext.arc(
      x,
      y,
      particle.size + Math.max(pulse, 0) * 1.3 * spectrumActivity,
      0,
      Math.PI * 2,
    );
    const particleHue = spectrumGlitch > 0.2 ? 350 : particle.hue;
    spectrumContext.fillStyle = `hsla(${particleHue}, 100%, 72%, ${spectrumActivity * (0.35 + (pulse + 1) * 0.28)})`;
    spectrumContext.shadowColor = `hsla(${particle.hue}, 100%, 68%, 0.9)`;
    spectrumContext.shadowBlur = 8;
    spectrumContext.fill();
  });

  if (spectrumGlitch > 0.2) {
    spectrumContext.strokeStyle = `rgba(255, 45, 83, ${spectrumGlitch * 0.85})`;
    spectrumContext.lineWidth = 1.2;
    for (let fractureIndex = 0; fractureIndex < 7; fractureIndex += 1) {
      const fractureAngle =
        fractureIndex * 0.9 + Math.sin(time * 7 + fractureIndex) * 0.08;
      const fractureLength = innerRadius * (0.8 + (fractureIndex % 3) * 0.25);
      spectrumContext.beginPath();
      spectrumContext.moveTo(
        Math.cos(fractureAngle) * innerRadius * 0.1,
        Math.sin(fractureAngle) * innerRadius * 0.1,
      );
      spectrumContext.lineTo(
        Math.cos(fractureAngle) * fractureLength,
        Math.sin(fractureAngle) * fractureLength,
      );
      spectrumContext.stroke();
    }

    for (let glitchBarIndex = 0; glitchBarIndex < 5; glitchBarIndex += 1) {
      const glitchWave = Math.sin(time * 24 + glitchBarIndex * 2.7);
      const glitchY = (glitchWave * 0.42 + 0.5) * spectrumSize - center;
      const glitchWidth = spectrumSize * (0.16 + Math.abs(glitchWave) * 0.28);
      spectrumContext.fillStyle = `rgba(255, 45, 83, ${spectrumGlitch * 0.28})`;
      spectrumContext.fillRect(
        -glitchWidth / 2 + glitchWave * spectrumSize * 0.14,
        glitchY,
        glitchWidth,
        1 + Math.abs(glitchWave) * 2,
      );
    }
  }

  spectrumContext.restore();
  window.requestAnimationFrame(drawSpectrum);
}

function setSpectrumActivity(isEchoSpeaking, isGlitching = false) {
  targetSpectrumActivity = isEchoSpeaking ? 1 : 0;
  targetSpectrumGlitch = isGlitching ? 1 : 0;
}

function keepDialogueInView() {
  if (dialogueScrollFrame) return;
  dialogueScrollFrame = window.requestAnimationFrame(() => {
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
  keepDialogueInView();

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
  window.EchoesSave.saveProgress({ currentPage: "level-1", currentLevel: 1 });
  window.setTimeout(() => {
    window.location.href = "partie-1_niveau-1_à_15/niveau-01.html";
  }, 650);
});

saveGameButton.addEventListener("click", () => {
  window.EchoesSave.saveProgress({
    currentPage: "introduction",
    currentLevel: 0,
  });
  saveGameButton.textContent =
    currentLanguage === "en" ? "Saved" : "Sauvegardé";
});

window.addEventListener("resize", resizeSpectrum);
applyLanguage(currentLanguage);
resizeSpectrum();
window.requestAnimationFrame(drawSpectrum);
