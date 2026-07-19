import type { SvgNode } from "../registry/module-types";

/**
 * MEASURING WHAT WAS ACTUALLY DRAWN.
 *
 * The body reports its own bounds, but that is only the body. Appendages reach
 * outside it and patterns sit inside it, so body bounds are the wrong thing to
 * judge either fit or coverage by. The first batch made this obvious: several
 * candidates ran off the edge of the frame while their recorded coverage looked
 * perfectly healthy, because the part that escaped was never being measured.
 *
 * This walks the emitted nodes and takes the extent of everything.
 *
 * It is an approximation, deliberately. Exact bounds for a cubic Bézier means
 * solving for its extrema; instead every coordinate in a path — including
 * control points — is treated as a point on the curve. A control point always
 * lies outside or on the hull of the curve it steers, so the result is never
 * too small, only sometimes slightly too generous. Erring toward extra margin
 * is the right direction to be wrong in: the failure it prevents is a clipped
 * work, and the cost is a few pixels of air.
 */

export type Box = { minX: number; minY: number; maxX: number; maxY: number };

const EMPTY: Box = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };

function extend(box: Box, x: number, y: number, pad = 0): void {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return;
  box.minX = Math.min(box.minX, x - pad);
  box.minY = Math.min(box.minY, y - pad);
  box.maxX = Math.max(box.maxX, x + pad);
  box.maxY = Math.max(box.maxY, y + pad);
}

const num = (v: string | number | undefined): number => (v === undefined ? 0 : Number(v));

/** Every number in a path `d`, read as alternating x y. Good enough, never too small. */
function pathPoints(d: string): Array<[number, number]> {
  const values = d.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi);
  if (!values) return [];
  const out: Array<[number, number]> = [];
  for (let i = 0; i + 1 < values.length; i += 2) {
    out.push([Number(values[i]), Number(values[i + 1])]);
  }
  return out;
}

/**
 * Arc commands carry radii and flags that are not coordinates, which would
 * corrupt the pairing above. Only `A` is affected and only bodies/ring uses it,
 * so rather than write a path parser the endpoints are taken and the radii are
 * folded in as padding — again erring large.
 */
function hasArc(d: string): boolean {
  return /[Aa]/.test(d);
}

function boundsOfNode(node: SvgNode, box: Box): void {
  const a = node.attrs;
  // Half the stroke sits outside the geometry.
  const stroke = num(a["stroke-width"]) / 2;

  switch (node.tag) {
    case "path": {
      const d = String(a.d ?? "");
      // Generated paths contain only M/L pairs (see spineOutline), so every
      // number really is a coordinate and this measurement is exact.
      if (hasArc(d)) {
        throw new Error("Path contains an arc command; bounds cannot be measured by coordinate scan");
      }
      for (const [x, y] of pathPoints(d)) extend(box, x, y, stroke);
      break;
    }
    case "circle": {
      const r = num(a.r) + stroke;
      extend(box, num(a.cx) - r, num(a.cy) - r);
      extend(box, num(a.cx) + r, num(a.cy) + r);
      break;
    }
    case "ellipse": {
      const rx = num(a.rx) + stroke;
      const ry = num(a.ry) + stroke;
      extend(box, num(a.cx) - rx, num(a.cy) - ry);
      extend(box, num(a.cx) + rx, num(a.cy) + ry);
      break;
    }
    case "rect": {
      const x = num(a.x);
      const y = num(a.y);
      const w = num(a.width);
      const h = num(a.height);
      // A rect may carry its own rotate(); take the diagonal so any rotation fits.
      const diagonal = Math.hypot(w, h) / 2;
      const cx = x + w / 2;
      const cy = y + h / 2;
      const reach = (a.transform ? diagonal : Math.max(w, h) / 2) + stroke;
      extend(box, cx - reach, cy - reach);
      extend(box, cx + reach, cy + reach);
      break;
    }
    case "line":
      extend(box, num(a.x1), num(a.y1), stroke);
      extend(box, num(a.x2), num(a.y2), stroke);
      break;
    case "polyline": {
      for (const [x, y] of pathPoints(String(a.points ?? ""))) extend(box, x, y, stroke);
      break;
    }
    case "g":
    case "animateTransform":
      break;
  }

  if (node.children) for (const child of node.children) boundsOfNode(child, box);
}

export function measure(nodes: SvgNode[]): Box | null {
  const box: Box = { ...EMPTY };
  for (const n of nodes) boundsOfNode(n, box);
  if (!Number.isFinite(box.minX) || box.maxX <= box.minX || box.maxY <= box.minY) return null;
  return box;
}

export const boxWidth = (b: Box): number => b.maxX - b.minX;
export const boxHeight = (b: Box): number => b.maxY - b.minY;
