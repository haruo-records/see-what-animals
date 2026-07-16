import type { ObservationQuestion } from "@/types";

/**
 * Shared question bank. Sessions reference questions by id (questionIds).
 * Questions are never scored. free-text questions render as a quiet note field.
 */
export const questions: ObservationQuestion[] = [
  {
    id: "q-see",
    type: "single-choice",
    question: { en: "What do you see?", ja: "何に見えましたか？" },
    required: true,
    choices: [
      { id: "c-bird", label: { en: "Bird", ja: "鳥" } },
      { id: "c-machine", label: { en: "Machine", ja: "機械" } },
      { id: "c-plant", label: { en: "Plant", ja: "植物" } },
      { id: "c-other", label: { en: "Something else", ja: "それ以外" } },
    ],
  },
  {
    id: "q-move",
    type: "single-choice",
    question: { en: "How does it move?", ja: "どのように動いているように見えますか？" },
    required: false,
    choices: [
      { id: "m-drifts", label: { en: "It drifts", ja: "漂っている" } },
      { id: "m-creeps", label: { en: "It creeps", ja: "そろそろ進む" } },
      { id: "m-waits", label: { en: "It waits", ja: "待っている" } },
      { id: "m-other", label: { en: "Some other way", ja: "別の動き" } },
    ],
  },
  {
    id: "q-name",
    type: "free-text",
    question: { en: "What would you call it?", ja: "どんな名前を付けますか？" },
    required: false,
    maxLength: 60,
  },
];

export function getQuestion(id: string): ObservationQuestion | undefined {
  return questions.find((q) => q.id === id);
}
