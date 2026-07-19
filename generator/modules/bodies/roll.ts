import type { BodyModule, SvgNode } from "../../registry/module-types";
import { r2, slab, mass } from "../shared";

/**
 * An upright cylinder with a hollow showing at the top — a sleeve or casing
 * for something absent. It stands; standing appears to be most of what it does.
 */
export const bodyRoll: BodyModule = {
  id: "body-roll-01",
  category: "body",
  version: 2,
  label: "roll",
  enabled: true,
  tags: ["shape", "silhouette", "continuous"],
  parameters: {
    width: { type: "number", min: 190, max: 300, default: 240 },
    height: { type: "number", min: 260, max: 420, default: 330 },
    holeRatio: { type: "number", min: 0.24, max: 0.44, default: 0.33 },
    tilt: { type: "number", min: -11, max: 11, default: 5 },
    collar: { type: "boolean", default: true },
    contour: { type: "boolean", default: false },
  },
  draw({ cx, cy, params, colors }) {
    const w = Number(params.width);
    const h = Number(params.height);
    const holeR = (w / 2) * Number(params.holeRatio) * 2;
    const tilt = Number(params.tilt);

    const body = slab(cx, cy, w, h, colors.ink, colors.light, { rx: w * 0.42, contour: Boolean(params.contour) });
    // The hollow: a paper-coloured circle near the top rim.
    const hole: SvgNode = {
      tag: "circle",
      attrs: { cx: r2(cx), cy: r2(cy - h / 2 + w * 0.34), r: r2(holeR), fill: colors.light },
    };

    const children: SvgNode[] = [body, hole];
    if (Boolean(params.collar)) {
      // A separate short section at the base — the same tube, but interrupted.
      children.push(
        slab(cx, cy + h / 2 - w * 0.19, w * 1.06, w * 0.4, colors.ink, colors.light, {
          rx: w * 0.19,
        }),
      );
    }

    return {
      nodes: [
        {
          tag: "g",
          attrs: { transform: `rotate(${r2(tilt)} ${r2(cx)} ${r2(cy + h / 2)})` },
          children,
        },
      ],
      anchors: [],
      bounds: { x: cx - w / 2, y: cy - h / 2, width: w * 1.1, height: h },
    };
  },
};
