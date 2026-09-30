const canvas = document.getElementById("background");
const ctx = canvas.getContext("2d");

let width = 0;
let height = 0;
let particles = [];

const translations = window.translations || {
  fr: {
    systemLabel: "SYSTÈME",
    systemStatus: "EN LIGNE",
    dimensionLabel: "DIMENSION",
    dimensionStatus: "RUPTURE",
    eyebrow: "INTELLIGENCE CONSCIENTE FRAGMENTÉE",
    subtitle: "Fragments de la réalité",
    description:
      "Le monde a été brisé. Les dimensions se fracturent. La mémoire du temps est perdue. La seule voix qui reste est celle d’ECHO.",
    startButton: "Entrer dans la rupture",
    loadingButton: "Connexion au signal...",
    loadedButton: "Signal établi",
    metaAct: "ACTE I",
    metaAwakening: "RÉVEIL",
    metaStabilization: "STABILISATION",
    footerYear: "© 2026 Xavier Martineau",
    footerRights: "Tous droits réservés.",
    consoleText: "ÉCHO // VÉRIFICATION DE LA RÉALITÉ",
  },
  en: {
    systemLabel: "SYSTEM",
    systemStatus: "ONLINE",
    dimensionLabel: "DIMENSION",
    dimensionStatus: "RUPTURE",
    eyebrow: "FRAGMENTED SENTIENT INTELLIGENCE",
    subtitle: "Fragments of reality",
    description:
      "The world has been shattered. Dimensions are breaking apart. The memory of time is lost. The only voice left is ECHO.",
    startButton: "Enter the rupture",
    loadingButton: "Connecting signal...",
    loadedButton: "Signal established",
    metaAct: "ACT I",
    metaAwakening: "AWAKENING",
    metaStabilization: "STABILIZATION",
    footerYear: "© 2026 Xavier Martineau",
    footerRights: "All rights reserved.",
    consoleText: "ECHO // REALITY VERIFICATION",
  },
};

function resizeCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * window.devicePixelRatio;
  canvas.height = height * window.devicePixelRatio;
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
  ctx.setTransform(
    window.devicePixelRatio,
    0,
    0,
    window.devicePixelRatio,
    0,
    0,
  );

  particles = Array.from({ length: 120 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 2.2 + 0.8,
    alpha: Math.random() * 0.8 + 0.2,
    speed: Math.random() * 0.7 + 0.15,
  }));
}

function drawBackground() {
  ctx.clearRect(0, 0, width, height);

  particles.forEach((particle) => {
    particle.y += particle.speed;
    if (particle.y > height + 10) {
      particle.y = -10;
      particle.x = Math.random() * width;
    }

    ctx.beginPath();
    ctx.fillStyle = `rgba(115, 243, 255, ${particle.alpha})`;
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.strokeStyle = "rgba(176, 96, 255, 0.18)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    const y = (height / 8) * i + 40;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y + Math.sin(i) * 20);
    ctx.stroke();
  }

  requestAnimationFrame(drawBackground);
}

const startButton = document.getElementById("startButton");
const reducedEffectsButton = document.getElementById("reducedEffectsButton");
const languageButtons = document.querySelectorAll(".lang-btn");
const translatableElements = document.querySelectorAll("[data-i18n]");

let currentLang = localStorage.getItem("echoes-language") || "fr";
let reducedEffects = localStorage.getItem("echoes-reduced-effects") === "true";

function updateReducedEffects() {
  document.body.classList.toggle("reduced-effects", reducedEffects);
  reducedEffectsButton.textContent =
    translations[currentLang][
      reducedEffects ? "effectsReduced" : "reduceStrobe"
    ];
  reducedEffectsButton.setAttribute("aria-pressed", String(reducedEffects));
}

function updateStartButton() {
  const labelKey =
    startButton.dataset.loading === "true" ? "loadingButton" : "startButton";
  startButton.textContent = translations[currentLang][labelKey];
}

function applyLanguage(lang) {
  currentLang = translations[lang] ? lang : "fr";
  const dictionary = translations[currentLang];

  translatableElements.forEach((element) => {
    const key = element.dataset.i18n;
    if (dictionary[key]) {
      element.textContent = dictionary[key];
    }
  });

  languageButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.lang === currentLang);
  });

  document.documentElement.lang = currentLang;
  localStorage.setItem("echoes-language", currentLang);
  updateStartButton();
  updateReducedEffects();
}

startButton.addEventListener("click", () => {
  startButton.dataset.loading = "true";
  updateStartButton();
  startButton.disabled = true;

  setTimeout(() => {
    startButton.dataset.loading = "false";
    updateStartButton();
    startButton.disabled = false;
    window.location.href = "docs/html/introduction.html";
  }, 1200);
});

languageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    applyLanguage(button.dataset.lang);
  });
});

reducedEffectsButton.addEventListener("click", () => {
  reducedEffects = !reducedEffects;
  localStorage.setItem("echoes-reduced-effects", String(reducedEffects));
  updateReducedEffects();
});

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
drawBackground();
applyLanguage(currentLang);
