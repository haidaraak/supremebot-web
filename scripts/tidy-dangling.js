/* Tidies class strings left malformed by the ornament strip.
 *
 * Removing `hover:shadow-[...]` can leave a bare `hover:` with no value, and
 * the various removals can leave doubled spaces. Both are harmless to render
 * but wrong to read.
 *
 * Run once: `node scripts/tidy-dangling.js`
 */
const fs = require("fs");
const path = require("path");
const SRC = path.join(__dirname, "..", "src");

// A variant prefix with nothing following it.
const DANGLING = /(hover|focus-visible|focus|group-hover)(?=\s|")/g;
// Utility that lost its value, e.g. `bg-surface-` from a split `bg-surface-hover`.
const TRUNCATED = /(?:^|\s)(?:bg|text|border)-[a-z0-9-]+-(?=\s|")/g;

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(e.name)) out.push(full);
  }
  return out;
}

let files = 0, total = 0;
for (const file of walk(SRC)) {
  const before = fs.readFileSync(file, "utf8");
  let out = before;

  out = out.replace(/className="([^"\n]*)"/g, (m, cls) => {
    let next = cls.replace(/\s{2,}/g, " ").trim();
    let hits = next.match(DANGLING);
    if (hits) { total += hits.length; next = next.replace(DANGLING, ""); }
    hits = next.match(TRUNCATED);
    if (hits) { total += hits.length; next = next.replace(TRUNCATED, ""); }
    next = next.replace(/\s{2,}/g, " ").trim();
    return `className="${next}"`;
  });

  if (out !== before) { fs.writeFileSync(file, out); files++; }
}
console.log(`${total} artifacts cleaned across ${files} files.`);
