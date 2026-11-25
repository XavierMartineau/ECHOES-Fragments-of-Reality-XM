const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function createLevel() {
  const elements = new Map();
  class Element {
    constructor() {
      this.children = [];
      this.attributes = {};
      this.listeners = {};
      this.dataset = {};
      this.style = { setProperty() {} };
      this.className = "";
      this.disabled = false;
      this.hidden = false;
      this.classList = {
        add: (name) => { this.className += ` ${name}`; },
        remove: (name) => { this.className = this.className.split(" ").filter((part) => part !== name).join(" "); },
        toggle: (name, force) => {
          this.classList.remove(name);
          if (force) this.classList.add(name);
        },
      };
    }
    set innerHTML(value) {
      this.children = [];
      for (const id of value.matchAll(/id="([^"]+)"/g)) {
        const element = new Element();
        if (id[1] === "nextLevelButton") element.hidden = true;
        elements.set(id[1], element);
      }
    }
    setAttribute(name, value) { this.attributes[name] = value; }
    removeAttribute(name) { delete this.attributes[name]; }
    append(...children) { this.children.push(...children); }
    appendChild(child) { this.children.push(child); }
    prepend(child) { this.children.unshift(child); }
    replaceChildren(...children) { this.children = children; }
    addEventListener(type, handler) { this.listeners[type] = handler; }
    click() { if (!this.disabled) this.listeners.click?.(); }
    querySelector(selector) { return this.queries?.[selector] || null; }
    querySelectorAll(selector) {
      if (selector === ".is-selected") return this.children.filter((child) => child.className.split(" ").includes("is-selected"));
      return [];
    }
  }
  const intro = new Element();
  intro.queries = Object.fromEntries(
    [".eyebrow", "h1", ".level-description", ".system-label"].map((selector) => [selector, new Element()]),
  );
  const panel = new Element();
  const main = new Element();
  main.queries = { ".level-intro": intro, ".puzzle-panel": panel };
  for (const id of ["systemMessage", "levelProgress"]) elements.set(id, new Element());
  const other = new Map(
    [".level-meta > span", ".level-meta > strong", ".level-footer > span:first-child", ".level-footer > span:last-child"]
      .map((selector) => [selector, new Element()]),
  );
  const document = {
    documentElement: {},
    createElement: () => new Element(),
    getElementById: (id) => elements.get(id),
    querySelector: (selector) => selector === ".level-shell" ? main : other.get(selector),
    querySelectorAll: () => [],
  };
  const math = Object.create(Math);
  math.random = () => 0.999;
  const localStorage = { getItem: () => null, setItem() {} };
  const window = { location: { pathname: "/niveau-06.html", reload() {} } };
  const source = fs.readFileSync(path.join(__dirname, "..", "docs", "js", "niveaux", "partie-1-puzzles.js"), "utf8");
  vm.runInNewContext(source, { document, window, localStorage, Math: math, console });
  elements.get("startPuzzleButton").click();
  const board = elements.get("puzzleBoard");
  const [, history, current, palette] = board.children;
  const [undo, submit] = elements.get("challengeToolbar").children;
  return {
    history, current, palette, undo, submit,
    status: elements.get("puzzleStatus"),
    progress: elements.get("progressReadout"),
    next: elements.get("nextLevelButton"),
    place(position, color) {
      palette.children[color].click();
      current.children[position].click();
    },
  };
}

test("level 6 locks exact colors and marks misplaced and absent colors", () => {
  const game = createLevel();
  [0, 2, 1, 5, 4].forEach((color, index) => game.place(index, color));
  game.submit.click();
  assert.deepEqual(game.history.children[0].children.slice(0, 5).map((item) => item.children[0].className), [
    "mastermind-feedback is-exact", "mastermind-feedback is-misplaced",
    "mastermind-feedback is-misplaced", "mastermind-feedback is-absent",
    "mastermind-feedback is-exact",
  ]);
  assert.deepEqual(game.current.children.map((slot) => slot.disabled), [true, false, false, false, true]);
  assert.match(game.current.children[0].attributes["aria-label"], /cyan.*verrouillée/);
  assert.equal(game.current.children[1].textContent, "?");
  assert.equal(game.current.children[2].textContent, "?");
  assert.equal(game.current.children[3].textContent, "?");
  game.place(1, 0);
  assert.match(game.status.textContent, /une fois/);
  game.place(1, 1);
  game.undo.click();
  assert.equal(game.current.children[1].textContent, "?");
  assert.equal(game.current.children[4].disabled, true);
  [1, 2, 3].forEach((color, index) => game.place(index + 1, color));
  game.submit.click();
  assert.equal(game.progress.textContent, "2 / 7");
  assert.equal(game.next.hidden, false);
  assert.ok(game.current.children.every((slot) => slot.disabled));
});

test("level 6 rejects incomplete guesses and stops after seven attempts", () => {
  const game = createLevel();
  game.submit.click();
  assert.match(game.status.textContent, /cinq positions/);
  assert.equal(game.progress.textContent, "0 / 7");
  for (let attempt = 0; attempt < 7; attempt++) {
    [1, 2, 3, 4, 5].forEach((color, index) => game.place(index, color));
    game.submit.click();
  }
  assert.equal(game.progress.textContent, "7 / 7");
  assert.equal(game.submit.disabled, true);
  assert.match(game.status.textContent, /Plus d'essais/);
  assert.equal(game.next.hidden, true);
});
