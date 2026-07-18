export type SessionStatus = "scheduled" | "open" | "closed";

/**
 * The unit of play. Length lives in data (startsAt/closesAt), never in code,
 * so 7 / 14 / 30-day runs are all just data edits.
 */
export type ObservationSession = {
  id: string;
  slug: string;
  observationNumber: string;
  animalId: string;
  title?: string;
  intro?: string;
  /** ISO 8601. */
  startsAt: string;
  closesAt: string;
  resultFrozenAt?: string;
  /** Optional override; if absent it is derived from dates + settings clock. */
  status?: SessionStatus;
  questionIds: string[];
  allowPostCloseResponses: boolean;
  featured: boolean;
};
