import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { allModules, registryStats } from "../registry/module-registry";
import { checkRegistryIntegrity } from "../rules/compatibility";
import { validateRecipe } from "../recipes/validate-recipe";
import { renderRecipe } from "../render/render-svg";
import type { BatchManifest, ValidationIssue } from "../recipes/recipe-types";
import { parseArgs, bool, fail, type Args } from "./cli";

/**
 * generator:validate — everything that can be checked without a browser.
 *
 * Errors block; warnings are reported and do not. The distinction matters: a
 * version drift between a recipe and the registry is worth knowing about but
 * should not stop the author reviewing last week's batch.
 */

const KNOWN = ["batch", "output", "json", "help"];

const HELP = `
generator:validate — check the module registry, recipes and site data

  npm run generator:validate
  npm run generator:validate -- --batch weekly-2026-07-20
  npm run generator:validate -- --json

  --batch <id>    also validate a specific batch (default: all batches found)
  --output <dir>  where batches live (default generated/batches)
  --json          machine-readable result
`;

/** The three questions are fixed. This is checked in code, not left to memory. */
const REQUIRED_QUESTIONS: Array<{ id: string; text: string }> = [
  { id: "q-see", text: "What do you see?" },
  { id: "q-stands", text: "What stands out?" },
  { id: "q-name", text: "What do you call it?" },
];

/**
 * A wording that was considered for the second question and rejected. It must
 * not reappear anywhere: once two phrasings are in circulation, responses
 * collected under each stop being comparable.
 */
const RETIRED_SECOND_QUESTION = ["what", "do", "you", "notice", "most"].join(" ");

function checkQuestionSpec(issues: ValidationIssue[]) {
  const path = "data/questions.ts";
  if (!existsSync(path)) {
    issues.push({ level: "error", code: "questions-missing", message: `${path} not found` });
    return;
  }
  const source = readFileSync(path, "utf8");

  for (const q of REQUIRED_QUESTIONS) {
    if (!source.includes(`id: "${q.id}"`)) {
      issues.push({ level: "error", code: "question-missing", message: `${path}: question "${q.id}" is absent` });
    }
    if (!source.includes(`question: "${q.text}"`)) {
      issues.push({
        level: "error",
        code: "question-wording",
        message: `${path}: expected the wording "${q.text}" for ${q.id}`,
      });
    }
  }

  const roots = ["app", "components", "data", "lib", "locales", "generator", "types", ".claude"];
  for (const root of roots) {
    if (!existsSync(root)) continue;
    for (const file of walk(root)) {
      if (!/\.(ts|tsx|md|json|html)$/.test(file)) continue;
      const text = readFileSync(file, "utf8");
      // Assembled from fragments above so this file does not trip its own check.
      if (text.toLowerCase().includes(RETIRED_SECOND_QUESTION)) {
        issues.push({
          level: "error",
          code: "retired-question-wording",
          message: `${file} still contains the retired wording for the second question`,
        });
      }
    }
  }
}

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next" || entry.name === "generated") continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

/** Site-side checks: no duplicate work ids, publish dates well formed. */
/**
 * ORPHANED MODULE FILES.
 *
 * Every file under modules/ must be imported by the registry. A file that is
 * not is dead code, and dead code here is worse than useless: it is still
 * type-checked, so a module left behind from a retired form language breaks the
 * production build without ever affecting a single pixel of output.
 *
 * That is exactly how this check came to exist. Unpacking a release over an
 * older one leaves the previous version's modules on disk — unzipping adds and
 * replaces, it never deletes — and thirty-nine files from three retired
 * languages accumulated silently until `next build` failed on the first of them
 * alphabetically. Nothing was watching for files that had stopped mattering.
 */
function checkOrphanedModules(issues: ValidationIssue[]) {
  const registryPath = "generator/registry/module-registry.ts";
  if (!existsSync(registryPath) || !existsSync("generator/modules")) return;

  const registry = readFileSync(registryPath, "utf8");
  const imported = new Set(
    [...registry.matchAll(/from "\.\.\/modules\/([^"]+)"/g)].map((m) => m[1]),
  );

  for (const file of walk("generator/modules")) {
    if (!file.endsWith(".ts")) continue;
    const rel = file.replace(/^generator[/\\]modules[/\\]/, "").replace(/\.ts$/, "").replace(/\\/g, "/");
    if (imported.has(rel)) continue;
    issues.push({
      level: "error",
      code: "orphaned-module",
      message:
        `${file} is not imported by the registry. It is dead code that still breaks the build. ` +
        `Delete it, or add it to ${registryPath}.`,
    });
  }
}

function checkSiteData(issues: ValidationIssue[]) {
  for (const [path, pattern, label] of [
    ["data/animal-references.ts", /id:\s*"([^"]+)"/g, "animal"],
    ["data/observation-sessions.ts", /id:\s*"(observation-[^"]+)"/g, "session"],
  ] as const) {
    if (!existsSync(path)) continue;
    const source = readFileSync(path, "utf8");
    const seen = new Set<string>();
    for (const match of source.matchAll(pattern)) {
      const id = match[1];
      if (seen.has(id)) {
        issues.push({ level: "error", code: "duplicate-work-id", message: `${path}: ${label} id "${id}" appears more than once` });
      }
      seen.add(id);
    }
  }

  const sessionsPath = "data/observation-sessions.ts";
  if (existsSync(sessionsPath)) {
    const source = readFileSync(sessionsPath, "utf8");
    for (const match of source.matchAll(/startsAt:\s*"([^"]+)"/g)) {
      if (Number.isNaN(new Date(match[1]).getTime())) {
        issues.push({ level: "error", code: "bad-publish-date", message: `${sessionsPath}: "${match[1]}" is not a valid date` });
      }
    }
    if (!existsSync("lib/observation/publish.ts")) {
      issues.push({
        level: "error",
        code: "publish-gate-missing",
        message: "lib/observation/publish.ts is missing — nothing is stopping future works from being listed publicly",
      });
    }
  }
}

function validateBatch(dir: string, issues: ValidationIssue[]) {
  const manifestPath = join(dir, "manifest.json");
  if (!existsSync(manifestPath)) {
    issues.push({ level: "warning", code: "no-manifest", message: `${dir} has no manifest.json` });
    return;
  }

  let manifest: BatchManifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  } catch {
    issues.push({ level: "error", code: "bad-manifest", message: `${manifestPath} is not valid JSON` });
    return;
  }

  const seenIds = new Set<string>();
  for (const entry of manifest.candidates) {
    if (seenIds.has(entry.candidateId)) {
      issues.push({ level: "error", code: "duplicate-candidate-id", message: `${manifest.batchId}: ${entry.candidateId} listed twice` });
    }
    seenIds.add(entry.candidateId);

    for (const rel of [entry.svg, entry.recipe, entry.metadata]) {
      if (!existsSync(join(dir, rel))) {
        issues.push({ level: "error", code: "missing-output", message: `${manifest.batchId}/${rel} is missing` });
      }
    }

    const recipePath = join(dir, entry.recipe);
    if (!existsSync(recipePath)) continue;

    let recipe: unknown;
    try {
      recipe = JSON.parse(readFileSync(recipePath, "utf8"));
    } catch {
      issues.push({ level: "error", code: "bad-recipe-json", message: `${recipePath} is not valid JSON` });
      continue;
    }

    for (const issue of validateRecipe(recipe)) {
      issues.push({ ...issue, candidateId: entry.candidateId, message: `${manifest.batchId}/${entry.candidateId}: ${issue.message}` });
    }

    try {
      renderRecipe(recipe as never);
    } catch (err) {
      issues.push({
        level: "error",
        code: "render-failure",
        candidateId: entry.candidateId,
        message: `${manifest.batchId}/${entry.candidateId} cannot be rendered: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }
}

function main(args: Args) {
  if (bool(args, "help")) {
    process.stdout.write(HELP);
    return;
  }

  const issues: ValidationIssue[] = [];
  issues.push(...checkRegistryIntegrity());
  checkOrphanedModules(issues);
  checkQuestionSpec(issues);
  checkSiteData(issues);

  const root = typeof args.flags.output === "string" ? args.flags.output : join("generated", "batches");
  if (existsSync(root)) {
    const only = typeof args.flags.batch === "string" ? args.flags.batch : null;
    for (const entry of readdirSync(root)) {
      const dir = join(root, entry);
      if (!statSync(dir).isDirectory()) continue;
      if (only && entry !== only) continue;
      validateBatch(dir, issues);
    }
  }

  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warning");
  const stats = registryStats();

  if (bool(args, "json")) {
    process.stdout.write(JSON.stringify({ ok: errors.length === 0, stats, errors, warnings }, null, 2) + "\n");
    if (errors.length > 0) process.exitCode = 1;
    return;
  }

  process.stdout.write(
    `\nModules   ${stats.enabled} enabled of ${allModules.length}` +
      `\n          body ${stats.byCategory.body} · appendage ${stats.byCategory.appendage} · pattern ${stats.byCategory.pattern}` +
      ` · arrangement ${stats.byCategory.arrangement} · transformation ${stats.byCategory.transformation}` +
      ` · motion ${stats.byCategory.motion} · palette ${stats.byCategory.palette}\n\n`,
  );

  if (warnings.length > 0) {
    process.stdout.write(`Warnings (${warnings.length})\n`);
    for (const w of warnings.slice(0, 25)) process.stdout.write(`  · ${w.message}\n`);
    if (warnings.length > 25) process.stdout.write(`  … and ${warnings.length - 25} more\n`);
    process.stdout.write("\n");
  }

  if (errors.length > 0) {
    process.stderr.write(`Errors (${errors.length})\n`);
    for (const e of errors) process.stderr.write(`  ✗ ${e.message}\n`);
    process.stderr.write("\n");
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`No errors.\n\n`);
}

try {
  main(parseArgs(process.argv.slice(2), KNOWN));
} catch (err) {
  fail(err);
}
