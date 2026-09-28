/* Withdraws useTilt.
 *
 * Pointer-tracked card rotation is ornament: it demonstrates the machinery for
 * its own sake and distorts content as it moves. Minimalism drops it. The
 * `strip-ornament` pass already removed the `.tilt` class; this removes the
 * hook itself and its call sites, including the pointer handlers it returned.
 *
 * Run once: `node scripts/remove-tilt.js`
 */
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "..", "src");
const resolve = (p) => path.join(SRC, p);

const PATTERNS = [
  // import { useTilt } from "@/lib/useTilt";
  [/import\s*\{\s*useTilt\s*\}\s*from\s*"[^"]*";?\n?/g, "import line"],
  // const tilt = useTilt(4.5);
  // const { ref, onMove, onLeave } = useTilt(featured ? 7 : 5);
  [/const\s*\{[^}]*\}\s*=\s*useTilt\([^)]*\);?\n?/g, "hook call (destructured)"],
  [/const\s+\w+\s*=\s*useTilt\([^)]*\);?\n?/g, "hook call (single)"],
  // ref={ref} onPointerMove={onMove} onPointerLeave={onLeave}
  [/\s*ref=\{ref\}(?=\s)/g, "ref binding"],
  [/\s*onPointerMove=\{onMove\}/g, "pointer move binding"],
  [/\s*onPointerLeave=\{onLeave\}/g, "pointer leave binding"],
  [/\s*ref=\{tilt\.ref\}/g, "tilt ref binding"],
  [/\s*onPointerMove=\{tilt\.onMove\}/g, "tilt move binding"],
  [/\s*onPointerLeave=\{tilt\.onLeave\}/g, "tilt leave binding"],
  // transformStyle: "preserve-3d" only existed to host the tilted layers.
  [/\s*style=\{\{\s*transformStyle:\s*"preserve-3d"\s*(?:as const)?\s*\}\}/g, "preserve-3d style"],
];

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

let files = 0;
let total = 0;
const tally = Object.create(null);

for (const file of walk(SRC)) {
  const before = fs.readFileSync(file, "utf8");
  let out = before;

  for (const [re, label] of PATTERNS) {
    const hit = out.match(re);
    if (hit) {
      tally[label] = (tally[label] ?? 0) + hit.length;
      total += hit.length;
      out = out.replace(re, "");
    }
    re.lastIndex = 0;
  }

  // Tidy empty className/style attributes left behind.
  out = out
    .replace(/className=""/g, "")
    .replace(/style=\{\{\s*\}\}/g, "")
    .replace(/(?:^|\s)style=\{\{\s*\}\}/g, "")
    .replace(/\n{3,}/g, "\n\n");

  if (out !== before) {
    fs.writeFileSync(file, out);
    files++;
  }
}

// Delete the hook itself.
const hook = resolve("lib/useTilt.ts");
if (fs.existsSync(hook)) {
  fs.unlinkSync(hook);
  console.log("deleted src/lib/useTilt.ts");
}

for (const [k, n] of Object.entries(tally).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(3)}  ${k}`);
}
console.log(`\n${total} references removed across ${files} files.`);
