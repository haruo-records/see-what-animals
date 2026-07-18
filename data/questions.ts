import type { ObservationQuestion } from "@/types";

/**
 * Shared question bank. Sessions reference questions by id (questionIds).
 * Questions are never scored. `word` renders as a quiet single-word field.
 *
 * THE THREE QUESTIONS (fixed cognitive sequence):
 *   1. What do you see?      — first perception
 *   2. What stands out?      — what impression remains
 *   3. What do you call it?  — giving it a name
 * (see → what stays with you → naming)
 */
export const questions: ObservationQuestion[] = [
  {
    id: "q-see",
    version: "1",
    type: "single-choice",
    question: "What do you see?",
    required: true,
    choices: [
      { id: "c-bird", label: "Bird" },
      { id: "c-machine", label: "Machine" },
      { id: "c-plant", label: "Plant" },
      { id: "c-other", label: "Something else" },
    ],
  },
  {
    id: "q-stands",
    version: "1",
    type: "single-choice",
    question: "What stands out?",
    required: false,
    choices: [
      { id: "st-shape", label: "Its shape" },
      { id: "st-part", label: "One part of it" },
      { id: "st-surface", label: "Its surface" },
      { id: "st-other", label: "Something else" },
    ],
  },
  {
    id: "q-name",
    version: "1",
    type: "word",
    question: "What do you call it?",
    required: false,
    maxLength: 20,
  },
];

export function getQuestion(id: string): ObservationQuestion | undefined {
  return questions.find((q) => q.id === id);
}
