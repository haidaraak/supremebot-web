/* Retargets chart and status colours now that `accent` is the inverse ink.
 *
 * Problem: `accent` used to be crimson, so chart series, donut segments and
 * status keys read it directly. Now that `accent` is white-on-dark (black-on-
 * light), everything that used it became the same neutral — LayerSplit's two
 * segments became indistinguishable, and MethodMix lost its layer coding.
 *
 * The minimal fix is not to reintroduce hue. It is to differentiate by VALUE:
 * two shades of the same neutral ramp, ordered so foreground beats muted. And
 * for status, crimson is genuinely warranted — "running" is live activity,
 * which is exactly what --color-state exists for.
 *
 *   Layer 7 (foreground)  → var(--color-fg)
 *   Layer 4 (recessive)   → var(--color-fg-subtle)
 *   Chart series          → var(--color-fg) / var(--color-fg-subtle)
 *   Running / live status → var(--color-state)
 *   Settled status        → var(--color-fg-subtle)
 *
 * Run once: `node scripts/fix-viz-colors.js`
 */
const fs = require("fs");
const path = require("path");
const SRC = path.resolve(process.cwd(), "src");

const TARGETED = [
  ["src/components/dash/LayerSplit.tsx", [
    ['{ layer: 7, packets: l7, color: "var(--color-accent)"', '{ layer: 7, packets: l7, color: "var(--color-fg)"'],
    ['{ layer: 4, packets: l4, color: "var(--color-info)"', '{ layer: 4, packets: l4, color: "var(--color-fg-subtle)"'],
    ['stroke="var(--color-accent)"', 'stroke="var(--color-fg)"'],
    ['stroke="var(--color-info)"', 'stroke="var(--color-fg-subtle)"'],
  ]],
  ["src/components/dash/MethodMix.tsx", [
    ['"bg-gradient-to-r from-info to-accent"', '"bg-gradient-to-r from-fg-subtle to-fg"'],
    ['"bg-gradient-to-r from-accent-deep to-accent"', '"bg-gradient-to-r from-fg-subtle to-fg"'],
  ]],
  ["src/components/dash/VolumeChart.tsx", [
    ['stopColor="var(--color-accent)"', 'stopColor="var(--color-fg)"'],
    ['stopColor="var(--color-accent-deep)"', 'stopColor="var(--color-fg-subtle)"'],
  ]],
  ["src/components/dash/DurationTrend.tsx", [
    ['stopColor="var(--color-info)"', 'stopColor="var(--color-fg)"'],
    ['fill="var(--color-info)"', 'fill="var(--color-fg)"'],
    ['stroke="var(--color-info)"', 'stroke="var(--color-fg)"'],
  ]],
  // Running is live activity: crimson is warranted and meaningful here.
  ["src/components/dash/StatusBreakdown.tsx", [
    ['running: "var(--color-accent)"', 'running: "var(--color-state)"'],
  ]],
  ["src/components/dash/CountdownRing.tsx", [
    ['running: "var(--color-accent)"', 'running: "var(--color-state)"'],
    ['failed: "var(--color-accent-strong)"', 'failed: "var(--color-fg-subtle)"'],
    ['drop-shadow-[0_0_6px_rgba(var(--rgb-accent),0.55)]', ''],
  ]],
  ["src/components/dash/AttackTable.tsx", [
    ['finishing ? "var(--color-warn)" : "var(--color-accent)"', 'finishing ? "var(--color-fg-subtle)" : "var(--color-state)"'],
  ]],
  ["src/app/dashboard/launch/page.tsx", [
    ['bg-gradient-to-r from-accent-deep to-accent', 'bg-gradient-to-r from-fg-subtle to-fg'],
  ]],
  ["src/components/landing/Steps.tsx", [
    ['bg-gradient-to-r from-accent/40 to-transparent', 'bg-gradient-to-r from-line-strong to-transparent'],
  ]],
  // Dropdown should not carry a coloured ring.
  ["src/components/dash/MethodSelect.tsx", [
    ['ring-1 ring-[rgba(var(--rgb-accent),0.10)]', 'ring-1 ring-line'],
    ['bg-[rgba(var(--rgb-accent),0.12)]', 'bg-surface-2'],
  ]],
  ["src/components/dash/ReconToolsPanel.tsx", [
    ['border-accent/25 bg-[rgba(var(--rgb-accent),0.07)]', 'border-line bg-surface-2'],
  ]],
];

let files = 0, total = 0;
for (const [rel, pairs] of TARGETED) {
  const file = path.join(SRC, ...rel.replace(/^src\//, "").split("/"));
  if (!fs.existsSync(file)) { console.log(`  MISSING ${rel}`); continue; }
  const before = fs.readFileSync(file, "utf8");
  let out = before;
  for (const [from, to] of pairs) {
    if (out.includes(from)) {
      const n = out.split(from).length - 1;
      total += n;
      out = out.split(from).join(to);
    }
  }
  if (out !== before) { fs.writeFileSync(file, out); files++; console.log(`  ${rel}`); }
}
console.log(`\n${total} retargeted across ${files} files.`);
