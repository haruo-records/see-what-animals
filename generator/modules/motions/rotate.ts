import type { MotionModule } from "../../registry/module-types";
import { r2 } from "../../render/skeleton";

/**
 * A slow turn. Nothing travels — the form stays exactly where it is and only
 * its orientation changes.
 *
 * All motion modules animate about the GROUP ORIGIN. The renderer places that
 * origin at the centre of the canvas, so no module needs to know the centre and
 * every animation composes with `additive="sum"`.
 */
export const motionRotate: MotionModule = {
  id: "motion-rotate-01",
  category: "motion",
  version: 1,
  label: "rotate",
  enabled: true,
  tags: ["movement", "continuous"],
  parameters: {
    duration: { type: "number", min: 14, max: 90, default: 42 },
    reverse: { type: "boolean", default: false },
  },
  animate({ params }) {
    const dur = Number(params.duration);
    const rev = Boolean(params.reverse);
    return {
      target: "outer",
      nodes: [
        {
          tag: "animateTransform",
          attrs: {
            attributeName: "transform",
            type: "rotate",
            additive: "sum",
            from: rev ? "360" : "0",
            to: rev ? "0" : "360",
            dur: `${r2(dur)}s`,
            repeatCount: "indefinite",
          },
        },
      ],
    };
  },
};
