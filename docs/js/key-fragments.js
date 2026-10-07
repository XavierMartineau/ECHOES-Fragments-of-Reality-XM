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

  window.EchoesKeyFragments = {
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