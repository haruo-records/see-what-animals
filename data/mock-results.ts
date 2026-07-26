import type { ObservationResult } from "@/types";

/**
 * MOCK RESULTS — retained only as the read seam for a future backend.
 *
 * "What people saw" now reads live from Supabase (/api/responses/summary), so no
 * mock distributions are shown anywhere. The old choice/percentage distributions
 * were removed with the old UI. result-service still reads through here, so when a
 * real datastore is wired in it replaces this body and the shape is unchanged.
 */
export const mockResults: Record<string, ObservationResult> = {};

export function getMockResult(sessionId: string): ObservationResult | undefined {
  return mockResults[sessionId];
}
