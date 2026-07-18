import { getModule } from "../registry/module-registry";
import { isParameterInRange } from "../registry/module-types";
import { isIncompatible, RULES } from "../rules/compatibility";
import {
  COMPOSITION_CONSTRAINTS,
  SCHEMA_VERSION,
  type ModuleInstance,
  type ValidationIssue,
  type WorkRecipe,
} from "./recipe-types";

/**
 * RECIPE VALIDATION — hand-written rather than Zod.
 *
 * Zod would be a reasonable choice and the brief allows it, but it is a new
 * runtime dependency for a project that currently has three, and the checks
 * that actually matter here are not shape checks. "This id exists in the
 * registry", "this value is inside the range its module declares", "these two
 * modules must not appear together" all need the registry anyway, so a schema
 * library would only cover the easy half and still leave this file to write.
 */

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

function validateInstance(
  instance: unknown,
  where: string,
  expectedCategory: string,
  issues: ValidationIssue[],
): ModuleInstance | null {
  if (!isRecord(instance)) {
    issues.push({ level: "error", code: "bad-instance", message: `${where} is not an object` });
    return null;
  }
  const id = instance.id;
  if (typeof id !== "string") {
    issues.push({ level: "error", code: "bad-instance", message: `${where} has no id` });
    return null;
  }

  const module = getModule(id);
  if (!module) {
    issues.push({ level: "error", code: "unknown-module", message: `${where} references unknown module "${id}"` });
    return null;
  }
  if (module.category !== expectedCategory) {
    issues.push({
      level: "error",
      code: "category-mismatch",
      message: `${where}: "${id}" is a ${module.category}, expected a ${expectedCategory}`,
    });
    return null;
  }
  if (!module.enabled) {
    issues.push({
      level: "warning",
      code: "disabled-module",
      message: `${where}: "${id}" is disabled. It can still render, but it will not be chosen again.`,
    });
  }
  if (instance.version !== module.version) {
    issues.push({
      level: "warning",
      code: "version-drift",
      message: `${where}: recipe pins "${id}" at v${String(instance.version)}, registry has v${module.version}. The work may render differently.`,
    });
  }

  const params = isRecord(instance.parameters) ? instance.parameters : {};
  for (const [key, def] of Object.entries(module.parameters)) {
    const value = params[key];
    if (value === undefined) {
      issues.push({ level: "warning", code: "missing-parameter", message: `${where}.${key} is absent; the default will be used` });
      continue;
    }
    if (typeof value !== "number" && typeof value !== "string" && typeof value !== "boolean") {
      issues.push({ level: "error", code: "bad-parameter-type", message: `${where}.${key} is not a primitive value` });
      continue;
    }
    if (!isParameterInRange(def, value)) {
      issues.push({
        level: "error",
        code: "parameter-out-of-range",
        message: `${where}.${key} = ${String(value)} is outside the range declared by ${id}`,
      });
    }
  }

  for (const key of Object.keys(params)) {
    if (!(key in module.parameters)) {
      issues.push({ level: "warning", code: "unknown-parameter", message: `${where}.${key} is not declared by ${id}` });
    }
  }

  return instance as unknown as ModuleInstance;
}

export function validateRecipe(recipe: unknown): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!isRecord(recipe)) {
    return [{ level: "error", code: "not-an-object", message: "Recipe is not an object" }];
  }
  if (recipe.schemaVersion !== SCHEMA_VERSION) {
    issues.push({
      level: "error",
      code: "schema-version",
      message: `schemaVersion is ${String(recipe.schemaVersion)}, this build expects ${SCHEMA_VERSION}`,
    });
  }
  for (const key of ["candidateId", "seed", "generatedAt"]) {
    if (typeof recipe[key] !== "string" || !recipe[key]) {
      issues.push({ level: "error", code: "missing-field", message: `"${key}" is missing or not a string` });
    }
  }

  const canvas = recipe.canvas;
  if (!isRecord(canvas) || typeof canvas.width !== "number" || typeof canvas.height !== "number") {
    issues.push({ level: "error", code: "bad-canvas", message: "canvas is missing width/height" });
  }

  const modules = recipe.modules;
  if (!isRecord(modules)) {
    issues.push({ level: "error", code: "missing-modules", message: "modules block is missing" });
    return issues;
  }

  const chosenIds: string[] = [];
  const collect = (i: ModuleInstance | null) => {
    if (i) chosenIds.push(i.id);
  };

  // exactly one body, exactly one arrangement
  collect(validateInstance(modules.body, "modules.body", "body", issues));
  collect(validateInstance(modules.arrangement, "modules.arrangement", "arrangement", issues));
  collect(validateInstance(modules.palette, "modules.palette", "palette", issues));

  const appendages = Array.isArray(modules.appendages) ? modules.appendages : [];
  if (appendages.length > RULES.appendageKinds.max) {
    issues.push({
      level: "error",
      code: "too-many-appendage-kinds",
      message: `${appendages.length} appendage kinds; the limit is ${RULES.appendageKinds.max}`,
    });
  }
  appendages.forEach((a, i) => collect(validateInstance(a, `modules.appendages[${i}]`, "appendage", issues)));

  const patterns = Array.isArray(modules.patterns) ? modules.patterns : [];
  if (patterns.length > RULES.patternKinds.max) {
    issues.push({
      level: "error",
      code: "too-many-pattern-kinds",
      message: `${patterns.length} pattern kinds; the limit is ${RULES.patternKinds.max}`,
    });
  }
  patterns.forEach((p, i) => collect(validateInstance(p, `modules.patterns[${i}]`, "pattern", issues)));

  const transformations = Array.isArray(modules.transformations) ? modules.transformations : [];
  if (transformations.length < RULES.transformations.min) {
    issues.push({
      level: "error",
      code: "no-transformation",
      message: "At least one transformation is required. A work with none has no deliberate imperfection.",
    });
  }
  if (transformations.length > RULES.transformations.max) {
    issues.push({
      level: "error",
      code: "too-many-transformations",
      message: `${transformations.length} transformations; the limit is ${RULES.transformations.max}`,
    });
  }
  transformations.forEach((t, i) =>
    collect(validateInstance(t, `modules.transformations[${i}]`, "transformation", issues)),
  );

  if (modules.motion !== undefined && modules.motion !== null) {
    collect(validateInstance(modules.motion, "modules.motion", "motion", issues));
  }

  // duplicates within one candidate
  const seen = new Set<string>();
  for (const id of chosenIds) {
    if (seen.has(id)) {
      issues.push({ level: "error", code: "duplicate-module", message: `Module "${id}" appears twice in one candidate` });
    }
    seen.add(id);
  }

  // forbidden combinations
  for (let i = 0; i < chosenIds.length; i++) {
    for (let j = i + 1; j < chosenIds.length; j++) {
      if (isIncompatible(chosenIds[i], chosenIds[j])) {
        issues.push({
          level: "error",
          code: "incompatible-modules",
          message: `"${chosenIds[i]}" and "${chosenIds[j]}" must not appear together`,
        });
      }
    }
  }

  const composition = recipe.composition;
  if (!isRecord(composition)) {
    issues.push({ level: "error", code: "missing-composition", message: "composition block is missing" });
  } else {
    const count = composition.appendageCount;
    if (typeof count !== "number" || count < RULES.appendagePlacements.min || count > RULES.appendagePlacements.max) {
      issues.push({
        level: "error",
        code: "appendage-count",
        message: `appendageCount ${String(count)} is outside ${RULES.appendagePlacements.min}–${RULES.appendagePlacements.max}`,
      });
    }
    if (appendages.length === 0 && typeof count === "number" && count > 0) {
      issues.push({
        level: "warning",
        code: "placements-without-appendages",
        message: "appendageCount is above zero but no appendage module is present; nothing will be drawn at those points",
      });
    }
    if (!COMPOSITION_CONSTRAINTS.includes(composition.constraint as never)) {
      issues.push({
        level: "error",
        code: "unknown-constraint",
        message: `Unknown composition constraint "${String(composition.constraint)}"`,
      });
    }
  }

  const meta = recipe.generationMeta;
  if (!isRecord(meta) || typeof meta.generatorVersion !== "string" || typeof meta.ruleSetVersion !== "string") {
    issues.push({ level: "error", code: "missing-generation-meta", message: "generationMeta is missing or incomplete" });
  }

  return issues;
}

export function hasErrors(issues: ValidationIssue[]): boolean {
  return issues.some((i) => i.level === "error");
}
