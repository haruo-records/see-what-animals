import type { Rng } from "../random/seeded-random";
import {
  combine,
  box,
  ball,
  curvedPlate,
  thickRing,
  halfRing,
  wedge,
  kinkedBeam,
  flatLump,
  steppedPlate,
  shortTube,
  hollowBox,
  fork,
  doubleBend,
  lopsidedRing,
  risingPlane,
  type Build,
} from "./parts";

/**
 * A SECOND TWELVE.
 *
 * The first set covered single overall configurations — one cantilever, one
 * ring, one stack. This set is about relationships between parts: a member that
 * supports several at once, a connection that happens in two stages, a body that
 * pierces and then rejoins. Each individual still has at most two structural
 * ideas; the extra complexity is in how parts relate, not in how many there are.
 *
 * Every category here is checked against the first set for silhouette and
 * connection so none is a recolour or rotation of an existing one.
 */

export type Category = {
  n: number;
  name: string;
  main: string;
  build: (rng: Rng) => Build;
};

const A = "a" as const;
const B = "b" as const;

/* 1 — TWISTED RING. A closed loop that does not lie in one plane: it rises out
 *     of its own plane on one side, so the ring is also a spiral of one turn. */
const twistedRing = (rng: Rng): Build => {
  const R = rng.float(5.5, 6.8);
  const twist = rng.float(2.5, 4);
  // A short tube threaded where the loop passes nearest itself.
  const cross = shortTube("cr", [R * 0.2, 0, twist * 0.5], rng.float(1.2, 1.6), rng.float(4, 5), "y", B);
  return combine(twistedLoop(R, twist, rng), cross);
};

function twistedLoop(R: number, twist: number, rng: Rng): Build {
  const steps = 16;
  const pts: Array<[number, number, number]> = [];
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    pts.push([Math.cos(t) * R, Math.sin(t) * R * 0.78, Math.sin(t * 2) * twist]);
  }
  // chain through all, then close
  const parts: Build[] = [];
  const th = rng.float(1.8, 2.4);
  for (let i = 0; i < steps; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % steps];
    parts.push(shortTubeBetween(`tl-${i}`, a, b, th, A));
  }
  return combine(...parts);
}

function shortTubeBetween(id: string, a: [number, number, number], b: [number, number, number], r: number, tone: "a" | "b"): Build {
  return capsuleBuild(id, a, b, r, tone);
}
function capsuleBuild(id: string, a: [number, number, number], b: [number, number, number], r: number, tone: "a" | "b"): Build {
  return {
    nodes: [
      { id: `${id}-0`, x: a[0], y: a[1], z: a[2], r, tone },
      { id: `${id}-1`, x: b[0], y: b[1], z: b[2], r, tone },
    ],
    links: [{ a: `${id}-0`, b: `${id}-1`, tone }],
    slabs: [],
  };
}

/* 2 — DOUBLE CANTILEVER. Two arms reach out from one root in different
 *     directions and at different heights; neither is supported at its far end. */
const doubleCantilever = (rng: Rng): Build => {
  const root = box([-2, -2, -5], 4, 4, rng.float(4, 5.5), 0.4, A);
  const upper = kinkedBeam("u", [0, 0, rng.float(2, 3)], [rng.float(3, 5), rng.float(-1, 1), rng.float(3, 4)], [rng.float(7, 9), rng.float(-2, 2), rng.float(2, 4)], rng.float(1.6, 2.2), A);
  const lower = kinkedBeam("l", [0, 0, rng.float(-1, 0)], [rng.float(-4, -2), rng.float(1, 3), rng.float(-1, 1)], [rng.float(-8, -6), rng.float(2, 4), rng.float(-2, 0)], rng.float(1.4, 2.0), A);
  // Each arm ends in a different termination — one a flat mass, one a hollow tube.
  const endU = flatLump("eu", [rng.float(7, 9), rng.float(-2, 2), rng.float(2, 4)], rng.float(3, 4), rng.float(2, 3), [0.3, 1, 0.2], B);
  const endL = shortTube("el", [rng.float(-8, -6), rng.float(2, 4), rng.float(-2, 0)], rng.float(1.4, 1.8), rng.float(3, 4), "z", B);
  return combine(root, upper, lower, endU, endL);
};

/* 3 — CROSSED CAVITY. A large opening with a member running straight across the
 *     inside of it, dividing the void. */
const crossedCavity = (rng: Rng): Build => {
  const R = rng.float(6, 7);
  const ring = thickRing("r", [0, 0, 0], R, rng.float(1.8, 2.4), "xz", A, 12);
  // A bar straight across the hole, off the diameter so it is not symmetrical.
  const off = rng.float(-2, 2);
  const bar = shortTube("bar", [0, 0, off], rng.float(1.1, 1.5), R * 2.1, "x", B);
  // Where the bar meets the rim, a small collar joins them — two-stage join.
  const collar = ball("c", [Math.cos(0) * R * 0.95, 0, off], rng.float(1.4, 1.8), A);
  return combine(ring, bar, collar);
};

/* 4 — MULTI-HEIGHT MUTUAL SUPPORT. Three members leaning together, meeting at
 *     different heights, so the support is stepped rather than a simple tripod. */
const multiHeight = (rng: Rng): Build => {
  const a = kinkedBeam("a", [-4, -2, -5], [-1, 0, 0], [rng.float(-1, 1), rng.float(-1, 1), rng.float(5, 6)], rng.float(1.6, 2.2), A);
  const b = kinkedBeam("b", [4, 1, -5], [1, 0, -1], [rng.float(-1, 1), rng.float(-1, 1), rng.float(2.5, 3.5)], rng.float(1.6, 2.2), A);
  const c = kinkedBeam("c", [0, 4, -5], [0, 1, 1], [rng.float(-1, 1), rng.float(-1, 1), rng.float(3.5, 4.5)], rng.float(1.4, 2.0), B);
  // The three are tied where they cross by a small curved plate, not a ball.
  const tie = curvedPlate("t", [0, 0, rng.float(3, 4)], rng.float(1.6, 2.2), 10, 200, rng.float(0.9, 1.3), "xy", 6, B);
  return combine(a, b, c, tie);
};

/* 5 — BIG PLATE, SMALL HOLLOW. A large curved plate dominates; a small hollow
 *     tube nests into its concave side and reads only in relation to it. */
const plateAndHollow = (rng: Rng): Build => {
  const plate = curvedPlate("p", [0, 0, 0], rng.float(7, 8.5), rng.float(-70, -40), rng.float(60, 90), rng.float(1.0, 1.4), "xz", 9, A);
  // The small part sits in the cup of the plate, a short tube seen end-on.
  const hollow = combine(
    shortTube("h", [rng.float(-1, 1), rng.float(2, 3), rng.float(0, 2)], rng.float(1.4, 1.8), rng.float(2.5, 3.5), "y", B),
    ball("hc", [rng.float(-1, 1), rng.float(2, 3), rng.float(0, 2)], rng.float(0.9, 1.2), A),
  );
  // A wedge bracing the plate so it does not read as free-floating.
  const brace = wedge("br", [rng.float(-5, -3), 0, rng.float(-4, -2)], [0, 0, 0], rng.float(1.8, 2.4), B);
  return combine(plate, hollow, brace);
};

/* 6 — FOLDED-BACK. A plane that folds back on itself, so the back face shows
 *     beside the front — one body, two facings. */
const foldedBack = (rng: Rng): Build => {
  // The fold is one continuous run that reverses direction.
  const w = rng.float(1.0, 1.4);
  const front = risingPlane("f", [-5, rng.float(-1, 1), -3], [3, rng.float(-1, 1), 1], rng.float(3, 4), rng.float(2.2, 3), A);
  const back = risingPlane("b", [3, rng.float(-1, 1), rng.float(2, 4)], [-2, rng.float(-1, 1), rng.float(4, 6)], rng.float(-1, -2), rng.float(1.8, 2.6), B);
  // A short join at the fold, thinner, so the reversal reads as a crease.
  const crease = shortTube("cr", [3, 0, rng.float(1.5, 3)], rng.float(0.8, 1.1), rng.float(3, 4), "y", A);
  return combine(front, back, crease);
};

/* 7 — TWO MASSES, A THIRD RELATES THEM. Two separate bodies, held in relation
 *     by a small third part that touches neither the way they touch each other. */
const relatedPair = (rng: Rng): Build => {
  const gap = rng.float(7, 9);
  const m1 = flatLump("m1", [-gap / 2, rng.float(-1, 1), 0], rng.float(5, 6), rng.float(3, 4), [0.4, 1, 0.2], A);
  const m2 = box([gap / 2 - 2, rng.float(-1, 1) - 2, -2.5], rng.float(3.5, 4.5), 4, 5, 0.4, A);
  // The third part is small, offset from the line between them, and reaches to
  // each with a thin neck — the relation, not a bridge.
  const hub = ball("h", [rng.float(-1, 1), rng.float(3, 5), rng.float(1, 3)], rng.float(1.3, 1.7), B);
  const n1 = shortTubeBetween("n1", [rng.float(-1, 1), rng.float(3, 5), rng.float(1, 3)], [-gap / 2 + 1, 0, 1], 0.5, B);
  const n2 = shortTubeBetween("n2", [rng.float(-1, 1), rng.float(3, 5), rng.float(1, 3)], [gap / 2 - 1, 0, 1], 0.5, B);
  return combine(m1, m2, hub, n1, n2);
};

/* 8 — SIMPLE OUTLINE, COMPLEX INSIDE. A plain outer silhouette (a single mass)
 *     with an intricate internal connection visible through an opening. */
const simpleOutside = (rng: Rng): Build => {
  // Outer: a plain hollow box, calm silhouette.
  const shell = hollowBox([-3.5, -3, -3.5], 7, 6, 7, rng.float(1.3, 1.7), A);
  // Inside: two short tubes crossing and a ball where they meet — the eye stops
  // here, but the outline stays simple.
  const t1 = shortTube("t1", [0, 0, rng.float(-1, 1)], rng.float(0.8, 1.1), rng.float(5, 6), "x", B);
  const t2 = shortTube("t2", [rng.float(-1, 1), 0, 0], rng.float(0.8, 1.1), rng.float(5, 6), "z", B);
  const knot = ball("k", [0, 0, 0], rng.float(1.4, 1.8), A);
  return combine(shell, t1, t2, knot);
};

/* 9 — NARROW BASE, BRANCHING TOP. A small footing from which the body opens out
 *     in several directions high up. */
const branchingTop = (rng: Rng): Build => {
  const base = box([-1.4, -1.4, -6], 2.8, 2.8, 2.4, 0.4, A);
  const stem = shortTube("s", [0, 0, -3.5], rng.float(1.3, 1.7), rng.float(4, 5), "z", B);
  // From the top, a fork opening into three, at different heights.
  const top: [number, number, number] = [0, 0, rng.float(1, 2)];
  const f = fork("f", top, [rng.float(3, 5), rng.float(-1, 1), rng.float(3, 5)], [rng.float(-5, -3), rng.float(-1, 1), rng.float(2, 4)], rng.float(1.4, 1.9), A);
  const third = kinkedBeam("t3", top, [rng.float(-1, 1), rng.float(3, 4), rng.float(2, 3)], [rng.float(-1, 1), rng.float(5, 7), rng.float(3, 5)], rng.float(1.2, 1.7), A);
  const tip = flatLump("tp", [rng.float(3, 5), rng.float(-1, 1), rng.float(3, 5)], rng.float(2.5, 3.5), rng.float(1.8, 2.4), [1, 0.2, 0.3], B);
  return combine(base, stem, f, third, tip);
};

/* 10 — LOW SPREAD, RAISED CENTRE. Weight along the ground, but the middle lifts
 *     into a single raised feature. */
const raisedCentre = (rng: Rng): Build => {
  const span = rng.float(12, 15);
  const bed = kinkedBeam("bd", [-span / 2, rng.float(-1, 1), -3], [0, rng.float(-2, 2), -3], [span / 2, rng.float(-1, 1), -3], rng.float(2.4, 3.2), A);
  // The centre rises: a curved plate arcing up from the bed, thick.
  const arch = halfRing("ar", [0, 0, -3], rng.float(3.5, 4.5), rng.float(2, 2.6), rng.float(1.4, 1.9), "xz", 0, A);
  // One small hollow at the crown, so the peak has a feature.
  const crown = shortTube("cr", [0, rng.float(-1, 1), rng.float(2, 3.5)], rng.float(1.1, 1.5), rng.float(2.5, 3.5), "y", B);
  return combine(bed, arch, crown);
};

/* 11 — MESHED AT ONE POINT. Several members all engaging at a single place,
 *     interlocking there rather than merely meeting. */
const meshed = (rng: Rng): Build => {
  const c: [number, number, number] = [0, 0, 0];
  // Four members converging, each entering the knot at a different height and
  // angle, and each a different section.
  const members: Build[] = [];
  const dirs: Array<[number, number, number]> = [
    [rng.float(5, 7), rng.float(-1, 1), rng.float(-3, -1)],
    [rng.float(-6, -4), rng.float(1, 3), rng.float(1, 3)],
    [rng.float(-1, 1), rng.float(-6, -4), rng.float(2, 4)],
    [rng.float(1, 3), rng.float(4, 6), rng.float(-3, -1)],
  ];
  members.push(shortTubeBetween("m0", c, dirs[0], 1.6, A));
  members.push(shortTubeBetween("m1", c, dirs[1], 1.4, A));
  members.push(shortTubeBetween("m2", c, dirs[2], 1.5, B));
  members.push(kinkedBeam("m3", c, [dirs[3][0] * 0.5, dirs[3][1] * 0.5, 1], dirs[3], 1.3, B));
  // Terminations differ, so the four are not a symmetric star.
  const ends = combine(
    flatLump("e0", dirs[0], 3, 2, [1, 0.2, 0.4], B),
    ball("e1", dirs[1], 1.7, A),
    box([dirs[2][0] - 1.4, dirs[2][1] - 1.4, dirs[2][2] - 1.4], 2.8, 2.8, 2.8, 0.4, A),
  );
  // The knot itself: a lopsided thick ring binding them.
  const knot = lopsidedRing("k", c, rng.float(2, 2.6), rng.float(1.6, 2.0), rng.float(0.8, 1.1), "xy", A, 10);
  return combine(...members, ends, knot);
};

/* 12 — FLOWING, THEN REJOINING. A body that streams one way, splits, and the
 *     two streams come back together further along. */
const flowRejoin = (rng: Rng): Build => {
  const start: [number, number, number] = [-7, rng.float(-1, 1), rng.float(-1, 1)];
  const split: [number, number, number] = [-3, rng.float(-1, 1), 0];
  const merge: [number, number, number] = [4, rng.float(-1, 1), rng.float(-1, 1)];
  const end: [number, number, number] = [rng.float(7, 9), rng.float(-1, 1), rng.float(-1, 1)];
  const inflow = shortTubeBetween("in", start, split, rng.float(2, 2.6), A);
  // Two arcs bowing out to different sides, one higher.
  const armA = kinkedBeam("aa", split, [0, rng.float(-4, -2), rng.float(1, 3)], merge, rng.float(1.4, 1.9), A);
  const armB = kinkedBeam("ab", split, [0, rng.float(2, 4), rng.float(-2, 0)], merge, rng.float(1.4, 1.9), A);
  const outflow = shortTubeBetween("out", merge, end, rng.float(1.8, 2.4), A);
  // At the merge, a swelling where they rejoin; at the end, a hollow.
  const knot = flatLump("k", merge, rng.float(3, 4), rng.float(2.2, 2.8), [1, 0.3, 0.2], B);
  const cap = shortTube("cap", end, rng.float(1.3, 1.7), rng.float(2.5, 3.5), "z", B);
  return combine(inflow, armA, armB, outflow, knot, cap);
};

export const CATEGORIES_B: Category[] = [
  { n: 1, name: "twisted ring", main: "a loop lifted out of its plane", build: twistedRing },
  { n: 2, name: "double cantilever", main: "two unsupported arms from one root", build: doubleCantilever },
  { n: 3, name: "crossed cavity", main: "a member across a large opening", build: crossedCavity },
  { n: 4, name: "multi-height support", main: "three members meeting at stepped heights", build: multiHeight },
  { n: 5, name: "plate and hollow", main: "a small hollow nested in a big plate", build: plateAndHollow },
  { n: 6, name: "folded back", main: "a plane folded to show its back", build: foldedBack },
  { n: 7, name: "related pair", main: "a third part relating two masses", build: relatedPair },
  { n: 8, name: "simple outside", main: "plain outline, complex interior", build: simpleOutside },
  { n: 9, name: "branching top", main: "narrow base, top opening several ways", build: branchingTop },
  { n: 10, name: "raised centre", main: "low spread lifting at the middle", build: raisedCentre },
  { n: 11, name: "meshed point", main: "several members interlocking at one place", build: meshed },
  { n: 12, name: "flow rejoin", main: "a stream that splits and comes back", build: flowRejoin },
];
