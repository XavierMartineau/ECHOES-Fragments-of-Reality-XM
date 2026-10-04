(() => {
  const script = document.currentScript;
  const stylesheet = new URL("../css/ambient-audio.css", script.src);
  if (!document.querySelector(`link[href="${stylesheet.href}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = stylesheet.href;
    document.head.appendChild(link);
  }

  const storageKey = "echoes-ambient-audio";
  const isEnabled = localStorage.getItem(storageKey) === "on";
  let audioContext;
  let masterGain;
  let voices = [];
  let enabled = isEnabled;

  const control = document.createElement("button");
  control.className = "echo-audio-control";
  control.type = "button";
  control.setAttribute("aria-pressed", String(enabled));
  control.setAttribute("aria-label", enabled ? "Désactiver l'ambiance" : "Activer l'ambiance");
  control.innerHTML = '<span class="echo-audio-icon" aria-hidden="true">◉</span><span class="echo-audio-label"></span>';
  document.body.appendChild(control);
  const label = control.querySelector(".echo-audio-label");

  function updateControl() {
    label.textContent = enabled ? "SON ON" : "SON OFF";
    control.setAttribute("aria-pressed", String(enabled));
    control.setAttribute("aria-label", enabled ? "Désactiver l'ambiance" : "Activer l'ambiance");
  }

  function createVoice(frequency, type, volume, detune = 0) {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    oscillator.detune.value = detune;
    filter.type = "lowpass";
    filter.frequency.value = 900;
    filter.Q.value = 0.7;
    gain.gain.value = volume;
    oscillator.connect(filter).connect(gain).connect(masterGain);
    oscillator.start();
    voices.push({ oscillator, gain });
  }

  function startAudio() {
    if (audioContext) {
      audioContext.resume();
      masterGain.gain.setTargetAtTime(0.12, audioContext.currentTime, 0.35);
      return;
    }
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      enabled = false;
      updateControl();
      return;
    }
    audioContext = new AudioContext();
    masterGain = audioContext.createGain();
    const compressor = audioContext.createDynamicsCompressor();
    compressor.threshold.value = -20;
    compressor.knee.value = 18;
    compressor.ratio.value = 8;
    compressor.attack.value = 0.02;
    compressor.release.value = 0.3;
    masterGain.gain.value = 0;
    masterGain.connect(compressor).connect(audioContext.destination);
    createVoice(55, "sine", 0.34);
    createVoice(82.41, "triangle", 0.08, -6);
    createVoice(110, "sine", 0.06, 5);
    audioContext.resume();
    masterGain.gain.setTargetAtTime(0.12, audioContext.currentTime, 0.8);
  }

  function stopAudio() {
    if (!audioContext) return;
    masterGain.gain.setTargetAtTime(0, audioContext.currentTime, 0.25);
    audioContext.suspend();
  }

  control.addEventListener("click", () => {
    enabled = !enabled;
    localStorage.setItem(storageKey, enabled ? "on" : "off");
    if (enabled) startAudio();
    else stopAudio();
    updateControl();
  });

  updateControl();
  if (enabled) {
    const unlock = () => {
      startAudio();
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
  }
})();
