/* Strips decorative layers that have no place in the minimal regime.
 *
 * Each of these was pure ornament — it existed to be looked at, not to
 * communicate anything. Removing them from the CSS would leave silent class
 * names scattered through the JSX, so this also removes the references:
 *
 *   bg-grain        film grain over every dark surface
 *   bg-aurora       colour wash behind hero and CTA
 *   bg-vignette     corner darkening
 *   bg-dotgrid      printed dot texture
 *   bg-linenetwork  printed grid texture
 *   tile-edge       fake top catch-light on cards
 *   tile-raise      drop shadow used as depth
 *   panel-glow      crimson bleed around panels
 *   accent-glow     crimson bleed around buttons
 *   sweep           animated light travelling across console panes
 *   elev-1..4       the shadow-stack elevation tiers (one .float remains)
 *   tilt            pointer-tracked card rotation (useTilt is withdrawn)
 *   text-gradient   faked grey-out gradient on headings
 *
 * Also removed:
 *   hover:shadow-[...rgba(var(--rgb-accent)...)]   glow bloom on hover
 *   style={{ transform: "translateZ(...px)" }}      fake 3D card layers
 *
 * Not touched: `.rule` (now a flat hairline, still structural), `.pulse-dot`
 * (functional live indicator), `.float` (real elevation), the type scale.
 *
 * Run once: `node scripts/strip-ornament.js`
 */
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "..", "src");

// Classes removed outright. (?![-\w]) stops matching `bg-grainless` etc.
const ORNAMENT = [
  "bg-grain",
  "bg-aurora",
  "bg-vignette",
  "bg-dotgrid",
  "bg-linenetwork",
  "tile-edge",
  "tile-raise",
  "panel-glow",
  "accent-glow",
  "sweep",
  "text-gradient",
  "elev-1",
  "elev-2",
  "elev-3",
  "elev-4",
  "tilt",
].map((c) => new RegExp(`(?<![-\\w])${c}(?![-\\w])`, "g"));

// `will-change-transform` existed only to promote the tilt layers.
const WILL_CHANGE = /(?<![-\w])will-change-transform(?![-\w])/g;

// The full-width glow shadow used under primary CTAs, e.g.
//   hover:shadow-[0_14px_44px_-14px_rgba(var(--rgb-accent),)]
const GLOW_SHADOW = /(?<![-\w])(?:hover:)?shadow-\[0_[^\]]*rgba\(var\(--rgb-accent\)[^\]]*\]/g;

// Fake depth: style={{ transform: "translateZ(40px)" }}
const TRANSLATE_Z = /style=\{\{\s*transform:\s*"translateZ\([^"]*\)"\s*\}\}/g;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

const tally = Object.create(null);
let files = 0;
let total = 0;

const note = (key, n) => {
  tally[key] = (tally[key] ?? 0) + n;
  total += n;
};

for (const file of walk(SRC)) {
  const before = fs.readFileSync(file, "utf8");
  let out = before;

  for (const re of ORNAMENT) {
    const hit = out.match(re);
    if (hit) {
      note(hit[0], hit.length);
      out = out.replace(re, "");
    }
    re.lastIndex = 0;
  }

  for (const [key, re] of [
    ["will-change-transform", WILL_CHANGE],
    ["glow shadow", GLOW_SHADOW],
    ["translateZ layer", TRANSLATE_Z],
  ]) {
    const hit = out.match(re);
    if (hit) {
      note(key, hit.length);
      out = out.replace(re, "");
    }
    re.lastIndex = 0;
  }

  // Collapse the whitespace the removals left behind, inside class strings only.
  const cleaned = out
    .replace(/className="([^"]*)"/g, (m, cls) => {
      const next = cls.replace(/\s{2,}/g, " ").trim();
      // style={{ transform: "translateZ(...)" }} removals can leave an empty style.
      return `className="${next}"`;
    })
    .replace(/(?:^|\s)style=\{\{\s*\}\}/g, "")
    .replace(/className=""/g, "")
    .replace(/style=\{\{\s*\}\}/g, "");

  if (cleaned !== before) {
    const finalised = cleaned
      .replace(/"\s+>/g, '">')
      .replace(/\s{2,}"/g, '"');
    fs.writeFileSync(file, finalised);
    files++;
  }
}

for (const [key, n] of Object.entries(tally).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(4)}  ${key}`);
}
console.log(`\n${total} decorative references removed across ${files} files.`);
