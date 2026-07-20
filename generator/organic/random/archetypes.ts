import type { Form, Slab, Link } from "../types";
import type { Rng } from "../../random/seeded-random";
import { merge, chain, loop, ringPoints, spiralPoints, branch, type Part } from "../grow";
import type { Dna } from "./dna";
import { EXTRA_ARCHETYPES } from "./archetypes-extra";

/**
 * ARCHETYPES.
 *
 * Each of these is one of the six approved forms with its constants opened up
 * into ranges. That is deliberate and it is the whole safety argument for
 * randomising at all: the family that gets mass-produced is the family that was
 * looked at and accepted, not a new one arrived at by chance.
 *
 * What is NOT randomised is the design language — the projection, the absence
 * of outlines and shadows, the two-colour rule, the pale grey, the blunt ends,
 * the tone-separated faces. Those are not parameters. Randomising a language
 * produces noise; randomising within one produces variety.
 *
 * Half of these are grown and half are built, and the batch builder keeps that
 * balance. A run that came out all coral, or all bracket, would be a worse
 * result than any individual form in it.
 */

export type Register = "grown" | "built";

export type Archetype = {
  name: string;
  register: Register;
  /** The traits this structure fixes. The rest are read off the built form. */
  dna: Omit<Dna, "density" | "weighting">;
  build: (rng: Rng, scheme: string) => Omit<Form, "id" | "title">;
};

/** A short run that leaves a body and arrives nowhere. Every family has one. */
function spur(id: string, from: [number, number, number], dir: [number, number, number], rng: Rng): Part {
  const len = rng.float(1.6, 3.0);
  const n = Math.hypot(...dir) || 1;
  const u = dir.map((v) => v / n) as [number, number, number];
  return chain(
    id,
    [
      from,
      [from[0] + u[0] * len * 0.55, from[1] + u[1] * len * 0.55, from[2] + u[2] * len * 0.55],
      [from[0] + u[0] * len, from[1] + u[1] * len, from[2] + u[2] * len],
    ],
    (t) => rng.float(0.62, 0.92) - 0.3 * t + (t > 0.75 ? rng.float(0.3, 0.6) : 0),
  );
}

/* ── GROWN ──────────────────────────────────────────────────────────────── */

/** Radial: arms from a swollen centre, one of them arrested. */
const radial: Archetype = {
  name: "radial",
  dna: { purpose: "gathers what passes", structure: "radial spray", support: "rests on its whole underside", symmetry: "radial", connection: "grown continuous", material: "soft resin", rhythm: "even with one missing" },
  register: "grown",
  build: (rng, scheme) => {
    const arms = rng.int(6, 9);
    const reach = rng.float(5.2, 7.4);
    const short = rng.int(0, arms - 1);
    const curl = rng.float(0.6, 2.2);
    const droop = rng.float(-0.9, -0.2);

    const core = chain("core", [[0, 0, droop], [rng.float(0.1, 0.5), rng.float(0.1, 0.4), 0.9]], (t) =>
      rng.float(1.7, 2.3) - 0.35 * t,
    );

    const limbs = ringPoints([0, 0, 0], 1, arms, "xy", rng.float(0, 40)).map((p, i) => {
      const r = i === short ? reach * rng.float(0.45, 0.6) : reach;
      return chain(
        `arm${i}`,
        [
          [p[0] * 1.4, p[1] * 1.4, 0.2],
          [p[0] * r * 0.45, p[1] * r * 0.45, droop],
          [p[0] * r * 0.78, p[1] * r * 0.78, droop * 0.4],
          [p[0] * r, p[1] * r, curl * 0.5],
          [p[0] * (r + 0.5), p[1] * (r + 0.5), curl],
        ],
        (t) => rng.float(0.82, 1.05) - 0.55 * t + (t > 0.82 ? rng.float(0.6, 0.9) : 0),
        i === short ? "b" : "a",
      );
    });

    const budCount = rng.int(2, 4);
    const buds = ringPoints([0, 0, rng.float(2.0, 2.8)], rng.float(1.3, 1.9), budCount, "xy", 60).map((p, i) =>
      chain(`bud${i}`, [[p[0], p[1], p[2]]], () => rng.float(0.5, 0.72), "b"),
    );

    const part = merge(core, ...limbs, ...buds);
    return {
      scheme,
      nodes: part.nodes,
      links: [
        ...part.links,
        ...limbs.map((_, i) => ({ a: "core-0", b: `arm${i}-0` })),
        ...buds.map((_, i) => ({ a: "core-1", b: `bud${i}-0`, tone: "b" as const })),
      ],
      notes: {
        structure: `Radial. ${arms} arms from one swollen centre.`,
        suggests: "Gathering, or straining. Everything it does, it appears to do at the rim.",
        balance: "Low and even, sitting in its own middle — except that one arm is half length.",
        register: "Grown. Radial, and entirely soft.",
      },
    };
  },
};

/** Branching: generations dividing and thinning, leaning off the vertical. */
const branching: Archetype = {
  name: "branching",
  dna: { purpose: "releases something slowly", structure: "dividing branch", support: "a single stem", symmetry: "none", connection: "grown continuous", material: "polished wood", rhythm: "graded" },
  register: "grown",
  build: (rng, scheme) => {
    const gens = rng.int(3, 4);
    const spread = rng.float(0.7, 0.95);
    const lean = rng.float(0.1, 0.28);
    const dir: [number, number, number] = [rng.float(0.7, 1.1), rng.float(-0.8, -0.4), rng.float(0.3, 0.6)];
    const root: [number, number, number] = [-3.6, 2.2, -2.4];

    const main = branch("br", root, dir, rng.float(2.8, 3.6), rng.float(1.0, 1.3), gens, spread, {
      thinning: rng.float(0.66, 0.74),
      tipSwell: rng.float(1.5, 1.8),
      lean,
    });

    const foot = chain(
      "foot",
      [root, [root[0] - 0.8, root[1] + 0.6, root[2] - 0.8], [root[0] - 1.4, root[1] + 1.2, root[2] - 1.2]],
      (t) => rng.float(1.2, 1.5) + 0.5 * t,
      "b",
    );

    const sucker = branch("suck", [root[0] + 1.7, root[1] - 1.0, root[2] + 1.0], [-0.4, 0.9, 0.7], 1.7, 0.55, 2, 0.9, {
      thinning: 0.7,
      tipSwell: 1.7,
    });

    const part = merge(main, foot, sucker);
    return {
      scheme,
      nodes: part.nodes,
      links: [...part.links, { a: "br-root", b: "foot-0", tone: "b" }, { a: "br-1", b: "suck-root" }],
      notes: {
        structure: `Branching. ${gens} generations, each thinner than the last, every tip swelling to a bud.`,
        suggests: "Spreading, or reaching. It occupies more space than it weighs.",
        balance: "Over a single thickened foot, well to one side of the spread it carries.",
        register: "Grown. A branching structure and nothing else.",
      },
    };
  },
};

/** Colony: several growths of one kind on a shared floor, at different stages. */
const colony: Archetype = {
  name: "colony",
  dna: { purpose: "works only as a group", structure: "colony on a floor", support: "many small contacts", symmetry: "serial", connection: "grown continuous", material: "unglazed ceramic", rhythm: "irregular" },
  register: "grown",
  build: (rng, scheme) => {
    const count = rng.int(4, 6);
    const spanX = rng.float(10, 14);
    const heights = Array.from({ length: count }, () => rng.float(1.4, 4.6));

    const floorPts: Array<[number, number, number]> = Array.from({ length: 4 }, (_, i) => {
      const t = i / 3;
      return [-spanX / 2 + spanX * t, 3.4 - 6.6 * t, -3.2 - rng.float(0, 0.4)];
    });
    const floor = chain("floor", floorPts, (t) => rng.float(1.4, 1.7) + 0.5 * Math.sin(t * Math.PI), "b");

    const stalks = heights.map((h, i) => {
      const t = count === 1 ? 0 : i / (count - 1);
      const bx = -spanX / 2 + spanX * t;
      const by = 3.0 - 6.0 * t;
      const bz = -3.0;
      const drift = (i % 2 === 0 ? 1 : -1) * rng.float(0.3, 0.7);
      return chain(
        `st${i}`,
        [
          [bx, by, bz],
          [bx + drift * 0.4, by + drift * 0.2, bz + h * 0.4],
          [bx + drift * 0.9, by + drift * 0.4, bz + h * 0.75],
          [bx + drift * 1.1, by + drift * 0.5, bz + h],
        ],
        (t2) => rng.float(0.85, 1.02) - 0.42 * t2 + (t2 > 0.75 ? rng.float(0.95, 1.3) : 0),
      );
    });

    const tallest = heights.indexOf(Math.max(...heights));
    const budCount = rng.int(3, 5);
    const budRing = ringPoints(
      [stalks[tallest].nodes[2].x, stalks[tallest].nodes[2].y, stalks[tallest].nodes[2].z],
      rng.float(1.2, 1.6),
      budCount,
      "xy",
      30,
    );
    const buds = budRing.map((p, i) => chain(`bud${i}`, [[p[0], p[1], p[2]]], () => rng.float(0.42, 0.58), "b"));

    const part = merge(floor, ...stalks, ...buds);
    return {
      scheme,
      nodes: part.nodes,
      links: [
        ...part.links,
        ...stalks.map((_, i) => ({
          a: `floor-${Math.min(3, Math.floor((i / Math.max(1, count - 1)) * 3))}`,
          b: `st${i}-0`,
          tone: "b" as const,
        })),
        ...buds.map((_, i) => ({ a: `st${tallest}-2`, b: `bud${i}-0`, tone: "b" as const })),
      ],
      notes: {
        structure: `Colony. ${count} growths of one kind on a shared floor, each at a different stage.`,
        suggests: "Increasing. Whatever it is doing, it has been doing for a while and is not finished.",
        balance: "Spread along the floor. Remove any one stalk and it still stands.",
        register: "Grown. A colony, with no built member anywhere in it.",
      },
    };
  },
};

/** Spiral: one run climbing and thinning, stopping before it closes. */
const spiral: Archetype = {
  name: "spiral",
  dna: { purpose: "turns, and pays out", structure: "climbing coil", support: "one broad foot", symmetry: "spiral", connection: "grown continuous", material: "soft resin", rhythm: "none" },
  register: "grown",
  build: (rng, scheme) => {
    const turns = rng.float(1.2, 1.75);
    const rise = rng.float(6.4, 8.6);
    const coil = chain(
      "coil",
      spiralPoints([0, 0, -rise / 2], rng.float(2.9, 3.6), rng.float(0.9, 1.4), turns, rise, 22, rng.float(0, 90)),
      (t) => rng.float(1.2, 1.5) - 0.72 * t,
    );

    const top = coil.nodes[coil.nodes.length - 1];
    const ring = loop(
      "ring",
      ringPoints([top.x + 0.6, top.y - 1.9, top.z], rng.float(1.6, 2.2), 9, "yz", 10, 0.08),
      () => rng.float(0.45, 0.62),
      "b",
    );

    const base = coil.nodes[0];
    const seat = chain(
      "seat",
      [
        [base.x + 1.2, base.y + 0.6, base.z - 0.8],
        [base.x + 2.1, base.y + 1.3, base.z - 1.3],
        [base.x + 2.8, base.y + 2.1, base.z - 1.1],
      ],
      (t) => rng.float(1.35, 1.65) + 0.4 * Math.sin(t * Math.PI),
      "b",
    );

    const mid = coil.nodes[Math.floor(coil.nodes.length * 0.45)];
    const tail = spur("spur", [mid.x - 1.2, mid.y + 0.7, mid.z], [-1, 0.4, 0.3], rng);

    const part = merge(coil, ring, seat, tail);
    return {
      scheme,
      nodes: part.nodes,
      links: [
        ...part.links,
        { a: `coil-${coil.nodes.length - 1}`, b: "ring-0", tone: "b" },
        { a: "coil-0", b: "seat-0", tone: "b" },
        { a: `coil-${Math.floor(coil.nodes.length * 0.45)}`, b: "spur-0" },
      ],
      notes: {
        structure: `Spiral. One run climbing and thinning through about ${turns.toFixed(1)} turns.`,
        suggests: "Turning, or paying out. The ring at the open end is heavier than the run that holds it up.",
        balance: "Over the broad mass at the foot, well to one side of everything it carries.",
        register: "Grown, with one part that could have been fitted.",
      },
    };
  },
};

/* ── BUILT ──────────────────────────────────────────────────────────────── */

/** Gantry: a beam on two uprights, with a carriage run to one end. */
const gantry: Archetype = {
  name: "gantry",
  dna: { purpose: "carries along its own length", structure: "beam on uprights", support: "a pair of feet", symmetry: "bilateral", connection: "socketed", material: "worked metal", rhythm: "none" },
  register: "built",
  build: (rng, scheme) => {
    const span = rng.float(11, 14.5);
    const beamZ = rng.float(2.2, 3.0);
    const legDrop = rng.float(6.2, 7.6);
    const shortLeg = rng.float(0.7, 1.4);
    const carriageAt = rng.float(0.62, 0.86);
    const cx = -span / 2 + span * carriageAt;

    const ring = loop("ring", ringPoints([cx, -1.4, beamZ - 2.0], rng.float(1.2, 1.7), 9, "yz", 0), () => 0.42, "b");
    const hang = chain("hang", [[cx, -1.4, beamZ], [cx, -1.4, beamZ - 0.7]], () => 0.34, "b");
    const part = merge(ring, hang);

    const legW = rng.float(2.1, 2.6);
    const slabs: Slab[] = [
      { x: -span / 2, y: -2, z: beamZ, w: span, d: 1.7, h: rng.float(1.3, 1.7), round: 0.42 },
      { x: -span / 2 + 0.8, y: -1.8, z: beamZ - 0.4, w: span - 1.6, d: 1.3, h: 0.5, round: 0.2, tone: "b" },
      { x: -span / 2 + 0.8, y: -1.9, z: beamZ - legDrop, w: legW, d: 1.9, h: 2.2, round: 0.4 },
      { x: -span / 2 + 1.2, y: -1.7, z: beamZ - legDrop + 2.2, w: 1.7, d: 1.5, h: legDrop - 3.8, round: 0.34 },
      { x: -span / 2 + 1.0, y: -1.8, z: beamZ - 1.6, w: legW - 0.3, d: 1.7, h: 1.6, round: 0.36, tone: "b" },
      { x: span / 2 - 3.0, y: -1.9, z: beamZ - legDrop + shortLeg, w: legW, d: 1.9, h: 2.0, round: 0.4 },
      { x: span / 2 - 2.6, y: -1.7, z: beamZ - legDrop + shortLeg + 2.0, w: 1.7, d: 1.5, h: legDrop - shortLeg - 3.6, round: 0.34 },
      { x: span / 2 - 2.8, y: -1.8, z: beamZ - 1.4, w: legW - 0.3, d: 1.7, h: 1.4, round: 0.36, tone: "b" },
      { x: -span / 2 - 1.8, y: -1.6, z: beamZ - rng.float(2.6, 3.8), w: 3.2, d: 1.1, h: 0.9, round: 0.3, tone: "b" },
    ];

    return {
      scheme,
      nodes: part.nodes,
      links: [...part.links, { a: "hang-1", b: "ring-2", tone: "b" }],
      slabs,
      notes: {
        structure: "Frame. A beam on two uprights, each built from three members, with a rail and a carriage under it.",
        suggests: "Carrying something along its length. The carriage has run to one end and there is nothing there.",
        balance: "Across, between two feet that do not reach the same level.",
        register: "Built. Nothing about it grew.",
      },
    };
  },
};

/** Bracket: a plate carrying two cheeks and a spool, with a run through it. */
const bracket: Archetype = {
  name: "bracket",
  dna: { purpose: "holds something fast", structure: "bracket and run", support: "one broad foot", symmetry: "bilateral", connection: "threaded through", material: "cast stone", rhythm: "none" },
  register: "built",
  build: (rng, scheme) => {
    const runSpan = rng.float(14, 17);
    const cheekGap = rng.float(2.8, 3.8);
    const pipeZ = rng.float(1.2, 1.9);

    const pipe = chain(
      "pipe",
      Array.from({ length: 5 }, (_, i) => {
        const t = i / 4;
        return [-runSpan / 2 + runSpan * t, 3.4 - 6.8 * t, pipeZ - 1.2 * Math.abs(t - 0.5)] as [number, number, number];
      }),
      (t) => rng.float(0.64, 0.8) + 0.16 * Math.sin(t * Math.PI),
    );

    const collar = chain("collar", [[2.6, -0.9, pipeZ - 0.1], [3.4, -1.2, pipeZ - 0.15]], () => rng.float(0.9, 1.1), "b");

    // The ring hangs on the far end of the pipe and is joined to it. A ring
    // that merely crosses the pipe in the drawing is a second object that
    // happens to overlap, and could not be made as one piece.
    const ringAt = pipe.nodes[4];
    const ring = loop(
      "ring",
      ringPoints([ringAt.x - 1.4, ringAt.y + 0.7, ringAt.z - 0.9], rng.float(1.1, 1.5), 9, "yz", 0),
      () => 0.36,
      "b",
    );
    const part = merge(pipe, collar, ring);

    const slabs: Slab[] = [
      { x: -cheekGap / 2 - 1.2, y: -2.4, z: -4.6, w: cheekGap + 3.0, d: 5.2, h: 0.9, round: 0.3, tone: "b" },
      { x: -cheekGap / 2 - 0.3, y: -2.0, z: -3.7, w: 1.5, d: 1.4, h: 4.6, round: 0.34 },
      { x: cheekGap / 2 - 0.2, y: -2.0, z: -3.7, w: 1.5, d: 1.4, h: 4.6, round: 0.34 },
      { x: -cheekGap / 2 - 0.3, y: -2.2, z: 1.1, w: cheekGap + 1.4, d: 1.8, h: 1.2, round: 0.36 },
      // The spool cheeks sit hard against the bracket cheeks, whatever the
      // spacing, so the assembly is one piece at every point in the range.
      { x: -cheekGap / 2 + 0.9, y: -1.9, z: -3.0, w: 0.6, d: 1.2, h: 3.6, round: 0.2, tone: "b" },
      { x: cheekGap / 2 - 0.5, y: -1.9, z: -3.0, w: 0.6, d: 1.2, h: 3.6, round: 0.2, tone: "b" },
      { x: -cheekGap / 2 + 1.0, y: -1.7, z: -2.2, w: cheekGap - 1.4, d: 0.8, h: rng.float(1.6, 2.4), round: 0.34 },
      { x: -cheekGap / 2 - 0.7, y: 1.4, z: -3.7, w: 1.3, d: 1.2, h: 1.8, round: 0.3, tone: "b" },
    ];

    return {
      scheme,
      nodes: part.nodes,
      links: [
        ...part.links,
        { a: "pipe-3", b: "collar-0", tone: "b" },
        { a: "pipe-4", b: "ring-0", tone: "b" },
      ],
      slabs,
      notes: {
        structure: "Bracket and pipe. A plate carrying two cheeks and a spool, with a run passing straight through.",
        suggests: "Winding, or guiding. The pipe goes through at a height belonging to neither the spool nor the mounting.",
        balance: "On a broad plate, well under the near end of the pipe.",
        register: "Built, with one run through it that could be either.",
      },
    };
  },
};

/** Arch: built in segments, with runs hanging from it at even spacing. */
const arch: Archetype = {
  name: "arch",
  dna: { purpose: "spans a gap", structure: "segmented arch", support: "a pair of feet", symmetry: "bilateral", connection: "piled", material: "cast stone", rhythm: "even with one missing" },
  register: "built",
  build: (rng, scheme) => {
    const span = rng.float(14, 17.5);
    const rise = rng.float(4.0, 5.4);
    const segs = 7;
    const dropCount = rng.int(3, 4);
    const shortAt = rng.int(0, dropCount - 1);

    /**
     * Each segment is sized to reach its neighbours rather than placed and
     * hoped over. An arch built from separately positioned members leaves gaps
     * wherever the curve is steep, and a gap means the drawing comes apart into
     * pieces — which is the one thing these forms must never do.
     */
    const at = (t: number) => {
      const a = Math.PI * t;
      return {
        x: -span / 2 + span * t,
        y: 3.6 - 6.8 * t,
        z: -3.4 + Math.sin(a) * rise,
      };
    };

    const slabs: Slab[] = [];
    for (let i = 0; i < segs; i++) {
      const t = i / (segs - 1);
      const here = at(t);
      const prev = at(Math.max(0, (i - 1) / (segs - 1)));
      const next = at(Math.min(1, (i + 1) / (segs - 1)));

      // Span from halfway back to halfway forward, with a margin, on every axis.
      const lo = {
        x: Math.min(here.x, (here.x + prev.x) / 2) - 0.5,
        y: Math.min(here.y, (here.y + next.y) / 2) - 0.9,
        z: Math.min(here.z, (here.z + prev.z) / 2, (here.z + next.z) / 2) - 0.9,
      };
      const hi = {
        x: Math.max(here.x, (here.x + next.x) / 2) + 0.5,
        y: Math.max(here.y, (here.y + prev.y) / 2) + 0.9,
        z: Math.max(here.z, (here.z + prev.z) / 2, (here.z + next.z) / 2) + 0.9,
      };

      slabs.push({
        x: lo.x,
        y: lo.y,
        z: lo.z,
        w: hi.x - lo.x,
        d: hi.y - lo.y,
        h: hi.z - lo.z,
        round: 0.4,
      });
    }
    // A pale capping strip along the crown, and two broad feet, each sized to
    // bite into what it sits on.
    slabs.push({ x: -span / 2 + 2.4, y: -0.6, z: -3.4 + rise - 0.4, w: span - 4.8, d: 1.3, h: 1.0, round: 0.18, tone: "b" });
    slabs.push({ x: -span / 2 - 0.9, y: 2.2, z: -4.6, w: 3.0, d: 2.6, h: 1.6, round: 0.34, tone: "b" });
    slabs.push({ x: span / 2 - 2.1, y: -4.0, z: -4.6, w: 3.0, d: 2.6, h: 1.6, round: 0.34, tone: "b" });

    const drops = Array.from({ length: dropCount }, (_, i) => {
      const t = (i + 1) / (dropCount + 1);
      const x = -span / 2 + span * t;
      const y = 3.6 - 6.8 * t;
      const top = -3.4 + Math.sin(Math.PI * t) * rise - 0.4;
      const short = i === shortAt;
      const drop = short ? rng.float(1.5, 2.1) : rng.float(3.0, 4.2);
      return chain(
        `drop${i}`,
        [
          [x, y, top],
          [x, y, top - drop * 0.6],
          [x, y, top - drop],
        ],
        (t2) => (short ? 0.34 + (t2 > 0.7 ? 1.1 : 0) : 0.3 + (t2 > 0.75 ? 0.62 : 0)),
        short ? "a" : "b",
      );
    });

    const anchor = drops[Math.min(dropCount - 1, shortAt + 1)].nodes[1];
    const caught = loop("caught", ringPoints([anchor.x, anchor.y, anchor.z], rng.float(0.9, 1.2), 8, "xz", 0), () => 0.32, "b");

    const part = merge(...drops, caught);
    return {
      scheme,
      nodes: part.nodes,
      links: part.links,
      slabs,
      notes: {
        structure: `Arch, built in ${segs} segments, with ${dropCount} runs hanging from it at even spacing.`,
        suggests: "Spanning and letting down. Whatever the arch is for happens above whatever the drops are for.",
        balance: "Across, between two broad feet. The heaviest thing on it hangs from the shortest run.",
        register: "Built, carrying things that are not.",
      },
    };
  },
};

/** Stacked frame: members piled and stepped, with one cantilever out. */
const stack: Archetype = {
  name: "stack",
  dna: { purpose: "accumulates, slowly", structure: "stepped stack", support: "rests on its whole underside", symmetry: "layered", connection: "piled", material: "unglazed ceramic", rhythm: "graded" },
  register: "built",
  build: (rng, scheme) => {
    const tiers = rng.int(4, 6);
    const slip = rng.int(1, tiers - 2);
    const slabs: Slab[] = [];
    let x = 0;
    let y = 0;
    for (let i = 0; i < tiers; i++) {
      const w = rng.float(3.4, 5.0) - i * 0.35;
      const d = rng.float(3.0, 4.2) - i * 0.3;
      if (i === slip) {
        x += rng.float(1.0, 1.8);
        y -= rng.float(0.7, 1.3);
      }
      // Height exceeds the step, so consecutive tiers interpenetrate rather
      // than merely meeting. Two boxes that share a face exactly are two boxes.
      slabs.push({ x, y, z: -4 + i * 1.4, w, d, h: 1.8, round: 0.38, tone: i % 2 === 1 ? "b" : "a" });
    }
    // A cantilever off the top tier, out over nothing.
    const top = slabs[tiers - 1];
    slabs.push({
      x: top.x + top.w - 0.9,
      y: top.y + 0.9,
      z: top.z + 0.2,
      w: rng.float(3.6, 5.4),
      d: 1.3,
      h: 1.0,
      round: 0.32,
    });
    slabs.push({ x: -1.6, y: -1.4, z: -4.8, w: 5.8, d: 5.4, h: 1.4, round: 0.3, tone: "b" });

    const armEnd = slabs[slabs.length - 2];
    const hung = chain(
      "hung",
      [
        [armEnd.x + armEnd.w - 0.6, armEnd.y + 0.6, armEnd.z],
        [armEnd.x + armEnd.w - 0.6, armEnd.y + 0.6, armEnd.z - rng.float(1.8, 3.2)],
      ],
      (t) => 0.32 + (t > 0.6 ? rng.float(0.6, 0.95) : 0),
      "b",
    );

    return {
      scheme,
      nodes: hung.nodes,
      links: hung.links,
      slabs,
      notes: {
        structure: `Layered. ${tiers} members stacked and stepping, one of them well off the line the others kept.`,
        suggests: "Building up, and reaching out. The arm at the top is over nothing at all.",
        balance: "Low, in the oldest members, while everything above leans the other way.",
        register: "Built. Stacked rather than grown.",
      },
    };
  },
};

/**
 * Fourteen structures. A batch of twelve therefore gives every individual a
 * structure of its own, which is the only way "twelve different species" can
 * be true — with eight, four of them were always going to be repeats.
 */
export const ARCHETYPES: Archetype[] = [
  radial, branching, colony, spiral, gantry, bracket, arch, stack,
  ...EXTRA_ARCHETYPES,
];
