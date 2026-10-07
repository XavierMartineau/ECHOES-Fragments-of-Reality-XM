/* ---------------------------------------------------------------------------
 * PARTIE 4 // NIVEAUX 31 À 40
 * Niveau 31 : le recycleur — plateau incliné, billes, pièges et quatre manches.
 * ------------------------------------------------------------------------- */
(() => {
  const canvas = document.getElementById("tiltCanvas");
  if (!canvas) return;

  const $ = (id) => document.getElementById(id);
  const language = localStorage.getItem("echoes-language") === "en" ? "en" : "fr";
  const text = {
    fr: {
      part: "PARTIE 4 // RÉSONANCE",
      level: "NIVEAU 31",
      eyebrow: "Fragment 031 // Plateau instable",
      title: "Le recycleur",
      description: "Un plateau suspendu penche au moindre souffle. Fais rouler les billes d'étage en étage jusqu'au recycleur du futur.",
      dialogue: "« Rien ne tombe tout seul. Il faut savoir pencher le monde. »",
      kicker: "PUZZLE // INCLINAISON",
      puzzle: "Le plateau suspendu",
      rules: "Incline tout le plateau avec A / D (ou ← / →), ou avec les flèches à l'écran. Les billes roulent du côté qui descend : guide-les à travers les trappes, étage après étage, jusqu'au recycleur. À chaque manche, une bille de plus et de nouveaux pièges mortels. Si une bille est détruite, la manche recommence.",
      legend: ["Laser", "Scie", "Gardien", "Rebondisseur", "Tapis roulant"],
      start: "LANCER LA MANCHE",
      restart: "REPRENDRE",
      reset: "Réinitialiser",
      next: "CONTINUER",
      save: "SAUVEGARDER",
      saved: "SAUVEGARDÉ",
      round: (n) => `MANCHE ${n} / 4`,
      roundBanner: (n) => `MANCHE ${n}`,
      system: "SYSTEME:: PLATEAU INSTABLE // GUIDE LES BILLES VERS LE RECYCLEUR",
      ready: "Appuie sur « Lancer la manche », puis incline avec A / D.",
      playing: "Incline le plateau. Évite les lasers et les scies.",
      dead: "Une bille a été détruite ! La manche recommence.",
      roundDone: (n) => `Manche ${n} réussie ! Une bille de plus et de nouveaux pièges arrivent.`,
      success: "Toutes les billes sont recyclées. Niveau 31 réussi.",
      systemSuccess: "SYSTEME:: RECYCLEUR SATURÉ // NIVEAU 31 VALIDÉ",
      saveError: "Impossible de sauvegarder.",
      bin: "RECYCLEUR",
      spawn: "ENTRÉE",
      cleared: "RECYCLÉ",
      footer: "ÉCHO // RÉSONANCE",
      progress: "Progression de la Partie 4",
    },
    en: {
      part: "PART 4 // RESONANCE",
      level: "LEVEL 31",
      eyebrow: "Fragment 031 // Unstable board",
      title: "The Recycler",
      description: "A suspended board tilts at the slightest breath. Roll the balls floor by floor into the recycler of the future.",
      dialogue: "“Nothing falls by itself. You have to learn to tilt the world.”",
      kicker: "PUZZLE // TILT",
      puzzle: "The suspended board",
      rules: "Tilt the whole board with A / D (or ← / →), or with the on-screen arrows. Balls roll toward the lower side: guide them through the hatches, floor after floor, into the recycler. Each round adds a ball and new deadly traps. If a ball is destroyed, the round restarts.",
      legend: ["Laser", "Saw", "Guardian", "Bumper", "Conveyor"],
      start: "START ROUND",
      restart: "RETRY",
      reset: "Reset",
      next: "CONTINUE",
      save: "SAVE",
      saved: "SAVED",
      round: (n) => `ROUND ${n} / 4`,
      roundBanner: (n) => `ROUND ${n}`,
      system: "SYSTEM:: UNSTABLE BOARD // GUIDE THE BALLS TO THE RECYCLER",
      ready: "Press “Start round”, then tilt with A / D.",
      playing: "Tilt the board. Avoid the lasers and saws.",
      dead: "A ball was destroyed! The round restarts.",
      roundDone: (n) => `Round ${n} cleared! One more ball and new traps are coming.`,
      success: "All balls recycled. Level 31 cleared.",
      systemSuccess: "SYSTEM:: RECYCLER SATURATED // LEVEL 31 VALIDATED",
      saveError: "Unable to save.",
      bin: "RECYCLER",
      spawn: "ENTRY",
      cleared: "RECYCLED",
      footer: "ECHO // RESONANCE",
      progress: "Part 4 progress",
    },
  }[language];

  const level = 31;
  const ctx = canvas.getContext("2d");
  const SCALE = canvas.width / 400;
  const W = 400;
  const H = 640;
  const R = 9;
  const FLOOR_H = 12;
  const INSET = 7;
  const floors = [130, 225, 320, 415, 510];
  const gaps = [[308, 372], [28, 92], [176, 240], [308, 372], [28, 92]];
  const bin = { x: 0, y: 566, w: 132, h: 74, cx: 66, cy: 606 };
  const maxTilt = 15;
  const visualTilt = 0.7;
  const gravity = 900;
  const damping = 1.2;
  const beltPush = 120;

  const hazards = [
    { type: "bob", f: 1, x: 215, phase: 0, round: 0 },
    { type: "laser", f: 3, x: 268, period: 2.6, on: 1.2, phase: 0, round: 0 },
    { type: "laser", f: 0, x: 172, period: 2.4, on: 1.1, phase: 1.2, round: 1 },
    { type: "bob", f: 2, x: 112, phase: 1.7, round: 1 },
    { type: "guard", f: 2, x1: 150, x2: 266, speed: 1.7, phase: 0, y: 352, round: 1 },
    { type: "bob", f: 0, x: 240, phase: 2.4, round: 2 },
    { type: "bumper", x: 208, y: 392, r: 15, round: 2 },
    { type: "belt", f: 4, x1: 120, x2: 300, dir: 1, round: 2 },
    { type: "laser", f: 4, x: 205, period: 2.2, on: 1.0, phase: 0.7, round: 3 },
    { type: "guard", f: 0, x1: 296, x2: 384, speed: 2, phase: 1, y: 186, round: 3 },
    { type: "laser", f: 1, x: 125, period: 2.3, on: 1.1, phase: 0.3, round: 3 },
  ];

  const rects = [];
  floors.forEach((top, index) => {
    const [g0, g1] = gaps[index];
    if (g0 > 0) rects.push({ x: 0, y: top, w: g0, h: FLOOR_H });
    if (g1 < W) rects.push({ x: g1, y: top, w: W - g1, h: FLOOR_H });
  });

  const startButton = $("startPuzzleButton");
  const nextButton = $("nextLevelButton");
  const resetButton = $("resetButton");
  const saveButton = $("saveGameButton");
  const leftButton = $("leftButton");
  const rightButton = $("rightButton");
  const status = $("puzzleStatus");
  const stage = canvas.parentElement;

  const currentUser = window.EchoesSave?.getCurrentUser?.() || "guest";
  const progressKey = `echoes-completed-levels-${encodeURIComponent(currentUser)}`;
  const completed = new Set(JSON.parse(localStorage.getItem(progressKey) || "[]"));

  let round = 0;
  let balls = [];
  let active = [];
  let running = false;
  let solved = false;
  let tilt = 0;
  let input = 0;
  let time = 0;
  let last = 0;
  let pendingTimer = 0;
  let shake = 0;
  let flash = 0;
  let flashColor = "198,255,77";
  let banner = { text: "", t: 0 };
  const held = { left: false, right: false };
  const sparks = [];
  const bumperFlash = new Map();
  const streams = Array.from({ length: 16 }, (_, index) => ({
    x: 14 + ((index * 53) % 372),
    y: (index * 97) % 640,
    speed: 18 + ((index * 13) % 40),
    len: 24 + ((index * 7) % 46),
  }));
  const stars = Array.from({ length: 36 }, (_, index) => ({
    x: (index * 67) % 400,
    y: (index * 131) % 640,
    s: 0.6 + ((index * 5) % 10) / 10,
  }));

  const setText = (id, value) => { $(id).textContent = value; };
  document.documentElement.lang = language;
  setText("partLabel", text.part);
  setText("levelLabel", text.level);
  setText("eyebrow", text.eyebrow);
  setText("levelTitle", text.title);
  setText("description", text.description);
  setText("dialogue", text.dialogue);
  setText("kicker", text.kicker);
  setText("puzzleTitle", text.puzzle);
  setText("rules", text.rules);
  setText("footerLabel", text.footer);
  resetButton.textContent = text.reset;
  nextButton.textContent = text.next;
  saveButton.textContent = text.save;
  document.querySelectorAll("#legend li span").forEach((item, index) => {
    item.textContent = text.legend[index] || "";
  });

  const setStatus = (message, variant = "") => {
    status.textContent = message;
    status.className = `puzzle-status${variant ? ` ${variant}` : ""}`;
  };

  const renderProgress = () => {
    const progress = $("levelProgress");
    progress.setAttribute("aria-label", text.progress);
    progress.replaceChildren();
    for (let number = 31; number <= 40; number += 1) {
      const marker = document.createElement("span");
      marker.className = "level-square";
      if (completed.has(number)) marker.classList.add("completed");
      if (number === level) marker.classList.add("current");
      progress.appendChild(marker);
    }
  };

  const saveProgress = (current = level) => {
    localStorage.setItem(progressKey, JSON.stringify([...completed].sort((a, b) => a - b)));
    return currentUser === "guest" || Boolean(window.EchoesSave?.saveProgress({
      currentPage: `level-${current}`,
      currentLevel: current,
      completedLevels: [...completed].sort((a, b) => a - b),
    }));
  };

  const hues = [185, 320, 75, 45];
  const spawnBalls = () => {
    balls = Array.from({ length: round + 1 }, (_, index) => ({
      x: 28 + index * 24,
      y: floors[0] - R,
      vx: 0,
      vy: 0,
      done: false,
      absorb: -1,
      angle: 0,
      trail: [],
      hue: hues[index % hues.length],
    }));
  };

  const sawY = (hazard) => floors[hazard.f] - 34 + 30 * Math.sin(time * 2.4 + hazard.phase);
  const guardPos = (hazard) => ({
    x: hazard.x1 + (hazard.x2 - hazard.x1) * (0.5 + 0.5 * Math.sin(time * hazard.speed + hazard.phase)),
    y: hazard.y,
  });
  const laserPhase = (hazard) => (((time + hazard.phase) % hazard.period) + hazard.period) % hazard.period;
  const laserOn = (hazard) => laserPhase(hazard) < hazard.on;
  const laserWarn = (hazard) => !laserOn(hazard) && laserPhase(hazard) > hazard.period - 0.5;

  const updateReadouts = () => {
    setText("roundReadout", text.round(round + 1));
    setText("ballReadout", `${balls.filter((ball) => ball.done).length} / ${balls.length}`);
  };

  const burst = (x, y, color = "255,210,77", count = 18, power = 140) => {
    for (let index = 0; index < count; index += 1) {
      const angle = (index / count) * Math.PI * 2 + Math.random() * 0.4;
      const speed = 40 + Math.random() * power;
      sparks.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 0.8, color });
    }
  };

  const die = (ball) => {
    if (!running) return;
    running = false;
    burst(ball.x, ball.y, "255,90,110", 28, 200);
    shake = 0.5;
    flash = 0.5;
    flashColor = "255,60,90";
    stage.classList.remove("is-dead");
    void stage.offsetWidth;
    stage.classList.add("is-dead");
    setStatus(text.dead, "error");
    startButton.hidden = false;
    startButton.textContent = text.restart;
    window.clearTimeout(pendingTimer);
    pendingTimer = window.setTimeout(() => {
      if (!solved) resetRound(false);
    }, 1000);
  };

  const finishRound = () => {
    running = false;
    flash = 0.45;
    flashColor = "198,255,77";
    banner = { text: text.cleared, t: 1.4 };
    if (round < 3) {
      setStatus(text.roundDone(round + 1), "success");
      window.clearTimeout(pendingTimer);
      pendingTimer = window.setTimeout(() => {
        round += 1;
        resetRound(true);
      }, 1700);
      return;
    }
    solved = true;
    completed.add(level);
    renderProgress();
    const saved = saveProgress();
    setStatus(saved ? text.success : text.saveError, saved ? "success" : "error");
    setText("systemMessage", text.systemSuccess);
    stage.classList.add("is-solved");
    startButton.hidden = true;
    nextButton.hidden = false;
    nextButton.focus();
  };

  const collide = (ball) => {
    rects.forEach((rect) => {
      const px = Math.max(rect.x, Math.min(ball.x, rect.x + rect.w));
      const py = Math.max(rect.y, Math.min(ball.y, rect.y + rect.h));
      let dx = ball.x - px;
      let dy = ball.y - py;
      let dist = Math.hypot(dx, dy);
      if (dist >= R) return;
      if (dist === 0) {
        dx = 0;
        dy = -1;
        dist = 1;
        ball.y = rect.y - R;
      }
      const nx = dx / dist;
      const ny = dy / dist;
      ball.x += nx * (R - dist);
      ball.y += ny * (R - dist);
      const vn = ball.vx * nx + ball.vy * ny;
      if (vn < 0) {
        ball.vx -= 1.25 * vn * nx;
        ball.vy -= 1.25 * vn * ny;
      }
    });
    active.filter((hazard) => hazard.type === "bumper").forEach((bumper) => {
      const dx = ball.x - bumper.x;
      const dy = ball.y - bumper.y;
      const dist = Math.hypot(dx, dy);
      const reach = R + bumper.r;
      if (dist >= reach || dist === 0) return;
      const nx = dx / dist;
      const ny = dy / dist;
      ball.x = bumper.x + nx * reach;
      ball.y = bumper.y + ny * reach;
      const vn = ball.vx * nx + ball.vy * ny;
      const speed = Math.max(260, Math.abs(vn) * 1.15);
      ball.vx = nx * speed * 0.9 + ball.vx * 0.2;
      ball.vy = ny * speed * 0.7;
      bumperFlash.set(bumper, 1);
      burst(ball.x, ball.y, "255,79,216", 8, 90);
    });
    if (ball.x < R) { ball.x = R; ball.vx = Math.abs(ball.vx) * 0.3; }
    if (ball.x > W - R) { ball.x = W - R; ball.vx = -Math.abs(ball.vx) * 0.3; }
  };

  const step = (dt) => {
    time += dt;
    const target = input * maxTilt;
    const delta = target - tilt;
    tilt += Math.sign(delta) * Math.min(Math.abs(delta), 70 * dt);
    const radians = (tilt * Math.PI) / 180;
    const gx = gravity * Math.sin(radians);
    const gy = gravity * Math.cos(radians);
    const belts = active.filter((hazard) => hazard.type === "belt");
    for (let sub = 0; sub < 4; sub += 1) {
      const h = dt / 4;
      balls.forEach((ball) => {
        if (ball.done) return;
        if (ball.absorb >= 0) {
          ball.absorb += h * 2.2;
          ball.x += (bin.cx - ball.x) * Math.min(1, h * 9);
          ball.y += (bin.cy - ball.y) * Math.min(1, h * 9);
          if (ball.absorb >= 1) {
            ball.done = true;
            burst(bin.cx, bin.cy, "198,255,77", 22, 150);
          }
          return;
        }
        ball.vx += gx * h;
        ball.vy += gy * h;
        belts.forEach((belt) => {
          const top = floors[belt.f];
          if (ball.x > belt.x1 && ball.x < belt.x2 && Math.abs(ball.y - (top - R)) < 3) ball.vx += belt.dir * beltPush * h;
        });
        ball.vx *= 1 - damping * h;
        ball.vx = Math.max(-260, Math.min(260, ball.vx));
        ball.x += ball.vx * h;
        ball.y += ball.vy * h;
        collide(ball);
        ball.angle += (ball.vx / R) * h;
        if (ball.y > bin.y + 4 && ball.x < bin.w) ball.absorb = 0;
      });
    }
    for (const ball of balls) {
      if (ball.done || ball.absorb >= 0) continue;
      ball.trail.push({ x: ball.x, y: ball.y });
      if (ball.trail.length > 12) ball.trail.shift();
      for (const hazard of active) {
        if (hazard.type === "laser") {
          const top = floors[hazard.f];
          if (laserOn(hazard) && Math.abs(ball.x - hazard.x) < R + 2 && ball.y > top - 70 && ball.y < top + 4) {
            die(ball);
            return;
          }
        } else if (hazard.type === "bob") {
          if (Math.hypot(ball.x - hazard.x, ball.y - sawY(hazard)) < 12 + R - 3) {
            die(ball);
            return;
          }
        } else if (hazard.type === "guard") {
          const pos = guardPos(hazard);
          if (Math.hypot(ball.x - pos.x, ball.y - pos.y) < 12 + R - 3) {
            die(ball);
            return;
          }
        }
      }
      if (ball.y > H + 40) {
        die(ball);
        return;
      }
    }
    updateReadouts();
    if (balls.every((ball) => ball.done)) finishRound();
  };

  const roundedRect = (x, y, w, h, r) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  const gearPath = (x, y, radius, teeth, rotation) => {
    ctx.beginPath();
    for (let index = 0; index < teeth * 2; index += 1) {
      const angle = rotation + (index * Math.PI) / teeth;
      const r = index % 2 ? radius * 0.72 : radius;
      const px = x + Math.cos(angle) * r;
      const py = y + Math.sin(angle) * r;
      if (index) ctx.lineTo(px, py);
      else ctx.moveTo(px, py);
    }
    ctx.closePath();
  };

  const drawBackground = () => {
    const sky = ctx.createLinearGradient(0, -100, 0, H + 100);
    sky.addColorStop(0, "#04120f");
    sky.addColorStop(0.55, "#07140f");
    sky.addColorStop(1, "#0b1a10");
    ctx.fillStyle = sky;
    ctx.fillRect(-140, -140, W + 280, H + 280);

    stars.forEach((star) => {
      ctx.globalAlpha = 0.25 + 0.35 * Math.abs(Math.sin(time * star.s + star.x));
      ctx.fillStyle = "#b8ffe0";
      ctx.fillRect(star.x, star.y, 1.5, 1.5);
    });
    ctx.globalAlpha = 1;

    ctx.strokeStyle = "rgba(61,255,176,0.06)";
    ctx.lineWidth = 1;
    const offset = (time * 8) % 40;
    for (let x = -120; x <= W + 120; x += 40) { ctx.beginPath(); ctx.moveTo(x, -140); ctx.lineTo(x, H + 140); ctx.stroke(); }
    for (let y = -120 + offset; y <= H + 140; y += 40) { ctx.beginPath(); ctx.moveTo(-140, y); ctx.lineTo(W + 140, y); ctx.stroke(); }

    streams.forEach((stream) => {
      const y = ((stream.y + time * stream.speed) % (H + 140)) - 70;
      const line = ctx.createLinearGradient(0, y, 0, y + stream.len);
      line.addColorStop(0, "rgba(125,255,196,0)");
      line.addColorStop(1, "rgba(125,255,196,0.28)");
      ctx.fillStyle = line;
      ctx.fillRect(stream.x, y, 1.5, stream.len);
    });

    const hex = ctx.createRadialGradient(200, 320, 20, 200, 320, 260);
    hex.addColorStop(0, "rgba(61,255,176,0.12)");
    hex.addColorStop(1, "rgba(61,255,176,0)");
    ctx.fillStyle = hex;
    ctx.fillRect(-140, -140, W + 280, H + 280);

    floors.slice(0, 4).forEach((top, index) => {
      const [g0, g1] = gaps[index];
      const beam = ctx.createLinearGradient(0, top + FLOOR_H, 0, floors[index + 1]);
      beam.addColorStop(0, "rgba(125,255,196,0.16)");
      beam.addColorStop(1, "rgba(125,255,196,0)");
      ctx.fillStyle = beam;
      ctx.fillRect(g0, top + FLOOR_H, g1 - g0, floors[index + 1] - top - FLOOR_H);
      ctx.fillStyle = "rgba(125,255,196,0.5)";
      for (let chevron = 0; chevron < 2; chevron += 1) {
        const y = top + FLOOR_H + 14 + ((time * 40 + chevron * 40) % 78);
        const cx = (g0 + g1) / 2;
        ctx.globalAlpha = Math.max(0, 1 - (y - top) / 90);
        ctx.beginPath();
        ctx.moveTo(cx - 6, y);
        ctx.lineTo(cx, y + 6);
        ctx.lineTo(cx + 6, y);
        ctx.lineTo(cx, y + 2.5);
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    });
  };

  const drawPlatforms = () => {
    rects.forEach((rect) => {
      const body = ctx.createLinearGradient(0, rect.y, 0, rect.y + rect.h);
      body.addColorStop(0, "#3dffb0");
      body.addColorStop(0.18, "#1d6a52");
      body.addColorStop(1, "#0a2a22");
      ctx.fillStyle = body;
      ctx.shadowColor = "#3dffb0";
      ctx.shadowBlur = 10;
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(220,255,255,0.8)";
      ctx.fillRect(rect.x, rect.y, rect.w, 1.6);
      for (let x = rect.x + 8; x < rect.x + rect.w - 4; x += 16) {
        const on = Math.sin(time * 3 + x * 0.05) > 0.2;
        ctx.fillStyle = on ? "rgba(125,255,196,0.9)" : "rgba(125,255,196,0.18)";
        ctx.fillRect(x, rect.y + rect.h - 4, 3, 2);
      }
    });
    floors.forEach((top, index) => {
      const [g0, g1] = gaps[index];
      [[g0 - 7, g0, g0 > 0], [g1, g1 + 7, g1 < W]].forEach(([x0, x1, ok]) => {
        if (!ok) return;
        ctx.save();
        ctx.beginPath();
        ctx.rect(x0, top, x1 - x0, FLOOR_H);
        ctx.clip();
        ctx.fillStyle = "#1a1408";
        ctx.fillRect(x0, top, x1 - x0, FLOOR_H);
        ctx.fillStyle = "#ffd24d";
        for (let s = -FLOOR_H; s < x1 - x0 + FLOOR_H; s += 8) {
          ctx.beginPath();
          ctx.moveTo(x0 + s, top + FLOOR_H);
          ctx.lineTo(x0 + s + 4, top + FLOOR_H);
          ctx.lineTo(x0 + s + 4 + FLOOR_H, top);
          ctx.lineTo(x0 + s + FLOOR_H, top);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      });
      ctx.fillStyle = "rgba(170,255,215,0.55)";
      ctx.font = "bold 8px Orbitron, Arial, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`0${index + 1}`, 14, top - 4);
    });
  };

  const drawSpawn = () => {
    const x = 50;
    const y = floors[0] - 56;
    const beam = ctx.createLinearGradient(0, y, 0, floors[0]);
    beam.addColorStop(0, "rgba(125,255,196,0.22)");
    beam.addColorStop(1, "rgba(125,255,196,0)");
    ctx.fillStyle = beam;
    ctx.fillRect(x - 26, y, 52, floors[0] - y);
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = "rgba(125,255,196,0.8)";
    ctx.shadowColor = "#3dffb0";
    ctx.shadowBlur = 10;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 30, 9, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.rotate(time * 0.8);
    ctx.setLineDash([6, 8]);
    ctx.strokeStyle = "rgba(182,255,90,0.9)";
    ctx.beginPath();
    ctx.ellipse(0, 0, 22, 6, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = "rgba(125,255,196,0.8)";
    ctx.font = "bold 8px Orbitron, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(text.spawn, x, y - 14);
  };

  const drawBin = () => {
    const pulse = 0.5 + 0.5 * Math.sin(time * 4);
    const doneCount = balls.filter((ball) => ball.done).length;
    ctx.save();
    const glow = ctx.createRadialGradient(bin.cx, bin.cy, 4, bin.cx, bin.cy, 80);
    glow.addColorStop(0, `rgba(198,255,77,${0.3 + pulse * 0.18})`);
    glow.addColorStop(1, "rgba(198,255,77,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, bin.y - 20, bin.w + 40, bin.h + 30);
    ctx.strokeStyle = "#c6ff4d";
    ctx.shadowColor = "#c6ff4d";
    ctx.shadowBlur = 12;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, bin.y - 14);
    ctx.lineTo(bin.w - 6, bin.y - 14);
    ctx.lineTo(bin.w - 6, H - 3);
    ctx.stroke();
    ctx.shadowBlur = 0;
    for (let ring = 0; ring < 3; ring += 1) {
      ctx.save();
      ctx.translate(bin.cx, bin.cy);
      ctx.rotate(time * (1.2 + ring * 0.6) * (ring % 2 ? -1 : 1));
      ctx.strokeStyle = ring === 1 ? "rgba(255,79,216,0.8)" : "rgba(198,255,77,0.8)";
      ctx.lineWidth = 2;
      ctx.setLineDash([8 + ring * 3, 6]);
      ctx.beginPath();
      ctx.ellipse(0, 0, 40 - ring * 11, 14 - ring * 3, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = "#c6ff4d";
    ctx.font = "bold 10px Orbitron, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(text.bin, bin.cx - 3, H - 8);
    ctx.fillText("▼", 60, bin.y - 24 + pulse * 6);
    for (let index = 0; index < balls.length; index += 1) {
      ctx.fillStyle = index < doneCount ? "#c6ff4d" : "rgba(198,255,77,0.2)";
      ctx.shadowColor = "#c6ff4d";
      ctx.shadowBlur = index < doneCount ? 8 : 0;
      ctx.beginPath();
      ctx.arc(bin.cx - 3 + (index - (balls.length - 1) / 2) * 16, bin.y - 4, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  const drawBelt = (hazard) => {
    const top = floors[hazard.f];
    const d = hazard.dir;
    ctx.save();
    ctx.beginPath();
    ctx.rect(hazard.x1, top - 4, hazard.x2 - hazard.x1, 5);
    ctx.clip();
    ctx.fillStyle = "#2a1038";
    ctx.fillRect(hazard.x1, top - 4, hazard.x2 - hazard.x1, 5);
    ctx.fillStyle = "#ff4fd8";
    const shift = (time * 30 * d) % 14;
    for (let x = hazard.x1 - 14 + shift; x < hazard.x2 + 14; x += 14) {
      ctx.beginPath();
      ctx.moveTo(x, top - 4);
      ctx.lineTo(x + 4 * d, top - 1.5);
      ctx.lineTo(x, top + 1);
      ctx.lineTo(x + 3 * d, top + 1);
      ctx.lineTo(x + 7 * d, top - 1.5);
      ctx.lineTo(x + 3 * d, top - 4);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
    ctx.fillStyle = "#ff4fd8";
    ctx.beginPath();
    ctx.arc(hazard.x1, top - 1.5, 3, 0, Math.PI * 2);
    ctx.arc(hazard.x2, top - 1.5, 3, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawLaser = (hazard) => {
    const top = floors[hazard.f];
    const on = laserOn(hazard);
    const warn = laserWarn(hazard);
    ctx.fillStyle = "#2a1038";
    ctx.strokeStyle = "#ff4fd8";
    ctx.lineWidth = 1.5;
    roundedRect(hazard.x - 8, top - 82, 16, 12, 3);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = on || warn ? "#ff9fb8" : "#6a2a50";
    ctx.beginPath();
    ctx.arc(hazard.x, top - 72, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#2a1038";
    ctx.fillRect(hazard.x - 7, top - 1, 14, 3);
    if (on) {
      const beam = ctx.createLinearGradient(hazard.x - 5, 0, hazard.x + 5, 0);
      beam.addColorStop(0, "rgba(255,40,100,0)");
      beam.addColorStop(0.5, "rgba(255,80,130,0.95)");
      beam.addColorStop(1, "rgba(255,40,100,0)");
      ctx.fillStyle = beam;
      ctx.shadowColor = "#ff2d64";
      ctx.shadowBlur = 16;
      ctx.fillRect(hazard.x - 5, top - 70, 10, 70);
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#fff";
      ctx.fillRect(hazard.x - 1, top - 70, 2, 70);
    } else if (warn && Math.floor(time * 16) % 2 === 0) {
      ctx.strokeStyle = "rgba(255,120,160,0.8)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(hazard.x, top - 70);
      ctx.lineTo(hazard.x, top);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  };

  const drawSaw = (hazard) => {
    const guard = hazard.type === "guard";
    const pos = guard ? guardPos(hazard) : { x: hazard.x, y: sawY(hazard) };
    ctx.strokeStyle = "rgba(255,140,90,0.35)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([2, 4]);
    ctx.beginPath();
    if (guard) {
      ctx.moveTo(hazard.x1 - 10, hazard.y);
      ctx.lineTo(hazard.x2 + 10, hazard.y);
    } else {
      ctx.moveTo(hazard.x, floors[hazard.f] - 66);
      ctx.lineTo(hazard.x, floors[hazard.f] - 2);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.save();
    ctx.shadowColor = guard ? "#ff4fd8" : "#ff7a2d";
    ctx.shadowBlur = 14;
    gearPath(pos.x, pos.y, 13, 9, time * (guard ? 7 : 6));
    const blade = ctx.createRadialGradient(pos.x, pos.y, 2, pos.x, pos.y, 13);
    blade.addColorStop(0, "#fff0d0");
    blade.addColorStop(0.5, guard ? "#ff4fd8" : "#ff9f4d");
    blade.addColorStop(1, "#c0182f");
    ctx.fillStyle = blade;
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = "#1a0a14";
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 3.5, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawBumper = (hazard) => {
    const f = bumperFlash.get(hazard) || 0;
    ctx.save();
    ctx.shadowColor = "#ff4fd8";
    ctx.shadowBlur = 12 + f * 16;
    const fill = ctx.createRadialGradient(hazard.x, hazard.y, 2, hazard.x, hazard.y, hazard.r);
    fill.addColorStop(0, f > 0.2 ? "#fff" : "#ffb3f0");
    fill.addColorStop(0.6, "#ff4fd8");
    fill.addColorStop(1, "#7a1a78");
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(hazard.x, hazard.y, hazard.r * (1 + f * 0.12), 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(hazard.x, hazard.y, hazard.r - 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  };

  const drawHazards = () => {
    active.forEach((hazard) => {
      if (hazard.type === "belt") drawBelt(hazard);
      else if (hazard.type === "laser") drawLaser(hazard);
      else if (hazard.type === "bumper") drawBumper(hazard);
      else drawSaw(hazard);
    });
  };

  const drawBalls = () => {
    balls.forEach((ball) => {
      if (ball.done) return;
      const shrink = ball.absorb >= 0 ? Math.max(0.15, 1 - ball.absorb) : 1;
      ball.trail.forEach((point, index) => {
        const ratio = (index + 1) / ball.trail.length;
        ctx.globalAlpha = ratio * 0.35;
        ctx.fillStyle = `hsl(${ball.hue} 100% 60%)`;
        ctx.beginPath();
        ctx.arc(point.x, point.y, R * ratio * 0.8, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      ctx.save();
      ctx.translate(ball.x, ball.y);
      ctx.scale(shrink, shrink);
      ctx.shadowColor = `hsl(${ball.hue} 100% 60%)`;
      ctx.shadowBlur = 16;
      const fill = ctx.createRadialGradient(-3, -3, 1, 0, 0, R);
      fill.addColorStop(0, "#ffffff");
      fill.addColorStop(0.35, `hsl(${ball.hue} 100% 72%)`);
      fill.addColorStop(1, `hsl(${ball.hue} 100% 42%)`);
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.arc(0, 0, R, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.rotate(ball.angle);
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-R * 0.65, 0);
      ctx.lineTo(R * 0.65, 0);
      ctx.stroke();
      ctx.restore();
    });
  };

  const drawSparks = () => {
    sparks.forEach((spark) => {
      ctx.globalAlpha = Math.max(0, spark.life / 0.8);
      ctx.fillStyle = `rgb(${spark.color})`;
      ctx.fillRect(spark.x - 2, spark.y - 2, 4, 4);
    });
    ctx.globalAlpha = 1;
  };

  const drawCasing = () => {
    const metal = ctx.createLinearGradient(0, 0, W, H);
    metal.addColorStop(0, "#1f5a45");
    metal.addColorStop(0.5, "#0a1f1a");
    metal.addColorStop(1, "#1a3a22");
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, H);
    ctx.moveTo(INSET + 14, INSET);
    ctx.arcTo(W - INSET, INSET, W - INSET, H - INSET, 14);
    ctx.arcTo(W - INSET, H - INSET, INSET, H - INSET, 14);
    ctx.arcTo(INSET, H - INSET, INSET, INSET, 14);
    ctx.arcTo(INSET, INSET, W - INSET, INSET, 14);
    ctx.closePath();
    ctx.fillStyle = metal;
    ctx.fill("evenodd");
    ctx.strokeStyle = "#7dffc4";
    ctx.shadowColor = "#3dffb0";
    ctx.shadowBlur = 8;
    ctx.lineWidth = 1.5;
    roundedRect(INSET, INSET, W - INSET * 2, H - INSET * 2, 14);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(200,255,225,0.8)";
    [[4, 4], [W - 4, 4], [4, H - 4], [W - 4, H - 4]].forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 1.8, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  };

  const drawHud = () => {
    ctx.save();
    roundedRect(150, 14, 100, 22, 11);
    ctx.fillStyle = "rgba(4,8,22,0.78)";
    ctx.fill();
    ctx.strokeStyle = "rgba(125,255,196,0.6)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.strokeStyle = "rgba(125,255,196,0.3)";
    for (let tick = -3; tick <= 3; tick += 1) {
      ctx.beginPath();
      ctx.moveTo(200 + tick * 12, 20);
      ctx.lineTo(200 + tick * 12, tick === 0 ? 30 : 27);
      ctx.stroke();
    }
    const needle = 200 + (tilt / maxTilt) * 38;
    ctx.fillStyle = Math.abs(tilt) > 10 ? "#ffd24d" : "#c6ff4d";
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(needle, 19);
    ctx.lineTo(needle - 4, 31);
    ctx.lineTo(needle + 4, 31);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.font = "bold 9px Orbitron, Arial, sans-serif";
    ctx.fillStyle = input < 0 ? "#fff" : "rgba(125,255,196,0.5)";
    ctx.textAlign = "left";
    ctx.fillText("◀", 156, 29);
    ctx.fillStyle = input > 0 ? "#fff" : "rgba(125,255,196,0.5)";
    ctx.textAlign = "right";
    ctx.fillText("▶", 244, 29);
    ctx.restore();

    if (banner.t > 0) {
      const alpha = Math.min(1, banner.t * 1.6);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.textAlign = "center";
      ctx.font = "bold 30px Orbitron, Arial, sans-serif";
      ctx.shadowColor = "#3dffb0";
      ctx.shadowBlur = 20;
      ctx.fillStyle = "#e8ffff";
      ctx.fillText(banner.text, W / 2, 80 + (1 - alpha) * 10);
      ctx.restore();
    }
    if (flash > 0) {
      ctx.fillStyle = `rgba(${flashColor},${flash * 0.4})`;
      ctx.fillRect(0, 0, W, H);
    }
  };

  const render = () => {
    ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#04060f";
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    if (shake > 0) ctx.translate((Math.random() - 0.5) * shake * 12, (Math.random() - 0.5) * shake * 12);
    roundedRect(INSET, INSET, W - INSET * 2, H - INSET * 2, 14);
    ctx.clip();
    ctx.translate(W / 2, H / 2);
    ctx.rotate((tilt * visualTilt * Math.PI) / 180);
    ctx.translate(-W / 2, -H / 2);
    drawBackground();
    drawSpawn();
    drawPlatforms();
    drawBin();
    drawHazards();
    drawBalls();
    drawSparks();
    ctx.restore();
    drawCasing();
    drawHud();
  };

  const loop = (now) => {
    const dt = Math.min((now - last) / 1000, 0.04);
    last = now;
    if (running) step(dt);
    else {
      time += dt;
      const delta = -tilt;
      tilt += Math.sign(delta) * Math.min(Math.abs(delta), 40 * dt);
    }
    for (let index = sparks.length - 1; index >= 0; index -= 1) {
      const spark = sparks[index];
      spark.x += spark.vx * dt;
      spark.y += spark.vy * dt;
      spark.life -= dt;
      if (spark.life <= 0) sparks.splice(index, 1);
    }
    bumperFlash.forEach((value, key) => bumperFlash.set(key, Math.max(0, value - dt * 4)));
    shake = Math.max(0, shake - dt * 1.4);
    flash = Math.max(0, flash - dt * 1.2);
    banner.t = Math.max(0, banner.t - dt);
    render();
    requestAnimationFrame(loop);
  };

  const updateInput = () => {
    input = (held.right ? 1 : 0) - (held.left ? 1 : 0);
    leftButton.classList.toggle("is-held", held.left);
    rightButton.classList.toggle("is-held", held.right);
  };

  function resetRound(autostart) {
    window.clearTimeout(pendingTimer);
    running = false;
    active = hazards.filter((hazard) => hazard.round <= round);
    spawnBalls();
    updateReadouts();
    banner = { text: text.roundBanner(round + 1), t: 1.6 };
    startButton.hidden = false;
    startButton.textContent = text.start;
    if (autostart) {
      running = true;
      startButton.hidden = true;
      setStatus(text.playing);
    } else {
      setStatus(text.ready);
    }
  }

  const fullReset = () => {
    solved = false;
    round = 0;
    tilt = 0;
    stage.classList.remove("is-solved");
    nextButton.hidden = true;
    setText("systemMessage", text.system);
    resetRound(false);
  };

  startButton.addEventListener("click", () => {
    if (running || solved) return;
    resetRound(true);
  });
  resetButton.addEventListener("click", fullReset);
  nextButton.addEventListener("click", () => {
    if (!solved) return;
    if (!saveProgress(32)) {
      setStatus(text.saveError, "error");
      return;
    }
    window.location.href = "niveau-32.html";
  });
  saveButton.addEventListener("click", () => {
    const saved = saveProgress();
    setStatus(saved ? text.saved : text.saveError, saved ? "success" : "error");
  });

  [[leftButton, "left"], [rightButton, "right"]].forEach(([button, side]) => {
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      held[side] = true;
      updateInput();
    });
    ["pointerup", "pointerleave", "pointercancel"].forEach((name) => {
      button.addEventListener(name, () => { held[side] = false; updateInput(); });
    });
  });
  document.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if (key === "a" || key === "arrowleft") held.left = true;
    else if (key === "d" || key === "arrowright") held.right = true;
    else return;
    event.preventDefault();
    updateInput();
  });
  document.addEventListener("keyup", (event) => {
    const key = event.key.toLowerCase();
    if (key === "a" || key === "arrowleft") held.left = false;
    else if (key === "d" || key === "arrowright") held.right = false;
    else return;
    updateInput();
  });
  window.addEventListener("blur", () => {
    held.left = false;
    held.right = false;
    updateInput();
  });

  renderProgress();
  fullReset();
  saveProgress();
  last = performance.now();
  requestAnimationFrame(loop);
})();
