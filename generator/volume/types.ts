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

/**
 * What a part IS TO THE BODY — an organ of unknown function, never a component.
 *
 * "Supporting arm" and "floating chamber" are read as parts of a creature;
 * "rod" and "cylinder" are read as stock. The vocabulary is doing real work
 * here, because it decides what the next form gets designed as.
 */
export type PartCharacter =
  | "swollen mass"
  | "compressed mass"
  | "folded mass"
  | "soft fold"
  | "rigid fold"
  | "bulging shell"
  | "nested shell"
  | "supporting arm"
  | "hanging arm"
  | "carried mass"
  | "enclosing mass"
  | "drifting fin"
  | "anchored part"
  | "filtering part"
  | "floating chamber"
  | "spiral growth"
  | "layered growth"
  | "partially unfolded volume"
  | "compressed cavity"
  | "growing ridge"
  | "soft fold"
  | "hanging lobe"
  | "supporting nub"
  | "folded flap"
  | "bulging pad"
  | "trailing tendril"
  | "anchored mass"
  | "clinging lobe"
  | "resting bulge";

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
  sharp?: boolean[];
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
  /** Slightly finer than an occlusion boundary: it divides less. */
  weight?: number;
};

export type Part = {
  id: string;
  character: PartCharacter;
  /** Closed outline in composition coordinates. */
  outline: Vec[];
  /**
   * Which vertices are corners. Everything unmarked is smooth, so a form is
   * continuous by default and sharp only where the body actually has an edge.
   */
  sharp?: boolean[];
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
  /** The kind's colour, which says where it lives and nothing else. */
  palette: import("./palette").Palette;
  parts: Part[];
  /** Author's notes, reported back and never drawn. */
  notes: {
    /**
     * WHAT IT EXISTS TO DO. Decided before any geometry, because a form derived
     * from a purpose carries the purpose even when nobody can name it, and a
     * form arrived at first and explained afterwards never does.
     */
    purpose: string;
    /** What has happened to it since: wear, breakage, arrest, accretion. */
    traceOfTime: string;
    /** The order the body keeps: bilateral, radial, segmented, spiral. */
    order: string;
    /** The one place that order is not kept. */
    deviation: string;
    /** What it seems to spend its life doing. Never stated as a function. */
    wayOfLiving: string;
    /** What a viewer might guess it is for, without being told. */
    suggestedUse: string;
    centreOfGravity: string;
    charm: string;
    asObject: string;
    /** Why it would be picked up off the ground and taken home. */
    whyPocketed: string;
  };
};
