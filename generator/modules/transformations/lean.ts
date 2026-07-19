import type { TransformationModule, SpineNode } from "../../registry/module-types";

/**
 * Tips the whole body about a low pivot, so it stands off-vertical. Posture,
 * not decoration: everything the body does, it now does at an angle.
 */
export const deformLean: TransformationModule = {
  id: "transformation-lean-01",
  category: "transformation",
  version: 1,
  label: "lean",
  enabled: true,
  tags: ["symmetry", "movement", "silhouette"],
  parameters: {
    angle: { type: "number", min: -0.5, max: 0.5, default: 0.22 },
    pivot: { type: "number", min: 0.55, max: 1, default: 0.85 },
  },
  apply({ cy, params }, spines) {
    const a = Number(params.angle);
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    // Pivot low, so the top swings furthest — the way a standing thing leans.
    let minY = Infinity;
    let maxY = -Infinity;
    let sumX = 0;
    let n = 0;
    for (const s of spines)
      for (const p of s) {
        minY = Math.min(minY, p.y);
        maxY = Math.max(maxY, p.y);
        sumX += p.x;
        n++;
      }
    const px = n ? sumX / n : 0;
    const py = minY + (maxY - minY) * Number(params.pivot);

    return spines.map((s) =>
      s.map((p) => {
        const dx = p.x - px;
        const dy = p.y - py;
        return { x: px + dx * cos - dy * sin, y: py + dx * sin + dy * cos, r: p.r };
      }),
    );
  },
};
