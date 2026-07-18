import type { BodyModule, SvgNode } from "../../registry/module-types";
import { r2 } from "../shared";

/**
 * Several masses read as one form because of proximity alone. Nothing connects
 * them. Whether this is one thing or a few things sitting together is left open
 * — the gaps are doing as much work as the shapes.
 */
export const bodyCluster: BodyModule = {
  id: "body-cluster-01",
  category: "body",
  version: 1,
  label: "cluster",
  enabled: true,
  tags: ["shape", "fragmented", "spacing", "density"],
  parameters: {
    count: { type: "integer", min: 3, max: 7, default: 5 },
    spread: { type: "number", min: 120, max: 300, default: 200 },
    unitSize: { type: "number", min: 70, max: 190, default: 130 },
    sizeFalloff: { type: "number", min: 0, max: 0.6, default: 0.32 },
  },
  draw({ cx, cy, params, colors }) {
    const count = Number(params.count);
    const spread = Number(params.spread);
    const unit = Number(params.unitSize);
    const falloff = Number(params.sizeFalloff);

    const nodes: SvgNode[] = [];
    // Phyllotaxis placement: even without randomness it never looks like a grid
    // or a ring, and adding one more unit does not rearrange the others.
    const golden = Math.PI * (3 - Math.sqrt(5));
    let minX = cx;
    let maxX = cx;
    let minY = cy;
    let maxY = cy;

    for (let i = 0; i < count; i++) {
      const rad = spread * Math.sqrt(i / count);
      const a = i * golden;
      const x = cx + Math.cos(a) * rad;
      const y = cy + Math.sin(a) * rad;
      const size = unit * (1 - falloff * (i / count));
      nodes.push({
        tag: "ellipse",
        attrs: {
          cx: r2(x),
          cy: r2(y),
          rx: r2(size / 2),
          ry: r2((size / 2) * 0.86),
          fill: i % 3 === 0 ? colors.mid : colors.light,
          stroke: colors.ink,
          "stroke-width": 3,
        },
      });
      minX = Math.min(minX, x - size / 2);
      maxX = Math.max(maxX, x + size / 2);
      minY = Math.min(minY, y - size / 2);
      maxY = Math.max(maxY, y + size / 2);
    }

    return {
      nodes,
      anchors: [],
      bounds: { x: minX, y: minY, width: maxX - minX, height: maxY - minY },
    };
  },
};
