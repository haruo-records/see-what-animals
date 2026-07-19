import type { ArrangementModule } from "../../registry/module-types";
import { anchorsOnEllipse } from "../shared";

/** Even distribution around the form's bounds. */
export const arrangementRadial: ArrangementModule = {
  id: "arrangement-radial-01",
  category: "arrangement",
  version: 1,
  label: "radial",
  enabled: true,
  // Rare on purpose: a full radial burst reads as an emblem, not a being.
  weight: 1,
  tags: ["symmetry", "repetition", "shape"],
  parameters: {
    startAngle: { type: "number", min: -3.14, max: 3.14, default: -1.57 },
    radiusScale: { type: "number", min: 0.42, max: 0.62, default: 0.5 },
  },
  place({ params }, body, count) {
    const scale = Number(params.radiusScale);
    return anchorsOnEllipse(
      body.bounds.x + body.bounds.width / 2,
      body.bounds.y + body.bounds.height / 2,
      body.bounds.width * scale,
      body.bounds.height * scale,
      count,
      Number(params.startAngle),
    );
  },
};
