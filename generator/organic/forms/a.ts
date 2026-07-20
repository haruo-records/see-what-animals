import type { Form } from "../types";
import { merge, loop, chain, ringPoints } from "../grow";

/**
 * A — two rings passing through one another, neither of them closed.
 *
 * A loop has no top and no front: whichever way it is turned it is the same
 * proposition. The larger ring swells on one side and thins on the other, so
 * it is a growth rather than a hoop.
 */

const bigRing = loop(
  "big",
  ringPoints([0, 0, 0], 5.2, 11, "xz", -20, 0.12),
  (t) => 1.05 + 0.55 * Math.sin(t * Math.PI * 1.4),
);

/** A second ring threaded through the first, at an angle to it. */
const smallRing = loop(
  "small",
  ringPoints([3.4, 2.6, -3.6], 2.5, 9, "yz", 40, 0.1),
  (t) => 0.62 + 0.3 * Math.sin(t * Math.PI),
  "b",
);

/** A short run that leaves the big ring and stops without arriving anywhere. */
const spur = chain(
  "spur",
  [
    [-3.4, -0.6, 2.2],
    [-5.0, -1.6, 3.0],
    [-6.4, -2.2, 3.2],
    [-7.4, -2.4, 2.7],
  ],
  (t) => 0.95 - 0.5 * t + 0.35 * Math.max(0, t - 0.7),
);

const knot = chain(
  "knot",
  [
    [3.0, 0.2, 3.4],
    [3.9, 0.9, 4.1],
  ],
  () => 1.25,
  "b",
);

const part = merge(bigRing, smallRing, spur, knot);

export const formA: Form = {
  id: "form-a",
  title: "A",
  scheme: "teal",
  nodes: part.nodes,
  links: [
    ...part.links,
    // The spur grows out of the ring rather than being attached to it.
    { a: "big-6", b: "spur-0" },
    { a: "big-1", b: "knot-0", tone: "b" },
  ],
  notes: {
    structure: "Ring and loop. Two closed runs linked through each other, at an angle.",
    suggests: "Holding, or being held. Something passes through the larger ring and cannot come out past the smaller one.",
    balance: "It has none in particular. Turned any way up it presents the same problem, which is the point of a loop.",
  },
};
