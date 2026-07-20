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

export type Form = {
  id: string;
  title: string;
  scheme: string;
  nodes: Node[];
  links: Link[];
  notes: {
    /** The natural structure it borrows its organisation from. */
    structure: string;
    /** What movement or role the shape suggests, never states. */
    suggests: string;
    /** Where the balance sits and what carries it. */
    balance: string;
  };
};
