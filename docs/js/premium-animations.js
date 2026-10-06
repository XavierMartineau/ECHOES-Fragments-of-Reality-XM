// ============================================================================
// Animations « premium » : balayage lumineux, relief 3D des panneaux, révélation au défilement, confettis de réussite.
// ============================================================================
(() => {
  const script = document.currentScript;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (script) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = new URL("../css/premium-animations.css", script.src).href;
    document.head.appendChild(link);
  }
  if (reduced) return;

  const palette = ["#8fd0ff", "#ffd166", "#80ffcf", "#ff9ad5", "#ffffff"];

  // Lance une gerbe de confettis depuis un point de l'écran.
  const burst = (x, y, count = 46) => {
    for (let index = 0; index < count; index += 1) {
      const piece = document.createElement("span");
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.3;
      const distance = 90 + Math.random() * 220;
      piece.className = "fx-confetti";
      piece.style.left = `${x}px`;
      piece.style.top = `${y}px`;
      piece.style.background = palette[index % palette.length];
      piece.style.setProperty("--fx-x", `${Math.cos(angle) * distance}px`);
      piece.style.setProperty("--fx-y", `${Math.sin(angle) * distance + 140}px`);
      piece.style.setProperty("--fx-r", `${(Math.random() - 0.5) * 900}deg`);
      piece.style.setProperty("--fx-t", `${1.1 + Math.random() * 0.9}s`);
      piece.setAttribute("aria-hidden", "true");
      document.body.appendChild(piece);
      piece.addEventListener("animationend", () => piece.remove());
    }
  };

  const init = () => {
    const scan = document.createElement("div");
    scan.className = "fx-scanline";
    scan.setAttribute("aria-hidden", "true");
    document.body.appendChild(scan);

    if (window.matchMedia("(hover: hover)").matches) {
      document.querySelectorAll(".puzzle-panel").forEach((panel) => {
        panel.addEventListener("pointermove", (event) => {
          if (event.target.closest("input, button")) return;
          const box = panel.getBoundingClientRect();
          const px = (event.clientX - box.left) / box.width - 0.5;
          const py = (event.clientY - box.top) / box.height - 0.5;
          panel.style.transform = `perspective(1400px) rotateX(${(-py * 1.4).toFixed(2)}deg) rotateY(${(px * 1.4).toFixed(2)}deg)`;
        });
        panel.addEventListener("pointerleave", () => {
          panel.style.transform = "";
        });
      });
    }

    if ("IntersectionObserver" in window) {
      const seen = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-in");
            seen.unobserve(entry.target);
          });
        },
        { threshold: 0.12 },
      );
      document.querySelectorAll(".level-footer").forEach((element) => {
        if (element.getBoundingClientRect().top < window.innerHeight) return;
        element.classList.add("fx-reveal");
        seen.observe(element);
      });
    }

    // Confettis dès qu'un message de réussite apparaît.
    document.querySelectorAll(".puzzle-status, #puzzleStatus").forEach((status) => {
      let wasSuccess = status.classList.contains("success");
      new MutationObserver(() => {
        const now = status.classList.contains("success");
        if (now && !wasSuccess) {
          const box = status.getBoundingClientRect();
          burst(box.left + box.width / 2, Math.min(Math.max(box.top, 80), window.innerHeight - 80), 34);
        }
        wasSuccess = now;
      }).observe(status, { attributes: true, attributeFilter: ["class"] });
    });

    const next = document.querySelector(".next-level-button");
    if (next) {
      new MutationObserver(() => {
        if (next.hidden) return;
        const box = next.getBoundingClientRect();
        burst(window.innerWidth / 2, Math.min(Math.max(box.top, 100), window.innerHeight - 100), 80);
      }).observe(next, { attributes: true, attributeFilter: ["hidden"] });
    }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
