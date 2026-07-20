import type { Form } from "../types";
import { merge, chain, ringPoints } from "../grow";

/**
 * E — a colony: several growths of the same kind on one shared floor, at
 * different stages.
 *
 * Nothing here is the main body. A colony has no centre and no direction, which
 * is the most reliable way to stop a form acquiring a head.
 */

const floor = chain(
  "floor",
  [
    [-6.6, 3.4, -3.2],
    [-2.2, 1.0, -3.5],
    [2.4, -1.2, -3.3],
    [6.4, -3.2, -3.0],
  ],
  (t) => 1.55 + 0.5 * Math.sin(t * Math.PI),
  "b",
);

/** Five stalks of the same construction at five different heights. */
const heights = [3.2, 4.4, 1.6, 3.8, 2.2];
const bases: Array<[number, number, number]> = [
  [-6.0, 3.0, -3.0],
  [-3.0, 1.4, -3.2],
  [0.2, -0.2, -3.1],
  [3.4, -1.8, -3.0],
  [6.0, -3.0, -2.8],
];

const stalks = heights.map((h, i) => {
  const [bx, by, bz] = bases[i];
  const drift = (i % 2 === 0 ? 1 : -1) * 0.5;
  return chain(
    `st${i}`,
    [
      [bx, by, bz],
      [bx + drift * 0.4, by + drift * 0.2, bz + h * 0.4],
      [bx + drift * 0.9, by + drift * 0.4, bz + h * 0.75],
      [bx + drift * 1.1, by + drift * 0.5, bz + h],
    ],
    (t) => 0.95 - 0.42 * t + (t > 0.75 ? 1.15 : 0),
  );
});

/** Small buds around the tallest, all at the same distance from it. */
const buds = ringPoints([-2.5, 1.1, 1.6], 1.4, 4, "xy", 30).map((p, i) =>
  chain(`bud${i}`, [[p[0], p[1], p[2]]], () => 0.5, "b"),
);

const part = merge(floor, ...stalks, ...buds);

export const formE: Form = {
  id: "form-e",
  title: "E",
  scheme: "coral",
  nodes: part.nodes,
  links: [
    ...part.links,
    ...stalks.map((_, i) => ({ a: `floor-${Math.min(3, Math.floor(i * 0.8))}`, b: `st${i}-0`, tone: "b" as const })),
    ...buds.map((_, i) => ({ a: "st1-2", b: `bud${i}-0`, tone: "b" as const })),
  ],
  notes: {
    structure: "Colony. Five growths of one kind on a shared floor, each at a different stage.",
    suggests: "Increasing. Whatever it is doing, it has been doing for a while and is not finished.",
    balance: "Spread along the floor. No one stalk carries the thing; remove any of them and it still stands.",
  },
};
