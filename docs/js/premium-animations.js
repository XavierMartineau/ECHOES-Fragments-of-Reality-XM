// ============================================================================
// Animations « premium » : balayage lumineux, relief 3D des panneaux, révélation au défilement.
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

  };

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
})();
