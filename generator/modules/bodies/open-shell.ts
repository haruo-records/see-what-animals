import type { BodyModule } from "../../registry/module-types";
import { grow } from "../../render/skeleton";

/**
 * A thick band curled most of the way round and stopped before closing. The
 * enclosed emptiness is larger than the body itself, so the void is the main
 * structure and the ink is what holds it open.
 *
 * It could close, but it has not.
 */
export const bodyOpenShell: BodyModule = {
  id: "body-open-shell-01",
  category: "body",
  version: 1,
  label: "open-shell",
  enabled: true,
  tags: ["shape", "spacing", "continuous", "silhouette"],
  parameters: {
    radius: { type: "number", min: 210, max: 310, default: 260 },
    sweep: { type: "number", min: 3.9, max: 5.5, default: 4.7 },
    band: { type: "number", min: 58, max: 118, default: 84 },
    taper: { type: "number", min: 0.2, max: 0.72, default: 0.5 },
    start: { type: "number", min: -3.1, max: 3.1, default: 1.3 },
  },
  plan({ cx, cy, params }) {
    const radius = Number(params.radius);
    const sweep = Number(params.sweep);
    const band = Number(params.band);
    const taper = Number(params.taper);
    const start = Number(params.start);
    const steps = 26;

    const spine = grow({
      x: cx + Math.cos(start) * radius,
      y: cy + Math.sin(start) * radius,
      heading: start + Math.PI / 2,
      length: radius * sweep,
      steps,
      turn: sweep / steps,
      // One end of the band is much heavier than the other.
      radiusAt: (t) => band * (1 - taper * t) + 10,
    });

    return {
      spines: [spine],
      voids: [],
      lines: [0.2, 0.5, 0.78],
    };
  },
};
