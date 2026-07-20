import type { Form } from "../types";
import type { Rng } from "../../random/seeded-random";
import { createRng } from "../../random/seeded-random";
import { ARCHETYPES, type Archetype, type Register } from "./archetypes";
import { SCHEMES } from "../palette";
import { distance, shared, MIN_DISTANCE, type Dna } from "./dna";

/**
 * CONSTRAINTS AND BATCH DIVERSITY.
 *
 * Randomising the archetypes is the easy half. This is the half that decides
 * whether a run is usable, and it does two separate jobs.
 *
 * Per form, it rejects the ones that came out wrong — disconnected, too sparse,
 * or badly out of proportion. A parameter range wide enough to be interesting
 * is always wide enough to produce failures at its corners, and the answer is
 * to throw those away rather than to narrow the range until nothing surprising
 * can happen.
 *
 * Per batch, it keeps the set varied. Twelve forms chosen independently will
 * cluster — that is what independent choices do — and a run that came out all
 * coral, or all in the same blue, would be a worse result than any single form
 * in it. So the batch is chosen with the earlier picks in view.
 */

const SCHEME_NAMES = Object.keys(SCHEMES);

const COS30 = Math.cos(Math.PI / 6);
const SIN30 = 0.5;

/** What a form must satisfy to be worth looking at. */
export const LIMITS = {
  minMasses: 8,
  maxMasses: 70,
  /** Projected width over height. Outside this a form is a stick or a stripe. */
  minAspect: 0.5,
  maxAspect: 2.8,
  /** Below this the form is mostly empty frame and reads as a diagram. */
  minCoverage: 0.22,
} as const;

export type Rejection = { reason: string; detail: string };

/** The projected bounding box, without rasterising anything. */
function projectedExtent(form: Form): { w: number; h: number; area: number } {
  const xs: number[] = [];
  const ys: number[] = [];
  const push = (x: number, y: number, z: number, pad = 0) => {
    const px = (x - y) * COS30;
    const py = (x + y) * SIN30 - z;
    xs.push(px - pad, px + pad);
    ys.push(py - pad, py + pad);
  };
  for (const n of form.nodes) push(n.x, n.y, n.z, n.r);
  for (const s of form.slabs ?? []) {
    for (const [dx, dy, dz] of [
      [0, 0, 0], [s.w, 0, 0], [0, s.d, 0], [s.w, s.d, 0],
      [0, 0, s.h], [s.w, 0, s.h], [0, s.d, s.h], [s.w, s.d, s.h],
    ]) push(s.x + dx, s.y + dy, s.z + dz);
  }
  if (xs.length === 0) return { w: 0, h: 0, area: 0 };
  const w = Math.max(...xs) - Math.min(...xs);
  const h = Math.max(...ys) - Math.min(...ys);

  // A crude filled area: discs for nodes, footprints for slabs. Enough to catch
  // a form that is all reach and no body.
  let area = 0;
  for (const n of form.nodes) area += Math.PI * n.r * n.r;
  for (const s of form.slabs ?? []) area += (s.w + s.d) * COS30 * (s.h + (s.w + s.d) * SIN30) * 0.5;

  return { w, h, area };
}

/**
 * Is the whole thing one body?
 *
 * The first version of this asked only whether the nodes reached each other
 * along the links, and rejected every built form outright — in those, the
 * hanging runs are joined to the frame by sitting in it, not by a link, so the
 * node graph is genuinely several pieces and the object is genuinely one.
 *
 * So the test unions everything: nodes joined by links, nodes that intersect a
 * slab, and slabs that intersect each other. That is what "one body" means
 * here, and it is also exactly what decides whether the drawing comes out as a
 * single silhouette.
 */
function isOneBody(form: Form): boolean {
  const slabs = form.slabs ?? [];
  const total = form.nodes.length + slabs.length;
  if (total === 0) return false;

  const parent = Array.from({ length: total }, (_, i) => i);
  const find = (i: number): number => {
    while (parent[i] !== i) {
      parent[i] = parent[parent[i]];
      i = parent[i];
    }
    return i;
  };
  const union = (a: number, b: number) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent[rb] = ra;
  };

  const indexOfNode = new Map(form.nodes.map((n, i) => [n.id, i]));

  for (const l of form.links) {
    const a = indexOfNode.get(l.a);
    const b = indexOfNode.get(l.b);
    if (a === undefined || b === undefined) return false;
    union(a, b);
  }

  const slabAt = (k: number) => slabs[k];
  const slabIndex = (k: number) => form.nodes.length + k;

  // A node touches a slab when the nearest point of the box is within its radius.
  for (let n = 0; n < form.nodes.length; n++) {
    const node = form.nodes[n];
    for (let k = 0; k < slabs.length; k++) {
      const s = slabAt(k);
      const dx = Math.max(s.x - node.x, 0, node.x - (s.x + s.w));
      const dy = Math.max(s.y - node.y, 0, node.y - (s.y + s.d));
      const dz = Math.max(s.z - node.z, 0, node.z - (s.z + s.h));
      if (Math.hypot(dx, dy, dz) <= node.r) union(n, slabIndex(k));
    }
  }

  /**
   * Two members that share a face are joined.
   *
   * A strict inequality here says they are not, which is wrong for a solid
   * object — a leg whose top ends exactly at the underside of a beam is a leg
   * under a beam, and it is how anyone would actually draw it. The tolerance is
   * small enough that a real gap, which in these units is at least a fifth of a
   * unit, still fails.
   */
  const TOUCH = 0.05;

  for (let i = 0; i < slabs.length; i++) {
    for (let j = i + 1; j < slabs.length; j++) {
      const a = slabAt(i);
      const b = slabAt(j);
      const overlaps =
        a.x - TOUCH < b.x + b.w && b.x - TOUCH < a.x + a.w &&
        a.y - TOUCH < b.y + b.d && b.y - TOUCH < a.y + a.d &&
        a.z - TOUCH < b.z + b.h && b.z - TOUCH < a.z + a.h;
      if (overlaps) union(slabIndex(i), slabIndex(j));
    }
  }

  const root = find(0);
  for (let i = 1; i < total; i++) if (find(i) !== root) return false;
  return true;
}

export function check(form: Form): Rejection | null {
  const masses = form.nodes.length + (form.slabs?.length ?? 0);
  if (masses < LIMITS.minMasses) return { reason: "too few masses", detail: `${masses}` };
  if (masses > LIMITS.maxMasses) return { reason: "too many masses", detail: `${masses}` };

  if (!isOneBody(form)) {
    return { reason: "not one body", detail: "some masses do not touch the rest" };
  }

  const { w, h, area } = projectedExtent(form);
  if (h <= 0 || w <= 0) return { reason: "no extent", detail: "nothing to draw" };

  const aspect = w / h;
  if (aspect < LIMITS.minAspect) return { reason: "too tall", detail: aspect.toFixed(2) };
  if (aspect > LIMITS.maxAspect) return { reason: "too wide", detail: aspect.toFixed(2) };

  const coverage = area / (w * h);
  if (coverage < LIMITS.minCoverage) {
    return { reason: "too sparse", detail: coverage.toFixed(3) };
  }

  return null;
}

/**
 * The two traits that cannot be declared in advance, because they depend on
 * how the parameters actually landed.
 */
function readTraits(form: Form): Pick<Dna, "density" | "weighting"> {
  const { w, h, area } = projectedExtent(form);
  const coverage = area / Math.max(w * h, 0.001);
  /**
   * Calibrated against what the archetypes actually produce, which runs from
   * about 0.36 to 0.89. The first thresholds were guesses at a tenth of that,
   * so every individual came out "dense" and this axis of the DNA carried no
   * information — twelve individuals agreeing on a trait is the same as not
   * having the trait at all.
   */
  const density = coverage < 0.45 ? "sparse" : coverage < 0.68 ? "moderate" : "dense";

  // Where the mass sits, by weight rather than by extent.
  let mass = 0;
  let mz = 0;
  let mx = 0;
  for (const n of form.nodes) {
    const m = n.r * n.r * n.r;
    mass += m;
    mz += n.z * m;
    mx += (n.x - n.y) * m;
  }
  for (const sl of form.slabs ?? []) {
    const m = sl.w * sl.d * sl.h;
    mass += m;
    mz += (sl.z + sl.h / 2) * m;
    mx += (sl.x + sl.w / 2 - (sl.y + sl.d / 2)) * m;
  }
  const cz = mass > 0 ? mz / mass : 0;
  const cx = mass > 0 ? mx / mass : 0;

  const high = cz > 0.4;
  const offset = Math.abs(cx) > 1.6;
  const weighting =
    density === "sparse" && !high && !offset
      ? "spread thin"
      : high
        ? offset
          ? "high and offset"
          : "high and centred"
        : offset
          ? "low and offset"
          : "low and centred";

  return { density, weighting };
}

export type Candidate = {
  form: Form;
  archetype: string;
  register: Register;
  dna: Dna;
  attempts: number;
};

/**
 * One form from one archetype, retried until it passes.
 *
 * The retries use forked streams so that a rejection does not shift every later
 * value in the parent — otherwise one unlucky form would silently rewrite the
 * whole rest of the batch, and the same seed would stop meaning the same thing.
 */
export function createOne(
  rng: Rng,
  archetype: Archetype,
  id: string,
  title: string,
  existing: Dna[],
  maxAttempts = 24,
): Candidate {
  let last: Rejection | null = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const sub = rng.fork(`${archetype.name}:${attempt}`);

    // Built with a placeholder colour. Colour is assigned to the batch at the
    // end, once every individual exists — an individual is not a colour, and
    // deciding its colour while designing it is how a set ends up being one
    // creature in six shades.
    const form: Form = { id, title, ...archetype.build(sub, "teal") };
    const problem = check(form);
    if (problem) {
      last = problem;
      continue;
    }

    const dna: Dna = { ...archetype.dna, ...readTraits(form) };
    const tooClose = existing.find((other) => distance(dna, other) < MIN_DISTANCE);
    if (tooClose) {
      last = { reason: "too like another", detail: shared(dna, tooClose).slice(0, 3).join("; ") };
      continue;
    }

    return { form, archetype: archetype.name, register: archetype.register, dna, attempts: attempt };
  }
  throw new Error(
    `${archetype.name} produced nothing usable in ${maxAttempts} attempts (last: ${last?.reason} ${last?.detail}). ` +
      `Its parameter ranges are probably wrong.`,
  );
}

export type Batch = {
  seed: string;
  candidates: Candidate[];
  rejected: number;
};

/**
 * A batch, chosen so the set is varied rather than each form being varied.
 *
 * Register alternates, so grown and built stay balanced however the archetypes
 * fall. Within a register the least-used archetype wins, and a colour is not
 * reused until every colour has been. Both rules look at what has already been
 * chosen, which is the only way a set can be varied at all.
 */
export function createBatch(seed: string, count: number): Batch {
  const rng = createRng(seed);
  const candidates: Candidate[] = [];
  const dnaSoFar: Dna[] = [];
  let rejected = 0;

  const grown = ARCHETYPES.filter((a) => a.register === "grown");
  const built = ARCHETYPES.filter((a) => a.register === "built");
  const usedNames = new Set<string>();

  if (count > ARCHETYPES.length) {
    throw new Error(
      `${count} asked for but only ${ARCHETYPES.length} structures exist. ` +
        `Two individuals sharing a structure would be the same creature in different colours, ` +
        `so the batch cannot be larger than the number of structures.`,
    );
  }

  for (let i = 0; i < count; i++) {
    // Alternate register, so grown and built stay balanced whatever else falls.
    const preferred = i % 2 === 0 ? grown : built;
    let pool = preferred.filter((a) => !usedNames.has(a.name));
    if (pool.length === 0) pool = ARCHETYPES.filter((a) => !usedNames.has(a.name));

    // Each structure is used at most once. This is the rule that makes twelve
    // individuals twelve species rather than eight species and four reprints.
    const archetype = rng.fork(`pick-structure:${i}`).pick(pool);
    usedNames.add(archetype.name);

    const candidate = createOne(
      rng.fork(`form:${i}`),
      archetype,
      `form-${String(i + 1).padStart(2, "0")}`,
      `${i + 1}`,
      dnaSoFar,
    );

    rejected += candidate.attempts - 1;
    dnaSoFar.push(candidate.dna);
    candidates.push(candidate);
  }

  /**
   * COLOUR, LAST.
   *
   * Assigned to finished individuals, in a shuffled order, so no two
   * neighbours in the sheet share one and the palette is spread across the
   * batch. Nothing about an individual depended on it.
   */
  const schemeNames = rng.fork("colour").shuffle(SCHEME_NAMES);
  candidates.forEach((c, i) => {
    c.form.scheme = schemeNames[i % schemeNames.length];
  });

  return { seed, candidates, rejected };
}
