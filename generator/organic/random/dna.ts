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
/**
 * Which register a structure sits in.
 *
 * Three, not two. A binary split forces everything that is neither plainly
 * grown nor plainly made — a crust on a beam, a chamber with a fitted throat —
 * into one camp or the other, and those in-between individuals are the ones
 * this whole project is actually chasing.
 */
export type Register = "organic" | "hybrid" | "mechanical";

/**
 * HOW IT WORKS, as distinct from what it is for.
 *
 * Two structures can share a purpose and be nothing alike: a spiral and a
 * bracket both hold something, and they hold it by winding and by clamping.
 * Without this axis the DNA cannot tell them apart, which is how the last set
 * ended up with several different ways of standing still.
 */
export type Motion =
  | "stays put"
  | "turns"
  | "swings"
  | "hangs and sways"
  | "unfolds"
  | "inverts"
  | "shifts its weight"
  | "releases outward"
  | "draws inward"
  | "spaces itself apart"
  | "works against a partner"
  | "trails behind itself";

/**
 * The shape of the silhouette, coarsely. Two individuals in the same family
 * read as relatives from across a room however different their parts are.
 */
export type SilhouetteFamily =
  | "compact"
  | "spreading"
  | "spanning"
  | "hanging"
  | "linear"
  | "enclosing"
  | "scattered"
  | "stacked";

/** Whether it is one thing, two things, or many. */
export type Plurality = "solitary" | "paired" | "colonial";

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
  | "accumulates, slowly"
  | "turns itself inside out"
  | "releases something outward"
  | "works only with a partner"
  | "keeps its own parts apart"
  | "moves a weight inside itself"
  | "opens out, and closes again";

/**
 * Purposes group into families. Two individuals doing the same kind of job are
 * near relatives even when the job is named differently, so a batch is capped
 * at two from any one family.
 */
export const FUNCTION_FAMILY: Record<Purpose, string> = {
  "supports something": "bearing",
  "raises something clear": "bearing",
  "spans a gap": "bearing",
  "holds something fast": "holding",
  "protects what is inside it": "holding",
  "stores what it takes in": "holding",
  "gathers what passes": "taking in",
  "drifts, and filters as it goes": "taking in",
  "accumulates, slowly": "taking in",
  "releases something slowly": "giving out",
  "releases something outward": "giving out",
  "turns, and pays out": "giving out",
  "connects two things": "linking",
  "carries along its own length": "linking",
  "lives on the surface of something else": "attaching",
  "works only as a group": "grouping",
  "keeps its own parts apart": "grouping",
  "works only with a partner": "grouping",
  "resonates": "changing state",
  "turns itself inside out": "changing state",
  "moves a weight inside itself": "changing state",
  "opens out, and closes again": "changing state",
};

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
  motion: Motion;
  structure: string;
  register: Register;
  silhouette: SilhouetteFamily;
  plurality: Plurality;
  support: Support;
  symmetry: Symmetry;
  connection: Connection;
  material: Material;
  weighting: Weighting;
  rhythm: Rhythm;
  /** Masses per unit of projected area. Computed from the built form. */
  density: "sparse" | "moderate" | "dense";
};

/**
 * Colour is deliberately absent. It is assigned after an individual exists and
 * says nothing about what it is, so letting it count towards diversity would
 * let two identical creatures pass as different by being painted differently —
 * which is the exact failure this measure exists to prevent.
 */
const TRAIT_WEIGHTS: Array<[keyof Dna, number]> = [
  // Structure, purpose and motion carry the most: two individuals agreeing on
  // all three are the same creature no matter what else differs.
  ["structure", 3],
  ["purpose", 3],
  ["motion", 2.5],
  ["silhouette", 2],
  ["symmetry", 2],
  ["support", 2],
  ["plurality", 1.5],
  ["weighting", 1.5],
  ["register", 1.5],
  ["connection", 1],
  ["rhythm", 1],
  ["material", 1],
  ["density", 1],
];

/** How many of the listed traits two individuals share outright. */
export function agreementCount(a: Dna, b: Dna): number {
  return TRAIT_WEIGHTS.filter(([t]) => a[t] === b[t]).length;
}

/**
 * A new structure has to differ from every existing one in at least this many
 * traits. Fewer, and it is a variant of something already in the set wearing a
 * new name — which does not count as a new species.
 */
export const MIN_DIFFERING_TRAITS = 3;

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
