import type { BodyModule, SvgNode } from "../../registry/module-types";
import { r2, slab } from "../shared";

/**
 * A block with an opening through its base — a handle, a gate, a housing for
 * something that is not installed. The opening is drawn in paper colour, so the
 * empty space is literally a component of the drawing.
 */
export const bodyArch: BodyModule = {
  id: "body-arch-01",
  category: "body",
  version: 2,
  label: "arch",
  enabled: true,
  tags: ["shape", "spacing", "silhouette", "rigidity"],
  parameters: {
    width: { type: "number", min: 300, max: 470, default: 380 },
    height: { type: "number", min: 220, max: 360, default: 280 },
    openWidth: { type: "number", min: 0.36, max: 0.6, default: 0.46 },
    openHeight: { type: "number", min: 0.45, max: 0.72, default: 0.58 },
    openShift: { type: "number", min: -0.16, max: 0.16, default: 0.07 },
    lean: { type: "number", min: -8, max: 8, default: -3 },
  },
  draw({ cx, cy, params, colors }) {
    const w = Number(params.width);
    const h = Number(params.height);
    const ow = w * Number(params.openWidth);
    const oh = h * Number(params.openHeight);
    // The opening is off-centre. A centred opening would be a product;
    // an off-centre one is a circumstance.
    const ox = cx + w * Number(params.openShift);
    const lean = Number(params.lean);

    const block = slab(cx, cy, w, h, colors.ink, colors.light, { rx: Math.min(w, h) * 0.24 });
    // The opening: a paper-coloured slab rising from the base edge.
    const opening: SvgNode = {
      tag: "rect",
      attrs: {
        x: r2(ox - ow / 2),
        y: r2(cy + h / 2 - oh),
        width: r2(ow),
        height: r2(oh + 12),
        rx: r2(ow * 0.42),
        fill: colors.light,
      },
    };

    return {
      nodes: [
        {
          tag: "g",
          attrs: { transform: `rotate(${r2(lean)} ${r2(cx)} ${r2(cy)})` },
          children: [block, opening],
        },
      ],
      anchors: [],
      bounds: { x: cx - w / 2, y: cy - h / 2, width: w, height: h },
    };
  },
};
