import type { BodyModule, SvgNode } from "../../registry/module-types";
import { r2 } from "../shared";

/**
 * Repeated units along a line, with one unit deliberately unlike the rest. The
 * repetition sets an expectation and the single exception is where attention
 * tends to land — which is exactly what the second question asks about.
 */
export const bodySegmented: BodyModule = {
  id: "body-segmented-01",
  category: "body",
  version: 1,
  label: "segmented",
  enabled: true,
  tags: ["repetition", "rigidity", "shape", "fragmented"],
  parameters: {
    segments: { type: "integer", min: 4, max: 11, default: 7 },
    segmentSize: { type: "number", min: 44, max: 110, default: 74 },
    gap: { type: "number", min: 2, max: 46, default: 16 },
    arc: { type: "number", min: 0, max: 0.9, default: 0.35 },
    oddOneIndex: { type: "integer", min: -1, max: 10, default: 3 },
  },
  draw({ cx, cy, params, colors }) {
    const n = Number(params.segments);
    const size = Number(params.segmentSize);
    const gap = Number(params.gap);
    const arc = Number(params.arc);
    const odd = Number(params.oddOneIndex);

    const pitch = size + gap;
    const span = pitch * (n - 1);
    const nodes: SvgNode[] = [];
    let minY = cy;
    let maxY = cy;

    for (let i = 0; i < n; i++) {
      const t = i / Math.max(1, n - 1);
      const x = cx - span / 2 + pitch * i;
      const y = cy - Math.sin(t * Math.PI) * arc * 130;
      const isOdd = i === odd;
      const s = isOdd ? size * 0.56 : size;

      nodes.push({
        tag: "rect",
        attrs: {
          x: r2(x - s / 2),
          y: r2(y - s / 2),
          width: r2(s),
          height: r2(s),
          rx: r2(isOdd ? s * 0.5 : s * 0.22),
          fill: isOdd ? colors.mid : colors.light,
          stroke: colors.ink,
          "stroke-width": 3,
        },
      });
      minY = Math.min(minY, y - s / 2);
      maxY = Math.max(maxY, y + s / 2);
    }

    return {
      nodes,
      anchors: [],
      bounds: { x: cx - span / 2 - size / 2, y: minY, width: span + size, height: maxY - minY },
    };
  },
};
