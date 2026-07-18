import type { BodyModule } from "../../registry/module-types";
import { r2 } from "../shared";

/**
 * A single closed mass, slightly out of round. The distortion is deliberate:
 * a true ellipse reads as a diagram, and a form that is almost-but-not-quite
 * regular is harder to file away as one known thing.
 */
export const bodyOval: BodyModule = {
  id: "body-oval-01",
  category: "body",
  version: 1,
  label: "oval",
  enabled: true,
  tags: ["shape", "softness", "continuous", "silhouette"],
  parameters: {
    width: { type: "number", min: 260, max: 620, default: 440 },
    height: { type: "number", min: 220, max: 600, default: 380 },
    lean: { type: "number", min: -0.28, max: 0.28, default: 0.08 },
    irregularity: { type: "number", min: 0, max: 0.22, default: 0.1 },
  },
  draw({ cx, cy, params, colors }) {
    const w = Number(params.width);
    const h = Number(params.height);
    const lean = Number(params.lean);
    const irr = Number(params.irregularity);
    const rx = w / 2;
    const ry = h / 2;

    // Four-arc closed path with each control radius nudged, so no two quadrants match.
    const k = 0.5523;
    const q = [1 - irr, 1 + irr * 0.6, 1 - irr * 0.4, 1 + irr];
    const d = [
      `M ${r2(cx)} ${r2(cy - ry * q[0])}`,
      `C ${r2(cx + rx * k * q[1])} ${r2(cy - ry * q[0])} ${r2(cx + rx * q[1])} ${r2(cy - ry * k * q[0])} ${r2(cx + rx * q[1])} ${r2(cy)}`,
      `C ${r2(cx + rx * q[1])} ${r2(cy + ry * k * q[2])} ${r2(cx + rx * k * q[2])} ${r2(cy + ry * q[2])} ${r2(cx)} ${r2(cy + ry * q[2])}`,
      `C ${r2(cx - rx * k * q[3])} ${r2(cy + ry * q[2])} ${r2(cx - rx * q[3])} ${r2(cy + ry * k * q[2])} ${r2(cx - rx * q[3])} ${r2(cy)}`,
      `C ${r2(cx - rx * q[3])} ${r2(cy - ry * k * q[0])} ${r2(cx - rx * k * q[0])} ${r2(cy - ry * q[0])} ${r2(cx)} ${r2(cy - ry * q[0])}`,
      "Z",
    ].join(" ");

    const nodes = [
      {
        tag: "path" as const,
        attrs: {
          d,
          fill: colors.light,
          stroke: colors.ink,
          "stroke-width": 3,
          transform: `rotate(${r2(lean * 30)} ${r2(cx)} ${r2(cy)})`,
        },
      },
    ];

    return {
      nodes,
      anchors: [],
      bounds: { x: cx - rx, y: cy - ry, width: w, height: h },
    };
  },
};
