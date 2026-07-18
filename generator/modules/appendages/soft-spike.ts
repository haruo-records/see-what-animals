import type { AppendageModule, SvgNode } from "../../registry/module-types";
import { r2 } from "../shared";

/** A taper with a rounded tip — pointed in outline but blunt where it ends. */
export const appendageSoftSpike: AppendageModule = {
  id: "appendage-soft-spike-01",
  category: "appendage",
  version: 1,
  label: "soft-spike",
  enabled: true,
  tags: ["shape", "softness", "repetition"],
  parameters: {
    length: { type: "number", min: 40, max: 170, default: 92 },
    baseWidth: { type: "number", min: 14, max: 70, default: 34 },
    tipRadius: { type: "number", min: 3, max: 22, default: 9 },
  },
  draw({ params, colors }, at, index) {
    const len = Number(params.length) * (1 - (index % 4) * 0.09);
    const bw = Number(params.baseWidth);
    const tip = Number(params.tipRadius);
    const nx = Math.cos(at.angle);
    const ny = Math.sin(at.angle);
    const px = -ny;
    const py = nx;
    const ex = at.x + nx * (len - tip);
    const ey = at.y + ny * (len - tip);
    const d = [
      `M ${r2(at.x + px * bw / 2)} ${r2(at.y + py * bw / 2)}`,
      `Q ${r2(at.x + nx * len * 0.6 + px * bw * 0.3)} ${r2(at.y + ny * len * 0.6 + py * bw * 0.3)} ${r2(ex)} ${r2(ey)}`,
      `Q ${r2(at.x + nx * len * 0.6 - px * bw * 0.3)} ${r2(at.y + ny * len * 0.6 - py * bw * 0.3)} ${r2(at.x - px * bw / 2)} ${r2(at.y - py * bw / 2)}`,
      "Z",
    ].join(" ");
    const nodes: SvgNode[] = [
      { tag: "path", attrs: { d, fill: colors.light, stroke: colors.ink, "stroke-width": 2.5, "stroke-linejoin": "round" } },
      { tag: "circle", attrs: { cx: r2(ex), cy: r2(ey), r: r2(tip), fill: colors.light, stroke: colors.ink, "stroke-width": 2.5 } },
    ];
    return nodes;
  },
};
