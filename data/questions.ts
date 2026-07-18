import type { ObservationQuestion } from "@/types";

/**
 * Shared question bank. Sessions reference questions by id (questionIds).
 * Questions are never scored. free-text questions render as a quiet note field.
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
    id: "q-move",
    version: "1",
    type: "single-choice",
    question: "How does it move?",
    required: false,
    choices: [
      { id: "m-drifts", label: "It drifts" },
      { id: "m-creeps", label: "It creeps" },
      { id: "m-waits", label: "It waits" },
      { id: "m-other", label: "Some other way" },
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
