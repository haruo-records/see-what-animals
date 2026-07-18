/**
 * MODULE TYPES
 *
 * A module is two separable things: JSON-serialisable metadata (what it is,
 * what it can take, what it must not sit beside) and a pure drawing function
 * (given resolved parameters, return SVG element data). Only the metadata ever
 * reaches a recipe file. React components and closures are never serialised.
 *
 * Naming rule, applied throughout: modules are named for their FORM, never for
 * a meaning. "thin-line", not "leg". "cluster", not "swarm". The generator
 * describes shape; what a shape turns out to be is not its business.
 */

export type ModuleCategory =
  | "body"
  | "appendage"
  | "pattern"
  | "arrangement"
  | "transformation"
  | "motion"
  | "palette";

export const MODULE_CATEGORIES: ModuleCategory[] = [
  "body",
  "appendage",
  "pattern",
  "arrangement",
  "transformation",
  "motion",
  "palette",
];

/**
 * Tags describe visual character only. Tags that fix a meaning ("bird", "cute",
 * "angry") are rejected by validate — see FORBIDDEN_TAGS in rules/compatibility.
 */
export type VisualTag =
  | "shape"
  | "pattern"
  | "movement"
  | "density"
  | "symmetry"
  | "contrast"
  | "spacing"
  | "layer"
  | "silhouette"
  | "repetition"
  | "softness"
  | "rigidity"
  | "continuous"
  | "fragmented";

export type ParameterDefinition =
  | { type: "number"; min: number; max: number; step?: number; default: number }
  | { type: "integer"; min: number; max: number; default: number }
  | { type: "boolean"; default: boolean }
  | { type: "enum"; values: string[]; default: string };

export type ParameterValue = number | boolean | string;
export type ResolvedParameters = Record<string, ParameterValue>;

/** The serialisable half. This is what a recipe stores. */
export type ModuleMeta = {
  id: string;
  category: ModuleCategory;
  /** Bump when a change alters the output for the same parameters. */
  version: number;
  label: string;
  enabled: boolean;
  tags: VisualTag[];
  compatibleWith?: string[];
  incompatibleWith?: string[];
  /** Selection weight. Omitted means 1. Zero excludes it without disabling it. */
  weight?: number;
  parameters: Record<string, ParameterDefinition>;
};

/** A primitive SVG node. Deliberately not JSX: the renderer runs under plain Node. */
export type SvgNode = {
  tag: "path" | "circle" | "ellipse" | "rect" | "line" | "polyline" | "g" | "animateTransform";
  attrs: Record<string, string | number>;
  children?: SvgNode[];
};

/** Everything a drawing function is allowed to know. */
export type DrawContext = {
  /** Centre of the canvas. */
  cx: number;
  cy: number;
  /** Canvas edge length. Drawings must stay well inside it. */
  size: number;
  params: ResolvedParameters;
  /** Ink, and the two lighter tones, resolved from the chosen palette. */
  colors: { ink: string; mid: string; light: string };
  /** Anchor points the body exposes, for appendages to attach to. */
  anchors: Anchor[];
};

export type Anchor = { x: number; y: number; angle: number };

/** A body reports where things may attach and how much room it occupies. */
export type BodyResult = {
  nodes: SvgNode[];
  anchors: Anchor[];
  /** Rough bounds, used by the fit and density checks. */
  bounds: { x: number; y: number; width: number; height: number };
};

export type BodyModule = ModuleMeta & {
  category: "body";
  draw(ctx: DrawContext): BodyResult;
};

export type AppendageModule = ModuleMeta & {
  category: "appendage";
  /** Drawn once per placement; `at` is supplied by the arrangement. */
  draw(ctx: DrawContext, at: Anchor, index: number): SvgNode[];
};

export type PatternModule = ModuleMeta & {
  category: "pattern";
  /** Drawn inside or across the body's bounds. */
  draw(ctx: DrawContext, bounds: BodyResult["bounds"]): SvgNode[];
};

export type ArrangementModule = ModuleMeta & {
  category: "arrangement";
  /** Decides where the `count` appendage placements go. Must be pure. */
  place(ctx: DrawContext, body: BodyResult, count: number): Anchor[];
};

export type TransformationModule = ModuleMeta & {
  category: "transformation";
  /**
   * Deliberate imperfection, applied to the placement list after arrangement.
   * This is where near-symmetry, a missing part, and uneven scale come from —
   * they are structural decisions, not noise added at render time.
   */
  apply(ctx: DrawContext, anchors: Anchor[]): Anchor[];
};

export type MotionModule = ModuleMeta & {
  category: "motion";
  /**
   * Returns SMIL/CSS-free declarative animation as SVG child nodes, plus which
   * layer it applies to. Motion never travels toward a destination; it changes
   * a form in place, and often only inside the silhouette.
   */
  animate(ctx: DrawContext): { target: "outer" | "inner"; nodes: SvgNode[] };
};

export type PaletteModule = ModuleMeta & {
  category: "palette";
  colors: { ink: string; mid: string; light: string };
};

export type VisualModule =
  | BodyModule
  | AppendageModule
  | PatternModule
  | ArrangementModule
  | TransformationModule
  | MotionModule
  | PaletteModule;

/** Strips the drawing half, leaving exactly what is safe to serialise. */
export function toMeta(m: VisualModule): ModuleMeta {
  return {
    id: m.id,
    category: m.category,
    version: m.version,
    label: m.label,
    enabled: m.enabled,
    tags: m.tags,
    compatibleWith: m.compatibleWith,
    incompatibleWith: m.incompatibleWith,
    weight: m.weight,
    parameters: m.parameters,
  };
}

/** Resolves a parameter set to concrete values, clamped to their definitions. */
export function resolveDefaults(defs: Record<string, ParameterDefinition>): ResolvedParameters {
  const out: ResolvedParameters = {};
  for (const [key, def] of Object.entries(defs)) out[key] = def.default;
  return out;
}

export function clampParameter(def: ParameterDefinition, value: ParameterValue): ParameterValue {
  switch (def.type) {
    case "number":
      return Math.min(def.max, Math.max(def.min, Number(value)));
    case "integer":
      return Math.round(Math.min(def.max, Math.max(def.min, Number(value))));
    case "boolean":
      return Boolean(value);
    case "enum":
      return def.values.includes(String(value)) ? String(value) : def.default;
  }
}

export function isParameterInRange(def: ParameterDefinition, value: ParameterValue): boolean {
  switch (def.type) {
    case "number":
      return typeof value === "number" && value >= def.min && value <= def.max;
    case "integer":
      return typeof value === "number" && Number.isInteger(value) && value >= def.min && value <= def.max;
    case "boolean":
      return typeof value === "boolean";
    case "enum":
      return typeof value === "string" && def.values.includes(value);
  }
}
