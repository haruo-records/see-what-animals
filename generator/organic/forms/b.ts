import type { Form } from "../types";
import { merge, chain, ringPoints } from "../grow";

/**
 * B — a radial spray, low and wide, from a swollen centre.
 *
 * Eight arms leaving one mass in a shallow bowl, curling up at the ends. Wider
 * than it is tall on purpose: a low form has no upright to read as a body.
 */

const centre = chain(
  "core",
  [
    [0, 0, -0.4],
    [0.3, 0.2, 0.9],
  ],
  (t) => 2.0 - 0.35 * t,
);

const arms = ringPoints([0, 0, 0], 1, 8, "xy", 12).map((p, i) => {
  const [ux, uy] = [p[0], p[1]];
  // Every arm the same, apart from one that stopped short.
  const reach = i === 5 ? 3.4 : 6.2;
  return chain(
    `arm${i}`,
    [
      [ux * 1.4, uy * 1.4, 0.2],
      [ux * (reach * 0.45), uy * (reach * 0.45), -0.5],
      [ux * (reach * 0.78), uy * (reach * 0.78), -0.2],
      [ux * reach, uy * reach, 0.9],
      [ux * (reach + 0.5), uy * (reach + 0.5), 1.9],
    ],
    (t) => 0.95 - 0.55 * t + (t > 0.82 ? 0.75 : 0),
    i === 5 ? "b" : "a",
  );
});

const beads = ringPoints([0, 0, 2.4], 1.6, 3, "xy", 60).map((p, i) =>
  chain(`bead${i}`, [[p[0], p[1], p[2]]], () => 0.62, "b"),
);

const part = merge(centre, ...arms, ...beads);

export const formB: Form = {
  id: "form-b",
  title: "B",
  scheme: "ochre",
  nodes: part.nodes,
  links: [
    ...part.links,
    ...arms.map((_, i) => ({ a: "core-0", b: `arm${i}-0` })),
    ...beads.map((_, i) => ({ a: "core-1", b: `bead${i}-0`, tone: "b" as const })),
  ],
  notes: {
    structure: "Radial. Eight arms from one swollen centre, curling up at their ends.",
    suggests: "Gathering, or straining. Everything it does, it appears to do at the rim.",
    register: "Grown. Radial, and entirely soft.",
    balance: "Low and even, sitting in its own middle. One arm is half length, so it is not quite even after all.",
  },
};
