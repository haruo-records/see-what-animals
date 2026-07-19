import type { Creature, Part } from "../types";
import { press } from "../relate";

/**
 * PROTOTYPE C — a body that folds back and holds itself.
 *
 * It goes out, turns, and comes back inside its own line, gripping a smaller
 * mass on the way. There is no end that reads as the front. Whichever way it
 * is going, most of it is pointing the other way.
 */

const outward: Part = {
  id: "outward-run",
  character: "folded",
  // The long run: leaves low-left, rises, and begins to turn at the right.
  outline: [
    [176, 664],
    [288, 486],
    [512, 374],
    [726, 372],
    [828, 456],
    [792, 596],
    [668, 512],
    [508, 496],
    [346, 588],
    [258, 730],
  ],
  // Restrained. Heavy rounding on a band eats it: each corner cuts back along
  // both edges, so a radius near the band's own width pulls the two long sides
  // toward each other until the part is thinner than drawn. That is how the
  // first version of this body ended up with no overlaps at all — the runs were
  // designed to meet and the rounding quietly moved them apart.
  rounding: [34, 26, 44, 18, 12, 24, 16, 38, 30, 36],
  depth: 1,
  edges: [
    {
      // The crease along the top of the run, where the upper surface folds
      // over. It runs only as far as the fold does.
      points: [
        [330, 500],
        [520, 434],
        [688, 428],
      ],
      rounding: [0, 50, 0],
      weight: 9,
    },
  ],
  relations: [{ to: "return-run", is: "folds-back-onto" }],
};

const returnRun: Part = {
  id: "return-run",
  character: "folded",
  // The way back, tucked behind the outward run and ending under its start.
  outline: [
    [806, 528],
    [714, 606],
    [498, 652],
    [316, 640],
    [222, 706],
    [300, 772],
    [520, 776],
    [736, 706],
    [858, 586],
  ],
  rounding: [22, 34, 30, 18, 14, 26, 36, 30, 20],
  depth: 0,
  relations: [
    { to: "outward-run", is: "passes-behind" },
    { to: "outward-run", is: "wraps-around" },
  ],
};

const held: Part = {
  id: "held-mass",
  character: "compressed",
  // Caught in the fold and flattened by it. Wider than it is tall because of
  // where it is, not because it was drawn that way.
  outline: [
    [408, 528],
    [566, 512],
    [664, 566],
    [640, 654],
    [478, 682],
    [382, 616],
  ],
  rounding: [40, 26, 20, 34, 30, 44],
  depth: 2,
  relations: [
    { to: "outward-run", is: "wedges-into" },
    { to: "return-run", is: "rests-on" },
  ],
};

const stray: Part = {
  id: "stray-end",
  character: "tapered",
  // A thin end that got out and is going somewhere else entirely.
  outline: [
    [790, 452],
    [900, 388],
    [944, 402],
    [872, 470],
    [806, 500],
  ],
  rounding: [26, 34, 12, 40, 22],
  depth: -1,
  relations: [
    { to: "outward-run", is: "remains-slightly-detached" },
    { to: "outward-run", is: "pulls-sideways" },
  ],
};

export const prototypeC: Creature = {
  id: "prototype-c",
  title: "Prototype C",
  parts: [
    stray,
    returnRun,
    outward,
    // Pressed into the fold so it is gripped rather than resting in a gap.
    press(held, outward, 8),
  ],
  notes: {
    centreOfGravity:
      "Mid-low, roughly under the held mass, where the two runs cross. It sits in the fold rather than in any one part.",
    imaginedMovement:
      "It could roll along the fold, or tighten and loosen. Either way it arrives sideways.",
    awkwardness:
      "It has both ends at the same side and is holding something it cannot put down without opening, and it cannot open while holding it.",
    charm:
      "The stray end is still heading off in its own direction, quite calmly, while the rest of the body has already turned round and gone back.",
    asObject:
      "About 30cm. One long folded band of a stiff, slightly springy material, doubled back on itself, with a softer lump caught in the doubling.",
  },
};
