import type { Form } from "../types";
import { merge, chain, loop, ringPoints } from "../grow";

/**
 * A — BUILT. A gantry: two uprights, a beam across, and a carriage hanging
 * under it that has run to one end and stayed there.
 *
 * Wholly architectural in its parts and not at all in its proportions. The
 * carriage is at the end of its travel, and there is nothing at that end for it
 * to have arrived at.
 */

const carriageRing = loop("ring", ringPoints([4.6, -1.4, 0.6], 1.5, 9, "yz", 0), () => 0.42, "b");
const hanger = chain(
  "hang",
  [
    [4.6, -1.4, 2.6],
    [4.6, -1.4, 1.9],
  ],
  () => 0.34,
  "b",
);

const part = merge(carriageRing, hanger);

export const formA: Form = {
  id: "form-a",
  title: "A",
  scheme: "teal",
  nodes: part.nodes,
  links: [...part.links, { a: "hang-1", b: "ring-2", tone: "b" }],
  slabs: [
    // The beam, and a lighter rail under it that the carriage runs on.
    { x: -6.4, y: -2, z: 2.6, w: 13, d: 1.7, h: 1.5, round: 0.42 },
    { x: -5.6, y: -1.8, z: 2.2, w: 11.4, d: 1.3, h: 0.5, round: 0.2, tone: "b" },
    // Near upright: three members, stepping in as they rise.
    { x: -5.6, y: -1.9, z: -4.4, w: 2.4, d: 1.9, h: 2.2, round: 0.4 },
    { x: -5.2, y: -1.7, z: -2.2, w: 1.7, d: 1.5, h: 3.2, round: 0.34 },
    { x: -5.4, y: -1.8, z: 1.0, w: 2.1, d: 1.7, h: 1.6, round: 0.36, tone: "b" },
    // Far upright: the same three, but the middle member is longer, so the
    // beam sits level while the feet do not.
    { x: 3.6, y: -1.9, z: -3.2, w: 2.4, d: 1.9, h: 2.0, round: 0.4 },
    { x: 4.0, y: -1.7, z: -1.2, w: 1.7, d: 1.5, h: 2.4, round: 0.34 },
    { x: 3.8, y: -1.8, z: 1.2, w: 2.1, d: 1.7, h: 1.4, round: 0.36, tone: "b" },
    // A brace from the near upright out to nothing.
    { x: -7.8, y: -1.6, z: -0.6, w: 2.6, d: 1.1, h: 0.9, round: 0.3, tone: "b" },
  ],
  notes: {
    structure: "Frame. A beam on two uprights, each built from three members, with a rail and a carriage under it.",
    suggests: "Carrying something along its length. The carriage has run to one end and there is nothing there.",
    balance: "Across, between two feet that do not reach the same level. The beam is level; the ground it implies is not.",
    register: "Built. Nothing about it grew.",
  },
};
