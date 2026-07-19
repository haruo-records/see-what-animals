import type { Creature, Part } from "../types";
import { ring } from "../shape";
import { layer, press } from "../relate";

/**
 * PROTOTYPE A — a rigid part and a soft part biting into one another.
 *
 * The slab has gone into the swelling far enough that neither could now be
 * removed without the other giving way. Which one arrived first is not
 * decidable, and that is the intent: the boundary between them is a place where
 * the body changes character, not a joint where two objects were fitted.
 */

const softMass: Part = {
  id: "soft-mass",
  character: "swollen",
  // An irregular ring: no two radii equal, so it never settles into an ellipse.
  outline: ring(430, 520, [252, 228, 268, 206, 244, 222, 262, 236]),
  // Rounded heavily everywhere — this part is all give.
  rounding: [120, 105, 130, 95, 118, 100, 126, 110],
  depth: 0,
  openings: [
    {
      // An opening low on the swelling, irregular and half-covered by the slab
      // once that is painted over it. A partly hidden opening reads as a body
      // with an inside; a clean full ellipse reads as a pipe.
      outline: [
        [470, 452],
        [556, 470],
        [572, 528],
        [516, 552],
        [462, 520],
      ],
      rounding: [34, 12, 40, 26, 18],
      rim: 7,
    },
  ],
  relations: [{ to: "rigid-slab", is: "encloses" }],
};

const rigidSlab: Part = {
  id: "rigid-slab",
  character: "rigid",
  // Four corners, no two edges parallel: a slab that was never machined.
  outline: [
    [548, 306],
    [842, 366],
    [806, 486],
    [524, 432],
  ],
  // Sharp at two corners, soft at two. Hard and soft inside one outline.
  rounding: [12, 44, 9, 30],
  depth: 1,
  edges: [
    {
      // The near edge of its thickness: the face that turns away underneath.
      points: [
        [556, 402],
        [700, 432],
        [800, 446],
      ],
      rounding: [0, 30, 0],
      weight: 9,
    },
  ],
  relations: [{ to: "soft-mass", is: "wedges-into" }],
};

const trailingVolume: Part = {
  id: "trailing-volume",
  character: "tapered",
  // Comes out from behind the swelling and thins as it goes.
  outline: [
    [352, 572],
    [258, 664],
    [126, 812],
    [92, 774],
    [206, 632],
    [300, 512],
  ],
  rounding: [48, 14, 58, 22, 12, 54],
  depth: -1,
  relations: [
    { to: "soft-mass", is: "passes-behind" },
    { to: "soft-mass", is: "trails-behind" },
  ],
};

const caughtWedge: Part = {
  id: "caught-wedge",
  character: "wedged",
  // Small, angular, sitting on the slab's far end and overhanging it.
  outline: [
    [790, 344],
    [884, 378],
    [858, 452],
    [806, 424],
  ],
  rounding: [6, 40, 8, 22],
  depth: 2,
  relations: [{ to: "rigid-slab", is: "rests-on" }],
};

const ordered = layer([trailingVolume, softMass, rigidSlab, caughtWedge]);

export const prototypeA: Creature = {
  id: "prototype-a",
  title: "Prototype A",
  parts: [
    ordered[0],
    ordered[1],
    // Pressed in until the two genuinely interpenetrate. A slab that stopped
    // at the swelling's edge would read as two objects set side by side.
    press(ordered[2], ordered[1], 26),
    ordered[3],
  ],
  notes: {
    centreOfGravity:
      "Low and left, inside the swelling — but the slab and the wedge both sit high and right, so the mass and the weight of incident are at opposite ends.",
    imaginedMovement:
      "It cannot travel. It could rock on the swelling, and the slab would swing the whole thing further than intended each time.",
    awkwardness:
      "The slab is in too far to come out and too far in to be ignored. The tapered part behind is always a little late.",
    charm:
      "It is carrying something it did not choose and has stopped minding. The opening low on the swelling is half covered by the slab, so even its own inside is partly not its business any more.",
    asObject:
      "About 30cm. A soft resin swelling, a slab of something denser pushed into it, one tapered arm reaching back behind. It would stand on the swelling and lean.",
  },
};
