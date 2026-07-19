import type { ModuleMeta, VisualTag } from "../registry/module-types";
import { allModules, getModule } from "../registry/module-registry";

/**
 * COMPOSITION RULES — the constraints that keep a batch from being noise.
 *
 * These are hard limits, checked before a candidate is accepted. The diversity
 * rules (diversity-rules.ts) are separate: those compare candidates against
 * each other, these judge one candidate on its own.
 */
export const RULES = {
  /** Exactly one body and one arrangement, always. */
  appendageKinds: { min: 0, max: 2 },
  /**
   * Total placements across all appendage kinds. The redesigned language works
   * in twos and threes — a mass with four stubs and a stray ring is already a
   * busy composition. The first v2 batch proved this empirically: candidates
   * with five auxiliary parts scattered by a radial arrangement measured 10–15
   * separate ink components — a swarm, which is the one texture the originals
   * never have. Three is the ceiling the source material itself keeps to.
   */
  appendagePlacements: { min: 0, max: 3 },
  patternKinds: { min: 0, max: 2 },
  transformations: { min: 1, max: 3 },
  /**
   * A body on its own is not a work. The first batch produced several
   * candidates with no appendages and no pattern: a plain arc, with a
   * transformation that had no placements to act on and therefore did nothing.
   * At least one secondary element must be present.
   */
  minSecondaryKinds: 1,
  /** Beyond this the drawing stops being a form and becomes texture. */
  maxElements: 120,
  /** Share of the canvas the drawing must occupy: not a speck, not wall to wall. */
  coverage: { min: 0.06, max: 0.82 },
  /** How many times to retry before giving up on a candidate. Never unbounded. */
  maxAttemptsPerCandidate: 40,
} as const;

/**
 * Tags that fix a meaning rather than describe a form. A module carrying one of
 * these is a validation error, not a warning: the whole point of the project is
 * that the author does not decide what a work is, and a tag like "cute" or
 * "bird" decides it in advance, in code, before anyone has looked.
 */
export const FORBIDDEN_TAGS = [
  "dog",
  "cat",
  "bird",
  "human",
  "monster",
  "weapon",
  "enemy",
  "hero",
  "cute",
  "angry",
  "sad",
  "happy",
  "scary",
  "friendly",
];

export const ALLOWED_TAGS: VisualTag[] = [
  "shape",
  "pattern",
  "movement",
  "density",
  "symmetry",
  "contrast",
  "spacing",
  "layer",
  "silhouette",
  "repetition",
  "softness",
  "rigidity",
  "continuous",
  "fragmented",
];

/**
 * Pairs that produce nothing worth looking at. Kept small and explicit rather
 * than inferred: a rule you can read is a rule you can argue with.
 */
export const INCOMPATIBLE_PAIRS: Array<[string, string]> = [
  // The bend is two rotated slabs whose bounds are mostly empty corner; bands
  // across that box land in the air, invisible, and the recipe claims a
  // pattern it does not visibly have.
  ["body-bend-01", "pattern-bands-01"],
  // The arch's opening plus more openings makes it read as pegboard.
  ["body-arch-01", "pattern-ports-01"],
  // The bend's bounds are mostly empty corner; a winding line across that box
  // spends most of its length invisible in the air.
  ["body-bend-01", "pattern-coil-01"],
  // One white-line system per mass. Ribs and a winding coil are both ways of
  // saying "this plane has a body"; said twice at once they cancel into noise,
  // and the source drawings never mix them on a single form.
  ["pattern-bands-01", "pattern-coil-01"],
];

export function isIncompatible(a: string, b: string): boolean {
  const pairHit = INCOMPATIBLE_PAIRS.some(
    ([x, y]) => (x === a && y === b) || (x === b && y === a),
  );
  if (pairHit) return true;

  const ma = getModule(a);
  const mb = getModule(b);
  if (ma?.incompatibleWith?.includes(b)) return true;
  if (mb?.incompatibleWith?.includes(a)) return true;
  return false;
}

/** True when `candidate` may join the modules already chosen. */
export function isCompatibleWithAll(candidateId: string, chosen: string[]): boolean {
  return !chosen.some((id) => isIncompatible(candidateId, id));
}

/** Selection weight, defaulting to 1. Zero means "registered but never picked". */
export function weightOf(m: ModuleMeta): number {
  return m.weight ?? 1;
}

/**
 * Structural checks on the registry itself, run by `generator:validate`.
 * These catch the mistakes that only appear months later: a duplicate id after
 * a copy-paste, a compatibleWith pointing at a module that has been renamed.
 */
export function checkRegistryIntegrity(): Array<{ level: "error" | "warning"; code: string; message: string }> {
  const issues: Array<{ level: "error" | "warning"; code: string; message: string }> = [];
  const seen = new Set<string>();

  for (const m of allModules) {
    if (seen.has(m.id)) {
      issues.push({ level: "error", code: "duplicate-id", message: `Module id "${m.id}" is registered more than once` });
    }
    seen.add(m.id);

    if (!m.label) {
      issues.push({ level: "error", code: "missing-label", message: `${m.id} has no label` });
    }
    if (!Number.isInteger(m.version) || m.version < 1) {
      issues.push({ level: "error", code: "bad-version", message: `${m.id} has an invalid version` });
    }

    for (const tag of m.tags) {
      if (FORBIDDEN_TAGS.includes(tag)) {
        issues.push({
          level: "error",
          code: "meaning-tag",
          message: `${m.id} carries the tag "${tag}", which fixes a meaning. Tags describe form only.`,
        });
      } else if (!ALLOWED_TAGS.includes(tag)) {
        issues.push({ level: "warning", code: "unknown-tag", message: `${m.id} has an unrecognised tag "${tag}"` });
      }
    }

    for (const ref of [...(m.compatibleWith ?? []), ...(m.incompatibleWith ?? [])]) {
      if (!getModule(ref)) {
        issues.push({
          level: "error",
          code: "dangling-reference",
          message: `${m.id} references "${ref}", which is not in the registry`,
        });
      }
    }

    for (const [key, def] of Object.entries(m.parameters)) {
      if (def.type === "number" || def.type === "integer") {
        if (def.min > def.max) {
          issues.push({ level: "error", code: "bad-range", message: `${m.id}.${key}: min is above max` });
        }
        if (def.default < def.min || def.default > def.max) {
          issues.push({ level: "error", code: "default-out-of-range", message: `${m.id}.${key}: default is outside [min, max]` });
        }
      }
      if (def.type === "enum") {
        if (def.values.length === 0) {
          issues.push({ level: "error", code: "empty-enum", message: `${m.id}.${key}: enum has no values` });
        } else if (!def.values.includes(def.default)) {
          issues.push({ level: "error", code: "default-not-in-enum", message: `${m.id}.${key}: default is not one of the values` });
        }
      }
    }
  }

  for (const [a, b] of INCOMPATIBLE_PAIRS) {
    if (!getModule(a)) issues.push({ level: "error", code: "dangling-pair", message: `Incompatible pair references unknown module "${a}"` });
    if (!getModule(b)) issues.push({ level: "error", code: "dangling-pair", message: `Incompatible pair references unknown module "${b}"` });
  }

  return issues;
}
