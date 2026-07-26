import type { Node, Link, Slab } from "../organic/types";
import type { Rng } from "../random/seeded-random";
import { chain, ringPoints, type Part } from "../organic/grow";

const fromChain = (id: string, pts: Array<[number,number,number]>, r: (t:number)=>number, tone?: "a"|"b"): Build => { const pp = chain(id, pts, r, tone); return { nodes: pp.nodes, links: pp.links, slabs: [] }; };
const ringPointsLocal = ringPoints;
const fromPartLocal = (pp: Part): Build => ({ nodes: pp.nodes, links: pp.links, slabs: [] });

/**
 * A WIDER PART VOCABULARY.
 *
 * The renderer knows two things: a run of thicknesses (nodes joined by links)
 * and a rounded box (a slab). Everything the brief asks for that is missing —
 * curved plates, thick rings, half-rings, wedges, kinked beams, flattened
 * ellipsoids, stepped plates, hollow boxes — can be assembled from those two
 * without touching the renderer, which is the point: new shapes, same drawing
 * language.
 *
 * Each of these returns Parts and Slabs the caller merges into a form. None of
 * them is a whole individual; they are the words the twelve categories are
 * written in.
 */

export type Build = { nodes: Node[]; links: Link[]; slabs: Slab[] };

export const empty = (): Build => ({ nodes: [], links: [], slabs: [] });

export function combine(...parts: Build[]): Build {
  return {
    nodes: parts.flatMap((p) => p.nodes),
    links: parts.flatMap((p) => p.links),
    slabs: parts.flatMap((p) => p.slabs),
  };
}

const fromPart = (p: Part): Build => ({ nodes: p.nodes, links: p.links, slabs: [] });

/** A curved plate: a run swept along an arc, thin in one axis so it reads as a
 *  sheet rather than a tube. */
export function curvedPlate(
  id: string,
  centre: [number, number, number],
  radius: number,
  fromDeg: number,
  toDeg: number,
  thickness: number,
  plane: "xy" | "xz" | "yz",
  steps = 7,
  tone?: "a" | "b",
): Build {
  const pts: Array<[number, number, number]> = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = ((fromDeg + (toDeg - fromDeg) * t) * Math.PI) / 180;
    const u = Math.cos(a) * radius;
    const v = Math.sin(a) * radius;
    if (plane === "xy") pts.push([centre[0] + u, centre[1] + v, centre[2]]);
    else if (plane === "xz") pts.push([centre[0] + u, centre[1], centre[2] + v]);
    else pts.push([centre[0], centre[1] + u, centre[2] + v]);
  }
  return fromPart(chain(id, pts, () => thickness, tone));
}

/** A thick ring: a closed run swept full circle, its thickness the tube's radius. */
export function thickRing(
  id: string,
  centre: [number, number, number],
  radius: number,
  thickness: number,
  plane: "xy" | "xz" | "yz",
  tone?: "a" | "b",
  steps = 10,
): Build {
  const pts = ringPoints(centre, radius, steps, plane);
  const p = chain(id, pts, () => thickness, tone);
  p.links.push({ a: `${id}-${steps - 1}`, b: `${id}-0`, tone });
  return fromPart(p);
}

/** A half ring: an arc that stops, thicker at the base than the tips. */
export function halfRing(
  id: string,
  centre: [number, number, number],
  radius: number,
  thickBase: number,
  thickTip: number,
  plane: "xy" | "xz" | "yz",
  startDeg = 0,
  tone?: "a" | "b",
): Build {
  const pts: Array<[number, number, number]> = [];
  const steps = 7;
  for (let i = 0; i <= steps; i++) {
    const a = ((startDeg + 180 * (i / steps)) * Math.PI) / 180;
    const u = Math.cos(a) * radius;
    const v = Math.sin(a) * radius;
    if (plane === "xy") pts.push([centre[0] + u, centre[1] + v, centre[2]]);
    else if (plane === "xz") pts.push([centre[0] + u, centre[1], centre[2] + v]);
    else pts.push([centre[0], centre[1] + u, centre[2] + v]);
  }
  return fromPart(chain(id, pts, (t) => thickTip + (thickBase - thickTip) * Math.sin(t * Math.PI), tone));
}

/** A wedge: a slab that tapers to nothing along its length, made from a short
 *  run whose radius falls to a point. */
export function wedge(
  id: string,
  from: [number, number, number],
  to: [number, number, number],
  thickBase: number,
  tone?: "a" | "b",
): Build {
  return fromPart(chain(id, [from, to], (t) => thickBase * (1 - t) + 0.12, tone));
}

/** A kinked beam: two straight runs meeting at an angle, one continuous body. */
export function kinkedBeam(
  id: string,
  a: [number, number, number],
  bend: [number, number, number],
  c: [number, number, number],
  thickness: number,
  tone?: "a" | "b",
): Build {
  return fromPart(chain(id, [a, bend, c], () => thickness, tone));
}

/** A flattened ellipsoid: a single node stretched, approximated by a short
 *  fat run so the renderer's disc-hull gives it a squashed profile. */
export function flatLump(
  id: string,
  centre: [number, number, number],
  long: number,
  thick: number,
  dir: [number, number, number],
  tone?: "a" | "b",
): Build {
  const n = Math.hypot(...dir) || 1;
  const u = dir.map((v) => (v / n) * long * 0.5) as [number, number, number];
  return fromPart(
    chain(
      id,
      [
        [centre[0] - u[0], centre[1] - u[1], centre[2] - u[2]],
        [centre[0] + u[0], centre[1] + u[1], centre[2] + u[2]],
      ],
      () => thick,
      tone,
    ),
  );
}

/** A stepped plate: two flat slabs, the upper smaller and offset — a plate with
 *  a lip or a shelf. */
export function steppedPlate(
  base: [number, number, number],
  w: number,
  d: number,
  h: number,
  step: number,
  tone?: "a" | "b",
): Build {
  const [x, y, z] = base;
  return {
    nodes: [],
    links: [],
    slabs: [
      { x, y, z, w, d, h, round: 0.3, tone },
      { x: x + step, y: y + step * 0.6, z: z + h, w: w - step * 2, d: d - step * 1.2, h: h * 0.6, round: 0.26, tone: tone === "a" ? "b" : "a" },
    ],
  };
}

/** A short tube: a thick ring seen as a cylinder — a ring in the xz/yz plane
 *  with a small radius reads as a stubby pipe. */
export function shortTube(
  id: string,
  centre: [number, number, number],
  radius: number,
  length: number,
  axis: "x" | "y" | "z",
  tone?: "a" | "b",
): Build {
  const half = length / 2;
  const a: [number, number, number] =
    axis === "x" ? [centre[0] - half, centre[1], centre[2]] : axis === "y" ? [centre[0], centre[1] - half, centre[2]] : [centre[0], centre[1], centre[2] - half];
  const b: [number, number, number] =
    axis === "x" ? [centre[0] + half, centre[1], centre[2]] : axis === "y" ? [centre[0], centre[1] + half, centre[2]] : [centre[0], centre[1], centre[2] + half];
  return fromPart(chain(id, [a, b], () => radius, tone));
}

/** A hollow box: four slabs framing an opening, so the middle is empty. */
export function hollowBox(
  base: [number, number, number],
  w: number,
  d: number,
  h: number,
  wall: number,
  tone?: "a" | "b",
): Build {
  const [x, y, z] = base;
  return {
    nodes: [],
    links: [],
    slabs: [
      { x, y, z, w, d, h: wall, round: 0.24, tone },
      { x, y, z: z + h - wall, w, d, h: wall, round: 0.24, tone },
      { x, y, z: z + wall, w: wall, d, h: h - wall * 2, round: 0.24, tone },
      { x: x + w - wall, y, z: z + wall, w: wall, d, h: h - wall * 2, round: 0.24, tone },
    ],
  };
}

/** A forked member: one run that splits into two, as a single fused body. */
export function fork(
  id: string,
  root: [number, number, number],
  tipA: [number, number, number],
  tipB: [number, number, number],
  thickness: number,
  tone?: "a" | "b",
): Build {
  const mid: [number, number, number] = [
    root[0] + (tipA[0] + tipB[0]) / 2 * 0.4 - root[0] * 0.4,
    root[1] + (tipA[1] + tipB[1]) / 2 * 0.4 - root[1] * 0.4,
    root[2] + (tipA[2] + tipB[2]) / 2 * 0.4 - root[2] * 0.4,
  ];
  const stem = chain(`${id}-s`, [root, mid], () => thickness, tone);
  const armA = chain(`${id}-a`, [mid, tipA], (t) => thickness * (1 - 0.3 * t), tone);
  const armB = chain(`${id}-b`, [mid, tipB], (t) => thickness * (1 - 0.3 * t), tone);
  return combine(fromPart(stem), fromPart(armA), fromPart(armB), {
    nodes: [],
    links: [
      { a: `${id}-s-1`, b: `${id}-a-0`, tone },
      { a: `${id}-s-1`, b: `${id}-b-0`, tone },
    ],
    slabs: [],
  });
}

/** A box: the plain rounded cuboid, named for completeness. */
export function box(base: [number, number, number], w: number, d: number, h: number, round = 0.3, tone?: "a" | "b"): Build {
  return { nodes: [], links: [], slabs: [{ x: base[0], y: base[1], z: base[2], w, d, h, round, tone }] };
}

/** A single node, for a ball or a small mass. */
export function ball(id: string, c: [number, number, number], r: number, tone?: "a" | "b"): Build {
  return { nodes: [{ id, x: c[0], y: c[1], z: c[2], r, tone }], links: [], slabs: [] };
}

/* ── Intermediate shapes for the second set ──────────────────────────────
 * The brief for the second twelve asks specifically for in-between forms:
 * box↔curved-plate, cylinder↔prism, a ring thicker on one side, a beam that
 * bends in two directions. These are thin wrappers over the primitives above,
 * kept here so the categories file reads as structure, not geometry. */

/** A beam that bends twice, in two different planes — an S in space. */
export function doubleBend(
  id: string,
  a: [number, number, number],
  b: [number, number, number],
  c: [number, number, number],
  dd: [number, number, number],
  thickness: number,
  tone?: "a" | "b",
): Build {
  return fromChain(id, [a, b, c, dd], () => thickness, tone);
}

/** A ring whose thickness varies round its circumference — thick on one side. */
export function lopsidedRing(
  id: string,
  centre: [number, number, number],
  radius: number,
  thickMax: number,
  thickMin: number,
  plane: "xy" | "xz" | "yz",
  tone?: "a" | "b",
  steps = 12,
): Build {
  const pts = ringPointsLocal(centre, radius, steps, plane);
  const p = chain(id, pts, (t) => thickMin + (thickMax - thickMin) * (0.5 + 0.5 * Math.cos(t * Math.PI * 2)), tone);
  p.links.push({ a: `${id}-${steps - 1}`, b: `${id}-0`, tone });
  return fromPartLocal(p);
}

/** A plate that lifts off the ground along its length — flat at one end,
 *  standing at the other. */
export function risingPlane(
  id: string,
  from: [number, number, number],
  to: [number, number, number],
  lift: number,
  thickness: number,
  tone?: "a" | "b",
): Build {
  const mid: [number, number, number] = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, from[2] + lift * 0.5];
  const end: [number, number, number] = [to[0], to[1], to[2] + lift];
  return fromChain(id, [from, mid, end], (t) => thickness * (1 - 0.2 * t), tone);
}
