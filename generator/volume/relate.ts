import type { Part, Vec } from "./types";
import { bounds } from "./shape";

/**
 * MINIMAL CONNECTION.
 *
 * Two operations only, because at this stage the prototypes are placed by hand
 * and connection needs to do exactly one thing well: make sure parts that are
 * meant to meet actually intersect.
 *
 * A part that stops just short of its neighbour produces an exploded diagram —
 * the single failure most likely to make an assembly read as a parts catalogue.
 * So `press` moves a part bodily into its host until they genuinely overlap,
 * and the white boundary between them then arises on its own from the
 * occlusion. Nothing is fastened; one form is simply in the way of another.
 */

const centre = (pts: Vec[]): Vec => {
  const b = bounds(pts);
  return [b.x + b.w / 2, b.y + b.h / 2];
};

/** Moves `part` toward `host` by `amount`, so the two masses interpenetrate. */
export function press(part: Part, host: Part, amount: number): Part {
  const from = centre(part.outline);
  const to = centre(host.outline);
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const d = Math.hypot(dx, dy) || 1;
  const mx = (dx / d) * amount;
  const my = (dy / d) * amount;

  const shift = (pts: Vec[]): Vec[] => pts.map(([x, y]) => [x + mx, y + my] as Vec);

  return {
    ...part,
    outline: shift(part.outline),
    edges: part.edges?.map((e) => ({ ...e, points: shift(e.points) })),
    openings: part.openings?.map((o) => ({ ...o, outline: shift(o.outline) })),
  };
}

/**
 * Assigns depth in the order given, far to near. Written as a list so the
 * front-to-back reading of a creature is one legible line in its recipe rather
 * than a set of numbers scattered across the parts.
 */
export function layer(order: Part[]): Part[] {
  return order.map((p, i) => ({ ...p, depth: i }));
}
