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

  function setupSnakeCaptcha() {
    const configs = {
      26: {
        size: 5,
        waypoints: [[0, 0], [0, 4], [4, 4]],
        checkpoints: [2, 14],
        walls: [5, 6, 8, 10, 12, 15, 17, 20, 22],
      },
      27: {
        size: 6,
        waypoints: [[5, 0], [0, 0], [0, 5], [5, 5]],
        checkpoints: [18, 3, 17, 29],
        walls: [7, 9, 13, 15, 19, 21, 25, 27, 31, 33],
      },
      28: {
        size: 7,
        waypoints: [[6, 0], [0, 0], [0, 5], [4, 5], [4, 1], [2, 1], [2, 4]],
        checkpoints: [28, 4, 26, 30, 17],
        walls: [8, 10, 13, 23, 24, 27, 34, 36, 39, 41, 45, 47],
      },
      29: {
        size: 7,
        waypoints: [[6, 0], [6, 6], [0, 6], [0, 0], [4, 0], [4, 4], [5, 4]],
        checkpoints: [45, 3, 28, 32],
        walls: [8, 10, 12, 16, 18, 22, 24, 26, 36, 38, 40],
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
      setStatus(message, message === strings.failed ? "error" : "");
    }

    function rejectPath() {
      started = true;
      startButton.hidden = true;
      resetPath(strings.failed);
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
        if (completedPath.length - 1 !== steps || turns !== requiredTurns ||
            nextCheckpoint !== checkpoints.length) {
          rejectPath();
          return;
        }
        path.push(index);
        refreshBoard();
        completeLevel();
        return;
      }
      if (checkpoints.includes(index) && index !== checkpoints[nextCheckpoint]) {
        rejectPath();
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
  if (level >= 26) setupSnakeCaptcha();

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
