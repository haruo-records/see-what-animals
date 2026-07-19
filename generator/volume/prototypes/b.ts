import type { Creature, Part } from "../types";
import { ring } from "../shape";
import { press } from "../relate";

/**
 * PROTOTYPE B — a large mass on supports too small and too far to one side.
 *
 * The supports are gathered under the right of the body while most of the mass
 * hangs out to the left. It holds, which is the whole achievement; nothing
 * about the arrangement suggests it was ever going to.
 */

const bulk: Part = {
  id: "bulk",
  character: "swollen",
  // Wider left than right: the overhang is built into the mass, not added.
  outline: ring(470, 330, [292, 236, 244, 214, 258, 268, 300, 286]),
  rounding: [130, 96, 108, 88, 104, 118, 136, 124],
  depth: 1,
  edges: [
    {
      // Where the underside turns away from the light side. It stops short of
      // both edges: the form is shown, not outlined.
      points: [
        [262, 452],
        [430, 508],
        [606, 486],
      ],
      rounding: [0, 60, 0],
      weight: 10,
    },
  ],
  relations: [{ to: "near-support", is: "rests-on" }],
};

const farSupport: Part = {
  id: "far-support",
  character: "curved-support",
  // A bent strut. Narrow, and it meets the ground at an angle that is not
  // the angle it leaves the body at.
  outline: [
    [576, 400],
    [640, 418],
    [688, 700],
    [712, 792],
    [664, 802],
    [630, 706],
    [560, 434],
  ],
  rounding: [30, 22, 18, 10, 26, 20, 34],
  depth: 0,
  relations: [{ to: "bulk", is: "supports" }],
};

const nearSupport: Part = {
  id: "near-support",
  character: "curved-support",
  // Shorter, in front, and leaning the other way. It reaches the ground first
  // and therefore takes more than its share.
  outline: [
    [508, 396],
    [566, 414],
    [594, 690],
    [612, 754],
    [556, 766],
    [534, 692],
    [488, 428],
  ],
  rounding: [26, 18, 14, 34, 20, 16, 28],
  depth: 2,
  edges: [
    {
      // The near face of the strut, showing it has a thickness.
      points: [
        [528, 520],
        [560, 690],
      ],
      rounding: [0, 0],
      weight: 8,
    },
  ],
  relations: [{ to: "bulk", is: "supports" }],
};

const overhang: Part = {
  id: "overhang",
  character: "hanging",
  // Out past the left edge of the mass, with nothing beneath it at all.
  outline: [
    [232, 388],
    [176, 466],
    [126, 606],
    [166, 636],
    [214, 512],
    [268, 440],
  ],
  rounding: [42, 20, 50, 24, 16, 46],
  depth: 0,
  relations: [
    { to: "bulk", is: "hangs-from" },
    { to: "bulk", is: "pulls-sideways" },
  ],
};

export const prototypeB: Creature = {
  id: "prototype-b",
  title: "Prototype B",
  parts: [
    overhang,
    farSupport,
    bulk,
    // Pressed up into the mass so the strut disappears into it rather than
    // stopping at its edge — the difference between a leg and a stand.
    press(nearSupport, bulk, 34),
  ],
  notes: {
    centreOfGravity:
      "Well to the left of both supports, out over the overhang. On paper it should topple; it evidently does not.",
    imaginedMovement:
      "It can shuffle by lifting one support at a time, and each time the overhang swings and has to be waited for.",
    awkwardness:
      "Everything that holds it up is on one side and everything it is carrying is on the other. The two supports do not agree on an angle.",
    charm:
      "Two thin things doing the work of something much sturdier, entirely without comment. It is out past its own balance and has not noticed.",
    asObject:
      "About 30cm. A heavy upper mass in one material, two slim struts of another entering it from below, and a limb hanging clear on the far side.",
  },
};
