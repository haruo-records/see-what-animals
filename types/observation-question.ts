export type LocalizedText = {
  en: string;
  ja: string;
};

export type ObservationQuestionType =
  | "single-choice"
  | "multiple-choice"
  | "free-text"
  | "scale";

export type ObservationChoice = {
  id: string;
  label: LocalizedText;
};

export type ObservationQuestion = {
  id: string;
  type: ObservationQuestionType;
  question: LocalizedText;
  choices?: ObservationChoice[];
  required: boolean;
  maxLength?: number;
};
