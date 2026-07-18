export type ObservationQuestionType =
  | "single-choice"
  | "multiple-choice"
  | "free-text"
  | "word"
  | "scale";

export type ObservationChoice = {
  id: string;
  label: string;
};

export type ObservationQuestion = {
  id: string;
  type: ObservationQuestionType;
  question: string;
  choices?: ObservationChoice[];
  required: boolean;
  maxLength?: number;
  /** Bump when the image, choices, or wording change materially (analytics). */
  version?: string;
};
