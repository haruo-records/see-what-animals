import type { BodyModule } from "../../registry/module-types";
import { grow } from "../../render/skeleton";

/**
 * A heavy body hanging beneath a thin arch that reaches over and down to it.
 * The arch is barely thick enough for what it is carrying, which is the point:
 * the tension between the two is the form.
 */
export const bodySuspendedMass: BodyModule = {
  id: "body-suspended-mass-01",
  category: "body",
  version: 1,
  label: "suspended-mass",
  enabled: true,
  tags: ["shape", "density", "layer", "silhouette"],
  parameters: {
    span: { type: "number", min: 380, max: 560, default: 470 },
    archWidth: { type: "number", min: 16, max: 40, default: 26 },
    dropLength: { type: "number", min: 200, max: 360, default: 280 },
    massSize: { type: "number", min: 110, max: 185, default: 145 },
    offset: { type: "number", min: -0.34, max: 0.34, default: 0.2 },
  },
  plan({ cx, cy, params }) {
    const span = Number(params.span);
    const aw = Number(params.archWidth);
    const drop = Number(params.dropLength);
    const size = Number(params.massSize);
    // The load does not hang from the middle of the arch.
    const offset = Number(params.offset);

    const arch = grow({
      x: cx - span / 2,
      y: cy - drop * 0.3,
      heading: -Math.PI / 2.6,
      length: span * 1.35,
      steps: 20,
      turn: (Math.PI * 1.05) / 20,
      radiusAt: (t) => aw * (1 + 0.5 * Math.sin(t * Math.PI)),
    });

    const hangIndex = Math.round((0.5 + offset) * (arch.length - 1));
    const from = arch[Math.max(0, Math.min(arch.length - 1, hangIndex))];

    const drape = grow({
      x: from.x,
      y: from.y,
      heading: Math.PI / 2,
      length: drop,
      steps: 12,
      turn: 0.012,
      // A thread that swells into the load it carries.
      radiusAt: (t) => aw * 0.7 + (size - aw * 0.7) * Math.pow(t, 3),
    });

    return {
      spines: [arch, drape],
      voids: [],
      lines: [0.3, 0.62],
    };
  },
};
