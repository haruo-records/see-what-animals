/**
 * ResultService — reads observation results. Currently returns mock data, and
 * blends the viewer's own local answer into the "you saw" line. Replace the body
 * with a datastore read when a backend exists; the shape stays the same.
 */
import { getMockResult } from "@/data/mock-results";
import type { ObservationResult } from "@/types";

export const resultService = {
  getResult(sessionId: string): ObservationResult | undefined {
    return getMockResult(sessionId);
  },

  /** Percentages for one question, sorted high → low, majority first. */
  distributionFor(result: ObservationResult, questionId: string) {
    return result.choiceResults
      .filter((c) => c.questionId === questionId)
      .sort((a, b) => b.percentage - a.percentage);
  },

  /** True when N is small enough that we should say "still forming". */
  isStillForming(result: ObservationResult, threshold = 30): boolean {
    return result.totalResponses < threshold;
  },
};
