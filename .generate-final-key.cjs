const fs = require("node:fs");
const path = require("node:path");

const svgDirectory = path.join(__dirname, "docs", "assets", "svg");
const sourceKeys = Array.from({ length: 6 }, (_, index) => {
  const number = String(index + 1).padStart(2, "0");
  const file = path.join(svgDirectory, `key-${number}-usb.svg`);
  const source = fs.readFileSync(file, "utf8");
  const match = source.match(/^<svg\b([^>]*)>([\s\S]*?)<\/svg>\s*$/);
  if (!match) throw new Error(`Invalid SVG root in ${file}`);
  const viewBox = match[1].match(/\bviewBox="([^"]+)"/)?.[1];
  if (!viewBox) throw new Error(`Missing viewBox in ${file}`);
  const body = match[2].match(/<title\b[^>]*>[\s\S]*?<\/title>\s*<desc\b[^>]*>[\s\S]*?<\/desc>\s*<defs\b[^>]*>([\s\S]*?)<\/defs>\s*([\s\S]*)/);
  if (!body) throw new Error(`Unable to split SVG artwork and definitions in ${file}`);
  const prefix = `key07mini${number}-`;
  const namespaceIds = (markup) =>
    markup
      .replace(/\bid="([^"]+)"/g, (_, id) => `id="${prefix}${id}"`)
      .replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${prefix}${id})`)
      .replace(/\b(href|xlink:href)="#([^"]+)"/g, (_, attribute, id) => `${attribute}="#${prefix}${id}"`)
      .replace(/\baria-labelledby="([^"]+)"/g, (_, ids) => `aria-labelledby="${ids.split(/\s+/).map((id) => prefix + id).join(" ")}"`);
  return {
    number,
    definitions: namespaceIds(body[1].trim()),
    content: namespaceIds(body[2].trim()),
    titleDescription: namespaceIds(match[2].match(/<title\b[^>]*>[\s\S]*?<\/title>\s*<desc\b[^>]*>[\s\S]*?<\/desc>/)[0]),
    sheetContent: match[2].trim(),
    viewBox,
  };
});

const colors = ["#d9f27e", "#6759e8", "#ff8c83", "#44d9c8", "#f2c9ff"];
const spectrum = colors
  .map((color, index) => {
    return `      <stop offset="${index / (colors.length - 1)}" stop-color="${color}" class="k7-spectrum-tone tone-${index + 1}"/>`;
  })
  .join("\n");
const spectrumAnimations = colors
  .map((color, index) => {
    const next = colors[(index + 1) % colors.length];
    return `      .k7-spectrum-tone.tone-${index + 1} { animation: k7-tone-${index + 1} ${5.6 + index * 0.31}s ease-in-out ${-index * 0.7}s infinite; }
      @keyframes k7-tone-${index + 1} { 0%, 100% { stop-color: ${color}; } 50% { stop-color: ${next}; } }`;
  })
  .join("\n");

const miniatureCenters = [
  [90, 90, 180],
  [124.64, 110, 240],
  [124.64, 150, 300],
  [90, 170, 0],
  [55.36, 150, 60],
  [55.36, 110, 120],
];

const miniatures = sourceKeys
  .map(({ number, viewBox, titleDescription, definitions, content }, index) => {
    const [cx, cy, angle] = miniatureCenters[index];
    const height = Number(viewBox.split(/\s+/)[3]) * 24 / Number(viewBox.split(/\s+/)[2]);
    const x = cx - 12;
    const y = cy - height / 2;
    return `      <g class="k7-orbit-key key-${number}" transform="rotate(${angle} ${cx} ${cy})">
        <svg x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="24" height="${height.toFixed(2)}" viewBox="${viewBox}" overflow="visible" role="img" aria-labelledby="key07mini${number}-key${number}Title key07mini${number}-key${number}Desc">
          ${titleDescription}
          <defs>${definitions}</defs>
          ${content}
        </svg>
      </g>`;
  })
  .join("\n");

const finalKey = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 270" role="img" aria-labelledby="key07Title key07Desc">
  <title id="key07Title">Clé de résonance 07 — La clé finale</title>
  <desc id="key07Desc">Clé USB finale prismatique. Les six clés de résonance précédentes conservent leurs formes et animations dans son cœur, orbitent en tournant autour d'un cadenas numérique muni d'un port USB, et pointent leurs connecteurs vers lui.</desc>
  <defs>
    <linearGradient id="key07Shell" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#1b1e3a"/>
      <stop offset=".5" stop-color="#11152b"/>
      <stop offset="1" stop-color="#22213a"/>
    </linearGradient>
    <linearGradient id="key07Prism" x1="0" y1="0" x2="1" y2="1">
${spectrum}
    </linearGradient>
    <linearGradient id="key07Metal" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#f7f9d5"/>
      <stop offset=".3" stop-color="#b9b2ff"/>
      <stop offset=".62" stop-color="#ffb3a7"/>
      <stop offset="1" stop-color="#91eadc"/>
    </linearGradient>
    <radialGradient id="key07Core" cx=".5" cy=".45" r=".7">
      <stop stop-color="#363276"/>
      <stop offset=".64" stop-color="#15152d"/>
      <stop offset="1" stop-color="#090d1c"/>
    </radialGradient>
    <filter id="key07Glow" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <style>
${spectrumAnimations}
      .k7-contour { stroke-dasharray: 18 7; animation: k7-contour-flow 5s linear infinite, k7-contour-pulse 2.6s ease-in-out infinite; }
      .k7-orbit { transform-box: view-box; transform-origin: 90px 130px; animation: k7-orbit 20s linear infinite; }
      .k7-field-ring { transform-box: fill-box; transform-origin: center; animation: k7-ring 12s linear infinite reverse; }
      .k7-lock-halo { animation: k7-lock-pulse 2s ease-in-out infinite; }
      .k7-port-light { animation: k7-port 1.6s ease-in-out infinite; }
      @keyframes k7-contour-flow { to { stroke-dashoffset: -100; } }
      @keyframes k7-contour-pulse {
        0%, 100% { stroke-width: 4; opacity: .64; }
        50% { stroke-width: 6; opacity: 1; }
      }
      @keyframes k7-orbit { to { transform: rotate(360deg); } }
      @keyframes k7-ring { to { transform: rotate(360deg); } }
      @keyframes k7-lock-pulse { 50% { opacity: .65; } }
      @keyframes k7-port { 50% { opacity: .28; } }
      @media (prefers-reduced-motion: reduce) {
        .k7-spectrum-tone, .k7-contour, .k7-orbit,
        .k7-field-ring, .k7-lock-halo, .k7-port-light {
          animation: none !important;
        }
      }
    </style>
  </defs>

  <g aria-hidden="true">
    <path d="M61 37h58v17h6c11 0 18 8 18 20v103c0 13-9 23-21 29l-18 4v9h16v13h-16v12H76v-12H60v-13h16v-9l-18-4c-12-6-21-16-21-29V74c0-12 7-20 18-20h6V37Z"
      fill="url(#key07Shell)" stroke="#756bc0" stroke-opacity=".34" stroke-width="10" filter="url(#key07Glow)"/>
    <path d="M61 37h58v17h6c11 0 18 8 18 20v103c0 13-9 23-21 29l-18 4v9h16v13h-16v12H76v-12H60v-13h16v-9l-18-4c-12-6-21-16-21-29V74c0-12 7-20 18-20h6V37Z"
      fill="url(#key07Shell)" stroke="url(#key07Prism)" stroke-width="4" stroke-linejoin="round"/>
    <path class="k7-contour" pathLength="100"
      d="M61 37h58v17h6c11 0 18 8 18 20v103c0 13-9 23-21 29l-18 4v9h16v13h-16v12H76v-12H60v-13h16v-9l-18-4c-12-6-21-16-21-29V74c0-12 7-20 18-20h6V37Z"
      fill="none" stroke="url(#key07Prism)" stroke-width="4" stroke-linejoin="round" filter="url(#key07Glow)"/>
    <rect x="60" y="5" width="60" height="34" rx="6" fill="url(#key07Metal)" stroke="#f1f3ff" stroke-width="1.5"/>
    <rect x="66" y="10" width="48" height="20" rx="3" fill="#10142a" stroke="#c5c2ff" stroke-opacity=".55"/>
    <rect x="71" y="14" width="9" height="12" rx="1.5" fill="#d9f27e" filter="url(#key07Glow)"/>
    <rect x="86" y="14" width="9" height="12" rx="1.5" fill="#ff8c83" filter="url(#key07Glow)"/>
    <rect x="101" y="14" width="9" height="12" rx="1.5" fill="#44d9c8" filter="url(#key07Glow)"/>
    <path d="M51 66h78M45 75h90" fill="none" stroke="url(#key07Prism)" stroke-width="1.2" opacity=".72"/>
    <path d="M81 214h18v24M99 219h12v9M81 219H69v9" fill="none" stroke="url(#key07Metal)" stroke-width="1.4" opacity=".76"/>

    <circle cx="90" cy="130" r="51" fill="#080b1b" fill-opacity=".72" stroke="url(#key07Prism)" stroke-opacity=".4" stroke-width="1.5"/>
    <circle class="k7-field-ring" cx="90" cy="130" r="47" fill="none" stroke="url(#key07Prism)" stroke-width="1.5" stroke-dasharray="2 5" filter="url(#key07Glow)"/>
    <circle cx="90" cy="130" r="43" fill="url(#key07Core)" fill-opacity=".34" stroke="#dce8ff" stroke-opacity=".18" stroke-width=".8"/>
    <g class="k7-orbit">
${miniatures}
    </g>

    <g class="k7-lock-halo">
      <circle cx="90" cy="130" r="20" fill="#090d20" fill-opacity=".96" stroke="url(#key07Prism)" stroke-width="1.6" filter="url(#key07Glow)"/>
      <path d="M82 122v-5a8 8 0 0 1 16 0v5" fill="none" stroke="url(#key07Metal)" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M78 121h24a3 3 0 0 1 3 3v17a4 4 0 0 1-4 4H79a4 4 0 0 1-4-4v-17a3 3 0 0 1 3-3Z"
        fill="url(#key07Metal)" stroke="#f6f4ff" stroke-opacity=".62" stroke-width="1"/>
      <rect x="80" y="127" width="20" height="8" rx="2" fill="#090d20" stroke="#dce8ff" stroke-opacity=".7" stroke-width=".8"/>
      <path class="k7-port-light" d="M83 130h2m2 0h2m2 0h2m2 0h2" stroke="#d9f27e" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M90 135v4" stroke="#6759e8" stroke-width="1.6" stroke-linecap="round"/>
      <circle cx="90" cy="140" r="1.4" fill="#ff8c83"/>
    </g>
    <text x="90" y="260" fill="#eff1ff" font-family="Arial, sans-serif" font-size="6" font-weight="700" letter-spacing="1.1" text-anchor="middle">KEY 07 // FINAL ECHO</text>
  </g>

</svg>
`;

const allKeys = [...sourceKeys.map((key) => ({ ...key, file: `key-${key.number}-usb.svg` }))];
allKeys.push({
  number: "07",
  file: "key-07-usb.svg",
  content: finalKey.match(/^<svg\b[^>]*>([\s\S]*)<\/svg>\s*$/)[1].trim(),
  viewBox: "0 0 180 270",
});

const positions = [
  [30, 30],
  [240, 30],
  [450, 30],
  [30, 330],
  [240, 330],
  [450, 330],
  [240, 630],
];

const sheet = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 660 930" role="img" aria-label="Les sept clés de résonance ECHO">
  <title>Les sept clés de résonance ECHO</title>
${allKeys
  .map(({ number, content, viewBox }, index) => {
    const [x, y] = positions[index];
    const height = Number(viewBox.split(/\s+/)[3]);
    const keyContent =
      number === "07"
        ? content.replace(/\bid="([^"]+)"/g, (_, id) => `id="sheet-${id}"`)
          .replace(/url\(#([^)]+)\)/g, (_, id) => `url(#sheet-${id})`)
          .replace(/\b(href|xlink:href)="#([^"]+)"/g, (_, attribute, id) => `${attribute}="#sheet-${id}"`)
          .replace(/\baria-labelledby="([^"]+)"/g, (_, ids) => `aria-labelledby="${ids.split(/\s+/).map((id) => `sheet-${id}`).join(" ")}"`)
        : sourceKeys[index].sheetContent;
    return `  <svg x="${x}" y="${y}" width="180" height="${height}" viewBox="${viewBox}" overflow="visible" role="img" aria-label="Clé de résonance ${number}">
${keyContent}
  </svg>`;
  })
  .join("\n")}
</svg>
`;

fs.writeFileSync(path.join(svgDirectory, "key-07-usb.svg"), finalKey);
fs.writeFileSync(path.join(svgDirectory, "svg.svg"), sheet);