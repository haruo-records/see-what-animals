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
  /**
   * Growths are integral, few, and optional. The previous ceiling of three
   * small parts was still producing "a shape with two dots beside it": the
   * grammar itself was decorative. One kind, at most two placements, and only
   * forms that grow OUT of the body.
   */
  appendageKinds: { min: 0, max: 1 },
  appendagePlacements: { min: 0, max: 2 },
  /** White structure lines. Bodies already declare their own joints. */
  patternKinds: { min: 0, max: 1 },
  /**
   * Two or three deformations, never one. A single deformation reads as a
   * neutral shape with an adjustment; two compound into a body that grew this
   * way. This is the main defence against the almost-symmetrical look.
   */
  transformations: { min: 2, max: 3 },
  maxElements: 120,
  /**
   * Occupancy of the frame. The floor is high on purpose — a small form with a
   * lot of air around it reads as a logo no matter how good the form is.
   */
  coverage: { min: 0.3, max: 0.78 },
  /**
   * Ink as a share of the body's own bounding box. Below this the "body" is a
   * few thin things spread wide, which is a constellation, not an animal.
   */
  minDensity: 0.17,
  maxAttemptsPerCandidate: 60,
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
  // A frame is four rails; a seam running along "the primary spine" would trace
  // one rail and read as a mistake rather than a structure.
  ["body-crooked-frame-01", "pattern-seam-01"],
  // Curling an already-spiral body winds it into an unreadable knot.
  ["body-coiled-support-01", "transformation-curl-in-01"],
  // Pinching a frame's rail severs it visually; the loop stops being a loop.
  ["body-crooked-frame-01", "transformation-pinch-01"],
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
