import type { Anchor, BodyResult, DrawContext, SvgNode } from "../registry/module-types";
import { clampParameter, isParameterInRange } from "../registry/module-types";
import { getModule } from "../registry/module-registry";
import { RULES } from "../rules/compatibility";
import { GenerationError } from "../recipes/create-recipe";
import { measure, boxWidth, boxHeight } from "./geometry";
import type { WorkRecipe } from "../recipes/recipe-types";

/**
 * SVG RENDERING — turns a recipe into markup. It makes no choices of its own:
 * given the same recipe it must always emit the same bytes.
 *
 * Safety: this builds SVG from a fixed set of primitive tags with escaped
 * attribute values. There is no path by which text from a recipe can become
 * markup, no <script>, no <foreignObject>, no external reference. Nothing here
 * ever produces a string that has to be trusted.
 */

/**
 * How much of the frame the finished drawing may occupy, along its longer axis.
 * The lower bound stops a work being a speck; the upper leaves the margin that
 * makes it read as something mounted rather than something cropped.
 */
const FIT = { min: 0.46, max: 0.68 } as const;

const round = (n: number): number => Math.round(n * 1000) / 1000;

const SAFE_TAGS = new Set(["path", "circle", "ellipse", "rect", "line", "polyline", "g", "animateTransform"]);

function escapeAttr(value: string | number): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function nodeToString(node: SvgNode, indent = "  "): string {
  if (!SAFE_TAGS.has(node.tag)) {
    throw new GenerationError("unsafe-tag", `Refusing to emit <${node.tag}>`);
  }
  const attrs = Object.entries(node.attrs)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${k}="${escapeAttr(v)}"`)
    .join(" ");

  if (!node.children || node.children.length === 0) {
    return `${indent}<${node.tag}${attrs ? " " + attrs : ""}/>`;
  }
  const inner = node.children.map((c) => nodeToString(c, indent + "  ")).join("\n");
  return `${indent}<${node.tag}${attrs ? " " + attrs : ""}>\n${inner}\n${indent}</${node.tag}>`;
}

function countElements(nodes: SvgNode[]): number {
  return nodes.reduce((sum, n) => sum + 1 + (n.children ? countElements(n.children) : 0), 0);
}

export type RenderResult = {
  svg: string;
  elementCount: number;
  /** Share of the canvas the drawing's bounding box covers. */
  coverage: number;
};

function resolveParams(instanceId: string, params: Record<string, string | number | boolean>) {
  const module = getModule(instanceId);
  if (!module) throw new GenerationError("unknown-module", `Recipe references unknown module "${instanceId}"`);

  const resolved: Record<string, string | number | boolean> = {};
  for (const [key, def] of Object.entries(module.parameters)) {
    const raw = params[key];
    if (raw === undefined) {
      resolved[key] = def.default;
      continue;
    }
    if (!isParameterInRange(def, raw)) {
      // Clamped rather than thrown: a recipe written before a range narrowed
      // should still render, and validate reports the drift separately.
      resolved[key] = clampParameter(def, raw);
    } else {
      resolved[key] = raw;
    }
  }
  return { module, resolved };
}

export function renderRecipe(recipe: WorkRecipe, options: { static?: boolean } = {}): RenderResult {
  const { width, height } = recipe.canvas;
  const cx = width / 2;
  const cy = height / 2;

  const palette = getModule(recipe.modules.palette.id);
  if (!palette || palette.category !== "palette") {
    throw new GenerationError("unknown-palette", `Unknown palette "${recipe.modules.palette.id}"`);
  }
  const colors = palette.colors;

  const baseCtx = (params: Record<string, string | number | boolean>, anchors: Anchor[] = []): DrawContext => ({
    cx,
    cy,
    size: Math.min(width, height),
    params,
    colors,
    anchors,
  });

  // ── body ──────────────────────────────────────────────────────────────────
  const bodyEntry = resolveParams(recipe.modules.body.id, recipe.modules.body.parameters);
  if (bodyEntry.module.category !== "body") {
    throw new GenerationError("category-mismatch", `${recipe.modules.body.id} is not a body`);
  }
  const body: BodyResult = bodyEntry.module.draw(baseCtx(bodyEntry.resolved));

  // ── arrangement → placements ──────────────────────────────────────────────
  const arrEntry = resolveParams(recipe.modules.arrangement.id, recipe.modules.arrangement.parameters);
  if (arrEntry.module.category !== "arrangement") {
    throw new GenerationError("category-mismatch", `${recipe.modules.arrangement.id} is not an arrangement`);
  }
  let anchors: Anchor[] =
    recipe.composition.appendageCount > 0
      ? arrEntry.module.place(baseCtx(arrEntry.resolved), body, recipe.composition.appendageCount)
      : [];

  // ── transformations, applied in recipe order ──────────────────────────────
  for (const t of recipe.modules.transformations) {
    const entry = resolveParams(t.id, t.parameters);
    if (entry.module.category !== "transformation") {
      throw new GenerationError("category-mismatch", `${t.id} is not a transformation`);
    }
    anchors = entry.module.apply(baseCtx(entry.resolved, anchors), anchors);
  }

  // ── patterns (interior) ───────────────────────────────────────────────────
  const patternNodes: SvgNode[] = [];
  for (const p of recipe.modules.patterns) {
    const entry = resolveParams(p.id, p.parameters);
    if (entry.module.category !== "pattern") {
      throw new GenerationError("category-mismatch", `${p.id} is not a pattern`);
    }
    patternNodes.push(...entry.module.draw(baseCtx(entry.resolved), body.bounds));
  }

  // ── appendages, dealt round-robin across the placements ───────────────────
  const appendageNodes: SvgNode[] = [];
  if (recipe.modules.appendages.length > 0 && anchors.length > 0) {
    const entries = recipe.modules.appendages.map((a) => resolveParams(a.id, a.parameters));
    anchors.forEach((anchor, i) => {
      const entry = entries[i % entries.length];
      if (entry.module.category !== "appendage") {
        throw new GenerationError("category-mismatch", `${entry.module.id} is not an appendage`);
      }
      appendageNodes.push(...entry.module.draw(baseCtx(entry.resolved, anchors), anchor, i));
    });
  }

  // ── motion ────────────────────────────────────────────────────────────────
  let outerAnimation: SvgNode[] = [];
  let innerAnimation: SvgNode[] = [];
  if (recipe.modules.motion && !options.static) {
    const entry = resolveParams(recipe.modules.motion.id, recipe.modules.motion.parameters);
    if (entry.module.category !== "motion") {
      throw new GenerationError("category-mismatch", `${recipe.modules.motion.id} is not a motion`);
    }
    const result = entry.module.animate(baseCtx(entry.resolved, anchors));
    if (result.target === "outer") outerAnimation = result.nodes;
    else innerAnimation = result.nodes;
  }

  // ── fit ───────────────────────────────────────────────────────────────────
  // Measure everything that was actually drawn, then place it in the frame.
  // Modules choose their sizes independently and cannot know what else is in
  // the composition, so a body near its maximum plus long appendages will run
  // off the canvas. Rather than clamp every module's range — which would flatten
  // the variety the ranges exist to provide — the finished drawing is fitted.
  //
  // The target is a BAND, not a single size. Fitting everything to one size
  // would make every work the same visual weight, which is its own kind of
  // mass-production; a band keeps small forms small and large forms large while
  // guaranteeing both are wholly inside the frame.
  const drawn = [...body.nodes, ...patternNodes, ...appendageNodes];
  const box = measure(drawn);

  let fit = { scale: 1, dx: 0, dy: 0 };
  if (box) {
    const extent = Math.max(boxWidth(box), boxHeight(box));
    const target = Math.min(FIT.max, Math.max(FIT.min, extent / width)) * width;
    const scale = extent > 0 ? target / extent : 1;
    // Centre the measured content, not the canvas origin: an asymmetric work
    // should sit centred on its own mass, not on where its body happens to be.
    const contentCx = (box.minX + box.maxX) / 2;
    const contentCy = (box.minY + box.maxY) / 2;
    fit = { scale, dx: cx - contentCx * scale, dy: cy - contentCy * scale };
  }

  // ── assembly ──────────────────────────────────────────────────────────────
  // Three nested groups:
  //   stage    — origin at the canvas centre, so motion animates about 0,0
  //   fitted   — the measured fit, applied once to the whole drawing
  //   artwork  — the drawing in its own coordinates
  const interior: SvgNode = {
    tag: "g",
    attrs: {},
    children: [...innerAnimation, ...patternNodes],
  };

  const artwork: SvgNode = {
    tag: "g",
    attrs: {},
    children: [...body.nodes, interior, ...appendageNodes],
  };

  const fitted: SvgNode = {
    tag: "g",
    attrs: {
      transform:
        `translate(${round(fit.dx - cx)} ${round(fit.dy - cy)}) scale(${round(fit.scale)})`,
    },
    children: [artwork],
  };

  const stage: SvgNode = {
    tag: "g",
    attrs: { transform: `translate(${cx} ${cy})` },
    children: [...outerAnimation, fitted],
  };

  const elementCount = countElements([stage]);
  if (elementCount > RULES.maxElements) {
    throw new GenerationError(
      "too-complex",
      `${elementCount} elements exceeds the ceiling of ${RULES.maxElements}`,
    );
  }

  // Coverage is the share of the frame the finished drawing occupies, measured
  // after the fit from what was really emitted — not from the body's own idea
  // of its size, which ignores everything attached to it.
  const coverage = box
    ? (boxWidth(box) * fit.scale * (boxHeight(box) * fit.scale)) / (width * height)
    : 0;

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${recipe.canvas.viewBox}" width="${width}" height="${height}" role="img">`,
    `  <title>An observation candidate. ${recipe.candidateId}</title>`,
    `  <rect width="${width}" height="${height}" fill="${escapeAttr(colors.light)}" opacity="0.0"/>`,
    nodeToString(stage),
    "</svg>",
    "",
  ].join("\n");

  return { svg, elementCount, coverage };
}
