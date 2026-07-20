/**
 * A form is a graph of masses, not an assembly of parts.
 *
 * A node is a thickness at a place; a link is the continuous run between two
 * thicknesses. Nothing here has a front, a top or a head, because nothing here
 * has a face: the vocabulary cannot express orientation, so the forms cannot
 * accidentally acquire one.
 */

export type Node = {
  id: string;
  x: number;
  y: number;
  z: number;
  /** Thickness of the body at this point. */
  r: number;
  tone?: "a" | "b";
};

export type Link = {
  a: string;
  b: string;
  /** Override the thickness at either end, for a run that swells or narrows. */
  ra?: number;
  rb?: number;
  tone?: "a" | "b";
};

/**
 * A SLAB: a solid with faces, for the half of this world that is built rather
 * than grown.
 *
 * Tubes and nodes can only ever make coral. A beam, a bracket, a frame member
 * or a plate needs surfaces meeting at an edge — but the edges are rounded and
 * the faces are separated by tone alone, so a slab still reads as carved from
 * one piece rather than as a block snapped onto another.
 */
export type Slab = {
  x: number;
  y: number;
  z: number;
  w: number;
  d: number;
  h: number;
  /** How much the edges are taken off. Higher is softer. */
  round?: number;
  tone?: "a" | "b";
};

export type Form = {
  id: string;
  title: string;
  scheme: string;
  nodes: Node[];
  links: Link[];
  /** The built members. A form may be all grown, all built, or both. */
  slabs?: Slab[];
  notes: {
    /** The natural structure it borrows its organisation from. */
    structure: string;
    /** What movement or role the shape suggests, never states. */
    suggests: string;
    /** Where the balance sits and what carries it. */
    balance: string;
    /** Roughly where it sits between grown and manufactured. */
    register: string;
  };
};
