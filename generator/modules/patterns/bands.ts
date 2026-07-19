import type { PatternModule, SvgNode } from "../../registry/module-types";
import { r2 } from "../shared";

/**
 * Segment lines across the mass — but CURVED, bowing the way lines wrap a
 * rounded thing. Dead-straight bands read as a barcode; an arc that bows says
 * the flat black plane has a girth the silhouette is not showing. All arcs bow
 * the same way (one volume, one direction), and one interval is skipped.
 *
 * Orientation follows the mass: a long horizontal body gets upright ribs, a
 * tall one gets ribs lying across it, the way segment lines actually sit on a
 * capsule.
 */
export const patternBands: PatternModule = {
  id: "pattern-bands-01",
  category: "pattern",
  version: 3,
  label: "bands",
  enabled: true,
  tags: ["pattern", "repetition", "softness"],
  parameters: {
    count: { type: "integer", min: 3, max: 8, default: 5 },
    thickness: { type: "number", min: 8, max: 15, default: 11 },
    bow: { type: "number", min: 0.1, max: 0.3, default: 0.18 },
    flip: { type: "boolean", default: false },
    skipIndex: { type: "integer", min: -1, max: 7, default: 2 },
  },
  draw({ params, colors }, bounds) {
    const count = Number(params.count);
    const th = Number(params.thickness);
    const bowRatio = Number(params.bow) * (Boolean(params.flip) ? -1 : 1);
    const skip = Number(params.skipIndex);
    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;
    const horizontalBody = bounds.width >= bounds.height;

    // Along = the axis the ribs are spaced on; across = the axis they span.
    const along = (horizontalBody ? bounds.width : bounds.height) * 0.8;
    const across = (horizontalBody ? bounds.height : bounds.width) * 0.6;
    const pitch = along / (count + 1);
    const bow = across * bowRatio;

    const nodes: SvgNode[] = [];
    for (let i = 0; i < count; i++) {
      if (i === skip) continue;
      const offset = -along / 2 + pitch * (i + 1);
      const d = horizontalBody
        ? `M ${r2(cx + offset)} ${r2(cy - across)} Q ${r2(cx + offset + bow)} ${r2(cy)} ${r2(cx + offset)} ${r2(cy + across)}`
        : `M ${r2(cx - across)} ${r2(cy + offset)} Q ${r2(cx)} ${r2(cy + offset + bow)} ${r2(cx + across)} ${r2(cy + offset)}`;
      nodes.push({
        tag: "path",
        attrs: {
          d,
          fill: "none",
          stroke: colors.light,
          "stroke-width": r2(th),
          "stroke-linecap": "round",
        },
      });
    }
    return nodes;
  },
};
