import type { Creature, Part } from "../types";
import { stalk, chip, nub, leaning, swell, pressed, becomes, flat, grows } from "../mass";
import { KIND } from "../palette";
import { press } from "../relate";

/**
 * PURPOSE, decided first: TO BEAR A LOAD.
 *
 * Everything follows from that and nothing was drawn before it. A thing whose
 * job is to take weight is squat, is widest where the load arrives, spreads at
 * the bottom, and goes flat on top where the load has been sitting. The flat is
 * not a design decision; it is the record of the job.
 *
 * One corner has gone. Whatever it was bearing shifted once, and the block took
 * it at the edge.
 */

const block: Part = {
  id: "bearing-block",
  character: "compressed mass",
  outline: chip(
    stalk(
      leaning([328, 452], -3, 8, 348, 9),
      // Broadly flattened on top across the whole bearing face — worn, not
      // shaped. A single dip would read as a cup; a long flat reads as use.
      pressed(swell(122, 30, 0.46, 0.7), 0.52, 0.34, 0.42),
      // Spreading toward the base, where the weight has to go somewhere.
      becomes(swell(108, 26, 0.4, 0.6), grows(118, 152, 1.3), 0.55, 0.45),
    ),
    // The break: a straight facet across one upper corner.
    0.09,
    0.1,
  ),
  depth: 1,
  edges: [
    {
      // The near edge of the bearing face, showing the block has a top surface
      // and not just a silhouette.
      points: [
        [386, 402],
        [520, 386],
        [636, 406],
      ],
      weight: 11,
    },
  ],
  relations: [{ to: "left-foot", is: "rests-on" }],
};

const leftFoot: Part = {
  id: "left-foot",
  character: "supporting nub",
  outline: nub([414, 596], 84, 96, 62),
  depth: 0,
  relations: [{ to: "bearing-block", is: "supports" }],
};

const rightFoot: Part = {
  id: "right-foot",
  character: "supporting nub",
  // The pair is a pair, but this one has spread wider under the load.
  outline: nub([618, 600], 96, 84, 76),
  depth: 2,
  relations: [{ to: "bearing-block", is: "supports" }],
};

const accreted: Part = {
  id: "accreted-lobe",
  character: "clinging lobe",
  // Something attached itself to the flank and stayed. It has nothing to do
  // with bearing loads, which is precisely why it is worth looking at.
  outline: stalk(leaning([642, 466], -34, 26, 104, 5), swell(44, 16, 0.5, 0.6), swell(40, 14, 0.62, 0.6)),
  depth: 3,
  relations: [{ to: "bearing-block", is: "rests-on" }],
};

export const prototypeA: Creature = {
  id: "prototype-a",
  title: "A — the one worn flat across the top",
  palette: KIND,
  parts: [leftFoot, block, rightFoot, press(accreted, block, 16)],
  notes: {
    purpose: "To bear a load. Widest where weight arrives, spread at the base, flat where the weight sat.",
    traceOfTime:
      "The bearing face is worn flat across its whole width. One upper corner has broken away on a straight facet. Something has since attached itself to the right flank and stayed.",
    order: "Bilateral. One block on a pair of feet.",
    deviation: "The right foot has spread wider and shorter than its opposite, under a load that was never centred.",
    wayOfLiving: "It takes weight. It has been taking weight long enough to be a different shape for it.",
    suggestedUse: "Something rested on this, repeatedly, for a very long time.",
    centreOfGravity: "Low and slightly right, over the spread foot.",
    charm:
      "It lost a corner at some point and carried on doing the job, and something unrelated has moved in on one side.",
    asObject:
      "Works at 5cm in bronze on a desk and at 50cm in cast stone in a yard. Nothing about it depends on being small.",
    whyPocketed:
      "It has a flat that is obviously wear and a break that is obviously a break. Both say it was used, and neither says what for.",
  },
};
