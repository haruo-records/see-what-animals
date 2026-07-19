import type { Creature, Part } from "../types";
import { stalk, chip, leaning, swell, becomes, flat, grows } from "../mass";
import { series } from "../growth";
import { KIND } from "../palette";
import { press } from "../relate";

/**
 * PURPOSE: TO CATCH AND HOLD WHAT PASSES.
 *
 * A thing for catching is broad across the flow and carries a row of short
 * projections turned back against the direction of travel — anything that
 * comes in goes past the first and is stopped by the next. The row is the
 * working part; the body exists to hold the row in the current.
 *
 * One projection has snapped off at the base and left a flat.
 */

const body: Part = {
  id: "spread-body",
  character: "compressed mass",
  outline: stalk(
    leaning([300, 546], -14, 26, 430, 10),
    becomes(swell(96, 30, 0.34, 0.62), grows(78, 52, 1.2), 0.5, 0.44),
    becomes(flat(88), grows(74, 44, 1.2), 0.55, 0.44),
  ),
  depth: 1,
  edges: [
    {
      points: [
        [372, 512],
        [504, 452],
        [614, 428],
      ],
      weight: 10,
    },
  ],
  relations: [{ to: "catch-0", is: "carries" }],
};

/**
 * Four catches, all leaning back the same way. The third is a stump: broken at
 * the root, with a straight face where the rest of it used to be.
 */
const catches: Part[] = series(4, (i, t) => {
  const cx = 372 + t * 250;
  const cy = 502 - t * 96;
  const broken = i === 2;
  const reach = broken ? 62 : 148;
  const raw = stalk(
    leaning([cx, cy], -96, 34, reach, 6),
    becomes(grows(34, 30, 1), swell(38, 12, 0.8, 0.34), 0.5, 0.5),
    becomes(grows(32, 28, 1), swell(34, 10, 0.8, 0.34), 0.5, 0.5),
  );
  return broken ? chip(raw, 0.42, 0.2, 0.02) : raw;
}).map((outline, i) => ({
  id: `catch-${i}`,
  character: i === 2 ? "growing ridge" : "clinging lobe",
  outline,
  depth: i < 2 ? 0 : 2,
  relations: [{ to: "spread-body", is: i === 2 ? "remains-slightly-detached" : "rests-on" }],
}));

const anchor: Part = {
  id: "anchor-end",
  character: "anchored mass",
  outline: stalk(
    leaning([282, 556], 28, 16, 190, 7),
    becomes(swell(64, 24, 0.44, 0.62), flat(50), 0.6, 0.42),
    grows(60, 44, 0.9),
  ),
  depth: 3,
  relations: [{ to: "spread-body", is: "supports" }],
};

export const prototypeB: Creature = {
  id: "prototype-b",
  title: "B — the one with a row of catches and a stump",
  palette: KIND,
  parts: [...catches, body, press(anchor, body, 20)],
  notes: {
    purpose:
      "To catch and hold what passes. Broad across the flow, with a row of short projections all leaning back against it.",
    traceOfTime:
      "The third catch snapped off at the root and left a straight face. The remaining three are visibly worn on their leading side.",
    order: "Repetition. Four catches at even spacing, all at the same backward lean.",
    deviation: "One of them is a stump, so the rhythm has a gap in it that used to be filled.",
    wayOfLiving: "It sits across a flow and lets most things through.",
    suggestedUse: "Something was meant to be stopped by this. Whatever it was, it was small and it kept coming.",
    centreOfGravity: "Low and left, over the anchored end. The working row is out over nothing.",
    charm:
      "Three catches doing the work of four, in a row that still reads as a row, entirely unbothered about the gap.",
    asObject:
      "At 5cm it is a curious brooch-like thing; at 50cm it is unmistakably a piece of equipment. Both are true of it.",
    whyPocketed:
      "The broken stump is the interesting part. Something is missing, and the shape of what is left says roughly how big it was.",
  },
};
