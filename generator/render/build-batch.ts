import { mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { createRecipe, GenerationError } from "../recipes/create-recipe";
import { renderRecipe } from "../render/render-svg";
import { validateRecipe, hasErrors } from "../recipes/validate-recipe";
import { RULES } from "../rules/compatibility";
import {
  createBatchMemory,
  checkDiversity,
  describeSpread,
  remember,
} from "../rules/diversity-rules";
import {
  GENERATOR_VERSION,
  RULE_SET_VERSION,
  SCHEMA_VERSION,
  type BatchManifest,
  type CandidateMetadata,
  type ValidationIssue,
  type WorkRecipe,
} from "../recipes/recipe-types";

/**
 * BATCH BUILDING — assembles a set of candidates and writes them to disk.
 *
 * Everything about the loop is bounded. Each candidate gets a fixed number of
 * attempts; each attempt uses a distinct sub-seed so a retry actually explores
 * somewhere new rather than re-rolling the same dice. If a candidate cannot be
 * made within its budget the batch is recorded as incomplete rather than
 * spinning, and whatever did generate cleanly is kept — a batch of eight good
 * candidates is more useful than an error and nothing to look at.
 */

/** candidate-001 and so on. Fixed width so directory listings sort correctly. */
export function candidateId(n: number): string {
  return `candidate-${String(n).padStart(3, "0")}`;
}

/**
 * Rejects anything that is not a plain slug. A batch id reaches the filesystem,
 * so "../.." or an absolute path must never survive this.
 */
export function assertSafeSegment(value: string, label: string): string {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,80}$/.test(value)) {
    throw new Error(
      `${label} "${value}" is not allowed. Use letters, numbers, dots, dashes and underscores only.`,
    );
  }
  return value;
}

export type BuiltCandidate = {
  recipe: WorkRecipe;
  svg: string;
  metadata: CandidateMetadata;
};

export type BuildResult = {
  batchId: string;
  seed: string;
  candidates: BuiltCandidate[];
  attempts: number;
  complete: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  spread: string;
};

export function buildBatch(options: {
  batchId: string;
  seed: string;
  count: number;
  static?: boolean;
}): BuildResult {
  const { batchId, seed, count } = options;
  const memory = createBatchMemory();
  const candidates: BuiltCandidate[] = [];
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  let attempts = 0;

  for (let n = 1; n <= count; n++) {
    const id = candidateId(n);
    let placed = false;
    let lastReason = "";

    for (let attempt = 0; attempt < RULES.maxAttemptsPerCandidate && !placed; attempt++) {
      attempts++;
      // A distinct sub-seed per attempt: retrying must move, not repeat.
      const candidateSeed = `${seed}::${id}::${attempt}`;

      try {
        const recipe = createRecipe(candidateSeed, id, { static: options.static });

        const diversity = checkDiversity(recipe, memory, count);
        if (!diversity.ok) {
          lastReason = diversity.reason;
          continue;
        }

        const issues = validateRecipe(recipe);
        if (hasErrors(issues)) {
          lastReason = issues.find((i) => i.level === "error")?.message ?? "validation failed";
          continue;
        }

        const rendered = renderRecipe(recipe, { static: options.static });

        if (rendered.coverage < RULES.coverage.min) {
          lastReason = `coverage ${rendered.coverage.toFixed(3)} is below the minimum — the form would be a speck`;
          continue;
        }
        if (rendered.coverage > RULES.coverage.max) {
          lastReason = `coverage ${rendered.coverage.toFixed(3)} is above the maximum — the form would fill the frame`;
          continue;
        }

        recipe.generatedAt = new Date().toISOString();

        const metadata: CandidateMetadata = {
          candidateId: id,
          candidateNumber: n,
          batchId,
          seed: candidateSeed,
          elementCount: rendered.elementCount,
          coverage: Math.round(rendered.coverage * 1000) / 1000,
          constraint: recipe.composition.constraint,
          hasMotion: Boolean(recipe.modules.motion),
          moduleLabels: {
            body: recipe.modules.body.id,
            appendages: recipe.modules.appendages.map((a) => a.id),
            patterns: recipe.modules.patterns.map((p) => p.id),
            arrangement: recipe.modules.arrangement.id,
            transformations: recipe.modules.transformations.map((t) => t.id),
            motion: recipe.modules.motion?.id,
            palette: recipe.modules.palette.id,
          },
          issues: issues.filter((i) => i.level === "warning"),
        };

        warnings.push(...metadata.issues.map((i) => ({ ...i, candidateId: id })));
        remember(recipe, memory);
        candidates.push({ recipe, svg: rendered.svg, metadata });
        placed = true;
      } catch (err) {
        lastReason =
          err instanceof GenerationError
            ? `${err.code}: ${err.message}`
            : err instanceof Error
              ? err.message
              : String(err);
      }
    }

    if (!placed) {
      errors.push({
        level: "error",
        code: "candidate-not-generated",
        candidateId: id,
        message: `${id} could not be generated in ${RULES.maxAttemptsPerCandidate} attempts. Last reason: ${lastReason}`,
      });
    }
  }

  return {
    batchId,
    seed,
    candidates,
    attempts,
    complete: candidates.length === count && errors.length === 0,
    errors,
    warnings,
    spread: describeSpread(memory),
  };
}

export function writeBatch(
  result: BuildResult,
  outputRoot: string,
  options: { force?: boolean } = {},
): { dir: string; manifest: BatchManifest; manifestPath: string } {
  assertSafeSegment(result.batchId, "Batch id");
  const dir = join(outputRoot, result.batchId);

  if (existsSync(dir)) {
    if (!options.force) {
      throw new Error(
        `Output already exists at ${dir}. Nothing was overwritten.\n` +
          `Re-run with --force to replace it, or choose a different --seed.`,
      );
    }
    rmSync(dir, { recursive: true, force: true });
  }
  mkdirSync(dir, { recursive: true });

  const manifest: BatchManifest = {
    schemaVersion: SCHEMA_VERSION,
    batchId: result.batchId,
    seed: result.seed,
    candidateCount: result.candidates.length,
    generatedAt: new Date().toISOString(),
    generatorVersion: GENERATOR_VERSION,
    ruleSetVersion: RULE_SET_VERSION,
    complete: result.complete,
    candidates: [],
    validation: { errors: result.errors, warnings: result.warnings },
  };

  for (const c of result.candidates) {
    const sub = join(dir, c.metadata.candidateId);
    mkdirSync(sub, { recursive: true });
    writeFileSync(join(sub, "preview.svg"), c.svg, "utf8");
    writeFileSync(join(sub, "recipe.json"), JSON.stringify(c.recipe, null, 2) + "\n", "utf8");
    writeFileSync(join(sub, "metadata.json"), JSON.stringify(c.metadata, null, 2) + "\n", "utf8");

    manifest.candidates.push({
      candidateId: c.metadata.candidateId,
      candidateNumber: c.metadata.candidateNumber,
      path: c.metadata.candidateId,
      svg: `${c.metadata.candidateId}/preview.svg`,
      recipe: `${c.metadata.candidateId}/recipe.json`,
      metadata: `${c.metadata.candidateId}/metadata.json`,
      hasErrors: false,
    });
  }

  const manifestPath = join(dir, "manifest.json");
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");

  return { dir, manifest, manifestPath };
}
