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

/**
 * A BODY PLAN, not a drawing.
 *
 * Everything is positioned RELATIVE TO THE SPINE — voids at a fraction along
 * it, structure lines at a fraction along it, the hard plate at a fraction
 * along it. That is what lets transformations deform the body itself: bend the
 * spine and the holes, joints and plate travel with it, because none of them
 * ever knew an absolute coordinate.
 *
 * The old pipeline could only move small parts around a fixed body, which is
 * why every result read as an icon with accessories. Here the transformation
 * changes the animal.
 */
export type BodyPlan = {
  /** One or more spines. Overlapping spines fuse into a single silhouette. */
  spines: SpineNode[][];
  /** Paper-coloured voids, placed along the primary spine. */
  voids: Array<{ t: number; rx: number; ry: number; offset?: number; rotate?: number }>;
  /** At most one angular mass, to set hard against soft within one body. */
  plate?: { t: number; size: number; skew: number };
  /** Fractions along the primary spine carrying a structure line. */
  lines: number[];
};

export type SpineNode = { x: number; y: number; r: number };

export type BodyModule = ModuleMeta & {
  category: "body";
  /** Returns a plan. Bodies never emit SVG directly. */
  plan(ctx: DrawContext): BodyPlan;
};

export type AppendageModule = ModuleMeta & {
  category: "appendage";
  /**
   * An INTEGRAL growth, not an accessory. It is drawn in ink and must start
   * inside the parent mass so the two fuse. `hostRadius` is the body's own
   * thickness where it attaches, so a growth can be proportional to its host
   * rather than a fixed decorative size.
   */
  grow(ctx: DrawContext, at: Anchor, hostRadius: number, index: number): SvgNode[];
};

export type PatternModule = ModuleMeta & {
  category: "pattern";
  /** White structural lines read off the spine. */
  draw(ctx: DrawContext, plan: BodyPlan): SvgNode[];
};

export type ArrangementModule = ModuleMeta & {
  category: "arrangement";
  /** Chooses where along the body growths attach. Must be pure. */
  place(ctx: DrawContext, plan: BodyPlan, count: number): Anchor[];
};

export type TransformationModule = ModuleMeta & {
  category: "transformation";
  /**
   * Deforms the BODY. This is where asymmetry is designed in rather than added
   * afterwards: a transformation bends a spine, shifts its mass toward one end,
   * folds it back on itself. The old version nudged a list of placements, which
   * is the difference between an animal that grew crooked and a symmetrical
   * diagram with one dot moved.
   */
  apply(ctx: DrawContext, spines: SpineNode[][]): SpineNode[][];
};

export type MotionModule = ModuleMeta & {
  category: "motion";
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
