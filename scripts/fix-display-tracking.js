/* Removes redundant letter-spacing on display headings.
 *
 * `.font-display` in globals.css already sets `letter-spacing: -0.03em`. Every
 * heading *also* carried its own `tracking-[-0.03em]` / `[-0.035em]` /
 * `[-0.04em]`. Both are `@layer utilities` at equal specificity, so which one
 * won depended on stylesheet source order — a value an author cannot reason
 * about, and one that silently changes between builds.
 *
 * Where an element has `font-display`, the scale token's tracking is the single
 * source. Headings without `font-display` are left alone.
 *
 * Run once: `node scripts/fix-display-tracking.js`
 */
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "..", "src");

// `tracking-[...]`, `tracking-tight`, `tracking-tighter`, `tracking-normal`.
const TRACKING = /(?<![-\w])tracking-(?:\[[^\]]*\]|tight(?:er)?|normal)(?![-\w])/g;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

/** A className string is only edited when `font-display` appears in it. */
const CLASSNAME = /className=(?:"([^"]*)"|\{cn\(([\s\S]*?)\)\})/g;

let hits = 0;
let files = 0;

for (const file of walk(SRC)) {
  const before = fs.readFileSync(file, "utf8");
  let changed = false;

  const after = before.replace(CLASSNAME, (whole, quoted, cnBody) => {
    const body = quoted ?? cnBody;
    if (!body.includes("font-display")) return whole;
    if (!TRACKING.test(body)) {
      TRACKING.lastIndex = 0;
      return whole;
    }
    TRACKING.lastIndex = 0;
    const hitsHere = body.match(TRACKING);
    if (!hitsHere) return whole;
    hits += hitsHere.length;
    changed = true;
    const cleaned = body.replace(TRACKING, "").replace(/\s{2,}/g, " ").trim();
    return quoted !== undefined
      ? `className="${cleaned}"`
      : whole.replace(cnBody, cleaned);
  });

  if (changed && after !== before) {
    fs.writeFileSync(file, after);
    files++;
  }
}

console.log(`${hits} redundant tracking utilities removed across ${files} files.`);
