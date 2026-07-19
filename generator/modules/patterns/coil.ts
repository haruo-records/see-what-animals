import type { PatternModule } from "../../registry/module-types";
import { r2 } from "../shared";

/**
 * One continuous paper-coloured line winding across the mass — the coiled,
 * wound-up interior of the source drawings. A single line, not a texture: it
 * enters, turns a few times, and stops before the edge, so the mass reads as
 * wrapped or wound rather than decorated.
 */
export const patternCoil: PatternModule = {
  id: "pattern-coil-01",
  category: "pattern",
  version: 1,
  label: "coil",
  enabled: true,
  tags: ["pattern", "continuous", "softness"],
  parameters: {
    turns: { type: "integer", min: 2, max: 4, default: 3 },
    thickness: { type: "number", min: 9, max: 15, default: 12 },
    amplitude: { type: "number", min: 0.2, max: 0.38, default: 0.28 },
  },
  draw({ params, colors }, bounds) {
    const turns = Number(params.turns);
    const th = Number(params.thickness);
    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;
    const horizontalBody = bounds.width >= bounds.height;

    const along = (horizontalBody ? bounds.width : bounds.height) * 0.72;
    const amp = (horizontalBody ? bounds.height : bounds.width) * Number(params.amplitude);
    const step = along / turns;

    // An S-wave built from quadratic halves, alternating sides.
    let d: string;
    if (horizontalBody) {
      let x = cx - along / 2;
      d = `M ${r2(x)} ${r2(cy)}`;
      for (let i = 0; i < turns; i++) {
        const dir = i % 2 === 0 ? -1 : 1;
        d += ` Q ${r2(x + step / 2)} ${r2(cy + amp * dir * 2)} ${r2(x + step)} ${r2(cy)}`;
        x += step;
      }
    } else {
      let y = cy - along / 2;
      d = `M ${r2(cx)} ${r2(y)}`;
      for (let i = 0; i < turns; i++) {
        const dir = i % 2 === 0 ? -1 : 1;
        d += ` Q ${r2(cx + amp * dir * 2)} ${r2(y + step / 2)} ${r2(cx)} ${r2(y + step)}`;
        y += step;
      }
    }

    return [
      {
        tag: "path",
        attrs: {
          d,
          fill: "none",
          stroke: colors.light,
          "stroke-width": r2(th),
          "stroke-linecap": "round",
        },
      },
    ];
  },
};
