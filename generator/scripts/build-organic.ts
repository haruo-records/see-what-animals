import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs, optionalInt, bool, fail, CliError } from "./cli";
import { createBatch } from "../organic/random/create";
import { renderForm } from "../organic/iso";
import type { Form } from "../organic/types";
import { formA } from "../organic/forms/a";
import { formB } from "../organic/forms/b";
import { formC } from "../organic/forms/c";
import { formD } from "../organic/forms/d";
import { formE } from "../organic/forms/e";
import { formF } from "../organic/forms/f";

const OUT = join("generated", "organic");

const KNOWN = ["seed", "count", "force", "help"];

const HELP = `
generator:organic — the six approved forms, or a batch of new ones

  npm run generator:organic
      Rebuilds the six fixed, hand-designed forms. Same output every time.

  npm run generator:organic -- --seed 2026-07-20 --count 12
      Generates a new batch into generated/organic/<seed>/.
      The same seed always gives the same batch.

  --seed <text>   name the run. Required for generation.
  --count <n>     how many, 1-24. Default 12.
  --force         overwrite an existing batch of that name.
`;

/**
 * All six on one square. Each is rendered into its own cell and inlined, so the
 * sheet is one self-contained file with no text, no rules and no frames — the
 * descriptions live outside the artwork, never on it.
 */
function sheet(forms: Form[]): string {
  // The sheet is a fixed 2x3. A longer batch is shown in the gallery instead.
  const size = 1024;
  const cellW = size / 3;
  const cellH = size / 2;
  const cell = Math.min(cellW, cellH);

  const cells = forms
    .map((f, i) => {
      const inner = renderForm(f, { size: cell, margin: 0.06 })
        .split("\n")
        .filter((l) => !l.startsWith("<svg") && !l.startsWith("</svg") && !l.includes("<rect"))
        .join("\n");
      const x = (i % 3) * cellW + (cellW - cell) / 2;
      const y = Math.floor(i / 3) * cellH + (cellH - cell) / 2;
      return `  <g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">\n${inner}\n  </g>`;
    })
    .join("\n");

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">`,
    `  <rect width="${size}" height="${size}" fill="#FFFFFF"/>`,
    cells,
    `</svg>`,
    "",
  ].join("\n");
}

function page(forms: Form[]): string {
  const cards = forms
    .map(
      (f) => `
  <article>
    <div class="stage"><img src="${f.id}.svg" alt=""></div>
    <h2>${f.title}</h2>
    <dl>
      <div><dt>way of living</dt><dd>${f.notes.suggests}</dd></div>
      <div><dt>structure</dt><dd>${f.notes.structure}</dd></div>
      <div><dt>balance</dt><dd>${f.notes.balance}</dd></div>
      <div><dt>masses</dt><dd>${f.nodes.length}</dd></div>
    </dl>
  </article>`,
    )
    .join("\n");

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex, nofollow">
<title>Organic forms</title>
<style>
 body{margin:0;padding:48px 32px 96px;background:#fafafa;color:#191919;
      font:15px/1.6 ui-sans-serif,system-ui,-apple-system,sans-serif}
 header{max-width:1500px;margin:0 auto 40px}
 h1{font-size:20px;font-weight:400;margin:0 0 6px}
 .sub{color:#8a8a8a;font-size:13px;margin:0}
 main{max-width:1500px;margin:0 auto;display:grid;gap:44px;
      grid-template-columns:repeat(auto-fit,minmax(380px,1fr))}
 article{display:flex;flex-direction:column;gap:14px}
 .stage{aspect-ratio:1;background:#fff;border:1px solid #e6e6e6}
 .stage img{width:100%;height:100%;display:block}
 h2{font-size:15px;font-weight:500;margin:0}
 dl{margin:0;display:grid;grid-template-columns:auto 1fr;gap:6px 16px;font-size:12.5px}
 dl>div{display:contents}
 dt{color:#8a8a8a;text-transform:uppercase;letter-spacing:.09em;font-size:10px;
    padding-top:3px;white-space:nowrap}
 dd{margin:0}
</style></head>
<body>
<header>
  <h1>Six forms, purpose unknown</h1>
  <p class="sub">Blocks were the scaffolding and have been taken away. Continuous masses, isometric, floating, no shadows, no contact. Two colours each, the pale one light grey.</p>
</header>
<main>
${cards}
</main>
</body></html>
`;
}

/**
 * A generated batch goes in its own directory named for its seed, so runs
 * accumulate instead of overwriting each other. Losing yesterday's batch to
 * today's is the one mistake that cannot be undone by re-running anything.
 */
function generate(seed: string, count: number, force: boolean) {
  const dir = join(OUT, seed);
  if (existsSync(dir) && !force) {
    throw new CliError(
      `generated/organic/${seed} already exists. Nothing was overwritten.\n` +
        `  Pass --force to replace it, or choose a different --seed.`,
    );
  }
  mkdirSync(dir, { recursive: true });

  const batch = createBatch(seed, count);
  const forms = batch.candidates.map((c) => c.form);

  for (const f of forms) {
    writeFileSync(join(dir, `${f.id}.svg`), renderForm(f, { size: 1024 }), "utf8");
  }
  writeFileSync(join(dir, "sheet-1024.svg"), sheet(forms.slice(0, 6)), "utf8");
  writeFileSync(join(dir, "index.html"), page(forms), "utf8");

  process.stdout.write(`\nBatch ${seed} — ${forms.length} individuals, ${forms.length} structures\n\n`);
  for (const c of batch.candidates) {
    process.stdout.write(
      `  ${c.form.id}  ${c.archetype.padEnd(11)} ${c.register.padEnd(6)} ${c.form.scheme.padEnd(8)}\n` +
        `             ${c.dna.purpose}\n` +
        `             ${c.dna.support} · ${c.dna.symmetry} · ${c.dna.weighting} · ${c.dna.density}\n`,
    );
  }
  const grown = batch.candidates.filter((c) => c.register === "grown").length;
  const purposes = new Set(batch.candidates.map((c) => c.dna.purpose)).size;
  const structures = new Set(batch.candidates.map((c) => c.archetype)).size;
  process.stdout.write(
    `  grown ${grown} / built ${batch.candidates.length - grown}` +
      `   ${structures} distinct structures   ${purposes} distinct purposes` +
      `   ${batch.rejected} rejected\n`,
  );
  process.stdout.write(`\n  ${join(dir, "index.html")}\n\n`);
}

function fixed() {
  mkdirSync(OUT, { recursive: true });
  const forms: Form[] = [formA, formB, formC, formD, formE, formF];
  for (const f of forms) {
    writeFileSync(join(OUT, `${f.id}.svg`), renderForm(f, { size: 1024 }), "utf8");
    process.stdout.write(`  ${f.id}  ${f.nodes.length} masses, ${f.links.length} runs\n`);
  }
  writeFileSync(join(OUT, "sheet-1024.svg"), sheet(forms), "utf8");
  writeFileSync(join(OUT, "index.html"), page(forms), "utf8");
  process.stdout.write(`\n  ${join(OUT, "sheet-1024.svg")}\n  ${join(OUT, "index.html")}\n\n`);
}

function main() {
  const args = parseArgs(process.argv.slice(2), KNOWN);
  if (bool(args, "help")) {
    process.stdout.write(HELP);
    return;
  }

  const seedFlag = args.flags.seed;
  if (seedFlag === true) throw new CliError("--seed needs a value, for example --seed 2026-07-20");

  if (typeof seedFlag === "string") {
    generate(seedFlag, optionalInt(args, "count", 12, 1, 24), bool(args, "force"));
    return;
  }

  if (args.flags.count || args.flags.force) {
    throw new CliError("--count and --force only apply to a generated batch. Pass --seed as well.");
  }

  fixed();
}

try {
  main();
} catch (err) {
  fail(err);
}
