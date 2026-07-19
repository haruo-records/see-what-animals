import type { Vec } from "./types";

/**
 * OUTLINE GEOMETRY.
 *
 * One builder for every shape in the system: a polygon whose corners may each
 * be rounded by a different amount. A vertex with radius 0 stays a corner; a
 * vertex with a large radius becomes a swell. Straight and curved therefore
 * live in the same outline by default rather than by special-casing.
 *
 * This is the direct answer to three earlier monocultures. Rounded rectangles
 * could only make capsules; a centreline with a thickness could only make
 * capsules and crescents. A polygon with mixed rounding has no characteristic
 * shape at all — what it makes depends entirely on where the points are.
 *
 * Corners are rounded with quadratic Béziers, never arc commands. `A` writes
 * flags into the path data that any coordinate reader mistakes for points.
 */

export const r2 = (n: number): number => Math.round(n * 100) / 100;

const sub = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1]];
const add = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1]];
const scale = (a: Vec, k: number): Vec => [a[0] * k, a[1] * k];
const len = (a: Vec): number => Math.hypot(a[0], a[1]);
const norm = (a: Vec): Vec => {
  const l = len(a) || 1;
  return [a[0] / l, a[1] / l];
};

/**
 * A CLOSED SMOOTH CURVE through every point, in cubic Béziers.
 *
 * This replaces corner-rounding as the default. A polygon with rounded corners
 * always reads as a polygon that has been softened — the straight runs between
 * corners survive, and straight runs are what make a form look cut or
 * fabricated. A curve that passes through its points has no straight runs at
 * all unless one is asked for, so the outline reads as something that grew to
 * that shape rather than something trimmed to it.
 *
 * Sharpness stays available and stays deliberate: a point marked sharp gets a
 * corner, because its neighbouring tangents are dropped. Smooth everywhere is a
 * circle; sharp everywhere is a crystal. Both are available and neither is the
 * default.
 *
 * Catmull-Rom, converted to cubic control points. No arc commands anywhere.
 */
export function smoothClosed(points: Vec[], sharp: boolean[] = []): string {
  const n = points.length;
  if (n < 3) return "";

  const at = (i: number): Vec => points[((i % n) + n) % n];
  const isSharp = (i: number): boolean => sharp[((i % n) + n) % n] ?? false;

  let d = `M ${r2(points[0][0])} ${r2(points[0][1])}`;

  for (let i = 0; i < n; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);

    // A sharp vertex simply refuses its tangent, which collapses the curve into
    // a corner on that side while the rest of the outline stays smooth.
    const c1: Vec = isSharp(i)
      ? p1
      : [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Vec = isSharp(i + 1)
      ? p2
      : [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];

    d += ` C ${r2(c1[0])} ${r2(c1[1])} ${r2(c2[0])} ${r2(c2[1])} ${r2(p2[0])} ${r2(p2[1])}`;
  }
  return d + " Z";
}

/**
 * A closed path through `points`, with each corner cut back by its radius and
 * bridged by a quadratic through the original vertex.
 *
 * The cut-back is capped at just under half of each adjoining edge, so a radius
 * larger than the shape cannot invert it — asking for a very round corner on a
 * short edge gives the roundest corner that edge can carry.
 */
export function outlinePath(points: Vec[], rounding: number[]): string {
  const n = points.length;
  if (n < 3) return "";

  const parts: string[] = [];

  for (let i = 0; i < n; i++) {
    const prev = points[(i - 1 + n) % n];
    const here = points[i];
    const next = points[(i + 1) % n];

    const toPrev = sub(prev, here);
    const toNext = sub(next, here);
    const rWanted = rounding[i] ?? 0;
    const r = Math.min(rWanted, len(toPrev) * 0.49, len(toNext) * 0.49);

    if (r <= 0.5) {
      parts.push(`${parts.length === 0 ? "M" : "L"} ${r2(here[0])} ${r2(here[1])}`);
      continue;
    }

    const start = add(here, scale(norm(toPrev), r));
    const end = add(here, scale(norm(toNext), r));

    parts.push(`${parts.length === 0 ? "M" : "L"} ${r2(start[0])} ${r2(start[1])}`);
    parts.push(`Q ${r2(here[0])} ${r2(here[1])} ${r2(end[0])} ${r2(end[1])}`);
  }

  return parts.join(" ") + " Z";
}

/** An open path, for creases and thickness edges. */
export function edgePath(points: Vec[], rounding: number[] = []): string {
  if (points.length < 2) return "";
  const parts: string[] = [`M ${r2(points[0][0])} ${r2(points[0][1])}`];

  for (let i = 1; i < points.length; i++) {
    const here = points[i];
    const r = rounding[i] ?? 0;
    if (r <= 0.5 || i === points.length - 1) {
      parts.push(`L ${r2(here[0])} ${r2(here[1])}`);
      continue;
    }
    const next = points[i + 1];
    const prev = points[i - 1];
    const start = add(here, scale(norm(sub(prev, here)), Math.min(r, len(sub(prev, here)) * 0.49)));
    const end = add(here, scale(norm(sub(next, here)), Math.min(r, len(sub(next, here)) * 0.49)));
    parts.push(`L ${r2(start[0])} ${r2(start[1])}`);
    parts.push(`Q ${r2(here[0])} ${r2(here[1])} ${r2(end[0])} ${r2(end[1])}`);
  }
  return parts.join(" ");
}

/** Axis-aligned extent of a set of points. */
export function bounds(points: Vec[]): { x: number; y: number; w: number; h: number } {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
}

/** Rotates points about a centre. Used to give each part its own orientation. */
export function rotate(points: Vec[], deg: number, about: Vec): Vec[] {
  const a = (deg * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  return points.map(([x, y]) => {
    const dx = x - about[0];
    const dy = y - about[1];
    return [about[0] + dx * cos - dy * sin, about[1] + dx * sin + dy * cos] as Vec;
  });
}

export function translate(points: Vec[], dx: number, dy: number): Vec[] {
  return points.map(([x, y]) => [x + dx, y + dy] as Vec);
}

/**
 * A closed ring of points around a centre, with per-step radius and angle
 * jitter supplied by the caller. Used to lay out an irregular mass quickly
 * without reaching for an ellipse.
 */
export function ring(cx: number, cy: number, radii: number[], startDeg = -90): Vec[] {
  const n = radii.length;
  return radii.map((r, i) => {
    const a = ((startDeg + (360 * i) / n) * Math.PI) / 180;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as Vec;
  });
}

/** Do two outlines overlap? A cheap separating-axis test on their extents. */
export function extentsOverlap(a: Vec[], b: Vec[]): boolean {
  const ba = bounds(a);
  const bb = bounds(b);
  return !(ba.x + ba.w < bb.x || bb.x + bb.w < ba.x || ba.y + ba.h < bb.y || bb.y + bb.h < ba.y);
}
