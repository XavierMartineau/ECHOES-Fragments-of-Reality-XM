const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

function environment(options = {}) {
  const listeners = new Map();
  const classes = new Set(options.classes || []);
  const frames = new Map();
  let nextFrame = 1;
  let now = 0;
  const storage = (values = {}) => ({
    getItem: (key) => values[key] || null,
    setItem: (key, value) => { values[key] = value; },
  });
  const on = (target, type, fn) => {
    const key = `${target}:${type}`;
    if (!listeners.has(key)) listeners.set(key, []);
    listeners.get(key).push(fn);
  };
  const emit = (target, type, detail) => {
    for (const fn of listeners.get(`${target}:${type}`) || []) fn({ type, detail });
  };
  const classList = {
    add: (...names) => names.forEach((name) => classes.add(name)),
    contains: (name) => classes.has(name),
    toggle: (name, force) => {
      if (force) classes.add(name);
      else classes.delete(name);
    },
  };
  let draws = 0;
  let lastState;
  const scene = {
    pal: [[1, 2, 3], [4, 5, 6]], tier: 1, rich: 1,
    init: (state) => { lastState = { dpr: state.dpr, k: state.k }; },
    draw: () => { draws++; },
  };
  const canvasContext = { setTransform() {}, save() {}, clearRect() {}, restore() {} };
  function element(tag) {
    return {
      style: { setProperty() {} },
      setAttribute() {},
      appendChild(child) {
        if (child.tag === "script") queueMicrotask(() => child.onload());
      },
      addEventListener() {},
      remove() {},
      getContext: () => canvasContext,
      tag,
    };
  }
  const document = {
    currentScript: { src: "https://example.test/docs/js/scene-bg.js" },
    documentElement: { classList, style: { setProperty() {} } },
    head: element("head"),
    body: { prepend() {}, appendChild() {} },
    hidden: !!options.hidden,
    createElement: element,
    addEventListener: (type, fn) => on("document", type, fn),
  };
  const window = {
    innerWidth: options.width || 1200, innerHeight: 800, devicePixelRatio: 2,
    matchMedia: () => ({ matches: !!options.reduced }),
    addEventListener: (type, fn) => on("window", type, fn),
    dispatchEvent: (event) => emit("window", event.type, event.detail),
    EchoesSceneMotifs: { make: () => scene, level: () => scene, boss: () => scene },
  };
  const context = vm.createContext({
    window, document, URL, Event, console, Math,
    location: { pathname: "/niveau-01.html", href: "https://example.test/niveau-01.html" },
    navigator: { hardwareConcurrency: 8, deviceMemory: 8 },
    localStorage: storage(options.local),
    sessionStorage: storage(options.session),
    performance: { getEntriesByType: () => [] },
    requestAnimationFrame: (fn) => { const id = nextFrame++; frames.set(id, fn); return id; },
    cancelAnimationFrame: (id) => frames.delete(id),
    setTimeout: () => 1,
    clearTimeout() {},
  });
  return {
    context, document, classes,
    run: (file) => vm.runInContext(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), context),
    step: (ms) => {
      now += ms;
      const callbacks = [...frames.values()];
      frames.clear();
      callbacks.forEach((fn) => fn(now));
    },
    emit,
    get pending() { return frames.size; },
    get draws() { return draws; },
    get state() { return lastState; },
  };
}

test("FPS monitor activates only after sustained low frame rates and pauses while hidden", () => {
  const e = environment();
  e.run("lag-fix/fps-boost.js");
  for (let i = 0; i < 600; i++) e.step(1000 / 60);
  assert.equal(e.classes.has("lagfix-lite"), false);
  e.document.hidden = true;
  e.emit("document", "visibilitychange");
  assert.equal(e.pending, 0);
  e.document.hidden = false;
  e.emit("document", "visibilitychange");
  for (let i = 0; i < 70; i++) e.step(50);
  assert.equal(e.classes.has("lagfix-lite"), false);
  for (let i = 0; i < 70; i++) e.step(50);
  assert.equal(e.classes.has("lagfix-lite"), true);
  assert.equal(e.pending, 0);
  e.document.hidden = true;
  e.emit("document", "visibilitychange");
  e.document.hidden = false;
  e.emit("document", "visibilitychange");
  assert.equal(e.pending, 0);
});

test("manual lite mode still pauses CSS animations when hidden", () => {
  const e = environment({ local: { "echoes-perf": "lite" } });
  e.run("lag-fix/fps-boost.js");
  e.document.hidden = true;
  e.emit("document", "visibilitychange");
  assert.equal(e.classes.has("lagfix-hidden"), true);
});

test("FPS threshold is based on frame intervals, not the initial callback", () => {
  const fast = environment();
  const slow = environment();
  fast.run("lag-fix/fps-boost.js");
  slow.run("lag-fix/fps-boost.js");
  for (let i = 0; i < 400; i++) {
    fast.step(1000 / 45.1);
    slow.step(1000 / 44.8);
  }
  assert.equal(fast.classes.has("lagfix-lite"), false);
  assert.equal(slow.classes.has("lagfix-lite"), true);
});

test("scene stays animated at its intentional mobile cadence and responds to lite mode", async () => {
  const e = environment({ width: 390 });
  e.run("docs/js/scene-bg.js");
  await new Promise(setImmediate);
  for (let i = 0; i < 600; i++) e.step(1000 / 60);
  const before = e.draws;
  for (let i = 0; i < 120; i++) e.step(1000 / 60);
  assert.ok(e.draws - before >= 55);
  assert.equal(e.state.dpr, 1.5);
  e.emit("window", "echoes:performance");
  assert.equal(e.state.dpr, 1);
  assert.equal(e.state.k, 0.45);
  const liteBefore = e.draws;
  for (let i = 0; i < 120; i++) e.step(1000 / 60);
  assert.ok(e.draws - liteBefore >= 25 && e.draws - liteBefore <= 31);
  e.document.hidden = true;
  e.emit("document", "visibilitychange");
  assert.equal(e.pending, 0);
  e.document.hidden = false;
  e.emit("document", "visibilitychange");
  assert.equal(e.pending, 1);
  e.emit("window", "echoes:reduce", true);
  assert.equal(e.pending, 0);
  e.document.hidden = true;
  e.emit("document", "visibilitychange");
  e.document.hidden = false;
  e.emit("document", "visibilitychange");
  assert.equal(e.pending, 0);
  e.emit("window", "echoes:reduce", false);
  assert.equal(e.pending, 1);
});

test("scene preserves lite mode activated before it loads", async () => {
  const e = environment({ classes: ["lagfix-lite", "fx-lite"] });
  e.run("docs/js/scene-bg.js");
  await new Promise(setImmediate);
  assert.equal(e.classes.has("fx-lite"), true);
  assert.equal(e.state.dpr, 1);
});
