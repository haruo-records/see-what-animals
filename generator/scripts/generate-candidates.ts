import { join } from "node:path";
import { buildBatch, writeBatch, assertSafeSegment } from "../render/build-batch";
import { buildGalleryFor } from "./build-gallery";
import { parseArgs, optionalInt, bool, fail, CliError, type Args } from "./cli";
import { registryStats } from "../registry/module-registry";

/**
 * generator:generate — LOCAL EXPLORATION.
 *
 * Writes candidates to disk for the author to look at. It never touches the
 * site's work data and never publishes anything: adopting a candidate is a
 * separate, deliberate command (generator:register).
 */

const KNOWN = ["count", "seed", "output", "preset", "static", "force", "json", "help"];

const HELP = `
generator:generate — build candidates for review

  npm run generator:generate
  npm run generator:generate -- --count 12
  npm run generator:generate -- --count 12 --seed weekly-2026-07-20
  npm run generator:generate -- --seed weekly-2026-07-20 --static --force

  --count <n>     how many candidates (1–60, default 12)
  --seed <text>   the seed. Same seed + same versions = same candidates.
                  Omit it and one is generated and printed for you.
  --output <dir>  where to write (default generated/batches)
  --preset <name> a preset from generator/presets
  --static        no motion, for comparing forms without animation
  --force         replace an existing batch of the same name
  --json          machine-readable result, for scripts and the Claude Skill
`;

function autoSeed(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  // Minute resolution: two runs in the same minute collide, which is a useful
  // reminder to name a seed rather than an accident that silently overwrites.
  const time = now.toISOString().slice(11, 16).replace(":", "");
  return `local-${date}-${time}`;
}

async function main(args: Args) {
  if (bool(args, "help")) {
    process.stdout.write(HELP);
    return;
  }

  const count = optionalInt(args, "count", 12, 1, 60);
  const seedFlag = args.flags.seed;
  if (seedFlag === true) throw new CliError("--seed needs a value, for example --seed weekly-2026-07-20");

  const seed = typeof seedFlag === "string" ? seedFlag : autoSeed();
  const generated = typeof seedFlag !== "string";
  const batchId = assertSafeSegment(seed, "Seed");

  const outputRoot =
    typeof args.flags.output === "string" ? args.flags.output : join("generated", "batches");

  const stats = registryStats();
  process.stdout.write(
    `\nGenerating ${count} candidates` +
      `\n  seed         ${seed}${generated ? "  (generated — pass --seed to repeat this run)" : ""}` +
      `\n  modules      ${stats.enabled} enabled of ${stats.total}` +
      `\n  motion       ${bool(args, "static") ? "off (--static)" : "on"}\n\n`,
  );

  const result = buildBatch({ batchId, seed, count, static: bool(args, "static") });
  const { dir, manifest, manifestPath } = writeBatch(result, outputRoot, { force: bool(args, "force") });
  const galleryPath = buildGalleryFor(dir, manifest);

  if (bool(args, "json")) {
    process.stdout.write(
      JSON.stringify(
        {
          ok: result.complete,
          batchId,
          seed,
          requested: count,
          generated: result.candidates.length,
          attempts: result.attempts,
          directory: dir,
          manifest: manifestPath,
          gallery: galleryPath,
          errors: result.errors,
          warnings: result.warnings,
        },
        null,
        2,
      ) + "\n",
    );
    if (!result.complete) process.exitCode = 1;
    return;
  }

  process.stdout.write(`${result.spread}\n\n`);
  process.stdout.write(
    `${result.candidates.length}/${count} candidates written in ${result.attempts} attempts\n` +
      `  batch     ${dir}\n` +
      `  manifest  ${manifestPath}\n` +
      `  gallery   ${galleryPath}\n\n`,
  );

  if (result.warnings.length > 0) {
    process.stdout.write(`${result.warnings.length} warning(s):\n`);
    for (const w of result.warnings.slice(0, 10)) {
      process.stdout.write(`  · ${w.candidateId ?? ""} ${w.message}\n`);
    }
    process.stdout.write("\n");
  }

  if (result.errors.length > 0) {
    process.stderr.write(`${result.errors.length} candidate(s) could not be generated:\n`);
    for (const e of result.errors) process.stderr.write(`  ✗ ${e.message}\n`);
    process.stderr.write(
      `\nThe batch is marked incomplete. What did generate is kept and can be reviewed.\n\n`,
    );
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`Open the gallery in a browser to compare them.\nNothing has been published.\n\n`);
}

main(parseArgs(process.argv.slice(2), KNOWN)).catch(fail);
