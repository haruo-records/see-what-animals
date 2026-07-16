import type { ChoiceResult, ObservationQuestion } from "@/types";

/**
 * Distribution shown with typography and thin area, not a dashboard. Every row
 * carries label + percentage + count in text, so it never depends on colour.
 * The viewer's own choice is marked with a small rule, not a bright fill.
 * Minority answers are always kept.
 */
export function ResultDistribution({
  question,
  results,
  yourChoiceId,
}: {
  question: ObservationQuestion;
  results: ChoiceResult[];
  yourChoiceId?: string;
}) {
  const labelFor = (choiceId: string) =>
    question.choices?.find((c) => c.id === choiceId)?.label.en ?? choiceId;

  const sorted = [...results].sort((a, b) => b.percentage - a.percentage);

  return (
    <div>
      <p className="u-label mb-6">{question.question.en}</p>
      <ul className="flex flex-col gap-5">
        {sorted.map((r) => {
          const mine = r.choiceId === yourChoiceId;
          return (
            <li key={r.choiceId}>
              <div className="flex items-baseline justify-between gap-4">
                <span
                  className={
                    "text-body-lg " + (mine ? "text-ink" : "text-charcoal")
                  }
                >
                  {labelFor(r.choiceId)}
                  {mine ? <span className="ml-3 text-caption text-muted">— you</span> : null}
                </span>
                <span className="tabular-nums text-body text-charcoal">{r.percentage}%</span>
              </div>
              <div className="mt-2 h-px w-full bg-stone" aria-hidden="true">
                <div
                  className={"h-px " + (mine ? "bg-ink" : "bg-charcoal")}
                  style={{ width: `${Math.max(r.percentage, 2)}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
