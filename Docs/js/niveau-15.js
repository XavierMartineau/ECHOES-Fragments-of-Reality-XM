(() => {
  const board = document.getElementById("flowBoard");
  if (!board) return;

  const language = localStorage.getItem("echoes-language") === "en" ? "en" : "fr";
  const copy = {
    fr: {
      part: "PARTIE 2 // FRACTURES",
      level: "NIVEAU 15",
      eyebrow: "Fragment 015 // Les veines de lumière",
      title: "Les veines de lumière",
      description: "Vingt paires de balises se répondent dans cette grille de 14 par 14. Relie chaque paire par un tracé sinueux, sans croiser les flux. Il n'est pas nécessaire de remplir toute la grille.",
      systemLabel: "ECHO://FLUX",
      puzzleKicker: "PUZZLE // ROUTAGE DE FLUX",
      puzzleTitle: "Réseau de résonance",
      start: "ACTIVER LE RÉSEAU",
      next: "CONTINUER VERS LE NIVEAU 16",
      reset: "Réinitialiser",
      ready: "Maintiens une balise et trace son chemin sinueux jusqu'à la balise de même couleur. Rien ne t'oblige à remplir toute la grille.",
      playing: "Relie les vingt paires sans croiser les flux. Tu peux aussi toucher les cellules une à une.",
      connecting: (color) => `Flux ${color} en cours. Continue jusqu'à sa balise jumelle.`,
      blocked: "Cette cellule est déjà occupée par un autre flux.",
      invalid: "Le chemin ne peut avancer que vers une cellule voisine.",
      lineComplete: (color) => `Paire ${color} reliée. Poursuis les autres flux.`,
      fillRemaining: "Toutes les paires sont reliées.",
      success: "Les vingt flux sont reliés sans croisement. Le réseau est rétabli.",
      system: "SYSTEME:: 20 PAIRES DETECTEES // RESEAU EN ATTENTE",
      systemSuccess: "SYSTEME:: RESEAU 015 RESTAURE // PROTOCOLE 016 DEBLOQUE",
      cell: (row, column) => `Cellule ${row}, ${column}`,
      endpoint: (color, row, column) => `Balise ${color}, ligne ${row}, colonne ${column}`,
      colors: ["red", "orange", "yellow", "lime", "green", "teal", "cyan", "sky", "blue", "indigo", "purple", "magenta", "pink", "brown", "white", "slate", "khaki", "burgundy", "olive", "peach"],
      board: "Grille de connexion 14 par 14",
      progress: "Progression de la Partie 2",
      save: "SAUVEGARDER",
      saved: "SAUVEGARDÉ",
      saveHint: "Progression sauvegardée.",
      footer: "ÉCHO // FRACTURES ACTIVES",
      counter: "15 / 60",
    },
    en: {
      part: "PART 2 // FRACTURES",
      level: "LEVEL 15",
      eyebrow: "Fragment 015 // Veins of light",
      title: "Veins of light",
      description: "Twenty pairs of beacons answer each other across this 14-by-14 grid. Connect every pair with a winding path, without crossing flows. You do not need to fill the whole grid.",
      systemLabel: "ECHO://FLOW",
      puzzleKicker: "PUZZLE // FLOW ROUTING",
      puzzleTitle: "Resonance network",
      start: "ACTIVATE THE NETWORK",
      next: "CONTINUE TO LEVEL 16",
      reset: "Reset",
      ready: "Hold a beacon and trace a winding path to the beacon of the same color. You do not have to fill the whole grid.",
      playing: "Connect all twenty pairs without crossing flows. You can also tap cells one at a time.",
      connecting: (color) => `${color} flow in progress. Continue to its matching beacon.`,
      blocked: "That cell is already occupied by another flow.",
      invalid: "A path can only move into a neighboring cell.",
      lineComplete: (color) => `${color} pair connected. Continue with the other flows.`,
      fillRemaining: "All pairs are connected.",
      success: "All twenty flows are connected without crossing. The network is restored.",
      system: "SYSTEM:: 20 PAIRS DETECTED // NETWORK STANDBY",
      systemSuccess: "SYSTEM:: NETWORK 015 RESTORED // PROTOCOL 016 UNLOCKED",
      cell: (row, column) => `Cell ${row}, ${column}`,
      endpoint: (color, row, column) => `${color} beacon, row ${row}, column ${column}`,
      colors: ["red", "orange", "yellow", "lime", "green", "teal", "cyan", "sky", "blue", "indigo", "purple", "magenta", "pink", "brown", "white", "slate", "khaki", "burgundy", "olive", "peach"],
      board: "14 by 14 connection grid",
      progress: "Part 2 progress",
      save: "SAVE",
      saved: "SAVED",
      saveHint: "Progress saved.",
      footer: "ECHO // ACTIVE FRACTURES",
      counter: "15 / 60",
    },
  }[language];

  const $ = (id) => document.getElementById(id);
  const status = $("puzzleStatus");
  const readout = $("progressReadout");
  const startButton = $("startPuzzleButton");
  const resetButton = $("resetButton");
  const nextButton = $("nextLevelButton");
  const saveButton = $("saveGameButton");
  const systemMessage = $("systemMessage");
  const size = 14;
  const palette = ["#ff1744", "#ff8f00", "#ffea00", "#b2ff00", "#00c853", "#00897b", "#00e5ff", "#80b4ff", "#2962ff", "#5e35b1", "#c158ff", "#ff00d4", "#ff8ab8", "#8d4e2a", "#ffffff", "#78909c", "#e0c9a0", "#7b1030", "#8a8a00", "#ff6e5e"];
  const symbols = [];
  copy.colors.forEach((label) => {
    const letters = label.normalize("NFD").replace(/[^a-zA-Z]/g, "").toUpperCase();
    symbols.push([...letters].find((letter) => !symbols.includes(letter)) ?? "?");
  });
  const randomInt = (max) => Math.floor(Math.random() * max);
  const shuffle = (list) => {
    for (let i = list.length - 1; i > 0; i -= 1) {
      const j = randomInt(i + 1);
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  };
  const neighborsOf = (index) => {
    const row = Math.floor(index / size);
    const column = index % size;
    const result = [];
    if (row > 0) result.push(index - size);
    if (row < size - 1) result.push(index + size);
    if (column > 0) result.push(index - 1);
    if (column < size - 1) result.push(index + 1);
    return result;
  };

  // Chemin hamiltonien aléatoire : serpentin transformé puis mélangé par "backbite".
  const buildHamiltonianPath = () => {
    let path = [];
    for (let row = 0; row < size; row += 1) {
      for (let step = 0; step < size; step += 1) {
        path.push(row * size + (row % 2 === 0 ? step : size - 1 - step));
      }
    }
    const position = new Array(size * size);
    const refresh = () => path.forEach((cell, i) => { position[cell] = i; });
    refresh();
    for (let iteration = 0; iteration < 400; iteration += 1) {
      const atEnd = Math.random() < 0.5;
      if (!atEnd) path.reverse(), refresh();
      const head = path[path.length - 1];
      const options = neighborsOf(head);
      const target = options[randomInt(options.length)];
      const at = position[target];
      if (at < path.length - 2) {
        path = path.slice(0, at + 1).concat(path.slice(at + 1).reverse());
        refresh();
      }
    }
    return path;
  };

  const pairCount = 20;
  // Chaque bloc 4x4 de la grille doit contenir des balises, sans surcharge.
  const isSpread = (routes) => {
    const blocks = Array(16).fill(0);
    routes.forEach((route) => {
      [route[0], route[route.length - 1]].forEach((cell) => {
        const row = Math.floor(Math.floor(cell / size) * 4 / size);
        const column = Math.floor((cell % size) * 4 / size);
        blocks[row * 4 + column] += 1;
      });
    });
    return blocks.every((count) => count >= 1 && count <= 5);
  };

  const generateRoutes = () => {
    for (;;) {
      const path = buildHamiltonianPath();
      const generated = [];
      let offset = randomInt(2);
      while (generated.length < pairCount) {
        let route = null;
        for (let attempt = 0; attempt < 12 && !route; attempt += 1) {
          const length = 6 + randomInt(8);
          const candidate = path.slice(offset, offset + length);
          if (candidate.length < length) break;
          const first = candidate[0];
          const last = candidate[length - 1];
          const distance = Math.abs(Math.floor(first / size) - Math.floor(last / size)) + Math.abs((first % size) - (last % size));
          if (distance >= 5) route = candidate;
        }
        if (!route) break;
        generated.push(route);
        offset += route.length + randomInt(2);
      }
      if (generated.length === pairCount && isSpread(generated)) return generated;
    }
  };
  const colors = [];
  const endpoints = new Map();
  const owners = Array(size * size).fill(null);
  const cells = [];
  const completedPaths = new Map();
  let started = false;
  let solved = false;
  let activeColor = null;
  let activePath = [];
  let isDrawing = false;

  const inkFor = (hex) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    return 0.299 * r + 0.587 * g + 0.114 * b > 120 ? "#050c1d" : "#ffffff";
  };

  const generateLayout = () => {
    const generated = generateRoutes();
    const order = shuffle(Array.from({ length: pairCount }, (_, i) => i));
    colors.length = 0;
    endpoints.clear();
    generated.forEach((route, index) => {
      const color = {
        id: `flow-${order[index]}`,
        label: copy.colors[order[index]],
        hex: palette[order[index]],
        symbol: symbols[order[index]],
        ink: inkFor(palette[order[index]]),
        start: route[0],
        end: route[route.length - 1],
      };
      colors.push(color);
      endpoints.set(color.start, { colorId: color.id, end: color.end });
      endpoints.set(color.end, { colorId: color.id, end: color.start });
    });
  };

  document.documentElement.lang = language;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const value = copy[element.dataset.i18n];
    if (typeof value === "string") element.textContent = value;
  });
  $("levelProgress").setAttribute("aria-label", copy.progress);
  board.setAttribute("aria-label", copy.board);
  startButton.textContent = copy.start;
  resetButton.textContent = copy.reset;
  nextButton.textContent = copy.next;
  saveButton.textContent = copy.save;

  const setStatus = (message, variant = "") => {
    status.textContent = message;
    status.className = `puzzle-status${variant ? ` ${variant}` : ""}`;
  };

  const colorFor = (id) => colors.find((color) => color.id === id);

  const render = () => {
    cells.forEach((cell, index) => {
      const owner = owners[index];
      const color = owner ? colorFor(owner) : null;
      cell.classList.toggle("is-connected", Boolean(color));
      cell.classList.toggle("is-endpoint", endpoints.has(index));
      cell.classList.toggle("is-complete", Boolean(color && completedPaths.has(owner)));
      if (endpoints.has(index) && color) cell.dataset.symbol = color.symbol;
      else delete cell.dataset.symbol;
      if (color) {
        cell.style.setProperty("--flow-color", color.hex);
        cell.style.setProperty("--flow-ink", color.ink);
      }
      else cell.style.removeProperty("--flow-color");

      const endpoint = endpoints.get(index);
      const row = Math.floor(index / size) + 1;
      const column = (index % size) + 1;
      cell.setAttribute(
        "aria-label",
        endpoint
          ? copy.endpoint(colorFor(endpoint.colorId).label, row, column)
          : copy.cell(row, column),
      );
      cell.disabled = !started || solved;
    });
    readout.textContent = `${completedPaths.size} / ${colors.length}`;
  };

  const clearPath = (colorId) => {
    owners.forEach((owner, index) => {
      if (owner === colorId && !endpoints.has(index)) owners[index] = null;
    });
    completedPaths.delete(colorId);
  };

  const beginPath = (colorId, startIndex) => {
    if (!started || solved) return;
    clearPath(colorId);
    activeColor = colorId;
    activePath = [startIndex];
    owners[startIndex] = colorId;
    isDrawing = true;
    render();
    setStatus(copy.connecting(colorFor(colorId).label));
  };

  const isNeighbor = (first, second) => {
    const rowDelta = Math.abs(Math.floor(first / size) - Math.floor(second / size));
    const columnDelta = Math.abs((first % size) - (second % size));
    return rowDelta + columnDelta === 1;
  };

  const advancePath = (nextIndex) => {
    if (!activeColor || !started || solved) return;
    const lastIndex = activePath[activePath.length - 1];
    if (nextIndex === lastIndex) return;
    if (!isNeighbor(lastIndex, nextIndex)) {
      setStatus(copy.invalid);
      return;
    }

    const matchingEndpoint = endpoints.get(nextIndex);
    if (matchingEndpoint?.colorId === activeColor && matchingEndpoint.end === activePath[0]) {
      activePath.push(nextIndex);
      owners[nextIndex] = activeColor;
      completedPaths.set(activeColor, activePath.slice());
      const completedColor = colorFor(activeColor);
      activeColor = null;
      activePath = [];
      isDrawing = false;
      render();
      if (completedPaths.size === colors.length) {
        solved = true;
        board.classList.add("is-solved");
        render();
        setStatus(copy.success, "success");
        systemMessage.textContent = copy.systemSuccess;
        nextButton.hidden = false;
        startButton.disabled = true;
        window.EchoesSave?.saveProgress({ currentPage: "level-15", currentLevel: 15 });
        nextButton.focus();
      } else if (completedPaths.size === colors.length) {
        setStatus(copy.fillRemaining);
      } else {
        setStatus(copy.lineComplete(completedColor.label), "success");
      }
      return;
    }

    const existingIndex = activePath.indexOf(nextIndex);
    if (existingIndex !== -1) {
      while (activePath.length > existingIndex + 1) {
        const removed = activePath.pop();
        if (!endpoints.has(removed)) owners[removed] = null;
      }
      render();
      return;
    }

    if (owners[nextIndex]) {
      setStatus(copy.blocked);
      return;
    }

    if (matchingEndpoint) {
      setStatus(copy.blocked);
      return;
    }

    activePath.push(nextIndex);
    owners[nextIndex] = activeColor;
    render();
    setStatus(copy.connecting(colorFor(activeColor).label));
  };

  const activateCell = (index) => {
    const endpoint = endpoints.get(index);
    if (endpoint) {
      if (activeColor === endpoint.colorId) {
        advancePath(index);
        isDrawing = Boolean(activeColor);
      } else {
        beginPath(endpoint.colorId, index);
      }
      return;
    }

    if (activeColor) {
      advancePath(index);
      isDrawing = Boolean(activeColor);
    }
  };

  const reset = () => {
    generateLayout();
    owners.fill(null);
    completedPaths.clear();
    colors.forEach((color) => {
      owners[color.start] = color.id;
      owners[color.end] = color.id;
    });
    started = false;
    solved = false;
    activeColor = null;
    activePath = [];
    isDrawing = false;
    board.classList.remove("is-solved");
    systemMessage.textContent = copy.system;
    nextButton.hidden = true;
    startButton.disabled = false;
    render();
    setStatus(copy.ready);
  };

  for (let index = 0; index < size * size; index += 1) {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "flow-cell";
    cell.addEventListener("pointerdown", (event) => {
      if (!started || solved) return;
      activateCell(index);
      event.preventDefault();
    });
    cell.addEventListener("pointerenter", () => {
      if (isDrawing && activeColor) advancePath(index);
    });
    cell.addEventListener("click", (event) => {
      if (event.detail !== 0 || !started || solved) return;
      activateCell(index);
    });
    board.appendChild(cell);
    cells.push(cell);
  }

  document.addEventListener("pointerup", () => {
    isDrawing = false;
  });
  document.addEventListener("pointercancel", () => {
    isDrawing = false;
  });

  startButton.addEventListener("click", () => {
    started = true;
    startButton.disabled = true;
    render();
    setStatus(copy.playing);
  });
  resetButton.addEventListener("click", reset);
  nextButton.addEventListener("click", () => {
    window.location.href = "niveau-16.html";
  });
  saveButton.addEventListener("click", () => {
    if (!window.EchoesSave?.saveProgress({ currentPage: "level-15", currentLevel: 15 })) return;
    saveButton.textContent = copy.saved;
    setStatus(copy.saveHint);
    window.setTimeout(() => {
      saveButton.textContent = copy.save;
    }, 1800);
  });

  for (let level = 11; level <= 20; level += 1) {
    const marker = document.createElement("span");
    marker.className = `level-square${level === 15 ? " current" : ""}`;
    marker.setAttribute("aria-hidden", "true");
    $("levelProgress").appendChild(marker);
  }

  reset();
})();
