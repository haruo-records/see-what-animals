import type { Creature, Part } from "../types";
import { stalk, chip, slot, leaning, swell, pressed, becomes, flat, grows } from "../mass";
import { KIND } from "../palette";
import { press } from "../relate";

/**
 * PURPOSE: TO SOUND. To be struck, or to be passed over by moving air, and to
 * answer.
 *
 * A resonating thing is long, thin-walled, and open along its length rather
 * than at its ends. The long slot is the mouth; the body either side of it is
 * as thin as it can be and still hold. It is stretched, because length is what
 * sets the note, and it is crushed at one end, which will have changed the note.
 *
 * This is the least creature-like of the six, deliberately. It is here to hold
 * the far end of the range.
 */

const bar: Part = {
  id: "sounding-body",
  character: "compressed mass",
  outline: chip(
    stalk(
      // Long and shallow: proportion here is doing the acoustic work.
      leaning([258, 596], -22, 30, 480, 12),
      becomes(swell(86, 24, 0.34, 0.6), grows(80, 48, 1.2), 0.5, 0.46),
      // Deeper below than above — the wall thickness is not symmetrical, which
      // is what stops the whole thing reading as an extruded section.
      becomes(flat(98), grows(92, 54, 1.2), 0.52, 0.46),
    ),
    // Crushed and broken at the far end.
    0.44,
    0.11,
  ),
  depth: 1,
  openings: [
    // The long mouth, running most of the length and tapering with the body.
    { outline: slot([360, 516], [606, 404], 19, 0.46), rim: 8 },
  ],
  edges: [
    {
      // The near wall, showing there is a thickness on this side of the mouth.
      points: [
        [318, 578],
        [470, 502],
        [614, 434],
      ],
      weight: 9,
    },
  ],
  relations: [{ to: "seated-end", is: "rests-on" }],
};

const seat: Part = {
  id: "seated-end",
  character: "anchored mass",
  // The heavy end it rests on and sounds from.
  outline: stalk(
    leaning([214, 616], 34, 22, 214, 7),
    becomes(swell(80, 28, 0.4, 0.62), flat(56), 0.6, 0.42),
    grows(76, 52, 0.9),
  ),
  depth: 0,
  relations: [{ to: "sounding-body", is: "supports" }],
};

const stopper: Part = {
  id: "wedged-stopper",
  character: "compressed cavity",
  // Something has lodged in the mouth, part way along. Whatever note this had,
  // it does not have it now.
  outline: stalk(leaning([486, 452], 28, -22, 128, 6), swell(38, 16, 0.46, 0.62), swell(34, 14, 0.6, 0.62)),
  depth: 2,
  relations: [{ to: "sounding-body", is: "wedges-into" }],
};

export const prototypeF: Creature = {
  id: "prototype-f",
  title: "F — the one with something lodged in its mouth",
  palette: KIND,
  parts: [seat, bar, press(stopper, bar, 12)],
  notes: {
    purpose:
      "To sound. Long, thin-walled, open along its length rather than at its ends, and heavy at the end it rests on.",
    traceOfTime:
      "The far end is crushed and broken off on a straight face. Something has lodged in the mouth about two thirds along and has not come out.",
    order: "A single stretched axis, tapering steadily along its length.",
    deviation: "The crushed end, and the lodged mass, both of which will have changed whatever it used to do.",
    wayOfLiving: "It lies where it is put and answers when something disturbs it. Less than it used to.",
    suggestedUse: "It was struck, or air was passed over it. The long opening is a mouth, not a hole.",
    centreOfGravity: "Low and far left, in the seated end. The rest lies out along the ground.",
    charm:
      "Something is stuck in it. Not damaged, not blocked exactly — just occupied, and quietly getting on with a reduced version of the job.",
    asObject:
      "At 5cm it is a whistle you cannot sound; at 50cm it is an instrument leaning in a corner. The proportion carries either.",
    whyPocketed:
      "You would shake it to see if the lodged piece comes out. It does not, and that is worth finding out more than once.",
  },
};
