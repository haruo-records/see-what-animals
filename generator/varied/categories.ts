import type { Form } from "../organic/types";
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
  type Build,
} from "./parts";

/**
 * TWELVE CATEGORIES, ONE PER INDIVIDUAL.
 *
 * The brief names twelve overall configurations and asks for one of each,
 * every individual dominated by a main structure and a secondary one. So the
 * category is not a tag added afterwards — it is the thing built first, and the
 * secondary move is chosen to be legible against it.
 *
 * What is deliberately avoided, per the brief: a core with arms radiating, boxes
 * stacked vertically, two posts under a beam, a ball on the end, a white plinth
 * under everything, equal parts at equal spacing, and left-right symmetry. Where
 * support is needed it is found in the body — a wide base, a cantilever root, a
 * ring resting on its rim — rather than by dropping a separate pale slab under
 * the form.
 */

export type Category = {
  n: number;
  name: string;
  main: string;
  build: (rng: Rng) => Build;
};

const A = "a" as const;
const B = "b" as const;

/* 1 — SINGLE MASS. One body, its interest in how its own surface swells and
 *     narrows, not in parts joined together. */
const singleMass = (rng: Rng): Build => {
  // A compact single body that folds back on itself in the vertical plane, so it
  // reads as one turning mass rather than a beam laid across the frame. The
  // fold is what keeps it from being a plain sausage.
  const body = kinkedBeam(
    "m",
    [rng.float(-2, -1), 0, -4],
    [rng.float(2, 3.5), rng.float(-1, 1), rng.float(0, 2)],
    [rng.float(-3, -1.5), rng.float(-1.5, 1.5), rng.float(3, 5)],
    rng.float(3.0, 3.8),
    A,
  );
  // A single swelling where it turns — same body thickening, not an added part.
  const swell = flatLump("s", [rng.float(0, 2), rng.float(-1, 1), rng.float(-1, 1)], rng.float(4.5, 6), rng.float(3.4, 4.2), [0.4, 0.3, 1], A);
  return combine(body, swell);
};

/* 2 — CANTILEVER. A heavy mass held out past its own footing, nothing under the
 *     far end. */
const cantilever = (rng: Rng): Build => {
  const rootW = rng.float(3.2, 4.2);
  // A stout root that grips, low and wide, no separate plinth.
  const root = box([-rootW / 2, -2, -4], rootW, 4, rng.float(3.5, 5), 0.4, A);
  const reach = rng.float(8, 12);
  const arm = kinkedBeam("arm", [0, 0, rng.float(-1, 1)], [reach * 0.5, rng.float(-1, 1), rng.float(0.5, 2)], [reach, rng.float(-2, 2), rng.float(-1, 1)], rng.float(1.6, 2.4), A);
  // The load: a flattened mass right at the unsupported end.
  const load = flatLump("load", [reach, rng.float(-2, 2), rng.float(-1, 1)], rng.float(4, 6), rng.float(2.8, 3.8), [0.3, 1, 0.2], B);
  return combine(root, arm, load);
};

/* 3 — HUNG. Everything depends from a single high anchor; nothing stands. */
const hung = (rng: Rng): Build => {
  const barX = rng.float(7, 10);
  // One overhead member, itself cantilevered from a wall-mass at one end.
  const wall = box([-barX / 2 - 1, -1.5, 1], 2.4, 3, rng.float(4, 6), 0.4, A);
  const bar = kinkedBeam("bar", [-barX / 2, 0, rng.float(4, 5)], [0, rng.float(-1, 1), rng.float(4.5, 5.5)], [barX / 2, 0, rng.float(3.5, 4.5)], 1.6, A);
  // Two drops of different length, ending in different masses — not a row.
  const d1 = combine(
    shortTube("d1", [-barX * 0.2, 0, rng.float(0, 2)], 0.5, rng.float(4, 6), "z", B),
    box([-barX * 0.2 - 1.2, -1.2, rng.float(-4, -2)], 2.4, 2.4, 1.6, 0.3, B),
  );
  const d2 = combine(
    shortTube("d2", [barX * 0.25, 0, rng.float(1, 3)], 0.45, rng.float(2.5, 4), "z", B),
    ball("d2b", [barX * 0.25, 0, rng.float(-2, -0.5)], rng.float(1.6, 2.2), A),
  );
  return combine(wall, bar, d1, d2);
};

/* 4 — NESTED. One body inside another, the outer opening to show the inner. */
const nested = (rng: Rng): Build => {
  const R = rng.float(5.5, 7);
  // The outer: a half-ring shell in the vertical plane, cupped and open to one side.
  const shell = combine(
    halfRing("o1", [0, 0, 0], R, rng.float(2, 2.8), rng.float(1.2, 1.8), "xz", rng.float(-30, 30), A),
    halfRing("o2", [0, rng.float(1.5, 2.5), 0], R, rng.float(2, 2.8), rng.float(1.2, 1.8), "xz", rng.float(-30, 30), A),
  );
  // The inner: a distinct compact mass held within the cup, not touching the rim.
  const inner = rng.bool(0.5)
    ? box([-1.6, rng.float(0.4, 1.2), -2], 3.2, 2.4, 3.4, 0.4, B)
    : combine(ball("in", [0, rng.float(0.6, 1.4), rng.float(-1, 1)], rng.float(2.4, 3), B), flatLump("in2", [0, rng.float(0.6, 1.4), rng.float(-2, 0)], 3, 2, [1, 0, 0.2], B));
  return combine(shell, inner);
};

/* 5 — THROUGH. One member passes clean through another and out the far side. */
const through = (rng: Rng): Build => {
  // The pierced body: a tall hollow upright, so the passage cuts across a
  // vertical mass and the crossing is the whole reading.
  const host = hollowBox([-2.5, -2.5, -5], 5, 5, 10, rng.float(1.3, 1.9), A);
  // The member passing clean through, strictly horizontal and well off centre
  // in height, entering one face and leaving the far one.
  const off = rng.float(-1, 1);
  const zoff = rng.float(-1, 3);
  const rod = shortTube("rod", [0, off, zoff], rng.float(1.2, 1.7), rng.float(15, 19), "x", B);
  // A collar where it passes, and a different termination at each end.
  const collar = box([rng.float(-1, 1), off - 1.4, zoff - 1.4], 2, 2.8, 2.8, 0.5, A);
  const capA = ball("ca", [-9, off, zoff], rng.float(1.5, 2.0), B);
  const capB = wedge("cb", [8.5, off, zoff], [10.5, off, zoff + rng.float(-1, 1)], rng.float(1.7, 2.3), B);
  return combine(host, rod, collar, capA, capB);
};

/* 6 — MUTUAL SUPPORT. Two bodies that only stand because they lean on each other. */
const mutual = (rng: Rng): Build => {
  const gap = rng.float(3, 4.5);
  const lean = rng.float(1.5, 2.8);
  // Two leaning members, meeting high, neither vertical.
  const a = kinkedBeam("la", [-gap, -1, -4], [-gap * 0.4, 0, 0], [-lean * 0.3, rng.float(-1, 1), rng.float(4, 5.5)], rng.float(1.8, 2.6), A);
  const b = kinkedBeam("lb", [gap, 1, -4], [gap * 0.4, 0, 0], [lean * 0.3, rng.float(-1, 1), rng.float(4, 5.5)], rng.float(1.8, 2.6), A);
  // Where they meet, they cross — a curved plate caught between them.
  const caught = curvedPlate("c", [0, 0, rng.float(3.5, 4.5)], rng.float(1.5, 2.2), 20, 160, rng.float(1, 1.4), "xz", 6, B);
  // Each foot is a small wedge biting the ground, no shared plinth.
  const feet = combine(wedge("fa", [-gap, -1.4, -4.5], [-gap + 1.5, -1, -3], 1.6, B), wedge("fb", [gap, 1.4, -4.5], [gap - 1.5, 1, -3], 1.6, B));
  return combine(a, b, caught, feet);
};

/* 7 — LARGE CAVITY. The enclosed emptiness is the main event; the body is its rim. */
const cavity = (rng: Rng): Build => {
  const R = rng.float(6, 7.5);
  // A thick ring standing on its edge, the hole facing the viewer.
  const ring = thickRing("r", [0, 0, 0], R, rng.float(1.8, 2.6), "xz", A, 11);
  // A second, smaller arc inside — the cavity is divided, not plain.
  const inner = halfRing("i", [0, rng.float(1, 2), rng.float(-1, 1)], R * 0.5, rng.float(1, 1.5), rng.float(0.7, 1.1), "xz", rng.float(0, 60), B);
  // One thickening on the rim, so the ring is not uniform.
  const knot = flatLump("k", [Math.cos(rng.float(0, 6)) * R, 0, Math.sin(rng.float(0, 6)) * R], rng.float(3, 4.5), rng.float(2.4, 3.2), [1, 0.2, 0.5], A);
  return combine(ring, inner, knot);
};

/* 8 — SEVERAL DETACHED. Separate masses, one individual by rule not by contact. */
const detached = (rng: Rng): Build => {
  const parts: Build[] = [];
  let d = 0;
  let r = rng.float(2.6, 3.2);
  const ratio = rng.float(0.62, 0.72);
  // Gaps are the whole point of this category; the first pass had them barely
  // larger than the parts, so everything fused into one blob. A gap several
  // times the current radius keeps the masses visibly apart.
  let gap = rng.float(7, 9);
  const widen = rng.float(1.1, 1.24);
  const curve = rng.float(0.1, 0.24);
  const n = rng.int(3, 4);
  for (let i = 0; i < n; i++) {
    const a = curve * i;
    const c: [number, number, number] = [Math.cos(a) * d, Math.sin(a) * d * 0.4, Math.sin(a * 1.4) * d * 0.3];
    // Different kind of mass each time, so it is not a graded row of the same thing.
    if (i % 3 === 0) parts.push(box([c[0] - r / 2, c[1] - r / 2, c[2] - r / 2], r, r * 0.9, r * 1.1, 0.4, i % 2 ? B : A));
    else if (i % 3 === 1) parts.push(flatLump(`f${i}`, c, r * 1.4, r * 0.8, [1, 0.3, 0], i % 2 ? B : A));
    else parts.push(ball(`b${i}`, c, r * 0.7, i % 2 ? B : A));
    d += gap;
    gap *= widen;
    r *= ratio;
  }
  return combine(...parts);
};

/* 9 — PLANE AND SOLID. A flat sheet meeting a blocky mass, the contrast the point. */
const planeAndSolid = (rng: Rng): Build => {
  // The plane: a broad curved plate, nearly flat, standing at an angle.
  const plate = curvedPlate("p", [0, 0, 0], rng.float(7, 9), rng.float(-40, -10), rng.float(40, 70), rng.float(0.7, 1.1), "xy", 8, A);
  // The solid: a chunky box gripping one edge of the plate.
  const grip = box([rng.float(-6, -4), rng.float(-2, 0), -2.5], rng.float(3.5, 4.5), 3.5, 5, 0.4, B);
  // A wedge bracing between them, so the plate is not free-floating.
  const brace = wedge("br", [-4, -1, 2], [1, 0, rng.float(-1, 1)], rng.float(2, 2.8), B);
  return combine(plate, grip, brace);
};

/* 10 — EXTREME SIZE CONTRAST. One dominant mass, everything else tiny against it. */
const sizeContrast = (rng: Rng): Build => {
  // The dominant mass: a single large flattened body.
  // One genuinely dominant body.
  // One genuinely dominant body, held compact so it does not sprawl across the
  // whole frame and swallow the small parts behind it.
  // A large body standing more upright than lying, so its long axis is not the
  // horizontal one that the single-mass and cantilever forms already own.
  const big = flatLump("big", [0, 0, rng.float(3, 5)], rng.float(11, 13), rng.float(7, 9), [0.25, rng.float(-0.2, 0.2), 1], A);
  // The attendants are tiny and placed high and to the near side — in screen
  // terms up and to the right of the big mass, where nothing occludes them.
  const small: Build[] = [];
  const nn = rng.int(3, 4);
  const bx = rng.float(4, 6);
  for (let i = 0; i < nn; i++) {
    const c: [number, number, number] = [bx + i * rng.float(1.0, 1.5), rng.float(-5, -3), rng.float(4, 7)];
    small.push(ball(`s${i}`, c, rng.float(0.7, 1.1), B));
  }
  // A thin stalk lifting the cluster clear of the big body.
  const tether = shortTube("t", [bx * 0.7, rng.float(-3, -1.5), rng.float(2, 4)], 0.4, 5, "z", B);
  return combine(big, tether, ...small);
};

/* 11 — LOW AND WIDE. Spread horizontally, no upright, weight along the ground. */
const lowWide = (rng: Rng): Build => {
  const span = rng.float(12, 16);
  // A long low body that kinks, so it is not one straight bar.
  const spine = kinkedBeam("sp", [-span / 2, rng.float(-1, 1), -2], [rng.float(-2, 2), rng.float(-3, 3), -1.5], [span / 2, rng.float(-1, 1), -2], rng.float(2.6, 3.4), A);
  // Two unequal swellings sitting on it, at unequal spacing.
  const l1 = flatLump("l1", [rng.float(-5, -2), rng.float(-2, 2), -1], rng.float(4, 5.5), rng.float(2.6, 3.4), [0, 1, 0.2], A);
  const l2 = flatLump("l2", [rng.float(3, 5), rng.float(-2, 2), -1], rng.float(2.5, 3.5), rng.float(2, 2.6), [0.3, 1, 0], B);
  // A short half-ring rising from one end — the only thing that leaves the ground.
  const arc = halfRing("ar", [rng.float(-6, -4), 0, 0], rng.float(2.5, 3.5), 1.4, 1, "xz", 0, B);
  return combine(spine, l1, l2, arc);
};

/* 12 — TALL. Rises, narrow, weight carried high, but not a plain stack. */
const tall = (rng: Rng): Build => {
  // A single column that changes section as it rises — box to tube to box.
  // A narrow footing — small, so the form has to rise from almost nothing and
  // reads as tall rather than as a tower on a wide plinth.
  const base = box([-1.6, -1.6, -9], 3.2, 3.2, 2.4, 0.4, A);
  const mid = shortTube("m", [0, 0, -3.5], rng.float(1.2, 1.7), rng.float(6, 8), "z", B);
  // The heavy mass sits high — a broad flat body near the top, the weight the
  // brief asks to be carried up there.
  const head = flatLump("head", [rng.float(-1, 1), rng.float(-1, 1), rng.float(6, 8)], rng.float(6, 8), rng.float(3, 4), [1, rng.float(-0.4, 0.4), 0.1], A);
  const cap = box([rng.float(-2, 0), rng.float(-1.5, 0.5), rng.float(8, 9.5)], rng.float(2.5, 3.5), rng.float(2.5, 3.5), 2.2, 0.4, B);
  return combine(base, mid, head, cap);
};

export const CATEGORIES: Category[] = [
  { n: 1, name: "single mass", main: "one continuous body", build: singleMass },
  { n: 2, name: "cantilever", main: "held out past its footing", build: cantilever },
  { n: 3, name: "hung", main: "everything depends from above", build: hung },
  { n: 4, name: "nested", main: "one body inside another", build: nested },
  { n: 5, name: "through", main: "a member passes clean through", build: through },
  { n: 6, name: "mutual support", main: "two bodies leaning together", build: mutual },
  { n: 7, name: "large cavity", main: "the enclosed emptiness", build: cavity },
  { n: 8, name: "detached", main: "separate masses, one individual", build: detached },
  { n: 9, name: "plane and solid", main: "flat sheet against a block", build: planeAndSolid },
  { n: 10, name: "size contrast", main: "one dominant mass, tiny rest", build: sizeContrast },
  { n: 11, name: "low and wide", main: "spread along the ground", build: lowWide },
  { n: 12, name: "tall", main: "rises, weight held high", build: tall },
];
