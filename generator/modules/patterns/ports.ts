import type { PatternModule, SvgNode } from "../../registry/module-types";
import { r2 } from "../shared";

/**
 * A few paper-coloured openings in the mass — sockets, vents, the places where
 * other parts would attach if there were other parts. Never many: three or
 * four, unevenly sized, one of them slightly out of line.
 */
export const patternPorts: PatternModule = {
  id: "pattern-ports-01",
  category: "pattern",
  version: 2,
  label: "ports",
  enabled: true,
  tags: ["pattern", "spacing", "fragmented"],
  parameters: {
    count: { type: "integer", min: 2, max: 5, default: 3 },
    radius: { type: "number", min: 12, max: 30, default: 20 },
    spreadDeg: { type: "number", min: -14, max: 14, default: 6 },
  },
  draw({ params, colors }, bounds) {
    const count = Number(params.count);
    const baseR = Number(params.radius);
    const tiltRad = (Number(params.spreadDeg) * Math.PI) / 180;
    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;
    const span = Math.min(bounds.width, bounds.height) * 0.5;
    const pitch = span / Math.max(1, count - 1);

    const nodes: SvgNode[] = [];
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0 : i - (count - 1) / 2;
      // One port sags below the line the others keep to.
      const sag = i === Math.floor(count / 2) ? baseR * 0.7 : 0;
      const r = baseR * (1 - Math.abs(t) * 0.16);
      nodes.push({
        tag: "circle",
        attrs: {
          cx: r2(cx + Math.cos(tiltRad) * pitch * t),
          cy: r2(cy + Math.sin(tiltRad) * pitch * t + sag),
          r: r2(r),
          fill: colors.light,
        },
      });
    }
    return nodes;
  },
};
