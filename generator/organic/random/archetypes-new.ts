import type { Slab, Node } from "../types";
import type { Archetype } from "./archetypes";
import { merge, chain, loop, ringPoints, type Part } from "../grow";

/**
 * THE SIX, REDESIGNED SO THE PRINCIPLE IS VISIBLE.
 *
 * The first version of these passed on metadata and failed on sight. Every one
 * differed from the existing structures in four traits or more, and several
 * still read as a variation on something already in the set — because the trait
 * that made them different was recorded in a field rather than drawn.
 *
 * So the test has changed. Not "does the DNA differ" but "with the caption
 * covered, does this look like it does something the others do not". Nobody has
 * to guess the right answer; they have to be able to tell that there is one.
 *
 * Two of these needed the single-silhouette rule lifted to work at all. A thing
 * that releases something cannot show the something still attached to it, and a
 * pair cannot be one object with a seam down the middle. Where parts are
 * detached they are held together by geometry — one line, one ratio, a rhythm
 * of spacing, a matching profile — and never by anything drawn in.
 */

/* ── ORGANIC ────────────────────────────────────────────────────────────── */

/**
 * INVERTING — a wall that rises to a rim, rolls over it, and comes back down
 * inside, bringing its lining out with it.
 *
 * The first version was a ring of runs between two rings, which is a cage or a
 * flower and read as one. The fix is not more geometry but tone: the outer
 * surface is the body colour, the lining is pale, and past the fold the pale is
 * on the outside. One surface, both faces, and the swap happens at the widest
 * part of the form where it cannot be missed.
 */
const inverting: Archetype = {
  name: "inverting",
  dna: {
    motion: "inverts",
    register: "organic",
    silhouette: "enclosing",
    plurality: "solitary",
    purpose: "turns itself inside out",
    structure: "wall folded out through its own mouth",
    support: "one broad foot",
    symmetry: "none",
    connection: "grown continuous",
    material: "soft resin",
    rhythm: "none",
  },
  build: (rng, scheme) => {
    const segments = rng.int(7, 8);
    const mouthR = rng.float(3.4, 4.6);
    const depth = rng.float(4.0, 6.0);
    const returnR = rng.float(1.5, 2.4);
    const start = rng.float(0, 40);

    const rim = loop("rim", ringPoints([0, 0, 0], mouthR, segments, "xy", start, 0.1), () => rng.float(0.95, 1.3));
    const base = loop(
      "base",
      ringPoints([0, 0, -depth], mouthR * 0.42, segments, "xy", start, 0.1),
      () => rng.float(0.85, 1.15),
    );

    // The outer wall, in the body colour.
    const outerWall: Part[] = [];
    for (let i = 0; i < segments; i++) {
      const a = rim.nodes[i];
      const b = base.nodes[i];
      outerWall.push(
        chain(
          `out${i}`,
          [
            [a.x, a.y, a.z],
            [b.x, b.y, b.z],
          ],
          () => rng.float(0.72, 0.95),
        ),
      );
    }

    // The turn, and everything past it drawn in the lining colour, because
    // past it the lining is what faces out.
    const fold = loop(
      "fold",
      ringPoints([0, 0, rng.float(0.5, 1.1)], mouthR * 0.9, segments, "xy", start, 0.1),
      () => rng.float(0.8, 1.1),
      "b",
    );
    const ret = loop(
      "ret",
      ringPoints([0, 0, -depth * rng.float(0.25, 0.5)], returnR, segments, "xy", start, 0.14),
      () => rng.float(0.55, 0.8),
      "b",
    );

    const innerWall: Part[] = [];
    for (let i = 0; i < segments; i++) {
      const a = fold.nodes[i];
      const b = ret.nodes[i];
      innerWall.push(
        chain(
          `in${i}`,
          [
            [a.x, a.y, a.z],
            [b.x, b.y, b.z],
          ],
          () => rng.float(0.5, 0.72),
          "b",
        ),
      );
    }

    // The returned end, standing back up out of the middle: the inside, now
    // plainly outside and above everything else.
    const emerged = chain(
      "emerged",
      [
        [0, 0, -depth * 0.3],
        [rng.float(-0.4, 0.4), rng.float(-0.4, 0.4), rng.float(1.4, 2.6)],
        [rng.float(-0.8, 0.8), rng.float(-0.8, 0.8), rng.float(3.0, 4.6)],
      ],
      (t) => rng.float(0.75, 1.0) - 0.2 * t + (t > 0.8 ? rng.float(0.5, 1.0) : 0),
      "b",
    );

    const foot = chain(
      "foot",
      [
        [mouthR * 0.3, mouthR * 0.25, -depth - 0.2],
        [mouthR * 0.36, mouthR * 0.3, -depth - rng.float(1.0, 1.8)],
      ],
      () => rng.float(1.5, 2.0),
    );

    const part = merge(rim, base, fold, ret, ...outerWall, ...innerWall, emerged, foot);
    const links = [...part.links];
    for (let i = 0; i < segments; i++) {
      links.push({ a: `rim-${i}`, b: `out${i}-0` });
      links.push({ a: `out${i}-1`, b: `base-${i}` });
      links.push({ a: `rim-${i}`, b: `fold-${i}`, tone: "b" });
      links.push({ a: `fold-${i}`, b: `in${i}-0`, tone: "b" });
      links.push({ a: `in${i}-1`, b: `ret-${i}`, tone: "b" });
    }
    links.push({ a: "ret-0", b: "emerged-0", tone: "b" });
    links.push({ a: `base-${Math.floor(segments / 6)}`, b: "foot-0" });

    return {
      scheme,
      nodes: part.nodes,
      links,
      notes: {
        structure: `A wall of ${segments} runs rising to a rim, rolling over it and returning down the inside — pale from the fold onward, because past the fold the lining faces out.`,
        suggests: "Turning itself inside out. The change of colour is one surface seen from its other side.",
        balance: "On one thickened foot under the rim, off the axis everything else turns about.",
        register: "Grown. One continuous surface, including the part that used to be the lining.",
      },
    };
  },
};

/**
 * DISPERSED — bodies at widening intervals, most on struts too thin to be the
 * point, the last of them on nothing at all.
 *
 * The first version put them on even struts around a hub, which is a radial
 * spray. Here the intervals grow by a ratio, the struts are starved until they
 * nearly vanish, and the middle is left empty. The spacing is the structure.
 */
const dispersed: Archetype = {
  name: "dispersed",
  cohesion: { min: 2, max: 3 },
  // Being mostly empty is the point of this one.
  minCoverage: 0.02,
  dna: {
    motion: "spaces itself apart",
    register: "organic",
    silhouette: "scattered",
    plurality: "colonial",
    purpose: "keeps its own parts apart",
    structure: "bodies at graded intervals",
    support: "many small contacts",
    symmetry: "none",
    connection: "grown continuous",
    material: "unglazed ceramic",
    rhythm: "graded",
  },
  build: (rng, scheme) => {
    const held = rng.int(3, 4);
    const loose = rng.int(1, 2);
    const total = held + loose;
    const arc = rng.float(120, 210) * (Math.PI / 180);
    const start = rng.float(0, Math.PI * 2);
    const first = rng.float(3.0, 4.0);
    const growth = rng.float(1.34, 1.62);

    // The anchor is small on purpose. It is not the subject.
    const anchor = chain(
      "anchor",
      [
        [0, 0, -0.5],
        [rng.float(-0.3, 0.3), rng.float(-0.3, 0.3), 0.4],
      ],
      () => rng.float(0.7, 1.0),
      "b",
    );

    const distanceTo = (i: number) => (first * (Math.pow(growth, i + 1) - 1)) / (growth - 1);

    const parts: Part[] = [anchor];
    const links: Array<{ a: string; b: string; tone?: "a" | "b" }> = [];
    const at: Array<[number, number, number]> = [];

    for (let i = 0; i < total; i++) {
      const t = i / Math.max(1, total - 1);
      const a = start + arc * t;
      const d = distanceTo(i);
      const lift = Math.sin(t * Math.PI * 0.9) * rng.float(1.4, 3.2) - 0.8;
      const bx = Math.cos(a) * d;
      const by = Math.sin(a) * d;
      at.push([bx, by, lift]);

      // Bodies shrink along the run, so the widening gaps read as a rule rather
      // than as a form that ran out of material.
      const size = rng.float(1.5, 2.0) * (1 - t * 0.4);
      const lobes = rng.int(1, 3);
      const pts: Array<[number, number, number]> = [[bx, by, lift]];
      for (let k = 0; k < lobes; k++) {
        const ang = a + rng.float(-1.1, 1.1);
        pts.push([bx + Math.cos(ang) * size * 0.85, by + Math.sin(ang) * size * 0.85, lift + rng.float(-0.7, 0.9)]);
      }
      parts.push(chain(`body${i}`, pts, (u) => size * (1 - u * 0.28)));

      if (i < held) {
        const from: [number, number, number] = i === 0 ? [0, 0, 0.3] : at[i - 1];
        parts.push(
          chain(
            `link${i}`,
            [
              [from[0] + (bx - from[0]) * 0.2, from[1] + (by - from[1]) * 0.2, from[2] + (lift - from[2]) * 0.2],
              [from[0] + (bx - from[0]) * 0.55, from[1] + (by - from[1]) * 0.55, from[2] + (lift - from[2]) * 0.55],
              [from[0] + (bx - from[0]) * 0.85, from[1] + (by - from[1]) * 0.85, from[2] + (lift - from[2]) * 0.85],
            ],
            () => rng.float(0.2, 0.3),
            "b",
          ),
        );
        links.push({ a: i === 0 ? "anchor-1" : `body${i - 1}-0`, b: `link${i}-0`, tone: "b" });
        links.push({ a: `link${i}-2`, b: `body${i}-0` });
      }
      // The last one or two keep the rhythm with nothing holding them.
    }

    const part = merge(...parts);
    return {
      scheme,
      nodes: part.nodes,
      links: [...part.links, ...links],
      notes: {
        structure: `${total} bodies along an arc at intervals that widen by a fixed ratio — ${held} on hair-thin struts, the rest on nothing.`,
        suggests: "Keeping its own parts apart. The gaps grow by a rule, and the run carries on past where anything reaches.",
        balance: "Nowhere in particular. The mass is all out along the arc and the middle is empty.",
        register: "Grown. The struts are the same material as the bodies, starved until they nearly disappear.",
      },
    };
  },
};

/* ── HYBRID ─────────────────────────────────────────────────────────────── */

/**
 * EMITTING — a chamber, and a train of masses leaving it that is no longer
 * touching it.
 *
 * The first version tied the train back to the throat with a thin run, to
 * satisfy a rule about single silhouettes, and it read as a long thin limb.
 * Detaching it is the entire fix. What holds the parts together now is that
 * they sit on one line, shrink by a constant ratio, and space themselves at a
 * widening interval: three rules, and between them the separate pieces read as
 * one event rather than as scattered debris.
 */
const emitting: Archetype = {
  name: "emitting",
  cohesion: { min: 4, max: 9 },
  // The train is nearly all gap by the far end, by design.
  minCoverage: 0.015,
  dna: {
    motion: "releases outward",
    register: "hybrid",
    silhouette: "spreading",
    plurality: "solitary",
    purpose: "releases something outward",
    structure: "chamber and a detached train",
    support: "one broad foot",
    symmetry: "none",
    connection: "socketed",
    material: "cast stone",
    rhythm: "graded",
  },
  build: (rng, scheme) => {
    const grains = rng.int(4, 7);
    const rise = rng.float(0.22, 0.62);
    const swing = rng.float(-0.34, 0.34);
    const widen = rng.float(1.28, 1.6);

    const slabs: Slab[] = [
      { x: -3.4, y: -2.1, z: -2.0, w: rng.float(3.6, 4.8), d: 4.0, h: rng.float(3.2, 4.6), round: 0.46 },
      { x: -3.8, y: -2.5, z: -3.2, w: rng.float(4.4, 5.6), d: 4.8, h: 1.2, round: 0.32, tone: "b" },
      { x: -0.4, y: -1.3, z: -0.5, w: 1.9, d: 2.4, h: 2.2, round: 0.5, tone: "b" },
    ];

    const throat = chain(
      "throat",
      [
        [1.3, -0.2, 0.6],
        [2.1, -0.2 + swing * 0.5, 0.6 + rise * 0.5],
        [2.7, -0.2 + swing, 0.6 + rise],
      ],
      (t) => rng.float(1.15, 1.5) - 0.62 * t,
    );

    const train: Node[] = [];
    let d = 2.7;
    let gap = rng.float(2.0, 2.9);
    for (let i = 0; i < grains; i++) {
      d += gap;
      gap *= widen;
      const t = (i + 1) / grains;
      train.push({
        id: `grain-${i}`,
        x: d,
        y: -0.2 + swing * (1 + t * 2.2),
        z: 0.6 + rise * (1 + t * 3.4),
        r: rng.float(1.0, 1.35) * Math.pow(0.75, i),
        tone: i % 2 === 1 ? "b" : "a",
      });
    }

    return {
      scheme,
      nodes: [...throat.nodes, ...train],
      links: throat.links,
      slabs,
      notes: {
        structure: `A chamber with a throat, and ${grains} separate masses along the line it points down — each smaller than the last, each further from its neighbour.`,
        suggests: "Releasing something outward. Nothing joins the train to the chamber, and nothing needs to.",
        balance: "All of it in the chamber. Past the throat there is almost no weight and no support at all.",
        register: "A made chamber, with something not made leaving it.",
      },
    };
  },
};

/**
 * PAIRED — two separate bodies, one carrying a boss and one opening into the
 * hollow that boss belongs in, each leaning towards the other.
 *
 * The first version joined them with a bridge to keep the silhouette single,
 * and a bridge between two halves makes one cracked object. Here nothing
 * touches. They are a pair because the shape of one is the negative of the
 * other, and because neither stands straight: each leans the way it would fall
 * if the other were not there.
 */
const paired: Archetype = {
  name: "paired",
  cohesion: { min: 2, max: 2 },
  dna: {
    motion: "works against a partner",
    register: "hybrid",
    silhouette: "compact",
    plurality: "paired",
    purpose: "works only with a partner",
    structure: "boss and socket across a gap",
    support: "a pair of feet",
    symmetry: "bilateral",
    connection: "clamped",
    material: "worked metal",
    rhythm: "none",
  },
  build: (rng, scheme) => {
    /**
     * The gap has to survive the projection, not just exist in the model.
     *
     * At the first sizes the boss very nearly filled it, and once the two
     * bodies were flattened into isometric they touched — so the pair rendered
     * as one object with a bulge, which is the exact failure the redesign was
     * for. The boss now stops well short, and the two bodies keep the same
     * depth so the projection shifts both by the same amount.
     */
    const gap = rng.float(5.0, 7.0);
    const bossR = rng.float(1.0, 1.4);
    const lean = rng.float(0.6, 1.2);
    const h = rng.float(5.2, 7.0);
    const slabs: Slab[] = [];

    // The bearer: a column leaning towards the gap, carrying a rounded boss.
    const ax = -gap / 2 - 1.8;
    slabs.push({ x: ax - 1.0, y: -2.1, z: -h / 2 - 1.0, w: 3.4, d: 4.0, h: 1.2, round: 0.34, tone: "b" });
    const tiersA = rng.int(3, 4);
    for (let k = 0; k < tiersA; k++) {
      const t = k / tiersA;
      slabs.push({
        x: ax - 0.7 + lean * t,
        y: -1.7,
        z: -h / 2 + (h * k) / tiersA,
        w: 2.2 - k * 0.16,
        d: 3.2 - k * 0.28,
        h: (h / tiersA) * 1.14,
        round: 0.38,
        tone: k % 2 === 1 ? "b" : "a",
      });
    }
    const boss = chain(
      "boss",
      [
        [ax + 0.5 + lean, -1.2, h / 2 - 0.9],
        [-gap / 2 - 0.6, -1.2, h / 2 - 0.9],
      ],
      (t) => bossR * (0.7 + 0.3 * t),
    );

    // The receiver: a column leaning back the other way, opening into jaws set
    // at the boss's diameter with clearance. The hollow is described by what is
    // missing from it.
    const bx = gap / 2 + 1.8;
    slabs.push({ x: bx - 2.4, y: -2.1, z: -h / 2 - 1.0, w: 3.4, d: 4.0, h: 1.2, round: 0.34, tone: "b" });
    const tiersB = rng.int(3, 4);
    for (let k = 0; k < tiersB; k++) {
      const t = k / tiersB;
      slabs.push({
        x: bx - 1.5 - lean * t,
        y: -1.7,
        z: -h / 2 + (h * k) / tiersB,
        w: 2.2 - k * 0.16,
        d: 3.2 - k * 0.28,
        h: (h / tiersB) * 1.14,
        round: 0.38,
        tone: k % 2 === 1 ? "b" : "a",
      });
    }

    const jaw = bossR * 2 + rng.float(0.5, 0.9);
    const jawX = gap / 2 + 0.1;
    for (const side of [-1, 1]) {
      slabs.push({
        x: jawX,
        y: -1.2,
        z: h / 2 - 0.9 + (side * jaw) / 2 - 0.42,
        w: rng.float(2.0, 2.8),
        d: 2.2,
        h: 0.85,
        round: 0.3,
        tone: "b",
      });
    }
    slabs.push({
      x: jawX + 1.5,
      y: -1.2,
      z: h / 2 - 0.9 - jaw / 2 - 0.42,
      w: 1.1,
      d: 2.2,
      h: jaw + 0.85,
      round: 0.3,
      tone: "b",
    });

    return {
      scheme,
      nodes: boss.nodes,
      links: boss.links,
      slabs,
      notes: {
        structure: `Two separate bodies across a gap: one carrying a rounded boss, one opening into jaws set at that boss's diameter.`,
        suggests: "Working only with a partner. Neither is a whole thing, and the gap between them is the shape they share.",
        balance: "Neither is upright. Each leans the way it would fall if the other were not there.",
        register: "Made members either side of an empty middle.",
      },
    };
  },
};

/* ── MECHANICAL ─────────────────────────────────────────────────────────── */

/**
 * SHIFTING — a body on a curved underside too narrow to stand on, tipped over,
 * with a heavy mass far out on one arm.
 *
 * The first version drew a rail and a weight, which is a machine part and read
 * as one. There is no rail here. There is a rocker, a weight too far out to
 * ignore, and a lean — so the posture is plainly a consequence of where the
 * weight is, and plainly reversible if it moved.
 */
const shifting: Archetype = {
  name: "shifting",
  dna: {
    motion: "shifts its weight",
    register: "mechanical",
    silhouette: "compact",
    plurality: "solitary",
    purpose: "moves a weight inside itself",
    structure: "rocker under an offset weight",
    support: "one broad foot",
    symmetry: "none",
    connection: "socketed",
    material: "worked metal",
    rhythm: "none",
  },
  build: (rng, scheme) => {
    const tip = rng.float(0.24, 0.44) * (rng.bool(0.5) ? 1 : -1);
    const armLen = rng.float(5.0, 7.4);
    const bodyH = rng.float(4.4, 6.2);
    const slabs: Slab[] = [];

    // Built upright, then tipped about the foot, so the lean runs through every
    // member instead of being a detail added at the top.
    const lean = (x: number, z: number): [number, number] => [
      x * Math.cos(tip) - z * Math.sin(tip),
      x * Math.sin(tip) + z * Math.cos(tip),
    ];

    const rockerN = rng.int(5, 8);
    const rockR = rng.float(3.4, 5.0);
    // Each member is sized from the spacing so the arc is continuous whatever
    // the radius and count come out as. Sizing it by a constant left gaps at
    // the wide end and split the form into two bodies.
    const step = (Math.sin(0.44 * Math.PI * 0.5) * 2 * rockR) / Math.max(1, rockerN - 1);
    for (let i = 0; i < rockerN; i++) {
      const a = (-0.44 + 0.88 * (i / (rockerN - 1))) * Math.PI * 0.5;
      const [rx, rz] = lean(Math.sin(a) * rockR, -rockR + Math.cos(a) * rockR - 3.2);
      const w = step * 1.5 + 0.9;
      slabs.push({ x: rx - w / 2, y: -1.5, z: rz - 0.8, w, d: 3.0, h: 1.7, round: 0.34, tone: "b" });
    }

    const tiers = rng.int(3, 4);
    for (let k = 0; k < tiers; k++) {
      const t = k / tiers;
      const [cx, cz] = lean(0, -3.6 + (bodyH + 0.6) * t);
      const w = 2.3 - k * 0.26;
      slabs.push({
        x: cx - w / 2,
        y: -1.6,
        z: cz,
        w,
        d: 3.2 - k * 0.28,
        h: (bodyH / tiers) * 1.16,
        round: 0.38,
        tone: k % 2 === 1 ? "b" : "a",
      });
    }

    const dir = tip > 0 ? 1 : -1;
    const [ax0, az0] = lean(0, -3.0 + bodyH);
    const [ax1, az1] = lean(dir * armLen, -3.0 + bodyH + rng.float(-0.6, 0.8));
    const arm = chain(
      "arm",
      [
        [ax0, -0.2, az0],
        [(ax0 + ax1) / 2, -0.2, (az0 + az1) / 2 + rng.float(0, 0.5)],
        [ax1, -0.2, az1],
      ],
      (t) => rng.float(0.7, 0.95) - 0.22 * t,
    );

    const weight = chain(
      "weight",
      [
        [ax1, -0.2, az1],
        [ax1 + dir * rng.float(0.2, 0.7), -0.2, az1 - rng.float(1.2, 2.2)],
      ],
      (t) => rng.float(1.0, 1.3) + (t > 0.4 ? rng.float(1.0, 1.7) : 0),
    );

    // A counter-stub the other way, far too small to balance any of it.
    const [sx0, sz0] = lean(0, -3.0 + bodyH * 0.7);
    const [sx1, sz1] = lean(-dir * rng.float(1.6, 2.6), -3.0 + bodyH * 0.7);
    const stub = chain(
      "stub",
      [
        [sx0, -0.2, sz0],
        [sx1, -0.2, sz1],
      ],
      () => rng.float(0.42, 0.6),
      "b",
    );

    const part = merge(arm, weight, stub);
    return {
      scheme,
      nodes: part.nodes,
      links: [...part.links, { a: "arm-2", b: "weight-0" }],
      slabs,
      notes: {
        structure: `A body on a curved underside of ${rockerN} members, tipped over, with a heavy mass at the end of one long arm.`,
        suggests: "Moving a weight around inside itself. It leans because of where the weight is, and would lean the other way if the weight went the other way.",
        balance: "Off its foot entirely. Nothing holds this posture except the weight that caused it.",
        register: "Made. The underside is far too narrow for anything meant to stand still.",
      },
    };
  },
};

/**
 * DEPLOYING — plates on a hub, each caught at a different point of the same
 * travel, and one gone past open.
 *
 * The first version fanned them out equally with one left folded, which reads
 * as a fixed object with a defect. Staging them individually is what makes the
 * motion legible: a set of positions along one path is a sequence, and a
 * sequence implies something moves through it.
 */
const deploying: Archetype = {
  name: "deploying",
  dna: {
    motion: "unfolds",
    register: "mechanical",
    silhouette: "spreading",
    plurality: "solitary",
    purpose: "opens out, and closes again",
    structure: "plates caught mid-travel",
    support: "a single stem",
    symmetry: "radial",
    connection: "socketed",
    material: "worked metal",
    rhythm: "irregular",
  },
  build: (rng, scheme) => {
    const blades = rng.int(5, 7);
    const reach = rng.float(4.4, 6.6);
    const slabs: Slab[] = [];

    slabs.push({ x: -1.4, y: -1.4, z: -0.9, w: 2.8, d: 2.8, h: 1.8, round: 0.55 });
    slabs.push({ x: -0.85, y: -0.85, z: -5.8, w: 1.7, d: 1.7, h: 5.0, round: 0.34 });
    slabs.push({ x: -1.9, y: -1.9, z: -6.7, w: 3.8, d: 3.8, h: 1.1, round: 0.36, tone: "b" });

    // A stage per plate, spread across the whole travel and deliberately not
    // evenly: one still shut, one barely started, a cluster part-way, and one
    // that has gone past open and dropped below the rest.
    const stages = [0, rng.float(0.12, 0.3)];
    for (let i = 2; i < blades - 1; i++) stages.push(rng.float(0.42, 0.92));
    stages.push(rng.float(1.05, 1.22));

    for (let i = 0; i < blades; i++) {
      const a = ((360 * i) / blades + rng.float(0, 16)) * (Math.PI / 180);
      const s = stages[i];
      const open = Math.min(s, 1);

      // One plate interpolated along its travel: shut is short, tall and against
      // the hub; open is long, flat and out; past open it droops below.
      const len = 1.5 + (reach - 1.5) * open;
      const thick = 1.4 - 0.68 * open;
      const stand = 3.6 * Math.max(0, 1 - s * 1.35);
      const drop = s > 1 ? (s - 1) * 5.4 : 0;
      const outAt = 0.9 + (len * 0.5 - 0.9) * open;

      slabs.push({
        x: Math.cos(a) * outAt - len * 0.5 * Math.min(s + 0.3, 1),
        y: Math.sin(a) * outAt - (1.05 + thick * 0.4),
        z: -0.3 + stand * 0.5 - drop,
        w: len,
        d: 2.1 + thick * 0.5,
        h: 0.7 + stand,
        round: 0.26,
        tone: i % 2 === 1 ? "b" : "a",
      });
    }

    const catchRun = chain(
      "catch",
      [
        [0, 0, 0.9],
        [rng.float(-0.5, 0.5), rng.float(-0.5, 0.5), rng.float(2.0, 3.4)],
      ],
      (t) => rng.float(0.45, 0.68) + (t > 0.6 ? rng.float(0.35, 0.75) : 0),
      "b",
    );

    return {
      scheme,
      nodes: catchRun.nodes,
      links: catchRun.links,
      slabs,
      notes: {
        structure: `${blades} plates on one hub, each caught at a different point of the same travel — one still shut, one barely started, one gone past open and hanging below.`,
        suggests: "Opening out, and closing again. Every plate is the same plate at a different moment.",
        balance: "On one stem, under a spread wider on the side where more plates have opened.",
        register: "Made. Nothing here grew, and nothing here has finished moving.",
      },
    };
  },
};

export const NEW_ARCHETYPES: Archetype[] = [inverting, dispersed, emitting, paired, shifting, deploying];
