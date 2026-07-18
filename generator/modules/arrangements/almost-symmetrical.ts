import type { ArrangementModule, Anchor } from "../../registry/module-types";
import { r2 } from "../shared";

/**
 * Mirrored placement in which one pair does not quite mirror. Full symmetry
 * settles immediately and stops being looked at; a break in one place keeps the
 * eye going back to check.
 */
export const arrangementAlmostSymmetrical: ArrangementModule = {
  id: "arrangement-almost-symmetrical-01",
  category: "arrangement",
  version: 1,
  label: "almost-symmetrical",
  enabled: true,
  tags: ["symmetry", "repetition", "shape"],
  parameters: {
    spread: { type: "number", min: 0.25, max: 1.1, default: 0.62 },
    breakIndex: { type: "integer", min: 0, max: 5, default: 1 },
    breakAmount: { type: "number", min: 0.06, max: 0.42, default: 0.2 },
    radiusScale: { type: "number", min: 0.4, max: 0.6, default: 0.5 },
  },
  place({ params }, body, count) {
    const spread = Number(params.spread);
    const breakAt = Number(params.breakIndex);
    const amount = Number(params.breakAmount);
    const scale = Number(params.radiusScale);
    const cx = body.bounds.x + body.bounds.width / 2;
    const cy = body.bounds.y + body.bounds.height / 2;
    const rx = body.bounds.width * scale;
    const ry = body.bounds.height * scale;

    const pairs = Math.ceil(count / 2);
    const out: Anchor[] = [];
    for (let i = 0; i < pairs && out.length < count; i++) {
      const t = pairs === 1 ? 0 : i / (pairs - 1);
      const base = -Math.PI / 2 + (0.25 + t * spread) * Math.PI;
      const skew = i === breakAt ? amount : 0;

      out.push({ x: r2(cx + Math.cos(base) * rx), y: r2(cy + Math.sin(base) * ry), angle: base });
      if (out.length < count) {
        // The mirror of `base` about the vertical axis, plus the one skew.
        const m = Math.PI - base + skew;
        out.push({ x: r2(cx + Math.cos(m) * rx), y: r2(cy + Math.sin(m) * ry), angle: m });
      }
    }
    return out;
  },
};
