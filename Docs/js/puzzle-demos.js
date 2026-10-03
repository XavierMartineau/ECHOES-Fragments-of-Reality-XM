// Shared examples for every puzzle page.
(() => {
  const language =
    localStorage.getItem("echoes-language") === "en" ? "en" : "fr";
  const examples = [
    [".light-sequence", "Observe l'ordre des lumières, puis clique sur les mêmes piliers dans cet ordre.", "Watch the lights, then click the same pillars in that order.", ["Émeraude", "Or", "Azur"], ["Emerald", "Gold", "Azure"], ["demo-green", "demo-gold", "demo-sky"]],
    [".puzzle-piece", "Aligne chaque forme avec l'emplacement qui correspond à sa couleur et à son symbole.", "Match each shape with the slot that corresponds to its color and symbol.", ["Triangle", "Cercle", "Carré"], ["Triangle", "Circle", "Square"], ["demo-gold", "demo-sky", "demo-violet"]],
    [".sort-board, .advanced-sort-board", "Place chaque forme dans la zone portant la même couleur.", "Place each shape in the area with the matching color.", ["Rouge", "Bleu", "Vert"], ["Red", "Blue", "Green"], ["demo-red", "demo-blue", "demo-green"]],
    [".rotation-board", "Fais pivoter l'objet jusqu'à ce qu'il corresponde à l'orientation cible.", "Rotate the object until it matches the target orientation.", ["Cible 90°", "Objet ↻"], ["Target 90°", "Object ↻"], ["demo-gold", "demo-violet"]],
    [".sound-board, .color-sequence-board, .constellation-board, .combined-sequence-board", "Mémorise la séquence présentée, puis reproduis-la exactement.", "Memorize the shown sequence, then reproduce it exactly.", ["1", "2", "3", "4"], ["1", "2", "3", "4"], ["demo-pink", "demo-cyan", "demo-orange", "demo-violet"]],
    [".pattern-board, .fractal-board", "Active uniquement les symboles qui correspondent au motif cible.", "Activate only the symbols that match the target pattern.", ["✓", "×", "✓"], ["✓", "×", "✓"], ["demo-green", "demo-red", "demo-green"]],
    [".gate-board, .cross-light-board, .ordering-board", "Suis l'ordre indiqué et active chaque élément une seule fois.", "Follow the shown order and activate each element once.", ["01", "02", "03"], ["01", "02", "03"], ["demo-cyan", "demo-gold", "demo-pink"]],
    [".pairs-board", "Retourne deux cartes à la fois et retrouve les symboles identiques.", "Reveal two cards at a time and find the matching symbols.", ["◆ ◆", "● ●", "★ ★"], ["◆ ◆", "● ●", "★ ★"], ["demo-violet", "demo-cyan", "demo-gold"]],
  ];

  document.querySelectorAll(".puzzle-panel").forEach((panel) => {
    if (panel.querySelector(".sequence-demo, .generic-demo")) return;
    const example = examples.find(([selector]) => {
      return panel.matches(selector) || panel.querySelector(selector);
    });
    if (!example) return;

    const wrapper = document.createElement("div");
    wrapper.className = "generic-demo";
    const button = document.createElement("button");
    button.className = "sequence-demo-button";
    button.type = "button";
    button.textContent = language === "en" ? "VIEW AN EXAMPLE" : "VOIR UN EXEMPLE";
    button.setAttribute("aria-expanded", "false");

    const content = document.createElement("div");
    content.className = "sequence-demo-panel";
    content.hidden = true;
    const title = document.createElement("strong");
    title.textContent = language === "en" ? "Demonstration" : "Démonstration";
    const description = document.createElement("p");
    description.textContent = language === "en" ? example[2] : example[1];
    const items = document.createElement("div");
    items.className = "sequence-demo-items";
    const labels = language === "en" ? example[4] : example[3];
    labels.forEach((label, index) => {
      const item = document.createElement("span");
      item.className = `demo-light ${example[5][index]}`;
      item.textContent = label;
      items.appendChild(item);
    });
    content.append(title, description, items);
    wrapper.append(button, content);
    panel.querySelector(".puzzle-actions")?.prepend(wrapper);
    button.addEventListener("click", () => {
      content.hidden = !content.hidden;
      button.setAttribute("aria-expanded", String(!content.hidden));
    });
  });
})();
