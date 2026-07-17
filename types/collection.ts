export type DeviceType = "mobile" | "tablet" | "desktop" | "unknown";

/** One stored answer row (matches the observation_responses table). */
export type ObservationResponse = {
  id: string;
  /** The Observation Session this answer belongs to (e.g. "observation-023"). */
  sessionId: string;
  questionId: string;
  answerId: string;
  countryCode: string | null;
  language: string | null;
  deviceType: DeviceType;
  referrer: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  anonymousSessionId: string;
  gameVersion: string;
  questionVersion: string;
  answeredAt: string;
};

/** What the client sends per answer (server derives country/device/time). */
export type IncomingAnswer = {
  questionId: string;
  answerId: string;
  questionVersion: string;
};

export type IncomingObservation = {
  /** The Observation Session id (session.id), so runs never mix. */
  sessionId: string;
  gameVersion: string;
  language: string | null;
  referrer: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  anonymousSessionId: string;
  answers: IncomingAnswer[];
};

/** Aggregation shapes returned by the results API. */
export type CountryCode = string; // ISO 3166-1 alpha-2, or "XX" (unknown)

export type ResultsQuery = {
  sessionId: string;
  questionId: string;
  /** Optional. Absent => global (world). "JP", "US", … or "XX" for unknown. */
  country?: CountryCode;
};

export type AnswerShare = { answerId: string; count: number; percentage: number };
export type CountryResults =
  | { available: true; countryCode: string; total: number; results: AnswerShare[] }
  | { available: false; reason: string; countryCode?: string };

export type ResultsResponse = {
  questionId: string;
  totalResponses: number;
  global: AnswerShare[];
  country: CountryResults;
  topCountries: { countryCode: string; total: number; results: AnswerShare[] }[];
};
