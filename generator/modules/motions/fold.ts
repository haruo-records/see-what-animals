import type { MotionModule } from "../../registry/module-types";
import { r2 } from "../../render/skeleton";

/** A narrowing on one axis only, as if closing partway and opening again. */
export const motionFold: MotionModule = {
  id: "motion-fold-01",
  category: "motion",
  version: 1,
  label: "fold",
  enabled: true,
  tags: ["movement", "shape", "continuous"],
  parameters: {
    duration: { type: "number", min: 8, max: 40, default: 18 },
    depth: { type: "number", min: 0.06, max: 0.34, default: 0.18 },
  },
  animate({ params }) {
    const dur = Number(params.duration);
    const depth = Number(params.depth);
    return {
      target: "inner",
      nodes: [
        {
          tag: "animateTransform",
          attrs: {
            attributeName: "transform",
            additive: "sum",
            type: "scale",
            values: `1 1;${r2(1 - depth)} 1;1 1`,
            dur: `${r2(dur)}s`,
            repeatCount: "indefinite",
          },
        },
      ],
    };
  },
};
