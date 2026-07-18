import type { BodyModule } from "../../registry/module-types";
import { r2 } from "../shared";

/**
 * A band of constant width following a curve. It has no interior in the way the
 * oval does — the enclosed space is a hole rather than a mass, which changes
 * what counts as "inside" for the pattern modules.
 */
export const bodyRibbon: BodyModule = {
  id: "body-ribbon-01",
  category: "body",
  version: 1,
  label: "ribbon",
  enabled: true,
  tags: ["shape", "continuous", "softness", "layer"],
  parameters: {
    width: { type: "number", min: 320, max: 680, default: 560 },
    thickness: { type: "number", min: 40, max: 170, default: 96 },
    curvature: { type: "number", min: 0.15, max: 0.95, default: 0.62 },
    turns: { type: "integer", min: 1, max: 3, default: 2 },
  },
  draw({ cx, cy, params, colors }) {
    const w = Number(params.width);
    const t = Number(params.thickness);
    const curve = Number(params.curvature);
    const turns = Number(params.turns);

    const half = w / 2;
    const amp = curve * 150;
    const step = w / (turns + 1);

    let d = `M ${r2(cx - half)} ${r2(cy)}`;
    for (let i = 0; i < turns + 1; i++) {
      const dir = i % 2 === 0 ? -1 : 1;
      const x0 = cx - half + step * i;
      const x1 = x0 + step;
      d += ` C ${r2(x0 + step * 0.4)} ${r2(cy + amp * dir)} ${r2(x1 - step * 0.4)} ${r2(cy + amp * dir)} ${r2(x1)} ${r2(cy)}`;
    }

    return {
      nodes: [
        {
          tag: "path",
          attrs: {
            d,
            fill: "none",
            stroke: colors.ink,
            "stroke-width": r2(t),
            "stroke-linecap": "round",
          },
        },
        {
          tag: "path",
          attrs: {
            d,
            fill: "none",
            stroke: colors.light,
            "stroke-width": r2(t * 0.42),
            "stroke-linecap": "round",
          },
        },
      ],
      anchors: [],
      bounds: { x: cx - half, y: cy - amp - t / 2, width: w, height: amp * 2 + t },
    };
  },
};
