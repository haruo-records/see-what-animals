import type { Creature, Part } from "../types";
import { stalk, chip, bent, leaning, swell, pressed, becomes, flat, grows } from "../mass";
import { KIND } from "../palette";
import { press } from "../relate";

/**
 * PURPOSE: TO HOOK ON AND HOLD.
 *
 * A hooking thing turns through a strong angle and thickens at the turn, where
 * all the load concentrates. Inside the turn is a notch — the seat the load
 * actually sits in. The far end is finished off with a stop, so what has been
 * hooked cannot travel back off the end.
 *
 * The notch is polished. The stop is chipped.
 */

const shaft: Part = {
  id: "hooking-shaft",
  character: "folded mass",
  outline: chip(
    stalk(
      // Through about 130 degrees over a short run, thickening into the turn.
      bent([306, 704], -66, 132, 470, 0.46, 12),
      // The inside of the turn is worn into a shallow seat: the notch is wear,
      // not a feature that was cut.
      pressed(becomes(swell(78, 30, 0.3, 0.6), grows(86, 58, 1.1), 0.5, 0.44), 0.56, 0.3, 0.16),
      becomes(flat(74), grows(88, 50, 1.2), 0.5, 0.44),
    ),
    0.06,
    0.08,
  ),
  depth: 1,
  edges: [
    {
      // Along the inside of the turn only — the one place a second surface of
      // this body genuinely comes into view.
      points: [
        [352, 604],
        [372, 490],
        [456, 424],
      ],
      weight: 10,
    },
  ],
  relations: [{ to: "stop", is: "holds-apart" }],
};

const stop: Part = {
  id: "stop",
  character: "resting bulge",
  // The swelling at the far end that keeps the load from running off.
  outline: chip(
    stalk(leaning([572, 380], 22, -26, 150, 6), swell(58, 24, 0.5, 0.62), swell(52, 20, 0.62, 0.62)),
    0.3,
    0.14,
  ),
  depth: 2,
  relations: [{ to: "hooking-shaft", is: "rests-on" }],
};

const heel: Part = {
  id: "heel",
  character: "anchored mass",
  // The thickened root, which is where this was fixed to whatever it served.
  outline: stalk(
    leaning([282, 716], 16, 12, 214, 7),
    becomes(swell(72, 26, 0.42, 0.62), flat(56), 0.6, 0.42),
    grows(68, 50, 0.9),
  ),
  depth: 0,
  relations: [{ to: "hooking-shaft", is: "supports" }],
};

const surplus: Part = {
  id: "surplus-nub",
  character: "supporting nub",
  // A small projection on the back of the turn that does nothing at all. Every
  // real object has one of these, and nobody knows what they are for either.
  outline: stalk(leaning([392, 452], -150, 20, 86, 5), swell(34, 12, 0.5, 0.6), swell(30, 10, 0.62, 0.6)),
  depth: 3,
  relations: [{ to: "hooking-shaft", is: "remains-slightly-detached" }],
};

export const prototypeD: Creature = {
  id: "prototype-d",
  title: "D — the one polished on the inside of its turn",
  palette: KIND,
  parts: [press(heel, shaft, 96), shaft, press(stop, shaft, 18), press(surplus, shaft, 12)],
  notes: {
    purpose:
      "To hook on and hold. A strong turn with a thickened root, a worn seat inside the bend, and a stop at the far end so nothing runs off.",
    traceOfTime:
      "The inside of the turn is worn into a shallow seat — that is where the load actually sat, for years. The stop has a chip out of it. There is a small projection on the back that serves no purpose anyone could name.",
    order: "A single fold, thickening into the bend.",
    deviation: "The surplus nub, which belongs to no part of the job and is nonetheless clearly original.",
    wayOfLiving: "It holds on to something and lets it hang.",
    suggestedUse: "Something was hung here, or hooked over, and taken off again, many times.",
    centreOfGravity: "Low and left, in the thickened heel. Everything past the turn is out over air.",
    charm:
      "The polish tells you exactly where the load sat. The nub on the back tells you nothing whatsoever and is impossible to ignore.",
    asObject:
      "At 5cm it is a fitting; at 50cm it is a piece of harbour ironwork. The form does not change, only what you assume it was attached to.",
    whyPocketed:
      "One part of it is smooth in a way that only happens from use. You can put your thumb exactly where something else spent years.",
  },
};
