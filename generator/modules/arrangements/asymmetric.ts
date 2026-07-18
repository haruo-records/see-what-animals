import type { ArrangementModule, Anchor } from "../../registry/module-types";
import { r2 } from "../shared";

/** Everything gathered on one side, leaving the other side as open space. */
export const arrangementAsymmetric: ArrangementModule = {
  id: "arrangement-asymmetric-01",
  category: "arrangement",
  version: 1,
  label: "asymmetric",
  enabled: true,
  tags: ["spacing", "density", "silhouette"],
  parameters: {
    sweep: { type: "number", min: 0.3, max: 1.3, default: 0.8 },
    bias: { type: "number", min: -3.14, max: 3.14, default: 0.6 },
    radiusScale: { type: "number", min: 0.4, max: 0.62, default: 0.52 },
  },
  place({ params }, body, count) {
    const sweep = Number(params.sweep);
    const bias = Number(params.bias);
    const scale = Number(params.radiusScale);
    const cx = body.bounds.x + body.bounds.width / 2;
    const cy = body.bounds.y + body.bounds.height / 2;
    const rx = body.bounds.width * scale;
    const ry = body.bounds.height * scale;

    const out: Anchor[] = [];
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : i / (count - 1);
      const a = bias + (t - 0.5) * sweep * Math.PI;
      out.push({ x: r2(cx + Math.cos(a) * rx), y: r2(cy + Math.sin(a) * ry), angle: a });
    }
    return out;
  },
};
