import type { WorkRecipe } from "../recipes/recipe-types";
import { recipeFingerprint, recipeShape } from "../recipes/create-recipe";

/**
 * DIVERSITY — the rules that judge a batch rather than a candidate.
 *
 * Twelve works that differ only in a parameter are twelve versions of one work.
 * Nothing in the per-candidate rules can catch that, because each of them is
 * individually fine. So the batch is assembled with a memory of what it has
 * already accepted, and a candidate that repeats an existing shape is rejected
 * and re-rolled with a different sub-seed.
 */

export type BatchMemory = {
  fingerprints: Set<string>;
  shapes: Set<string>;
  bodies: Map<string, number>;
  arrangements: Map<string, number>;
  constraints: Map<string, number>;
  motionCount: number;
  accepted: number;
};

export function createBatchMemory(): BatchMemory {
  return {
    fingerprints: new Set(),
    shapes: new Set(),
    bodies: new Map(),
    arrangements: new Map(),
    constraints: new Map(),
    motionCount: 0,
    accepted: 0,
  };
}

export type DiversityVerdict = { ok: true } | { ok: false; reason: string };

/**
 * `target` is the batch size, needed because the caps are proportional: one
 * body may not take more than about a third of a batch, whatever the size.
 */
export function checkDiversity(
  recipe: WorkRecipe,
  memory: BatchMemory,
  target: number,
): DiversityVerdict {
  const fingerprint = recipeFingerprint(recipe);
  if (memory.fingerprints.has(fingerprint)) {
    return { ok: false, reason: "identical recipe already in this batch" };
  }

  const shape = recipeShape(recipe);
  if (memory.shapes.has(shape)) {
    return { ok: false, reason: "another candidate already has this combination" };
  }

  // A quarter, not a third: at a third, two curve-based bodies could between
  // them take two thirds of a batch and every candidate read as a variation.
  const bodyCap = Math.max(2, Math.ceil(target / 4));
  if ((memory.bodies.get(recipe.modules.body.id) ?? 0) >= bodyCap) {
    return { ok: false, reason: `body ${recipe.modules.body.id} already used ${bodyCap} times` };
  }

  const arrangementCap = Math.max(2, Math.ceil(target / 3));
  if ((memory.arrangements.get(recipe.modules.arrangement.id) ?? 0) >= arrangementCap) {
    return { ok: false, reason: `arrangement ${recipe.modules.arrangement.id} already used ${arrangementCap} times` };
  }

  const constraintCap = Math.max(2, Math.ceil(target / 4));
  if ((memory.constraints.get(recipe.composition.constraint) ?? 0) >= constraintCap) {
    return { ok: false, reason: `constraint ${recipe.composition.constraint} already used ${constraintCap} times` };
  }

  // Motion should be a decision, not a default. Keep both kinds present.
  const hasMotion = Boolean(recipe.modules.motion);
  const remaining = target - memory.accepted;
  const motionCap = Math.ceil(target * 0.7);
  const stillCap = Math.ceil(target * 0.7);
  if (hasMotion && memory.motionCount >= motionCap) {
    return { ok: false, reason: "too many moving candidates in this batch" };
  }
  if (!hasMotion && memory.accepted - memory.motionCount >= stillCap) {
    return { ok: false, reason: "too many still candidates in this batch" };
  }
  // Near the end, force whichever kind is missing entirely.
  if (remaining <= 2 && memory.motionCount === 0 && !hasMotion) {
    return { ok: false, reason: "batch would contain no motion at all" };
  }
  if (remaining <= 2 && memory.motionCount === memory.accepted && hasMotion) {
    return { ok: false, reason: "batch would contain nothing still" };
  }

  return { ok: true };
}

export function remember(recipe: WorkRecipe, memory: BatchMemory): void {
  memory.fingerprints.add(recipeFingerprint(recipe));
  memory.shapes.add(recipeShape(recipe));
  memory.bodies.set(recipe.modules.body.id, (memory.bodies.get(recipe.modules.body.id) ?? 0) + 1);
  memory.arrangements.set(
    recipe.modules.arrangement.id,
    (memory.arrangements.get(recipe.modules.arrangement.id) ?? 0) + 1,
  );
  memory.constraints.set(
    recipe.composition.constraint,
    (memory.constraints.get(recipe.composition.constraint) ?? 0) + 1,
  );
  if (recipe.modules.motion) memory.motionCount += 1;
  memory.accepted += 1;
}

/** A short human summary, printed after a batch so the spread is visible at a glance. */
export function describeSpread(memory: BatchMemory): string {
  const list = (m: Map<string, number>) =>
    [...m.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${k.replace(/^(body|arrangement)-/, "").replace(/-01$/, "")}×${v}`)
      .join(", ");
  return [
    `bodies:       ${list(memory.bodies)}`,
    `arrangements: ${list(memory.arrangements)}`,
    `constraints:  ${list(memory.constraints)}`,
    `motion:       ${memory.motionCount} moving / ${memory.accepted - memory.motionCount} still`,
  ].join("\n");
}
