import type { SvgNode } from "../registry/module-types";

/**
 * THE SPINE — the primitive the whole form language is now built from.
 *
 * The previous vocabulary was `slab()`: a rounded rectangle. Everything made of
 * rounded rectangles looks like a rounded rectangle, so every body came out a
 * capsule, and a few capsules near each other is a logo. The failure was not in
 * the compositions; it was that the alphabet had one letter.
 *
 * A spine is a path with a RADIUS AT EVERY POINT, closed into a single filled
 * outline. That one change buys most of what was missing:
 *
 *   - taper: thick becomes thin, so a heavy mass can hang off a narrow neck
 *   - continuity: two regions are one body, not two shapes placed near
 *   - bends and forks: direction changes mid-form, so structure has a history
 *   - non-capsule silhouettes, because width is a curve rather than a constant
 *
 * Nothing here is decoration. A spine node is a claim about where the body is
 * and how much of it there is.
 */

export type SpineNode = { x: number; y: number; r: number };

export const r2 = (n: number): number => Math.round(n * 100) / 100;

/** Catmull-Rom through the control nodes, interpolating position AND radius. */
export function resample(nodes: SpineNode[], perSegment = 10): SpineNode[] {
  if (nodes.length < 2) return [...nodes];
  const pts = [nodes[0], ...nodes, nodes[nodes.length - 1]];
  const out: SpineNode[] = [];

  for (let i = 1; i < pts.length - 2; i++) {
    const p0 = pts[i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2];
    for (let s = 0; s < perSegment; s++) {
      const t = s / perSegment;
      const t2 = t * t;
      const t3 = t2 * t;
      const cr = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push({
        x: cr(p0.x, p1.x, p2.x, p3.x),
        y: cr(p0.y, p1.y, p2.y, p3.y),
        r: Math.max(1, cr(p0.r, p1.r, p2.r, p3.r)),
      });
    }
  }
  out.push(nodes[nodes.length - 1]);
  return out;
}

/**
 * Closes a spine into one filled outline: down the left side, round the tip,
 * back up the right, round the tail. The result is a single `d` string, so the
 * whole body is one path and reads as one mass however much it bends.
 */
export function spineOutline(nodes: SpineNode[], perSegment = 10): string {
  const s = resample(nodes, perSegment);
  if (s.length < 2) return "";

  const left: Array<[number, number]> = [];
  const right: Array<[number, number]> = [];

  for (let i = 0; i < s.length; i++) {
    const prev = s[Math.max(0, i - 1)];
    const next = s[Math.min(s.length - 1, i + 1)];
    let tx = next.x - prev.x;
    let ty = next.y - prev.y;
    const len = Math.hypot(tx, ty) || 1;
    tx /= len;
    ty /= len;
    // Normal is the tangent turned a quarter turn.
    const nx = -ty;
    const ny = tx;
    left.push([s[i].x + nx * s[i].r, s[i].y + ny * s[i].r]);
    right.push([s[i].x - nx * s[i].r, s[i].y - ny * s[i].r]);
  }

  const head = s[s.length - 1];
  const tail = s[0];
  const pt = ([x, y]: [number, number]): string => `${r2(x)} ${r2(y)}`;

  /**
   * End caps are SAMPLED, not arcs.
   *
   * An `A` command writes `A rx ry rot large sweep x y` — seven numbers, only
   * the last two of which are a point. Anything reading the path as a stream of
   * coordinate pairs therefore picks up `0 0` from the flag arguments and
   * concludes the shape reaches the canvas origin. That is exactly what the fit
   * pass does, so every body with a round cap was measured as far larger than
   * it is and scaled down to compensate — bodies came out at a quarter of the
   * frame while the code believed they filled it.
   *
   * Emitting the cap as line segments keeps the path to M/L pairs, so the
   * measurement is not an approximation at all: it is exact.
   */
  const cap = (
    centre: SpineNode,
    from: [number, number],
    to: [number, number],
    steps = 8,
  ): string => {
    const a0 = Math.atan2(from[1] - centre.y, from[0] - centre.x);
    let a1 = Math.atan2(to[1] - centre.y, to[0] - centre.x);
    // Always sweep the short way round, in the positive direction.
    while (a1 < a0) a1 += Math.PI * 2;
    let out = "";
    for (let i = 1; i <= steps; i++) {
      const a = a0 + ((a1 - a0) * i) / steps;
      out += ` L ${r2(centre.x + Math.cos(a) * centre.r)} ${r2(centre.y + Math.sin(a) * centre.r)}`;
    }
    return out;
  };

  let d = `M ${pt(left[0])}`;
  for (let i = 1; i < left.length; i++) d += ` L ${pt(left[i])}`;
  d += cap(head, left[left.length - 1], right[right.length - 1]);
  for (let i = right.length - 2; i >= 0; i--) d += ` L ${pt(right[i])}`;
  d += cap(tail, right[0], left[0]);
  d += " Z";
  return d;
}

/** A spine as an ink node. Bodies emit these; nothing else should. */
export function spineNode(nodes: SpineNode[], ink: string): SvgNode {
  return { tag: "path", attrs: { d: spineOutline(nodes), fill: ink } };
}

/**
 * Grows a spine by walking a heading that turns as it goes.
 * `radiusAt(t)` receives 0..1 along the body, so the mass distribution is
 * declared as a profile rather than assembled from parts.
 */
export function grow(options: {
  x: number;
  y: number;
  heading: number;
  length: number;
  steps: number;
  /** Radians added per step. Constant curve; vary it for a changing one. */
  turn: number | ((t: number) => number);
  radiusAt: (t: number) => number;
}): SpineNode[] {
  const { x, y, heading, length, steps, turn, radiusAt } = options;
  const step = length / steps;
  const out: SpineNode[] = [];
  let cx = x;
  let cy = y;
  let h = heading;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    out.push({ x: cx, y: cy, r: Math.max(2, radiusAt(t)) });
    const turnNow = typeof turn === "function" ? turn(t) : turn;
    h += turnNow;
    cx += Math.cos(h) * step;
    cy += Math.sin(h) * step;
  }
  return out;
}

/** The point and heading at a fraction along a spine — where growths attach. */
export function alongSpine(nodes: SpineNode[], t: number): { x: number; y: number; angle: number; r: number } {
  const s = resample(nodes, 6);
  const i = Math.min(s.length - 1, Math.max(0, Math.round(t * (s.length - 1))));
  const prev = s[Math.max(0, i - 1)];
  const next = s[Math.min(s.length - 1, i + 1)];
  return {
    x: s[i].x,
    y: s[i].y,
    angle: Math.atan2(next.y - prev.y, next.x - prev.x),
    r: s[i].r,
  };
}

/**
 * A structural line across the body at a fraction along the spine: a fold, a
 * segment division, a joint. Drawn in paper colour and stopping short of both
 * edges, so it divides the mass without cutting it — the line is a reading of
 * the structure, not a slice through it.
 */
export function crossLine(
  nodes: SpineNode[],
  t: number,
  paper: string,
  options: { reach?: number; width?: number; bow?: number } = {},
): SvgNode {
  const at = alongSpine(nodes, t);
  const reach = at.r * (options.reach ?? 0.82);
  const nx = -Math.sin(at.angle);
  const ny = Math.cos(at.angle);
  const bow = (options.bow ?? 0.35) * at.r;
  const x1 = at.x + nx * reach;
  const y1 = at.y + ny * reach;
  const x2 = at.x - nx * reach;
  const y2 = at.y - ny * reach;
  // Bowed toward the head, the way a segment line wraps a rounded body.
  const mx = at.x + Math.cos(at.angle) * bow;
  const my = at.y + Math.sin(at.angle) * bow;

  return {
    tag: "path",
    attrs: {
      d: `M ${r2(x1)} ${r2(y1)} Q ${r2(mx)} ${r2(my)} ${r2(x2)} ${r2(y2)}`,
      fill: "none",
      stroke: paper,
      "stroke-width": options.width ?? 9,
      "stroke-linecap": "round",
    },
  };
}

/** A paper-coloured void inside the mass. The hole is structure, not absence. */
export function hollow(x: number, y: number, rx: number, ry: number, paper: string, rotate = 0): SvgNode {
  return {
    tag: "ellipse",
    attrs: {
      cx: r2(x),
      cy: r2(y),
      rx: r2(rx),
      ry: r2(ry),
      fill: paper,
      ...(rotate ? { transform: `rotate(${r2(rotate)} ${r2(x)} ${r2(y)})` } : {}),
    },
  };
}

/**
 * An angular plate — the hard counterpart to the spine's softness. Bodies use
 * one of these at most, overlapping the spine so it merges into the same mass
 * rather than sitting beside it.
 */
export function plate(points: Array<[number, number]>, ink: string): SvgNode {
  const d = points.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${r2(x)} ${r2(y)}`).join(" ") + " Z";
  return { tag: "path", attrs: { d, fill: ink } };
}

/** Bounds of a set of spines, including their radii. */
export function spineBounds(groups: SpineNode[][]): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const g of groups) {
    for (const n of resample(g, 6)) {
      minX = Math.min(minX, n.x - n.r);
      minY = Math.min(minY, n.y - n.r);
      maxX = Math.max(maxX, n.x + n.r);
      maxY = Math.max(maxY, n.y + n.r);
    }
  }
  if (!Number.isFinite(minX)) return { x: 0, y: 0, width: 1, height: 1 };
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}
