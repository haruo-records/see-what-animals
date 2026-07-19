import type { BodyModule } from "../../registry/module-types";
import { grow } from "../../render/skeleton";

/**
 * A broad flat body with a long tail trailing behind it, held at an angle as
 * if it is being carried by something. It has no way of stopping.
 */
export const bodyDriftingPlate: BodyModule = {
  id: "body-drifting-plate-01",
  category: "body",
  version: 1,
  label: "drifting-plate",
  enabled: true,
  tags: ["shape", "silhouette", "layer", "continuous"],
  parameters: {
    breadth: { type: "number", min: 300, max: 450, default: 370 },
    thickness: { type: "number", min: 90, max: 165, default: 125 },
    tail: { type: "number", min: 300, max: 520, default: 400 },
    drift: { type: "number", min: -0.7, max: 0.7, default: 0.34 },
    curl: { type: "number", min: 0.02, max: 0.14, default: 0.07 },
  },
  plan({ cx, cy, params }) {
    const breadth = Number(params.breadth);
    const th = Number(params.thickness);
    const drift = Number(params.drift);

    const body = grow({
      x: cx - breadth * 0.4,
      y: cy,
      heading: drift,
      length: breadth,
      steps: 12,
      turn: 0.01,
      // A lens: thin at both ends, deepest just past the middle.
      radiusAt: (t) => th * (0.28 + 0.72 * Math.sin(Math.pow(t, 0.85) * Math.PI)),
    });

    const from = body[body.length - 2];
    const tail = grow({
      x: from.x,
      y: from.y,
      heading: drift + 0.35,
      length: Number(params.tail),
      steps: 14,
      turn: Number(params.curl),
      radiusAt: (t) => th * 0.42 * Math.pow(1 - t, 1.3) + 5,
    });

    return {
      spines: [body, tail],
      voids: [{ t: 0.42, rx: th * 0.4, ry: th * 0.34 }],
      lines: [0.24, 0.58],
    };
  },
};
