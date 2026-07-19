import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { renderCreature, occlusions, INK } from "../volume/render";
import { prototypeA } from "../volume/prototypes/a";
import { prototypeB } from "../volume/prototypes/b";
import { prototypeC } from "../volume/prototypes/c";
import type { Creature } from "../volume/types";

/**
 * Renders the three hand-designed prototypes and a page to compare them.
 *
 * Deliberately separate from the batch pipeline: this is not generation, it is
 * three drawings that were designed by hand to test whether the volume method
 * works at all. Nothing here is random and nothing here is published.
 */

const OUT = join("generated", "prototypes");

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function page(items: Array<{ creature: Creature; svg: string }>): string {
  const cards = items
    .map(({ creature, svg }) => {
      const occ = occlusions(creature);
      const facts: Array<[string, string]> = [
        ["parts", creature.parts.map((p) => `${p.id} (${p.character})`).join(", ")],
        ["front to back", [...creature.parts].sort((a, b) => b.depth - a.depth).map((p) => p.id).join(" → ")],
        ["overlaps", occ.map((o) => `${o.front} over ${o.behind} (${Math.round(o.fraction * 100)}%)`).join(", ") || "NONE — the parts do not meet"],
        [
          "relations",
          creature.parts
            .flatMap((p) => (p.relations ?? []).map((r) => `${p.id} ${r.is.replace(/-/g, " ")} ${r.to}`))
            .join(" · "),
        ],
        ["centre of gravity", creature.notes.centreOfGravity],
        ["movement", creature.notes.imaginedMovement],
        ["awkwardness", creature.notes.awkwardness],
        ["charm", creature.notes.charm],
        ["as an object", creature.notes.asObject],
      ];
      return `
  <article>
    <div class="stage">${svg}</div>
    <h2>${escape(creature.title)}</h2>
    <dl>${facts.map(([k, v]) => `<div><dt>${escape(k)}</dt><dd>${escape(v)}</dd></div>`).join("")}</dl>
  </article>`;
    })
    .join("\n");

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Volume prototypes</title>
<style>
  :root { --paper:#f4f0e7; --ink:#171817; --muted:#8e8a80; --stone:#d9d4c8; }
  body { margin:0; padding:48px 32px 96px; background:var(--paper); color:var(--ink);
         font:15px/1.6 ui-sans-serif, system-ui, -apple-system, sans-serif; }
  header { max-width:1500px; margin:0 auto 40px; }
  h1 { font-size:20px; font-weight:400; margin:0 0 6px; }
  .sub { color:var(--muted); font-size:13px; margin:0; }
  .controls { margin-top:20px; padding-top:18px; border-top:1px solid var(--stone);
              font-size:12px; text-transform:uppercase; letter-spacing:.12em; color:var(--muted);
              display:flex; gap:24px; align-items:center; }
  main { max-width:1500px; margin:0 auto; display:grid; gap:44px;
         grid-template-columns:repeat(auto-fit, minmax(420px, 1fr)); }
  article { display:flex; flex-direction:column; gap:14px; }
  .stage { aspect-ratio:1; background:#fff; border:1px solid var(--stone); padding:4%;
           display:flex; align-items:center; justify-content:center; }
  .stage svg { width:100%; height:100%; display:block; }
  h2 { font-size:15px; font-weight:500; margin:0; letter-spacing:.02em; }
  dl { margin:0; display:grid; grid-template-columns:auto 1fr; gap:6px 16px; font-size:12.5px; }
  dl > div { display:contents; }
  dt { color:var(--muted); text-transform:uppercase; letter-spacing:.09em; font-size:10px;
       padding-top:3px; white-space:nowrap; }
  dd { margin:0; }
  body.dark { --paper:#22252c; --ink:#f4f0e7; --stone:#444852; --muted:#9ca2b3; }
  body.dark .stage { background:#f4f0e7; }
  body.invert .stage svg path[fill="#1c1d1c"] { fill:#2f4f8a; }
</style></head>
<body>
<header>
  <h1>Volume prototypes</h1>
  <p class="sub">Three hand-designed bodies. No randomness, nothing published. Testing whether depth, occlusion and structural white lines hold up.</p>
  <div class="controls">
    <label><input type="checkbox" id="dark"> dark surround</label>
    <label><input type="checkbox" id="invert"> single colour swap</label>
  </div>
</header>
<main>
${cards}
</main>
<script>
  for (const id of ['dark','invert']) {
    document.getElementById(id).addEventListener('change', e =>
      document.body.classList.toggle(id, e.target.checked));
  }
</script>
</body></html>
`;
}

function main() {
  mkdirSync(OUT, { recursive: true });
  const creatures = [prototypeA, prototypeB, prototypeC];
  const items = creatures.map((creature) => {
    const svg = renderCreature(creature, { colors: INK });
    writeFileSync(join(OUT, `${creature.id}.svg`), svg, "utf8");
    return { creature, svg };
  });

  const path = join(OUT, "index.html");
  writeFileSync(path, page(items), "utf8");

  process.stdout.write(`\nThree prototypes written\n`);
  for (const { creature } of items) {
    const occ = occlusions(creature);
    process.stdout.write(
      `  ${creature.id}  ${creature.parts.length} parts, ${occ.length} real overlap(s)` +
      (occ.length < 2 ? "  ← needs at least 2\n" : "\n"),
    );
  }
  process.stdout.write(`\n  ${path}\n\nOpen it in a browser.\n\n`);
}

main();
