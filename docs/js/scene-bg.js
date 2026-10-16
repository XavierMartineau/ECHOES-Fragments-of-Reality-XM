// SCENE BG // arrière-plans animés par partie (canvas 2D), chargé par level-guard.js et niveaux.html.
// Pour ajouter une scène : déclarer une entrée dans SCENES ({ init, draw }) puis la lier dans detect().
(() => {
  if (window.__echoesScene) return;
  window.__echoesScene = true;

  const path = decodeURIComponent(location.pathname);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- Utilitaires -------------------------------------------------------
  const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const A = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  const rng = (a) => () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const pal = (...hex) => hex.map(rgb);

  const PAL = {
    1: pal("#79f7ff", "#b36cff", "#e8ffff"),
    2: pal("#4b9eff", "#d4dce7", "#7ff3ff"),
    3: pal("#ff4fd8", "#a855f7", "#ffe39a"),
    4: pal("#38d6ff", "#bd63ff", "#ffffff"),
    5: pal("#ffb84d", "#ff7a45", "#fff1c4"),
    6: pal("#f5e6a8", "#ffd27a", "#ffffff"),
    7: pal("#ff79d1", "#79a8ff", "#ffd24d"),
    b1: pal("#ff456d", "#8d1dff", "#ffd0a8"),
    b2: pal("#45e5d2", "#ffbd69", "#e6fffb"),
    b3: pal("#ff4fd8", "#ffd24d", "#ffffff"),
  };
  const SIGNS = pal("#4b9eff", "#ff5fa8", "#ffb35c", "#7ff3ff", "#b36cff");
  const RIBBONS = pal("#79f7ff", "#4b9eff", "#ff4fd8", "#38d6ff", "#ffb84d", "#f5e6a8");

  function sky(c, s, top, bottom) {
    const g = c.createLinearGradient(0, 0, 0, s.h);
    g.addColorStop(0, top);
    g.addColorStop(1, bottom);
    c.fillStyle = g;
    c.fillRect(0, 0, s.w, s.h);
  }

  function glow(c, x, y, r, col, a, sx = 1, sy = 1) {
    c.save();
    c.translate(x, y);
    c.scale(sx, sy);
    const g = c.createRadialGradient(0, 0, 0, 0, 0, r);
    g.addColorStop(0, A(col, a));
    g.addColorStop(1, A(col, 0));
    c.fillStyle = g;
    c.fillRect(-r, -r, r * 2, r * 2);
    c.restore();
  }

  function makeStars(s, n, rnd) {
    s.stars = Array.from({ length: Math.round(n * s.k) }, () => ({
      x: rnd() * s.w, y: rnd() * s.h, r: 0.4 + rnd() * 1.1, p: rnd() * 6.28, v: 0.6 + rnd() * 1.6, d: rnd(),
    }));
  }
  function drawStars(c, s, col, maxY = 1) {
    for (const st of s.stars) {
      if (st.y > s.h * maxY) continue;
      const a = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(s.t * st.v + st.p));
      c.fillStyle = A(col, a * (0.5 + st.d * 0.5));
      c.fillRect(st.x + s.mx * 14 * st.d, st.y + s.my * 8 * st.d, st.r, st.r);
    }
  }

  // Sol en perspective façon Tron : lignes qui défilent et se rejoignent à l'horizon.
  function floor(c, s, col, hy, speed, amp = 1) {
    const { w, h } = s;
    const vx = w / 2 + s.mx * w * 0.03;
    const dark = c.createLinearGradient(0, hy, 0, h);
    dark.addColorStop(0, "rgba(3,5,12,0.96)");
    dark.addColorStop(1, "rgba(3,5,12,0.82)");
    c.fillStyle = dark;
    c.fillRect(0, hy, w, h - hy);
    glow(c, vx, hy, w * 0.55, col, 0.35 * amp, 1, 0.22);
    const off = (s.t * speed) % 1;
    for (let i = 0; i < 16; i++) {
      const k = (i + off) / 16;
      const y = hy + (h - hy) * k * k;
      c.strokeStyle = A(col, (0.06 + 0.5 * k) * amp);
      c.lineWidth = 0.5 + k * 1.8;
      c.beginPath();
      c.moveTo(0, y);
      c.lineTo(w, y);
      c.stroke();
    }
    for (let i = -14; i <= 14; i++) {
      c.strokeStyle = A(col, (i === 0 ? 0.5 : 0.24) * amp);
      c.lineWidth = i === 0 ? 1.6 : 1;
      c.beginPath();
      c.moveTo(vx + i * 5, hy);
      c.lineTo(vx + i * w * 0.1, h);
      c.stroke();
    }
    c.strokeStyle = A(col, 0.9 * amp);
    c.lineWidth = 1.4;
    c.beginPath();
    c.moveTo(0, hy);
    c.lineTo(w, hy);
    c.stroke();
    return vx;
  }

  function lane(s, i, k, hy) {
    const vx = s.w / 2 + s.mx * s.w * 0.03;
    const y = hy + (s.h - hy) * k * k;
    const f = k * k;
    return [vx + i * 5 + (i * s.w * 0.1 - i * 5) * f, y];
  }

  function cycles(c, s, hy, cols) {
    for (const m of s.cycles) {
      m.k += s.dt * m.v;
      if (m.k > 1.25) {
        m.k = 0;
        m.lane = Math.round((Math.random() - 0.5) * 20);
      }
      const k = Math.min(1, m.k);
      const k0 = Math.max(0, k - 0.32);
      const [x1, y1] = lane(s, m.lane, k, hy);
      const [x0, y0] = lane(s, m.lane, k0, hy);
      const col = cols[m.c % cols.length];
      const g = c.createLinearGradient(x0, y0, x1, y1);
      g.addColorStop(0, A(col, 0));
      g.addColorStop(1, A(col, 0.95));
      c.strokeStyle = g;
      c.lineWidth = 1 + k * 4;
      c.beginPath();
      c.moveTo(x0, y0);
      c.lineTo(x1, y1);
      c.stroke();
      glow(c, x1, y1, 10 + k * 34, col, 0.55);
    }
  }

  // ---- Scènes ------------------------------------------------------------
  const SCENES = {};

  // Partie 1 // INITIATION : grille Tron, disque d'identité, cycles de lumière.
  SCENES.tron = {
    init(s) {
      const r = rng(11);
      makeStars(s, 90, r);
      s.cycles = Array.from({ length: s.k > 0.7 ? 5 : 3 }, (_, i) => ({ k: r(), lane: Math.round((r() - 0.5) * 20), v: 0.12 + r() * 0.16, c: i }));
    },
    draw(c, s) {
      const [a, b] = s.pal;
      const hy = s.h * 0.6;
      sky(c, s, "#02050c", "#07162a");
      drawStars(c, s, a, 0.6);
      const cx = s.w / 2 + s.mx * 24;
      const R = Math.min(s.w, s.h) * 0.2;
      const cy = hy - R * 0.55;
      c.globalCompositeOperation = "lighter";
      glow(c, cx, cy, R * 2.6, a, 0.22);
      c.strokeStyle = A(a, 0.55);
      c.lineWidth = 1.5;
      c.beginPath();
      c.arc(cx, cy, R, 0, 6.283);
      c.stroke();
      c.strokeStyle = A(b, 0.35);
      c.beginPath();
      c.arc(cx, cy, R * 0.72, 0, 6.283);
      c.stroke();
      for (let i = 0; i < 60; i++) {
        const an = (i / 60) * 6.283 + s.t * 0.12;
        const l = i % 5 === 0 ? 14 : 6;
        c.strokeStyle = A(a, i % 5 === 0 ? 0.6 : 0.28);
        c.beginPath();
        c.moveTo(cx + Math.cos(an) * (R + 6), cy + Math.sin(an) * (R + 6));
        c.lineTo(cx + Math.cos(an) * (R + 6 + l), cy + Math.sin(an) * (R + 6 + l));
        c.stroke();
      }
      c.lineWidth = 3;
      c.strokeStyle = A(s.pal[2], 0.85);
      const sweep = s.t * 0.9;
      c.beginPath();
      c.arc(cx, cy, R * 0.72, sweep, sweep + 0.7);
      c.stroke();
      c.globalCompositeOperation = "source-over";
      const vx = floor(c, s, a, hy, 0.18);
      c.globalCompositeOperation = "lighter";
      cycles(c, s, hy, [a, b, s.pal[2]]);
      c.globalCompositeOperation = "source-over";
      void vx;
    },
  };

  // Partie 2 // FRACTURES : ville sous la pluie, néons, projecteur, spinners.
  function skylineLayer(s, seed, base, minH, maxH, top, bottom, lit, density) {
    const cv = document.createElement("canvas");
    const W = Math.round(s.w * 1.12);
    cv.width = W * s.dpr;
    cv.height = s.h * s.dpr;
    const x2 = cv.getContext("2d");
    x2.scale(s.dpr, s.dpr);
    const r = rng(seed);
    const g = x2.createLinearGradient(0, s.h - base - maxH, 0, s.h);
    g.addColorStop(0, top);
    g.addColorStop(1, bottom);
    let x = -10;
    while (x < W + 10) {
      const bw = 26 + r() * 64;
      const bh = minH + r() * (maxH - minH);
      const y = s.h - base - bh;
      x2.fillStyle = g;
      x2.fillRect(x, y, bw, bh + base);
      x2.fillStyle = A(lit, 0.28);
      x2.fillRect(x, y, bw, 1);
      if (r() > 0.7) x2.fillRect(x + bw * 0.5, y - 14 - r() * 26, 1.5, 40);
      for (let wy = y + 8; wy < s.h - base - 4; wy += 7) {
        for (let wx = x + 5; wx < x + bw - 5; wx += 6) {
          if (r() < density) {
            x2.fillStyle = A(lit, 0.25 + r() * 0.6);
            x2.fillRect(wx, wy, 2, 3);
          }
        }
      }
      x += bw + r() * 5;
    }
    return cv;
  }

  SCENES.city = {
    init(s) {
      const r = rng(23);
      const m = s.h * 0.16;
      s.layers = [
        { cv: skylineLayer(s, 5, m * 1.6, s.h * 0.18, s.h * 0.4, "#13264d", "#070d20", s.pal[2], 0.04), sh: 10 },
        { cv: skylineLayer(s, 9, m * 0.9, s.h * 0.14, s.h * 0.34, "#0b1936", "#050a18", s.pal[0], 0.07), sh: 22 },
        { cv: skylineLayer(s, 17, 0, s.h * 0.1, s.h * 0.26, "#060c1e", "#02040a", s.pal[0], 0.03), sh: 44 },
      ];
      s.rain = Array.from({ length: Math.round(170 * s.k) }, () => ({ x: r() * s.w * 1.2, y: r() * s.h, l: 10 + r() * 20, v: 650 + r() * 700, d: r() }));
      s.signs = Array.from({ length: 7 }, (_, i) => ({
        x: r() * s.w, y: s.h * (0.42 + r() * 0.3), w: r() > 0.5 ? 10 + r() * 8 : 40 + r() * 70, h: r() > 0.5 ? 40 + r() * 70 : 9 + r() * 6,
        c: SIGNS[i % SIGNS.length], p: r() * 10,
      }));
      s.spin = Array.from({ length: 4 }, () => ({ x: r() * s.w, y: s.h * (0.15 + r() * 0.35), v: 30 + r() * 70, d: 0.4 + r() * 0.8, dir: r() > 0.5 ? 1 : -1 }));
      s.fog = Array.from({ length: 4 }, (_, i) => ({ x: r() * s.w, y: s.h * (0.5 + i * 0.1), v: 6 + r() * 10, c: i % 2 }));
    },
    draw(c, s) {
      sky(c, s, "#050b1d", "#16264a");
      glow(c, s.w * 0.7, s.h * 0.62, s.w * 0.6, s.pal[0], 0.2, 1, 0.5);
      glow(c, s.w * 0.15, s.h * 0.55, s.w * 0.4, SIGNS[1], 0.12, 1, 0.6);
      c.drawImage(s.layers[0].cv, -s.w * 0.06 + s.mx * s.layers[0].sh, s.my * 4, s.w * 1.12, s.h);
      c.globalCompositeOperation = "lighter";
      for (const f of s.fog) {
        f.x = (f.x + f.v * s.dt) % (s.w * 1.6);
        glow(c, f.x - s.w * 0.3, f.y, s.w * 0.45, s.pal[f.c], 0.09, 1, 0.22);
      }
      const ang = Math.sin(s.t * 0.25) * 0.5;
      c.save();
      c.translate(s.w * 0.12, s.h);
      c.rotate(-0.9 + ang);
      const beam = c.createLinearGradient(0, 0, 0, -s.h * 1.3);
      beam.addColorStop(0, A(s.pal[2], 0.3));
      beam.addColorStop(1, A(s.pal[2], 0));
      c.fillStyle = beam;
      c.beginPath();
      c.moveTo(-6, 0);
      c.lineTo(6, 0);
      c.lineTo(120, -s.h * 1.3);
      c.lineTo(-120, -s.h * 1.3);
      c.fill();
      c.restore();
      c.globalCompositeOperation = "source-over";
      c.drawImage(s.layers[1].cv, -s.w * 0.06 + s.mx * s.layers[1].sh, s.my * 8, s.w * 1.12, s.h);
      c.globalCompositeOperation = "lighter";
      for (const g of s.signs) {
        const flick = Math.sin(s.t * 2.3 + g.p) > 0.93 ? 0.25 : 1;
        const x = g.x + s.mx * 22;
        c.fillStyle = A(g.c, 0.05 * flick);
        c.fillRect(x - 14, g.y - 14, g.w + 28, g.h + 28);
        c.fillStyle = A(g.c, 0.14 * flick);
        c.fillRect(x - 6, g.y - 6, g.w + 12, g.h + 12);
        c.fillStyle = A(g.c, 0.8 * flick);
        c.fillRect(x, g.y, g.w, g.h);
      }
      for (const p of s.spin) {
        p.x += p.v * p.dir * s.dt;
        if (p.x > s.w + 80) p.x = -80;
        if (p.x < -80) p.x = s.w + 80;
        const tr = c.createLinearGradient(p.x, 0, p.x - p.dir * 60 * p.d, 0);
        tr.addColorStop(0, A(s.pal[2], 0.7));
        tr.addColorStop(1, A(s.pal[2], 0));
        c.fillStyle = tr;
        c.fillRect(Math.min(p.x, p.x - p.dir * 60 * p.d), p.y, 60 * p.d, 1.6);
        c.fillStyle = Math.sin(s.t * 6 + p.x) > 0 ? A(SIGNS[1], 0.9) : A(s.pal[2], 0.9);
        c.fillRect(p.x, p.y - 1, 3 * p.d + 1, 3 * p.d + 1);
      }
      c.globalCompositeOperation = "source-over";
      c.drawImage(s.layers[2].cv, -s.w * 0.06 + s.mx * s.layers[2].sh, s.my * 14, s.w * 1.12, s.h);
      const wet = c.createLinearGradient(0, s.h * 0.82, 0, s.h);
      wet.addColorStop(0, "rgba(2,4,10,0)");
      wet.addColorStop(1, A(s.pal[0], 0.16));
      c.fillStyle = wet;
      c.fillRect(0, s.h * 0.82, s.w, s.h * 0.18);
      c.lineCap = "round";
      for (const pass of [0, 1]) {
        c.strokeStyle = A(s.pal[1], pass ? 0.34 : 0.14);
        c.lineWidth = pass ? 1.2 : 0.8;
        c.beginPath();
        for (const d of s.rain) {
          if (pass !== (d.d > 0.6 ? 1 : 0)) continue;
          c.moveTo(d.x, d.y);
          c.lineTo(d.x + d.l * 0.2, d.y - d.l);
        }
        c.stroke();
      }
      for (const d of s.rain) {
        d.y += d.v * s.dt;
        d.x -= d.v * s.dt * 0.2;
        if (d.y > s.h + 30) {
          d.y = -30;
          d.x = Math.random() * s.w * 1.2;
        }
      }
    },
  };

  // Partie 3 // ÉCLIPSE : soleil noir, couronne, éclats flottants, glitchs.
  SCENES.eclipse = {
    init(s) {
      const r = rng(31);
      makeStars(s, 110, r);
      s.shards = Array.from({ length: Math.round(26 * s.k) }, () => ({
        x: r() * s.w, y: r() * s.h, sz: 10 + r() * 46, a: r() * 6.28, va: (r() - 0.5) * 0.4, vy: -6 - r() * 16, d: 0.3 + r() * 0.9, c: r() > 0.5 ? 0 : 1,
      }));
      s.rays = Array.from({ length: 44 }, () => ({ a: r() * 6.28, l: 0.4 + r() * 1.8, p: r() * 6, w: 0.01 + r() * 0.03 }));
      s.glitch = { next: 2, until: 0, bands: [] };
    },
    draw(c, s) {
      const [a, b, gold] = s.pal;
      sky(c, s, "#06020f", "#150826");
      drawStars(c, s, gold);
      const cx = s.w / 2 + s.mx * 30;
      const cy = s.h * 0.36 + s.my * 14;
      const R = Math.min(s.w, s.h) * 0.17;
      c.globalCompositeOperation = "lighter";
      const pulse = 0.85 + 0.15 * Math.sin(s.t * 0.9);
      glow(c, cx, cy, R * 4.2, b, 0.3 * pulse);
      glow(c, cx, cy, R * 2.3, a, 0.42 * pulse);
      c.save();
      c.translate(cx, cy);
      c.rotate(s.t * 0.03);
      for (const ry of s.rays) {
        const len = R * (1.15 + ry.l * (0.7 + 0.3 * Math.sin(s.t * 0.7 + ry.p)));
        const g = c.createLinearGradient(R, 0, len * 1.6, 0);
        g.addColorStop(0, A(a, 0.32));
        g.addColorStop(1, A(a, 0));
        c.save();
        c.rotate(ry.a);
        c.fillStyle = g;
        c.beginPath();
        c.moveTo(R * 0.95, -R * ry.w);
        c.lineTo(len * 1.6, 0);
        c.lineTo(R * 0.95, R * ry.w);
        c.fill();
        c.restore();
      }
      c.restore();
      c.globalCompositeOperation = "source-over";
      c.fillStyle = "#02000a";
      c.beginPath();
      c.arc(cx, cy, R, 0, 6.283);
      c.fill();
      c.globalCompositeOperation = "lighter";
      c.lineCap = "round";
      const rot = s.t * 0.18;
      for (const [lw, al] of [[10, 0.12], [4, 0.45], [1.5, 1]]) {
        c.strokeStyle = A(lw === 1.5 ? gold : a, al);
        c.lineWidth = lw;
        c.beginPath();
        c.arc(cx, cy, R + 1, rot, rot + 1.1);
        c.stroke();
      }
      c.strokeStyle = A(a, 0.5);
      c.lineWidth = 1;
      c.beginPath();
      c.arc(cx, cy, R + 1, 0, 6.283);
      c.stroke();
      for (const sh of s.shards) {
        sh.y += sh.vy * sh.d * s.dt;
        sh.a += sh.va * s.dt;
        if (sh.y < -60) {
          sh.y = s.h + 60;
          sh.x = Math.random() * s.w;
        }
        c.save();
        c.translate(sh.x + s.mx * 30 * sh.d, sh.y + s.my * 16 * sh.d);
        c.rotate(sh.a);
        c.strokeStyle = A(s.pal[sh.c], 0.3 * sh.d + 0.1);
        c.fillStyle = A(s.pal[sh.c], 0.04);
        c.lineWidth = 1;
        c.beginPath();
        c.moveTo(-sh.sz * 0.5, -sh.sz * 0.2);
        c.lineTo(sh.sz * 0.3, -sh.sz * 0.5);
        c.lineTo(sh.sz * 0.5, sh.sz * 0.3);
        c.lineTo(-sh.sz * 0.2, sh.sz * 0.5);
        c.closePath();
        c.fill();
        c.stroke();
        c.restore();
      }
      c.globalCompositeOperation = "source-over";
      floor(c, s, a, s.h * 0.84, 0.1, 0.55);
      const gl = s.glitch;
      if (s.t > gl.next) {
        gl.until = s.t + 0.28;
        gl.next = s.t + 2.5 + Math.random() * 4;
        gl.bands = Array.from({ length: 5 }, () => ({ y: Math.random() * s.h, h: 2 + Math.random() * 26, dx: (Math.random() - 0.5) * 60, c: Math.random() > 0.5 ? 0 : 1 }));
      }
      if (s.t < gl.until) {
        c.globalCompositeOperation = "lighter";
        for (const g of gl.bands) {
          c.fillStyle = A(s.pal[g.c], 0.13);
          c.fillRect(g.dx, g.y, s.w, g.h);
          c.fillStyle = A(gold, 0.5);
          c.fillRect(g.dx, g.y, s.w * 0.35, 1);
        }
        c.globalCompositeOperation = "source-over";
      }
    },
  };

  // Partie 4 // RÉSONANCE : ondes concentriques, oscilloscope, réseau de nœuds.
  SCENES.resonance = {
    init(s) {
      const r = rng(41);
      s.nodes = Array.from({ length: Math.round(52 * s.k) }, () => ({ x: r() * s.w, y: r() * s.h, vx: (r() - 0.5) * 18, vy: (r() - 0.5) * 18 }));
    },
    draw(c, s) {
      const [a, b, w] = s.pal;
      sky(c, s, "#030812", "#0a0f2a");
      const cx = s.w / 2 + s.mx * 20;
      const cy = s.h * 0.5 + s.my * 10;
      const maxR = Math.hypot(s.w, s.h) * 0.55;
      c.globalCompositeOperation = "lighter";
      glow(c, cx, cy, maxR * 0.7, a, 0.12);
      for (let i = 0; i < 7; i++) {
        const k = (s.t * 0.07 + i / 7) % 1;
        c.strokeStyle = A(i % 2 ? b : a, (1 - k) * 0.45);
        c.lineWidth = 1 + (1 - k) * 2;
        c.setLineDash(i % 2 ? [3, 9] : []);
        c.lineDashOffset = -s.t * 18;
        c.beginPath();
        c.arc(cx, cy, k * maxR, 0, 6.283);
        c.stroke();
      }
      c.setLineDash([]);
      for (let j = 0; j < 3; j++) {
        c.strokeStyle = A(j === 1 ? b : a, j === 1 ? 0.55 : 0.4);
        c.lineWidth = j === 1 ? 2 : 1.2;
        c.beginPath();
        for (let x = 0; x <= s.w; x += 8) {
          const u = x / s.w;
          const env = Math.sin(u * Math.PI) ** 1.5;
          const y = cy + env * s.h * 0.11 * (Math.sin(u * 14 + s.t * (1.1 + j * 0.5) + j) + 0.5 * Math.sin(u * 31 - s.t * 1.7) + 0.3 * Math.sin(u * 5 + s.t * 0.6));
          x ? c.lineTo(x, y) : c.moveTo(x, y);
        }
        c.stroke();
      }
      for (const n of s.nodes) {
        n.x += n.vx * s.dt;
        n.y += n.vy * s.dt;
        if (n.x < 0 || n.x > s.w) n.vx *= -1;
        if (n.y < 0 || n.y > s.h) n.vy *= -1;
      }
      c.lineWidth = 1;
      const lim = 150;
      for (let i = 0; i < s.nodes.length; i++) {
        const p = s.nodes[i];
        for (let j = i + 1; j < s.nodes.length; j++) {
          const q = s.nodes[j];
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < lim) {
            c.strokeStyle = A(a, (1 - d / lim) * 0.28);
            c.beginPath();
            c.moveTo(p.x, p.y);
            c.lineTo(q.x, q.y);
            c.stroke();
          }
        }
        c.fillStyle = A(w, 0.65);
        c.fillRect(p.x - 1, p.y - 1, 2.4, 2.4);
      }
      c.globalCompositeOperation = "source-over";
    },
  };

  // Partie 5 // CONVERGENCE : tunnel de distorsion, traînées d'étoiles, reflet anamorphique.
  SCENES.warp = {
    init(s) {
      const r = rng(51);
      s.warp = Array.from({ length: Math.round(170 * s.k) }, () => ({ a: r() * 6.283, r: r(), v: 0.18 + r() * 0.5, c: r() > 0.7 ? 1 : 0 }));
    },
    draw(c, s) {
      const [a, b, w] = s.pal;
      sky(c, s, "#0a0402", "#1a0c06");
      const cx = s.w / 2 + s.mx * 40;
      const cy = s.h / 2 + s.my * 24;
      const maxR = Math.hypot(s.w, s.h) * 0.6;
      c.globalCompositeOperation = "lighter";
      glow(c, cx, cy, maxR * 0.55, a, 0.3 + 0.08 * Math.sin(s.t * 1.6));
      for (let i = 0; i < 9; i++) {
        const k = (s.t * 0.14 + i / 9) % 1;
        const sc = k * k;
        const hw = (s.w * 0.9 * sc) / 2 + 4;
        const hh = (s.h * 0.9 * sc) / 2 + 3;
        c.strokeStyle = A(i % 3 ? a : b, Math.sin(k * Math.PI) * 0.45);
        c.lineWidth = 0.8 + sc * 2.4;
        c.strokeRect(cx - hw, cy - hh, hw * 2, hh * 2);
      }
      for (const st of s.warp) {
        const r0 = st.r;
        st.r += s.dt * st.v * (0.25 + r0 * 1.6);
        if (st.r > 1) {
          st.r = 0.01;
          st.a = Math.random() * 6.283;
        }
        const d1 = r0 * r0 * maxR;
        const d2 = st.r * st.r * maxR;
        const cs = Math.cos(st.a);
        const sn = Math.sin(st.a);
        c.strokeStyle = A(st.c ? b : w, 0.15 + st.r * 0.7);
        c.lineWidth = 0.5 + st.r * 1.8;
        c.beginPath();
        c.moveTo(cx + cs * d1, cy + sn * d1);
        c.lineTo(cx + cs * d2, cy + sn * d2);
        c.stroke();
      }
      const fl = c.createLinearGradient(0, 0, s.w, 0);
      fl.addColorStop(0, A(a, 0));
      fl.addColorStop(0.5, A(w, 0.5));
      fl.addColorStop(1, A(a, 0));
      c.fillStyle = fl;
      c.fillRect(0, cy - 1, s.w, 2);
      glow(c, cx, cy, 70, w, 0.55);
      c.globalCompositeOperation = "source-over";
    },
  };

  // Partie 6 // ORIGINE : nébuleuse dorée, orbites, rayons verticaux, poussière.
  SCENES.origin = {
    init(s) {
      const r = rng(61);
      makeStars(s, 150, r);
      s.neb = Array.from({ length: 5 }, (_, i) => ({ x: r() * s.w, y: r() * s.h, r: s.w * (0.3 + r() * 0.3), v: 4 + r() * 8, p: r() * 6, c: i % 3 }));
      s.dust = Array.from({ length: Math.round(48 * s.k) }, () => ({ x: r() * s.w, y: r() * s.h, v: 8 + r() * 22, z: r() }));
    },
    draw(c, s) {
      const [a, b, w] = s.pal;
      sky(c, s, "#0a0714", "#17101f");
      c.globalCompositeOperation = "lighter";
      for (const n of s.neb) {
        const x = n.x + Math.sin(s.t * 0.05 + n.p) * 80 + s.mx * 20;
        glow(c, x, n.y + Math.cos(s.t * 0.04 + n.p) * 50, n.r, s.pal[n.c], 0.14);
      }
      c.globalCompositeOperation = "source-over";
      drawStars(c, s, w);
      c.globalCompositeOperation = "lighter";
      for (let i = 0; i < 5; i++) {
        const x = s.w * (0.12 + i * 0.19) + Math.sin(s.t * 0.2 + i) * 30;
        const g = c.createLinearGradient(0, 0, 0, s.h);
        g.addColorStop(0, A(i % 2 ? b : a, 0.14 * (0.6 + 0.4 * Math.sin(s.t * 0.5 + i * 1.7))));
        g.addColorStop(1, A(a, 0));
        c.fillStyle = g;
        c.beginPath();
        c.moveTo(x - 4, 0);
        c.lineTo(x + 4, 0);
        c.lineTo(x + 70, s.h);
        c.lineTo(x - 70, s.h);
        c.fill();
      }
      const cx = s.w / 2 + s.mx * 16;
      const cy = s.h * 0.5 + s.my * 10;
      for (let i = 0; i < 3; i++) {
        const rx = s.w * (0.22 + i * 0.12);
        const ry = rx * 0.32;
        const tilt = -0.35 + i * 0.3 + s.t * 0.01 * (i + 1);
        c.save();
        c.translate(cx, cy);
        c.rotate(tilt);
        c.strokeStyle = A(i === 1 ? b : a, 0.28);
        c.lineWidth = 1;
        c.beginPath();
        c.ellipse(0, 0, rx, ry, 0, 0, 6.283);
        c.stroke();
        const an = s.t * (0.25 - i * 0.05) + i * 2;
        glow(c, Math.cos(an) * rx, Math.sin(an) * ry, 16, w, 0.8);
        c.restore();
      }
      glow(c, cx, cy, 90, w, 0.35);
      for (const d of s.dust) {
        d.y -= d.v * s.dt;
        if (d.y < -4) {
          d.y = s.h + 4;
          d.x = Math.random() * s.w;
        }
        c.fillStyle = A(a, 0.25 + d.z * 0.5);
        c.fillRect(d.x + s.mx * 20 * d.z, d.y, 1 + d.z * 1.5, 1 + d.z * 1.5);
      }
      c.globalCompositeOperation = "source-over";
    },
  };

  // Boss : grille d'alerte, anneau d'avertissement, braises, éclairs, pouls.
  SCENES.boss = {
    init(s) {
      const r = rng(71);
      s.embers = Array.from({ length: Math.round(80 * s.k) }, () => ({ x: r() * s.w, y: r() * s.h, v: 20 + r() * 60, z: r(), p: r() * 6 }));
      s.bolt = { next: 3, until: 0, pts: [], flash: 0 };
    },
    draw(c, s) {
      const [a, b, w] = s.pal;
      const hy = s.h * 0.66;
      sky(c, s, "#06020a", "#14060f");
      const beat = Math.max(0, Math.sin(s.t * 2.4)) ** 4;
      c.globalCompositeOperation = "lighter";
      glow(c, s.w / 2, s.h * 0.4, s.w * 0.6, b, 0.2 + beat * 0.1, 1, 0.7);
      const cx = s.w / 2 + s.mx * 20;
      const cy = s.h * 0.38;
      const R = Math.min(s.w, s.h) * 0.2;
      c.strokeStyle = A(a, 0.5 + beat * 0.3);
      c.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        c.beginPath();
        c.arc(cx, cy, R * (1 + i * 0.001), s.t * 0.4 + (i * 6.283) / 6, s.t * 0.4 + (i * 6.283) / 6 + 0.75);
        c.stroke();
      }
      c.strokeStyle = A(b, 0.45);
      c.lineWidth = 1;
      c.beginPath();
      for (let i = 0; i <= 6; i++) {
        const an = (i / 6) * 6.283 - s.t * 0.25;
        const px = cx + Math.cos(an) * R * 0.78;
        const py = cy + Math.sin(an) * R * 0.78;
        i ? c.lineTo(px, py) : c.moveTo(px, py);
      }
      c.stroke();
      glow(c, cx, cy, R * 0.9, a, 0.16 + beat * 0.2);
      c.globalCompositeOperation = "source-over";
      floor(c, s, a, hy, 0.3, 0.9);
      c.globalCompositeOperation = "lighter";
      for (const e of s.embers) {
        e.y -= e.v * s.dt;
        if (e.y < -6) {
          e.y = s.h + 6;
          e.x = Math.random() * s.w;
        }
        const f = 0.5 + 0.5 * Math.sin(s.t * 4 + e.p);
        c.fillStyle = A(e.z > 0.6 ? w : a, (0.2 + e.z * 0.6) * f);
        c.fillRect(e.x + Math.sin(s.t + e.p) * 8, e.y, 1 + e.z * 2, 1 + e.z * 2);
      }
      const bt = s.bolt;
      if (s.t > bt.next) {
        bt.until = s.t + 0.22;
        bt.next = s.t + 4 + Math.random() * 6;
        let x = Math.random() * s.w;
        bt.pts = [[x, 0]];
        for (let y = 0; y < hy; y += 40) {
          x += (Math.random() - 0.5) * 70;
          bt.pts.push([x, y + 40]);
        }
      }
      if (s.t < bt.until) {
        const k = (bt.until - s.t) / 0.22;
        c.fillStyle = A(a, 0.1 * k);
        c.fillRect(0, 0, s.w, s.h);
        c.lineJoin = "round";
        for (const [lw, al, col] of [[8, 0.18, a], [2, 0.95, w]]) {
          c.strokeStyle = A(col, al * k);
          c.lineWidth = lw;
          c.beginPath();
          bt.pts.forEach(([px, py], i) => (i ? c.lineTo(px, py) : c.moveTo(px, py)));
          c.stroke();
        }
      }
      c.globalCompositeOperation = "source-over";
      const edge = c.createRadialGradient(s.w / 2, s.h / 2, s.h * 0.35, s.w / 2, s.h / 2, Math.hypot(s.w, s.h) * 0.6);
      edge.addColorStop(0, A(a, 0));
      edge.addColorStop(1, A(a, 0.1 + beat * 0.2));
      c.fillStyle = edge;
      c.fillRect(0, 0, s.w, s.h);
      c.save();
      c.beginPath();
      c.rect(0, s.h - 14, s.w, 8);
      c.clip();
      c.fillStyle = A(a, 0.3);
      for (let x = -40 + ((s.t * 30) % 40); x < s.w + 40; x += 40) {
        c.beginPath();
        c.moveTo(x, s.h - 6);
        c.lineTo(x + 14, s.h - 14);
        c.lineTo(x + 26, s.h - 14);
        c.lineTo(x + 12, s.h - 6);
        c.fill();
      }
      c.restore();
    },
  };

  // Hub de campagne : rubans d'aurore aux couleurs des six parties, étoiles, grille lointaine.
  SCENES.hub = {
    init(s) {
      makeStars(s, 160, rng(81));
    },
    draw(c, s) {
      sky(c, s, "#030610", "#0a0c20");
      drawStars(c, s, s.pal[2]);
      c.globalCompositeOperation = "lighter";
      RIBBONS.forEach((col, j) => {
        const base = s.h * (0.14 + j * 0.12);
        const th = s.h * 0.07;
        const g = c.createLinearGradient(0, base - th * 2, 0, base + th * 2);
        g.addColorStop(0, A(col, 0));
        g.addColorStop(0.5, A(col, 0.13));
        g.addColorStop(1, A(col, 0));
        c.fillStyle = g;
        c.beginPath();
        const ys = [];
        for (let x = 0; x <= s.w + 24; x += 24) {
          const y = base + Math.sin(x * 0.0038 + s.t * 0.28 + j * 1.3) * s.h * 0.07 + Math.sin(x * 0.011 - s.t * 0.17 * (j + 1)) * s.h * 0.02 + s.my * 8;
          ys.push([x + s.mx * 14 * (j % 3), y]);
        }
        ys.forEach(([x, y], i) => (i ? c.lineTo(x, y - th * (1.4 + Math.sin(x * 0.01 + s.t))) : c.moveTo(x, y - th)));
        for (let i = ys.length - 1; i >= 0; i--) c.lineTo(ys[i][0], ys[i][1] + th * 1.6);
        c.fill();
        c.strokeStyle = A(col, 0.22);
        c.lineWidth = 1.2;
        c.beginPath();
        ys.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
        c.stroke();
      });
      c.globalCompositeOperation = "source-over";
      floor(c, s, s.pal[0], s.h * 0.78, 0.07, 0.45);
    },
  };

  // ---- Détection de la scène ---------------------------------------------
  function detect() {
    const boss = path.match(/boss-0?(\d)/i);
    if (boss) return { name: "boss", pal: PAL[`b${boss[1]}`] || PAL.b1, rgb: "255,69,109" };
    if (/niveaux\.html/i.test(path)) return { name: "hub", pal: PAL[1], rgb: "121,247,255" };
    if (/partie-bonus/i.test(path)) return { name: "origin", pal: PAL[7], rgb: "255,121,209" };
    const part = Number((path.match(/partie-(\d)/i) || [])[1]);
    const byPart = { 1: "tron", 2: "city", 3: "eclipse", 4: "resonance", 5: "warp", 6: "origin" };
    if (!byPart[part]) return null;
    return { name: byPart[part], pal: PAL[part], rgb: PAL[part][0].join(",") };
  }

  const found = detect();
  if (!found) return;
  const scene = SCENES[found.name];

  const style = document.createElement("style");
  style.textContent = `
    .background-glow,.grid-overlay,.echo-ambient-field,.hub-background{display:none!important}
    body::before{display:none!important}
    #echoes-scene{position:fixed;inset:0;z-index:-1;overflow:hidden;pointer-events:none;background:#04060e;--sb-rgb:${found.rgb}}
    #echoes-scene canvas{position:absolute;inset:0;width:100%;height:100%;animation:sb-fade 1.4s ease-out both}
    #echoes-scene .sb-vig{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 45%,rgba(3,5,12,.34),transparent 60%),radial-gradient(ellipse at center,transparent 42%,rgba(0,0,0,.78) 100%)}
    #echoes-scene .sb-scan{position:absolute;inset:0;background:repeating-linear-gradient(to bottom,rgba(255,255,255,.03) 0 1px,transparent 1px 3px);mix-blend-mode:overlay}
    #echoes-scene .sb-bar{position:absolute;left:0;right:0;top:-24vh;height:22vh;background:linear-gradient(to bottom,transparent,rgba(var(--sb-rgb),.08),transparent);animation:sb-bar 10s linear infinite}
    .sb-reveal{position:fixed;inset:0;z-index:99999;pointer-events:none;background:#04060e;animation:sb-wipe .9s cubic-bezier(.65,0,.25,1) forwards}
    .sb-reveal i{position:absolute;top:0;bottom:0;width:2px;left:0;background:rgb(${found.rgb});box-shadow:0 0 18px 4px rgba(${found.rgb},.8),0 0 60px 14px rgba(${found.rgb},.35);animation:sb-line .9s cubic-bezier(.65,0,.25,1) forwards}
    @keyframes sb-fade{from{opacity:0}to{opacity:1}}
    @keyframes sb-bar{to{transform:translateY(145vh)}}
    @keyframes sb-wipe{from{clip-path:inset(0 0 0 0)}to{clip-path:inset(0 0 0 100%)}}
    @keyframes sb-line{from{left:0}to{left:100%}}
    @media (prefers-reduced-motion:reduce){.sb-bar,.sb-reveal{display:none}}
  `;
  document.head.appendChild(style);

  const wrap = document.createElement("div");
  wrap.id = "echoes-scene";
  wrap.setAttribute("aria-hidden", "true");
  const canvas = document.createElement("canvas");
  wrap.appendChild(canvas);
  ["sb-vig", "sb-scan", "sb-bar"].forEach((cls) => {
    const d = document.createElement("div");
    d.className = cls;
    wrap.appendChild(d);
  });
  document.body.prepend(wrap);

  if (!reduceMotion) {
    const reveal = document.createElement("div");
    reveal.className = "sb-reveal";
    reveal.innerHTML = "<i></i>";
    document.body.appendChild(reveal);
    const drop = () => reveal.remove();
    reveal.addEventListener("animationend", (e) => e.target === reveal && drop());
    setTimeout(drop, 1600);
  }

  const c = canvas.getContext("2d");
  const s = { w: 0, h: 0, dpr: 1, k: 1, t: 0, dt: 0.016, mx: 0, my: 0, pal: found.pal };
  let tx = 0;
  let ty = 0;
  let lastMove = -10;

  function resize() {
    s.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    s.w = window.innerWidth;
    s.h = window.innerHeight;
    s.k = s.w < 700 ? 0.55 : 1;
    canvas.width = Math.round(s.w * s.dpr);
    canvas.height = Math.round(s.h * s.dpr);
    c.setTransform(s.dpr, 0, 0, s.dpr, 0, 0);
    scene.init(s);
    render();
  }

  function render() {
    c.globalCompositeOperation = "source-over";
    scene.draw(c, s);
    c.globalCompositeOperation = "lighter";
    glow(c, (s.mx * 0.5 + 0.5) * s.w, (s.my * 0.5 + 0.5) * s.h, 260, s.pal[0], 0.1);
    c.globalCompositeOperation = "source-over";
  }

  window.addEventListener("pointermove", (e) => {
    tx = (e.clientX / s.w) * 2 - 1;
    ty = (e.clientY / s.h) * 2 - 1;
    lastMove = s.t;
  }, { passive: true });

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });

  let last = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    if (document.hidden) return;
    const gap = s.w < 800 ? 30 : 14;
    if (now - last < gap) return;
    s.dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    s.t += s.dt;
    if (s.t - lastMove > 4) {
      tx = Math.sin(s.t * 0.11) * 0.35;
      ty = Math.cos(s.t * 0.09) * 0.2;
    }
    s.mx += (tx - s.mx) * Math.min(1, s.dt * 3);
    s.my += (ty - s.my) * Math.min(1, s.dt * 3);
    render();
  }

  resize();
  if (!reduceMotion) requestAnimationFrame(frame);
})();
