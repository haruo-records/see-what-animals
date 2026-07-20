import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { renderForm } from "../organic/iso";
import type { Form } from "../organic/types";
import { formA } from "../organic/forms/a";
import { formB } from "../organic/forms/b";
import { formC } from "../organic/forms/c";
import { formD } from "../organic/forms/d";
import { formE } from "../organic/forms/e";
import { formF } from "../organic/forms/f";

const OUT = join("generated", "organic");

/**
 * All six on one square. Each is rendered into its own cell and inlined, so the
 * sheet is one self-contained file with no text, no rules and no frames — the
 * descriptions live outside the artwork, never on it.
 */
function sheet(forms: Form[]): string {
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
      <div><dt>structure</dt><dd>${f.notes.structure}</dd></div>
      <div><dt>suggests</dt><dd>${f.notes.suggests}</dd></div>
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

function main() {
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

main();
