/* Snaps one-off pixel font sizes onto the modular type scale in globals.css.
 *
 * The codebase carried ~26 distinct `text-[Npx]` values — 10.5, 11, 11.5, 12,
 * 12.5, 13, 13.5, 13.8, 14, 14.5, 15, 15.5, 16, 16.5, 17.5, 18, 19, 20, 22,
 * 24, 26, 28, 30, 32, 34, 40 — with no ramp behind them, which is why six
 * near-identical <h2>s across the landing page had drifted apart by fractions
 * of a pixel. Each value maps to the nearest stop, so a few labels shift by a
 * pixel or two; that is the intended consolidation, not a regression.
 *
 * `text-[clamp(...)]` is left alone — the two fluid display sizes are already
 * scale entries. `leading-[...]` is never matched, because the pattern requires
 * a literal `px` unit.
 *
 * Run once: `node scripts/typescale.js`
 */
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "..", "src");

/** Nearest-stop buckets, checked in order. Keys are the existing px values. */
const SCALE = {
  9.5: "2xs", 10: "2xs", 10.5: "2xs", 11: "2xs", 11.5: "2xs",
  12: "xs", 12.5: "xs",
  13: "sm", 13.5: "sm", 13.8: "sm",
  14: "base", 14.5: "base",
  15: "md", 15.5: "md",
  16: "lg", 16.5: "lg", 17: "lg",
  17.5: "xl", 18: "xl", 19: "xl", 20: "xl",
  22: "2xl", 24: "2xl", 26: "2xl",
  28: "3xl", 30: "3xl", 32: "3xl", 34: "3xl", 35: "3xl",
  40: "4xl", 46: "5xl", 48: "5xl",
};

// Only a bare `text-[<number>px]`. Negative values and clamps are left alone.
const UTIL = /(^|[^a-zA-Z0-9_-])text-\[(\d+(?:\.\d+)?)px\]/g;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

let hits = 0;
let files = 0;
const unmapped = new Map();

for (const file of walk(SRC)) {
  const before = fs.readFileSync(file, "utf8");
  const after = before.replace(UTIL, (whole, lead, px) => {
    const stop = SCALE[px];
    if (!stop) {
      unmapped.set(px, (unmapped.get(px) ?? 0) + 1);
      return whole;
    }
    hits++;
    return `${lead}text-${stop}`;
  });
  if (after !== before) {
    fs.writeFileSync(file, after);
    files++;
  }
}

console.log(`${hits} font sizes snapped onto the scale across ${files} files.`);
if (unmapped.size) {
  console.log("\nNo stop defined for (left as-is):");
  for (const [px, n] of [...unmapped].sort((a, b) => a[0] - b[0])) {
    console.log(`  ${px}px  x${n}`);
  }
}
