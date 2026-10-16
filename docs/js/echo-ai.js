// ECHO // Entité IA de l'introduction : noyau vitré, spectre radial et anneaux HUD.
(function () {
  const TAU = Math.PI * 2;
  const BARS = 96;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let canvas = null;
  let ctx = null;
  let size = 0;
  let visible = true;
  let frame = 0;
  let lastDraw = 0;
  let activity = 0;
  let targetActivity = 0;
  let glitch = 0;
  let targetGlitch = 0;
  const levels = new Float32Array(BARS);
  const sparks = Array.from({ length: 42 }, (_, i) => ({
    angle: (i / 42) * TAU,
    orbit: 0.3 + Math.random() * 0.17,
    speed: 0.08 + Math.random() * 0.22,
    phase: Math.random() * TAU,
    size: 0.6 + Math.random() * 1.8,
  }));

  const mix = (a, b, t) => a + (b - a) * t;
  // Cyan/violet en veille, rouge/orange quand la simulation se brise.
  const hueA = () => mix(186, 352, glitch);
  const hueB = () => mix(268, 18, glitch);

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const box = canvas.getBoundingClientRect();
    size = Math.max(1, Math.min(box.width, box.height));
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function ring(radius, width, alpha, hue, dash, rotation) {
    ctx.save();
    ctx.rotate(rotation);
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, TAU);
    ctx.setLineDash(dash || []);
    ctx.lineWidth = width;
    ctx.strokeStyle = `hsla(${hue}, 100%, 70%, ${alpha})`;
    ctx.stroke();
    ctx.restore();
  }

  function draw(now) {
    frame = 0;
    if (!visible) return;
    if (now - lastDraw < 30) {
      frame = requestAnimationFrame(draw);
      return;
    }
    lastDraw = now;
    const t = now * 0.001;
    activity += (targetActivity - activity) * 0.09;
    glitch += (targetGlitch - glitch) * 0.12;
    const hA = hueA();
    const hB = hueB();
    const half = size / 2;
    const jitter = glitch > 0.2 ? glitch : 0;

    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(half, half);
    ctx.lineCap = "round";

    // Halo ambiant
    const halo = ctx.createRadialGradient(0, 0, size * 0.1, 0, 0, half);
    halo.addColorStop(0, `hsla(${hA}, 100%, 60%, ${0.16 + activity * 0.14})`);
    halo.addColorStop(0.55, `hsla(${hB}, 100%, 55%, 0.06)`);
    halo.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = halo;
    ctx.fillRect(-half, -half, size, size);

    // Anneau de graduations
    const tickR = size * 0.47;
    const tickRot = t * 0.07;
    for (let i = 0; i < 120; i += 1) {
      const a = (i / 120) * TAU + tickRot;
      const long = i % 10 === 0;
      const r1 = tickR - (long ? size * 0.028 : size * 0.014);
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
      ctx.lineTo(Math.cos(a) * tickR, Math.sin(a) * tickR);
      ctx.strokeStyle = `hsla(${hA}, 100%, 75%, ${long ? 0.7 : 0.26})`;
      ctx.lineWidth = long ? 1.6 : 1;
      ctx.stroke();
    }

    // Arcs HUD en contre-rotation
    ring(size * 0.425, 1.4, 0.5, hB, [size * 0.16, size * 0.07, size * 0.04, size * 0.07], -t * 0.35);
    ring(size * 0.215, 1, 0.38, hA, [3, 7], t * 0.5);

    // Spectre radial symétrique
    const inner = size * 0.25;
    const maxLen = size * 0.15;
    for (let i = 0; i < BARS; i += 1) {
      const mirror = i < BARS / 2 ? i : BARS - 1 - i;
      const idle = 0.07 + 0.05 * Math.sin(t * 2.2 + mirror * 0.4);
      const voice =
        (0.25 + 0.75 * Math.abs(Math.sin(t * 6.5 + mirror * 0.55) * Math.sin(t * 2.7 + mirror * 0.23))) *
        (0.55 + 0.45 * Math.sin(t * 8.3 + 1.7));
      const target = mix(idle, voice, activity);
      levels[i] += (target - levels[i]) * 0.38;
      const a = (i / BARS) * TAU - Math.PI / 2 + Math.sin(t * 0.2) * 0.04;
      const len = size * 0.012 + levels[i] * maxLen;
      const shift = jitter ? Math.sin(t * 34 + i * 2.1) * size * 0.02 * jitter : 0;
      const r0 = inner + shift;
      const r1 = r0 + len;
      const hue = mix(hA, hB, 0.5 + 0.5 * Math.sin(a * 2 + t * 0.6));
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
      ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
      ctx.strokeStyle = `hsla(${hue}, 100%, ${66 + levels[i] * 18}%, ${0.55 + levels[i] * 0.45})`;
      ctx.lineWidth = Math.max(1.4, size * 0.0085);
      ctx.shadowColor = `hsla(${hue}, 100%, 65%, 0.85)`;
      ctx.shadowBlur = 8;
      ctx.stroke();
    }
    ctx.shadowBlur = 0;

    // Étincelles en orbite
    sparks.forEach((s) => {
      const a = s.angle + t * s.speed;
      const r = size * (s.orbit + Math.sin(t * 0.9 + s.phase) * 0.012);
      ctx.beginPath();
      ctx.arc(Math.cos(a) * r, Math.sin(a) * r, s.size + activity * 0.9, 0, TAU);
      ctx.fillStyle = `hsla(${hA}, 100%, 80%, ${0.18 + activity * 0.45})`;
      ctx.fill();
    });

    // Noyau vitré
    const coreR = size * 0.185 * (1 + Math.sin(t * 2.4) * 0.012 + activity * 0.025);
    const body = ctx.createRadialGradient(-coreR * 0.3, -coreR * 0.4, coreR * 0.1, 0, 0, coreR);
    body.addColorStop(0, `hsla(${hA}, 90%, 38%, 0.95)`);
    body.addColorStop(0.55, "rgba(4, 9, 22, 0.97)");
    body.addColorStop(1, `hsla(${hB}, 70%, 14%, 0.98)`);
    ctx.beginPath();
    ctx.arc(0, 0, coreR, 0, TAU);
    ctx.fillStyle = body;
    ctx.shadowColor = `hsla(${hA}, 100%, 60%, 0.75)`;
    ctx.shadowBlur = size * 0.07;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Bord du noyau (séparation chromatique en glitch)
    if (jitter) {
      ctx.beginPath();
      ctx.arc(size * 0.012 * jitter, 0, coreR, 0, TAU);
      ctx.strokeStyle = `rgba(255, 45, 83, ${0.7 * jitter})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(-size * 0.012 * jitter, 0, coreR, 0, TAU);
      ctx.strokeStyle = `rgba(80, 220, 255, ${0.5 * jitter})`;
      ctx.stroke();
    }
    ring(coreR, 2, 0.9, hA, [], 0);

    // Iris : anneaux internes et encoches
    ring(coreR * 0.72, 1.2, 0.5, hB, [coreR * 0.28, coreR * 0.12], t * 0.8);
    ring(coreR * 0.48, 1, 0.55, hA, [coreR * 0.1, coreR * 0.1], -t * 1.1);

    // Pupille / étincelle centrale
    const pupil = coreR * (0.15 + activity * 0.1 + Math.sin(t * 3.1) * 0.012);
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, pupil * 3.4);
    glow.addColorStop(0, "rgba(255, 255, 255, 0.95)");
    glow.addColorStop(0.28, `hsla(${hA}, 100%, 72%, 0.75)`);
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, pupil * 3.4, 0, TAU);
    ctx.fill();

    // Ligne de balayage dans le noyau
    const scan = Math.sin(t * 1.3) * coreR * 0.78;
    const chord = Math.sqrt(Math.max(0, coreR * coreR * 0.92 - scan * scan));
    ctx.beginPath();
    ctx.moveTo(-chord, scan);
    ctx.lineTo(chord, scan);
    ctx.strokeStyle = `hsla(${hA}, 100%, 80%, 0.28)`;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Fractures et coupures horizontales pendant l'erreur
    if (jitter) {
      ctx.strokeStyle = `rgba(255, 70, 90, ${0.85 * jitter})`;
      ctx.lineWidth = 1.3;
      for (let i = 0; i < 7; i += 1) {
        const a = i * 0.9 + Math.sin(t * 7 + i) * 0.08;
        const len = coreR * (0.8 + (i % 3) * 0.3);
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * coreR * 0.18, Math.sin(a) * coreR * 0.18);
        ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len);
        ctx.stroke();
      }
      for (let i = 0; i < 5; i += 1) {
        const w = Math.sin(t * 24 + i * 2.7);
        const width = size * (0.16 + Math.abs(w) * 0.3);
        ctx.fillStyle = `rgba(255, 45, 83, ${0.3 * jitter})`;
        ctx.fillRect(-width / 2 + w * size * 0.1, (w * 0.42) * size * 0.5, width, 1 + Math.abs(w) * 2.5);
      }
    }

    ctx.restore();
    if (!reduceMotion) frame = requestAnimationFrame(draw);
  }

  function start() {
    if (!frame) frame = requestAnimationFrame(draw);
  }

  window.EchoAI = {
    init(element) {
      canvas = element;
      ctx = canvas.getContext("2d");
      resize();
      window.addEventListener("resize", resize);
      new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting;
          if (visible) {
            lastDraw = 0;
            start();
          }
        },
        { threshold: 0.01 },
      ).observe(canvas);
      if (reduceMotion) draw(1000);
      else start();
    },
    setState(speaking, isGlitching) {
      targetActivity = speaking ? 1 : 0;
      targetGlitch = isGlitching ? 1 : 0;
      if (reduceMotion) {
        activity = targetActivity;
        glitch = targetGlitch;
        draw(1000);
      }
    },
  };
})();
