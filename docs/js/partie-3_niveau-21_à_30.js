// PARTIE 3 // puzzles et progression des niveaux 21 à 30.
(() => {
  const level = Number(document.body.dataset.level);
  if (level < 21 || level > 30) return;

  const language = localStorage.getItem("echoes-language") === "en" ? "en" : "fr";
  const dictionary = window.translations?.[language];
  if (!dictionary?.partThree) {
    throw new Error("Translations for Part 3 are missing from translations.js.");
  }
  const part = dictionary.partThree;
  const strings = part.levels[level];
  const $ = (id) => document.getElementById(id);
  const board = $("puzzleBoard");
  const status = $("puzzleStatus");
  const progressReadout = $("progressReadout");
  const startButton = $("startPuzzleButton");
  const resetButton = $("resetButton");
  const nextButton = $("nextLevelButton");
  const saveButton = $("saveGameButton");
  const systemMessage = $("systemMessage");
  const currentUser = window.EchoesSave?.getCurrentUser?.() || "guest";
  const progressStorageKey = `echoes-completed-levels-${encodeURIComponent(currentUser)}`;
  const savedProgress = window.EchoesSave?.getSave?.();
  const storedCompleted = JSON.parse(localStorage.getItem(progressStorageKey) || "[]");
  const completedLevels = new Set([
    ...(Array.isArray(storedCompleted) ? storedCompleted : []),
    ...(Array.isArray(savedProgress?.completedLevels) ? savedProgress.completedLevels : []),
  ].filter((number) => Number.isInteger(number) && number >= 21 && number <= 30));
  let solved = false;

  const format = (template, values = {}) =>
    template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));

  document.documentElement.lang = language;
  document.title = `ECHOES - ${format(part.level, { level })}`;
  document.querySelectorAll("[data-copy]").forEach((element) => {
    const value = part[element.dataset.copy] ?? strings[element.dataset.copy];
    if (typeof value === "string") element.textContent = format(value, { level });
  });
  $("levelProgress").setAttribute("aria-label", part.progressLabel);
  startButton.textContent = strings.start;
  resetButton.textContent = part.reset;
  nextButton.textContent = level === 25
    ? part.nextFinal
    : format(part.next, { level: level + 1 });
  saveButton.textContent = part.save;
  systemMessage.textContent = strings.system;
  board.setAttribute("aria-label", strings.boardAria);
  renderProgress();

  function setStatus(message, variant = "") {
    status.textContent = message;
    status.className = `puzzle-status${variant ? ` ${variant}` : ""}`;
    $("systemTransmission").classList.toggle("success", variant === "success");
    $("systemTransmission").classList.toggle("error", variant === "error");
  }

  function renderProgress() {
    const progress = $("levelProgress");
    progress.replaceChildren();
    for (let number = 21; number <= 30; number += 1) {
      const marker = document.createElement("span");
      marker.className = "level-square";
      marker.title = format(part.progressMarker, { level: number });
      marker.setAttribute("aria-label", marker.title);
      if (completedLevels.has(number)) marker.classList.add("completed");
      if (number === level) marker.classList.add("current");
      progress.appendChild(marker);
    }
  }

  function saveProgress(currentLevel = level) {
    const progress = {
      currentPage: `level-${currentLevel}`,
      currentLevel,
      completedLevels: [...completedLevels].sort((a, b) => a - b),
    };
    localStorage.setItem(progressStorageKey, JSON.stringify(progress.completedLevels));
    return currentUser === "guest" || Boolean(window.EchoesSave?.saveProgress(progress));
  }

  function completeLevel() {
    if (solved) return;
    solved = true;
    board.classList.add("is-solved");
    board.querySelectorAll("button").forEach((button) => { button.disabled = true; });
    completedLevels.add(level);
    renderProgress();
    const saved = saveProgress();
    setStatus(saved ? strings.success : part.saveError, saved ? "success" : "error");
    systemMessage.textContent = strings.systemSuccess;
    nextButton.hidden = false;
    startButton.hidden = true;
    nextButton.focus();
  }

  function resetCommon() {
    solved = false;
    board.classList.remove("is-solved");
    nextButton.hidden = true;
    startButton.hidden = false;
    startButton.disabled = false;
    systemMessage.textContent = strings.system;
  }

  function setupReverseCipher() {
    const transmission = $("reverseTransmission");
    const roundReadout = $("roundReadout");
    const form = $("reverseForm");
    const input = $("reverseInput");
    const submitButton = $("submitCodeButton");
    let round = 0;
    let active = false;

    function showTransmission() {
      const signal = strings.signals[round];
      transmission.textContent = signal.split("").join(" ");
      roundReadout.textContent = format(strings.transmissionLabel, { round: round + 1 });
      input.value = "";
      input.disabled = false;
      submitButton.disabled = false;
      input.focus();
    }

    startButton.addEventListener("click", () => {
      if (solved || active) return;
      active = true;
      startButton.hidden = true;
      showTransmission();
      setStatus(strings.prompt);
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!active || solved) return;
      const expected = strings.signals[round].split("").reverse().join("");
      if (input.value.trim() !== expected) {
        setStatus(strings.wrong, "error");
        input.select();
        return;
      }
      round += 1;
      progressReadout.textContent = `${round} / ${strings.signals.length}`;
      if (round === strings.signals.length) {
        input.disabled = true;
        submitButton.disabled = true;
        completeLevel();
        return;
      }
      showTransmission();
      setStatus(format(strings.roundSuccess, { round }), "success");
    });

    resetButton.addEventListener("click", () => {
      resetCommon();
      active = false;
      round = 0;
      transmission.textContent = "•••••";
      roundReadout.textContent = format(strings.transmissionLabel, { round: 1 });
      input.value = "";
      input.disabled = true;
      submitButton.disabled = true;
      progressReadout.textContent = `0 / ${strings.signals.length}`;
      setStatus(strings.ready);
    });
    roundReadout.textContent = format(strings.transmissionLabel, { round: 1 });
    input.setAttribute("aria-label", strings.inputLabel);
    progressReadout.textContent = `0 / ${strings.signals.length}`;
    setStatus(strings.ready);
  }

  function setupMultipleAlignment() {
    const symbols = strings.symbols;
    const targets = [
      [symbols[0], symbols[1], symbols[2]],
      [symbols[1], symbols[2], symbols[0]],
      [symbols[2], symbols[0], symbols[1]],
    ];
    const root = document.createElement("div");
    root.className = "alignment-content";
    const lanes = document.createElement("div");
    lanes.className = "alignment-lanes";
    const tray = document.createElement("div");
    tray.className = "alignment-tray";
    tray.setAttribute("aria-label", strings.trayAria);
    const tokens = [];
    let selectedToken = null;
    let started = false;
    let placedCount = 0;
    let tokenId = 0;

    function place(token, slot) {
      if (!started || solved || slot.querySelector(".alignment-token")) return;
      if (token.dataset.symbol !== slot.dataset.symbol) {
        setStatus(strings.wrong, "error");
        return;
      }
      slot.replaceChildren(token);
      token.classList.remove("is-selected");
      token.draggable = false;
      token.disabled = true;
      slot.classList.add("is-aligned");
      selectedToken = null;
      placedCount += 1;
      progressReadout.textContent = `${placedCount} / 9`;
      if (placedCount === 9) completeLevel();
    }

    targets.forEach((line, lineIndex) => {
      const lane = document.createElement("div");
      lane.className = "alignment-lane";
      const label = document.createElement("span");
      label.className = "alignment-label";
      label.textContent = format(strings.line, { line: lineIndex + 1 });
      lane.appendChild(label);
      line.forEach((symbol, position) => {
        const slot = document.createElement("div");
        slot.className = "alignment-slot";
        slot.dataset.symbol = symbol;
        slot.setAttribute("role", "button");
        slot.tabIndex = 0;
        slot.setAttribute("aria-label", format(strings.slot, {
          line: lineIndex + 1,
          position: position + 1,
          symbol,
        }));
        slot.textContent = symbol;
        slot.addEventListener("click", () => {
          if (selectedToken) place(selectedToken, slot);
        });
        slot.addEventListener("keydown", (event) => {
          if (selectedToken && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            place(selectedToken, slot);
          }
        });
        slot.addEventListener("dragover", (event) => event.preventDefault());
        slot.addEventListener("drop", (event) => {
          event.preventDefault();
          const token = tokens.find((item) => item.dataset.tokenId === event.dataTransfer.getData("text/plain"));
          if (token) place(token, slot);
        });
        lane.appendChild(slot);
        const token = document.createElement("button");
        token.type = "button";
        token.className = "alignment-token";
        token.dataset.tokenId = String(tokenId);
        token.dataset.symbol = symbol;
        token.textContent = symbol;
        token.setAttribute("aria-label", format(strings.token, { symbol, number: tokenId + 1 }));
        token.draggable = true;
        token.disabled = true;
        token.addEventListener("click", () => {
          if (!started || solved) return;
          tokens.forEach((item) => item.classList.remove("is-selected"));
          selectedToken = token;
          token.classList.add("is-selected");
        });
        token.addEventListener("dragstart", (event) => {
          event.dataTransfer.setData("text/plain", token.dataset.tokenId);
          event.dataTransfer.effectAllowed = "move";
        });
        tokens.push(token);
        tokenId += 1;
      });
      lanes.appendChild(lane);
    });
    root.append(lanes, tray);
    board.replaceChildren(root);

    startButton.addEventListener("click", () => {
      if (solved) return;
      started = true;
      startButton.hidden = true;
      tokens.sort(() => Math.random() - 0.5).forEach((token) => {
        token.disabled = false;
        tray.appendChild(token);
      });
      setStatus(strings.playing);
    });
    resetButton.addEventListener("click", () => {
      resetCommon();
      started = false;
      placedCount = 0;
      selectedToken = null;
      progressReadout.textContent = "0 / 9";
      lanes.querySelectorAll(".alignment-slot").forEach((slot) => {
        const token = slot.querySelector(".alignment-token");
        if (token) {
          token.disabled = true;
          token.draggable = true;
          token.classList.remove("is-selected");
          tray.appendChild(token);
        }
        slot.classList.remove("is-aligned");
        slot.textContent = slot.dataset.symbol;
      });
      tokens.forEach((token) => { token.disabled = true; });
      setStatus(strings.ready);
    });
    progressReadout.textContent = "0 / 9";
    setStatus(strings.ready);
  }

  function setupRhythm() {
    const pulse = $("rhythmPulse");
    const intervals = [780, 1120, 720, 980, 840];
    const tolerance = 250;
    let hitCount = 0;
    let beatTimes = [];
    let timers = [];
    let active = false;

    function clearTimers() {
      timers.forEach((timer) => window.clearTimeout(timer));
      timers = [];
      pulse.classList.remove("is-pulsing");
    }

    function fail() {
      clearTimers();
      active = false;
      pulse.disabled = true;
      startButton.hidden = false;
      hitCount = 0;
      progressReadout.textContent = "0 / 5";
      setStatus(strings.miss, "error");
    }

    startButton.addEventListener("click", () => {
      if (solved || active) return;
      clearTimers();
      active = true;
      hitCount = 0;
      progressReadout.textContent = "0 / 5";
      startButton.hidden = true;
      pulse.disabled = false;
      setStatus(strings.playing);
      beatTimes = [performance.now() + 1400];
      intervals.slice(0, 4).forEach((interval) => {
        beatTimes.push(beatTimes[beatTimes.length - 1] + interval);
      });
      beatTimes.forEach((beatAt, index) => {
        timers.push(window.setTimeout(() => {
          pulse.classList.add("is-pulsing");
          window.setTimeout(() => pulse.classList.remove("is-pulsing"), 320);
        }, Math.max(0, beatAt - performance.now())));
        timers.push(window.setTimeout(() => {
          if (active && hitCount <= index) fail();
        }, Math.max(0, beatAt + tolerance - performance.now())));
      });
    });

    pulse.addEventListener("click", () => {
      if (!active || solved) return;
      const delta = performance.now() - beatTimes[hitCount];
      if (delta < -tolerance) {
        setStatus(strings.early);
        return;
      }
      if (delta > tolerance) return;
      hitCount += 1;
      progressReadout.textContent = `${hitCount} / 5`;
      pulse.classList.add("is-pulsing");
      window.setTimeout(() => pulse.classList.remove("is-pulsing"), 320);
      if (hitCount === intervals.length) {
        clearTimers();
        active = false;
        pulse.disabled = true;
        completeLevel();
      } else {
        setStatus(format(strings.hit, { count: hitCount }), "success");
      }
    });
    resetButton.addEventListener("click", () => {
      clearTimers();
      resetCommon();
      active = false;
      hitCount = 0;
      beatTimes = [];
      pulse.disabled = true;
      progressReadout.textContent = "0 / 5";
      setStatus(strings.ready);
    });
    pulse.setAttribute("aria-label", strings.pulse);
    pulse.disabled = true;
    progressReadout.textContent = "0 / 5";
    setStatus(strings.ready);
  }

  function setupMirrorPuzzle() {
    const positions = [10, 12, 2, 4];
    const solution = ["/", "/", "/", "\\"];
    const mirrors = new Map(positions.map((position, index) => [position, {
      index,
      orientation: index === 3 ? "/" : "\\",
    }]));
    const cells = [];
    let active = false;

    function traceBeam() {
      const path = [];
      let row = 4;
      let column = 0;
      let rowStep = -1;
      let columnStep = 0;
      const visited = new Set();
      let reachedReceiver = false;
      for (let step = 0; step < 25; step += 1) {
        row += rowStep;
        column += columnStep;
        if (row < 0 || row > 4 || column < 0 || column > 4) break;
        const position = row * 5 + column;
        path.push(position);
        if (position === 24) {
          reachedReceiver = true;
          break;
        }
        const mirror = mirrors.get(position);
        if (!mirror) continue;
        const state = `${position}:${rowStep}:${columnStep}`;
        if (visited.has(state)) break;
        visited.add(state);
        if (mirror.orientation === "/") {
          [rowStep, columnStep] = [-columnStep, -rowStep];
        } else {
          [rowStep, columnStep] = [columnStep, rowStep];
        }
      }
      cells.forEach((cell, index) => {
        cell.classList.toggle("is-beam", path.includes(index));
        const mirror = mirrors.get(index);
        if (!mirror) return;
        const button = cell.querySelector(".mirror-control");
        button.textContent = mirror.orientation === "/" ? "╱" : "╲";
        button.setAttribute("aria-label", format(strings.mirror, {
          number: mirror.index + 1,
          orientation: mirror.orientation === "/" ? strings.risingDiagonal : strings.fallingDiagonal,
        }));
      });
      progressReadout.textContent = `${[...mirrors.values()]
        .filter((mirror) => mirror.orientation === solution[mirror.index]).length} / 4`;
      if (reachedReceiver) completeLevel();
      else setStatus(strings.blocked);
    }

    for (let index = 0; index < 25; index += 1) {
      const cell = document.createElement("div");
      cell.className = "mirror-cell";
      cell.dataset.cell = String(index);
      if (index === 20 || index === 24) {
        const emitter = index === 20;
        cell.classList.add(emitter ? "is-emitter" : "is-receiver");
        cell.setAttribute("aria-label", emitter ? strings.emitter : strings.receiver);
        cell.textContent = emitter ? "◉" : "◎";
      } else if (mirrors.has(index)) {
        const mirror = mirrors.get(index);
        const button = document.createElement("button");
        button.type = "button";
        button.className = "mirror-control";
        button.disabled = true;
        button.addEventListener("click", () => {
          if (!active || solved) return;
          mirror.orientation = mirror.orientation === "/" ? "\\" : "/";
          traceBeam();
        });
        cell.appendChild(button);
      }
      cells.push(cell);
    }
    board.replaceChildren(...cells);
    mirrors.forEach((mirror) => {
      const button = cells[positions[mirror.index]].querySelector(".mirror-control");
      button.textContent = mirror.orientation === "/" ? "╱" : "╲";
      button.setAttribute("aria-label", format(strings.mirror, {
        number: mirror.index + 1,
        orientation: mirror.orientation === "/" ? strings.risingDiagonal : strings.fallingDiagonal,
      }));
    });
    startButton.addEventListener("click", () => {
      if (solved) return;
      active = true;
      startButton.hidden = true;
      board.querySelectorAll(".mirror-control").forEach((button) => { button.disabled = false; });
      traceBeam();
    });
    resetButton.addEventListener("click", () => {
      resetCommon();
      active = false;
      mirrors.forEach((mirror) => { mirror.orientation = mirror.index === 3 ? "/" : "\\"; });
      board.querySelectorAll(".mirror-control").forEach((button) => { button.disabled = true; });
      cells.forEach((cell) => cell.classList.remove("is-beam"));
      mirrors.forEach((mirror) => {
        const button = cells[positions[mirror.index]].querySelector(".mirror-control");
        button.textContent = mirror.orientation === "/" ? "╱" : "╲";
      });
      progressReadout.textContent = "0 / 4";
      setStatus(strings.ready);
    });
    progressReadout.textContent = "0 / 4";
    setStatus(strings.ready);
  }

  function setupDynamicSort() {
    const root = document.createElement("div");
    root.className = "sort-content";
    const targets = document.createElement("div");
    targets.className = "sorting-targets";
    const tray = document.createElement("div");
    tray.className = "sorting-tray";
    tray.setAttribute("aria-label", strings.trayAria);
    const tokenList = [];
    let selectedToken = null;
    let started = false;
    let sortedCount = 0;
    let tokenNumber = 0;

    function sortToken(token, target) {
      if (!started || solved) return;
      if (target.dataset.symbol !== token.dataset.symbol) {
        setStatus(strings.wrong, "error");
        return;
      }
      token.classList.remove("is-selected");
      token.classList.add("is-sorted");
      token.disabled = true;
      token.draggable = false;
      target.querySelector(".sorting-target-items").appendChild(token);
      selectedToken = null;
      sortedCount += 1;
      progressReadout.textContent = `${sortedCount} / 10`;
      if (sortedCount === 10) completeLevel();
    }

    strings.symbols.forEach((symbol, symbolIndex) => {
      const target = document.createElement("div");
      target.className = "sorting-target";
      target.dataset.symbol = String(symbolIndex);
      target.setAttribute("role", "button");
      target.tabIndex = -1;
      target.setAttribute("aria-disabled", "true");
      target.setAttribute("aria-label", format(strings.target, { name: symbol.name }));
      const heading = document.createElement("span");
      heading.className = "sorting-target-glyph";
      heading.textContent = symbol.glyph;
      const label = document.createElement("span");
      label.className = "sorting-target-label";
      label.textContent = symbol.name;
      const items = document.createElement("span");
      items.className = "sorting-target-items";
      target.append(heading, label, items);
      target.addEventListener("click", () => {
        if (selectedToken) sortToken(selectedToken, target);
      });
      target.addEventListener("keydown", (event) => {
        if (selectedToken && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          sortToken(selectedToken, target);
        }
      });
      target.addEventListener("dragover", (event) => event.preventDefault());
      target.addEventListener("drop", (event) => {
        event.preventDefault();
        const token = tokenList.find((item) => item.dataset.tokenId === event.dataTransfer.getData("text/plain"));
        if (token) sortToken(token, target);
      });
      targets.appendChild(target);

      for (let copyNumber = 0; copyNumber < 2; copyNumber += 1) {
        const token = document.createElement("button");
        token.type = "button";
        token.className = "sorting-token";
        token.dataset.tokenId = String(tokenNumber);
        token.dataset.symbol = String(symbolIndex);
        token.textContent = symbol.glyph;
        token.setAttribute("aria-label", format(strings.token, {
          name: symbol.name.toLowerCase(),
          number: tokenNumber + 1,
        }));
        token.draggable = true;
        token.disabled = true;
        token.addEventListener("click", () => {
          if (!started || solved) return;
          tokenList.forEach((item) => item.classList.remove("is-selected"));
          selectedToken = token;
          token.classList.add("is-selected");
        });
        token.addEventListener("dragstart", (event) => {
          event.dataTransfer.setData("text/plain", token.dataset.tokenId);
          event.dataTransfer.effectAllowed = "move";
        });
        tokenList.push(token);
        tokenNumber += 1;
      }
    });
    root.append(targets, tray);
    board.replaceChildren(root);
    startButton.addEventListener("click", () => {
      if (solved) return;
      started = true;
      startButton.hidden = true;
      targets.querySelectorAll(".sorting-target").forEach((target) => {
        target.tabIndex = 0;
        target.setAttribute("aria-disabled", "false");
      });
      tokenList.sort(() => Math.random() - 0.5).forEach((token) => {
        token.disabled = false;
        tray.appendChild(token);
      });
      setStatus(strings.playing);
    });
    resetButton.addEventListener("click", () => {
      resetCommon();
      started = false;
      selectedToken = null;
      sortedCount = 0;
      progressReadout.textContent = "0 / 10";
      targets.querySelectorAll(".sorting-target").forEach((target) => {
        target.tabIndex = -1;
        target.setAttribute("aria-disabled", "true");
      });
      tokenList.forEach((token) => {
        token.disabled = true;
        token.draggable = true;
        token.classList.remove("is-sorted", "is-selected");
        tray.appendChild(token);
      });
      setStatus(strings.ready);
    });
    progressReadout.textContent = "0 / 10";
    setStatus(strings.ready);
  }

  function setupSnakesAndLadders() {
    const size = 10;
    const finish = 100;
    const jumps = {
      3: 22, 8: 30, 20: 41, 28: 55, 36: 67, 51: 72, 63: 84, 80: 99,
      97: 61, 92: 75, 88: 47, 70: 49, 58: 17, 45: 24, 33: 13, 26: 6, 74: 53,
    };
    const snakeColors = ["#ff5a7a", "#38f2ff", "#ff9a3c", "#b78bff", "#ff4fd8"];
    const rand = (max) => Math.floor(Math.random() * max);
    const shuffle = (list) => [...list].sort(() => Math.random() - 0.5);
    const shapeGlyphs = ["●", "▲", "■", "◆", "★"];
    const stage = document.createElement("div");
    const grid = document.createElement("div");
    const lines = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const token = document.createElement("div");
    const panel = document.createElement("div");
    const dieFace = document.createElement("div");
    const rollButton = document.createElement("button");
    stage.className = "ladder-stage";
    grid.className = "snake-grid";
    grid.style.setProperty("--snake-grid-size", size);
    lines.setAttribute("class", "ladder-lines");
    lines.setAttribute("aria-hidden", "true");
    token.className = "ladder-token";
    token.setAttribute("aria-hidden", "true");
    panel.className = "ladder-panel";
    dieFace.className = "ladder-die-face";
    dieFace.textContent = "?";
    dieFace.setAttribute("aria-live", "polite");
    rollButton.type = "button";
    rollButton.className = "ladder-roll";
    rollButton.textContent = strings.roll;
    rollButton.disabled = true;
    const squares = {};
    for (let row = size - 1; row >= 0; row -= 1) {
      for (let col = 0; col < size; col += 1) {
        const number = row * size + (row % 2 === 0 ? col : size - 1 - col) + 1;
        const square = document.createElement("div");
        square.className = (row + col) % 2 ? "ladder-square is-alt" : "ladder-square";
        square.textContent = String(number);
        const target = jumps[number];
        if (target) {
          const up = target > number;
          square.classList.add(up ? "is-ladder" : "is-snake");
          square.setAttribute("aria-label", format(up ? strings.ladderCell : strings.snakeCell, { from: number, to: target }));
        }
        if (number === finish) square.classList.add("is-finish");
        squares[number] = square;
        grid.appendChild(square);
      }
    }
    stage.append(grid, lines, token);
    panel.append(dieFace, rollButton);
    const wrapper = document.createElement("div");
    wrapper.append(stage, panel);
    board.replaceChildren(wrapper);
    board.setAttribute("aria-label", strings.boardAria);

    let started = false;
    let busy = false;
    let position = 1;
    let visited = new Set([1]);
    let modal = null;

    const center = (number) => {
      const cell = squares[number];
      return [cell.offsetLeft + cell.offsetWidth / 2, cell.offsetTop + cell.offsetHeight / 2];
    };

    function drawLines() {
      lines.setAttribute("viewBox", `0 0 ${stage.offsetWidth} ${stage.offsetHeight}`);
      lines.replaceChildren();
      const cellSize = squares[1].offsetWidth;
      const svgNode = (name, attributes) => {
        const node = document.createElementNS("http://www.w3.org/2000/svg", name);
        Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
        lines.appendChild(node);
        return node;
      };
      const entries = Object.entries(jumps).map(([from, to]) => [Number(from), to]);
      entries.filter(([from, to]) => to > from).forEach(([from, to]) => {
        const [x1, y1] = center(from);
        const [x2, y2] = center(to);
        const length = Math.hypot(x2 - x1, y2 - y1);
        const ux = (x2 - x1) / length;
        const uy = (y2 - y1) / length;
        const nx = -uy;
        const ny = ux;
        const gap = cellSize * 0.17;
        [-1, 1].forEach((side) => {
          const rail = {
            x1: x1 + nx * gap * side, y1: y1 + ny * gap * side,
            x2: x2 + nx * gap * side, y2: y2 + ny * gap * side,
          };
          svgNode("line", { ...rail, class: "ladder-rail-glow" });
          svgNode("line", { ...rail, class: "ladder-rail" });
        });
        for (let distance = cellSize * 0.3; distance < length - cellSize * 0.15; distance += cellSize * 0.3) {
          svgNode("line", {
            x1: x1 + ux * distance - nx * gap, y1: y1 + uy * distance - ny * gap,
            x2: x1 + ux * distance + nx * gap, y2: y1 + uy * distance + ny * gap,
            class: "ladder-rung",
          });
        }
      });
      entries.filter(([from, to]) => to < from).forEach(([from, to], index) => {
        const [x1, y1] = center(from);
        const [x2, y2] = center(to);
        const length = Math.hypot(x2 - x1, y2 - y1);
        const ux = (x2 - x1) / length;
        const uy = (y2 - y1) / length;
        const nx = -uy;
        const ny = ux;
        const color = snakeColors[index % snakeColors.length];
        const width = cellSize * 0.3;
        const amplitude = cellSize * 0.42;
        const waves = Math.max(1.5, length / (cellSize * 1.7));
        const points = [];
        for (let step = 0; step <= 60; step += 1) {
          const t = step / 60;
          const wave = Math.sin(t * Math.PI * 2 * waves) * amplitude * Math.min(1, t * 6, (1 - t) * 4);
          points.push([x1 + (x2 - x1) * t + nx * wave, y1 + (y2 - y1) * t + ny * wave]);
        }
        const path = points.map(([x, y], step) => `${step ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
        const style = `--snake-color: ${color}`;
        svgNode("path", { d: path, class: "snake-shadow", style });
        svgNode("path", { d: path, class: "snake-body", style, "stroke-width": width });
        svgNode("path", { d: path, class: "snake-pattern", style, "stroke-width": width * 0.5,
          "stroke-dasharray": `${width * 0.35} ${width * 0.95}` });
        const [hx, hy] = points[0];
        const [px, py] = points[2];
        const angle = Math.atan2(hy - py, hx - px);
        const head = svgNode("g", { transform: `translate(${hx},${hy}) rotate(${angle * 180 / Math.PI})`, style });
        const part = (name, attributes) => {
          const node = document.createElementNS("http://www.w3.org/2000/svg", name);
          Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
          head.appendChild(node);
        };
        part("path", { d: `M${width * 0.6},0 L${width * 1.3},${-width * 0.15} M${width * 0.6},0 L${width * 1.3},${width * 0.15}`, class: "snake-tongue" });
        part("ellipse", { cx: 0, cy: 0, rx: width * 0.85, ry: width * 0.68, class: "snake-head" });
        part("circle", { cx: width * 0.25, cy: -width * 0.32, r: width * 0.17, class: "snake-eye" });
        part("circle", { cx: width * 0.25, cy: width * 0.32, r: width * 0.17, class: "snake-eye" });
        const [tx, ty] = points[points.length - 1];
        svgNode("circle", { cx: tx, cy: ty, r: width * 0.3, class: "snake-tail", style });
      });
    }

    function placeToken(number) {
      const [x, y] = center(number);
      const cell = squares[number];
      const tokenSize = Math.min(cell.offsetWidth, cell.offsetHeight) * 0.5;
      token.style.width = `${tokenSize}px`;
      token.style.height = `${tokenSize}px`;
      token.style.transform = `translate(${x - tokenSize / 2}px, ${y - tokenSize / 2}px)`;
    }

    function refresh() {
      Object.entries(squares).forEach(([number, square]) => {
        square.classList.toggle("is-visited", visited.has(Number(number)));
        square.classList.toggle("is-token", Number(number) === position);
      });
      progressReadout.textContent = `${position} / ${finish}`;
      placeToken(position);
    }

    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    async function walk(route, delay = 240) {
      for (const number of route) {
        position = number;
        visited.add(number);
        refresh();
        await wait(delay);
      }
    }

    function buildPuzzle() {
      const kind = ["match", "pattern", "odd", "place"][rand(4)];
      const choices = (answer) => {
        const options = new Set([answer]);
        while (options.size < 4) options.add(rand(shapeGlyphs.length));
        return shuffle([...options]);
      };
      if (kind === "match") {
        const answer = rand(shapeGlyphs.length);
        return {
          type: kind,
          prompt: strings.matchPrompt,
          display: shapeGlyphs[answer],
          options: choices(answer),
          answer,
        };
      }
      if (kind === "pattern") {
        const first = rand(shapeGlyphs.length);
        let second = rand(shapeGlyphs.length - 1);
        if (second >= first) second += 1;
        return {
          type: kind,
          prompt: strings.patternPrompt,
          display: [first, second, first, second, null]
            .map((shape) => shape === null ? "?" : shapeGlyphs[shape])
            .join("  "),
          options: choices(first),
          answer: first,
        };
      }
      if (kind === "odd") {
        const common = rand(shapeGlyphs.length);
        let intruder = rand(shapeGlyphs.length - 1);
        if (intruder >= common) intruder += 1;
        return {
          type: kind,
          prompt: strings.oddPrompt,
          odd: { common, intruder, index: rand(9) },
        };
      }
      const targets = shuffle(Array.from({ length: shapeGlyphs.length }, (_, index) => index)).slice(0, 3);
      return {
        type: kind,
        prompt: strings.placePrompt,
        targets,
        pieces: shuffle(targets),
      };
    }
    function openPuzzle(kind, target) {
      return new Promise((resolve) => {
        const puzzle = buildPuzzle();
        const overlay = document.createElement("div");
        overlay.className = `ladder-modal is-${kind}`;
        const dialog = document.createElement("div");
        dialog.className = "ladder-dialog";
        dialog.setAttribute("role", "dialog");
        dialog.setAttribute("aria-modal", "true");
        const heading = document.createElement("h3");
        heading.textContent = strings[`title_${kind}`];
        const hint = document.createElement("p");
        hint.className = "ladder-hint";
        hint.textContent = format(strings[`hint_${kind}`], { to: target });
        const prompt = document.createElement("p");
        prompt.className = "ladder-prompt";
        prompt.textContent = puzzle.prompt;
        const body = document.createElement("div");
        body.className = "ladder-puzzle";
        const result = document.createElement("p");
        result.className = "ladder-result";
        result.setAttribute("aria-live", "assertive");
        dialog.setAttribute("aria-label", heading.textContent);
        dialog.append(heading, hint, prompt);
        if (puzzle.display) {
          const display = document.createElement("div");
          display.className = "ladder-display";
          display.textContent = puzzle.display;
          dialog.appendChild(display);
        }
        dialog.append(body, result);
        let answered = false;
        const answer = (success) => {
          if (answered) return;
          answered = true;
          dialog.querySelectorAll("button, input").forEach((item) => { item.disabled = true; });
          dialog.classList.add(success ? "is-success" : "is-failure");
          result.textContent = success ? strings.puzzleOk : strings.puzzleFail;
          setTimeout(() => {
            overlay.remove();
            modal = null;
            resolve(success);
          }, 950);
        };
        if (puzzle.options) {
          puzzle.options.forEach((option) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "ladder-choice";
            button.textContent = shapeGlyphs[option];
            button.setAttribute("aria-label", format(strings.shapeChoice, {
              name: strings.shapeNames[option],
            }));
            button.addEventListener("click", () => answer(option === puzzle.answer));
            body.appendChild(button);
          });
        } else if (puzzle.odd) {
          body.classList.add("is-odd");
          for (let index = 0; index < 9; index += 1) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "ladder-choice ladder-glyph";
            const shape = index === puzzle.odd.index ? puzzle.odd.intruder : puzzle.odd.common;
            button.textContent = shapeGlyphs[shape];
            button.setAttribute("aria-label", format(strings.shapeChoice, {
              name: strings.shapeNames[shape],
            }));
            button.addEventListener("click", () => answer(index === puzzle.odd.index));
            body.appendChild(button);
          }
        } else {
          body.classList.add("is-placement");
          const targetRow = document.createElement("div");
          targetRow.className = "ladder-shape-row";
          const pieceRow = document.createElement("div");
          pieceRow.className = "ladder-shape-row";
          let selectedPiece = null;
          const pieceButtons = new Map();
          const placedShapes = new Set();
          puzzle.targets.forEach((shape) => {
            const targetButton = document.createElement("button");
            targetButton.type = "button";
            targetButton.className = "ladder-choice ladder-shape-target";
            targetButton.textContent = shapeGlyphs[shape];
            targetButton.setAttribute("aria-label", format(strings.shapeTarget, {
              name: strings.shapeNames[shape],
            }));
            targetButton.addEventListener("click", () => {
              if (selectedPiece === null || placedShapes.has(shape)) return;
              if (selectedPiece !== shape) {
                answer(false);
                return;
              }
              placedShapes.add(shape);
              targetButton.textContent = shapeGlyphs[shape];
              targetButton.classList.add("is-placed");
              targetButton.disabled = true;
              pieceButtons.get(shape).disabled = true;
              pieceButtons.get(shape).classList.remove("is-selected");
              selectedPiece = null;
              if (placedShapes.size === puzzle.targets.length) answer(true);
            });
            targetRow.appendChild(targetButton);
          });

          puzzle.pieces.forEach((shape) => {
            const pieceButton = document.createElement("button");
            pieceButton.type = "button";
            pieceButton.className = "ladder-choice ladder-piece";
            pieceButton.textContent = shapeGlyphs[shape];
            pieceButton.setAttribute("aria-label", format(strings.shapePiece, {
              name: strings.shapeNames[shape],
            }));
            pieceButton.addEventListener("click", () => {
              if (pieceButton.disabled) return;
              selectedPiece = selectedPiece === shape ? null : shape;
              pieceButtons.forEach((piece, pieceShape) => {
                piece.classList.toggle("is-selected", pieceShape === selectedPiece);
              });
            });
            pieceButtons.set(shape, pieceButton);
            pieceRow.appendChild(pieceButton);
          });

          body.append(targetRow, pieceRow);
        }
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        modal = overlay;
        (dialog.querySelector(".ladder-piece") || dialog.querySelector(".ladder-choice") || dialog).focus();
      });
    }

    async function roll() {
      if (!started || busy || solved) return;
      busy = true;
      rollButton.disabled = true;
      dieFace.classList.add("is-rolling");
      setStatus(strings.rolling);
      await wait(700);
      dieFace.classList.remove("is-rolling");
      const value = 1 + rand(6);
      dieFace.textContent = String(value);
      setStatus(format(strings.rolled, { value }));
      await wait(350);
      const route = [];
      let cursor = position;
      let direction = 1;
      for (let step = 0; step < value; step += 1) {
        if (cursor === finish) direction = -1;
        cursor += direction;
        route.push(cursor);
      }
      await walk(route);
      const jump = jumps[position];
      const kind = position === finish ? "final" : jump ? (jump > position ? "ladder" : "snake") : "square";
      const success = await openPuzzle(kind, jump || "");
      if (kind === "final") {
        if (success) {
          completeLevel();
          return;
        }
        setStatus(strings.finalFailed, "error");
        await walk([94], 420);
      } else if (kind === "ladder") {
        if (success) {
          setStatus(format(strings.climbed, { to: jump }), "success");
          await walk([jump], 700);
        } else {
          setStatus(strings.ladderFailed, "error");
        }
      } else if (kind === "snake") {
        if (success) {
          setStatus(strings.snakeEscaped, "success");
        } else {
          setStatus(format(strings.slid, { to: jump }), "error");
          await walk([jump], 700);
        }
      } else if (success) {
        setStatus(strings.squareOk, "success");
      } else {
        setStatus(strings.squareFailed, "error");
        await walk([Math.max(1, position - 1), Math.max(1, position - 2)], 320);
      }
      busy = false;
      rollButton.disabled = false;
      rollButton.focus();
    }

    function fullRefresh() {
      drawLines();
      refresh();
    }

    rollButton.addEventListener("click", roll);
    window.addEventListener("resize", fullRefresh);
    startButton.addEventListener("click", () => {
      if (solved || started) return;
      started = true;
      startButton.hidden = true;
      rollButton.disabled = false;
      setStatus(strings.playing);
      rollButton.focus();
    });
    resetButton.addEventListener("click", () => {
      resetCommon();
      modal?.remove();
      modal = null;
      started = false;
      busy = false;
      position = 1;
      visited = new Set([1]);
      rollButton.disabled = true;
      dieFace.textContent = "?";
      refresh();
      setStatus(strings.ready);
      startButton.focus();
    });
    requestAnimationFrame(() => {
      fullRefresh();
      setStatus(strings.ready);
    });
  }

  function setupCaptcha() {
    const total = 3;
    const rand = (max) => Math.floor(Math.random() * max);
    const shuffle = (list) => [...list].sort(() => Math.random() - 0.5);
    const palette = ["#ff5a7a", "#38f2ff", "#ff9a3c", "#b78bff", "#ff4fd8"];
    const alphabet = "ABCDEFGHJKMNPRTUWXY347";
    const svgNS = "http://www.w3.org/2000/svg";
    const shapeDrawers = [
      () => ["circle", { cx: 20, cy: 20, r: 13 }],
      () => ["polygon", { points: "20,6 35,33 5,33" }],
      () => ["rect", { x: 8, y: 8, width: 24, height: 24, rx: 2 }],
      () => ["polygon", { points: "20,4 36,20 20,36 4,20" }],
      () => ["polygon", { points: "20,4 32,11 32,29 20,36 8,29 8,11" }],
    ];
    const orbSizes = [34, 44, 55, 67, 80];
    let round = 0;
    let started = false;
    let busy = false;
    let epoch = 0;

    const svgElement = (name, attributes = {}) => {
      const element = document.createElementNS(svgNS, name);
      Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
      return element;
    };
    const frame = document.createElement("div");
    frame.className = "captcha-frame";
    const heading = document.createElement("h3");
    heading.className = "captcha-title";
    const prompt = document.createElement("p");
    prompt.className = "captcha-prompt";
    const stage = document.createElement("div");
    stage.className = "captcha-stage";
    frame.append(heading, prompt, stage);
    board.replaceChildren(frame);

    function showLocked() {
      heading.textContent = strings.lockedTitle;
      prompt.textContent = strings.locked;
      stage.replaceChildren();
      progressReadout.textContent = `0 / ${total}`;
    }

    function finishRound(success) {
      if (busy || solved) return;
      busy = true;
      const current = epoch;
      stage.classList.add(success ? "is-ok" : "is-bad");
      stage.querySelectorAll("button, input").forEach((item) => { item.disabled = true; });
      setStatus(success ? strings.roundOk : strings.roundFail, success ? "success" : "error");
      setTimeout(() => {
        if (current !== epoch) return;
        busy = false;
        if (success) round += 1;
        if (round >= total) {
          progressReadout.textContent = `${total} / ${total}`;
          completeLevel();
          return;
        }
        renderRound();
      }, 900);
    }

    function renderText() {
      let code = "";
      for (let index = 0; index < 6; index += 1) code += alphabet[rand(alphabet.length)];
      const image = svgElement("svg", { viewBox: "0 0 300 100", class: "captcha-image", role: "img" });
      image.setAttribute("aria-label", strings.textImageLabel);
      image.appendChild(svgElement("rect", { width: 300, height: 100, fill: "#0b0613" }));
      for (let index = 0; index < 8; index += 1) {
        image.appendChild(svgElement("line", {
          x1: rand(300), y1: rand(100), x2: rand(300), y2: rand(100),
          stroke: palette[rand(palette.length)], "stroke-width": 1.4, opacity: 0.5,
        }));
      }
      [...code].forEach((letter, index) => {
        const x = 30 + index * 41;
        const y = 60 + rand(16) - 8;
        const glyph = svgElement("text", {
          x, y, "text-anchor": "middle", "font-size": 38 + rand(12), "font-weight": 700,
          "font-family": "Space Mono, monospace", fill: palette[rand(palette.length)],
          transform: `rotate(${rand(56) - 28} ${x} ${y}) skewX(${rand(30) - 15})`,
        });
        glyph.textContent = letter;
        image.appendChild(glyph);
      });
      const wave = `M0,${40 + rand(20)} C70,${rand(100)} 140,${rand(100)} 210,${rand(100)} S280,${rand(100)} 300,${30 + rand(40)}`;
      image.appendChild(svgElement("path", { d: wave, fill: "none", stroke: "#fff4fd", "stroke-width": 2.2, opacity: 0.7 }));
      for (let index = 0; index < 70; index += 1) {
        image.appendChild(svgElement("circle", {
          cx: rand(300), cy: rand(100), r: 0.8 + Math.random(), fill: palette[rand(palette.length)], opacity: 0.6,
        }));
      }
      const form = document.createElement("form");
      form.className = "captcha-form";
      const input = document.createElement("input");
      input.className = "captcha-input";
      input.autocomplete = "off";
      input.spellcheck = false;
      input.maxLength = 6;
      input.setAttribute("aria-label", strings.inputLabel);
      const submit = document.createElement("button");
      submit.type = "submit";
      submit.className = "captcha-button";
      submit.textContent = strings.submit;
      const refresh = document.createElement("button");
      refresh.type = "button";
      refresh.className = "captcha-button is-ghost";
      refresh.textContent = strings.refresh;
      refresh.addEventListener("click", () => { if (!busy) renderRound(); });
      form.append(input, submit, refresh);
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        finishRound(input.value.trim().toUpperCase() === code);
      });
      stage.append(image, form);
      input.focus();
    }

    function renderGrid() {
      const targetShape = rand(shapeDrawers.length);
      const targetColor = rand(palette.length);
      const tileCount = 9;
      const targetCount = 3 + rand(2);
      const tiles = Array.from({ length: targetCount }, () => ({ shape: targetShape, color: targetColor }));
      const otherColor = () => (targetColor + 1 + rand(palette.length - 1)) % palette.length;
      const otherShape = () => (targetShape + 1 + rand(shapeDrawers.length - 1)) % shapeDrawers.length;
      tiles.push({ shape: targetShape, color: otherColor() }, { shape: targetShape, color: otherColor() });
      tiles.push({ shape: otherShape(), color: targetColor }, { shape: otherShape(), color: targetColor });
      while (tiles.length < tileCount) {
        const tile = { shape: rand(shapeDrawers.length), color: rand(palette.length) };
        if (tile.shape !== targetShape || tile.color !== targetColor) tiles.push(tile);
      }
      const ordered = shuffle(tiles);
      const selected = new Set();
      prompt.textContent = format(strings.gridPrompt, {
        shape: strings.shapes[targetShape],
        color: strings.colors[targetColor],
      });
      const swatch = document.createElement("span");
      swatch.className = "captcha-swatch";
      swatch.style.background = palette[targetColor];
      prompt.prepend(swatch);
      const grid = document.createElement("div");
      grid.className = "captcha-tiles";
      ordered.forEach((tile, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "captcha-tile";
        button.setAttribute("aria-pressed", "false");
        button.setAttribute("aria-label", format(strings.tileLabel, {
          shape: strings.shapes[tile.shape],
          color: strings.colors[tile.color],
          number: index + 1,
        }));
        const icon = svgElement("svg", { viewBox: "0 0 40 40", "aria-hidden": "true" });
        const [name, attributes] = shapeDrawers[tile.shape]();
        icon.appendChild(svgElement(name, { ...attributes, fill: palette[tile.color], opacity: 0.92 }));
        button.appendChild(icon);
        button.addEventListener("click", () => {
          if (selected.has(index)) selected.delete(index);
          else selected.add(index);
          button.classList.toggle("is-selected", selected.has(index));
          button.setAttribute("aria-pressed", String(selected.has(index)));
        });
        grid.appendChild(button);
      });
      const submit = document.createElement("button");
      submit.type = "button";
      submit.className = "captcha-button";
      submit.textContent = strings.submit;
      submit.addEventListener("click", () => {
        const success = ordered.every((tile, index) =>
          (tile.shape === targetShape && tile.color === targetColor) === selected.has(index));
        finishRound(success);
      });
      stage.append(grid, submit);
    }

    function renderOrder() {
      const sizes = shuffle(orbSizes);
      const placed = [];
      sizes.forEach((diameter) => {
        const radius = diameter / 2;
        for (let attempt = 0; attempt < 400; attempt += 1) {
          const x = radius + 8 + Math.random() * (600 - diameter - 16);
          const y = radius + 8 + Math.random() * (300 - diameter - 16);
          if (placed.every((orb) => Math.hypot(orb.x - x, orb.y - y) > orb.radius + radius + 12)) {
            placed.push({ x, y, radius, diameter });
            return;
          }
        }
        placed.push({ x: radius + 8 + placed.length * 110, y: 150, radius, diameter });
      });
      const order = placed.map((_, index) => index).sort((a, b) => placed[a].diameter - placed[b].diameter);
      let next = 0;
      const area = document.createElement("div");
      area.className = "captcha-orbs";
      const colors = shuffle(palette);
      placed.forEach((orb, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "captcha-orb";
        button.setAttribute("aria-label", strings.orbLabel);
        button.style.left = `${(orb.x / 600) * 100}%`;
        button.style.top = `${(orb.y / 300) * 100}%`;
        button.style.width = `${(orb.diameter / 600) * 100}%`;
        button.style.setProperty("--orb", colors[index % colors.length]);
        button.addEventListener("click", () => {
          if (busy) return;
          if (index !== order[next]) {
            finishRound(false);
            return;
          }
          button.classList.add("is-done");
          button.disabled = true;
          next += 1;
          if (next === order.length) finishRound(true);
        });
        area.appendChild(button);
      });
      stage.appendChild(area);
    }

    function renderRound() {
      epoch += 1;
      busy = false;
      progressReadout.textContent = `${round} / ${total}`;
      stage.className = "captcha-stage";
      stage.replaceChildren();
      const kinds = ["text", "grid", "order"];
      const kind = kinds[round];
      heading.textContent = format(strings.roundLabel, { current: round + 1, total }) + ` — ${strings[`${kind}Title`]}`;
      prompt.textContent = strings[`${kind}Prompt`];
      if (kind === "text") renderText();
      if (kind === "grid") renderGrid();
      if (kind === "order") renderOrder();
      setStatus(strings.playing);
    }

    startButton.addEventListener("click", () => {
      if (solved || started) return;
      started = true;
      startButton.hidden = true;
      round = 0;
      renderRound();
    });
    resetButton.addEventListener("click", () => {
      epoch += 1;
      resetCommon();
      started = false;
      busy = false;
      round = 0;
      showLocked();
      setStatus(strings.ready);
      startButton.focus();
    });
    showLocked();
    setStatus(strings.ready);
  }

  function setupMemoryNonogram() {
    const size = 5;
    const solution = ["01110", "11111", "11111", "01110", "00100"]
      .join("")
      .split("")
      .map((pixel) => pixel === "1");
    const rowClues = [[3], [5], [5], [3], [1]];
    const columnClues = [[2], [4], [5], [4], [2]];
    const targetCount = solution.filter(Boolean).length;
    const marks = Array(solution.length).fill(0);
    let started = false;

    const puzzle = document.createElement("div");
    puzzle.className = "memory-nonogram";
    puzzle.setAttribute("role", "group");
    const columnClueList = document.createElement("div");
    columnClueList.className = "memory-column-clues";
    const rowClueList = document.createElement("div");
    rowClueList.className = "memory-row-clues";
    const grid = document.createElement("div");
    grid.className = "memory-grid";
    const cells = [];

    columnClues.forEach((clues, column) => {
      const clue = document.createElement("div");
      clue.className = "memory-clue";
      clue.textContent = clues.join(" ");
      clue.setAttribute("aria-label", format(strings.columnClue, {
        column: column + 1,
        clues: clues.join(", "),
      }));
      columnClueList.appendChild(clue);
    });

    rowClues.forEach((clues, row) => {
      const clue = document.createElement("div");
      clue.className = "memory-clue";
      clue.textContent = clues.join(" ");
      clue.setAttribute("aria-label", format(strings.rowClue, {
        row: row + 1,
        clues: clues.join(", "),
      }));
      rowClueList.appendChild(clue);
    });

    function refresh() {
      cells.forEach((cell, index) => {
        const state = marks[index];
        cell.classList.toggle("is-filled", state === 1);
        cell.disabled = !started || solved;
        cell.setAttribute("aria-pressed", String(state === 1));
        cell.setAttribute("aria-label", format(strings.cellLabel, {
          row: Math.floor(index / size) + 1,
          column: (index % size) + 1,
          state: strings.cellStates[state],
        }));
      });
      progressReadout.textContent = `${marks.filter((mark) => mark === 1).length} / ${targetCount}`;
    }

    function updateCell(index) {
      if (!started || solved) return;
      marks[index] = marks[index] === 1 ? 0 : 1;
      refresh();
      const matchesSolution = marks.every((mark, pixel) =>
        (mark === 1) === solution[pixel],
      );
      if (matchesSolution) {
        completeLevel();
      } else if (marks.filter((mark) => mark === 1).length >= targetCount) {
        setStatus(strings.checkClues);
      } else {
        setStatus(strings.playing);
      }
    }

    for (let index = 0; index < solution.length; index += 1) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "memory-cell";
      cell.addEventListener("click", () => updateCell(index));
      cell.addEventListener("keydown", (event) => {
        const row = Math.floor(index / size);
        const column = index % size;
        const destinations = {
          ArrowUp: row > 0 ? index - size : -1,
          ArrowDown: row < size - 1 ? index + size : -1,
          ArrowLeft: column > 0 ? index - 1 : -1,
          ArrowRight: column < size - 1 ? index + 1 : -1,
        };
        if (destinations[event.key] !== undefined) {
          event.preventDefault();
          cells[destinations[event.key]]?.focus();
        }
      });
      cells.push(cell);
      grid.appendChild(cell);
    }

    puzzle.append(columnClueList, rowClueList, grid);
    board.replaceChildren(puzzle);
    startButton.addEventListener("click", () => {
      if (solved || started) return;
      started = true;
      startButton.hidden = true;
      refresh();
      setStatus(strings.playing);
      cells[0].focus();
    });
    resetButton.addEventListener("click", () => {
      resetCommon();
      started = false;
      marks.fill(0);
      refresh();
      setStatus(strings.ready);
      startButton.focus();
    });
    refresh();
    setStatus(strings.ready);
  }

  function setupSnakeCaptcha() {
    const configs = {
      27: {
        size: 8,
        waypoints: [[7, 0], [1, 0], [1, 5], [3, 5], [3, 6], [4, 6], [4, 1], [2, 1], [2, 4]],
        checkpoints: [16, 11, 29, 36, 25],
        walls: [1, 2, 3, 5, 6, 7, 22, 26, 31, 42, 43, 51, 52, 55, 61, 63],
      },
      30: {
        size: 8,
        waypoints: [[7, 0], [2, 0], [2, 7], [5, 7], [5, 1], [3, 1], [3, 6]],
        checkpoints: [40, 22, 46, 25, 29],
        walls: [1, 3, 6, 9, 11, 14, 34, 37, 50, 55, 61],
      },
    };
    const config = configs[level];
    const rows = config.size;
    const checkpoints = config.checkpoints;
    const walls = new Set(config.walls);
    const route = [config.waypoints[0][0] * rows + config.waypoints[0][1]];
    config.waypoints.slice(1).forEach(([targetRow, targetColumn], segmentIndex) => {
      let [row, column] = config.waypoints[segmentIndex];
      while (row !== targetRow || column !== targetColumn) {
        if (row !== targetRow) row += Math.sign(targetRow - row);
        else column += Math.sign(targetColumn - column);
        route.push(row * rows + column);
      }
    });
    const steps = route.length - 1;
    const requiredTurns = config.waypoints.length - 2;
    const start = route[0];
    const finish = route[route.length - 1];
    const grid = document.createElement("div");
    grid.className = "snake-grid";
    grid.style.setProperty("--snake-grid-size", rows);
    grid.setAttribute("role", "group");
    const cells = [];
    let started = false;
    let path = [];
    let nextCheckpoint = 0;

    function coordinates(index) {
      return [Math.floor(index / rows), index % rows];
    }

    function refreshBoard() {
      cells.forEach((cell, index) => {
        cell.classList.toggle("is-path", path.includes(index));
        cell.classList.toggle("is-current", path.at(-1) === index);
        cell.classList.toggle("is-checkpoint", checkpoints.includes(index));
        cell.classList.toggle("is-wall", walls.has(index));
        cell.disabled = !started || solved || walls.has(index);
        cell.setAttribute("aria-pressed", String(path.includes(index)));
      });
      progressReadout.textContent = `${Math.max(0, path.length - 1)} / ${steps}`;
    }

    function resetPath(message = strings.ready) {
      path = [start];
      nextCheckpoint = 0;
      refreshBoard();
      setStatus(message, message === strings.ready || message === strings.playing ? "" : "error");
    }

    function rejectPath(reason) {
      started = true;
      startButton.hidden = true;
      resetPath(reason || strings.failed);
      cells[start].focus();
    }

    function tryStep(index) {
      if (!started || solved) return;
      const current = path.at(-1);
      if (walls.has(index)) {
        setStatus(strings.wall, "error");
        return;
      }
      const [row, column] = coordinates(current);
      const [nextRow, nextColumn] = coordinates(index);
      if (Math.abs(row - nextRow) + Math.abs(column - nextColumn) !== 1) {
        setStatus(strings.adjacent, "error");
        return;
      }
      if (index === path.at(-2)) {
        path.pop();
        nextCheckpoint = checkpoints.filter((point) => path.includes(point)).length;
        refreshBoard();
        setStatus(strings.playing);
        return;
      }
      if (path.includes(index)) {
        setStatus(strings.revisit, "error");
        return;
      }
      if (index === finish) {
        const completedPath = [...path, index];
        let turns = 0;
        let previousDirection = null;
        for (let position = 1; position < completedPath.length; position += 1) {
          const previous = coordinates(completedPath[position - 1]);
          const currentPoint = coordinates(completedPath[position]);
          const direction = [currentPoint[0] - previous[0], currentPoint[1] - previous[1]];
          if (previousDirection &&
              (previousDirection[0] !== direction[0] || previousDirection[1] !== direction[1])) {
            turns += 1;
          }
          previousDirection = direction;
        }
        if (nextCheckpoint !== checkpoints.length) {
          rejectPath(strings.failedCheckpoints);
          return;
        }
        if (completedPath.length - 1 !== steps) {
          rejectPath(format(strings.failedLength, { moves: completedPath.length - 1, steps }));
          return;
        }
        if (turns !== requiredTurns) {
          rejectPath(format(strings.failedTurns, { turns, required: requiredTurns }));
          return;
        }
        path.push(index);
        refreshBoard();
        completeLevel();
        return;
      }
      if (checkpoints.includes(index) && index !== checkpoints[nextCheckpoint]) {
        rejectPath(strings.failedOrder);
        return;
      }
      path.push(index);
      if (index === checkpoints[nextCheckpoint]) nextCheckpoint += 1;
      refreshBoard();
      setStatus(strings.playing);
    }

    for (let index = 0; index < rows * rows; index += 1) {
      const cell = document.createElement("button");
      const checkpointNumber = checkpoints.indexOf(index);
      cell.type = "button";
      cell.className = "snake-cell";
      cell.dataset.cell = String(index);
      if (walls.has(index)) {
        cell.textContent = "×";
        cell.setAttribute("aria-label", format(strings.blockedCell, {
          row: coordinates(index)[0] + 1,
          column: coordinates(index)[1] + 1,
        }));
      } else if (index === start) {
        cell.textContent = "S";
        cell.setAttribute("aria-label", strings.startCell);
      } else if (index === finish) {
        cell.textContent = "E";
        cell.setAttribute("aria-label", strings.finishCell);
      } else if (checkpointNumber !== -1) {
        cell.textContent = String(checkpointNumber + 1);
        cell.setAttribute("aria-label", format(strings.checkpointCell, {
          number: checkpointNumber + 1,
        }));
      } else {
        cell.textContent = "";
        cell.setAttribute("aria-label", format(strings.openCell, {
          row: coordinates(index)[0] + 1,
          column: coordinates(index)[1] + 1,
        }));
      }
      cell.addEventListener("click", () => tryStep(index));
      cell.addEventListener("keydown", (event) => {
        const current = path.at(-1) ?? start;
        const [row, column] = coordinates(current);
        const moves = {
          ArrowUp: row > 0 ? current - rows : -1,
          ArrowDown: row < rows - 1 ? current + rows : -1,
          ArrowLeft: column > 0 ? current - 1 : -1,
          ArrowRight: column < rows - 1 ? current + 1 : -1,
        };
        const destination = moves[event.key];
        if (destination !== undefined) {
          event.preventDefault();
          tryStep(destination);
          cells[destination]?.focus();
        }
      });
      cells.push(cell);
      grid.appendChild(cell);
    }
    board.replaceChildren(grid);
    board.setAttribute("aria-label", strings.boardAria);
    startButton.addEventListener("click", () => {
      if (solved || started) return;
      started = true;
      startButton.hidden = true;
      resetPath(strings.playing);
      cells[start].focus();
    });
    resetButton.addEventListener("click", () => {
      resetCommon();
      started = false;
      resetPath(strings.ready);
      startButton.focus();
    });
    resetPath(strings.ready);
  }

  if (level === 21) setupReverseCipher();
  if (level === 22) setupMultipleAlignment();
  if (level === 23) setupRhythm();
  if (level === 24) setupMirrorPuzzle();
  if (level === 25) setupDynamicSort();
  if (level === 26) setupSnakesAndLadders();
  if (level === 27 || level === 30) setupSnakeCaptcha();
  if (level === 28) setupCaptcha();
  if (level === 29) setupMemoryNonogram();

  nextButton.addEventListener("click", () => {
    if (!solved) return;
    const nextLevel = level + 1;
    if (!saveProgress(nextLevel)) {
      setStatus(part.saveError, "error");
      return;
    }
    window.location.href = `niveau-${String(nextLevel).padStart(2, "0")}.html`;
  });
  saveButton.addEventListener("click", () => {
    const saved = saveProgress();
    setStatus(saved ? part.saved : part.saveError, saved ? "success" : "error");
  });
  saveProgress();
})();
