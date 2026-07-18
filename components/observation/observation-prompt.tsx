import type { ObservationQuestion } from "@/types";

/** The question. Set quietly, like a caption asking something. */
export function ObservationPrompt({
  question,
  className = "",
}: {
  question: ObservationQuestion;
  className?: string;
}) {
  return (
    <h2 className={`text-h2 font-normal text-ink ${className}`}>{question.question}</h2>
  );
}
