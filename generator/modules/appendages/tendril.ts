import type { AppendageModule, SvgNode } from "../../registry/module-types";
import { grow, spineOutline } from "../../render/skeleton";

/**
 * A long taper leaving the body and curling as it thins to a point. It is
 * continuous with the mass it comes from — the body narrowing until it runs
 * out, rather than a wire attached to it.
 */
export const growthTendril: AppendageModule = {
  id: "appendage-tendril-01",
  category: "appendage",
  version: 1,
  label: "tendril",
  enabled: true,
  tags: ["shape", "continuous", "fragmented"],
  parameters: {
    length: { type: "number", min: 1.6, max: 4.2, default: 2.6 },
    curl: { type: "number", min: 0.02, max: 0.16, default: 0.08 },
    lean: { type: "number", min: -1.1, max: 1.1, default: 0.5 },
  },
  grow({ params, colors }, at, hostRadius, index) {
    const len = hostRadius * Number(params.length) * (index % 2 === 0 ? 1 : 0.68);
    const curl = Number(params.curl) * (index % 2 === 0 ? 1 : -1);
    const heading = at.angle + Math.PI / 2 + Number(params.lean) * (index % 2 === 0 ? 1 : -1);

    const spine = grow({
      x: at.x - Math.cos(heading) * hostRadius * 0.5,
      y: at.y - Math.sin(heading) * hostRadius * 0.5,
      heading,
      length: len,
      steps: 12,
      turn: curl,
      // Begins as thick as its host and runs out to nothing.
      radiusAt: (t) => hostRadius * 0.85 * Math.pow(1 - t, 1.5) + 4,
    });

    const nodes: SvgNode[] = [{ tag: "path", attrs: { d: spineOutline(spine), fill: colors.ink } }];
    return nodes;
  },
};
