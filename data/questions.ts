import type { ObservationQuestion } from "@/types";

/**
 * THE ONE QUESTION.
 *
 * One work, one question, one answer. See What? is an observation, not a quiz:
 * a single open question, free text (one word encouraged, not enforced), never
 * scored, categorised, or marked right or wrong. The answer is normalised
 * (trimmed, case-folded) only for grouping — never to correct the person.
 */
export const questions: ObservationQuestion[] = [
  {
    id: "q-see",
    version: "3",
    type: "free-text",
    question: "What do you see?",
    required: true,
    maxLength: 30,
  },
];

export function getQuestion(id: string): ObservationQuestion | undefined {
  return questions.find((q) => q.id === id);
}
