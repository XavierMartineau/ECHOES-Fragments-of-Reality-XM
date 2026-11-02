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
    #fx-dot,#fx-ring{position:fixed;left:0;top:0;pointer-events:none;z-index:2147483647;opacity:0;transition:opacity .2s,width .2s,height .2s,margin .2s,border-color .2s,background .2s,border-radius .2s,box-shadow .2s}
    #fx-dot{width:6px;height:6px;margin:-3px 0 0 -3px;border:1px solid #fff;border-radius:50%;background:rgb(var(--fx-rgb));box-shadow:0 0 10px 2px rgba(var(--fx-rgb),.7);transition:opacity .2s,width .16s,height .16s,margin .16s,background .2s,box-shadow .2s}
    #fx-ring{width:34px;height:34px;margin:-17px 0 0 -17px;border-radius:50%;border:1px solid rgba(var(--fx-rgb),.62);box-shadow:0 0 14px rgba(var(--fx-rgb),.2),inset 0 0 8px rgba(var(--fx-rgb),.1)}
    #fx-ring::before,#fx-ring::after{content:"";position:absolute;left:50%;top:50%;background:rgba(var(--fx-rgb),.9);opacity:0;transition:opacity .16s}
    #fx-ring::before{width:9px;height:1px;margin:0 0 0 -4px}
    #fx-ring::after{width:1px;height:9px;margin:-4px 0 0 0}
    .fx-on #fx-dot,.fx-on #fx-ring{opacity:1}
    .fx-hover #fx-ring{width:42px;height:42px;margin:-21px 0 0 -21px;border-color:#fff;background:rgba(var(--fx-rgb),.1);box-shadow:0 0 18px rgba(var(--fx-rgb),.4),inset 0 0 10px rgba(var(--fx-rgb),.14)}
    .fx-hover #fx-ring::before,.fx-hover #fx-ring::after{opacity:.8}
    .fx-hover #fx-dot{width:4px;height:4px;margin:-2px 0 0 -2px;box-shadow:0 0 12px 3px rgba(var(--fx-rgb),.85)}
    .fx-grab #fx-ring{border-radius:9px;border-style:dashed}
    .fx-grabbing #fx-ring{width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:7px;background:rgba(var(--fx-rgb),.2)}
    .fx-crosshair #fx-ring{border-radius:8px}
    .fx-down #fx-ring{width:24px;height:24px;margin:-12px 0 0 -12px;background:rgba(var(--fx-rgb),.28);box-shadow:0 0 22px rgba(var(--fx-rgb),.55)}
    .fx-click #fx-ring{border-color:#fff;box-shadow:0 0 24px rgba(var(--fx-rgb),.7),inset 0 0 10px rgba(var(--fx-rgb),.2)}
    .fx-disabled #fx-ring{border-style:dashed;border-color:rgba(160,170,190,.5);background:none;box-shadow:none}
    .fx-disabled #fx-ring::before,.fx-disabled #fx-ring::after{opacity:0}
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
  const DRAGGABLE = "[draggable=true],[data-cursor=grab],.drag-handle,.puzzle-piece,.resonance-piece,.alignment-token,.sorting-token,.color-symbol,.geometry-point";
  const CROSSHAIR = "[data-cursor=crosshair],.flow-cell,.rhythm-pulse";
  const TEXT = "input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=button]):not([type=submit]),textarea,[contenteditable=true]";
  let x = -100;
  let y = -100;
  let rx = x;
  let ry = y;
  let started = false;
  let frame = 0;
  let pressed = false;
  let overDraggable = false;
  let clickTimer;

  const render = () => {
    frame = 0;
    const easing = reduce ? 1 : 0.2;
    rx += (x - rx) * easing;
    ry += (y - ry) * easing;
    dot.style.transform = `translate3d(${x}px,${y}px,0)`;
    ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;
    if (Math.abs(x - rx) > 0.1 || Math.abs(y - ry) > 0.1)
      frame = requestAnimationFrame(render);
  };

  const scheduleRender = () => {
    if (!frame) frame = requestAnimationFrame(render);
  };

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
    const draggable = el && el.closest(DRAGGABLE);
    const crosshair = el && el.closest(CROSSHAIR);
    const pointerTarget = hit || draggable || crosshair;
    const disabled = pointerTarget &&
      (pointerTarget.matches(":disabled") ||
        pointerTarget.getAttribute("aria-disabled") === "true");
    overDraggable = !!draggable && !disabled;
    root.classList.toggle("fx-hover", !!pointerTarget && !disabled);
    root.classList.toggle("fx-disabled", !!disabled);
    root.classList.toggle("fx-grab", overDraggable && !e.buttons);
    root.classList.toggle("fx-grabbing", overDraggable && !!e.buttons);
    root.classList.toggle("fx-crosshair", !!crosshair);
    root.classList.toggle("fx-text", !!(el && el.closest(TEXT)));
    window.__echoesPointer = { x, y };
    scheduleRender();

    // Projecteur lumineux sur le panneau central et attraction magnétique des boutons d'accueil.
    if (document.body.classList.contains("index-page")) {
      root.style.setProperty("--mx", `${x}px`);
      root.style.setProperty("--my", `${y}px`);
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
  window.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    pressed = true;
    root.classList.remove("fx-click");
    root.classList.add("fx-down");
  }, { passive: true });
  window.addEventListener("pointerup", (e) => {
    if (e.button !== 0) return;
    const wasPressed = pressed;
    pressed = false;
    root.classList.remove("fx-down", "fx-grabbing");
    root.classList.toggle("fx-grab", overDraggable);
    if (!wasPressed) return;
    root.classList.add("fx-click");
    window.clearTimeout(clickTimer);
    clickTimer = window.setTimeout(() => root.classList.remove("fx-click"), 180);
  }, { passive: true });
  window.addEventListener("pointercancel", () => {
    pressed = false;
    root.classList.remove("fx-down", "fx-grabbing");
    root.classList.toggle("fx-grab", overDraggable);
  }, { passive: true });
  document.addEventListener("pointerleave", () => {
    pressed = false;
    overDraggable = false;
    root.classList.remove(
      "fx-on",
      "fx-hover",
      "fx-grab",
      "fx-grabbing",
      "fx-crosshair",
      "fx-text",
      "fx-down",
    );
  });
  document.addEventListener("pointerenter", () => started && root.classList.add("fx-on"));
})();
