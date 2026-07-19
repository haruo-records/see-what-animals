import type { ModuleMeta, ParameterDefinition, ResolvedParameters } from "../registry/module-types";
import { clampParameter } from "../registry/module-types";
import {
  arrangements,
  appendages,
  bodies,
  enabledOf,
  motions,
  palettes,
  patterns,
  transformations,
} from "../registry/module-registry";
import { isCompatibleWithAll, RULES, weightOf } from "../rules/compatibility";
import type { Rng } from "../random/seeded-random";
import { createRng } from "../random/seeded-random";
import {
  COMPOSITION_CONSTRAINTS,
  GENERATOR_VERSION,
  RULE_SET_VERSION,
  SCHEMA_VERSION,
  type CompositionConstraint,
  type ModuleInstance,
  type WorkRecipe,
} from "./recipe-types";

export const CANVAS = { width: 1200, height: 1200 } as const;

/**
 * RECIPE CREATION — decides what a work is made of. It never draws.
 *
 * The split matters: this file may be read to understand why a candidate looks
 * the way it does, and render-svg.ts may be changed without altering any past
 * decision. Mixing the two would mean a rendering fix silently rewrites the
 * archive.
 */

/** Picks a parameter value inside its declared range, biased away from the extremes. */
function rollParameter(rng: Rng, def: ParameterDefinition): number | boolean | string {
  switch (def.type) {
    case "number": {
      // Average of two draws: a soft centre bias, so most values sit in the
      // useful middle and the extremes stay rare rather than absent.
      const t = (rng.next() + rng.next()) / 2;
      const raw = def.min + t * (def.max - def.min);
      const stepped = def.step ? Math.round(raw / def.step) * def.step : raw;
      return Math.round(Math.min(def.max, Math.max(def.min, stepped)) * 1000) / 1000;
    }
    case "integer":
      return rng.int(def.min, def.max);
    case "boolean":
      return rng.bool();
    case "enum":
      return rng.pick(def.values);
  }
}

function instantiate(rng: Rng, m: ModuleMeta): ModuleInstance {
  const parameters: ResolvedParameters = {};
  for (const [key, def] of Object.entries(m.parameters)) {
    parameters[key] = clampParameter(def, rollParameter(rng, def));
  }
  return { id: m.id, version: m.version, parameters };
}

/**
 * The constraint is chosen FIRST and then steers the module choices. Picking
 * modules at random and describing the result afterwards is what produces the
 * mass-produced feeling — every candidate ends up an average of the module set.
 * Deciding the structural idea first means each candidate is trying to do one
 * specific thing.
 */
/**
 * Each constraint is a WAY OF LIVING, and it picks the body and the deformation
 * that make that life legible. Deciding this first — before any module is
 * chosen — is what stops a batch being twelve averages of the module set.
 *
 * Every name describes a predicament, never a mood and never a species.
 */
function constraintPreferences(constraint: CompositionConstraint): {
  transformation?: string;
  arrangement?: string;
  motion?: "required" | "forbidden" | "free";
  body?: string;
} {
  switch (constraint) {
    case "heavy-end-thin-neck":
      return { body: "body-suspended-mass-01", transformation: "transformation-mass-shift-01", motion: "free" };
    case "supports-its-own-weight":
      return { body: "body-split-column-01", transformation: "transformation-lean-01", motion: "free" };
    case "one-joint-already-used":
      return { body: "body-hinged-mass-01", transformation: "transformation-kink-01", motion: "free" };
    case "wound-in-on-itself":
      return { body: "body-coiled-support-01", transformation: "transformation-mass-shift-01", motion: "required" };
    case "void-larger-than-body":
      return { body: "body-open-shell-01", transformation: "transformation-stretch-01", motion: "free" };
    case "one-side-arrived-first":
      return { body: "body-fork-01", transformation: "transformation-stretch-01", motion: "free" };
    case "trailing-what-it-cannot-drop":
      return { body: "body-drifting-plate-01", transformation: "transformation-lean-01", motion: "free" };
    case "reaching-past-its-balance":
      return { body: "body-weighted-arc-01", transformation: "transformation-curl-in-01", motion: "free" };
    case "folded-and-stuck-there":
      return { body: "body-crooked-frame-01", transformation: "transformation-pinch-01", motion: "free" };
  }
}

function pickPreferred<T extends ModuleMeta>(
  rng: Rng,
  pool: T[],
  chosen: string[],
  preferredId: string | undefined,
): T {
  const usable = pool.filter((m) => isCompatibleWithAll(m.id, chosen) && weightOf(m) > 0);
  if (usable.length === 0) throw new GenerationError("no-compatible-module", "No compatible module remains");

  if (preferredId) {
    const preferred = usable.find((m) => m.id === preferredId);
    // The preference is strong but not absolute — if it always won, the
    // constraint would collapse into a fixed template.
    if (preferred && rng.bool(0.75)) return preferred;
  }
  return rng.pickWeighted(usable, weightOf);
}

export class GenerationError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "GenerationError";
  }
}

/**
 * `avoid` lets the batch builder STEER rather than reject.
 *
 * With one body per batch and nine bodies, the last slot has a one-in-nine
 * chance of drawing the only body still allowed — and the constraint that would
 * have suggested it is usually spent too. Rejecting and re-rolling searches for
 * that by luck and often runs out of attempts. Telling the engine what is
 * already taken turns the last slot from a lottery into a choice.
 */
export type AvoidHint = { bodies?: string[]; constraints?: string[] };

export function createRecipe(
  seed: string,
  candidateId: string,
  options: { static?: boolean; avoid?: AvoidHint } = {},
): WorkRecipe {
  const rng = createRng(seed);

  const enabledBodies = enabledOf(bodies);
  const enabledArrangements = enabledOf(arrangements);
  const enabledTransformations = enabledOf(transformations);
  const enabledAppendages = enabledOf(appendages);
  const enabledPatterns = enabledOf(patterns);
  const enabledMotions = enabledOf(motions);
  const enabledPalettes = enabledOf(palettes);

  if (enabledBodies.length === 0) throw new GenerationError("no-bodies", "No enabled body module");
  if (enabledArrangements.length === 0) throw new GenerationError("no-arrangements", "No enabled arrangement module");
  if (enabledTransformations.length === 0) throw new GenerationError("no-transformations", "No enabled transformation module");
  if (enabledPalettes.length === 0) throw new GenerationError("no-palettes", "No enabled palette module");

  const avoidBodies = options.avoid?.bodies ?? [];
  const avoidConstraints = options.avoid?.constraints ?? [];

  const constraintPool = COMPOSITION_CONSTRAINTS.filter((c) => !avoidConstraints.includes(c));
  const constraint = rng
    .fork("constraint")
    .pick(constraintPool.length > 0 ? constraintPool : COMPOSITION_CONSTRAINTS);
  const prefs = constraintPreferences(constraint);
  const chosen: string[] = [];

  // ── body (exactly one) ────────────────────────────────────────────────────
  const bodyPool = enabledBodies.filter((b) => !avoidBodies.includes(b.id));
  const bodyModule = pickPreferred(
    rng.fork("body"),
    bodyPool.length > 0 ? bodyPool : enabledBodies,
    chosen,
    // A preference for a body already spent is worse than no preference.
    avoidBodies.includes(prefs.body ?? "") ? undefined : prefs.body,
  );
  chosen.push(bodyModule.id);

  // ── arrangement (exactly one) ─────────────────────────────────────────────
  const arrangementModule = pickPreferred(rng.fork("arrangement"), enabledArrangements, chosen, prefs.arrangement);
  chosen.push(arrangementModule.id);

  // ── appendages (0–2 kinds, 0–12 placements) ───────────────────────────────
  const appRng = rng.fork("appendages");
  const appendageKinds = appRng.int(RULES.appendageKinds.min, RULES.appendageKinds.max);
  const chosenAppendages: ModuleMeta[] = [];
  for (let i = 0; i < appendageKinds; i++) {
    const pool = enabledAppendages.filter(
      (m) => !chosenAppendages.some((c) => c.id === m.id) && isCompatibleWithAll(m.id, chosen),
    );
    if (pool.length === 0) break;
    const picked = appRng.pickWeighted(pool, weightOf);
    chosenAppendages.push(picked);
    chosen.push(picked.id);
  }
  const appendageCount =
    chosenAppendages.length === 0
      ? 0
      : appRng.int(Math.max(2, RULES.appendagePlacements.min), RULES.appendagePlacements.max);

  // Reserved below: if no pattern is drawn either, an appendage kind is forced
  // so the work has at least one element beyond its body.

  // ── patterns (0–2 kinds) ──────────────────────────────────────────────────
  const patRng = rng.fork("patterns");
  const patternKinds = patRng.int(RULES.patternKinds.min, RULES.patternKinds.max);
  const chosenPatterns: ModuleMeta[] = [];
  for (let i = 0; i < patternKinds; i++) {
    const pool = enabledPatterns.filter(
      (m) => !chosenPatterns.some((c) => c.id === m.id) && isCompatibleWithAll(m.id, chosen),
    );
    if (pool.length === 0) break;
    const picked = patRng.pickWeighted(pool, weightOf);
    chosenPatterns.push(picked);
    chosen.push(picked.id);
  }

  // ── transformations (2–3, the constraint's own first) ─────────────────────
  const trRng = rng.fork("transformations");
  const chosenTransformations: ModuleMeta[] = [];
  const first = pickPreferred(trRng, enabledTransformations, chosen, prefs.transformation);
  chosenTransformations.push(first);
  chosen.push(first.id);

  const extraTransformations = trRng.int(
    RULES.transformations.min - 1,
    RULES.transformations.max - 1,
  );
  for (let i = 0; i < extraTransformations; i++) {
    const pool = enabledTransformations.filter(
      (m) => !chosenTransformations.some((c) => c.id === m.id) && isCompatibleWithAll(m.id, chosen),
    );
    if (pool.length === 0) break;
    const picked = trRng.pickWeighted(pool, weightOf);
    chosenTransformations.push(picked);
    chosen.push(picked.id);
  }

  // ── motion (0 or 1) ───────────────────────────────────────────────────────
  const moRng = rng.fork("motion");
  let motionModule: ModuleMeta | undefined;
  if (!options.static && enabledMotions.length > 0) {
    const wanted =
      prefs.motion === "required"
        ? true
        : prefs.motion === "forbidden"
          ? false
          : moRng.bool(0.55);
    if (wanted) {
      const pool = enabledMotions.filter((m) => isCompatibleWithAll(m.id, chosen));
      if (pool.length > 0) {
        // "Outline still, interior moves" must not be satisfied by a whole-form turn.
        const narrowed =
          constraint === "wound-in-on-itself"
            ? pool.filter((m) => m.id !== "motion-rotate-01" && m.id !== "motion-sway-01")
            : pool;
        motionModule = moRng.pickWeighted(narrowed.length > 0 ? narrowed : pool, weightOf);
        chosen.push(motionModule.id);
      }
    }
  }

  const paletteModule = rng.fork("palette").pickWeighted(enabledPalettes, weightOf);

  const paramRng = rng.fork("parameters");

  return {
    schemaVersion: SCHEMA_VERSION,
    candidateId,
    seed,
    generatedAt: new Date(0).toISOString(), // replaced by the writer; kept out of the hash
    canvas: {
      width: CANVAS.width,
      height: CANVAS.height,
      viewBox: `0 0 ${CANVAS.width} ${CANVAS.height}`,
    },
    modules: {
      body: instantiate(paramRng.fork("body"), bodyModule),
      appendages: chosenAppendages.map((m, i) => instantiate(paramRng.fork(`appendage-${i}`), m)),
      patterns: chosenPatterns.map((m, i) => instantiate(paramRng.fork(`pattern-${i}`), m)),
      arrangement: instantiate(paramRng.fork("arrangement"), arrangementModule),
      transformations: chosenTransformations.map((m, i) =>
        instantiate(paramRng.fork(`transformation-${i}`), m),
      ),
      motion: motionModule ? instantiate(paramRng.fork("motion"), motionModule) : undefined,
      palette: { id: paletteModule.id, version: paletteModule.version, parameters: {} },
    },
    composition: { appendageCount, constraint },
    generationMeta: {
      generatorVersion: GENERATOR_VERSION,
      ruleSetVersion: RULE_SET_VERSION,
    },
  };
}

/** A stable fingerprint of the decisions, ignoring timestamps. Used for duplicate detection. */
export function recipeFingerprint(recipe: WorkRecipe): string {
  const m = recipe.modules;
  const part = (i: ModuleInstance) =>
    `${i.id}@${i.version}(${Object.entries(i.parameters)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${typeof v === "number" ? Math.round(v * 10) / 10 : v}`)
      .join(",")})`;

  return [
    part(m.body),
    m.appendages.map(part).join("+"),
    m.patterns.map(part).join("+"),
    part(m.arrangement),
    m.transformations.map(part).join("+"),
    m.motion ? part(m.motion) : "no-motion",
    part(m.palette),
    `n=${recipe.composition.appendageCount}`,
  ].join("|");
}

/** A coarse signature used by the diversity rules to spot near-identical siblings. */
export function recipeShape(recipe: WorkRecipe): string {
  const m = recipe.modules;
  const bucket = (n: number) => Math.round(n / 3);
  return [
    m.body.id,
    m.arrangement.id,
    m.appendages.map((a) => a.id).sort().join("+") || "none",
    m.patterns.map((p) => p.id).sort().join("+") || "none",
    m.motion ? "motion" : "still",
    `n${bucket(recipe.composition.appendageCount)}`,
  ].join("|");
}
