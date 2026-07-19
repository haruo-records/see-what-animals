import type { Anchor, BodyPlan, DrawContext, SpineNode, SvgNode } from "../registry/module-types";
import { clampParameter, isParameterInRange } from "../registry/module-types";
import { getModule } from "../registry/module-registry";
import { RULES } from "../rules/compatibility";
import { GenerationError } from "../recipes/create-recipe";
import type { WorkRecipe } from "../recipes/recipe-types";
import { measure, boxWidth, boxHeight } from "./geometry";
import { alongSpine, crossLine, hollow, plate, spineOutline, resample } from "./skeleton";

/**
 * SVG RENDERING — turns a recipe into markup. It makes no choices of its own.
 *
 * The ORDER is what changed. It used to be: draw a body, place small parts
 * around it, then nudge those parts. That pipeline can only ever produce a
 * fixed shape with accessories, which is the definition of an icon.
 *
 * Now: the body returns a PLAN, transformations deform the plan's spines, and
 * only then is anything drawn. Bending happens to the animal, not to a list of
 * dots beside it. Growths attach to the deformed spine, so they land where the
 * body ended up rather than where it was originally designed.
 */

const SAFE_TAGS = new Set(["path", "circle", "ellipse", "rect", "line", "polyline", "g", "animateTransform"]);

/**
 * How much of the frame the finished body occupies along its longer axis.
 * Raised sharply from the previous 0.46–0.68: a form at half the frame with
 * generous air around it reads as a logo waiting for a wordmark, however good
 * the form is. These are meant to be looked at, not scanned.
 */
const FIT = { min: 0.68, max: 0.84 } as const;

const round = (n: number): number => Math.round(n * 1000) / 1000;

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
  /** Share of the frame the finished body's bounding box covers. */
  coverage: number;
  /**
   * How much of the body's own bounding box is actually ink. A few small parts
   * spread wide scores low here even though the bounding box is large — exactly
   * the "scattered decoration" failure that a bounding box alone cannot detect.
   */
  density: number;
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
    resolved[key] = isParameterInRange(def, raw) ? raw : clampParameter(def, raw);
  }
  return { module, resolved };
}

/** Rough ink area of a set of spines, for the density measure. */
function spineArea(spines: SpineNode[][]): number {
  let area = 0;
  for (const s of spines) {
    const r = resample(s, 6);
    for (let i = 1; i < r.length; i++) {
      const seg = Math.hypot(r[i].x - r[i - 1].x, r[i].y - r[i - 1].y);
      area += seg * (r[i].r + r[i - 1].r);
    }
  }
  return area;
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

  // ── 1. the body's plan ────────────────────────────────────────────────────
  const bodyEntry = resolveParams(recipe.modules.body.id, recipe.modules.body.parameters);
  if (bodyEntry.module.category !== "body") {
    throw new GenerationError("category-mismatch", `${recipe.modules.body.id} is not a body`);
  }
  const plan: BodyPlan = bodyEntry.module.plan(baseCtx(bodyEntry.resolved));
  if (plan.spines.length === 0 || plan.spines[0].length < 2) {
    throw new GenerationError("empty-plan", `${recipe.modules.body.id} produced no spine`);
  }

  // ── 2. transformations deform the BODY ────────────────────────────────────
  let spines = plan.spines;
  for (const t of recipe.modules.transformations) {
    const entry = resolveParams(t.id, t.parameters);
    if (entry.module.category !== "transformation") {
      throw new GenerationError("category-mismatch", `${t.id} is not a transformation`);
    }
    spines = entry.module.apply(baseCtx(entry.resolved), spines);
  }
  const deformed: BodyPlan = { ...plan, spines };

  // ── 3. ink: every spine as one closed outline ─────────────────────────────
  const inkNodes: SvgNode[] = spines.map((s) => ({
    tag: "path",
    attrs: { d: spineOutline(s), fill: colors.ink },
  }));

  // At most one angular mass, overlapping the spine so it fuses into the body
  // rather than sitting beside it.
  if (deformed.plate) {
    const at = alongSpine(spines[0], deformed.plate.t);
    const size = deformed.plate.size;
    const a = at.angle + deformed.plate.skew;
    const corner = (da: number, dist: number): [number, number] => [
      at.x + Math.cos(a + da) * dist,
      at.y + Math.sin(a + da) * dist,
    ];
    inkNodes.push(
      plate(
        [corner(0.4, size), corner(1.9, size * 0.85), corner(3.4, size * 1.1), corner(4.9, size * 0.6)],
        colors.ink,
      ),
    );
  }

  // ── 4. growths, on the deformed body ──────────────────────────────────────
  const growthNodes: SvgNode[] = [];
  let anchors: Anchor[] = [];
  if (recipe.modules.appendages.length > 0 && recipe.composition.appendageCount > 0) {
    const arrEntry = resolveParams(recipe.modules.arrangement.id, recipe.modules.arrangement.parameters);
    if (arrEntry.module.category !== "arrangement") {
      throw new GenerationError("category-mismatch", `${recipe.modules.arrangement.id} is not an arrangement`);
    }
    anchors = arrEntry.module.place(baseCtx(arrEntry.resolved), deformed, recipe.composition.appendageCount);

    const entries = recipe.modules.appendages.map((a) => resolveParams(a.id, a.parameters));
    anchors.forEach((anchor, i) => {
      const entry = entries[i % entries.length];
      if (entry.module.category !== "appendage") {
        throw new GenerationError("category-mismatch", `${entry.module.id} is not an appendage`);
      }
      // The growth is told how thick its host is here, so it stays proportional
      // to the body instead of being a fixed decorative size.
      const host = alongSpine(spines[0], 0.5).r;
      growthNodes.push(...entry.module.grow(baseCtx(entry.resolved, anchors), anchor, host, i));
    });
  }

  // ── 5. voids and structure lines, carried along by the spine ──────────────
  const voidNodes: SvgNode[] = deformed.voids.map((v) => {
    const at = alongSpine(spines[0], v.t);
    const off = v.offset ?? 0;
    return hollow(
      at.x + Math.cos(at.angle + Math.PI / 2) * off,
      at.y + Math.sin(at.angle + Math.PI / 2) * off,
      v.rx,
      v.ry,
      colors.light,
      v.rotate ?? (at.angle * 180) / Math.PI,
    );
  });

  const lineNodes: SvgNode[] = deformed.lines.map((t) => crossLine(spines[0], t, colors.light));

  for (const p of recipe.modules.patterns) {
    const entry = resolveParams(p.id, p.parameters);
    if (entry.module.category !== "pattern") {
      throw new GenerationError("category-mismatch", `${p.id} is not a pattern`);
    }
    lineNodes.push(...entry.module.draw(baseCtx(entry.resolved), deformed));
  }

  // ── 6. motion ─────────────────────────────────────────────────────────────
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

  // ── 7. fit ────────────────────────────────────────────────────────────────
  const drawn = [...inkNodes, ...growthNodes];
  const box = measure(drawn);

  let fit = { scale: 1, dx: 0, dy: 0 };
  if (box) {
    const extent = Math.max(boxWidth(box), boxHeight(box));
    const target = Math.min(FIT.max, Math.max(FIT.min, extent / width)) * width;
    const scale = extent > 0 ? target / extent : 1;
    const contentCx = (box.minX + box.maxX) / 2;
    const contentCy = (box.minY + box.maxY) / 2;
    fit = { scale, dx: cx - contentCx * scale, dy: cy - contentCy * scale };
  }

  // ── 8. assembly ───────────────────────────────────────────────────────────
  // Voids and lines sit over the ink inside the same transform, so they stay
  // registered to the body at any scale.
  const interior: SvgNode = { tag: "g", attrs: {}, children: [...innerAnimation, ...voidNodes, ...lineNodes] };
  const artwork: SvgNode = { tag: "g", attrs: {}, children: [...inkNodes, ...growthNodes, interior] };
  const fitted: SvgNode = {
    tag: "g",
    attrs: { transform: `translate(${round(fit.dx - cx)} ${round(fit.dy - cy)}) scale(${round(fit.scale)})` },
    children: [artwork],
  };
  const stage: SvgNode = {
    tag: "g",
    attrs: { transform: `translate(${cx} ${cy})` },
    children: [...outerAnimation, fitted],
  };

  const elementCount = countElements([stage]);
  if (elementCount > RULES.maxElements) {
    throw new GenerationError("too-complex", `${elementCount} elements exceeds the ceiling of ${RULES.maxElements}`);
  }

  const boxW = box ? boxWidth(box) * fit.scale : 0;
  const boxH = box ? boxHeight(box) * fit.scale : 0;
  const coverage = (boxW * boxH) / (width * height);
  const density = boxW * boxH > 0 ? Math.min(1, (spineArea(spines) * fit.scale * fit.scale) / (boxW * boxH)) : 0;

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${recipe.canvas.viewBox}" width="${width}" height="${height}" role="img">`,
    `  <title>An observation candidate. ${recipe.candidateId}</title>`,
    nodeToString(stage),
    "</svg>",
    "",
  ].join("\n");

  return { svg, elementCount, coverage, density };
}
