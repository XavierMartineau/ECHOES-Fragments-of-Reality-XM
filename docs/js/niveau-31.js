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
      rules: "Incline tout le plateau avec A / D (ou ← / →), ou avec les flèches à l'écran. Les billes roulent vers le côté qui descend : guide-les dans les trous, étage après étage, jusqu'au recycleur lumineux en bas. Une manche de plus = une bille de plus et de nouveaux pièges mortels (lasers, scies). Si une bille est détruite, la manche recommence.",
      start: "LANCER LA MANCHE",
      restart: "REPRENDRE",
      reset: "Réinitialiser",
      next: "CONTINUER",
      save: "SAUVEGARDER",
      saved: "SAUVEGARDÉ",
      round: (n) => `MANCHE ${n} / 4`,
      system: "SYSTEME:: PLATEAU INSTABLE // GUIDE LES BILLES VERS LE RECYCLEUR",
      ready: "Appuie sur « Lancer la manche », puis incline avec A / D.",
      playing: "Incline le plateau. Évite les lasers et les scies.",
      dead: "Une bille a été détruite ! La manche recommence.",
      roundDone: (n) => `Manche ${n} réussie ! Une bille de plus et de nouveaux pièges arrivent.`,
      success: "Toutes les billes sont recyclées. Niveau 31 réussi.",
      systemSuccess: "SYSTEME:: RECYCLEUR SATURÉ // NIVEAU 31 VALIDÉ",
      saveError: "Impossible de sauvegarder.",
      bin: "RECYCLEUR",
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
      rules: "Tilt the whole board with A / D (or ← / →), or with the on-screen arrows. Balls roll toward the lower side: guide them through the gaps, floor after floor, into the glowing recycler below. Each round adds a ball and new deadly traps (lasers, saws). If a ball is destroyed, the round restarts.",
      start: "START ROUND",
      restart: "RETRY",
      reset: "Reset",
      next: "CONTINUE",
      save: "SAVE",
      saved: "SAVED",
      round: (n) => `ROUND ${n} / 4`,
      system: "SYSTEM:: UNSTABLE BOARD // GUIDE THE BALLS TO THE RECYCLER",
      ready: "Press “Start round”, then tilt with A / D.",
      playing: "Tilt the board. Avoid the lasers and saws.",
      dead: "A ball was destroyed! The round restarts.",
      roundDone: (n) => `Round ${n} cleared! One more ball and new traps are coming.`,
      success: "All balls recycled. Level 31 cleared.",
      systemSuccess: "SYSTEM:: RECYCLER SATURATED // LEVEL 31 VALIDATED",
      saveError: "Unable to save.",
      bin: "RECYCLER",
      footer: "ECHO // RESONANCE",
      progress: "Part 4 progress",
    },
  }[language];

  const level = 31;
  const ctx = canvas.getContext("2d");
  const W = 360;
  const H = 600;
  const OX = 100;
  const OY = 70;
  const R = 9;
  const FLOOR_H = 10;
  const floors = [110, 200, 290, 380, 470];
  const gaps = [[296, 360], [0, 64], [296, 360], [0, 64], [296, 360]];
  const binX = 296;
  const maxTilt = 15;
  const gravity = 900;
  const damping = 1.2;
  const obstacleList = [
    { type: "laser", f: 1, x: 190, period: 2.6, on: 1.2, phase: 0 },
    { type: "saw", f: 3, x: 140, phase: 0 },
    { type: "laser", f: 2, x: 170, period: 2.4, on: 1.2, phase: 1.1 },
    { type: "saw", f: 0, x: 210, phase: 2 },
    { type: "laser", f: 4, x: 150, period: 2.2, on: 1.1, phase: 0.6 },
    { type: "saw", f: 2, x: 250, phase: 1 },
    { type: "laser", f: 3, x: 250, period: 2.3, on: 1.2, phase: 1.7 },
    { type: "saw", f: 1, x: 110, phase: 3 },
  ];
  const obstacleCounts = [2, 4, 6, 8];

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
  let completed = new Set(JSON.parse(localStorage.getItem(progressKey) || "[]"));

  let round = 0;
  let balls = [];
  let obstacles = [];
  let running = false;
  let solved = false;
  let tilt = 0;
  let input = 0;
  let time = 0;
  let last = 0;
  let frame = 0;
  let pendingTimer = 0;
  const held = { left: false, right: false };
  const sparks = [];

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

  const spawnBalls = () => {
    const count = round + 1;
    balls = Array.from({ length: count }, (_, index) => ({
      x: 30 + index * 26,
      y: floors[0] - R,
      vx: 0,
      vy: 0,
      done: false,
      fade: 0,
      hue: [185, 320, 75, 45][index % 4],
    }));
  };

  const buildObstacles = () => {
    obstacles = obstacleList.slice(0, obstacleCounts[round]);
  };

  const sawY = (obstacle) => floors[obstacle.f] - 32 + 28 * Math.sin(time * 2.4 + obstacle.phase);
  const laserOn = (obstacle) => (((time + obstacle.phase) % obstacle.period) + obstacle.period) % obstacle.period < obstacle.on;
  const laserWarn = (obstacle) => {
    const t = (((time + obstacle.phase) % obstacle.period) + obstacle.period) % obstacle.period;
    return t >= obstacle.on && t > obstacle.period - 0.45;
  };

  const updateReadouts = () => {
    setText("roundReadout", text.round(round + 1));
    setText("ballReadout", `${balls.filter((ball) => ball.done).length} / ${balls.length}`);
  };

  const burst = (x, y) => {
    for (let index = 0; index < 18; index += 1) {
      const angle = (index / 18) * Math.PI * 2;
      sparks.push({ x, y, vx: Math.cos(angle) * (60 + Math.random() * 140), vy: Math.sin(angle) * (60 + Math.random() * 140), life: 0.7 });
    }
  };

  const die = (ball) => {
    if (!running) return;
    running = false;
    burst(ball.x, ball.y);
    stage.classList.remove("is-dead");
    void stage.offsetWidth;
    stage.classList.add("is-dead");
    setStatus(text.dead, "error");
    startButton.hidden = false;
    startButton.textContent = text.restart;
    window.clearTimeout(pendingTimer);
    pendingTimer = window.setTimeout(() => {
      if (!solved) resetRound(false);
    }, 900);
  };

  const finishRound = () => {
    running = false;
    if (round < 3) {
      setStatus(text.roundDone(round + 1), "success");
      window.clearTimeout(pendingTimer);
      pendingTimer = window.setTimeout(() => {
        round += 1;
        resetRound(true);
      }, 1500);
      return;
    }
    solved = true;
    completed.add(level);
    renderProgress();
    const saved = saveProgress();
    setStatus(saved ? text.success : text.saveError, saved ? "success" : "error");
    setText("systemMessage", text.systemSuccess);
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
    for (let sub = 0; sub < 4; sub += 1) {
      const h = dt / 4;
      balls.forEach((ball) => {
        if (ball.done) {
          ball.fade = Math.min(1, ball.fade + h * 2);
          return;
        }
        ball.vx += gx * h;
        ball.vy += gy * h;
        ball.vx *= 1 - damping * h;
        ball.vx = Math.max(-260, Math.min(260, ball.vx));
        ball.x += ball.vx * h;
        ball.y += ball.vy * h;
        collide(ball);
        if (ball.y > 540 && ball.x > binX) {
          ball.done = true;
          ball.vx = 0;
          ball.vy = 0;
          burst(ball.x, ball.y);
        }
      });
    }
    for (const ball of balls) {
      if (ball.done) continue;
      for (const obstacle of obstacles) {
        const top = floors[obstacle.f];
        if (obstacle.type === "laser") {
          if (laserOn(obstacle) && Math.abs(ball.x - obstacle.x) < R + 2 && ball.y > top - 60 && ball.y < top + 4) {
            die(ball);
            return;
          }
        } else if (Math.hypot(ball.x - obstacle.x, ball.y - sawY(obstacle)) < 12 + R - 3) {
          die(ball);
          return;
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

  const drawBoard = () => {
    ctx.save();
    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, "#0a1230");
    gradient.addColorStop(1, "#150a2e");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(56,242,255,0.07)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y <= H; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    rects.forEach((rect) => {
      const fill = ctx.createLinearGradient(0, rect.y, 0, rect.y + rect.h);
      fill.addColorStop(0, "#38f2ff");
      fill.addColorStop(1, "#1b3a66");
      ctx.fillStyle = fill;
      ctx.shadowColor = "#38f2ff";
      ctx.shadowBlur = 8;
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    });
    ctx.shadowBlur = 0;

    const pulse = 0.5 + 0.5 * Math.sin(time * 4);
    const binTop = 540;
    ctx.fillStyle = `rgba(198,255,77,${0.1 + pulse * 0.12})`;
    ctx.fillRect(binX, binTop - 70, W - binX, H - binTop + 70);
    ctx.strokeStyle = "#c6ff4d";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#c6ff4d";
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(binX, binTop - 20);
    ctx.lineTo(binX, H - 4);
    ctx.lineTo(W, H - 4);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#c6ff4d";
    ctx.font = "bold 11px Orbitron, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(text.bin, (binX + W) / 2, H - 14);
    ctx.fillText("▼", (binX + W) / 2, binTop + 10 + pulse * 6);

    obstacles.forEach((obstacle) => {
      const top = floors[obstacle.f];
      if (obstacle.type === "laser") {
        const on = laserOn(obstacle);
        const warn = laserWarn(obstacle);
        ctx.fillStyle = "#ff4fd8";
        ctx.fillRect(obstacle.x - 6, top - 64, 12, 6);
        ctx.fillRect(obstacle.x - 6, top - 6, 12, 6);
        if (on) {
          ctx.shadowColor = "#ff2f6d";
          ctx.shadowBlur = 16;
          ctx.fillStyle = "#ff3d7f";
          ctx.fillRect(obstacle.x - 2.5, top - 58, 5, 52);
          ctx.shadowBlur = 0;
        } else if (warn && Math.floor(time * 14) % 2 === 0) {
          ctx.fillStyle = "rgba(255,61,127,0.45)";
          ctx.fillRect(obstacle.x - 1, top - 58, 2, 52);
        } else {
          ctx.fillStyle = "rgba(255,79,216,0.15)";
          ctx.fillRect(obstacle.x - 0.5, top - 58, 1, 52);
        }
      } else {
        const y = sawY(obstacle);
        ctx.strokeStyle = "rgba(255,210,77,0.35)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(obstacle.x, top - 80);
        ctx.lineTo(obstacle.x, y);
        ctx.stroke();
        ctx.save();
        ctx.translate(obstacle.x, y);
        ctx.rotate(time * 9);
        ctx.fillStyle = "#ffd24d";
        ctx.shadowColor = "#ff9a3c";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        for (let tooth = 0; tooth < 16; tooth += 1) {
          const angle = (tooth / 16) * Math.PI * 2;
          const radius = tooth % 2 === 0 ? 14 : 9.5;
          ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
        }
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#1b0a2e";
        ctx.beginPath();
        ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });

    balls.forEach((ball) => {
      if (ball.done && ball.fade >= 1) return;
      ctx.globalAlpha = 1 - ball.fade;
      const fill = ctx.createRadialGradient(ball.x - 3, ball.y - 3, 1, ball.x, ball.y, R);
      fill.addColorStop(0, "#ffffff");
      fill.addColorStop(1, `hsl(${ball.hue} 100% 55%)`);
      ctx.fillStyle = fill;
      ctx.shadowColor = `hsl(${ball.hue} 100% 60%)`;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, R, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    });

    sparks.forEach((spark) => {
      ctx.globalAlpha = Math.max(0, spark.life / 0.7);
      ctx.fillStyle = "#ffd24d";
      ctx.fillRect(spark.x - 2, spark.y - 2, 4, 4);
    });
    ctx.globalAlpha = 1;

    ctx.strokeStyle = "#ff4fd8";
    ctx.lineWidth = 2;
    ctx.shadowColor = "#ff4fd8";
    ctx.shadowBlur = 10;
    ctx.strokeRect(0, 0, W, H);
    ctx.restore();
  };

  const render = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((tilt * Math.PI) / 180);
    ctx.translate(-W / 2, -H / 2);
    drawBoard();
    ctx.restore();
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
    render();
    frame = requestAnimationFrame(loop);
  };

  const updateInput = () => {
    input = (held.right ? 1 : 0) - (held.left ? 1 : 0);
    leftButton.classList.toggle("is-held", held.left);
    rightButton.classList.toggle("is-held", held.right);
  };

  function resetRound(autostart) {
    window.clearTimeout(pendingTimer);
    running = false;
    spawnBalls();
    buildObstacles();
    updateReadouts();
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

  canvas.getContext("2d");
  renderProgress();
  fullReset();
  saveProgress();
  last = performance.now();
  frame = requestAnimationFrame(loop);
})();
