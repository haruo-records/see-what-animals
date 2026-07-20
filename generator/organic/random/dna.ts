/**
 * WAYS OF LIVING, AND FORM DNA.
 *
 * The order of design matters more than any single rule here. A generator that
 * picks a shape and then picks a colour produces colour variants of one shape,
 * which is what the last batch was: eight structures stretched over twelve
 * slots, so four of them appeared twice in different colours. Colour is not a
 * variation. It is the last decision, and it is made after the individual
 * already exists.
 *
 * So the order is: a way of living, then the structure that way of living
 * forces, then how it holds itself up, then what its silhouette becomes — and
 * only then, once the thing is finished, what colour it happens to be.
 *
 * DNA is the record of those decisions. Two individuals with close DNA are the
 * same creature twice however different they look, and one of them does not
 * belong in the batch.
 */

/**
 * What an individual exists in order to do.
 *
 * Not a description of its shape. A form arrived at from a way of living
 * carries that way of living even when nobody can name it; a form arrived at
 * first and explained afterwards never does.
 */
export type Purpose =
  | "supports something"
  | "holds something fast"
  | "gathers what passes"
  | "releases something slowly"
  | "resonates"
  | "drifts, and filters as it goes"
  | "stores what it takes in"
  | "turns, and pays out"
  | "connects two things"
  | "protects what is inside it"
  | "raises something clear"
  | "carries along its own length"
  | "lives on the surface of something else"
  | "works only as a group"
  | "spans a gap"
  | "accumulates, slowly";

/** How an individual meets whatever holds it up. */
export type Support =
  | "one broad foot"
  | "a pair of feet"
  | "many small contacts"
  | "a single stem"
  | "hangs from above"
  | "rests on its whole underside"
  | "cantilevered from one side"
  | "no clear support at all";

/** The order it keeps. */
export type Symmetry = "radial" | "bilateral" | "serial" | "spiral" | "layered" | "none";

/** How its parts are joined. */
export type Connection = "grown continuous" | "socketed" | "clamped" | "threaded through" | "piled" | "hung";

/** What it feels like it is made of. */
export type Material = "soft resin" | "polished wood" | "unglazed ceramic" | "cast stone" | "worked metal" | "unknown";

/** Where the mass sits and how evenly. */
export type Weighting = "low and centred" | "low and offset" | "high and centred" | "high and offset" | "spread thin";

/** How its repeated elements are spaced. */
export type Rhythm = "even" | "even with one missing" | "graded" | "grouped" | "irregular" | "none";

export type Dna = {
  purpose: Purpose;
  structure: string;
  support: Support;
  symmetry: Symmetry;
  connection: Connection;
  material: Material;
  weighting: Weighting;
  rhythm: Rhythm;
  /** Masses per unit of projected area. Computed from the built form. */
  density: "sparse" | "moderate" | "dense";
};

const TRAIT_WEIGHTS: Array<[keyof Dna, number]> = [
  // Structure and purpose carry the most, because two individuals sharing both
  // are the same creature no matter what else differs.
  ["structure", 3],
  ["purpose", 3],
  ["symmetry", 2],
  ["support", 2],
  ["weighting", 1.5],
  ["connection", 1],
  ["rhythm", 1],
  ["material", 1],
  ["density", 1],
];

const TOTAL_WEIGHT = TRAIT_WEIGHTS.reduce((sum, [, w]) => sum + w, 0);

/**
 * How different two individuals are, from 0 (identical) to 1.
 *
 * Deliberately a blunt instrument: traits either match or they do not. A
 * smoother measure would let two forms creep closer and closer while never
 * quite tripping the threshold, and the whole point is to catch the near-miss.
 */
export function distance(a: Dna, b: Dna): number {
  let differing = 0;
  for (const [trait, weight] of TRAIT_WEIGHTS) {
    if (a[trait] !== b[trait]) differing += weight;
  }
  return differing / TOTAL_WEIGHT;
}

/**
 * Below this, two individuals are the same way of living wearing different
 * clothes. Set so that sharing either structure or purpose, plus any two other
 * traits, is enough to be rejected.
 */
export const MIN_DISTANCE = 0.55;

/** The traits two individuals have in common, for the rejection message. */
export function shared(a: Dna, b: Dna): string[] {
  return TRAIT_WEIGHTS.filter(([t]) => a[t] === b[t]).map(([t]) => `${t}: ${String(a[t])}`);
}
