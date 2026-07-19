import type { BodyModule, SvgNode } from "../../registry/module-types";
import { r2, slab, mass } from "../shared";

/**
 * A horizontal capsule with a smaller end-piece that does not quite match it.
 * The end-piece is the "stray part" — it looks like it should couple to
 * something, but whatever it coupled to is not here.
 */
export const bodyPod: BodyModule = {
  id: "body-pod-01",
  category: "body",
  version: 2,
  label: "pod",
  enabled: true,
  tags: ["shape", "silhouette", "softness"],
  parameters: {
    width: { type: "number", min: 300, max: 520, default: 420 },
    height: { type: "number", min: 150, max: 250, default: 190 },
    capRatio: { type: "number", min: 0.16, max: 0.34, default: 0.24 },
    capDrop: { type: "number", min: -0.22, max: 0.22, default: 0.06 },
    lean: { type: "number", min: -9, max: 9, default: 3 },
    nub: { type: "boolean", default: true },
    contour: { type: "boolean", default: false },
  },
  draw({ cx, cy, params, colors }) {
    const w = Number(params.width);
    const h = Number(params.height);
    const capW = w * Number(params.capRatio);
    const capH = h * 0.64;
    // The cap sits a little off the body's axis — coupled, but not aligned.
    const capCy = cy + h * Number(params.capDrop);
    const capCx = cx + w / 2 + capW * 0.28;
    const lean = Number(params.lean);

    const nodes: SvgNode[] = [
      slab(cx, cy, w, h, colors.ink, colors.light, { contour: Boolean(params.contour) }),
      slab(capCx, capCy, capW, capH, colors.ink, colors.light, { rx: capH * 0.42 }),
    ];
    if (Boolean(params.nub)) {
      nodes.push(
        mass(
          { cx: r2(capCx + capW / 2 + 14), cy: r2(capCy), r: 11 },
          "circle",
          colors.ink,
          colors.light,
        ),
      );
    }

    const group: SvgNode = {
      tag: "g",
      attrs: { transform: `rotate(${r2(lean)} ${r2(cx)} ${r2(cy)})` },
      children: nodes,
    };

    const totalW = w + capW * 0.8 + 30;
    return {
      nodes: [group],
      anchors: [],
      bounds: { x: cx - w / 2, y: cy - h / 2, width: totalW, height: h },
    };
  },
};
