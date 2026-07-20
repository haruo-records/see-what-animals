import type { Form } from "../types";
import { merge, chain, ringPoints } from "../grow";

/**
 * F — an arch with things hanging under it.
 *
 * The hanging runs are all the same length except one, which is much shorter
 * and carries a heavier weight. The arch is a span, so the form reads across
 * rather than up.
 */

const arch = chain(
  "arch",
  [
    [-8.4, 2.6, -1.4],
    [-7.0, 1.6, 1.0],
    [-4.0, 0.2, 2.4],
    [0.0, -0.6, 2.9],
    [4.0, -1.4, 2.2],
    [7.0, -2.2, 0.6],
    [8.4, -3.0, -1.6],
  ],
  (t) => 0.95 + 0.75 * Math.sin(t * Math.PI),
);

const feet = [
  chain("footL", [[-8.7, 2.9, -2.2], [-8.3, 2.5, -3.0]], () => 1.5, "b"),
  chain("footR", [[8.7, -3.3, -2.4], [8.3, -2.9, -3.2]], () => 1.4, "b"),
];

/** Four hangers at even spacing. The third stops early and ends in a weight. */
const hangIdx = [1, 2, 3, 4];
const hangers = hangIdx.map((k, i) => {
  const short = i === 2;
  const anchor = arch.nodes[k];
  const drop = short ? 1.6 : 3.2;
  return chain(
    `hang${i}`,
    [
      [anchor.x, anchor.y, anchor.z - 0.4],
      [anchor.x + 0.1, anchor.y + 0.05, anchor.z - drop * 0.55],
      [anchor.x + 0.15, anchor.y + 0.1, anchor.z - drop],
    ],
    (t) => (short ? 0.42 + (t > 0.7 ? 1.15 : 0) : 0.38 + (t > 0.75 ? 0.55 : 0)),
    short ? "a" : "b",
  );
});

/** A ring caught on one of the hangers, which cannot be got off it. */
const caught = chain("caught", ringPoints([4.1, -1.5, -1.4], 1.15, 7, "xz", 0).map((p) => p), () => 0.4, "b");

const part = merge(arch, ...feet, ...hangers, caught);

export const formF: Form = {
  id: "form-f",
  title: "F",
  scheme: "clay",
  nodes: part.nodes,
  links: [
    ...part.links,
    { a: "arch-0", b: "footL-0", tone: "b" },
    { a: "arch-6", b: "footR-0", tone: "b" },
    ...hangers.map((_, i) => ({ a: `arch-${hangIdx[i]}`, b: `hang${i}-0` })),
    { a: "caught-6", b: "caught-0", tone: "b" },
  ],
  notes: {
    structure: "Arch, with hanging runs. A span on two feet, carrying four drops at even spacing.",
    suggests: "Carrying, or letting down. Whatever is on the drops is below whatever the arch is for.",
    balance: "Across, between two feet. The heaviest thing on it hangs from the shortest run.",
  },
};
