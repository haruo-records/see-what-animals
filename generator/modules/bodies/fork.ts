import type { BodyModule, SpineNode } from "../../registry/module-types";
import { grow, alongSpine } from "../../render/skeleton";

/**
 * One trunk that divides into two branches of unequal length and thickness.
 * The split is the whole event: below it there is one thing, above it there
 * are two, and neither branch resembles the other.
 */
export const bodyFork: BodyModule = {
  id: "body-fork-01",
  category: "body",
  version: 1,
  label: "fork",
  enabled: true,
  tags: ["shape", "fragmented", "silhouette", "spacing"],
  parameters: {
    trunk: { type: "number", min: 260, max: 420, default: 330 },
    trunkWidth: { type: "number", min: 70, max: 130, default: 96 },
    branchA: { type: "number", min: 300, max: 520, default: 420 },
    branchB: { type: "number", min: 140, max: 330, default: 230 },
    spread: { type: "number", min: 0.35, max: 1.15, default: 0.72 },
    lean: { type: "number", min: -0.4, max: 0.4, default: 0.16 },
  },
  plan({ cx, cy, params }) {
    const tw = Number(params.trunkWidth);
    const lean = Number(params.lean);
    const up = -Math.PI / 2 + lean;

    const trunk = grow({
      x: cx,
      y: cy + Number(params.trunk) * 0.5,
      heading: up,
      length: Number(params.trunk),
      steps: 10,
      turn: 0,
      radiusAt: (t) => tw * (1 - 0.22 * t),
    });

    const joint = trunk[trunk.length - 1];
    const spread = Number(params.spread);
    const branch = (len: number, dir: number, thickness: number, taper: number): SpineNode[] =>
      grow({
        x: joint.x,
        y: joint.y,
        heading: up + spread * dir,
        length: len,
        steps: 12,
        turn: -spread * dir * 0.055,
        radiusAt: (t) => thickness * (1 - taper * t) + 8,
      });

    // The long branch stays thick; the short one thins to almost nothing.
    const a = branch(Number(params.branchA), -1, tw * 0.82, 0.35);
    const b = branch(Number(params.branchB), 0.78, tw * 0.62, 0.78);

    return {
      spines: [trunk, a, b],
      voids: [],
      plate: { t: 0.08, size: tw * 1.5, skew: 0.25 },
      lines: [0.72, 0.94],
    };
  },
};
