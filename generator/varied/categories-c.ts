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
  shortTube,
  hollowBox,
  fork,
  type Build,
} from "./parts";

/**
 * A THIRD GENERATION.
 *
 * Set A and set B between them showed which structures read as one animal and
 * which fall apart into a big lump with things stuck to it. The weak ones all
 * measured the same way: a single part carrying most of the mass, and parts
 * held together by proximity rather than by real connection. The strong ones
 * were the opposite — mass spread across parts, and a dense web of actual joins.
 *
 * So this generation is built to two rules, by construction rather than by
 * hoping:
 *   - link density (links per node) ≥ ~0.6, so parts are genuinely connected;
 *   - no single part over ~half the mass, so nothing is a lump with add-ons.
 *
 * The middle-band types — big plate plus a small hollow, two masses joined only
 * by a thin relater, a plain outline around an unrelated interior — are gone.
 * The through / mutual-support / cavity-crossed / branching directions, which
 * were the strong ones, are the stock this is grown from.
 */

export type Category = {
  n: number;
  name: string;
  main: string;
  build: (rng: Rng) => Build;
};

const A = "a" as const;
const B = "b" as const;

/** A capsule between two points — the connective tissue these forms are made of. */
function strut(id: string, a: [number, number, number], b: [number, number, number], r: number, tone: "a" | "b"): Build {
  return {
    nodes: [
      { id: `${id}0`, x: a[0], y: a[1], z: a[2], r, tone },
      { id: `${id}1`, x: b[0], y: b[1], z: b[2], r, tone },
    ],
    links: [{ a: `${id}0`, b: `${id}1`, tone }],
    slabs: [],
  };
}

/** A closed ring as a real chain of struts, so it is one connected body. */
function ring(id: string, centre: [number, number, number], R: number, th: number, plane: "xy" | "xz" | "yz", tone: "a" | "b", steps = 12, warp = 0): Build {
  const pt = (i: number): [number, number, number] => {
    const t = (i / steps) * Math.PI * 2;
    const u = Math.cos(t) * R;
    const v = Math.sin(t) * R;
    const w = Math.sin(t * 2) * warp;
    if (plane === "xy") return [centre[0] + u, centre[1] + v, centre[2] + w];
    if (plane === "xz") return [centre[0] + u, centre[1] + w, centre[2] + v];
    return [centre[0] + w, centre[1] + u, centre[2] + v];
  };
  const parts: Build[] = [];
  for (let i = 0; i < steps; i++) parts.push(strut(`${id}-${i}`, pt(i), pt((i + 1) % steps), th, tone));
  return combine(...parts);
}

/* 1 — TRIPLE-PIERCED RING. A ring with three members driven through it at
 *     different angles, each joined to the rim where it enters and exits. */
const triplePierced = (rng: Rng): Build => {
  const R = rng.float(5.5, 6.5);
  const r = ring("r", [0, 0, 0], R, rng.float(1.6, 2.1), "xz", A, 12, rng.float(0, 1.5));
  const rods: Build[] = [];
  const base = rng.float(0, Math.PI);
  for (let i = 0; i < 3; i++) {
    const a = base + (i * Math.PI) / 3 + rng.float(-0.2, 0.2);
    const len = R * rng.float(1.5, 2.0);
    // rods lie in the ring's plane (y≈0) and are wide enough to touch the rim
    // where they cross it, so ring and rod fuse on screen.
    const yj = rng.float(-0.6, 0.6);
    const p0: [number, number, number] = [Math.cos(a) * len, yj, Math.sin(a) * len];
    const p1: [number, number, number] = [-Math.cos(a) * len, yj, -Math.sin(a) * len];
    rods.push(strut(`rod${i}`, p0, p1, rng.float(1.4, 1.8), B));
  }
  return combine(r, ...rods);
};

/* 2 — STEPPED BRIDGE. Two supports at different heights, spanned by a member
 *     that splits mid-span and rejoins, so the deck is doubly connected. */
const steppedBridge = (rng: Rng): Build => {
  const pA = box([-7, -1.5, -5], 3, 3, rng.float(3, 4), 0.4, A);
  const pB = box([5, -1.5, -5], 3, 3, rng.float(5, 6.5), 0.4, A);
  const topA: [number, number, number] = [-5.5, 0, rng.float(-1, 0)];
  const topB: [number, number, number] = [6.5, 0, rng.float(2, 3)];
  const mid: [number, number, number] = [rng.float(-1, 1), 0, rng.float(1, 2)];
  // deck splits: two arcs bowing to opposite sides between the piers
  const arcHi = kinkedBeam("hi", topA, [mid[0], rng.float(-3, -2), mid[2] + 1], topB, rng.float(1.3, 1.7), A);
  const arcLo = kinkedBeam("lo", topA, [mid[0], rng.float(2, 3), mid[2] - 1], topB, rng.float(1.3, 1.7), A);
  // a cross-tie between the two arcs at mid-span — real join, not proximity
  const tie = strut("tie", [mid[0], -2.4, mid[2] + 1], [mid[0], 2.4, mid[2] - 1], rng.float(0.8, 1.1), B);
  return combine(pA, pB, arcHi, arcLo, tie);
};

/* 3 — INROLLED. One long body that curls inward; its far end meets a second
 *     member at the centre and locks to it. */
const inrolled = (rng: Rng): Build => {
  const steps = 10;
  const pts: Array<[number, number, number]> = [];
  const turns = rng.float(1.1, 1.4);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = t * Math.PI * 2 * turns;
    const rad = (1 - t * 0.7) * rng.float(5.5, 6.5);
    pts.push([Math.cos(a) * rad, rng.float(-1, 1) * t, Math.sin(a) * rad]);
  }
  const parts: Build[] = [];
  const th = rng.float(1.6, 2.2);
  for (let i = 0; i < steps; i++) parts.push(strut(`c${i}`, pts[i], pts[i + 1], th * (1 - i / steps * 0.3), A));
  // the core piece the roll locks onto
  const core = shortTube("core", [0, 0, 0], rng.float(1.4, 1.8), rng.float(3.5, 4.5), "y", B);
  const lock = strut("lock", pts[steps], [0, 0, 0], rng.float(1.0, 1.3), B);
  return combine(...parts, core, lock);
};

/* 4 — TRIPOD WITH TOP TIE. Three legs meeting high, with a horizontal member
 *     laid across two of them near the top so the whole thing is braced. */
const tripodTied = (rng: Rng): Build => {
  const apex: [number, number, number] = [rng.float(-1, 1), rng.float(-1, 1), rng.float(4, 5)];
  const feet: Array<[number, number, number]> = [
    [rng.float(-6, -4), rng.float(-2, 0), -5],
    [rng.float(4, 6), rng.float(-2, 2), -5],
    [rng.float(-1, 2), rng.float(4, 6), -5],
  ];
  const legs = feet.map((f, i) => strut(`leg${i}`, apex, f, rng.float(1.4, 1.9), A));
  // top tie across two legs, partway down — not at the apex, so it reads as a brace
  const t1: [number, number, number] = [apex[0] + (feet[0][0] - apex[0]) * 0.4, apex[1] + (feet[0][1] - apex[1]) * 0.4, apex[2] + (feet[0][2] - apex[2]) * 0.4];
  const t2: [number, number, number] = [apex[0] + (feet[1][0] - apex[0]) * 0.4, apex[1] + (feet[1][1] - apex[1]) * 0.4, apex[2] + (feet[1][2] - apex[2]) * 0.4];
  const tie = strut("tie", t1, t2, rng.float(1.0, 1.3), B);
  const cap = flatLump("cap", apex, rng.float(3, 4), rng.float(2, 2.6), [1, rng.float(-0.3, 0.3), 0.2], B);
  return combine(...legs, tie, cap);
};

/* 5 — PIERCE AND FAN. A member drives through a mass; on the far side it opens
 *     into three, each of the three joined back to the mass by a short strut. */
const pierceFan = (rng: Rng): Build => {
  const mass = flatLump("m", [0, 0, rng.float(0, 2)], rng.float(6, 7), rng.float(4, 5), [1, rng.float(-0.3, 0.3), 0.3], A);
  const entry: [number, number, number] = [-6, 0, 0];
  const through: [number, number, number] = [2, 0, 0];
  const spine = strut("sp", entry, through, rng.float(1.3, 1.7), B);
  const fanTips: Array<[number, number, number]> = [
    [rng.float(6, 8), rng.float(-3, -1), rng.float(1, 3)],
    [rng.float(6, 8), rng.float(1, 3), rng.float(1, 3)],
    [rng.float(5, 7), rng.float(-1, 1), rng.float(-3, -1)],
  ];
  const fan = fanTips.map((tp, i) => strut(`f${i}`, through, tp, rng.float(1.0, 1.4), B));
  // each fan tip tied back to the mass, so the fan is not a loose spray
  const ties = fanTips.map((tp, i) => strut(`t${i}`, tp, [rng.float(2, 4), tp[1] * 0.5, tp[2] * 0.5 + 1], 0.7, A));
  return combine(mass, spine, ...fan, ...ties);
};

/* 6 — TWINED COLUMN. Two helices winding around a shared axis, joined to each
 *     other at each crossing, forming one column. */
const twined = (rng: Rng): Build => {
  const steps = 12;
  const H = rng.float(11, 13);
  const R = rng.float(2.6, 3.4);
  const heliA: Array<[number, number, number]> = [];
  const heliB: Array<[number, number, number]> = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = t * Math.PI * 2 * 1.5;
    heliA.push([Math.cos(a) * R, Math.sin(a) * R, -H / 2 + H * t]);
    heliB.push([Math.cos(a + Math.PI) * R, Math.sin(a + Math.PI) * R, -H / 2 + H * t]);
  }
  const parts: Build[] = [];
  for (let i = 0; i < steps; i++) {
    parts.push(strut(`a${i}`, heliA[i], heliA[i + 1], rng.float(1.2, 1.5), A));
    parts.push(strut(`b${i}`, heliB[i], heliB[i + 1], rng.float(1.2, 1.5), A));
    if (i % 3 === 0) parts.push(strut(`x${i}`, heliA[i], heliB[i], rng.float(0.7, 1.0), B));
  }
  return combine(...parts);
};

/* 7 — LINKED CAVITIES. Two hollow tubes in a row, a single member run through
 *     both, tying them into one body. */
const linkedCavities = (rng: Rng): Build => {
  const c1 = shortTube("c1", [-4, 0, 0], rng.float(2.2, 2.8), rng.float(4, 5), "x", A);
  const c2 = shortTube("c2", [4, rng.float(-1, 1), rng.float(-1, 1)], rng.float(1.8, 2.4), rng.float(3.5, 4.5), "x", A);
  // the rings of each tube (short rings standing across the axis) to read hollow
  const c1p: [number, number, number] = [-4, 0, 0];
  const c2p: [number, number, number] = [4, rng.float(-1, 1), rng.float(-1, 1)];
  const r1 = ring("r1", c1p, rng.float(2.4, 2.9), rng.float(0.7, 1.0), "yz", A, 10);
  const r2 = ring("r2", c2p, rng.float(2.0, 2.5), rng.float(0.6, 0.9), "yz", A, 10);
  // the thread runs exactly through both ring centres and a hub node sits at
  // each centre, tying thread to ring.
  // the thread is wide and runs exactly through both centres; a short saddle on
  // each ring reaches down to the thread so ring and thread fuse.
  const thread = strut("th", [c1p[0] - 4, c1p[1], c1p[2]], [c2p[0] + 4, c2p[1], c2p[2]], rng.float(1.5, 1.9), B);
  const s1 = strut("s1", c1p, [c1p[0], c1p[1], c1p[2] + 2.6], rng.float(0.9, 1.2), A);
  const s2 = strut("s2", c2p, [c2p[0], c2p[1], c2p[2] + 2.2], rng.float(0.9, 1.2), A);
  return combine(r1, r2, thread, s1, s2);
};

/* 8 — CANTILEVER WITH HANGER. A cantilevered arm from which a second body
 *     hangs; the hanger is joined at two points, so the load path is a loop. */
const cantileverHanger = (rng: Rng): Build => {
  const root = box([-2, -2, -4], 4, 4, rng.float(4, 5), 0.4, A);
  const armEnd: [number, number, number] = [rng.float(7, 9), rng.float(-1, 1), rng.float(2, 3)];
  const arm = kinkedBeam("arm", [0, 0, 1], [4, rng.float(-1, 1), rng.float(2, 3)], armEnd, rng.float(1.6, 2.1), A);
  // hanger joined to the arm at two points, ending in a mass below
  const h1: [number, number, number] = [rng.float(3, 4), 0, rng.float(2, 3)];
  const hangMass: [number, number, number] = [rng.float(5, 7), rng.float(-1, 1), rng.float(-3, -1)];
  const drop1 = strut("d1", h1, hangMass, rng.float(0.9, 1.2), B);
  const drop2 = strut("d2", armEnd, hangMass, rng.float(0.9, 1.2), B);
  const mass = flatLump("m", hangMass, rng.float(3.5, 4.5), rng.float(2.4, 3), [0.3, 1, 0.3], B);
  return combine(root, arm, drop1, drop2, mass);
};

/* 9 — FOLDED THREE-WAY. A plane folded twice so three faces meet at one edge,
 *     each facing a different way; a strut ties the free corners. */
const foldedThree = (rng: Rng): Build => {
  const o: [number, number, number] = [0, 0, 0];
  const c1: [number, number, number] = [rng.float(5, 7), rng.float(-1, 1), rng.float(-1, 1)];
  const c2: [number, number, number] = [rng.float(-2, 0), rng.float(4, 6), rng.float(1, 3)];
  const c3: [number, number, number] = [rng.float(-2, 0), rng.float(-2, 0), rng.float(4, 6)];
  const f1 = curvedPlate("f1", o, rng.float(4, 5), rng.float(-20, 0), rng.float(50, 70), rng.float(0.9, 1.2), "xy", 6, A);
  const f2 = curvedPlate("f2", o, rng.float(4, 5), rng.float(40, 60), rng.float(110, 130), rng.float(0.9, 1.2), "yz", 6, A);
  const spine = combine(strut("s1", o, c1, rng.float(1.4, 1.8), A), strut("s2", o, c2, rng.float(1.4, 1.8), A), strut("s3", o, c3, rng.float(1.4, 1.8), A));
  const tie = combine(strut("t1", c1, c2, rng.float(0.8, 1.1), B), strut("t2", c2, c3, rng.float(0.8, 1.1), B));
  return combine(f1, f2, spine, tie);
};

/* 10 — WIDE ON THREE FEET. A long low body meeting the ground at three points,
 *     the centre lifted, all one connected run. */
const wideThreeFeet = (rng: Rng): Build => {
  const span = rng.float(12, 14);
  const back: [number, number, number] = [0, 0, rng.float(2, 3)];
  const feet: Array<[number, number, number]> = [
    [-span / 2, rng.float(-1, 1), -4],
    [span / 2, rng.float(-1, 1), -4],
    [rng.float(-2, 2), rng.float(3, 5), -4],
  ];
  const legs = feet.map((f, i) => strut(`leg${i}`, back, f, rng.float(1.8, 2.4), A));
  // the raised centre spine linking the leg tops
  const spine = combine(
    strut("sp1", [-span / 2, 0, rng.float(-1, 0)], back, rng.float(2.0, 2.6), A),
    strut("sp2", back, [span / 2, 0, rng.float(-1, 0)], rng.float(2.0, 2.6), A),
  );
  const crown = flatLump("cr", back, rng.float(3.5, 4.5), rng.float(2.4, 3), [1, 0.2, 0.4], B);
  return combine(...legs, spine, crown);
};

/* 11 — CONVERGE AND REDEPLOY. Several members converge to one knot; a different
 *     number leave it — the count changes across the join. */
const convergeRedeploy = (rng: Rng): Build => {
  const knot: [number, number, number] = [0, 0, 0];
  const ins: Array<[number, number, number]> = [
    [rng.float(-7, -5), rng.float(-2, 0), rng.float(-3, -1)],
    [rng.float(-6, -4), rng.float(2, 4), rng.float(1, 3)],
  ];
  const outs: Array<[number, number, number]> = [
    [rng.float(5, 7), rng.float(-3, -1), rng.float(2, 4)],
    [rng.float(5, 7), rng.float(1, 3), rng.float(-1, 1)],
    [rng.float(3, 5), rng.float(-1, 1), rng.float(-4, -2)],
  ];
  const inParts = ins.map((p, i) => strut(`in${i}`, p, knot, rng.float(1.6, 2.1), A));
  const outParts = outs.map((p, i) => strut(`out${i}`, knot, p, rng.float(1.2, 1.6), B));
  const inEnds = ins.map((p, i) => flatLump(`ie${i}`, p, rng.float(3, 4), rng.float(2, 2.6), [1, 0.2, 0.3], A));
  const hub = ball("hub", knot, rng.float(1.8, 2.3), B);
  return combine(...inParts, ...outParts, ...inEnds, hub);
};

/* 12 — INTERLOCKED GRIDS. Two slotted plates meshing at right angles, one body
 *     where they interpenetrate. */
const interlockedGrids = (rng: Rng): Build => {
  // Two curved plates crossing through each other, plus struts binding their
  // four outer corners so the cross reads as fused, not merely overlapping.
  const p1 = curvedPlate("p1", [0, 0, 0], rng.float(6, 7), rng.float(-30, -10), rng.float(30, 60), rng.float(1.0, 1.4), "xy", 7, A);
  const p2 = curvedPlate("p2", [0, 0, 0], rng.float(6, 7), rng.float(60, 90), rng.float(150, 180), rng.float(1.0, 1.4), "xz", 7, A);
  // Bind struts run from a point on p1 (xy plane) to a point on p2 (xz plane),
  // through the shared origin, so the two plates are stitched at the crossing.
  const R1 = 6.5, R2 = 6.5;
  const onP1 = (deg: number): [number, number, number] => [Math.cos((deg * Math.PI) / 180) * R1, 0, Math.sin((deg * Math.PI) / 180) * R1];
  const onP2 = (deg: number): [number, number, number] => [Math.cos((deg * Math.PI) / 180) * R2, 0, Math.sin((deg * Math.PI) / 180) * R2];
  const bind = combine(
    strut("b1", onP1(20), [0, 0, 0], rng.float(0.8, 1.1), B),
    strut("b2", [0, 0, 0], onP2(75), rng.float(0.8, 1.1), B),
    strut("b3", onP1(45), onP2(165), rng.float(0.8, 1.1), B),
  );
  return combine(p1, p2, bind);
};

export const CATEGORIES_C: Category[] = [
  { n: 1, name: "triple-pierced ring", main: "three members through one ring", build: triplePierced },
  { n: 2, name: "stepped bridge", main: "a span that splits and rejoins", build: steppedBridge },
  { n: 3, name: "inrolled", main: "a body curling to lock at its core", build: inrolled },
  { n: 4, name: "tripod tied", main: "three legs braced by a top tie", build: tripodTied },
  { n: 5, name: "pierce and fan", main: "through a mass, then fanning back to it", build: pierceFan },
  { n: 6, name: "twined column", main: "two helices bound into one column", build: twined },
  { n: 7, name: "linked cavities", main: "two hollows threaded by one member", build: linkedCavities },
  { n: 8, name: "cantilever hanger", main: "a load hung in a closed path", build: cantileverHanger },
  { n: 9, name: "folded three-way", main: "three faces meeting at one edge", build: foldedThree },
  { n: 10, name: "wide three feet", main: "low body on three feet, centre raised", build: wideThreeFeet },
  { n: 11, name: "converge redeploy", main: "many in, a different many out", build: convergeRedeploy },
  { n: 12, name: "interlocked grids", main: "two plates meshing into one body", build: interlockedGrids },
];
