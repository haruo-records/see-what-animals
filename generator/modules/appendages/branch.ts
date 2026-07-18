import type { AppendageModule, SvgNode } from "../../registry/module-types";
import { r2 } from "../shared";

/** One stroke that divides once. The division is uneven on purpose. */
export const appendageBranch: AppendageModule = {
  id: "appendage-branch-01",
  category: "appendage",
  version: 1,
  label: "branch",
  enabled: true,
  tags: ["shape", "fragmented", "repetition"],
  parameters: {
    length: { type: "number", min: 60, max: 200, default: 120 },
    splitAt: { type: "number", min: 0.3, max: 0.85, default: 0.55 },
    spread: { type: "number", min: 0.15, max: 0.9, default: 0.42 },
    thickness: { type: "number", min: 2, max: 8, default: 3.5 },
  },
  draw({ params, colors }, at) {
    const len = Number(params.length);
    const split = Number(params.splitAt);
    const spread = Number(params.spread);
    const w = Number(params.thickness);

    const jx = at.x + Math.cos(at.angle) * len * split;
    const jy = at.y + Math.sin(at.angle) * len * split;
    const rest = len * (1 - split);
    const stroke = { fill: "none", stroke: colors.ink, "stroke-width": r2(w), "stroke-linecap": "round" };

    const nodes: SvgNode[] = [
      { tag: "path", attrs: { d: `M ${r2(at.x)} ${r2(at.y)} L ${r2(jx)} ${r2(jy)}`, ...stroke } },
      {
        tag: "path",
        attrs: {
          d: `M ${r2(jx)} ${r2(jy)} L ${r2(jx + Math.cos(at.angle - spread) * rest)} ${r2(jy + Math.sin(at.angle - spread) * rest)}`,
          ...stroke,
        },
      },
      {
        tag: "path",
        attrs: {
          d: `M ${r2(jx)} ${r2(jy)} L ${r2(jx + Math.cos(at.angle + spread * 0.6) * rest * 0.62)} ${r2(jy + Math.sin(at.angle + spread * 0.6) * rest * 0.62)}`,
          ...stroke,
        },
      },
    ];
    return nodes;
  },
};
