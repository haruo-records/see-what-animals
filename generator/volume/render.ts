import type { Creature, Part } from "./types";
import type { Vec } from "./types";
import { outlinePath, edgePath, bounds } from "./shape";

/**
 * OCCLUSION RENDERING.
 *
 * The whole method is four lines long and it is where the volume comes from:
 *
 *   sort parts back to front
 *   for each part:
 *       stroke its outline thickly in PAPER          <- the halo
 *       fill its outline in INK                      <- covers the halo's inner half
 *       draw its own declared edges and openings in PAPER
 *
 * The halo is centred on the outline, so half falls inside the part and half
 * outside. The inside half is immediately covered by the part's own ink fill.
 * The outside half lands on whatever was painted before it — and there the
 * behaviour is exactly what the reference drawings do:
 *
 *   · over a part behind it   -> a white line appears, separating near from far
 *   · over bare paper          -> nothing appears, because paper on paper is nothing
 *
 * So a white line cannot be drawn where there is no structure on both sides of
 * it. It is not a rule that has to be enforced or remembered; it is not
 * expressible. The outer silhouette against the background stays a clean black
 * edge, and the drawing never acquires the uniform cartoon outline that a
 * sticker has.
 *
 * There is no camera, no vanishing point and no foreshortening. `depth` decides
 * only what covers what. Each part therefore shows whichever of its own faces
 * it declares, independent of the others — the drawing reads as solid without
 * ever committing to a single viewpoint, and never becomes an isometric
 * technical illustration.
 */

/** Weight of an occlusion boundary. Constant everywhere, as in the source works. */
const BOUNDARY = 17;

const escapeAttr = (v: string | number): string =>
  String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export type Ink = { ink: string; paper: string };

export const INK: Ink = { ink: "#1c1d1c", paper: "#ffffff" };

/** Parts, far to near. A stable sort keeps authored order within one depth. */
function sorted(parts: Part[]): Part[] {
  return [...parts].map((p, i) => ({ p, i })).sort((a, b) => a.p.depth - b.p.depth || a.i - b.i).map((x) => x.p);
}

function partMarkup(part: Part, colors: Ink): string {
  const d = outlinePath(part.outline, part.rounding);
  const out: string[] = [];

  // The halo. Visible only where this part covers another.
  out.push(
    `    <path d="${escapeAttr(d)}" fill="none" stroke="${colors.paper}" stroke-width="${BOUNDARY}" stroke-linejoin="round"/>`,
  );
  // The mass.
  out.push(`    <path d="${escapeAttr(d)}" fill="${colors.ink}"/>`);

  // Openings: a void in this part, with an optional ink rim for wall thickness.
  for (const opening of part.openings ?? []) {
    const od = outlinePath(opening.outline, opening.rounding);
    if (opening.rim && opening.rim > 0) {
      out.push(
        `    <path d="${escapeAttr(od)}" fill="none" stroke="${colors.ink}" stroke-width="${opening.rim * 2}" stroke-linejoin="round"/>`,
      );
    }
    out.push(`    <path d="${escapeAttr(od)}" fill="${colors.paper}"/>`);
  }

  // The part's own boundaries: a crease, the edge of a thickness, a surface
  // turning away. Declared by the part because only the part knows its form.
  for (const edge of part.edges ?? []) {
    out.push(
      `    <path d="${escapeAttr(edgePath(edge.points, edge.rounding))}" fill="none" stroke="${colors.paper}" stroke-width="${edge.weight ?? BOUNDARY * 0.8}" stroke-linecap="round" stroke-linejoin="round"/>`,
    );
  }

  return out.join("\n");
}

export function renderCreature(
  creature: Creature,
  options: { size?: number; colors?: Ink; margin?: number } = {},
): string {
  const size = options.size ?? 1200;
  const colors = options.colors ?? INK;
  const margin = options.margin ?? 0.14;

  const order = sorted(creature.parts);
  const all = order.flatMap((p) => p.outline);
  const b = bounds(all);

  // Fit: uniform scale about the drawing's own centre. No perspective is
  // involved — this only decides how much of the frame the body occupies.
  const extent = Math.max(b.w, b.h) || 1;
  const scale = (size * (1 - margin * 2)) / extent;
  const dx = size / 2 - (b.x + b.w / 2) * scale;
  const dy = size / 2 - (b.y + b.h / 2) * scale;

  const body = order.map((p) => partMarkup(p, colors)).join("\n");

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img">`,
    `  <title>${escapeAttr(creature.title)}</title>`,
    `  <g transform="translate(${dx.toFixed(2)} ${dy.toFixed(2)}) scale(${scale.toFixed(4)})">`,
    body,
    `  </g>`,
    `</svg>`,
    "",
  ].join("\n");
}

/**
 * Which parts actually cover which.
 *
 * This samples one outline against the other rather than comparing bounding
 * boxes. The box test was reporting four overlaps in a body that had one: two
 * parts whose extents cross can still miss each other entirely, and a report
 * that says "four occlusions" about a drawing with none is worse than no report
 * at all — it hides exactly the failure it exists to catch, and the drawing
 * goes out flat.
 */
function pointInPolygon(pt: Vec, poly: Vec[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

/** Fraction of `a` that lies inside `b`, by sampling a's extent. */
function overlapFraction(a: Vec[], b: Vec[], steps = 40): number {
  const ba = bounds(a);
  let inA = 0;
  let inBoth = 0;
  for (let i = 0; i <= steps; i++) {
    for (let j = 0; j <= steps; j++) {
      const pt: Vec = [ba.x + (ba.w * i) / steps, ba.y + (ba.h * j) / steps];
      if (!pointInPolygon(pt, a)) continue;
      inA++;
      if (pointInPolygon(pt, b)) inBoth++;
    }
  }
  return inA === 0 ? 0 : inBoth / inA;
}

export type Occlusion = { front: string; behind: string; fraction: number };

/**
 * `minFraction` is the point below which an overlap stops doing any work. A
 * couple of per cent is two outlines grazing: it produces a nick of white
 * rather than a boundary, and the parts still read as set side by side.
 */
export function occlusions(creature: Creature, minFraction = 0.05): Occlusion[] {
  const order = sorted(creature.parts);
  const found: Occlusion[] = [];
  for (let i = 0; i < order.length; i++) {
    for (let j = i + 1; j < order.length; j++) {
      const fraction = overlapFraction(order[i].outline, order[j].outline);
      if (fraction >= minFraction) {
        found.push({ front: order[j].id, behind: order[i].id, fraction });
      }
    }
  }
  return found;
}
