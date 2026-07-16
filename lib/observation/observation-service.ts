/**
 * ObservationService — the API components use. Hides the repository so swapping
 * localStorage for a backend is a one-line change here, not across the UI.
 */
import {
  LocalObservationRepository,
  type ObservationRepository,
  type StoredResponse,
} from "./local-observation-repository";

let repository: ObservationRepository = new LocalObservationRepository();

/** For tests or future backends: inject a different repository once at startup. */
export function setObservationRepository(repo: ObservationRepository): void {
  repository = repo;
}

export const observationService = {
  hasResponded(sessionId: string): boolean {
    return repository.hasResponded(sessionId);
  },
  getResponse(sessionId: string): StoredResponse | null {
    return repository.getResponse(sessionId);
  },
  submit(input: {
    sessionId: string;
    answers: Record<string, string>;
    note?: string;
  }): StoredResponse {
    const response: StoredResponse = {
      sessionId: input.sessionId,
      answers: input.answers,
      note: input.note?.trim() || undefined,
      submittedAt: new Date().toISOString(),
    };
    repository.saveResponse(response);
    return response;
  },
  reset(sessionId: string): void {
    repository.clear(sessionId);
  },
};

export type { StoredResponse };
