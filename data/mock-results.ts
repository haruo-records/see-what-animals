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
  // Demo distributions for past observations (020–022) were removed with their
  // sessions so the Archive opens empty. Add a session in observation-sessions.ts
  // and its distribution here (keyed by session id) to bring an entry back.
};

export function getMockResult(sessionId: string): ObservationResult | undefined {
  return mockResults[sessionId];
}
