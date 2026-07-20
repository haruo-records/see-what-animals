import type { Slab } from "../types";
import type { Archetype } from "./archetypes";
import { merge, chain, loop, ringPoints, type Part } from "../grow";

/**
 * SIX NEW WAYS OF LIVING.
 *
 * The existing fifteen all, in the end, stay where they are. They gather, span,
 * hold, accumulate — and they do it by sitting still. That is a narrow world,
 * and reshuffling it produces recognisably the same line-up however the seed
 * falls.
 *
 * So each of these begins from an operating principle none of the others has:
 * turning inside out, throwing something away from itself, needing a second
 * body to mean anything, holding its own parts at arm's length, moving a weight
 * around inside itself, opening out and closing again. The structure follows
 * from the principle in every case — none of these was arrived at by looking
 * for a silhouette nobody had drawn yet.
 */

/* ── ORGANIC ────────────────────────────────────────────────────────────── */

/**
 * INVERTING — a sheet that folds through its own opening, so the surface that
 * was inside is now outside.
 *
 * Unlike the cage, which encloses by surrounding, this encloses by turning: the
 * mouth is also the middle, and there is no point on it that is definitely in
 * or definitely out.
 */
const inverting: Archetype = {
  name: "inverting",
  dna: {
    motion: "inverts",
    register: "organic",
    silhouette: "enclosing",
    plurality: "solitary",
    purpose: "turns itself inside out",
    structure: "sheet folded through its own mouth",
    support: "one broad foot",
    symmetry: "none",
    connection: "grown continuous",
    material: "soft resin",
    rhythm: "none",
  },
  build: (rng, scheme) => {
    const mouthR = rng.float(3.0, 4.4);
    const throatR = rng.float(1.0, 1.9);
    const depth = rng.float(3.4, 5.6);
    const segments = rng.int(9, 14);

    // The outer lip, and the inner lip that has come back up through it. The
    // two rings are the same ring at two stages of turning inside out.
    const outer = loop(
      "outer",
      ringPoints([0, 0, 1.2], mouthR, segments, "xy", rng.float(0, 40), 0.14),
      () => rng.float(0.8, 1.15),
    );
    const inner = loop(
      "inner",
      ringPoints([rng.float(-0.6, 0.6), rng.float(-0.6, 0.6), 1.2 - depth * 0.42], throatR, segments, "xy", 20, 0.2),
      () => rng.float(0.55, 0.85),
      "b",
    );

    // The wall between them: one run per segment, so the surface is continuous
    // all the way round rather than two rings on posts.
    const walls: Part[] = [];
    for (let i = 0; i < segments; i++) {
      const a = outer.nodes[i];
      const b = inner.nodes[i];
      walls.push(
        chain(
          `wall${i}`,
          [
            [a.x, a.y, a.z],
            [(a.x + b.x) / 2 * 1.12, (a.y + b.y) / 2 * 1.12, (a.z + b.z) / 2],
            [b.x, b.y, b.z],
          ],
          (t) => rng.float(0.6, 0.85) - 0.18 * t,
        ),
      );
    }

    // The returned end, poking back up out of the throat.
    const returned = chain(
      "returned",
      [
        [0, 0, 1.2 - depth * 0.42],
        [rng.float(-0.5, 0.5), rng.float(-0.5, 0.5), 1.2 - depth * 0.42 + rng.float(1.8, 3.4)],
      ],
      (t) => rng.float(0.7, 1.0) + (t > 0.6 ? rng.float(0.3, 0.8) : 0),
    );

    const foot = chain(
      "foot",
      [
        [mouthR * 0.5, mouthR * 0.4, 1.2 - depth],
        [mouthR * 0.6, mouthR * 0.5, 1.2 - depth - rng.float(0.8, 1.6)],
      ],
      () => rng.float(1.3, 1.8),
      "b",
    );

    const part = merge(outer, inner, ...walls, returned, foot);
    const links = [...part.links];
    for (let i = 0; i < segments; i++) {
      links.push({ a: `outer-${i}`, b: `wall${i}-0` });
      links.push({ a: `wall${i}-2`, b: `inner-${i}` });
    }
    links.push({ a: "inner-0", b: "returned-0" });
    links.push({ a: `outer-${Math.floor(segments / 4)}`, b: "foot-0", tone: "b" });

    return {
      scheme,
      nodes: part.nodes,
      links,
      notes: {
        structure: `A sheet of ${segments} runs folded down through its own mouth, so the inner surface has come back out.`,
        suggests: "Turning itself inside out. There is no point on it that is definitely inside.",
        balance: "On one thickened foot at the rim, well off the axis everything else is arranged around.",
        register: "Grown. Continuous the whole way through, including the part that used to be the lining.",
      },
    };
  },
};

/**
 * DISPERSED — several separate bodies held at a distance by thin struts.
 *
 * The colony crowds onto a shared floor; this does the opposite. The struts do
 * no work except to stop the bodies touching, which appears to be the point.
 */
const dispersed: Archetype = {
  name: "dispersed",
  dna: {
    motion: "spaces itself apart",
    register: "organic",
    silhouette: "scattered",
    plurality: "colonial",
    purpose: "keeps its own parts apart",
    structure: "bodies on spacing struts",
    support: "many small contacts",
    symmetry: "none",
    connection: "grown continuous",
    material: "unglazed ceramic",
    rhythm: "irregular",
  },
  build: (rng, scheme) => {
    const bodies = rng.int(3, 5);
    const reach = rng.float(4.2, 7.0);

    const hub = chain(
      "hub",
      [
        [0, 0, -0.6],
        [rng.float(-0.4, 0.4), rng.float(-0.4, 0.4), 0.5],
      ],
      () => rng.float(0.9, 1.3),
      "b",
    );

    const parts: Part[] = [];
    const links: Array<{ a: string; b: string; tone?: "a" | "b" }> = [];

    for (let i = 0; i < bodies; i++) {
      const a = ((360 * i) / bodies + rng.float(-22, 22)) * (Math.PI / 180);
      const d = reach * rng.float(0.7, 1.25);
      const lift = rng.float(-2.2, 3.0);
      const bx = Math.cos(a) * d;
      const by = Math.sin(a) * d;

      // The strut: long, even, and noticeably thinner than what it separates.
      parts.push(
        chain(
          `strut${i}`,
          [
            [Math.cos(a) * 0.9, Math.sin(a) * 0.9, 0.2],
            [bx * 0.55, by * 0.55, lift * 0.5],
            [bx * 0.85, by * 0.85, lift * 0.85],
          ],
          () => rng.float(0.32, 0.46),
          "b",
        ),
      );

      // The body it holds away: a small mass with a bud or two of its own.
      const buds = rng.int(1, 3);
      const bodyPts: Array<[number, number, number]> = [[bx, by, lift]];
      for (let k = 0; k < buds; k++) {
        bodyPts.push([bx + rng.float(-1.2, 1.2), by + rng.float(-1.2, 1.2), lift + rng.float(-1.0, 1.4)]);
      }
      parts.push(chain(`body${i}`, bodyPts, (t) => rng.float(1.0, 1.6) - 0.35 * t));

      links.push({ a: "hub-1", b: `strut${i}-0`, tone: "b" });
      links.push({ a: `strut${i}-2`, b: `body${i}-0` });
    }

    const part = merge(hub, ...parts);
    return {
      scheme,
      nodes: part.nodes,
      links: [...part.links, ...links],
      notes: {
        structure: `${bodies} separate bodies held out from a small hub on struts thinner than anything they carry.`,
        suggests: "Keeping its own parts apart. The struts do no work except to stop the bodies touching.",
        balance: "Nowhere in particular. The mass is all at the ends and the middle holds almost none of it.",
        register: "Grown. The struts are the same material as the bodies, only starved.",
      },
    };
  },
};

/* ── HYBRID ─────────────────────────────────────────────────────────────── */

/**
 * EMITTING — a chamber with a narrow throat, and a plume of small masses
 * leaving it, spaced further apart the further out they get.
 *
 * The only structure in the set with parts that are not attached. They are
 * clearly of it and clearly no longer part of it.
 */
const emitting: Archetype = {
  name: "emitting",
  dna: {
    motion: "releases outward",
    register: "hybrid",
    silhouette: "spreading",
    plurality: "solitary",
    purpose: "releases something outward",
    structure: "chamber with a dispersing plume",
    support: "cantilevered from one side",
    symmetry: "none",
    connection: "socketed",
    material: "cast stone",
    rhythm: "graded",
  },
  build: (rng, scheme) => {
    const grains = rng.int(5, 9);
    const spread = rng.float(6.0, 10.0);
    const heading = rng.float(-0.4, 0.4);

    // A made chamber, and a grown throat coming out of it.
    const slabs: Slab[] = [
      { x: -2.6, y: -2.0, z: -2.4, w: rng.float(3.4, 4.6), d: 3.8, h: rng.float(3.0, 4.4), round: 0.44 },
      { x: -2.9, y: -2.3, z: -3.4, w: rng.float(4.0, 5.2), d: 4.4, h: 1.1, round: 0.3, tone: "b" },
    ];

    const throat = chain(
      "throat",
      [
        [1.0, -0.2, 0.4],
        [2.2, -0.2 + heading, 0.7],
        [3.2, -0.2 + heading * 1.6, 0.9],
      ],
      (t) => rng.float(1.3, 1.7) - 0.75 * t,
    );

    // The plume. Spacing widens and the masses shrink, so the run reads as
    // something leaving rather than something built outward.
    const plume: Part[] = [];
    for (let i = 0; i < grains; i++) {
      const t = (i + 1) / grains;
      const d = 3.2 + spread * Math.pow(t, 1.5);
      plume.push(
        chain(
          `grain${i}`,
          [[d, -0.2 + heading * (1.6 + t * 2.4), 0.9 + t * rng.float(0.4, 2.2)]],
          () => rng.float(0.75, 1.05) * (1 - t * 0.55),
          i % 2 === 1 ? "b" : "a",
        ),
      );
    }

    const part = merge(throat, ...plume);
    const links = [...part.links];
    // Each grain is joined to the one before it, so the plume is one run — but
    // it thins to almost nothing, which is as close to detached as a single
    // body can get.
    links.push({ a: "throat-2", b: "grain0-0" });
    for (let i = 1; i < grains; i++) {
      links.push({ a: `grain${i - 1}-0`, b: `grain${i}-0`, tone: "b" });
    }

    return {
      scheme,
      nodes: part.nodes,
      links,
      slabs,
      notes: {
        structure: `A chamber with a narrowing throat and ${grains} masses leaving it, each smaller and further apart than the last.`,
        suggests: "Releasing something outward. Whatever is leaving has not stopped leaving.",
        balance: "In the chamber, at one end. Everything past the throat weighs almost nothing.",
        register: "A made chamber with something grown coming out of it.",
      },
    };
  },
};

/**
 * PAIRED — two near-identical halves facing each other across a gap, joined by
 * a single thin bridge.
 *
 * Neither half is a whole thing. Everything about the geometry is about the gap
 * between them, which is empty.
 */
const paired: Archetype = {
  name: "paired",
  dna: {
    motion: "works against a partner",
    register: "hybrid",
    silhouette: "compact",
    plurality: "paired",
    purpose: "works only with a partner",
    structure: "two halves across a gap",
    support: "a pair of feet",
    symmetry: "bilateral",
    connection: "clamped",
    material: "worked metal",
    rhythm: "even",
  },
  build: (rng, scheme) => {
    const gap = rng.float(2.4, 4.6);
    const tiers = rng.int(2, 4);
    const slabs: Slab[] = [];

    const half = (sign: number, shortenBy: number) => {
      const x0 = sign * (gap / 2);
      for (let k = 0; k < tiers - shortenBy; k++) {
        const w = rng.float(1.5, 2.2);
        slabs.push({
          x: sign > 0 ? x0 : x0 - w,
          y: -1.6 + k * 0.25,
          z: -3.2 + k * 1.7,
          w,
          d: 3.2 - k * 0.4,
          h: 1.9,
          round: 0.38,
          tone: k % 2 === 1 ? "b" : "a",
        });
      }
      // A foot, and an inward-facing lip at the top.
      slabs.push({
        x: sign > 0 ? x0 - 0.3 : x0 - 2.4,
        y: -2.0,
        z: -4.0,
        w: 2.7,
        d: 3.8,
        h: 1.1,
        round: 0.34,
        tone: "b",
      });
      const top = -3.2 + (tiers - shortenBy - 1) * 1.7 + 1.9;
      slabs.push({
        x: sign > 0 ? x0 - gap * 0.32 : x0 - 2.0 + gap * 0.02,
        y: -1.2,
        z: top - 0.9,
        w: gap * 0.36 + 1.4,
        d: 2.2,
        h: 0.95,
        round: 0.3,
      });
      return top;
    };

    // The two halves are a pair, and one of them is a tier short — which is
    // what makes the pairing legible as intent rather than as repetition.
    const shortSide = rng.bool(0.5) ? 1 : -1;
    const topA = half(1, shortSide === 1 ? 1 : 0);
    const topB = half(-1, shortSide === -1 ? 1 : 0);

    // The single bridge, thin, well below the lips.
    const bridge = chain(
      "bridge",
      [
        [-gap / 2, 0.2, Math.min(topA, topB) - rng.float(2.4, 3.8)],
        [0, 0.2, Math.min(topA, topB) - rng.float(2.4, 3.8) - rng.float(0, 0.6)],
        [gap / 2, 0.2, Math.min(topA, topB) - rng.float(2.4, 3.8)],
      ],
      () => rng.float(0.4, 0.62),
      "b",
    );

    return {
      scheme,
      nodes: bridge.nodes,
      links: bridge.links,
      slabs,
      notes: {
        structure: `Two halves of ${tiers} tiers facing each other across a gap, one of them a tier short, joined by a single thin bridge.`,
        suggests: "Working only with a partner. Neither half is a whole thing, and what happens happens in the gap.",
        balance: "On two feet either side of an empty middle. It balances by agreement rather than by mass.",
        register: "Made members, with one grown run between them.",
      },
    };
  },
};

/* ── MECHANICAL ─────────────────────────────────────────────────────────── */

/**
 * SHIFTING — a heavy mass sitting on a track inside an open frame, well off
 * centre.
 *
 * Every other structure here holds its weight where it was built. This one has
 * a weight that is somewhere along a run, and the run is longer than the weight
 * has travelled.
 */
const shifting: Archetype = {
  name: "shifting",
  dna: {
    motion: "shifts its weight",
    register: "mechanical",
    silhouette: "compact",
    plurality: "solitary",
    purpose: "moves a weight inside itself",
    structure: "weight on a track in a frame",
    support: "a pair of feet",
    symmetry: "bilateral",
    connection: "threaded through",
    material: "worked metal",
    rhythm: "none",
  },
  build: (rng, scheme) => {
    const inner = rng.float(7.0, 10.0);
    const height = rng.float(5.0, 7.4);
    const at = rng.float(0.16, 0.84);
    const slabs: Slab[] = [];

    // An open frame: two uprights, a head and a sill.
    slabs.push({ x: -inner / 2 - 1.3, y: -1.8, z: -height / 2, w: 1.5, d: 2.6, h: height, round: 0.36 });
    slabs.push({ x: inner / 2 - 0.2, y: -1.8, z: -height / 2, w: 1.5, d: 2.6, h: height, round: 0.36 });
    slabs.push({ x: -inner / 2 - 1.3, y: -1.8, z: height / 2 - 1.2, w: inner + 2.8, d: 2.6, h: 1.3, round: 0.36 });
    slabs.push({ x: -inner / 2 - 1.3, y: -1.8, z: -height / 2, w: inner + 2.8, d: 2.6, h: 1.2, round: 0.36, tone: "b" });
    slabs.push({ x: -inner / 2 - 1.9, y: -2.2, z: -height / 2 - 1.0, w: 2.7, d: 3.4, h: 1.1, round: 0.32, tone: "b" });
    slabs.push({ x: inner / 2 - 0.8, y: -2.2, z: -height / 2 - 1.0, w: 2.7, d: 3.4, h: 1.1, round: 0.32, tone: "b" });

    // The track, running the full width whatever the weight has done.
    const track = chain(
      "track",
      [
        [-inner / 2, -0.5, 0],
        [0, -0.5, rng.float(-0.4, 0.4)],
        [inner / 2, -0.5, 0],
      ],
      () => rng.float(0.4, 0.58),
      "b",
    );

    // The weight, somewhere along it and nowhere near the middle.
    const wx = -inner / 2 + inner * at;
    const weight = chain(
      "weight",
      [
        [wx, -0.5, 0],
        [wx + rng.float(-0.4, 0.4), -0.5, -rng.float(1.4, 2.6)],
      ],
      (t) => rng.float(0.9, 1.2) + (t > 0.5 ? rng.float(0.7, 1.4) : 0),
    );

    const part = merge(track, weight);
    return {
      scheme,
      nodes: part.nodes,
      links: [...part.links, { a: "track-1", b: "weight-0" }],
      slabs,
      notes: {
        structure: "An open frame with a track across it and a heavy mass hanging from the track, well off centre.",
        suggests: "Moving a weight around inside itself. The track is longer than the weight has travelled.",
        balance: `Off to one side — the weight sits about ${Math.round(at * 100)}% of the way along, and nothing holds it there.`,
        register: "Made throughout. The only moving part is the one that has already moved.",
      },
    };
  },
};

/**
 * DEPLOYING — plates fanned out from a hub, with one still folded against it.
 *
 * The set has plenty of things that are open and plenty that are closed. This
 * is the only one caught between the two, and the folded plate is the only
 * evidence that the open ones were ever anything else.
 */
const deploying: Archetype = {
  name: "deploying",
  dna: {
    motion: "unfolds",
    register: "mechanical",
    silhouette: "spreading",
    plurality: "solitary",
    purpose: "opens out, and closes again",
    structure: "fanned plates on a hub",
    support: "a single stem",
    symmetry: "radial",
    connection: "socketed",
    material: "worked metal",
    rhythm: "even with one missing",
  },
  build: (rng, scheme) => {
    const blades = rng.int(4, 7);
    const reach = rng.float(4.0, 6.4);
    const folded = rng.int(0, blades - 1);
    const slabs: Slab[] = [];

    // Hub and stem.
    slabs.push({ x: -1.2, y: -1.2, z: -0.7, w: 2.4, d: 2.4, h: 1.5, round: 0.5 });
    slabs.push({ x: -0.8, y: -0.8, z: -5.4, w: 1.6, d: 1.6, h: 4.7, round: 0.34 });
    slabs.push({ x: -1.7, y: -1.7, z: -6.2, w: 3.4, d: 3.4, h: 1.0, round: 0.34, tone: "b" });

    for (let i = 0; i < blades; i++) {
      const a = ((360 * i) / blades + rng.float(0, 20)) * (Math.PI / 180);
      const shut = i === folded;
      // An opened blade lies out and slightly down; the folded one stands up
      // against the hub, at the length the others would have been.
      const len = shut ? 1.5 : reach;
      const lift = shut ? 3.4 : rng.float(-0.9, 0.4);
      const cx = Math.cos(a) * (shut ? 1.0 : len * 0.5);
      const cy = Math.sin(a) * (shut ? 1.0 : len * 0.5);
      slabs.push({
        x: cx - (shut ? 0.7 : len * 0.5),
        y: cy - (shut ? 0.7 : 1.1),
        z: (shut ? -0.2 : lift) - (shut ? 0 : 0.35),
        w: shut ? 1.4 : len,
        d: shut ? 1.4 : 2.2,
        h: shut ? lift : 0.75,
        round: 0.26,
        tone: i % 2 === 1 ? "b" : "a",
      });
    }

    // A catch on the hub that the folded blade is caught under.
    const catchRun = chain(
      "catch",
      [
        [0, 0, 0.8],
        [rng.float(-0.6, 0.6), rng.float(-0.6, 0.6), rng.float(1.8, 3.0)],
      ],
      (t) => rng.float(0.45, 0.65) + (t > 0.6 ? rng.float(0.3, 0.7) : 0),
      "b",
    );

    return {
      scheme,
      nodes: catchRun.nodes,
      links: catchRun.links,
      slabs,
      notes: {
        structure: `${blades} plates fanned from a hub on a single stem, one of them still folded up against it.`,
        suggests: "Opening out, and closing again. The folded plate is the only sign the others were ever shut.",
        balance: "On one stem, under a spread much wider than its own foot.",
        register: "Made. Every plate is the same plate at a different stage.",
      },
    };
  },
};

export const NEW_ARCHETYPES: Archetype[] = [
  inverting,
  dispersed,
  emitting,
  paired,
  shifting,
  deploying,
];
