(() => {
  const NS = "http://www.w3.org/2000/svg";
  const pieceHeight = 87;

  const makeSvg = (src, index, className, crop) => {
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", className);
    svg.setAttribute("viewBox", `${crop ? 30 : 0} ${index * pieceHeight} ${crop ? 120 : 180} ${pieceHeight}`);
    svg.setAttribute("aria-hidden", "true");
    const image = document.createElementNS(NS, "image");
    image.setAttribute("href", src);
    image.setAttribute("width", "180");
    image.setAttribute("height", "260");
    svg.appendChild(image);
    return svg;
  };

  const lang = localStorage.getItem("echoes-language") === "en" ? "en" : "fr";
  const cineText = {
    fr: { title: (n) => `CLÉ 0${n} COMPLÈTE`, sub: "Les trois fragments se rejoignent. La clé est reconstituée.", next: "CONTINUER", close: "Fermer" },
    en: { title: (n) => `KEY 0${n} COMPLETE`, sub: "The three fragments join together. The key is restored.", next: "CONTINUE", close: "Close" },
  }[lang];

  const playCinematic = ({ keyNumber, src, onContinue }) => {
    const root = document.createElement("div");
    root.className = "kf-cine";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    const rays = document.createElement("div");
    rays.className = "kf-cine-rays";
    const rings = document.createElement("div");
    rings.className = "kf-cine-rings";
    rings.append(document.createElement("span"), document.createElement("span"), document.createElement("span"));
    const key = document.createElement("div");
    key.className = "kf-cine-key";
    [0, 1, 2].forEach((index) => key.appendChild(makeSvg(src, index, `kf-cine-piece piece-${index}`, false)));
    const sparks = document.createElement("div");
    sparks.className = "kf-cine-sparks";
    const hues = ["#79f7ff", "#45e5d2", "#ffd24d", "#c084fc"];
    for (let index = 0; index < 36; index += 1) {
      const spark = document.createElement("i");
      const angle = (index / 36) * Math.PI * 2;
      const distance = 160 + Math.random() * 220;
      spark.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
      spark.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
      spark.style.setProperty("--delay", `${3.1 + Math.random() * 0.5}s`);
      spark.style.setProperty("--hue", hues[index % hues.length]);
      sparks.appendChild(spark);
    }
    const title = document.createElement("h2");
    title.className = "kf-cine-title";
    title.textContent = cineText.title(keyNumber);
    const sub = document.createElement("p");
    sub.className = "kf-cine-sub";
    sub.textContent = cineText.sub;
    const actions = document.createElement("div");
    actions.className = "kf-cine-actions";
    actions.hidden = true;
    const next = document.createElement("button");
    next.type = "button";
    next.className = "next-level-button kf-cine-button";
    next.textContent = cineText.next;
    const close = document.createElement("button");
    close.type = "button";
    close.className = "reset-button kf-cine-close";
    close.textContent = cineText.close;
    actions.append(next, close);
    root.append(rays, rings, key, sparks, title, sub, actions);
    document.body.appendChild(root);

    const dismiss = () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", onKey);
      root.remove();
    };
    const onKey = (event) => { if (event.key === "Escape") dismiss(); };
    document.addEventListener("keydown", onKey);
    close.addEventListener("click", dismiss);
    next.addEventListener("click", () => {
      dismiss();
      if (onContinue) onContinue();
    });
    void root.offsetWidth;
    root.classList.add("is-playing");
    const timer = window.setTimeout(() => {
      actions.hidden = false;
      next.focus();
    }, 4300);
  };
  window.EchoesKeyFragments = {
    playCinematic,
    mount({ keyNumber, src, core, before, label }) {
      const assembly = document.createElement("div");
      assembly.className = "kf-assembly";
      assembly.setAttribute("aria-live", "polite");
      const title = document.createElement("span");
      title.className = "kf-label";
      title.textContent = label || `CLÉ 0${keyNumber} // ASSEMBLAGE`;
      const slotsBox = document.createElement("div");
      slotsBox.className = "kf-slots";
      const count = document.createElement("span");
      count.className = "kf-count";
      const slots = [0, 1, 2].map((index) => {
        const slot = document.createElement("span");
        slot.className = "kf-slot";
        slot.appendChild(makeSvg(src, index, "kf-slot-piece", false));
        slotsBox.appendChild(slot);
        return slot;
      });
      assembly.append(title, slotsBox, count);
      before.parentNode.insertBefore(assembly, before);

      let corePiece = null;
      if (core) {
        corePiece = document.createElement("span");
        corePiece.className = "kf-core";
        corePiece.setAttribute("aria-hidden", "true");
        core.classList.add("kf-host");
        core.appendChild(corePiece);
      }

      let shown = -1;
      const set = (value) => {
        const earned = Math.max(0, Math.min(3, value));
        count.textContent = `${earned} / 3`;
        slots.forEach((slot, index) => {
          const isEarned = index < earned;
          if (isEarned && !slot.classList.contains("is-earned")) {
            slot.classList.remove("is-pop");
            void slot.offsetWidth;
            slot.classList.add("is-pop");
          }
          slot.classList.toggle("is-earned", isEarned);
          if (!isEarned) slot.classList.remove("is-pop");
        });
        if (!corePiece || shown === earned) return;
        shown = earned;
        core.classList.toggle("kf-complete", earned === 3);
        corePiece.replaceChildren(makeSvg(src, Math.min(earned, 2), "kf-core-piece", true));
        corePiece.classList.remove("is-hit");
        void corePiece.offsetWidth;
        corePiece.classList.add("is-hit");
      };

      return { set, corePiece };
    },
  };
})();