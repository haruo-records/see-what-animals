import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { BatchManifest, CandidateMetadata } from "../recipes/recipe-types";
import { parseArgs, bool, fail, CliError, type Args } from "./cli";

/**
 * THE GALLERY — a local file, opened from disk, never served.
 *
 * It lives inside generated/, which is gitignored and outside app/, so there is
 * no route that could expose it and nothing for Next.js to build. It is a plain
 * .html file: opening it is a double-click, not a dev server.
 *
 * The look follows the site rather than a dashboard — Paper, Ink, one hairline,
 * no cards, no blue. But this is a working tool, so contrast and scanability
 * come first where the two disagree.
 */

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const shortId = (id: string) => id.replace(/-\d+$/, "").replace(/^(body|appendage|pattern|arrangement|transformation|motion|palette)-/, "");

export function buildGalleryFor(batchDir: string, manifest: BatchManifest): string {
  const rows = manifest.candidates.map((entry) => {
    const metaPath = join(batchDir, entry.metadata);
    const meta: CandidateMetadata = JSON.parse(readFileSync(metaPath, "utf8"));
    const svg = readFileSync(join(batchDir, entry.svg), "utf8");
    return { entry, meta, svg };
  });

  const cells = rows
    .map(({ entry, meta, svg }) => {
      const facts: Array<[string, string]> = [
        ["body", shortId(meta.moduleLabels.body)],
        ["arrangement", shortId(meta.moduleLabels.arrangement)],
        ["appendage", meta.moduleLabels.appendages.map(shortId).join(", ") || "—"],
        ["pattern", meta.moduleLabels.patterns.map(shortId).join(", ") || "—"],
        ["transform", meta.moduleLabels.transformations.map(shortId).join(", ")],
        ["motion", meta.moduleLabels.motion ? shortId(meta.moduleLabels.motion) : "still"],
        ["palette", shortId(meta.moduleLabels.palette)],
        ["placements", String(meta.elementCount)],
        ["coverage", meta.coverage.toFixed(2)],
      ];

      const warnings = meta.issues.length
        ? `<p class="warn">${meta.issues.length} warning${meta.issues.length > 1 ? "s" : ""}: ${escape(
            meta.issues.map((i) => i.message).join(" · "),
          )}</p>`
        : "";

      return `
    <article class="cell" data-id="${escape(meta.candidateId)}">
      <div class="stage">${svg}</div>
      <div class="meta">
        <p class="num">${String(meta.candidateNumber).padStart(3, "0")}</p>
        <p class="constraint">${escape(meta.constraint.replace(/-/g, " "))}</p>
        <dl>${facts
          .map(([k, v]) => `<div><dt>${k}</dt><dd>${escape(v)}</dd></div>`)
          .join("")}</dl>
        ${warnings}
        <p class="links">
          <a href="./${escape(entry.recipe)}">recipe.json</a>
          <a href="./${escape(entry.svg)}">svg</a>
        </p>
        <p class="adopt">npm run generator:register -- --batch ${escape(manifest.batchId)} --candidate ${escape(
          meta.candidateId,
        )} --publish-date YYYY-MM-DD</p>
      </div>
    </article>`;
    })
    .join("\n");

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${escape(manifest.batchId)} — candidates</title>
<style>
  :root {
    --paper: #f4f0e7; --ink: #171817; --muted: #8e8a80;
    --stone: #d9d4c8; --canvas: #fcfaf6;
    --size: 300px;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 48px 32px 96px;
    background: var(--paper); color: var(--ink);
    font: 15px/1.5 ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", sans-serif;
  }
  header { max-width: 1400px; margin: 0 auto 40px; }
  h1 { font-size: 20px; font-weight: 400; margin: 0 0 6px; letter-spacing: .01em; }
  .sub { color: var(--muted); font-size: 13px; margin: 0; }
  .controls {
    display: flex; gap: 24px; flex-wrap: wrap; align-items: center;
    margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--stone);
    font-size: 12px; text-transform: uppercase; letter-spacing: .12em; color: var(--muted);
  }
  .controls label { display: flex; gap: 8px; align-items: center; cursor: pointer; }
  .grid {
    max-width: 1400px; margin: 0 auto;
    display: grid; gap: 40px 32px;
    grid-template-columns: repeat(auto-fill, minmax(var(--size), 1fr));
  }
  .cell { display: flex; flex-direction: column; gap: 14px; }
  .stage {
    aspect-ratio: 1; background: var(--canvas);
    border: 1px solid var(--stone); padding: 8%;
    display: flex; align-items: center; justify-content: center;
    cursor: zoom-in;
  }
  .stage svg { width: 100%; height: 100%; display: block; }
  .num { font-size: 12px; letter-spacing: .18em; color: var(--muted); margin: 0 0 2px; }
  .constraint { margin: 0 0 10px; font-size: 14px; }
  dl { margin: 0; display: grid; grid-template-columns: auto 1fr; gap: 2px 14px; font-size: 12px; }
  dl > div { display: contents; }
  dt { color: var(--muted); text-transform: uppercase; letter-spacing: .1em; font-size: 10px; padding-top: 2px; }
  dd { margin: 0; }
  .warn { font-size: 12px; color: #8a6d3b; margin: 10px 0 0; }
  .links { margin: 10px 0 0; display: flex; gap: 14px; font-size: 12px; }
  .links a { color: var(--muted); }
  .adopt {
    margin: 8px 0 0; font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 10px; color: var(--muted); word-break: break-all; user-select: all;
  }
  body.dark { --paper: #2b2e37; --ink: #f4f0e7; --canvas: #22252c; --stone: #444852; --muted: #9ca2b3; }
  body.plain .stage { background: #ffffff; }
  body.still svg animateTransform { display: none; }
  body.small { --size: 200px; }
  body.large { --size: 460px; }
  /* One candidate, filling the screen. */
  .zoom { position: fixed; inset: 0; background: var(--paper); z-index: 10;
          display: none; align-items: center; justify-content: center; padding: 5vh; cursor: zoom-out; }
  .zoom.open { display: flex; }
  .zoom svg { max-width: 90vw; max-height: 90vh; }
</style>
</head>
<body class="">
<header>
  <h1>${escape(manifest.batchId)}</h1>
  <p class="sub">
    ${manifest.candidateCount} candidates · seed <code>${escape(manifest.seed)}</code> ·
    generator ${escape(manifest.generatorVersion)} · rules ${escape(manifest.ruleSetVersion)} ·
    ${manifest.complete ? "complete" : "INCOMPLETE"}
  </p>
  <p class="sub">Local review only. Nothing here is published. Adoption is a separate command.</p>
  <div class="controls">
    <label><input type="checkbox" id="still"> freeze motion</label>
    <label><input type="checkbox" id="dark"> dark</label>
    <label><input type="checkbox" id="plain"> white ground</label>
    <label>size
      <select id="size">
        <option value="small">small</option>
        <option value="" selected>medium</option>
        <option value="large">large</option>
      </select>
    </label>
  </div>
</header>

<main class="grid">
${cells}
</main>

<div class="zoom" id="zoom"></div>

<script>
  var body = document.body;
  function toggle(id, cls) {
    document.getElementById(id).addEventListener('change', function (e) {
      body.classList.toggle(cls, e.target.checked);
    });
  }
  toggle('still', 'still');
  toggle('dark', 'dark');
  toggle('plain', 'plain');

  var sizeClasses = ['small', 'large'];
  document.getElementById('size').addEventListener('change', function (e) {
    sizeClasses.forEach(function (c) { body.classList.remove(c); });
    if (e.target.value) body.classList.add(e.target.value);
  });

  var zoom = document.getElementById('zoom');
  document.querySelectorAll('.stage').forEach(function (stage) {
    stage.addEventListener('click', function () {
      zoom.innerHTML = stage.innerHTML;
      zoom.classList.add('open');
    });
  });
  zoom.addEventListener('click', function () { zoom.classList.remove('open'); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') zoom.classList.remove('open');
  });
</script>
</body>
</html>
`;

  const path = join(batchDir, "index.html");
  writeFileSync(path, html, "utf8");
  return path;
}

// ── CLI entry: rebuild the gallery for an existing batch ────────────────────

const KNOWN = ["batch", "output", "help"];

const HELP = `
generator:preview — rebuild the comparison gallery for a batch

  npm run generator:preview
  npm run generator:preview -- --batch weekly-2026-07-20

  --batch <id>    which batch (default: the most recent)
  --output <dir>  where batches live (default generated/batches)
`;

function main(args: Args) {
  if (bool(args, "help")) {
    process.stdout.write(HELP);
    return;
  }
  const root = typeof args.flags.output === "string" ? args.flags.output : join("generated", "batches");
  if (!existsSync(root)) throw new CliError(`No batches found at ${root}. Run generator:generate first.`);

  let batch = typeof args.flags.batch === "string" ? args.flags.batch : "";
  if (!batch) {
    const dirs = readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory());
    if (dirs.length === 0) throw new CliError(`No batches found in ${root}.`);
    batch = dirs.map((d) => d.name).sort().reverse()[0];
  }

  const dir = join(root, batch);
  const manifestPath = join(dir, "manifest.json");
  if (!existsSync(manifestPath)) throw new CliError(`No manifest at ${manifestPath}.`);

  const manifest: BatchManifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const path = buildGalleryFor(dir, manifest);
  process.stdout.write(`\nGallery rebuilt\n  ${path}\n\nOpen it in a browser.\n\n`);
}

if (process.argv[1] && process.argv[1].includes("build-gallery")) {
  try {
    main(parseArgs(process.argv.slice(2), KNOWN));
  } catch (err) {
    fail(err);
  }
}
