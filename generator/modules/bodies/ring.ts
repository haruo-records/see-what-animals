import type { BodyModule } from "../../registry/module-types";
import { r2 } from "../shared";

/**
 * A closed band with an open centre. The hole is the largest single area in the
 * composition, which makes empty space a component rather than a leftover.
 */
export const bodyRing: BodyModule = {
  id: "body-ring-01",
  category: "body",
  version: 1,
  label: "ring",
  enabled: true,
  tags: ["shape", "continuous", "spacing", "silhouette"],
  parameters: {
    outerRadius: { type: "number", min: 150, max: 320, default: 240 },
    bandWidth: { type: "number", min: 24, max: 130, default: 64 },
    squash: { type: "number", min: 0.62, max: 1, default: 0.86 },
    openGap: { type: "number", min: 0, max: 0.34, default: 0.12 },
  },
  draw({ cx, cy, params, colors }) {
    const outer = Number(params.outerRadius);
    const band = Number(params.bandWidth);
    const squash = Number(params.squash);
    const gap = Number(params.openGap);

    const rx = outer - band / 2;
    const ry = (outer - band / 2) * squash;

    if (gap < 0.02) {
      return {
        nodes: [
          {
            tag: "ellipse",
            attrs: {
              cx: r2(cx),
              cy: r2(cy),
              rx: r2(rx),
              ry: r2(ry),
              fill: "none",
              stroke: colors.ink,
              "stroke-width": r2(band),
            },
          },
        ],
        anchors: [],
        bounds: { x: cx - outer, y: cy - outer * squash, width: outer * 2, height: outer * 2 * squash },
      };
    }

    // An arc stopping short of closure: continuous, but not quite a circuit.
    const a0 = -Math.PI / 2 + gap * Math.PI;
    const a1 = -Math.PI / 2 + Math.PI * 2 - gap * Math.PI;
    const p0 = { x: cx + Math.cos(a0) * rx, y: cy + Math.sin(a0) * ry };
    const p1 = { x: cx + Math.cos(a1) * rx, y: cy + Math.sin(a1) * ry };
    const d = `M ${r2(p0.x)} ${r2(p0.y)} A ${r2(rx)} ${r2(ry)} 0 1 1 ${r2(p1.x)} ${r2(p1.y)}`;

    return {
      nodes: [
        {
          tag: "path",
          attrs: {
            d,
            fill: "none",
            stroke: colors.ink,
            "stroke-width": r2(band),
            "stroke-linecap": "round",
          },
        },
      ],
      anchors: [],
      bounds: { x: cx - outer, y: cy - outer * squash, width: outer * 2, height: outer * 2 * squash },
    };
  },
};
