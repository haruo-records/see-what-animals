import type { TransformationModule } from "../../registry/module-types";

/** One placement is dropped. What is absent is left legible by the gap. */
export const transformationMissingPart: TransformationModule = {
  id: "transformation-missing-part-01",
  category: "transformation",
  version: 1,
  label: "missing-part",
  enabled: true,
  tags: ["fragmented", "spacing", "repetition"],
  parameters: {
    index: { type: "integer", min: 0, max: 11, default: 2 },
  },
  apply({ params }, anchors) {
    if (anchors.length <= 2) return anchors;
    const i = Number(params.index) % anchors.length;
    return anchors.filter((_, n) => n !== i);
  },
};
