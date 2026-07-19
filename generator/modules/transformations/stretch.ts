import type { TransformationModule } from "../../registry/module-types";

/**
 * Pulls the body along one axis and squeezes it on the other. A body stretched
 * this way reads as reaching or as flattened by something — either way it is no
 * longer the neutral proportion it was designed at.
 */
export const deformStretch: TransformationModule = {
  id: "transformation-stretch-01",
  category: "transformation",
  version: 1,
  label: "stretch",
  enabled: true,
  tags: ["shape", "silhouette", "spacing"],
  parameters: {
    axis: { type: "enum", values: ["vertical", "horizontal", "diagonal"], default: "vertical" },
    amount: { type: "number", min: 1.18, max: 1.85, default: 1.42 },
    thin: { type: "boolean", default: true },
  },
  apply({ cx, cy, params }, spines) {
    const amount = Number(params.amount);
    const axis = String(params.axis);
    // Squeezing the other axis keeps the area roughly constant, so stretching
    // reads as the same creature elongated rather than a bigger one.
    const counter = Boolean(params.thin) ? 1 / Math.sqrt(amount) : 1;
    const rad = axis === "diagonal" ? -Math.PI / 4 : 0;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const sx = axis === "horizontal" ? amount : counter;
    const sy = axis === "horizontal" ? counter : amount;

    return spines.map((s) =>
      s.map((p) => {
        const dx = p.x - cx;
        const dy = p.y - cy;
        // Into the stretch frame, scale, back out.
        const rx = dx * cos + dy * sin;
        const ry = -dx * sin + dy * cos;
        const ax = rx * sx;
        const ay = ry * sy;
        return {
          x: cx + ax * cos - ay * sin,
          y: cy + ax * sin + ay * cos,
          r: p.r * Math.min(sx, sy) * 1.06,
        };
      }),
    );
  },
};
