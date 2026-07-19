import type { Vec } from "./types";

/**
 * GROWTH AND ORDER.
 *
 * Two ideas live here, and the order of them is the point.
 *
 * FIRST, ORDER. Living things are not arbitrary. They are bilateral, or
 * radial, or segmented, or spiralled, and they grew in a direction. The
 * previous prototypes went straight to asymmetry, on the reasoning that
 * symmetry looks manufactured — but arbitrary form does not read as alive
 * either, it reads as debris. What reads as alive is an order with something
 * that happened to it.
 *
 * SECOND, THE BREAK. Every generator here takes an index to spoil: the arm
 * that stayed short, the segment that swelled, the spiral that stopped early.
 * One deviation in an otherwise kept order says more than a hundred random
 * differences, because the order is what lets the deviation be noticed.
 *
 * The forms themselves are grown rather than assembled: a limb is a path with
 * a width that changes along it, a lobe is a closed run of radii. Neither has
 * a seam, and both go through the same smooth curve, so a body made of several
 * of them reads as one material that did different things in different places.
 */

/** A closed organic mass: radii around a centre, smoothed into a curve. */
export function lobe(cx: number, cy: number, radii: number[], startDeg = -90): Vec[] {
  const n = radii.length;
  return radii.map((r, i) => {
    const a = ((startDeg + (360 * i) / n) * Math.PI) / 180;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as Vec;
  });
}

/**
 * A limb: a centreline with a half-width that varies along it, closed into one
 * outline. Grown, not jointed — the width is a profile, so a limb can leave a
 * body thick and arrive somewhere else thin without anything being attached.
 */
export function limb(
  spine: Vec[],
  widthAt: (t: number) => number,
  options: { capSteps?: number } = {},
): Vec[] {
  const capSteps = options.capSteps ?? 3;
  const left: Vec[] = [];
  const right: Vec[] = [];

  for (let i = 0; i < spine.length; i++) {
    const prev = spine[Math.max(0, i - 1)];
    const next = spine[Math.min(spine.length - 1, i + 1)];
    const tx = next[0] - prev[0];
    const ty = next[1] - prev[1];
    const l = Math.hypot(tx, ty) || 1;
    const w = widthAt(spine.length === 1 ? 0 : i / (spine.length - 1));
    left.push([spine[i][0] - (ty / l) * w, spine[i][1] + (tx / l) * w]);
    right.push([spine[i][0] + (ty / l) * w, spine[i][1] - (tx / l) * w]);
  }

  // A few points swept around each end, so the tip is a rounded end rather
  // than the pinch a bare reversal would leave.
  const cap = (centre: Vec, from: Vec, to: Vec): Vec[] => {
    const a0 = Math.atan2(from[1] - centre[1], from[0] - centre[0]);
    let a1 = Math.atan2(to[1] - centre[1], to[0] - centre[0]);
    while (a1 < a0) a1 += Math.PI * 2;
    const r = Math.hypot(from[0] - centre[0], from[1] - centre[1]);
    const out: Vec[] = [];
    for (let i = 1; i < capSteps; i++) {
      const a = a0 + ((a1 - a0) * i) / capSteps;
      out.push([centre[0] + Math.cos(a) * r, centre[1] + Math.sin(a) * r]);
    }
    return out;
  };

  const head = spine[spine.length - 1];
  const tail = spine[0];
  return [
    ...left,
    ...cap(head, left[left.length - 1], right[right.length - 1]),
    ...right.slice().reverse(),
    ...cap(tail, right[0], left[0]),
  ];
}

/**
 * A ray that leaves a centre and curves as it goes: radius AND angle advance
 * together. An arc at fixed radius orbits its centre and never approaches it,
 * which is a blade going round a body, not a fin growing out of one.
 */
export function raySpine(
  cx: number,
  cy: number,
  fromRadius: number,
  toRadius: number,
  headingDeg: number,
  sweepDeg: number,
  steps = 7,
): Vec[] {
  const out: Vec[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const r = fromRadius + (toRadius - fromRadius) * t;
    const a = ((headingDeg + sweepDeg * t) * Math.PI) / 180;
    out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return out;
}

/** An arc of centreline points — for a band that wraps rather than radiates. */
export function arcSpine(
  cx: number,
  cy: number,
  radius: number,
  fromDeg: number,
  toDeg: number,
  steps = 7,
): Vec[] {
  const out: Vec[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = ((fromDeg + ((toDeg - fromDeg) * i) / steps) * Math.PI) / 180;
    out.push([cx + Math.cos(a) * radius, cy + Math.sin(a) * radius]);
  }
  return out;
}

export function rotatePoints(points: Vec[], deg: number, about: Vec): Vec[] {
  const a = (deg * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  return points.map(([x, y]) => {
    const dx = x - about[0];
    const dy = y - about[1];
    return [about[0] + dx * cos - dy * sin, about[1] + dx * sin + dy * cos] as Vec;
  });
}

/** Reflection across a vertical axis. Winding reverses, which is harmless here. */
export function mirrorPoints(points: Vec[], axisX: number): Vec[] {
  return points.map(([x, y]) => [2 * axisX - x, y] as Vec);
}

export function movePoints(points: Vec[], dx: number, dy: number): Vec[] {
  return points.map(([x, y]) => [x + dx, y + dy] as Vec);
}

export function scalePoints(points: Vec[], k: number, about: Vec): Vec[] {
  return points.map(([x, y]) => [about[0] + (x - about[0]) * k, about[1] + (y - about[1]) * k] as Vec);
}

/**
 * `count` copies around a centre, with one of them spoiled.
 *
 * `spoil` receives the index and returns a scale for that ray: return 1 to keep
 * the order, less to leave a ray short. One short ray in a radial body is the
 * clearest form the "order, then one deviation" idea takes.
 */
export function radialCopies(
  points: Vec[],
  count: number,
  centre: Vec,
  spoil: (index: number) => number = () => 1,
  startDeg = 0,
): Vec[][] {
  const out: Vec[][] = [];
  for (let i = 0; i < count; i++) {
    const k = spoil(i);
    const scaled = k === 1 ? points : scalePoints(points, k, centre);
    out.push(rotatePoints(scaled, startDeg + (360 * i) / count, centre));
  }
  return out;
}

/**
 * A run of repeats along a path, each transformed by `at`. Segmentation with
 * one node out of step is how a repeated body shows that time passed while it
 * was being made.
 */
export function series(
  count: number,
  at: (index: number, t: number) => Vec[],
): Vec[][] {
  const out: Vec[][] = [];
  for (let i = 0; i < count; i++) out.push(at(i, count === 1 ? 0 : i / (count - 1)));
  return out;
}

/**
 * A spiral centreline that can be stopped before it finishes. A spiral halted
 * partway is a growth that ran out of whatever it was using.
 */
export function spiralSpine(
  cx: number,
  cy: number,
  startRadius: number,
  endRadius: number,
  turns: number,
  steps = 18,
  startDeg = 0,
): Vec[] {
  const out: Vec[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = ((startDeg + turns * 360 * t) * Math.PI) / 180;
    const r = startRadius + (endRadius - startRadius) * t;
    out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return out;
}
