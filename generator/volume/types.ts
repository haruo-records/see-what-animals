/**
 * VOLUME PARTS — the minimal data structure for a part that has a body.
 *
 * The vocabulary here is deliberately MORPHOLOGICAL, never nominal. A part's
 * `character` says how it behaves as matter — swollen, tapered, folded, rigid —
 * and never what object it is. There is no Tube, no Box, no Disc, because a
 * vocabulary of components produces an assembly of components: pipes, blocks
 * and washers, which is a machine, not an animal.
 *
 * Likewise a relation says how two parts stand toward each other — one wedges
 * into another, one trails behind another — never that they are bolted.
 */

export type Vec = [number, number];

/** How a part behaves as matter. Not what it is. */
export type PartCharacter =
  | "swollen"
  | "compressed"
  | "tapered"
  | "folded"
  | "rigid"
  | "curved-support"
  | "hollow"
  | "wedged"
  | "hanging";

/** How one part stands toward another. Not how it is fastened. */
export type Relation =
  | "supports"
  | "carries"
  | "hangs-from"
  | "wraps-around"
  | "passes-behind"
  | "passes-through"
  | "rests-on"
  | "wedges-into"
  | "encloses"
  | "leans-against"
  | "trails-behind"
  | "folds-back-onto"
  | "holds-apart"
  | "pulls-sideways"
  | "remains-slightly-detached";

/**
 * An opening in a part. Deliberately a POLYGON with per-vertex rounding, like
 * every other outline here, so an opening can be irregular, squashed, part
 * straight and part curved, or half-covered by whatever lies in front of it.
 *
 * A perfect ellipse is available — set every radius high on a four-point
 * outline — but it is one option among many rather than the way openings are
 * made. Every visible opening being a clean ellipse is what turns a body into
 * a bundle of hoses.
 */
export type Opening = {
  outline: Vec[];
  /** Corner rounding per vertex, in units. 0 is a sharp corner. */
  rounding: number[];
  /** A rim of ink around the opening, suggesting wall thickness. 0 for none. */
  rim?: number;
};

/**
 * An interior boundary the part declares about ITSELF: the edge of a thickness,
 * the crease where it folds, the line where one of its surfaces turns away.
 *
 * These are separate from the boundaries that occlusion produces. Both end up
 * as white lines, but for different reasons, and a part is only allowed to
 * declare an edge where its own form actually changes.
 */
export type FaceEdge = {
  points: Vec[];
  rounding?: number[];
  /** Slightly finer than an occlusion boundary: it divides less. */
  weight?: number;
};

export type Part = {
  id: string;
  character: PartCharacter;
  /** Closed outline in composition coordinates. */
  outline: Vec[];
  /**
   * Corner rounding per vertex. This is the single mechanism that keeps
   * straight and curved in the same outline: a large radius on one vertex and
   * zero on the next gives a form that is part slab and part swell. A shape
   * rounded everywhere is a capsule; a shape rounded nowhere is a crystal.
   */
  rounding: number[];
  /**
   * Painting order. Higher is nearer the viewer. There is no camera and no
   * projection matrix — depth here means only "which part covers which", which
   * is the one depth cue the drawings actually use.
   */
  depth: number;
  edges?: FaceEdge[];
  openings?: Opening[];
  /** Recorded for the report, and to keep the author's intent in the file. */
  relations?: Array<{ to: string; is: Relation }>;
};

export type Creature = {
  id: string;
  title: string;
  parts: Part[];
  /** Author's notes, reported back and never drawn. */
  notes: {
    centreOfGravity: string;
    imaginedMovement: string;
    awkwardness: string;
    charm: string;
    asObject: string;
  };
};
