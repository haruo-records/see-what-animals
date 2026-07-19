import type { Creature, Part } from "../types";
import { stalk, chip, sag, slot, nub, leaning, swell, pressed, becomes, flat, grows } from "../mass";
import { KIND } from "../palette";
import { press } from "../relate";

/**
 * PURPOSE: TO HOLD SOMETHING AND KEEP IT.
 *
 * A holding vessel is heaviest at the bottom, because that is where what it
 * holds ends up, and it sags there for the same reason. The opening is at the
 * top and is partly closed over — a mouth that has narrowed, either by design
 * or by whatever has been going in and out of it.
 *
 * The rim is chipped on one side. Things have been got out in a hurry.
 */

const vessel: Part = {
  id: "holding-mass",
  character: "swollen mass",
  outline: sag(
    chip(
      stalk(
        leaning([386, 366], 74, 20, 380, 10),
        // Narrow at the mouth, very full low down: the profile of a thing with
        // contents rather than a thing with a shape.
        becomes(flat(78), swell(154, 40, 0.78, 0.42), 0.42, 0.5),
        becomes(flat(72), swell(146, 36, 0.76, 0.44), 0.42, 0.5),
      ),
      // The chip in the rim.
      0.03,
      0.07,
    ),
    // And the sag: pulled down where it is least supported.
    34,
    0.2,
    0.9,
  ),
  depth: 1,
  openings: [
    // The mouth: a slot, not a circle, and narrowed at one end where it has
    // closed over.
    { outline: slot([420, 344], [536, 386], 46, 0.34), rim: 9 },
  ],
  relations: [{ to: "collar", is: "encloses" }],
};

const collar: Part = {
  id: "collar",
  character: "folded flap",
  // The material that has folded over the mouth, narrowing it. It is part of
  // the vessel, and it is in the way.
  outline: stalk(
    leaning([408, 322], 16, 38, 190, 7),
    becomes(swell(44, 18, 0.4, 0.6), flat(30), 0.6, 0.42),
    becomes(flat(38), swell(34, 14, 0.72, 0.4), 0.55, 0.42),
  ),
  depth: 2,
  relations: [{ to: "holding-mass", is: "folds-back-onto" }],
};

const foot: Part = {
  id: "settled-foot",
  character: "supporting nub",
  outline: nub([458, 690], 88, 92, 78),
  depth: 0,
  relations: [{ to: "holding-mass", is: "supports" }],
};

export const prototypeE: Creature = {
  id: "prototype-e",
  title: "E — the one that sagged where it was full",
  palette: KIND,
  parts: [press(foot, vessel, 88), vessel, press(collar, vessel, 14)],
  notes: {
    purpose:
      "To hold something and keep it. Narrow at the mouth, very full low down, standing on one broad foot.",
    traceOfTime:
      "It has sagged under its own contents — the lower body hangs below where the form would otherwise sit. The rim is chipped on one side. Material has folded across the mouth and narrowed it.",
    order: "One axis, thickening downward. A simple vertical order, kept.",
    deviation: "The folded collar, which came over the mouth and stayed, so the opening is no longer symmetrical about anything.",
    wayOfLiving: "It fills, slowly, and does not empty at the same rate.",
    suggestedUse: "Storing. Something went in through the mouth and the mouth has been closing ever since.",
    centreOfGravity: "Very low, in the sagged belly, well below the middle of the form.",
    charm:
      "It is closing itself by degrees while continuing to be a container, and neither fact appears to be a problem for it.",
    asObject:
      "At 5cm it is a stopper or a weight; at 50cm it is a storage vessel. The sag reads as clay at both sizes.",
    whyPocketed:
      "The mouth is narrow enough that you cannot quite see in, and the shape of the sag tells you there is something to see.",
  },
};
