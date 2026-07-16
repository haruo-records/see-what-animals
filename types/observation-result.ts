export type ChoiceResult = {
  questionId: string;
  choiceId: string;
  count: number;
  percentage: number;
};

export type SelectedNote = {
  id: string;
  text: string;
  language: "en" | "ja";
};

export type ObservationResult = {
  sessionId: string;
  totalResponses: number;
  /** Responses captured during the initial run (frozen at resultFrozenAt). */
  frozenResponses?: number;
  /** Cumulative responses including any post-close observations. */
  allTimeResponses?: number;
  choiceResults: ChoiceResult[];
  selectedNotes?: SelectedNote[];
  /** Names people chose to give this form. Never de-duplicated into a "correct" name. */
  offeredNames?: string[];
};
