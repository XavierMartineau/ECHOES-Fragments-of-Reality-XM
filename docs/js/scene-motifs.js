// SCENE MOTIFS // un univers visuel par puzzle (niveaux 1 à 40) et par boss.
// Chaque motif illustre ce que le joueur résout ; la richesse monte avec la progression :
//   tier 1 (1-10) épuré · tier 2 (11-20) cadre HUD · tier 3 (21-30) poussière de profondeur · tier 4 (31-40, boss) fuites de lumière.
// Pour un nouveau niveau : ajouter une ligne dans LEVELS (palette + motif + options).
(() => {
  const TAU = Math.PI * 2;
  const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  const lerp = (a, b, t) => a + (b - a) * t;
  const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const sm = (x) => x * x * (3 - 2 * x);
  const bp = (t, sp, ph = 0) => 0.5 + 0.5 * Math.sin(t * sp + ph);
  const rng = (a) => () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const hash = (i, j) => {
    const v = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
    return v - Math.floor(v);
  };
  const cnt = (s, n) => Math.max(3, Math.round(n * s.k * (0.7 + s.rich * 0.6)));

  function ln(c, x1, y1, x2, y2, col, a, w = 1) {
    c.strokeStyle = A(col, a);
    c.lineWidth = w;
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x2, y2);
    c.stroke();
  }
  function ring(c, x, y, r, col, a, w = 1, a0 = 0, a1 = TAU) {
    c.strokeStyle = A(col, a);
    c.lineWidth = w;
    c.beginPath();
    c.arc(x, y, Math.max(0.1, r), a0, a1);
    c.stroke();
  }
  function dot(c, x, y, r, col, a) {
    c.fillStyle = A(col, a);
    c.beginPath();
    c.arc(x, y, Math.max(0.1, r), 0, TAU);
    c.fill();
  }
  function poly(c, x, y, r, n, rot, col, a, w = 1) {
    c.strokeStyle = A(col, a);
    c.lineWidth = w;
    c.beginPath();
    for (let i = 0; i <= n; i++) {
      const an = rot + (i / n) * TAU;
      i ? c.lineTo(x + Math.cos(an) * r, y + Math.sin(an) * r) : c.moveTo(x + Math.cos(an) * r, y + Math.sin(an) * r);
    }
    c.stroke();
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
  function sky(c, s, top, bottom) {
    const g = c.createLinearGradient(0, 0, 0, s.h);
    g.addColorStop(0, top);
    g.addColorStop(1, bottom);
    c.fillStyle = g;
    c.fillRect(0, 0, s.w, s.h);
  }
  function stars(c, s, col, n = 90) {
    if (!s.m.st) {
      const r = rng(5);
      s.m.st = Array.from({ length: Math.round(n * s.k) }, () => ({ x: r() * s.w, y: r() * s.h, p: r() * 6, d: r() }));
    }
    for (const st of s.m.st) {
      c.fillStyle = A(col, (0.2 + 0.5 * bp(s.t, 1 + st.d, st.p)) * (0.4 + st.d * 0.6));
      c.fillRect(st.x + s.mx * 12 * st.d, st.y + s.my * 7 * st.d, 1.2, 1.2);
    }
  }
  function rot3(x, y, z, ax, ay) {
    const c1 = Math.cos(ay), s1 = Math.sin(ay);
    const x1 = x * c1 + z * s1;
    const z1 = -x * s1 + z * c1;
    const c2 = Math.cos(ax), s2 = Math.sin(ax);
    return [x1, y * c2 - z1 * s2, y * s2 + z1 * c2];
  }
  const proj = (x, y, z, cx, cy, f) => {
    const k = f / (f + z);
    return [cx + x * k, cy + y * k, k];
  };
  function floorGrid(c, s, col, hy, speed, amp = 1) {
    const { w, h } = s;
    const vx = w / 2 + s.mx * w * 0.03;
    const dark = c.createLinearGradient(0, hy, 0, h);
    dark.addColorStop(0, "rgba(3,5,12,0.92)");
    dark.addColorStop(1, "rgba(3,5,12,0.8)");
    c.fillStyle = dark;
    c.fillRect(0, hy, w, h - hy);
    glow(c, vx, hy, w * 0.5, col, 0.28 * amp, 1, 0.22);
    const off = (s.t * speed) % 1;
    for (let i = 0; i < 14; i++) {
      const k = (i + off) / 14;
      ln(c, 0, hy + (h - hy) * k * k, w, hy + (h - hy) * k * k, col, (0.05 + 0.45 * k) * amp, 0.5 + k * 1.6);
    }
    for (let i = -12; i <= 12; i++) ln(c, vx + i * 5, hy, vx + i * w * 0.1, h, col, (i === 0 ? 0.45 : 0.2) * amp, 1);
    ln(c, 0, hy, w, hy, col, 0.85 * amp, 1.3);
  }

  const M = {};

  // ---- Géométrie / logique ------------------------------------------------
  // Alignement : un réseau de points se met en ordre sur des axes, puis se verrouille.
  M.align = (o = {}) => ({
    draw(c, s) {
      const [a, b, w] = s.pal;
      const g = Math.min(s.w, s.h) / 8.5;
      const cx = s.w / 2 + s.mx * 10;
      const cy = s.h / 2 + s.my * 6;
      const nx = Math.ceil(s.w / g / 2) + 1;
      const ny = Math.ceil(s.h / g / 2) + 1;
      const conv = sm(cl(0.5 + 0.8 * Math.sin(s.t * 0.45)));
      const off = (1 - conv) * g * 0.42;
      for (let i = -nx; i <= nx; i++) {
        for (let j = -ny; j <= ny; j++) {
          const ph = hash(i, j);
          const x = cx + i * g + Math.sin(s.t * 0.7 + ph * 9) * off;
          const y = cy + j * g + Math.cos(s.t * 0.6 + ph * 7) * off;
          const ax = i === 0 || j === 0;
          dot(c, x, y, ax ? 2.2 : 1.5, ax ? w : a, 0.2 + conv * (ax ? 0.7 : 0.4));
          if (o.dual) dot(c, x + g / 2, y + g / 2, 1.3, b, 0.18 + conv * 0.4);
        }
      }
      ln(c, 0, cy, s.w, cy, a, 0.06 + conv * 0.45, 1.2);
      ln(c, cx, 0, cx, s.h, a, 0.06 + conv * 0.45, 1.2);
      if (o.dual) {
        ln(c, 0, cy + g / 2, s.w, cy + g / 2, b, 0.04 + conv * 0.3, 1);
        ln(c, cx + g / 2, 0, cx + g / 2, s.h, b, 0.04 + conv * 0.3, 1);
      }
      ring(c, cx, cy, g * (0.9 + 0.08 * Math.sin(s.t)), w, 0.2 + conv * 0.6, 1.4);
      ring(c, cx, cy, g * 1.5, b, 0.12 + conv * 0.3, 1);
      if (conv > 0.92) glow(c, cx, cy, g * 2.6, a, 0.25);
    },
  });

  // Alignement multiple : un radar balaie plusieurs cibles à verrouiller.
  M.radar = () => ({
    init(s) {
      const r = rng(22);
      s.m.tg = Array.from({ length: 7 }, () => ({ a: r() * TAU, d: 0.25 + r() * 0.7 }));
    },
    draw(c, s) {
      const [a, b, w] = s.pal;
      const u = Math.min(s.w, s.h);
      const cx = s.w / 2 + s.mx * 12;
      const cy = s.h / 2 + s.my * 8;
      const R = u * 0.46;
      const sw = (s.t * 0.8) % TAU;
      for (let i = 1; i <= 4; i++) ring(c, cx, cy, (R * i) / 4, a, 0.16, 1);
      for (let i = 0; i < 12; i++) ln(c, cx, cy, cx + Math.cos((i / 12) * TAU) * R, cy + Math.sin((i / 12) * TAU) * R, a, 0.09, 1);
      for (let k = 0; k < 26; k++) ln(c, cx, cy, cx + Math.cos(sw - k * 0.022) * R, cy + Math.sin(sw - k * 0.022) * R, a, 0.2 * (1 - k / 26), 2);
      ln(c, cx, cy, cx + Math.cos(sw) * R, cy + Math.sin(sw) * R, w, 0.8, 1.5);
      for (const t of s.m.tg) {
        const d = (((sw - t.a) % TAU) + TAU) % TAU;
        const lit = Math.max(0, 1 - d / 2.2);
        const x = cx + Math.cos(t.a) * R * t.d;
        const y = cy + Math.sin(t.a) * R * t.d;
        ring(c, x, y, 6 + lit * 8, b, 0.25 + lit * 0.7, 1.5);
        dot(c, x, y, 2.5, w, 0.3 + lit * 0.7);
        if (lit > 0.4) {
          ln(c, cx, cy, x, y, b, 0.2 * lit, 1);
          glow(c, x, y, 46, b, 0.35 * lit);
        }
      }
    },
  });

  // Séquence lumineuse : des orbes s'allument dans l'ordre, la lumière laisse une trace mémoire.
  M.seq = () => ({
    draw(c, s) {
      const [a, b, w] = s.pal;
      const n = 5;
      const y = s.h * 0.62;
      const gap = Math.min(s.w * 0.8, 640) / (n - 1);
      const x0 = s.w / 2 - (gap * (n - 1)) / 2;
      const step = s.t * 1.1;
      const cur = Math.floor(step) % (n + 3);
      const f = step % 1;
      for (let i = 0; i < n; i++) {
        const x = x0 + i * gap + s.mx * 8;
        const lit = i === cur ? 1 - f * 0.5 : i === cur - 1 ? (1 - f) * 0.5 : 0;
        ring(c, x, y, 22, a, 0.25 + lit * 0.5, 1.4);
        ring(c, x, y, 34, a, 0.1 + lit * 0.2, 1);
        dot(c, x, y, 7 + lit * 5, lit > 0.05 ? w : a, 0.25 + lit * 0.75);
        if (i < n - 1) ln(c, x + 24, y, x + gap - 24, y, a, 0.12, 1);
        if (lit > 0.05) {
          glow(c, x, y, 120, i % 2 ? b : a, 0.45 * lit);
          const g = c.createLinearGradient(x, y, x, 0);
          g.addColorStop(0, A(a, 0.3 * lit));
          g.addColorStop(1, A(a, 0));
          c.fillStyle = g;
          c.fillRect(x - 9, 0, 18, y);
          ring(c, x, y, 22 + (1 - lit) * 60 + f * 80, a, 0.4 * lit, 1.2);
        }
      }
      if (cur > 0 && cur < n) ln(c, x0 + (cur - 1) * gap, y, x0 + cur * gap, y, b, 0.55 * (1 - f), 2);
    },
  });

  // Formes géométriques : triangle, carré, cercle, hexagone dérivent et se répondent.
  M.shapes = () => ({
    init(s) {
      const r = rng(3);
      s.m.sh = Array.from({ length: cnt(s, 14) }, (_, i) => ({ x: r() * s.w, y: r() * s.h, r: 18 + r() * 46, n: [3, 4, 0, 6][i % 4], rot: r() * 6, vr: (r() - 0.5) * 0.3, vy: 3 + r() * 9, z: 0.3 + r() * 0.7 }));
    },
    draw(c, s) {
      const [a, b, w] = s.pal;
      for (const q of s.m.sh) {
        q.y -= q.vy * s.dt * q.z;
        q.rot += q.vr * s.dt;
        if (q.y < -80) q.y = s.h + 80;
        const x = q.x + s.mx * 26 * q.z;
        const col = q.n % 2 ? a : b;
        if (q.n === 0) ring(c, x, q.y, q.r, col, 0.18 + q.z * 0.3, 1.4);
        else poly(c, x, q.y, q.r, q.n, q.rot, col, 0.18 + q.z * 0.3, 1.4);
        dot(c, x, q.y, 1.8, w, 0.5);
      }
    },
  });

  // Rotation holographique : un cube filaire tourne sur un projecteur de lumière.
  M.holo = () => ({
    draw(c, s) {
      const [a, b, w] = s.pal;
      const u = Math.min(s.w, s.h);
      const cx = s.w / 2 + s.mx * 14;
      const cy = s.h * 0.45;
      const big = u * 0.2;
      const V = [];
      for (let i = 0; i < 8; i++) V.push([i & 1 ? 1 : -1, i & 2 ? 1 : -1, i & 4 ? 1 : -1]);
      const P = V.map((v) => {
        const q = rot3(v[0] * big, v[1] * big, v[2] * big, 0.55, s.t * 0.4);
        return proj(q[0], q[1], q[2], cx, cy, u * 1.5);
      });
      for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) if ([1, 2, 4].includes(i ^ j)) ln(c, P[i][0], P[i][1], P[j][0], P[j][1], a, 0.65, 1.6);
      P.forEach((p) => dot(c, p[0], p[1], 2.4, w, 0.85));
      glow(c, cx, cy, big * 2.2, a, 0.13);
      const by = s.h * 0.76;
      for (let i = 0; i < 4; i++) {
        const k = (s.t * 0.3 + i / 4) % 1;
        c.strokeStyle = A(i % 2 ? b : a, (1 - k) * 0.5);
        c.beginPath();
        c.ellipse(cx, by, big * (0.6 + k * 1.6), big * (0.6 + k * 1.6) * 0.22, 0, 0, TAU);
        c.stroke();
      }
      const g = c.createLinearGradient(0, cy, 0, by);
      g.addColorStop(0, A(a, 0));
      g.addColorStop(1, A(a, 0.16));
      c.fillStyle = g;
      c.beginPath();
      c.moveTo(cx - big * 0.7, cy + big * 1.2);
      c.lineTo(cx + big * 0.7, cy + big * 1.2);
      c.lineTo(cx + big * 1.5, by);
      c.lineTo(cx - big * 1.5, by);
      c.fill();
      const sy = cy - big + ((s.t * 0.25) % 1) * big * 2;
      ln(c, cx - big * 1.2, sy, cx + big * 1.2, sy, w, 0.3, 1);
    },
  });

  // Séquence sonore : spectre audio et ondes de résonance.
  M.wave = () => ({
    draw(c, s) {
      const [a, b, w] = s.pal;
      const n = cnt(s, 64);
      const bw = s.w / n;
      const beat = Math.max(0, Math.sin(s.t * 2.6)) ** 4;
      for (let i = 0; i < n; i++) {
        const u = i / n;
        const env = Math.sin(u * Math.PI) ** 1.2;
        const hh = s.h * 0.34 * env * (0.25 + 0.75 * Math.abs(Math.sin(i * 0.7 + s.t * 2.4) * Math.cos(i * 0.23 - s.t * 1.3))) * (0.7 + beat * 0.5);
        c.fillStyle = A(i % 5 ? a : b, 0.38);
        c.fillRect(i * bw + 1, s.h * 0.62 - hh, bw - 2, hh);
        c.fillStyle = A(w, 0.5);
        c.fillRect(i * bw + 1, s.h * 0.62 - hh - 2, bw - 2, 2);
        c.fillStyle = A(a, 0.08);
        c.fillRect(i * bw + 1, s.h * 0.62 + 4, bw - 2, hh * 0.5);
      }
      for (let j = 0; j < 2; j++) {
        c.strokeStyle = A(j ? b : a, 0.4);
        c.lineWidth = 1.4;
        c.beginPath();
        for (let x = 0; x <= s.w; x += 8) {
          const y = s.h * 0.3 + Math.sin(x * 0.012 + s.t * (1.4 + j)) * 24 * (0.4 + beat);
          x ? c.lineTo(x, y) : c.moveTo(x, y);
        }
        c.stroke();
      }
      ring(c, s.w / 2, s.h * 0.62, ((s.t * 0.5) % 1) * s.w * 0.5, a, 0.25, 1.2);
    },
  });

  // Observation des motifs : un œil scrute une grille de symboles que l'anneau d'attention éclaire.
  M.pattern = () => ({
    draw(c, s) {
      const [a, b, w] = s.pal;
      const g = 44;
      const fx = s.w / 2 + Math.sin(s.t * 0.4) * s.w * 0.3;
      const fy = s.h / 2 + Math.cos(s.t * 0.33) * s.h * 0.25;
      const rr = ((s.t * 140) % 520);
      for (let x = g / 2; x < s.w; x += g) {
        for (let y = g / 2; y < s.h; y += g) {
          const d = Math.hypot(x - fx, y - fy);
          const lit = Math.exp(-(((d - rr) / 46) ** 2)) + Math.exp(-((d / 90) ** 2)) * 0.6;
          const k = hash(x, y);
          const col = k > 0.5 ? a : b;
          const al = 0.1 + lit * 0.7;
          const sz = 4 + lit * 3;
          if (k < 0.33) dot(c, x, y, sz * 0.6, col, al);
          else if (k < 0.66) { c.strokeStyle = A(col, al); c.lineWidth = 1.2; c.strokeRect(x - sz * 0.6, y - sz * 0.6, sz * 1.2, sz * 1.2); }
          else poly(c, x, y, sz * 0.8, 4, Math.PI / 4, col, al, 1.2);
        }
      }
      const ex = s.w / 2;
      const ey = s.h * 0.5;
      const ew = Math.min(s.w, s.h) * 0.4;
      c.strokeStyle = A(w, 0.12);
      c.lineWidth = 1.4;
      c.beginPath();
      c.moveTo(ex - ew, ey);
      c.quadraticCurveTo(ex, ey - ew * 0.6, ex + ew, ey);
      c.quadraticCurveTo(ex, ey + ew * 0.6, ex - ew, ey);
      c.stroke();
      ring(c, ex + s.mx * ew * 0.18, ey + s.my * ew * 0.1, ew * 0.2, w, 0.16, 1.4);
      dot(c, ex + s.mx * ew * 0.18, ey + s.my * ew * 0.1, ew * 0.07, a, 0.3);
    },
  });

  // Porte lumineuse : une porte de lumière s'entrouvre sur un sol réfléchissant.
  M.door = () => ({
    draw(c, s) {
      const [a, b, w] = s.pal;
      const cx = s.w / 2 + s.mx * 12;
      const hy = s.h * 0.72;
      const dh = s.h * 0.56;
      const open = 0.08 + 0.92 * sm(cl(0.5 + 0.6 * Math.sin(s.t * 0.5)));
      const half = Math.min(s.w, s.h) * 0.13 * open;
      const g = c.createLinearGradient(0, hy - dh, 0, hy);
      g.addColorStop(0, A(a, 0.7 * open));
      g.addColorStop(1, A(w, 0.95 * open));
      c.fillStyle = g;
      c.fillRect(cx - half, hy - dh, half * 2, dh);
      for (let i = 0; i < 9; i++) {
        const an = -Math.PI / 2 + (i - 4) * 0.13;
        const l = s.h * 0.9;
        const gr = c.createLinearGradient(cx, hy - dh * 0.5, cx + Math.cos(an) * l, hy - dh * 0.5 + Math.sin(an) * l);
        gr.addColorStop(0, A(a, 0.16 * open));
        gr.addColorStop(1, A(a, 0));
        c.strokeStyle = gr;
        c.lineWidth = 14;
        c.beginPath();
        c.moveTo(cx, hy - dh * 0.5);
        c.lineTo(cx + Math.cos(an) * l, hy - dh * 0.5 + Math.sin(an) * l);
        c.stroke();
      }
      const fw = Math.min(s.w, s.h) * 0.16;
      for (const sd of [-1, 1]) {
        ln(c, cx + sd * fw, hy, cx + sd * fw, hy - dh - 12, b, 0.55, 2);
        ln(c, cx + sd * (fw - 8), hy, cx + sd * (fw - 8), hy - dh, b, 0.25, 1);
      }
      ln(c, cx - fw, hy - dh - 12, cx + fw, hy - dh - 12, b, 0.55, 2);
      glow(c, cx, hy - dh * 0.4, s.h * 0.5, a, 0.16 * open);
      ln(c, 0, hy, s.w, hy, a, 0.5, 1.2);
      const rg = c.createLinearGradient(0, hy, 0, s.h);
      rg.addColorStop(0, A(a, 0.3 * open));
      rg.addColorStop(1, A(a, 0));
      c.fillStyle = rg;
      c.beginPath();
      c.moveTo(cx - half, hy);
      c.lineTo(cx + half, hy);
      c.lineTo(cx + half * 4, s.h);
      c.lineTo(cx - half * 4, s.h);
      c.fill();
    },
  });

  // Tri : des colonnes de blocs-symboles passent du désordre à l'ordre.
  M.sort = (o = {}) => ({
    init(s) {
      const r = rng(o.seed || 8);
      const n = cnt(s, o.dense ? 30 : 20);
      s.m.v = Array.from({ length: n }, () => r());
      s.m.sorted = [...s.m.v].sort((x, y) => x - y);
    },
    draw(c, s) {
      const [a, b, w] = s.pal;
      const n = s.m.v.length;
      const p = sm(cl(bp(s.t, o.dense ? 0.9 : 0.5) * 1.3 - 0.15));
      const bw = Math.min(s.w * 0.8, 900) / n;
      const x0 = s.w / 2 - (bw * n) / 2;
      const by = s.h * 0.66;
      const blk = 10;
      for (let i = 0; i < n; i++) {
        const v = lerp(s.m.v[i], s.m.sorted[i], p);
        const h = v * s.h * 0.4 + 14;
        const col = p > 0.97 ? a : lerp(0, 1, s.m.v[i]) > 0.5 ? a : b;
        for (let y = by; y > by - h; y -= blk + 2) {
          c.fillStyle = A(col, 0.18 + 0.4 * ((by - y) / h));
          c.fillRect(x0 + i * bw + 1, y - blk, bw - 3, blk);
        }
        dot(c, x0 + i * bw + bw / 2, by - h - 4, 2, w, 0.7);
        if (o.dense) ln(c, x0 + i * bw + bw / 2, by + 4, x0 + i * bw + bw / 2, by + 4 + h * 0.4, col, 0.1, 2);
      }
      ln(c, x0 - 10, by + 2, x0 + bw * n + 10, by + 2, a, 0.5, 1.2);
      if (o.dense) {
        for (let i = 0; i < 6; i++) {
          const x = ((s.t * (80 + i * 25) + i * 200) % (s.w + 100)) - 50;
          ln(c, x, s.h * (0.18 + i * 0.05), x + 60, s.h * (0.18 + i * 0.05), w, 0.4, 1.4);
        }
      }
      if (p > 0.97) glow(c, s.w / 2, by, s.w * 0.4, a, 0.12, 1, 0.3);
    },
  });

  // Miroirs : une constellation et son reflet de part et d'autre d'un axe de verre.
  M.mirror = () => ({
    init(s) {
      const r = rng(9);
      s.m.p = Array.from({ length: cnt(s, 13) }, () => ({ x: 0.06 + r() * 0.38, y: 0.1 + r() * 0.8, p: r() * 6 }));
      s.m.e = s.m.p.map((_, i) => [i, (i + 1 + Math.floor(r() * 3)) % s.m.p.length]);
    },
    draw(c, s) {
      const [a, b, w] = s.pal;
      const ax = s.w / 2;
      for (const sd of [-1, 1]) {
        const col = sd < 0 ? a : b;
        const pos = (p) => [ax + sd * (0.5 - p.x) * s.w - sd * s.mx * 10, p.y * s.h];
        for (const [i, j] of s.m.e) {
          const A1 = pos(s.m.p[i]);
          const B1 = pos(s.m.p[j]);
          ln(c, A1[0], A1[1], B1[0], B1[1], col, 0.2, 1);
        }
        for (const p of s.m.p) {
          const q = pos(p);
          const tw = bp(s.t, 1.4, p.p);
          dot(c, q[0], q[1], 2 + tw * 1.5, w, 0.4 + tw * 0.5);
          glow(c, q[0], q[1], 26, col, 0.25 * tw);
        }
      }
      const g = c.createLinearGradient(ax - 40, 0, ax + 40, 0);
      g.addColorStop(0, A(w, 0));
      g.addColorStop(0.5, A(w, 0.1));
      g.addColorStop(1, A(w, 0));
      c.fillStyle = g;
      c.fillRect(ax - 40, 0, 80, s.h);
      ln(c, ax, 0, ax, s.h, w, 0.5, 1.4);
      const sy = ((s.t * 0.2) % 1) * s.h;
      ln(c, ax - 80, sy, ax + 80, sy, w, 0.4, 1);
    },
  });

  // Illusion : anneaux concentriques décalés en trois couches chromatiques (aberration).
  M.illusion = () => ({
    draw(c, s) {
      const u = Math.min(s.w, s.h);
      const cx = s.w / 2 + s.mx * 18;
      const cy = s.h / 2 + s.my * 10;
      for (let ch = 0; ch < 3; ch++) {
        const col = s.pal[ch];
        const dx = (ch - 1) * (4 + 3 * Math.sin(s.t * 0.6));
        for (let k = 1; k <= 11; k++) {
          const r = k * u * 0.045 + Math.sin(s.t * 0.8 + k) * 3;
          const dir = k % 2 ? 1 : -1;
          c.strokeStyle = A(col, 0.3 - k * 0.012);
          c.lineWidth = 1.5;
          c.setLineDash([r * 0.4, r * 0.25]);
          c.lineDashOffset = dir * s.t * 14 + ch * 6;
          c.beginPath();
          c.arc(cx + dx, cy, r, 0, TAU);
          c.stroke();
        }
      }
      c.setLineDash([]);
      for (let i = 0; i < 36; i++) {
        const an = (i / 36) * TAU + s.t * 0.05;
        ln(c, cx, cy, cx + Math.cos(an) * u * 0.52, cy + Math.sin(an) * u * 0.52, s.pal[i % 3], 0.07, 1);
      }
      glow(c, cx, cy, u * 0.18, s.pal[2], 0.2 + 0.1 * Math.sin(s.t * 2));
    },
  });

  // ---- Lumière, flux, systèmes --------------------------------------------
  // Lumière croisée : des faisceaux traversent l'écran et s'illuminent à leurs intersections.
  M.beams = () => ({
    init(s) {
      const r = rng(12);
      s.m.b = Array.from({ length: cnt(s, 5), }, () => {
        const side = Math.floor(r() * 4);
        return { x: side === 1 ? 1 : side === 3 ? 0 : r(), y: side === 0 ? 0 : side === 2 ? 1 : r(), a: r() * TAU, sp: 0.08 + r() * 0.14 };
      });
    },
    draw(c, s) {
      const [a, b, w] = s.pal;
      const L = s.m.b.map((q) => {
        const an = (q.x > 0.5 ? Math.PI : 0) + (q.y < 0.1 ? 1.57 : q.y > 0.9 ? -1.57 : 0) + Math.sin(s.t * q.sp + q.a) * 0.7;
        return { x: q.x * s.w, y: q.y * s.h, dx: Math.cos(an), dy: Math.sin(an) };
      });
      L.forEach((l, i) => {
        const g = c.createLinearGradient(l.x, l.y, l.x + l.dx * 1500, l.y + l.dy * 1500);
        g.addColorStop(0, A(i % 2 ? b : a, 0.75));
        g.addColorStop(1, A(i % 2 ? b : a, 0.05));
        c.strokeStyle = g;
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(l.x, l.y);
        c.lineTo(l.x + l.dx * 1500, l.y + l.dy * 1500);
        c.stroke();
      });
      for (let i = 0; i < L.length; i++) {
        for (let j = i + 1; j < L.length; j++) {
          const p = L[i];
          const q = L[j];
          const den = p.dx * q.dy - p.dy * q.dx;
          if (Math.abs(den) < 1e-3) continue;
          const t = ((q.x - p.x) * q.dy - (q.y - p.y) * q.dx) / den;
          const u = ((q.x - p.x) * p.dy - (q.y - p.y) * p.dx) / den;
          if (t < 0 || u < 0 || t > 1500) continue;
          const x = p.x + p.dx * t;
          const y = p.y + p.dy * t;
          if (x < 0 || x > s.w || y < 0 || y > s.h) continue;
          const pu = bp(s.t, 2.4, i + j);
          dot(c, x, y, 3, w, 0.9);
          ring(c, x, y, 8 + pu * 8, w, 0.5 - pu * 0.3, 1.2);
          glow(c, x, y, 50, a, 0.35);
        }
      }
    },
  });

  // Glissement holographique : des panneaux de verre coulissent sur des rails.
  M.slide = () => ({
    draw(c, s) {
      const [a, b, w] = s.pal;
      const rows = 6;
      const rh = (s.h * 0.62) / rows;
      for (let r = 0; r < rows; r++) {
        const y = s.h * 0.18 + r * rh;
        ln(c, 0, y + rh - 4, s.w, y + rh - 4, a, 0.12, 1);
        const pw = s.w * (0.16 + 0.04 * (r % 3));
        const slide = sm(cl(bp(s.t, 0.45, r * 0.9) * 1.2 - 0.1));
        for (let k = -1; k < 6; k++) {
          const x = ((k * pw * 1.3 + slide * pw * 0.9 * (r % 2 ? -1 : 1) + r * 37) % (s.w + pw * 2)) - pw;
          const g = c.createLinearGradient(x, y, x + pw, y);
          g.addColorStop(0, A(r % 2 ? b : a, 0.02));
          g.addColorStop(0.5, A(r % 2 ? b : a, 0.14));
          g.addColorStop(1, A(r % 2 ? b : a, 0.02));
          c.fillStyle = g;
          c.fillRect(x, y + 4, pw, rh - 10);
          c.strokeStyle = A(w, 0.18);
          c.strokeRect(x, y + 4, pw, rh - 10);
          ln(c, x + 6, y + 10, x + 6, y + 18, w, 0.7, 1.4);
        }
      }
    },
  });

  // Prisme oublié : un faisceau blanc se décompose en spectre, à peine rallumé.
  M.prism = () => ({
    draw(c, s) {
      const [a, b, w] = s.pal;
      const u = Math.min(s.w, s.h);
      const cx = s.w / 2 + s.mx * 10;
      const cy = s.h / 2;
      const R = u * 0.17;
      const SP = ["#ff4b4b", "#ff9a3c", "#ffe14b", "#5dff8a", "#38d6ff", "#4b6bff", "#b36cff"].map(rgb);
      const vis = 0.35 + 0.65 * sm(cl(bp(s.t, 0.5)));
      const ex = cx - R * 0.35;
      c.strokeStyle = A(w, 0.85 * vis);
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(0, cy + R * 0.1);
      c.lineTo(ex, cy);
      c.stroke();
      glow(c, ex, cy, R, w, 0.4 * vis);
      SP.forEach((col, i) => {
        const an = -0.35 + (i / 6) * 0.7 + Math.sin(s.t * 0.4) * 0.05;
        const L = Math.max(s.w, s.h) * 1.3;
        const g = c.createLinearGradient(cx + R * 0.3, cy, cx + R * 0.3 + Math.cos(an) * L, cy + Math.sin(an) * L);
        g.addColorStop(0, A(col, 0.75 * vis));
        g.addColorStop(1, A(col, 0));
        c.strokeStyle = g;
        c.lineWidth = 6;
        c.beginPath();
        c.moveTo(cx + R * 0.3, cy);
        c.lineTo(cx + R * 0.3 + Math.cos(an) * L, cy + Math.sin(an) * L);
        c.stroke();
      });
      poly(c, cx, cy, R, 3, -Math.PI / 2, a, 0.8, 2);
      poly(c, cx, cy, R * 0.72, 3, -Math.PI / 2, w, 0.25, 1);
      c.fillStyle = A(a, 0.05);
      c.beginPath();
      for (let i = 0; i < 3; i++) c.lineTo(cx + Math.cos(-Math.PI / 2 + (i / 3) * TAU) * R, cy + Math.sin(-Math.PI / 2 + (i / 3) * TAU) * R);
      c.fill();
    },
  });

  // Veines de lumière : un réseau ramifié où l'énergie circule en impulsions.
  M.veins = () => ({
    init(s) {
      const r = rng(15);
      const seg = [];
      const grow = (x, y, an, len, d) => {
        if (d > 6 || len < 14) return;
        const x2 = x + Math.cos(an) * len;
        const y2 = y + Math.sin(an) * len;
        seg.push({ x, y, x2, y2, d, ph: r() });
        grow(x2, y2, an + (r() - 0.5) * 0.5, len * 0.82, d + 1);
        if (r() > 0.35) grow(x2, y2, an + (r() > 0.5 ? 0.7 : -0.7), len * 0.68, d + 1);
      };
      const base = Math.min(s.w, s.h) * 0.2;
      grow(s.w * 0.5, s.h + 10, -Math.PI / 2, base * 1.4, 0);
      grow(s.w * 0.12, s.h * 0.9, -Math.PI / 2.3, base, 1);
      grow(s.w * 0.88, s.h * 0.9, -Math.PI / 1.7, base, 1);
      s.m.seg = seg;
    },
    draw(c, s) {
      const [a, b, w] = s.pal;
      for (const q of s.m.seg) {
        const al = 0.12 + (6 - q.d) * 0.05;
        ln(c, q.x, q.y, q.x2, q.y2, a, al, Math.max(0.6, 3 - q.d * 0.4));
        const u = (s.t * 0.35 + q.ph + q.d * 0.14) % 1;
        if (u < 0.3) {
          const k = u / 0.3;
          dot(c, lerp(q.x, q.x2, k), lerp(q.y, q.y2, k), 2.2, k > 0.5 ? w : b, 0.85);
        }
      }
      glow(c, s.w * 0.5, s.h, s.w * 0.4, a, 0.18, 1, 0.5);
    },
  });

  // Cadenas des symboles : des anneaux de cadran se calent clic après clic sous un balayage de scan.
  M.lock = () => ({
    draw(c, s) {
      const [a, b, w] = s.pal;
      const u = Math.min(s.w, s.h);
      const cx = s.w / 2 + s.mx * 10;
      const cy = s.h / 2 + s.my * 6;
      const radii = [0.16, 0.24, 0.32, 0.4];
      radii.forEach((rf, i) => {
        const r = u * rf;
        const stepA = TAU / 12;
        const q = s.t * 0.35 + i * 0.7;
        const ang = (Math.floor(q) + sm(cl((q % 1) * 3 - 1.2))) * stepA * (i % 2 ? -1 : 1);
        ring(c, cx, cy, r, i % 2 ? b : a, 0.28, 1.5);
        for (let k = 0; k < 48; k++) {
          const an = (k / 48) * TAU + ang;
          const l = k % 4 ? 5 : 11;
          ln(c, cx + Math.cos(an) * r, cy + Math.sin(an) * r, cx + Math.cos(an) * (r - l), cy + Math.sin(an) * (r - l), i % 2 ? b : a, k % 4 ? 0.25 : 0.55, 1);
        }
        for (let k = 0; k < 12; k++) {
          const an = (k / 12) * TAU + ang;
          poly(c, cx + Math.cos(an) * (r + 11), cy + Math.sin(an) * (r + 11), 3.5, k % 3 + 3, an, w, 0.32, 1);
        }
      });
      c.fillStyle = A(w, 0.8);
      c.beginPath();
      c.moveTo(cx, cy - u * 0.4 - 18);
      c.lineTo(cx - 7, cy - u * 0.4 - 30);
      c.lineTo(cx + 7, cy - u * 0.4 - 30);
      c.fill();
      ring(c, cx, cy, u * 0.075, a, 0.7, 2);
      c.fillStyle = A(a, 0.5);
      c.fillRect(cx - 2.5, cy, 5, u * 0.04);
      dot(c, cx, cy - 2, 4, w, 0.9);
      const sw = (s.t * 0.9) % TAU;
      ring(c, cx, cy, u * 0.46, a, 0.55, 3, sw, sw + 0.5);
      glow(c, cx, cy, u * 0.12, a, 0.25);
    },
  });

  // Balance du vide : un fléau oscille au-dessus d'un néant qui aspire.
  M.balance = () => ({
    init(s) {
      const r = rng(17);
      s.m.v = Array.from({ length: cnt(s, 30) }, () => ({ x: r(), y: r(), z: r() }));
    },
    draw(c, s) {
      const [a, b, w] = s.pal;
      const u = Math.min(s.w, s.h);
      const cx = s.w / 2 + s.mx * 10;
      const py = s.h * 0.78;
      const top = s.h * 0.3;
      const tilt = Math.sin(s.t * 0.5) * 0.2;
      const L = u * 0.34;
      ln(c, cx, py, cx, top, a, 0.7, 3);
      poly(c, cx, top, 8, 4, Math.PI / 4, w, 0.8, 1.6);
      const lx = cx - Math.cos(tilt) * L;
      const ly = top - Math.sin(tilt) * L;
      const rx = cx + Math.cos(tilt) * L;
      const ry = top + Math.sin(tilt) * L;
      ln(c, lx, ly, rx, ry, a, 0.8, 2.4);
      for (const [x, y, col, m] of [[lx, ly, a, tilt], [rx, ry, b, -tilt]]) {
        const d = u * 0.12 - (m > 0 ? 0 : 4);
        ln(c, x, y, x - 30, y + d, col, 0.4, 1);
        ln(c, x, y, x + 30, y + d, col, 0.4, 1);
        c.strokeStyle = A(col, 0.6);
        c.beginPath();
        c.ellipse(x, y + d, 34, 7, 0, 0, TAU);
        c.stroke();
        const orb = 7 + (m > 0 ? 6 : 0) + Math.abs(tilt) * 10;
        dot(c, x, y + d - orb, orb, col, 0.55);
        glow(c, x, y + d - orb, orb * 4, col, 0.2);
      }
      c.beginPath();
      c.ellipse(cx, py + 20, u * 0.3, u * 0.05, 0, 0, TAU);
      c.fillStyle = "rgba(0,0,0,0.5)";
      c.fill();
      ring(c, cx, py + 20, u * 0.3, a, 0.0, 1);
      for (const q of s.m.v) {
        const k = (q.y + s.t * 0.05 * (0.4 + q.z)) % 1;
        const x = cx + (q.x - 0.5) * u * 0.9 * (1 - k * 0.8);
        dot(c, x, py + 20 - (1 - k) * u * 0.4, 1 + q.z, w, 0.15 + k * 0.4);
      }
    },
  });

  // Tour des échos : une tour en gradins émet des ondes qui montent et s'élargissent.
  M.tower = () => ({
    draw(c, s) {
      const [a, b, w] = s.pal;
      const u = Math.min(s.w, s.h);
      const cx = s.w / 2 + s.mx * 12;
      const base = s.h * 0.88;
      const tiers = 6;
      for (let i = 0; i < tiers; i++) {
        const ww = u * (0.34 - i * 0.045);
        const y = base - i * u * 0.1;
        c.fillStyle = "rgba(5,8,22,0.85)";
        c.fillRect(cx - ww / 2, y - u * 0.1, ww, u * 0.1);
        c.strokeStyle = A(a, 0.55);
        c.strokeRect(cx - ww / 2, y - u * 0.1, ww, u * 0.1);
        for (let k = 0; k < 5; k++) dot(c, cx - ww / 2 + (k + 0.5) * (ww / 5), y - u * 0.05, 1.5, w, bp(s.t, 2, i * 1.3 + k) * 0.6 + 0.2);
      }
      const ty = base - tiers * u * 0.1;
      glow(c, cx, ty, u * 0.3, a, 0.3);
      for (let i = 0; i < 6; i++) {
        const k = (s.t * 0.18 + i / 6) % 1;
        c.strokeStyle = A(i % 2 ? b : a, (1 - k) * 0.5);
        c.lineWidth = 1.6 - k;
        c.beginPath();
        c.ellipse(cx, ty - k * u * 0.4, u * (0.08 + k * 0.5), u * (0.025 + k * 0.1), 0, 0, TAU);
        c.stroke();
      }
      ln(c, cx, ty, cx, 0, a, 0.2, 2);
      dot(c, cx, ty - 4, 4, w, 0.95);
    },
  });

  // Mots mêlés codés : des colonnes de glyphes chiffrés tombent, un mot se révèle.
  M.matrix = () => ({
    init(s) {
      const r = rng(19);
      const n = Math.max(8, Math.round((s.w / 26) * (s.k > 0.6 ? 1 : 0.7)));
      s.m.col = Array.from({ length: n }, (_, i) => ({ x: (i + 0.5) * (s.w / n), y: r() * s.h, v: 40 + r() * 110, len: 6 + Math.floor(r() * 8) }));
    },
    draw(c, s) {
      const [a, b, w] = s.pal;
      const G = "ΛΣΞΩΨΔΦ01<>/\\{}#$%EX";
      c.font = "14px 'Rajdhani', monospace";
      c.textAlign = "center";
      for (const q of s.m.col) {
        q.y += q.v * s.dt;
        if (q.y - q.len * 18 > s.h) q.y = -20;
        for (let k = 0; k < q.len; k++) {
          const y = q.y - k * 18;
          const ch = G[Math.floor(hash(q.x, Math.floor(y / 18) + Math.floor(s.t * (k === 0 ? 6 : 0.7))) * G.length)];
          c.fillStyle = A(k === 0 ? w : k < 3 ? a : b, k === 0 ? 0.9 : 0.5 * (1 - k / q.len));
          c.fillText(ch, q.x, y);
        }
      }
      const word = "ECHOES";
      const on = bp(s.t, 0.5);
      c.font = "bold 28px 'Rajdhani', monospace";
      for (let i = 0; i < word.length; i++) {
        const x = s.w / 2 + (i - 2.5) * 38;
        c.fillStyle = A(w, 0.1 + on * 0.6);
        c.fillText(word[i], x, s.h * 0.55);
      }
      ln(c, s.w / 2 - 130, s.h * 0.55 + 12, s.w / 2 + 130, s.h * 0.55 + 12, a, 0.1 + on * 0.5, 1.4);
    },
  });

  // Réseau dormant : des nœuds éteints se réveillent au passage d'une onde de données.
  M.network = () => ({
    init(s) {
      const r = rng(20);
      s.m.n = Array.from({ length: cnt(s, 30) }, () => ({ x: r() * s.w, y: r() * s.h }));
      s.m.src = s.m.n[0];
    },
    draw(c, s) {
      const [a, b, w] = s.pal;
      const maxR = Math.hypot(s.w, s.h);
      const rad = ((s.t * 170) % (maxR * 1.3));
      const lit = (n) => cl(1 - Math.abs(Math.hypot(n.x - s.m.src.x, n.y - s.m.src.y) - rad) / 140) + (Math.hypot(n.x - s.m.src.x, n.y - s.m.src.y) < rad ? 0.18 : 0);
      for (let i = 0; i < s.m.n.length; i++) {
        const p = s.m.n[i];
        for (let j = i + 1; j < s.m.n.length; j++) {
          const q = s.m.n[j];
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < 230) ln(c, p.x, p.y, q.x, q.y, a, (0.05 + 0.5 * Math.min(lit(p), lit(q))) * (1 - d / 230), 1);
        }
      }
      for (const p of s.m.n) {
        const l = cl(lit(p));
        dot(c, p.x + s.mx * 8, p.y, 2 + l * 2.4, l > 0.5 ? w : a, 0.25 + l * 0.7);
        if (l > 0.4) glow(c, p.x, p.y, 36, b, 0.3 * l);
      }
      ring(c, s.m.src.x, s.m.src.y, rad, a, 0.35 * (1 - rad / (maxR * 1.3)), 1.4);
    },
  });

  // ---- Temps, rythme, optique ---------------------------------------------
  // Code à rebours : un compte à rebours monumental, anneau d'aiguilles qui se vide.
  M.countdown = () => ({
    draw(c, s) {
      const [a, b, w] = s.pal;
      const u = Math.min(s.w, s.h);
      const cx = s.w / 2 + s.mx * 10;
      const cy = s.h / 2;
      const T = (s.t * 0.5) % 10;
      const left = 10 - T;
      c.font = `bold ${u * 0.5}px 'Orbitron', 'Rajdhani', monospace`;
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillStyle = A(a, 0.07 + 0.05 * Math.max(0, Math.sin(s.t * Math.PI)));
      c.fillText(String(Math.floor(left)), cx, cy);
      c.textBaseline = "alphabetic";
      const R = u * 0.42;
      for (let i = 0; i < 60; i++) {
        const an = -Math.PI / 2 + (i / 60) * TAU;
        const on = i / 60 < left / 10;
        ln(c, cx + Math.cos(an) * R, cy + Math.sin(an) * R, cx + Math.cos(an) * (R - (i % 5 ? 8 : 16)), cy + Math.sin(an) * (R - (i % 5 ? 8 : 16)), on ? a : b, on ? 0.7 : 0.12, 1.4);
      }
      const ha = -Math.PI / 2 + (1 - left / 10) * TAU;
      ln(c, cx, cy, cx + Math.cos(ha) * R * 0.9, cy + Math.sin(ha) * R * 0.9, w, 0.8, 2);
      ring(c, cx, cy, R - 24, a, 0.18, 1);
      for (let i = 0; i < 12; i++) {
        c.fillStyle = A(i % 2 ? a : b, 0.35);
        c.font = "13px monospace";
        c.fillText(String(Math.max(0, Math.floor(left * 10 - i))).padStart(3, "0"), s.w * 0.08, ((i * 55 + s.t * 20) % s.h));
        c.fillText(String(Math.max(0, Math.floor(left * 10 + i))).padStart(3, "0"), s.w * 0.92, ((i * 62 + 30 + s.t * 24) % s.h));
      }
    },
  });

  // Lumière pulsée : battement, anneaux et rayons stroboscopiques.
  M.pulse = () => ({
    draw(c, s) {
      const [a, b, w] = s.pal;
      const u = Math.min(s.w, s.h);
      const cx = s.w / 2 + s.mx * 12;
      const cy = s.h / 2;
      const beat = Math.max(0, Math.sin(s.t * 2.6)) ** 4;
      glow(c, cx, cy, u * (0.5 + beat * 0.3), a, 0.15 + beat * 0.4);
      for (let i = 0; i < 5; i++) {
        const k = (s.t * 0.42 + i / 5) % 1;
        ring(c, cx, cy, k * u * 0.7, i % 2 ? b : a, (1 - k) * 0.6, 2 - k);
      }
      for (let i = 0; i < 18; i++) {
        const an = (i / 18) * TAU + s.t * 0.1;
        const l = u * (0.18 + (i % 2) * 0.12) * (0.7 + beat);
        ln(c, cx + Math.cos(an) * u * 0.07, cy + Math.sin(an) * u * 0.07, cx + Math.cos(an) * (u * 0.07 + l), cy + Math.sin(an) * (u * 0.07 + l), w, 0.12 + beat * 0.6, 1.6);
      }
      dot(c, cx, cy, 8 + beat * 8, w, 0.9);
      if (beat > 0.7) {
        c.fillStyle = A(a, (beat - 0.7) * 0.18);
        c.fillRect(0, 0, s.w, s.h);
      }
    },
  });

  // Puzzle de réflexion : un rayon rebondit réellement sur des miroirs inclinés.
  M.reflect = () => ({
    init(s) {
      const mir = [[0.3, 0.2, 0.42, 0.45], [0.58, 0.72, 0.74, 0.55], [0.5, 0.12, 0.7, 0.26], [0.82, 0.3, 0.9, 0.6], [0.15, 0.78, 0.32, 0.88]];
      s.m.mir = mir.map(([a, b, c2, d]) => [a * s.w, b * s.h, c2 * s.w, d * s.h]);
      let px = 0;
      let py = s.h * 0.4;
      let dx = 1;
      let dy = 0.28;
      const pts = [[px, py]];
      for (let n = 0; n < 7; n++) {
        let best = 1e9;
        let bm = null;
        for (const m of s.m.mir) {
          const ex = m[2] - m[0];
          const ey = m[3] - m[1];
          const den = dx * ey - dy * ex;
          if (Math.abs(den) < 1e-6) continue;
          const t = ((m[0] - px) * ey - (m[1] - py) * ex) / den;
          const u = ((m[0] - px) * dy - (m[1] - py) * dx) / den;
          if (t > 1 && u >= 0 && u <= 1 && t < best) { best = t; bm = m; }
        }
        if (!bm) { pts.push([px + dx * 2000, py + dy * 2000]); break; }
        px += dx * best;
        py += dy * best;
        pts.push([px, py]);
        const ex = bm[2] - bm[0];
        const ey = bm[3] - bm[1];
        const l = Math.hypot(ex, ey);
        const nx = -ey / l;
        const ny = ex / l;
        const dd = dx * nx + dy * ny;
        dx -= 2 * dd * nx;
        dy -= 2 * dd * ny;
        const dl = Math.hypot(dx, dy);
        dx /= dl;
        dy /= dl;
      }
      s.m.pts = pts;
    },
    draw(c, s) {
      const [a, b, w] = s.pal;
      for (const m of s.m.mir) {
        ln(c, m[0], m[1], m[2], m[3], b, 0.18, 9);
        ln(c, m[0], m[1], m[2], m[3], w, 0.8, 1.6);
        const gl = bp(s.t, 1.2, m[0]);
        dot(c, lerp(m[0], m[2], gl), lerp(m[1], m[3], gl), 2, w, 0.7);
      }
      const P = s.m.pts;
      let tot = 0;
      const lens = [];
      for (let i = 1; i < P.length; i++) { lens.push(Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1])); tot += lens[i - 1]; }
      for (let i = 1; i < P.length; i++) {
        ln(c, P[i - 1][0], P[i - 1][1], P[i][0], P[i][1], a, 0.18, 6);
        ln(c, P[i - 1][0], P[i - 1][1], P[i][0], P[i][1], a, 0.7, 1.6);
      }
      let d = ((s.t * 0.3) % 1) * Math.min(tot, 3500);
      for (let i = 1; i < P.length; i++) {
        if (d <= lens[i - 1]) {
          const k = d / lens[i - 1];
          const x = lerp(P[i - 1][0], P[i][0], k);
          const y = lerp(P[i - 1][1], P[i][1], k);
          dot(c, x, y, 4, w, 0.95);
          glow(c, x, y, 50, a, 0.5);
          break;
        }
        d -= lens[i - 1];
      }
      for (let i = 1; i < P.length - 1; i++) glow(c, P[i][0], P[i][1], 40, w, 0.25);
    },
  });

  // Serpent de verre : un corps translucide ondule devant des échelles fantômes.
  M.snake = () => ({
    draw(c, s) {
      const [a, b, w] = s.pal;
      for (const sd of [0.14, 0.86]) {
        const x = s.w * sd;
        ln(c, x - 16, s.h * 0.9, x - 4, s.h * 0.1, b, 0.18, 1.4);
        ln(c, x + 16, s.h * 0.9, x + 4, s.h * 0.1, b, 0.18, 1.4);
        for (let i = 0; i < 12; i++) ln(c, x - 15 + i * 0.9, s.h * (0.15 + i * 0.065), x + 15 - i * 0.9, s.h * (0.15 + i * 0.065), b, 0.14, 1.4);
      }
      const N = 46;
      let hx = 0;
      let hy = 0;
      for (let i = 0; i < N; i++) {
        const u = i / N;
        const x = s.w * (0.12 + 0.78 * (1 - u)) + s.mx * 8;
        const y = s.h * 0.54 + Math.sin((1 - u) * 6.5 + s.t * 1.1) * s.h * 0.16 + Math.sin((1 - u) * 14 - s.t * 0.7) * 8;
        const r = 4 + (1 - Math.abs(u - 0.3) * 1.3) * 14 * (u < 0.92 ? 1 : 0.5);
        c.strokeStyle = A(i % 2 ? a : b, 0.28);
        c.lineWidth = 1.2;
        c.beginPath();
        c.arc(x, y, Math.max(2, r), 0, TAU);
        c.stroke();
        dot(c, x, y, Math.max(1.5, r * 0.5), w, 0.1 + (1 - u) * 0.1);
        glow(c, x, y, r * 2.4, a, 0.07);
        if (i === 0) { hx = x; hy = y; }
      }
      dot(c, hx + 6, hy - 4, 2.6, w, 0.95);
      glow(c, hx, hy, 70, a, 0.3);
    },
  });

  // Échelle inversée : la gravité s'inverse, les échelons et la poussière montent.
  M.ladder = () => ({
    init(s) {
      const r = rng(27);
      s.m.p = Array.from({ length: cnt(s, 40) }, () => ({ x: r(), y: r(), v: 0.03 + r() * 0.08, z: r() }));
    },
    draw(c, s) {
      const [a, b, w] = s.pal;
      ln(c, 0, s.h * 0.14, s.w, s.h * 0.14, w, 0.5, 1.3);
      const g = c.createLinearGradient(0, 0, 0, s.h * 0.3);
      g.addColorStop(0, A(a, 0.2));
      g.addColorStop(1, A(a, 0));
      c.fillStyle = g;
      c.fillRect(0, 0, s.w, s.h * 0.3);
      for (const sd of [0.3, 0.7]) {
        const x = s.w * sd + s.mx * 14;
        ln(c, x - 26, s.h, x - 14, 0, a, 0.5, 2.2);
        ln(c, x + 26, s.h, x + 14, 0, a, 0.5, 2.2);
        const off = (s.t * 0.12) % 1;
        for (let i = 0; i < 14; i++) {
          const k = (i + off) / 14;
          const y = s.h * (1 - k);
          ln(c, x - 25 + k * 11, y, x + 25 - k * 11, y, i % 2 ? b : a, 0.35, 2);
        }
      }
      for (const q of s.m.p) {
        q.y -= q.v * s.dt;
        if (q.y < 0) q.y = 1;
        dot(c, q.x * s.w, q.y * s.h, 1 + q.z * 1.6, w, 0.2 + q.z * 0.4);
        if (q.z > 0.8) ln(c, q.x * s.w, q.y * s.h, q.x * s.w, q.y * s.h + 14, a, 0.2, 1);
      }
      for (let i = 0; i < 3; i++) {
        c.fillStyle = A(w, 0.25);
        const ax = s.w * (0.5 + (i - 1) * 0.06);
        const ay = s.h * 0.3 + (((s.t * 40 + i * 30) % 60) * -1);
        c.beginPath();
        c.moveTo(ax, ay - 14);
        c.lineTo(ax - 8, ay);
        c.lineTo(ax + 8, ay);
        c.fill();
      }
    },
  });

  // Nœud de Möbius : un ruban à une seule face tourne dans l'espace.
  M.mobius = () => ({
    draw(c, s) {
      const [a, b, w] = s.pal;
      const u = Math.min(s.w, s.h);
      const R = u * 0.27;
      const Wd = u * 0.1;
      const cx = s.w / 2 + s.mx * 14;
      const cy = s.h / 2 + s.my * 8;
      const P = (th, v) => {
        const rr = R + Wd * v * Math.cos(th / 2);
        const q = rot3(rr * Math.cos(th), rr * Math.sin(th), Wd * v * Math.sin(th / 2), 0.9 + Math.sin(s.t * 0.2) * 0.2, s.t * 0.3);
        return proj(q[0], q[1], q[2], cx, cy, u * 1.4);
      };
      for (let th = 0; th < TAU; th += 0.18) {
        const p1 = P(th, -1);
        const p2 = P(th, 1);
        ln(c, p1[0], p1[1], p2[0], p2[1], a, 0.12 + 0.12 * p1[2], 1);
      }
      for (let m = -3; m <= 3; m++) {
        const v = m / 3;
        c.strokeStyle = A(m % 2 ? b : a, m === 0 ? 0.4 : 0.7);
        c.lineWidth = m === 0 ? 1 : 1.5;
        c.beginPath();
        for (let th = 0; th <= TAU * 2 + 0.1; th += 0.07) {
          const p = P(th, th > TAU ? -v : v);
          th ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]);
        }
        c.stroke();
      }
      const t = (s.t * 0.4) % TAU;
      const hp = P(t, 0);
      dot(c, hp[0], hp[1], 4, w, 0.95);
      glow(c, hp[0], hp[1], 40, w, 0.4);
    },
  });

  // Cœur de la mémoire : un noyau reconstruit des fragments d'archives qui convergent.
  M.memcore = () => ({
    init(s) {
      const r = rng(29);
      s.m.f = Array.from({ length: cnt(s, 26) }, () => ({ a: r() * TAU, d: 0.5 + r() * 0.7, sp: 0.08 + r() * 0.1, w: 10 + r() * 22 }));
    },
    draw(c, s) {
      const [a, b, w] = s.pal;
      const u = Math.min(s.w, s.h);
      const cx = s.w / 2 + s.mx * 14;
      const cy = s.h / 2 + s.my * 8;
      const core = 0.8 + 0.2 * Math.sin(s.t * 1.6);
      glow(c, cx, cy, u * 0.35, a, 0.3 * core);
      dot(c, cx, cy, u * 0.03 * core, w, 0.95);
      for (let i = 0; i < 4; i++) {
        const r = u * (0.1 + i * 0.07);
        c.strokeStyle = A(i % 2 ? b : a, 0.5);
        c.lineWidth = 2.2 - i * 0.3;
        c.setLineDash([r * 0.8, r * 0.35]);
        c.lineDashOffset = s.t * 20 * (i % 2 ? 1 : -1);
        c.beginPath();
        c.arc(cx, cy, r, 0, TAU);
        c.stroke();
      }
      c.setLineDash([]);
      for (const f of s.m.f) {
        f.d -= f.sp * s.dt;
        f.a += 0.2 * s.dt;
        if (f.d < 0.12) f.d = 1.2;
        const x = cx + Math.cos(f.a) * f.d * u * 0.55;
        const y = cy + Math.sin(f.a) * f.d * u * 0.55;
        const rec = cl(1 - (f.d - 0.12) / 0.5);
        c.save();
        c.translate(x, y);
        c.rotate(f.a + (1 - rec) * 1.5);
        c.strokeStyle = A(rec > 0.7 ? w : a, 0.25 + rec * 0.5);
        c.lineWidth = 1.2;
        c.strokeRect(-f.w / 2, -f.w * 0.3, f.w, f.w * 0.6);
        ln(c, -f.w / 2 + 3, -f.w * 0.1, f.w / 2 - 3 - (1 - rec) * f.w * 0.4, -f.w * 0.1, a, 0.4, 1);
        c.restore();
      }
    },
  });

  // L'ultime trace : un sillage lumineux suit un chemin unique dans le noir.
  M.trace = () => ({
    init(s) {
      const r = rng(30);
      const pts = [[-20, s.h * 0.7]];
      let x = 0;
      let y = s.h * 0.7;
      while (x < s.w + 40) {
        x += 60 + r() * 120;
        y = Math.min(s.h * 0.9, Math.max(s.h * 0.15, y + (r() - 0.5) * s.h * 0.5));
        pts.push([x, y]);
      }
      s.m.pts = pts;
      s.m.len = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
      s.m.tot = s.m.len.reduce((p, q) => p + q, 0);
    },
    draw(c, s) {
      const [a, b, w] = s.pal;
      stars(c, s, w, 70);
      const P = s.m.pts;
      for (let i = 1; i < P.length; i++) ln(c, P[i - 1][0], P[i - 1][1], P[i][0], P[i][1], a, 0.1, 1);
      for (const p of P) ring(c, p[0], p[1], 5, a, 0.2, 1);
      const prog = ((s.t * 0.09) % 1.15) * s.m.tot;
      let d = prog;
      let hx = 0;
      let hy = 0;
      for (let i = 1; i < P.length; i++) {
        const l = s.m.len[i - 1];
        const k = cl(d / l);
        const x = lerp(P[i - 1][0], P[i][0], k);
        const y = lerp(P[i - 1][1], P[i][1], k);
        const age = cl(1 - (prog - (d > l ? 0 : 0)) / 1);
        if (d > 0) {
          const g = c.createLinearGradient(P[i - 1][0], P[i - 1][1], x, y);
          g.addColorStop(0, A(b, 0.5));
          g.addColorStop(1, A(w, 0.9));
          c.strokeStyle = g;
          c.lineWidth = 2.4;
          c.beginPath();
          c.moveTo(P[i - 1][0], P[i - 1][1]);
          c.lineTo(x, y);
          c.stroke();
        }
        hx = x;
        hy = y;
        if (d <= l) break;
        d -= l;
      }
      void 0;
      glow(c, hx, hy, 90, a, 0.5);
      dot(c, hx, hy, 4, w, 1);
      const last = P[P.length - 1];
      if (prog > s.m.tot) glow(c, last[0], last[1], 200, w, 0.4 * Math.sin(((prog - s.m.tot) / (s.m.tot * 0.15)) * Math.PI));
    },
  });

  // ---- Partie 4 : labyrinthes, glace, brume, failles ----------------------
  // Plateau instable / recycleur : trois flèches de recyclage tournent, des blocs sont recapturés.
  M.recycle = () => ({
    init(s) {
      const r = rng(31);
      s.m.b = Array.from({ length: cnt(s, 18) }, () => ({ x: r(), y: r(), v: 30 + r() * 60 }));
    },
    draw(c, s) {
      const [a, b, w] = s.pal;
      const u = Math.min(s.w, s.h);
      const cx = s.w / 2 + s.mx * 12;
      const cy = s.h * 0.46;
      const R = u * 0.22;
      for (let i = 0; i < 3; i++) {
        const a0 = s.t * 0.5 + (i / 3) * TAU;
        const a1 = a0 + TAU / 3 - 0.45;
        ring(c, cx, cy, R, i % 2 ? b : a, 0.7, 6, a0, a1);
        const hx = cx + Math.cos(a1) * R;
        const hy = cy + Math.sin(a1) * R;
        c.fillStyle = A(i % 2 ? b : a, 0.85);
        c.beginPath();
        c.moveTo(hx + Math.cos(a1 + 1.57) * 14, hy + Math.sin(a1 + 1.57) * 14);
        c.lineTo(hx + Math.cos(a1 - 1.57) * 14, hy + Math.sin(a1 - 1.57) * 14);
        c.lineTo(hx + Math.cos(a1 + 0.2) * 24, hy + Math.sin(a1 + 0.2) * 24);
        c.fill();
      }
      glow(c, cx, cy, R * 1.5, a, 0.18);
      for (const q of s.m.b) {
        q.y += (q.v * s.dt) / s.h;
        const bx = q.x * s.w;
        const by = q.y * s.h;
        const d = Math.hypot(bx - cx, by - cy);
        if (q.y > 1 || d < R * 0.5) { q.y = 0; q.x = Math.random(); }
        c.strokeStyle = A(w, 0.35);
        c.strokeRect(bx - 4, by - 4, 8, 8);
      }
      const tilt = Math.sin(s.t * 0.7) * 0.06;
      c.save();
      c.translate(cx, s.h * 0.84);
      c.rotate(tilt);
      for (let i = -6; i <= 6; i++) {
        c.strokeStyle = A(a, 0.3);
        c.strokeRect(i * 34 - 15, -6, 30, 12);
      }
      c.restore();
    },
  });

  // Labyrinthe fractal : un labyrinthe se régénère, une lumière en parcourt chaque couloir.
  M.maze = () => ({
    init(s) {
      const cols = Math.max(8, Math.round(s.w / 64));
      const rows = Math.max(6, Math.round(s.h / 64));
      const r = rng(32 + (s.m.gen = (s.m.gen || 0) + 1));
      const g = Array.from({ length: cols * rows }, () => ({ v: false, w: [true, true, true, true] }));
      const walk = [];
      const st = [0];
      g[0].v = true;
      walk.push(0);
      while (st.length) {
        const i = st[st.length - 1];
        const x = i % cols;
        const y = Math.floor(i / cols);
        const nb = [[0, -1, 0, 2], [1, 0, 1, 3], [0, 1, 2, 0], [-1, 0, 3, 1]].filter(([dx, dy]) => x + dx >= 0 && x + dx < cols && y + dy >= 0 && y + dy < rows && !g[(y + dy) * cols + x + dx].v);
        if (!nb.length) {
          st.pop();
          if (st.length) walk.push(st[st.length - 1]);
          continue;
        }
        const [dx, dy, a, b] = nb[Math.floor(r() * nb.length)];
        const j = (y + dy) * cols + x + dx;
        g[i].w[a] = false;
        g[j].w[b] = false;
        g[j].v = true;
        st.push(j);
        walk.push(j);
      }
      Object.assign(s.m, { cols, rows, g, walk, cw: s.w / cols, ch: s.h / rows, born: s.t || 0 });
    },
    draw(c, s) {
      const [a, b, w] = s.pal;
      const { cols, rows, g, walk, cw, ch } = s.m;
      const prog = Math.min(walk.length - 1, (s.t - s.m.born) * 18);
      if (prog >= walk.length - 1 && s.t - s.m.born > walk.length / 18 + 1.5) {
        this.init(s);
        return;
      }
      const fade = cl((s.t - s.m.born) * 1.2);
      for (let i = 0; i < g.length; i++) {
        const x = (i % cols) * cw;
        const y = Math.floor(i / cols) * ch;
        const [t, r2, bt, l] = g[i].w;
        if (t) ln(c, x, y, x + cw, y, a, 0.3 * fade, 1.2);
        if (l) ln(c, x, y, x, y + ch, a, 0.3 * fade, 1.2);
        if (r2 && (i % cols) === cols - 1) ln(c, x + cw, y, x + cw, y + ch, a, 0.3, 1.2);
        if (bt && Math.floor(i / cols) === rows - 1) ln(c, x, y + ch, x + cw, y + ch, a, 0.3, 1.2);
      }
      c.strokeStyle = A(b, 0.55);
      c.lineWidth = 2.4;
      c.beginPath();
      const upto = Math.floor(prog);
      for (let k = Math.max(0, upto - 40); k <= upto; k++) {
        const i = walk[k];
        const px = ((i % cols) + 0.5) * cw;
        const py = (Math.floor(i / cols) + 0.5) * ch;
        k === Math.max(0, upto - 40) ? c.moveTo(px, py) : c.lineTo(px, py);
      }
      c.stroke();
      const i = walk[upto];
      const hx = ((i % cols) + 0.5) * cw;
      const hy = (Math.floor(i / cols) + 0.5) * ch;
      dot(c, hx, hy, 4, w, 1);
      glow(c, hx, hy, 60, w, 0.5);
    },
  });

  // Chambre des brumes : la carte n'est visible qu'autour d'une lanterne dans le brouillard.
  M.fog = () => ({
    init(s) {
      const r = rng(33);
      s.m.fg = Array.from({ length: 6 }, () => ({ x: r() * s.w, y: r() * s.h, v: 5 + r() * 12, r: s.w * (0.25 + r() * 0.2) }));
      s.m.lx = s.w / 2;
      s.m.ly = s.h / 2;
    },
    draw(c, s) {
      const [a, b, w] = s.pal;
      const tx = s.w / 2 + (s.mx * 0.4 + Math.sin(s.t * 0.3) * 0.5) * s.w * 0.4;
      const ty = s.h / 2 + (s.my * 0.4 + Math.cos(s.t * 0.25) * 0.5) * s.h * 0.35;
      s.m.lx += (tx - s.m.lx) * 0.03;
      s.m.ly += (ty - s.m.ly) * 0.03;
      const R = Math.min(s.w, s.h) * 0.36;
      const g = 48;
      for (let x = 0; x < s.w; x += g) {
        for (let y = 0; y < s.h; y += g) {
          const d = Math.hypot(x - s.m.lx, y - s.m.ly);
          const al = Math.max(0, 1 - d / R) ** 1.6;
          if (al < 0.02) continue;
          ln(c, x, y, x + g, y, a, al * 0.55, 1);
          ln(c, x, y, x, y + g, a, al * 0.55, 1);
          if (hash(x, y) > 0.8) dot(c, x + g / 2, y + g / 2, 3, w, al * 0.8 * bp(s.t, 2, x));
        }
      }
      glow(c, s.m.lx, s.m.ly, R, w, 0.14);
      dot(c, s.m.lx, s.m.ly, 4, w, 0.9);
      for (const f of s.m.fg) {
        f.x = (f.x + f.v * s.dt) % (s.w + f.r * 2);
        glow(c, f.x - f.r, f.y, f.r, b, 0.1, 1, 0.5);
      }
    },
  });

  // Couloir de glace : des facettes cristallines, des glissades droites qui s'arrêtent net.
  M.ice = () => ({
    init(s) {
      const r = rng(34);
      s.m.sl = Array.from({ length: 6 }, (_, i) => ({ y: s.h * (0.18 + i * 0.13), x: r() * s.w, v: 220 + r() * 260, stop: s.w * (0.3 + r() * 0.65), wait: 0 }));
      s.m.sp = Array.from({ length: cnt(s, 40) }, () => ({ x: r() * s.w, y: r() * s.h, p: r() * 6 }));
    },
    draw(c, s) {
      const [a, b, w] = s.pal;
      for (const [x, y, dx, dy] of [[0, 0, 1, 1], [s.w, 0, -1, 1], [0, s.h, 1, -1], [s.w, s.h, -1, -1]]) {
        const g = c.createLinearGradient(x, y, x + dx * 260, y + dy * 260);
        g.addColorStop(0, A(a, 0.22));
        g.addColorStop(1, A(a, 0));
        c.fillStyle = g;
        c.beginPath();
        c.moveTo(x, y);
        c.lineTo(x + dx * 300, y + dy * 80);
        c.lineTo(x + dx * 120, y + dy * 300);
        c.fill();
        ln(c, x + dx * 300, y + dy * 80, x + dx * 120, y + dy * 300, w, 0.3, 1);
      }
      const h = 38;
      for (let i = 0; i < 12; i++) for (let j = 0; j < 8; j++) poly(c, s.w * 0.1 + i * h * 1.5 + (j % 2) * h * 0.75, s.h * 0.15 + j * h * 1.3, h * 0.8, 6, 0, a, 0.05, 1);
      for (const q of s.m.sl) {
        if (q.wait > 0) {
          q.wait -= s.dt;
          if (q.wait <= 0) { q.x = 0; q.stop = s.w * (0.3 + Math.random() * 0.65); }
        } else {
          q.x += q.v * s.dt;
          if (q.x >= q.stop) { q.x = q.stop; q.wait = 1.2; }
        }
        const g = c.createLinearGradient(q.x - 220, q.y, q.x, q.y);
        g.addColorStop(0, A(b, 0));
        g.addColorStop(1, A(w, 0.85));
        c.strokeStyle = g;
        c.lineWidth = 2.4;
        c.beginPath();
        c.moveTo(q.x - 220, q.y);
        c.lineTo(q.x, q.y);
        c.stroke();
        if (q.wait > 0) ring(c, q.x, q.y, (1.2 - q.wait) * 40, w, q.wait * 0.4, 1.2);
        dot(c, q.x, q.y, 3.2, w, 0.95);
      }
      for (const p of s.m.sp) if (bp(s.t, 1.4, p.p) > 0.9) { ln(c, p.x - 4, p.y, p.x + 4, p.y, w, 0.8, 1); ln(c, p.x, p.y - 4, p.x, p.y + 4, w, 0.8, 1); }
    },
  });

  // Sentinelles : des gardes patrouillent avec des cônes de vision sur un sol quadrillé.
  M.sentinel = () => ({
    init(s) {
      const r = rng(35);
      s.m.g = Array.from({ length: cnt(s, 5) }, (_, i) => ({ y: s.h * (0.2 + i * 0.15), x0: s.w * 0.1, x1: s.w * 0.9, ph: r() * 6, v: 0.15 + r() * 0.15 }));
    },
    draw(c, s) {
      const [a, b, w] = s.pal;
      for (let x = 0; x < s.w; x += 56) ln(c, x, 0, x, s.h, b, 0.05, 1);
      for (let y = 0; y < s.h; y += 56) ln(c, 0, y, s.w, y, b, 0.05, 1);
      for (const q of s.m.g) {
        const k = bp(s.t, q.v * 4, q.ph);
        const x = lerp(q.x0, q.x1, k);
        const dir = Math.cos(s.t * q.v * 4 + q.ph) > 0 ? 1 : -1;
        const alert = Math.abs(((s.t * 0.3 + q.ph) % 2) - 1) < 0.12;
        const col = alert ? w : a;
        const g = c.createLinearGradient(x, q.y, x + dir * 260, q.y);
        g.addColorStop(0, A(col, 0.35));
        g.addColorStop(1, A(col, 0));
        c.fillStyle = g;
        c.beginPath();
        c.moveTo(x, q.y);
        c.lineTo(x + dir * 260, q.y - 70);
        c.lineTo(x + dir * 260, q.y + 70);
        c.fill();
        poly(c, x, q.y, 11, 4, Math.PI / 4, col, 0.9, 2);
        dot(c, x, q.y, 3, w, 0.95);
        ring(c, x, q.y, 18 + bp(s.t, 3, q.ph) * 6, col, 0.25, 1);
        ln(c, q.x0, q.y, q.x1, q.y, a, 0.06, 1);
      }
    },
  });

  // Dalles fragiles : des dalles se fissurent, tombent, puis se reforment.
  M.tiles = () => ({
    draw(c, s) {
      const [a, b, w] = s.pal;
      const g = 58;
      const ox = s.mx * 8;
      for (let x = 0; x < s.w; x += g) {
        for (let y = 0; y < s.h; y += g) {
          const life = (s.t * 0.14 + hash(x, y)) % 1;
          if (life > 0.9) continue;
          const crack = life > 0.6;
          const fall = life > 0.8 ? (life - 0.8) / 0.1 : 0;
          const sc = 1 - fall * 0.4;
          c.save();
          c.translate(x + g / 2 + ox, y + g / 2 + fall * 20);
          c.scale(sc, sc);
          c.fillStyle = A(crack ? b : a, (crack ? 0.1 : 0.05) * (1 - fall));
          c.fillRect(-g / 2 + 2, -g / 2 + 2, g - 4, g - 4);
          c.strokeStyle = A(crack ? b : a, (0.3 - fall * 0.3));
          c.lineWidth = 1.2;
          c.strokeRect(-g / 2 + 2, -g / 2 + 2, g - 4, g - 4);
          if (crack) {
            const j = hash(y, x);
            c.strokeStyle = A(w, 0.5 * (1 - fall));
            c.beginPath();
            c.moveTo(-g / 2 + 4, -g / 2 + 10 + j * 20);
            c.lineTo(-4, -2 + j * 6);
            c.lineTo(6, 4 - j * 8);
            c.lineTo(g / 2 - 4, g / 2 - 8);
            c.stroke();
          }
          c.restore();
        }
      }
    },
  });

  // Porte résonnante : une porte vibre sous des ondes sonores qui jaillissent de sa serrure.
  M.resdoor = () => ({
    draw(c, s) {
      const [a, b, w] = s.pal;
      const u = Math.min(s.w, s.h);
      const cx = s.w / 2 + s.mx * 10;
      const cy = s.h * 0.55;
      const dw = u * 0.2;
      const dh = u * 0.42;
      const vib = Math.sin(s.t * 40) * 1.4 * bp(s.t, 0.8);
      c.strokeStyle = A(a, 0.7);
      c.lineWidth = 2.4;
      c.beginPath();
      c.moveTo(cx - dw + vib, cy + dh / 2);
      c.lineTo(cx - dw + vib, cy - dh / 2 + dw);
      c.arc(cx + vib, cy - dh / 2 + dw, dw, Math.PI, 0);
      c.lineTo(cx + dw + vib, cy + dh / 2);
      c.stroke();
      for (let i = 0; i < 7; i++) {
        const k = (s.t * 0.25 + i / 7) % 1;
        const r = k * u * 0.7;
        ring(c, cx, cy, r, i % 2 ? b : a, (1 - k) * 0.55, 2 - k, -Math.PI * 0.8, Math.PI * 0.8);
        ring(c, cx, cy, r, i % 2 ? b : a, (1 - k) * 0.55, 2 - k, Math.PI * 0.2, Math.PI * 1.8);
      }
      glow(c, cx, cy, u * 0.2, a, 0.28);
      poly(c, cx, cy - 2, 9, 6, 0, w, 0.9, 2);
      c.fillStyle = A(w, 0.85);
      c.fillRect(cx - 2, cy, 4, 18);
      ln(c, cx, cy + dh / 2, cx, s.h, a, 0.2, 1);
    },
  });

  // Failles mouvantes : des fissures s'ouvrent et se referment, laissant fuir de la lumière instable.
  M.rift = () => ({
    init(s) {
      const r = rng(38);
      s.m.r = Array.from({ length: 4 }, (_, i) => {
        const pts = [];
        const x0 = s.w * (0.1 + i * 0.25);
        for (let k = 0; k <= 14; k++) pts.push([x0 + (r() - 0.5) * 90 + k * 14 * (i % 2 ? -1 : 1), (k / 14) * s.h]);
        return { pts, ph: r() * 6, w: 4 + r() * 5 };
      });
    },
    draw(c, s) {
      const [a, b, w] = s.pal;
      s.m.r.forEach((q, i) => {
        const open = sm(bp(s.t, 0.5, q.ph));
        const col = i % 2 ? b : a;
        for (const [lw, al, cc] of [[q.w * 5 * open + 2, 0.06 + open * 0.08, col], [q.w * open + 1, 0.4 * open + 0.1, col], [1.4, 0.85, w]]) {
          c.strokeStyle = A(cc, al);
          c.lineWidth = lw;
          c.lineJoin = "round";
          c.beginPath();
          q.pts.forEach(([x, y], k) => (k ? c.lineTo(x + Math.sin(s.t * 3 + k) * 2 * open, y) : c.moveTo(x, y)));
          c.stroke();
        }
        if (open > 0.8) glow(c, q.pts[7][0], q.pts[7][1], 120, col, 0.2);
      });
      for (let i = 0; i < 8; i++) if (hash(i, Math.floor(s.t * 4)) > 0.6) { c.fillStyle = A(w, 0.5); c.fillRect(hash(i, 3) * s.w, hash(i, Math.floor(s.t * 4) + 9) * s.h, 10, 2); }
    },
  });

  // Doubles portails : deux paires de portails reliées par des flux de particules.
  M.portal = () => ({
    draw(c, s) {
      const [a, b, w] = s.pal;
      const u = Math.min(s.w, s.h);
      const pairs = [[[s.w * 0.16, s.h * 0.35], [s.w * 0.84, s.h * 0.65], a, 1], [[s.w * 0.16, s.h * 0.7], [s.w * 0.84, s.h * 0.3], b, 0.7]];
      for (const [P1, P2, col, sc] of pairs) {
        for (const [px, py] of [P1, P2]) {
          for (let i = 0; i < 5; i++) {
            c.strokeStyle = A(col, 0.5 - i * 0.08);
            c.lineWidth = 1.6;
            c.beginPath();
            c.ellipse(px, py, u * 0.05 * sc * (1 + i * 0.25), u * 0.12 * sc * (1 + i * 0.12), s.t * (i % 2 ? 0.3 : -0.3) * 0.2, 0, TAU);
            c.stroke();
          }
          glow(c, px, py, u * 0.2 * sc, col, 0.3);
        }
        for (let k = 0; k < 14; k++) {
          const t = (s.t * 0.22 + k / 14) % 1;
          const mx = (P1[0] + P2[0]) / 2;
          const my = Math.min(P1[1], P2[1]) - u * 0.25 * sc;
          const x = (1 - t) * (1 - t) * P1[0] + 2 * (1 - t) * t * mx + t * t * P2[0];
          const y = (1 - t) * (1 - t) * P1[1] + 2 * (1 - t) * t * my + t * t * P2[1];
          dot(c, x, y, 2 * sc, k % 3 ? col : w, Math.sin(t * Math.PI) * 0.9);
        }
      }
    },
  });

  // Convergence : toutes les mécaniques de la partie se rejoignent dans un noyau dense.
  M.converge = () => ({
    init(s) {
      const r = rng(40);
      s.m.f = Array.from({ length: cnt(s, 70) }, () => ({ a: r() * TAU, d: r(), v: 0.1 + r() * 0.4, c: Math.floor(r() * 3) }));
    },
    draw(c, s) {
      const u = Math.min(s.w, s.h);
      const cx = s.w / 2 + s.mx * 16;
      const cy = s.h / 2 + s.my * 10;
      const maxR = Math.hypot(s.w, s.h) * 0.6;
      for (const f of s.m.f) {
        const d0 = f.d;
        f.d -= f.v * s.dt * (0.3 + (1 - f.d));
        if (f.d < 0.04) { f.d = 1; f.a = Math.random() * TAU; }
        ln(c, cx + Math.cos(f.a + (1 - d0) * 0.6) * d0 * maxR, cy + Math.sin(f.a + (1 - d0) * 0.6) * d0 * maxR, cx + Math.cos(f.a + (1 - f.d) * 0.6) * f.d * maxR, cy + Math.sin(f.a + (1 - f.d) * 0.6) * f.d * maxR, s.pal[f.c], 0.2 + (1 - f.d) * 0.6, 0.8 + (1 - f.d) * 1.6);
      }
      for (let i = 0; i < 4; i++) {
        const a0 = s.t * 0.4 + (i / 4) * TAU;
        ring(c, cx, cy, u * 0.2, s.pal[i % 3], 0.7, 4, a0, a0 + 1.2);
        ring(c, cx, cy, u * 0.26, s.pal[(i + 1) % 3], 0.3, 1.4, -a0, -a0 + 0.7);
      }
      const p = 0.8 + 0.2 * Math.sin(s.t * 2);
      glow(c, cx, cy, u * 0.3, s.pal[2], 0.35 * p);
      dot(c, cx, cy, u * 0.025 * p, s.pal[2], 1);
    },
  });

  // Hub de campagne : rubans d'aurore aux couleurs des six parties (la campagne entière d'un coup d'œil).
  const RIB = ["#79f7ff", "#4b9eff", "#ff4fd8", "#38d6ff", "#ffb84d", "#f5e6a8"].map(rgb);
  M.hub = () => ({
    init(s) {
      s.m.st = null;
    },
    draw(c, s) {
      stars(c, s, s.pal[2], 150);
      RIB.forEach((col, j) => {
        const base = s.h * (0.14 + j * 0.12);
        const th = s.h * 0.07;
        const g = c.createLinearGradient(0, base - th * 2, 0, base + th * 2);
        g.addColorStop(0, A(col, 0));
        g.addColorStop(0.5, A(col, 0.13));
        g.addColorStop(1, A(col, 0));
        c.fillStyle = g;
        c.beginPath();
        const ys = [];
        for (let x = 0; x <= s.w + 24; x += 24) ys.push([x + s.mx * 14 * (j % 3), base + Math.sin(x * 0.0038 + s.t * 0.28 + j * 1.3) * s.h * 0.07 + Math.sin(x * 0.011 - s.t * 0.17 * (j + 1)) * s.h * 0.02 + s.my * 8]);
        ys.forEach(([x, y], i) => (i ? c.lineTo(x, y - th * (1.4 + Math.sin(x * 0.01 + s.t))) : c.moveTo(x, y - th)));
        for (let i = ys.length - 1; i >= 0; i--) c.lineTo(ys[i][0], ys[i][1] + th * 1.6);
        c.fill();
        c.strokeStyle = A(col, 0.22);
        c.lineWidth = 1.2;
        c.beginPath();
        ys.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
        c.stroke();
      });
      floorGrid(c, s, s.pal[0], s.h * 0.78, 0.07, 0.45);
    },
  });

  // ---- Table des niveaux --------------------------------------------------
  const P = {
    p1: ["#79f7ff", "#b36cff", "#e8ffff"],
    p2: ["#4b9eff", "#d4dce7", "#7ff3ff"],
    p3: ["#ff4fd8", "#a855f7", "#ffe39a"],
    p4: ["#38d6ff", "#bd63ff", "#ffffff"],
  };
  const LEVELS = {
    1: [P.p1, "align"], 2: [["#79f7ff", "#ffd27a", "#ffffff"], "seq"], 3: [["#79f7ff", "#ff79d1", "#e8ffff"], "shapes"], 4: [["#4be8ff", "#7a8cff", "#d8fbff"], "holo"], 5: [["#79f7ff", "#ff5fa8", "#ffffff"], "wave"],
    6: [["#9bffd6", "#79f7ff", "#ffffff"], "pattern"], 7: [["#ffe9a8", "#79f7ff", "#ffffff"], "door"], 8: [P.p1, "sort"], 9: [["#c9d7ff", "#79f7ff", "#ffffff"], "mirror"], 10: [["#ff5fa8", "#79f7ff", "#ffe36a"], "illusion"],
    11: [P.p2, "align", { dual: true }], 12: [["#7ff3ff", "#4b9eff", "#ffffff"], "beams"], 13: [["#4b9eff", "#7ff3ff", "#d4dce7"], "slide"], 14: [["#d4dce7", "#4b9eff", "#ffffff"], "prism"], 15: [["#38e8c8", "#4b9eff", "#ffffff"], "veins"],
    16: [["#ffb35c", "#4b9eff", "#ffe6c0"], "lock"], 17: [["#d4dce7", "#4b9eff", "#ffffff"], "balance"], 18: [["#4b9eff", "#b36cff", "#d4dce7"], "tower"], 19: [["#38ff9a", "#4b9eff", "#d8fff0"], "matrix"], 20: [["#4b9eff", "#7ff3ff", "#ffffff"], "network"],
    21: [["#ff4fd8", "#ffd24d", "#ffffff"], "countdown"], 22: [P.p3, "radar"], 23: [["#ff4fd8", "#ffffff", "#ffd24d"], "pulse"], 24: [["#a855f7", "#ff4fd8", "#ffe39a"], "reflect"], 25: [P.p3, "sort", { dense: true, seed: 25 }],
    26: [["#7ff3d0", "#ff4fd8", "#ffffff"], "snake"], 27: [["#ff4fd8", "#ffd24d", "#ffffff"], "ladder"], 28: [["#a855f7", "#ff4fd8", "#ffe39a"], "mobius"], 29: [["#ff4fd8", "#ffd24d", "#ffffff"], "memcore"], 30: [["#ffd24d", "#ff4fd8", "#ffffff"], "trace"],
    31: [["#38ff9a", "#38d6ff", "#ffffff"], "recycle"], 32: [P.p4, "maze"], 33: [["#8fb7c9", "#38d6ff", "#ffffff"], "fog"], 34: [["#a8e6ff", "#38d6ff", "#ffffff"], "ice"], 35: [["#ff5a6e", "#38d6ff", "#ffd0a8"], "sentinel"],
    36: [["#38d6ff", "#ff9a3c", "#ffffff"], "tiles"], 37: [["#bd63ff", "#38d6ff", "#ffffff"], "resdoor"], 38: [["#bd63ff", "#ff4fd8", "#ffffff"], "rift"], 39: [["#38d6ff", "#ff9a3c", "#ffffff"], "portal"], 40: [["#38d6ff", "#bd63ff", "#ffd24d"], "converge"],
  };

  // ---- Boss : événements à univers exclusif -------------------------------
  const BOSS = {};

  // Gardien du Signal : une porte d'émission gardée par un monolithe, lumière rouge contrôlée.
  BOSS[1] = {
    pal: ["#ff456d", "#8d1dff", "#ffd0a8"],
    init(s) {
      const r = rng(71);
      s.m.pk = Array.from({ length: cnt(s, 34) }, () => ({ x: r(), y: r(), v: 40 + r() * 90, z: r() }));
      s.m.gl = { next: 3, until: 0, y: 0, h: 0 };
    },
    draw(c, s) {
      const [a, b, w] = s.pal;
      const hy = s.h * 0.74;
      const cx = s.w / 2 + s.mx * 16;
      const u = Math.min(s.w, s.h);
      sky(c, s, "#06020a", "#16060f");
      glow(c, cx, s.h * 0.34, s.w * 0.6, b, 0.2, 1, 0.8);
      const fl = c.createLinearGradient(0, hy, 0, s.h);
      fl.addColorStop(0, A(a, 0.12));
      fl.addColorStop(1, "rgba(3,2,6,0.95)");
      c.fillStyle = fl;
      c.fillRect(0, hy, s.w, s.h - hy);
      ln(c, 0, hy, s.w, hy, a, 0.65, 1.4);
      const gx = u * 0.3;
      for (const sd of [-1, 1]) {
        const px = cx + sd * gx;
        c.fillStyle = "rgba(8,4,12,0.96)";
        c.beginPath();
        c.moveTo(px - 16, hy);
        c.lineTo(px - 11, s.h * 0.2);
        c.lineTo(px + 11, s.h * 0.2);
        c.lineTo(px + 16, hy);
        c.fill();
        ln(c, px - 11, s.h * 0.2, px - 16, hy, a, 0.6, 1.2);
        ln(c, px + 11, s.h * 0.2, px + 16, hy, a, 0.6, 1.2);
        for (let k = 0; k < 7; k++) ln(c, px - 8, s.h * 0.26 + k * ((hy - s.h * 0.3) / 7), px + 8, s.h * 0.26 + k * ((hy - s.h * 0.3) / 7), w, Math.sin(s.t * 3 + k + sd) > 0.2 ? 0.6 : 0.15, 1);
      }
      c.globalCompositeOperation = "lighter";
      const ff = c.createLinearGradient(cx - gx, 0, cx + gx, 0);
      ff.addColorStop(0, A(a, 0));
      ff.addColorStop(0.5, A(a, 0.1));
      ff.addColorStop(1, A(a, 0));
      c.fillStyle = ff;
      c.fillRect(cx - gx, s.h * 0.2, gx * 2, hy - s.h * 0.2);
      for (let i = 0; i < 4; i++) ln(c, cx - gx, s.h * 0.2 + ((s.t * 0.12 + i / 4) % 1) * (hy - s.h * 0.2), cx + gx, s.h * 0.2 + ((s.t * 0.12 + i / 4) % 1) * (hy - s.h * 0.2), a, 0.35, 1.4);
      c.globalCompositeOperation = "source-over";
      const mh = hy - s.h * 0.16;
      c.fillStyle = "rgba(6,3,10,0.98)";
      c.beginPath();
      c.moveTo(cx - 26, hy);
      c.lineTo(cx - 14, hy - mh);
      c.lineTo(cx + 14, hy - mh);
      c.lineTo(cx + 26, hy);
      c.fill();
      ln(c, cx - 14, hy - mh, cx - 26, hy, a, 0.7, 1.4);
      ln(c, cx + 14, hy - mh, cx + 26, hy, a, 0.7, 1.4);
      ln(c, cx, hy - mh, cx, hy, b, 0.55, 1);
      c.globalCompositeOperation = "lighter";
      const topY = hy - mh;
      const beat = Math.max(0, Math.sin(s.t * 2.2)) ** 3;
      glow(c, cx, topY, u * 0.25, a, 0.28 + beat * 0.2);
      dot(c, cx, topY, 4 + beat * 3, w, 0.95);
      for (let i = 0; i < 6; i++) {
        const k = (s.t * 0.22 + i / 6) % 1;
        ring(c, cx, topY, k * u * 0.7, i % 2 ? b : a, (1 - k) * 0.55, 2.2 - k * 1.6, Math.PI * 1.1, Math.PI * 1.9);
      }
      for (const p of s.m.pk) {
        p.y -= (p.v * s.dt) / s.h;
        if (p.y < 0.12) { p.y = 0.95; p.x = Math.random(); }
        dot(c, cx + (p.x - 0.5) * 22 * (0.4 + p.y), p.y * s.h, 1 + p.z * 1.4, p.z > 0.6 ? w : a, 0.7);
      }
      const g = s.m.gl;
      if (s.t > g.next) { g.until = s.t + 0.25; g.next = s.t + 3 + Math.random() * 4; g.y = Math.random() * s.h; g.h = 6 + Math.random() * 30; }
      if (s.t < g.until) { c.fillStyle = A(a, 0.12); c.fillRect(0, g.y, s.w, g.h); ln(c, 0, g.y, s.w * 0.5, g.y, w, 0.55, 1); }
      c.globalCompositeOperation = "source-over";
      const edge = c.createRadialGradient(s.w / 2, s.h / 2, s.h * 0.35, s.w / 2, s.h / 2, Math.hypot(s.w, s.h) * 0.6);
      edge.addColorStop(0, A(a, 0));
      edge.addColorStop(1, A(a, 0.1 + beat * 0.12));
      c.fillStyle = edge;
      c.fillRect(0, 0, s.w, s.h);
    },
  };

  // Architecte du Néant : un hypercube se construit sur un plan d'architecte, puis se fracture.
  BOSS[2] = {
    pal: ["#45e5d2", "#ffbd69", "#e6fffb"],
    init(s) {
      const r = rng(83);
      s.m.fl = Array.from({ length: cnt(s, 22) }, () => ({ x: r(), y: r(), z: r(), v: 4 + r() * 10 }));
    },
    draw(c, s) {
      const [a, b, w] = s.pal;
      const u = Math.min(s.w, s.h);
      const cx = s.w / 2 + s.mx * 24;
      const cy = s.h * 0.46 + s.my * 12;
      sky(c, s, "#020a0c", "#07151a");
      glow(c, cx, cy, u * 0.9, a, 0.14);
      c.globalCompositeOperation = "lighter";
      for (let i = 0; i < 8; i++) ln(c, 0, s.h * 0.1 + (i * s.h * 0.85) / 8, s.w, s.h * 0.1 + (i * s.h * 0.85) / 8, a, 0.04, 1);
      ring(c, cx, cy, u * 0.46, a, 0.2, 1);
      ring(c, cx, cy, u * 0.46 + 14, b, 0.14, 1, s.t * 0.2, s.t * 0.2 + 2.2);
      for (let i = 0; i < 72; i++) {
        const an = (i / 72) * TAU;
        const l = i % 6 ? 5 : 12;
        ln(c, cx + Math.cos(an) * u * 0.46, cy + Math.sin(an) * u * 0.46, cx + Math.cos(an) * (u * 0.46 + l), cy + Math.sin(an) * (u * 0.46 + l), a, 0.25, 1);
      }
      const cyc = (s.t * 0.09) % 1;
      const build = Math.min(1, cyc / 0.55);
      const frac = cyc > 0.8 ? (cyc - 0.8) / 0.2 : 0;
      const V = [];
      for (let i = 0; i < 8; i++) V.push([i & 1 ? 1 : -1, i & 2 ? 1 : -1, i & 4 ? 1 : -1]);
      const edges = [];
      for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) if ([1, 2, 4].includes(i ^ j)) edges.push([i, j]);
      const ay = s.t * 0.25;
      const ax = 0.5 + Math.sin(s.t * 0.15) * 0.2;
      const Pt = (v, sc) => {
        const q = rot3(v[0] * sc, v[1] * sc, v[2] * sc, ax, ay);
        return proj(q[0], q[1], q[2], cx, cy, u * 1.6);
      };
      const big = u * 0.26;
      const small = u * 0.13;
      let ei = 0;
      const lit = build * edges.length * 3;
      const jit = frac * u * 0.05;
      const draw = (p1, p2, k) => {
        if (ei++ > lit) return;
        const ox = Math.sin(ei * 12.7) * jit;
        const oy = Math.cos(ei * 7.3) * jit;
        ln(c, p1[0] + ox, p1[1] + oy, p2[0] + ox, p2[1] + oy, k ? b : a, (0.3 + 0.55 * Math.min(1, (lit - ei) / 6)) * (1 - frac * 0.7), k ? 1 : 1.8);
      };
      for (const [i, j] of edges) draw(Pt(V[i], big), Pt(V[j], big), 0);
      for (const [i, j] of edges) draw(Pt(V[i], small), Pt(V[j], small), 1);
      for (let i = 0; i < 8; i++) draw(Pt(V[i], big), Pt(V[i], small), 1);
      if (build > 0.9) for (let i = 0; i < 8; i++) { const p = Pt(V[i], big); dot(c, p[0], p[1], 2.5, w, 0.8 * (1 - frac)); }
      glow(c, cx, cy, u * 0.2, b, 0.18 + frac * 0.3);
      ln(c, cx - big * 1.7, cy + big * 1.5, cx + big * 1.7, cy + big * 1.5, a, 0.35, 1);
      ln(c, cx - big * 1.7, cy + big * 1.45, cx - big * 1.7, cy + big * 1.55, a, 0.5, 1);
      ln(c, cx + big * 1.7, cy + big * 1.45, cx + big * 1.7, cy + big * 1.55, a, 0.5, 1);
      for (const f of s.m.fl) {
        f.y -= (f.v * s.dt) / s.h;
        if (f.y < -0.1) f.y = 1.1;
        const px = f.x * s.w + s.mx * 30 * f.z;
        const py = f.y * s.h;
        const sz = 14 + f.z * 40;
        c.strokeStyle = A(f.z > 0.5 ? b : a, 0.12 + f.z * 0.25);
        c.lineWidth = 1;
        c.strokeRect(px, py, sz, sz * 0.55);
        ln(c, px, py, px + sz, py + sz * 0.55, a, 0.08, 1);
      }
      c.globalCompositeOperation = "source-over";
    },
  };

  // L'Occulteur : un iris d'obturateurs se referme sur un soleil volé.
  BOSS[3] = {
    pal: ["#ff4fd8", "#ffd24d", "#ffffff"],
    init(s) {
      const r = rng(97);
      s.m.sh = Array.from({ length: cnt(s, 18) }, () => ({ x: r() * s.w, y: r() * s.h, sz: 10 + r() * 34, a: r() * 6, va: (r() - 0.5) * 0.4, vy: -4 - r() * 12, d: 0.3 + r() * 0.9 }));
    },
    draw(c, s) {
      const [a, b, gold] = s.pal;
      const u = Math.min(s.w, s.h);
      const cx = s.w / 2 + s.mx * 28;
      const cy = s.h * 0.42 + s.my * 14;
      const R = u * 0.2;
      sky(c, s, "#06020f", "#150826");
      stars(c, s, gold, 110);
      c.globalCompositeOperation = "lighter";
      const cyc = 0.5 + 0.5 * Math.sin(s.t * 0.22);
      const ap = R * (0.2 + 0.8 * (1 - cyc ** 1.5));
      glow(c, cx, cy, R * (3 + cyc * 2), b, 0.22 + cyc * 0.2);
      glow(c, cx, cy, R * 2, a, 0.35);
      dot(c, cx, cy, R * 0.9, gold, 0.9);
      glow(c, cx, cy, R * 1.3, gold, 0.5);
      c.save();
      c.translate(cx, cy);
      c.rotate(s.t * 0.04);
      for (let i = 0; i < 24; i++) {
        c.save();
        c.rotate((i / 24) * TAU);
        const len = R * (1.5 + 1.6 * cyc * (0.6 + 0.4 * Math.sin(s.t + i * 2.1)));
        const g = c.createLinearGradient(R, 0, len * 1.4, 0);
        g.addColorStop(0, A(a, 0.4));
        g.addColorStop(1, A(a, 0));
        c.fillStyle = g;
        c.beginPath();
        c.moveTo(R * 0.9, -R * 0.03);
        c.lineTo(len * 1.4, 0);
        c.lineTo(R * 0.9, R * 0.03);
        c.fill();
        c.restore();
      }
      c.restore();
      c.globalCompositeOperation = "source-over";
      c.save();
      c.translate(cx, cy);
      c.rotate(s.t * 0.06);
      for (let i = 0; i < 9; i++) {
        c.save();
        c.rotate((i / 9) * TAU);
        c.fillStyle = "rgba(4,1,10,0.97)";
        c.beginPath();
        c.moveTo(ap, 0);
        c.lineTo(R * 2.6, -R * 1.5);
        c.lineTo(R * 2.6, R * 0.6);
        c.closePath();
        c.fill();
        c.strokeStyle = A(i % 2 ? a : gold, 0.45);
        c.lineWidth = 1.3;
        c.beginPath();
        c.moveTo(ap, 0);
        c.lineTo(R * 2.6, -R * 1.5);
        c.stroke();
        c.restore();
      }
      c.restore();
      ring(c, cx, cy, ap, gold, 0.8, 1.6);
      ring(c, cx, cy, R * 2.4, a, 0.35, 1.2);
      c.globalCompositeOperation = "lighter";
      for (const q of s.m.sh) {
        q.y += q.vy * q.d * s.dt;
        q.a += q.va * s.dt;
        if (q.y < -60) { q.y = s.h + 60; q.x = Math.random() * s.w; }
        c.save();
        c.translate(q.x + s.mx * 30 * q.d, q.y);
        c.rotate(q.a);
        c.strokeStyle = A(a, 0.15 + q.d * 0.3);
        c.lineWidth = 1;
        c.beginPath();
        c.moveTo(-q.sz * 0.5, -q.sz * 0.2);
        c.lineTo(q.sz * 0.3, -q.sz * 0.5);
        c.lineTo(q.sz * 0.5, q.sz * 0.3);
        c.lineTo(-q.sz * 0.2, q.sz * 0.5);
        c.closePath();
        c.stroke();
        c.restore();
      }
      c.globalCompositeOperation = "source-over";
      floorGrid(c, s, a, s.h * 0.86, 0.1, 0.5);
    },
  };

  // ---- Surcouche de progression -------------------------------------------
  function overlay(c, s) {
    c.save();
    c.globalCompositeOperation = "lighter";
    if (s.tier >= 2) {
      const m = 16;
      const l = Math.min(70, s.w * 0.09);
      c.strokeStyle = A(s.pal[0], 0.4);
      c.lineWidth = 1.5;
      c.beginPath();
      for (const [x, y, dx, dy] of [[m, m, 1, 1], [s.w - m, m, -1, 1], [m, s.h - m, 1, -1], [s.w - m, s.h - m, -1, -1]]) {
        c.moveTo(x + dx * l, y);
        c.lineTo(x, y);
        c.lineTo(x, y + dy * l);
      }
      c.stroke();
      const tx = m + ((s.t * 60) % (s.w - m * 2));
      dot(c, tx, m, 1.8, s.pal[0], 0.8);
      dot(c, s.w - tx, s.h - m, 1.8, s.pal[0], 0.8);
    }
    if (s.tier >= 3 && s.dust) {
      for (const d of s.dust) {
        d.y -= d.v * s.dt;
        if (d.y < -4) { d.y = s.h + 4; d.x = Math.random() * s.w; }
        c.fillStyle = A(s.pal[d.z > 0.5 ? 1 : 0], 0.2 + d.z * 0.45);
        c.fillRect(d.x + s.mx * 26 * d.z, d.y, 1 + d.z * 1.6, 1 + d.z * 1.6);
      }
    }
    if (s.tier >= 4) {
      const p = bp(s.t, 0.6);
      glow(c, 0, s.h * 0.5, s.h * 0.7, s.pal[0], 0.07 + p * 0.05, 0.5, 1);
      glow(c, s.w, s.h * 0.5, s.h * 0.7, s.pal[1], 0.07 + (1 - p) * 0.05, 0.5, 1);
    }
    c.restore();
  }

  function build(pal, tier, rich, m) {
    const p = pal.map(rgb);
    return {
      pal: p,
      rich,
      tier,
      init(s) {
        s.rich = rich;
        s.tier = tier;
        s.m = {};
        const r = rng(7);
        s.dust = Array.from({ length: Math.round(28 * s.k * Math.max(0, tier - 2)) }, () => ({ x: r() * s.w, y: r() * s.h, v: 8 + r() * 26, z: r() }));
        if (m.init) m.init(s);
      },
      draw(c, s) {
        c.save();
        if (m.bg !== false && !m.pal) {
          sky(c, s, "#02040b", "#050a14");
          glow(c, s.w / 2, s.h * 1.05, s.w * 0.7, s.pal[0], 0.05 + rich * 0.05, 1, 0.5);
          c.globalCompositeOperation = "lighter";
        }
        m.draw(c, s);
        c.restore();
        overlay(c, s);
      },
    };
  }

  window.EchoesSceneMotifs = {
    level(n) {
      const d = LEVELS[n];
      if (!d) return null;
      return build(d[0], n <= 10 ? 1 : n <= 20 ? 2 : n <= 30 ? 3 : 4, 0.25 + (0.75 * (n - 1)) / 39, M[d[1]](d[2] || {}));
    },
    make(name, pal, tier, rich) {
      return M[name] ? build(pal, tier, rich, M[name]()) : null;
    },
    boss(n) {
      const b = BOSS[n];
      return b ? build(b.pal, 4, 1, b) : null;
    },
  };
})();
