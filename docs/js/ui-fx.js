// UI FX // curseur premium (point + anneau à inertie), scrollbars thématiques et sélection de texte.
// Couleur pilotée par --fx-rgb (posée par scene-bg.js selon l'univers de la page).
(() => {
  if (window.__echoesUiFx) return;
  window.__echoesUiFx = true;

  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const style = document.createElement("style");
  style.textContent = `
    :root{--fx-rgb:121,247,255}
    ::selection{background:rgba(var(--fx-rgb),.28);color:#fff}
    ::-webkit-scrollbar{width:10px;height:10px}
    ::-webkit-scrollbar-track{background:linear-gradient(90deg,transparent 40%,rgba(var(--fx-rgb),.07) 50%,transparent 60%)}
    ::-webkit-scrollbar-thumb{background:linear-gradient(180deg,rgba(var(--fx-rgb),.75),rgba(179,108,255,.7));border-radius:10px;border:3px solid transparent;background-clip:padding-box;box-shadow:0 0 10px rgba(var(--fx-rgb),.35);transition:background .3s}
    ::-webkit-scrollbar-thumb:hover{background:linear-gradient(180deg,rgb(var(--fx-rgb)),rgba(210,150,255,.95));background-clip:padding-box;border-width:2px}
    ::-webkit-scrollbar-thumb:active{background:#fff;background-clip:padding-box}
    ::-webkit-scrollbar-corner{background:transparent}
    @supports not selector(::-webkit-scrollbar){*{scrollbar-width:thin;scrollbar-color:rgba(var(--fx-rgb),.7) transparent}}
    :focus-visible{outline:2px solid rgba(var(--fx-rgb),.85);outline-offset:3px;border-radius:4px}
    .fx-cursor-on,.fx-cursor-on *{cursor:none!important}
    .fx-cursor-on input:not([type=checkbox]):not([type=radio]):not([type=range]),.fx-cursor-on textarea,.fx-cursor-on [contenteditable]{cursor:text!important}
    #fx-dot,#fx-ring{position:fixed;left:0;top:0;pointer-events:none;z-index:2147483647;opacity:0;transition:opacity .25s,width .25s,height .25s,margin .25s,border-color .25s,background .25s}
    #fx-dot{width:6px;height:6px;margin:-3px 0 0 -3px;border-radius:50%;background:rgb(var(--fx-rgb));box-shadow:0 0 10px 2px rgba(var(--fx-rgb),.6)}
    #fx-ring{width:30px;height:30px;margin:-15px 0 0 -15px;border-radius:50%;border:1px solid rgba(var(--fx-rgb),.55);box-shadow:0 0 14px rgba(var(--fx-rgb),.18),inset 0 0 8px rgba(var(--fx-rgb),.1)}
    #fx-ring::before,#fx-ring::after{content:"";position:absolute;left:50%;top:50%;background:rgba(var(--fx-rgb),.7);transition:opacity .25s}
    #fx-ring::before{width:8px;height:1px;margin:0 0 0 -4px;opacity:0;box-shadow:0 0 0 0 transparent}
    #fx-ring::after{width:1px;height:8px;margin:-4px 0 0 0;opacity:0}
    .fx-on #fx-dot,.fx-on #fx-ring{opacity:1}
    .fx-hover #fx-ring{width:46px;height:46px;margin:-23px 0 0 -23px;border-color:rgba(var(--fx-rgb),.95);background:rgba(var(--fx-rgb),.08)}
    .fx-hover #fx-dot{width:4px;height:4px;margin:-2px 0 0 -2px}
    .fx-down #fx-ring{width:22px;height:22px;margin:-11px 0 0 -11px;background:rgba(var(--fx-rgb),.2)}
    .fx-disabled #fx-ring{border-style:dashed;border-color:rgba(160,170,190,.5);background:none}
    .fx-disabled #fx-dot{background:#8a93a8;box-shadow:none}
    .fx-text #fx-ring{opacity:0!important}
    .fx-text #fx-dot{width:2px;height:18px;margin:-9px 0 0 -1px;border-radius:1px}
    @media (prefers-reduced-motion:reduce){#fx-ring,#fx-dot{transition:none}}
  `;
  document.head.appendChild(style);

  if (!fine || localStorage.getItem("echoes-fx-cursor") === "off") return;

  const root = document.documentElement;
  const dot = document.createElement("div");
  dot.id = "fx-dot";
  const ring = document.createElement("div");
  ring.id = "fx-ring";
  document.body.append(ring, dot);
  root.classList.add("fx-cursor-on");

  const INTERACTIVE = "a[href],button,[role=button],summary,select,label[for],input[type=checkbox],input[type=radio],input[type=range],.level-card,.dev-mode-toggle,[data-cursor=hover]";
  const TEXT = "input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=button]):not([type=submit]),textarea,[contenteditable=true]";
  let x = -100;
  let y = -100;
  let rx = x;
  let ry = y;
  let started = false;

  window.addEventListener("pointermove", (e) => {
    x = e.clientX;
    y = e.clientY;
    if (!started) {
      started = true;
      rx = x;
      ry = y;
      root.classList.add("fx-on");
    }
    const el = e.target instanceof Element ? e.target : null;
    const hit = el && el.closest(INTERACTIVE);
    root.classList.toggle("fx-hover", !!hit);
    root.classList.toggle("fx-disabled", !!(hit && (hit.disabled || hit.getAttribute("aria-disabled") === "true")));
    root.classList.toggle("fx-text", !!(el && el.closest(TEXT)));
    window.__echoesPointer = { x, y };

    // Projecteur lumineux sur le panneau central et attraction magnétique des boutons d'accueil.
    if (document.body.classList.contains("index-page")) {
      const panel = document.querySelector(".content");
      if (panel) {
        const r = panel.getBoundingClientRect();
        panel.style.setProperty("--mx", `${x - r.left}px`);
        panel.style.setProperty("--my", `${y - r.top}px`);
      }
      if (!reduce) {
        document.querySelectorAll(".primary-btn,.strobe-notice button,.lang-btn").forEach((b) => {
          const r = b.getBoundingClientRect();
          const dx = x - (r.left + r.width / 2);
          const dy = y - (r.top + r.height / 2);
          const near = Math.hypot(dx / (r.width / 2 + 40), dy / (r.height / 2 + 40)) < 1;
          b.style.translate = near ? `${(dx * 0.12).toFixed(1)}px ${(dy * 0.18).toFixed(1)}px` : "";
        });
      }
    }
  }, { passive: true });
  window.addEventListener("pointerdown", () => root.classList.add("fx-down"), { passive: true });
  window.addEventListener("pointerup", () => root.classList.remove("fx-down"), { passive: true });
  document.addEventListener("pointerleave", () => root.classList.remove("fx-on"));
  document.addEventListener("pointerenter", () => started && root.classList.add("fx-on"));

  const k = reduce ? 1 : 0.2;
  (function loop() {
    rx += (x - rx) * k;
    ry += (y - ry) * k;
    dot.style.transform = `translate3d(${x}px,${y}px,0)`;
    ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;
    requestAnimationFrame(loop);
  })();
})();
