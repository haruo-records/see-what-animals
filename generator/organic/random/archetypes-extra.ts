import type { Slab } from "../types";
import type { Rng } from "../../random/seeded-random";
import type { Archetype } from "./archetypes";
import { merge, chain, loop, ringPoints, type Part } from "../grow";

/**
 * SIX MORE WAYS OF LIVING.
 *
 * Added because eight structures cannot fill twelve slots without repeating,
 * and a repeat in a different colour is the one outcome this generator is not
 * allowed to produce. Fourteen structures means a batch of twelve can give
 * every individual a structure of its own with two left over.
 *
 * Each began from what the thing does, not from what it looks like. The
 * encrusting sheet exists because something has to live on the surface of
 * something else; the tuned bar exists because something has to sound. Neither
 * was arrived at by looking for a shape nobody had drawn yet.
 */

/* ── GROWN ──────────────────────────────────────────────────────────────── */

/** Lives on the surface of something else: a crust with growths rising off it. */
const encrusting: Archetype = {
  name: "encrusting",
  dna: { purpose: "lives on the surface of something else", structure: "crust on a member", support: "rests on its whole underside", symmetry: "serial", connection: "grown continuous", material: "unglazed ceramic", rhythm: "irregular" },
  register: "grown",
  build: (rng, scheme) => {
    const spanX = rng.float(11, 15);
    const lumps = rng.int(7, 11);

    // The host: a plain slab, so the crust plainly belongs to something.
    const host: Slab[] = [
      { x: -spanX / 2, y: -1.4, z: -3.2, w: spanX, d: 3.0, h: rng.float(1.2, 1.9), round: 0.3, tone: "b" },
    ];

    const crust = chain(
      "crust",
      Array.from({ length: 5 }, (_, i) => {
        const t = i / 4;
        return [-spanX / 2 + spanX * t, 0.6 - 1.4 * t, -1.4 + rng.float(-0.2, 0.3)] as [number, number, number];
      }),
      () => rng.float(1.1, 1.5),
    );

    const growths = Array.from({ length: lumps }, (_, i) => {
      const t = (i + 0.5) / lumps;
      const x = -spanX / 2 + spanX * t;
      const y = 0.6 - 1.4 * t + rng.float(-0.7, 0.7);
      const h = rng.float(0.9, 2.8);
      return chain(
        `lump${i}`,
        [
          [x, y, -1.2],
          [x + rng.float(-0.3, 0.3), y, -1.2 + h],
        ],
        (t2) => rng.float(0.45, 0.7) + (t2 > 0.5 ? rng.float(0.2, 0.55) : 0),
      );
    });

    const part = merge(crust, ...growths);
    return {
      scheme,
      nodes: part.nodes,
      links: [
        ...part.links,
        ...growths.map((_, i) => ({ a: `crust-${Math.min(4, Math.round((i / lumps) * 4))}`, b: `lump${i}-0` })),
      ],
      slabs: host,
      notes: {
        structure: `A crust spread along a plain member, with ${lumps} growths rising off it.`,
        suggests: "Living on something else. The member underneath is not part of it and is not doing anything.",
        balance: "Rests on its whole underside. It has no support of its own and does not need one.",
        register: "Grown, on something built.",
      },
    };
  },
};

/** Drifts and filters: everything hangs, nothing stands. */
const hanging: Archetype = {
  name: "hanging",
  dna: { purpose: "drifts, and filters as it goes", structure: "bar with hanging strands", support: "hangs from above", symmetry: "serial", connection: "hung", material: "soft resin", rhythm: "even" },
  register: "grown",
  build: (rng, scheme) => {
    const strands = rng.int(5, 8);
    const spanX = rng.float(8, 11);

    const bar = chain(
      "bar",
      Array.from({ length: 4 }, (_, i) => {
        const t = i / 3;
        return [-spanX / 2 + spanX * t, 2.4 - 4.8 * t, 3.4 + Math.sin(t * Math.PI) * rng.float(0.4, 1.2)] as [
          number,
          number,
          number,
        ];
      }),
      (t) => rng.float(1.0, 1.4) + 0.3 * Math.sin(t * Math.PI),
    );

    const drops = Array.from({ length: strands }, (_, i) => {
      const t = (i + 0.5) / strands;
      const x = -spanX / 2 + spanX * t;
      const y = 2.4 - 4.8 * t;
      const top = 3.4 + Math.sin(t * Math.PI) * 0.8 - 0.8;
      const len = rng.float(2.6, 6.4);
      const beads = rng.int(2, 4);
      const pts: Array<[number, number, number]> = [[x, y, top]];
      for (let b = 1; b <= beads; b++) pts.push([x + rng.float(-0.4, 0.4), y, top - (len * b) / beads]);
      return chain(`str${i}`, pts, (t2) => rng.float(0.3, 0.42) + (t2 > 0.8 ? rng.float(0.4, 0.8) : 0), "b");
    });

    const part = merge(bar, ...drops);
    return {
      scheme,
      nodes: part.nodes,
      links: [
        ...part.links,
        ...drops.map((_, i) => ({ a: `bar-${Math.min(3, Math.round(((i + 0.5) / strands) * 3))}`, b: `str${i}-0` })),
      ],
      notes: {
        structure: `A bar with ${strands} strands hanging from it, each beaded at intervals.`,
        suggests: "Drifting, and taking something out of whatever passes through the strands.",
        balance: "Hangs. There is no underside and nothing to stand it on.",
        register: "Grown. Nothing here would hold itself up.",
      },
    };
  },
};

/** Protects what is inside it: an open cage around a small mass. */
const cage: Archetype = {
  name: "cage",
  dna: { purpose: "protects what is inside it", structure: "ribbed cage", support: "a single stem", symmetry: "radial", connection: "grown continuous", material: "polished wood", rhythm: "even with one missing" },
  register: "grown",
  build: (rng, scheme) => {
    const ribs = rng.int(4, 6);
    const radius = rng.float(3.0, 4.2);
    const gap = rng.int(0, ribs - 1);

    const kernel = chain(
      "kernel",
      [
        [0, 0, -0.4],
        [rng.float(-0.4, 0.4), rng.float(-0.4, 0.4), 0.7],
      ],
      () => rng.float(1.2, 1.7),
    );

    const cap = chain("cap", [[0, 0, radius * 0.92], [0, 0, radius * 1.05]], () => rng.float(0.7, 1.0), "b");
    const foot = chain("foot", [[0, 0, -radius * 1.02], [0, 0, -radius * 0.9]], () => rng.float(0.9, 1.2), "b");

    // Ribs from the foot up and over to the cap. One is left out.
    const ribParts: Part[] = [];
    for (let i = 0; i < ribs; i++) {
      if (i === gap) continue;
      const a = ((360 * i) / ribs + rng.float(0, 12)) * (Math.PI / 180);
      const pts: Array<[number, number, number]> = [];
      for (let k = 0; k <= 6; k++) {
        const u = k / 6;
        const theta = Math.PI * u;
        const r = Math.sin(theta) * radius;
        pts.push([Math.cos(a) * r, Math.sin(a) * r, Math.cos(theta) * -radius]);
      }
      ribParts.push(chain(`rib${i}`, pts, (t) => rng.float(0.38, 0.55) + 0.18 * Math.sin(t * Math.PI), "b"));
    }

    const part = merge(kernel, cap, foot, ...ribParts);
    const links = [...part.links];
    for (let i = 0; i < ribs; i++) {
      if (i === gap) continue;
      links.push({ a: "foot-1", b: `rib${i}-0`, tone: "b" as const });
      links.push({ a: `rib${i}-6`, b: "cap-0", tone: "b" as const });
    }
    links.push({ a: "kernel-0", b: "foot-1" });

    return {
      scheme,
      nodes: part.nodes,
      links,
      notes: {
        structure: `An open cage of ${ribs - 1} ribs around a small mass, with one rib missing.`,
        suggests: "Protecting what is inside. The gap where the missing rib would be is the only way in.",
        balance: "Sits on one small foot, with everything else arranged around a centre.",
        register: "Grown. Ribbed, like a seed case.",
      },
    };
  },
};

/** Carries along its own length: a segmented body that travels. */
const segmented: Archetype = {
  name: "segmented",
  dna: { purpose: "stores what it takes in", structure: "segmented spine", support: "many small contacts", symmetry: "serial", connection: "grown continuous", material: "soft resin", rhythm: "graded" },
  register: "grown",
  build: (rng, scheme) => {
    const segs = rng.int(5, 8);
    const spanX = rng.float(11, 15);
    const swollen = rng.int(1, segs - 2);

    const spine = chain(
      "spine",
      Array.from({ length: segs }, (_, i) => {
        const t = i / (segs - 1);
        return [-spanX / 2 + spanX * t, 3.0 - 6.0 * t, -1.2 + Math.sin(t * Math.PI * 1.2) * rng.float(0.8, 2.0)] as [
          number,
          number,
          number,
        ];
      }),
      (t) => rng.float(0.85, 1.1) - 0.25 * t,
    );

    const nodesOn = spine.nodes.map((n, i) => {
      const big = i === swollen;
      return chain(
        `seg${i}`,
        [[n.x, n.y, n.z + rng.float(0.5, 0.9)]],
        () => (big ? rng.float(2.0, 2.6) : rng.float(1.1, 1.5)),
        i % 2 === 1 ? "b" : "a",
      );
    });

    const part = merge(spine, ...nodesOn);
    return {
      scheme,
      nodes: part.nodes,
      links: [...part.links, ...nodesOn.map((_, i) => ({ a: `spine-${i}`, b: `seg${i}-0` }))],
      notes: {
        structure: `Segmented. ${segs} swellings on a common spine, one of them well oversized.`,
        suggests: "Carrying along its own length. Each segment has to be got over in turn.",
        balance: "In the oversized segment — the middle of a chain, which is not where a chain wants its weight.",
        register: "Grown. Nothing about it was fitted.",
      },
    };
  },
};

/* ── BUILT ──────────────────────────────────────────────────────────────── */

/** Raises something clear: three legs meeting under a small platform. */
const tripod: Archetype = {
  name: "tripod",
  dna: { purpose: "raises something clear", structure: "three-legged stand", support: "many small contacts", symmetry: "radial", connection: "socketed", material: "worked metal", rhythm: "even" },
  register: "built",
  build: (rng, scheme) => {
    const spread = rng.float(3.4, 4.8);
    const height = rng.float(6.0, 8.0);
    const legs: Slab[] = [];

    const feet = ringPoints([0, 0, 0], spread, 3, "xy", rng.float(0, 60));
    for (let i = 0; i < 3; i++) {
      const [fx, fy] = feet[i];
      const steps = 3;
      for (let k = 0; k < steps; k++) {
        const t = k / steps;
        const t2 = (k + 1.15) / steps;
        legs.push({
          x: fx * (1 - t) - 0.7,
          y: fy * (1 - t) - 0.7,
          z: -height / 2 + height * t,
          w: 1.4 + (fx * (1 - t) - fx * (1 - t2)) * 0.5 + 0.6,
          d: 1.4 + Math.abs(fy * (1 - t) - fy * (1 - t2)) + 0.4,
          h: (height / steps) * 1.15,
          round: 0.34,
          tone: k === 1 ? "b" : "a",
        });
      }
      legs.push({ x: fx - 1.1, y: fy - 1.1, z: -height / 2 - 0.7, w: 2.2, d: 2.2, h: 1.0, round: 0.34, tone: "b" });
    }

    const deck = rng.float(2.6, 3.6);
    legs.push({ x: -deck / 2, y: -deck / 2, z: height / 2 - 0.5, w: deck, d: deck, h: 1.0, round: 0.36 });
    legs.push({ x: -deck / 2 + 0.4, y: -deck / 2 + 0.4, z: height / 2 + 0.5, w: deck - 0.8, d: deck - 0.8, h: 0.6, round: 0.24, tone: "b" });

    const held = chain(
      "held",
      [
        [0, 0, height / 2 + 1.1],
        [rng.float(-0.5, 0.5), rng.float(-0.5, 0.5), height / 2 + rng.float(2.2, 3.4)],
      ],
      (t) => rng.float(0.7, 0.95) + (t > 0.5 ? rng.float(0.5, 1.0) : 0),
    );

    return {
      scheme,
      nodes: held.nodes,
      links: held.links,
      slabs: legs,
      notes: {
        structure: "Three legs of stepped members meeting under a small platform.",
        suggests: "Raising something clear of whatever is below. What it raises is small and not obviously worth it.",
        balance: "Centred, over three feet at equal spacing. The only symmetrical thing in the set.",
        register: "Built. Every member is a member.",
      },
    };
  },
};

/** Connects two things: a junction where several runs meet a box. */
const junction: Archetype = {
  name: "junction",
  dna: { purpose: "connects two things", structure: "junction with runs", support: "no clear support at all", symmetry: "none", connection: "socketed", material: "worked metal", rhythm: "irregular" },
  register: "built",
  build: (rng, scheme) => {
    const arms = rng.int(3, 5);
    const boxW = rng.float(3.0, 4.0);

    const body: Slab[] = [
      { x: -boxW / 2, y: -boxW / 2, z: -boxW / 2, w: boxW, d: boxW, h: boxW, round: 0.5 },
      { x: -boxW / 2 - 0.3, y: -boxW / 2 - 0.3, z: -boxW / 2 + boxW * 0.36, w: boxW + 0.6, d: boxW + 0.6, h: boxW * 0.26, round: 0.24, tone: "b" },
    ];

    const dirs: Array<[number, number, number]> = [
      [1, -0.5, 0.15],
      [-1, 0.6, -0.1],
      [0.2, 1, 0.5],
      [-0.3, -1, 0.4],
      [0, 0, 1],
    ];

    const runs = Array.from({ length: arms }, (_, i) => {
      const d = dirs[i % dirs.length];
      const len = rng.float(4.0, 7.0);
      const n = Math.hypot(...d);
      const u = d.map((v) => v / n) as [number, number, number];
      return chain(
        `run${i}`,
        [
          [u[0] * boxW * 0.3, u[1] * boxW * 0.3, u[2] * boxW * 0.3],
          [u[0] * len * 0.6, u[1] * len * 0.6, u[2] * len * 0.6],
          [u[0] * len, u[1] * len, u[2] * len],
        ],
        (t) => rng.float(0.55, 0.8) - 0.12 * t + (t > 0.85 ? rng.float(0.35, 0.7) : 0),
        i % 2 === 1 ? "b" : "a",
      );
    });

    const part = merge(...runs);
    return {
      scheme,
      nodes: part.nodes,
      links: part.links,
      slabs: body,
      notes: {
        structure: `A junction box with ${arms} runs leaving it in different directions, none of them parallel.`,
        suggests: "Connecting. Everything arrives here and leaves again, and none of the runs reach anything.",
        balance: "No clear support. It sits at the middle of its own arms.",
        register: "Built. Plainly a fitting from something larger.",
      },
    };
  },
};

/** Resonates: a long tuned member on a heavy seat, with a lodged mass. */
const resonator: Archetype = {
  name: "resonator",
  dna: { purpose: "resonates", structure: "tuned bars on a seat", support: "cantilevered from one side", symmetry: "serial", connection: "clamped", material: "worked metal", rhythm: "graded" },
  register: "built",
  build: (rng, scheme) => {
    const len = rng.float(13, 17);
    const bars = rng.int(3, 5);
    const slabs: Slab[] = [];

    // A seat at one end, heavy, and a run of bars of graded length along it.
    slabs.push({ x: -len / 2 - 0.6, y: -1.0, z: -2.4, w: 3.4, d: 4.0, h: rng.float(2.6, 3.6), round: 0.4, tone: "b" });
    slabs.push({ x: -len / 2 + 1.6, y: -0.6, z: -0.6, w: len - 2.0, d: 2.6, h: rng.float(1.0, 1.5), round: 0.34 });

    for (let i = 0; i < bars; i++) {
      const t = i / Math.max(1, bars - 1);
      const x = -len / 2 + 2.6 + (len - 5.4) * t;
      const h = rng.float(1.6, 3.6) * (1 - t * 0.45);
      slabs.push({
        x,
        y: -1.9,
        z: 0.3,
        w: rng.float(1.1, 1.7),
        d: 1.5,
        h,
        round: 0.28,
        tone: i % 2 === 0 ? "b" : "a",
      });
    }

    const lodged = chain(
      "lodged",
      [
        [rng.float(-1.0, 2.0), -1.2, 0.6],
        [rng.float(-1.0, 2.0), -2.6, 0.5],
      ],
      () => rng.float(0.8, 1.1),
    );

    return {
      scheme,
      nodes: lodged.nodes,
      links: lodged.links,
      slabs,
      notes: {
        structure: `A long member on a heavy seat, with ${bars} graded bars standing along it.`,
        suggests: "Sounding. The bars shorten along the length, which is what a tuned run does.",
        balance: "Low and far to one end, in the seat. The rest lies out along its own length.",
        register: "Built. The most obviously made thing in the set.",
      },
    };
  },
};

export const EXTRA_ARCHETYPES: Archetype[] = [
  encrusting,
  hanging,
  cage,
  segmented,
  tripod,
  junction,
  resonator,
];
