import type { ResolvedParameters } from "../registry/module-types";

/** Bump when the recipe file shape changes in a way older files cannot satisfy. */
export const SCHEMA_VERSION = 1 as const;

/**
 * Bump GENERATOR_VERSION when the engine's decisions change, and
 * RULE_SET_VERSION when the composition rules change. Together with the seed
 * and each module's own `version`, these four fix the output completely: the
 * same values must always rebuild the same work.
 */
export const GENERATOR_VERSION = "0.4.0";
export const RULE_SET_VERSION = "4";

export type ModuleInstance = {
  id: string;
  version: number;
  parameters: ResolvedParameters;
};

export type WorkRecipe = {
  schemaVersion: typeof SCHEMA_VERSION;
  candidateId: string;
  seed: string;
  generatedAt: string;
  canvas: { width: number; height: number; viewBox: string };
  modules: {
    body: ModuleInstance;
    appendages: ModuleInstance[];
    patterns: ModuleInstance[];
    arrangement: ModuleInstance;
    transformations: ModuleInstance[];
    motion?: ModuleInstance;
    palette: ModuleInstance;
  };
  /**
   * How many placements the arrangement was asked for, and the one structural
   * constraint this candidate was built around. The constraint is recorded so a
   * batch can be checked for variety, and so the author can see what the piece
   * was trying to do without reading the geometry.
   */
  composition: {
    appendageCount: number;
    constraint: CompositionConstraint;
  };
  generationMeta: {
    generatorVersion: string;
    ruleSetVersion: string;
  };
};

/**
 * One structural idea per candidate. These are descriptions of STRUCTURE, never
 * of meaning: "one interval is disturbed", not "it looks anxious". The generator
 * does not decide what a form is, and nothing here should tempt it to.
 */
export const COMPOSITION_CONSTRAINTS = [
  "heavy-end-thin-neck",
  "supports-its-own-weight",
  "one-joint-already-used",
  "wound-in-on-itself",
  "void-larger-than-body",
  "one-side-arrived-first",
  "trailing-what-it-cannot-drop",
  "reaching-past-its-balance",
  "folded-and-stuck-there",
] as const;

export type CompositionConstraint = (typeof COMPOSITION_CONSTRAINTS)[number];

export type ValidationIssue = {
  level: "error" | "warning";
  code: string;
  message: string;
  candidateId?: string;
};

export type CandidateMetadata = {
  candidateId: string;
  candidateNumber: number;
  batchId: string;
  seed: string;
  /** Element count, used by the complexity ceiling. */
  elementCount: number;
  /** Share of the canvas the drawing occupies. Guards "too small" and "too full". */
  coverage: number;
  constraint: CompositionConstraint;
  hasMotion: boolean;
  moduleLabels: {
    body: string;
    appendages: string[];
    patterns: string[];
    arrangement: string;
    transformations: string[];
    motion?: string;
    palette: string;
  };
  issues: ValidationIssue[];
};

export type BatchManifest = {
  schemaVersion: typeof SCHEMA_VERSION;
  batchId: string;
  seed: string;
  candidateCount: number;
  generatedAt: string;
  generatorVersion: string;
  ruleSetVersion: string;
  /** True only when every candidate generated and validated cleanly. */
  complete: boolean;
  candidates: Array<{
    candidateId: string;
    candidateNumber: number;
    path: string;
    svg: string;
    recipe: string;
    metadata: string;
    hasErrors: boolean;
  }>;
  validation: {
    errors: ValidationIssue[];
    warnings: ValidationIssue[];
  };
};
