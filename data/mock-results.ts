import type { ObservationResult } from "@/types";

/**
 * MOCK RESULTS — placeholder DISTRIBUTIONS for the initial build.
 *
 * `offeredNames` and `selectedNotes` are deliberately absent. Those are words
 * real observers left; inventing them would put fabricated human sentences on a
 * site whose whole subject is how people actually see. The UI shows "No names
 * yet." / "No observations yet." until the datastore returns real ones.
 *
 * These stand in for a future backend (see lib/observation/result-service.ts and
 * README). Percentages are pre-computed to avoid implying more precision than
 * exists. Small-N sessions are shown honestly as "still forming".
 *
 * When a real datastore is connected, result-service.ts reads from it instead
 * and this file can be removed.
 *
 * Questions: q-see (What do you see?), q-stands (What stands out?),
 * q-name (word, not aggregated here).
 */
export const mockResults: Record<string, ObservationResult> = {
  "observation-023": {
    sessionId: "observation-023",
    totalResponses: 7,
    choiceResults: [
      { questionId: "q-see", choiceId: "c-bird", count: 3, percentage: 43 },
      { questionId: "q-see", choiceId: "c-machine", count: 2, percentage: 29 },
      { questionId: "q-see", choiceId: "c-plant", count: 1, percentage: 14 },
      { questionId: "q-see", choiceId: "c-other", count: 1, percentage: 14 },
      { questionId: "q-stands", choiceId: "st-shape", count: 4, percentage: 57 },
      { questionId: "q-stands", choiceId: "st-part", count: 2, percentage: 29 },
      { questionId: "q-stands", choiceId: "st-surface", count: 1, percentage: 14 },
    ],
  },
  "observation-022": {
    sessionId: "observation-022",
    totalResponses: 248,
    frozenResponses: 248,
    allTimeResponses: 1284,
    choiceResults: [
      { questionId: "q-see", choiceId: "c-bird", count: 104, percentage: 42 },
      { questionId: "q-see", choiceId: "c-machine", count: 67, percentage: 27 },
      { questionId: "q-see", choiceId: "c-plant", count: 45, percentage: 18 },
      { questionId: "q-see", choiceId: "c-other", count: 32, percentage: 13 },
      { questionId: "q-stands", choiceId: "st-shape", count: 121, percentage: 49 },
      { questionId: "q-stands", choiceId: "st-part", count: 79, percentage: 32 },
      { questionId: "q-stands", choiceId: "st-surface", count: 30, percentage: 12 },
      { questionId: "q-stands", choiceId: "st-other", count: 18, percentage: 7 },
    ],
  },
  "observation-021": {
    sessionId: "observation-021",
    totalResponses: 218,
    frozenResponses: 218,
    allTimeResponses: 218,
    choiceResults: [
      { questionId: "q-see", choiceId: "c-plant", count: 90, percentage: 41 },
      { questionId: "q-see", choiceId: "c-bird", count: 61, percentage: 28 },
      { questionId: "q-see", choiceId: "c-other", count: 39, percentage: 18 },
      { questionId: "q-see", choiceId: "c-machine", count: 28, percentage: 13 },
      { questionId: "q-stands", choiceId: "st-shape", count: 96, percentage: 44 },
      { questionId: "q-stands", choiceId: "st-part", count: 72, percentage: 33 },
      { questionId: "q-stands", choiceId: "st-surface", count: 50, percentage: 23 },
    ],
  },
  "observation-020": {
    sessionId: "observation-020",
    totalResponses: 156,
    frozenResponses: 156,
    allTimeResponses: 156,
    choiceResults: [
      { questionId: "q-see", choiceId: "c-other", count: 58, percentage: 37 },
      { questionId: "q-see", choiceId: "c-plant", count: 44, percentage: 28 },
      { questionId: "q-see", choiceId: "c-bird", count: 33, percentage: 21 },
      { questionId: "q-see", choiceId: "c-machine", count: 21, percentage: 14 },
    ],
  },
};

export function getMockResult(sessionId: string): ObservationResult | undefined {
  return mockResults[sessionId];
}
