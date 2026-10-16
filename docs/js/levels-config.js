// LEVELS CONFIG // campaign structure, unlock rules and progression helpers.
// Pour ajouter des niveaux : compléter une entrée de `series` (ou en ajouter une),
// puis passer `ready: true` lorsque les pages HTML existent.
window.EchoesLevels = (() => {
  const htmlRoot = document.currentScript
    ? new URL("../html/", document.currentScript.src)
    : new URL("./", window.location.href);

  const series = [
    {
      id: 1,
      theme: { accent: "#79f7ff", accent2: "#b36cff" },
      folder: "partie-1_niveau-1_à_10",
      name: { fr: "Initiation", en: "Initiation" },
      start: 1,
      end: 10,
      boss: {
        file: "boss-01.html",
        key: "resonance-1",
        name: { fr: "Boss // CLÉ 01", en: "Boss // KEY 01" },
      },
    },
    {
      id: 2,
      theme: { accent: "#4b9eff", accent2: "#d4dce7" },
      folder: "partie-2_niveau-11_à_20",
      name: { fr: "Fractures", en: "Fractures" },
      start: 11,
      end: 20,
      boss: {
        file: "boss-02.html",
        key: "resonance-2",
        name: { fr: "Boss // CLÉ 02", en: "Boss // KEY 02" },
      },
    },
    {
      id: 3,
      theme: { accent: "#ff4fd8", accent2: "#a855f7" },
      folder: "partie-3_niveau-21_à_30",
      name: { fr: "Éclipse", en: "Eclipse" },
      start: 21,
      end: 30,
      boss: {
        file: "boss-03.html",
        key: "resonance-3",
        name: { fr: "Boss // CLÉ 03", en: "Boss // KEY 03" },
      },
    },
    {
      id: 4,
      theme: { accent: "#38d6ff", accent2: "#bd63ff" },
      folder: "partie-4_niveau-31_à_40",
      name: { fr: "Résonance", en: "Resonance" },
      start: 31,
      end: 40,
    },
    {
      id: 5,
      theme: { accent: "#ffb84d", accent2: "#ff7a45" },
      folder: "partie-5_niveau-41_à_50",
      name: { fr: "Convergence", en: "Convergence" },
      start: 41,
      end: 50,
      ready: false,
    },
    {
      id: 6,
      theme: { accent: "#f5e6a8", accent2: "#ffd27a" },
      folder: "partie-6_niveau-51_à_60",
      name: { fr: "Origine", en: "Origin" },
      start: 51,
      end: 60,
      ready: false,
    },
  ];

  const assetRoot = document.currentScript
    ? new URL("../assets/svg/", document.currentScript.src)
    : new URL("./", window.location.href);

  function pad2(number) {
    return String(number).padStart(2, "0");
  }

  // Clés de résonance : une par boss. Ajouter une entrée pour une nouvelle clé.
  const keys = [1, 2, 3, 4, 5, 6].map((number) => ({
    id: `resonance-${number}`,
    number,
    image: new URL(`key-${pad2(number)}-usb.svg`, assetRoot).href,
  }));

  // Niveau final : requiert tous les boss et le dernier niveau.
  const finale = {
    id: "finale",
    file: "fin-finale/fin-finale.html",
    name: { fr: "La fin finale", en: "The final end" },
    ready: false,
  };

  const pad = (number) => String(number).padStart(2, "0");

  // Construit la liste ordonnée des niveaux avec leurs prérequis.
  function buildItems() {
    // L'introduction précède le niveau 1 : il ne se débloque qu'après elle.
    const items = [
      {
        id: "intro",
        type: "intro",
        number: 0,
        label: { fr: "Introduction", en: "Introduction" },
        series: "intro",
        ready: true,
        file: "introduction.html",
        requires: [],
      },
    ];
    let gate = ["intro"];
    series.forEach((serie) => {
      const ready = serie.ready !== false;
      const levelIds = [];
      for (let number = serie.start; number <= serie.end; number += 1) {
        const id = `level-${number}`;
        items.push({
          id,
          type: "level",
          number,
          label: String(number),
          series: serie.id,
          ready,
          file: `${serie.folder}/niveau-${pad(number)}.html`,
          requires: levelIds.length ? [levelIds[levelIds.length - 1]] : gate,
        });
        levelIds.push(id);
      }
      if (serie.boss) {
        const id = `boss-${pad(serie.id)}`;
        items.push({
          id,
          type: "boss",
          number: serie.end + 0.5,
          label: serie.boss.name,
          series: serie.id,
          ready,
          key: serie.boss.key,
          file: `${serie.folder}/${serie.boss.file}`,
          requires: levelIds.slice(),
        });
        gate = [id];
      } else {
        gate = [levelIds[levelIds.length - 1]];
      }
    });
    items.push({
      id: finale.id,
      type: "final",
      number: Number.MAX_SAFE_INTEGER,
      label: finale.name,
      series: "final",
      ready: finale.ready !== false,
      file: finale.file,
      requires: items
        .filter(
          (entry) =>
            entry.type === "boss" ||
            entry.id === `level-${series[series.length - 1].end}`,
        )
        .map((entry) => entry.id),
    });
    return items;
  }

  const items = buildItems();
  const byId = new Map(items.map((item) => [item.id, item]));

  // Renvoie l'URL absolue d'un niveau.
  function urlFor(item) {
    return new URL(
      item.file.split("/").map(encodeURIComponent).join("/"),
      htmlRoot,
    ).href;
  }

  // Retrouve un niveau à partir du chemin de la page courante.
  function itemForPath(pathname = window.location.pathname) {
    const decoded = decodeURIComponent(pathname);
    const level = /niveau-(\d+)\.html$/i.exec(decoded);
    if (level) return byId.get(`level-${Number(level[1])}`) || null;
    const boss = /boss-(\d+)\.html$/i.exec(decoded);
    if (boss) return byId.get(`boss-${pad(Number(boss[1]))}`) || null;
    return null;
  }

  // Lit les niveaux terminés (sauvegarde, ancien stockage et déduction des anciennes sauvegardes).
  function readCompleted(username) {
    const save = window.EchoesSave?.getSave(username) || {};
    const done = new Set();
    const legacy = (() => {
      try {
        const raw = localStorage.getItem(
          `echoes-completed-levels-${encodeURIComponent(username.trim().toLowerCase())}`,
        );
        return JSON.parse(raw || "[]");
      } catch {
        return [];
      }
    })();
    [...(save.completedLevels || []), ...legacy].forEach((number) => {
      if (byId.has(`level-${number}`)) done.add(`level-${number}`);
    });
    (save.completedBosses || []).forEach((id) => byId.has(id) && done.add(id));
    const keys = save.keys || [];
    items.forEach((item) => {
      if (item.type === "boss" && keys.includes(item.key)) done.add(item.id);
    });
    // Anciennes sauvegardes : le joueur ne peut être au niveau N que s'il a fini les précédents.
    const reached = Number(save.currentLevel) || 0;
    items.forEach((item) => {
      if (item.type === "level" && item.number < reached) done.add(item.id);
    });
    // Anciennes sauvegardes : avoir joué un niveau implique que l'introduction est faite.
    if (items.some((item) => item.type === "level" && done.has(item.id)) || reached >= 1)
      done.add("intro");
    return done;
  }

  // Renvoie les clés avec leur état de possession.
  function getKeys(username = window.EchoesSave?.getCurrentUser()) {
    const owned = username ? window.EchoesSave?.getKeys(username) || [] : [];
    return keys.map((key) => ({ ...key, owned: owned.includes(key.id) }));
  }

  // Calcule l'état de chaque niveau : completed / current / unlocked / locked / soon.
  function getProgress(username = window.EchoesSave?.getCurrentUser()) {
    const done = username ? readCompleted(username) : new Set();
    let currentId = null;
    const states = items.map((item) => {
      let state;
      if (!item.ready) state = "soon";
      else if (done.has(item.id)) state = "completed";
      else if (item.requires.every((id) => done.has(id))) {
        state = currentId ? "unlocked" : "current";
        currentId = currentId || item.id;
      } else state = "locked";
      return { ...item, state };
    });
    const playable = states.filter((item) => item.ready);
    const completed = playable.filter((item) => item.state === "completed");
    return {
      items: states,
      currentId,
      completedCount: completed.length,
      total: playable.length,
      percent: playable.length
        ? Math.round((completed.length / playable.length) * 100)
        : 0,
    };
  }

  // Indique si un niveau peut être ouvert.
  function canOpen(id, username) {
    const item = getProgress(username).items.find((entry) => entry.id === id);
    return (
      Boolean(item) && ["completed", "current", "unlocked"].includes(item.state)
    );
  }

  // Enregistre la réussite d'un niveau ou d'un boss.
  function markCompleted(id, username = window.EchoesSave?.getCurrentUser()) {
    const item = byId.get(id);
    if (!item || !username || !window.EchoesSave) return false;
    const save = window.EchoesSave.getSave(username) || {};
    const patch = {};
    if (item.type === "level") {
      const levels = new Set(save.completedLevels || []);
      levels.add(item.number);
      patch.completedLevels = [...levels].sort((a, b) => a - b);
    } else {
      patch.completedBosses = [
        ...new Set([...(save.completedBosses || []), id]),
      ];
    }
    const saved = window.EchoesSave.saveProgress(patch, username);
    if (saved) {
      document.dispatchEvent(
        new CustomEvent("echoes:level-completed", { detail: { id } }),
      );
    }
    return saved;
  }

  return {
    series,
    keys,
    finale,
    getKeys,
    items,
    htmlRoot,
    hubUrl: new URL("niveaux.html", htmlRoot).href,
    loginUrl: new URL("login.html", htmlRoot).href,
    urlFor,
    itemForPath,
    getProgress,
    canOpen,
    markCompleted,
  };
})();
