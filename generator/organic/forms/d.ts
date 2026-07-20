import type { Form } from "../types";
import { merge, chain, loop, ringPoints } from "../grow";

/**
 * D — BUILT. A bracket holding a spool, with a pipe running away through it.
 *
 * The pipe passes clean through the frame and out the other side, at a height
 * that suits neither the spool nor the mounting.
 */

const pipe = chain(
  "pipe",
  [
    [-7.6, 3.4, -0.6],
    [-3.2, 1.6, 0.2],
    [1.4, -0.4, 0.6],
    [5.6, -2.2, 0.2],
    [8.2, -3.4, -0.8],
  ],
  (t) => 0.72 + 0.16 * Math.sin(t * Math.PI),
);

const collar = chain("collar", [[2.6, -0.9, 0.55], [3.4, -1.2, 0.5]], () => 1.0, "b");

/** A ring hung off the far end, loose on the pipe. */
const ring = loop("ring", ringPoints([6.6, -2.8, -0.1], 1.35, 9, "yz", 0), () => 0.36, "b");

const part = merge(pipe, collar, ring);

export const formD: Form = {
  id: "form-d",
  title: "D",
  scheme: "slate",
  nodes: part.nodes,
  links: [...part.links, { a: "pipe-3", b: "collar-0", tone: "b" }],
  slabs: [
    // The base plate and the two cheeks of the bracket.
    { x: -2.6, y: -2.4, z: -4.6, w: 6.2, d: 5.2, h: 0.9, round: 0.3, tone: "b" },
    { x: -1.8, y: -2.0, z: -3.7, w: 1.5, d: 1.4, h: 4.6, round: 0.34 },
    { x: 1.6, y: -2.0, z: -3.7, w: 1.5, d: 1.4, h: 4.6, round: 0.34 },
    { x: -1.8, y: -2.2, z: 1.1, w: 4.9, d: 1.8, h: 1.2, round: 0.36 },
    // The spool between the cheeks: two cheeks and a drum.
    { x: -0.5, y: -1.9, z: -3.0, w: 0.5, d: 1.2, h: 3.6, round: 0.2, tone: "b" },
    { x: 1.0, y: -1.9, z: -3.0, w: 0.5, d: 1.2, h: 3.6, round: 0.2, tone: "b" },
    { x: -0.4, y: -1.7, z: -2.2, w: 1.9, d: 0.8, h: 2.0, round: 0.34 },
    // A second mounting on the base, with nothing on it.
    { x: -2.2, y: 1.4, z: -3.7, w: 1.3, d: 1.2, h: 1.8, round: 0.3, tone: "b" },
  ],
  notes: {
    structure: "Bracket and pipe. A plate carrying two cheeks and a spool, with a run passing straight through.",
    suggests: "Winding, or guiding. The pipe goes through at a height belonging to neither the spool nor the mounting.",
    balance: "On a broad plate, well under the near end of the pipe. Most of the pipe is out over nothing.",
    register: "Built, with one run through it that could be either.",
  },
};
