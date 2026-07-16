/**
 * LocalObservationRepository
 * The only place that talks to localStorage. Swap this implementation for a
 * backend one (Supabase / Firebase / API / D1 / Vercel Postgres) without
 * touching any component — components go through observation-service.ts, which
 * depends on this ObservationRepository interface.
 */

export type StoredResponse = {
  sessionId: string;
  answers: Record<string, string>; // questionId -> choiceId or free text
  note?: string;
  submittedAt: string;
};

export interface ObservationRepository {
  hasResponded(sessionId: string): boolean;
  getResponse(sessionId: string): StoredResponse | null;
  saveResponse(response: StoredResponse): void;
  clear(sessionId: string): void;
}

const KEY = "see-what:responses:v1";

function readAll(): Record<string, StoredResponse> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, StoredResponse>) : {};
  } catch {
    return {};
  }
}

function writeAll(data: Record<string, StoredResponse>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* storage unavailable (private mode / quota) — fail quietly */
  }
}

export class LocalObservationRepository implements ObservationRepository {
  hasResponded(sessionId: string): boolean {
    return Boolean(readAll()[sessionId]);
  }

  getResponse(sessionId: string): StoredResponse | null {
    return readAll()[sessionId] ?? null;
  }

  saveResponse(response: StoredResponse): void {
    const all = readAll();
    all[response.sessionId] = response;
    writeAll(all);
  }

  clear(sessionId: string): void {
    const all = readAll();
    delete all[sessionId];
    writeAll(all);
  }
}
