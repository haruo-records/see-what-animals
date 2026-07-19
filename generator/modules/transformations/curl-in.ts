import type { TransformationModule } from "../../registry/module-types";

/**
 * Bends the body progressively along its length, so it curls toward itself.
 * The far end ends up pointing back at the near end: something folding up, or
 * caught mid-way through doing so.
 */
export const deformCurlIn: TransformationModule = {
  id: "transformation-curl-in-01",
  category: "transformation",
  version: 1,
  label: "curl-in",
  enabled: true,
  tags: ["continuous", "movement", "shape"],
  parameters: {
    amount: { type: "number", min: 0.35, max: 1.5, default: 0.85 },
    from: { type: "number", min: 0, max: 0.5, default: 0.2 },
  },
  apply({ params }, spines) {
    const amount = Number(params.amount);
    const from = Number(params.from);

    return spines.map((s) => {
      if (s.length < 3) return s;
      const out = [s[0]];
      // Re-walk the spine, adding a little more turn at every step past `from`.
      let heading = Math.atan2(s[1].y - s[0].y, s[1].x - s[0].x);
      for (let i = 1; i < s.length; i++) {
        const t = i / (s.length - 1);
        const step = Math.hypot(s[i].x - s[i - 1].x, s[i].y - s[i - 1].y);
        const extra = t > from ? (amount * (t - from)) / (s.length * 0.5) : 0;
        heading += Math.atan2(s[i].y - s[i - 1].y, s[i].x - s[i - 1].x) - heading + extra;
        const prev = out[i - 1];
        out.push({ x: prev.x + Math.cos(heading) * step, y: prev.y + Math.sin(heading) * step, r: s[i].r });
      }
      return out;
    });
  },
};
