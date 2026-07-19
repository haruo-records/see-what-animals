import type { Creature, Part } from "../types";
import { stalk, chip, slot, leaning, swell, pressed, becomes, flat, grows } from "../mass";
import { KIND } from "../palette";
import { press } from "../relate";

/**
 * PURPOSE: TO STRAIN. To let some of what arrives continue and keep the rest.
 *
 * A straining thing presents a broad face to the flow and is perforated across
 * it. The openings are SLOTS, not holes: a row of round holes reads as a
 * colander or a drilled plate, and a drilled plate is a manufactured object.
 * Slots of unequal length read as gaps that something passes through.
 *
 * One slot has closed up. Whatever was being strained eventually won.
 */

const face: Part = {
  id: "straining-face",
  character: "compressed mass",
  outline: chip(
    stalk(
      leaning([336, 400], 62, 22, 400, 10),
      pressed(swell(126, 34, 0.42, 0.68), 0.66, 0.22, 0.3),
      becomes(swell(116, 28, 0.4, 0.62), grows(112, 84, 1.2), 0.6, 0.4),
    ),
    0.52,
    0.09,
  ),
  depth: 1,
  openings: [
    // Four slots, unequal, following the face rather than ruled across it.
    { outline: slot([392, 462], [452, 566], 21, 0.5), rim: 6 },
    { outline: slot([452, 430], [516, 552], 24, 0.42), rim: 6 },
    { outline: slot([514, 424], [572, 528], 19, 0.55), rim: 6 },
    // The fourth is short and nearly shut — the one that silted up.
    { outline: slot([576, 442], [604, 484], 13, 0.7), rim: 6 },
  ],
  relations: [{ to: "silted-mass", is: "encloses" }],
};

const silted: Part = {
  id: "silted-mass",
  character: "compressed cavity",
  // The accretion that closed the fourth slot, bulging out past the face.
  outline: stalk(leaning([566, 434], 44, 18, 118, 6), swell(46, 20, 0.44, 0.62), swell(42, 16, 0.6, 0.62)),
  depth: 2,
  relations: [{ to: "straining-face", is: "wedges-into" }],
};

const seat: Part = {
  id: "seated-base",
  character: "anchored mass",
  outline: stalk(
    leaning([352, 706], 6, 14, 268, 8),
    becomes(swell(62, 26, 0.42, 0.62), flat(48), 0.58, 0.42),
    grows(66, 48, 0.9),
  ),
  depth: 0,
  relations: [{ to: "straining-face", is: "supports" }],
};

export const prototypeC: Creature = {
  id: "prototype-c",
  title: "C — the one with four slots and a fifth that closed",
  palette: KIND,
  parts: [press(seat, face, 92), face, press(silted, face, 14)],
  notes: {
    purpose:
      "To strain. A broad face held upright across a flow, perforated with slots that let some of what arrives keep going.",
    traceOfTime:
      "The upper edge is worn shallow where things have run over it. One corner is broken on a straight face. The smallest slot has silted up entirely and the accretion now bulges past the surface.",
    order: "A graded series. Four slots decreasing in size along the face.",
    deviation: "The last one is not merely smaller; it is shut, and what shut it is still there.",
    wayOfLiving: "It stands in something moving and keeps a fraction of it.",
    suggestedUse: "Sorting. Something was being separated here, by size, and the smallest grade has stopped working.",
    centreOfGravity: "Low, in the seated base. The face leans back off vertical, into whatever it faces.",
    charm:
      "It is failing very slowly and entirely gracefully, one slot at a time, and the failure is the most interesting thing about it.",
    asObject:
      "At 5cm it reads as a fitting from something larger; at 50cm it reads as the whole apparatus. It does not need a size to make sense.",
    whyPocketed:
      "The slots are the sort of thing you hold up to the light. Three go through and one does not, and it takes a moment to see why.",
  },
};
