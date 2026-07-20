import type { Form } from "../types";
import { merge, chain, loop, ringPoints } from "../grow";

/**
 * F — BUILT. An arch of segments with things hung under it at even spacing,
 * except for one that is short and much heavier.
 *
 * The arch is made of separate members, so it reads as constructed. What hangs
 * off it does not.
 */

const drops = [1, 2, 3].map((k, i) => {
  const short = i === 1;
  const x = -3.2 + k * 2.6;
  const y = 1.4 - k * 0.9;
  const drop = short ? 1.8 : 3.6;
  return chain(
    `drop${i}`,
    [
      [x, y, 1.6],
      [x, y, 1.6 - drop * 0.6],
      [x, y, 1.6 - drop],
    ],
    (t) => (short ? 0.34 + (t > 0.7 ? 1.1 : 0) : 0.3 + (t > 0.75 ? 0.62 : 0)),
    short ? "a" : "b",
  );
});

const caught = loop("caught", ringPoints([1.4, -0.1, -0.9], 1.05, 8, "xz", 0), () => 0.32, "b");

const part = merge(...drops, caught);

export const formF: Form = {
  id: "form-f",
  title: "F",
  scheme: "clay",
  nodes: part.nodes,
  links: part.links,
  slabs: [
    // Five arch segments, each turned a little further over than the last.
    { x: -8.2, y: 3.6, z: -3.4, w: 2.0, d: 1.8, h: 3.0, round: 0.4 },
    { x: -6.6, y: 2.8, z: -0.8, w: 2.4, d: 1.8, h: 1.9, round: 0.4 },
    { x: -4.4, y: 1.8, z: 0.7, w: 3.0, d: 1.8, h: 1.5, round: 0.4 },
    { x: -1.6, y: 0.5, z: 1.3, w: 3.4, d: 1.8, h: 1.4, round: 0.4 },
    { x: 1.6, y: -0.9, z: 0.9, w: 3.0, d: 1.8, h: 1.5, round: 0.4 },
    { x: 4.4, y: -2.2, z: -0.9, w: 2.4, d: 1.8, h: 1.9, round: 0.4 },
    { x: 6.4, y: -3.2, z: -3.5, w: 2.0, d: 1.8, h: 3.0, round: 0.4 },
    // A pale capping strip along the crown, stopping short at one end.
    { x: -5.8, y: 2.2, z: 2.0, w: 10.4, d: 1.3, h: 0.45, round: 0.18, tone: "b" },
    // Two broad feet.
    { x: -8.6, y: 3.4, z: -4.3, w: 2.8, d: 2.4, h: 0.9, round: 0.34, tone: "b" },
    { x: 6.0, y: -3.4, z: -4.4, w: 2.8, d: 2.4, h: 0.9, round: 0.34, tone: "b" },
  ],
  notes: {
    structure: "Arch, built in segments, with runs hanging from it at even spacing.",
    suggests: "Spanning and letting down. Whatever the arch is for happens above whatever the drops are for.",
    balance: "Across, between two broad feet. The heaviest thing on it hangs from the shortest run.",
    register: "Built, carrying things that are not.",
  },
};
