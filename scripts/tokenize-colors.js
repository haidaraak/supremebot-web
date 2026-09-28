/* Migrates the hand-written arbitrary token utilities to real Tailwind utilities.
 *
 * Why this exists: the palette was defined in :root / [data-theme] but never
 * registered with Tailwind v4, so every colour reference had to be spelled
 * `bg-[--color-surface]`. Those still work, but they bypass the type system —
 * a typo compiles to nothing, and no editor can autocomplete them. globals.css
 * now registers the tokens with `@theme inline`, which makes `bg-surface`
 * resolve to `var(--color-surface)` and follow the theme swap.
 *
 * `<prefix>-[--color-<name>]`  ->  `<prefix>-<name>`
 *
 * Only the bare `[--color-*]` form is rewritten. Deliberately left alone:
 *   - `rgba(var(--rgb-accent),0.12)` and friends — alpha variants, legitimately
 *     arbitrary, and now backed by a complete set of --rgb-* channels.
 *   - `bg-[var(--color-glass)]` — explicit var() form, already unambiguous.
 *   - `shadow-[...]`, `ease-[var(--ease-out-quint)]` — non-colour namespaces.
 *
 * Run once: `node scripts/tokenize-colors.js`
 */
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "..", "src");

// `text-`, `bg-`, `border-`, `divide-`, `ring-`, `from-`, `via-`, `to-`, `fill-`,
// `stroke-`, `outline-`, `shadow-`, `decoration-`, `accent-`, `caret-`.
// The prefix is captured so variants like `hover:bg-[--color-x]` keep theirs.
const UTIL = /(^|[^a-zA-Z0-9-])([a-z]+)-\[--color-([a-z0-9-]+)\]/g;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

let files = 0;
let hits = 0;
const perFile = [];

for (const file of walk(SRC)) {
  const before = fs.readFileSync(file, "utf8");
  const after = before.replace(UTIL, (_m, lead, prefix, name) => {
    hits++;
    return `${lead}${prefix}-${name}`;
  });
  if (after !== before) {
    fs.writeFileSync(file, after);
    files++;
    perFile.push([path.relative(path.join(__dirname, ".."), file), (before.match(UTIL) || []).length]);
  }
}

perFile.sort((a, b) => b[1] - a[1]);
for (const [f, n] of perFile) console.log(`  ${String(n).padStart(4)}  ${f}`);
console.log(`\n${hits} utilities rewritten across ${files} files.`);
