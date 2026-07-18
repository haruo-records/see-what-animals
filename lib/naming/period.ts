export const OBSERVATION_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

export function closesAt(publishedAtIso: string): Date {
  return new Date(new Date(publishedAtIso).getTime() + OBSERVATION_DAYS * DAY_MS);
}

/** True while within the 7-day window from publishedAt. */
export function isObserving(publishedAtIso: string, now: Date = new Date()): boolean {
  return now.getTime() < closesAt(publishedAtIso).getTime();
}
