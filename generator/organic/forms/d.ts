import type { Form } from "../types";
import { merge, chain, loop, spiralPoints, ringPoints } from "../grow";

/**
 * D — a coil that climbs and stops, with a ring hung at the open end.
 *
 * The spiral thins as it rises and the ring at the top is thicker than the run
 * that carries it, so the form is top-heavy and has to be leaning on something
 * that is not there.
 */

const coil = chain(
  "coil",
  spiralPoints([0, 0, -4.6], 3.3, 1.1, 1.45, 7.6, 22, 30),
  (t) => 1.35 - 0.72 * t,
);

const ring = loop("ring", ringPoints([0.6, -1.9, 3.9], 1.9, 9, "yz", 10, 0.08), () => 0.55, "b");

/** A broad settled mass at the bottom, the only part touching anything. */
const seat = chain(
  "seat",
  [
    [2.4, 0.9, -5.4],
    [3.3, 1.6, -5.9],
    [4.0, 2.4, -5.7],
  ],
  (t) => 1.5 + 0.4 * Math.sin(t * Math.PI),
  "b",
);

/** A short run leaving the coil halfway up and going nowhere. */
const spur = chain(
  "spur",
  [
    [-2.7, 1.4, -1.0],
    [-4.1, 2.0, -0.3],
    [-5.0, 2.3, 0.5],
  ],
  (t) => 0.8 - 0.34 * t + (t > 0.8 ? 0.5 : 0),
);

const part = merge(coil, ring, seat, spur);

export const formD: Form = {
  id: "form-d",
  title: "D",
  scheme: "slate",
  nodes: part.nodes,
  links: [
    ...part.links,
    { a: "coil-22", b: "ring-0", tone: "b" },
    { a: "coil-0", b: "seat-0", tone: "b" },
    { a: "coil-9", b: "spur-0" },
  ],
  notes: {
    structure: "Spiral. One run climbing and thinning through about a turn and a half.",
    suggests: "Turning, or paying out. The ring at the open end is heavier than the run that holds it up.",
    balance: "Over the broad mass at the foot, well to one side of everything it carries.",
  },
};
