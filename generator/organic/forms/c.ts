import type { Form } from "../types";
import { merge, branch, chain } from "../grow";

/**
 * C — a branching growth, dividing four times.
 *
 * Every division thins and every tip swells, so the ends read as buds rather
 * than as cuts. It leans, because a growth that went straight up would be a
 * diagram of a tree.
 */

const main = branch("br", [-3.6, 2.2, -2.4], [1, -0.62, 0.42], 3.2, 1.15, 4, 0.86, {
  thinning: 0.71,
  tipSwell: 1.65,
  lean: 0.2,
});

const foot = chain(
  "foot",
  [
    [-3.6, 2.2, -2.6],
    [-4.4, 2.8, -3.4],
    [-5.0, 3.4, -3.8],
  ],
  (t) => 1.3 + 0.5 * t,
  "b",
);

/** A second, much smaller growth from low on the trunk, going the other way. */
const sucker = branch("suck", [-1.9, 1.2, -1.4], [-0.4, 0.9, 0.7], 1.7, 0.55, 2, 0.9, {
  thinning: 0.7,
  tipSwell: 1.7,
});

const part = merge(main, foot, sucker);

export const formC: Form = {
  id: "form-c",
  title: "C",
  scheme: "moss",
  nodes: part.nodes,
  links: [...part.links, { a: "br-root", b: "foot-0", tone: "b" }, { a: "br-1", b: "suck-root" }],
  notes: {
    structure: "Branching. Four generations, each thinner than the last, each tip swelling to a bud.",
    suggests: "Spreading, or reaching. It occupies more space than it weighs.",
    register: "Grown. A branching structure and nothing else.",
    balance: "Over a single thickened foot, well to one side of the spread it carries.",
  },
};
