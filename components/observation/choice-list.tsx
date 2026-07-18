"use client";

import type { ObservationQuestion } from "@/types";

/**
 * Choices as a quiet list — a small mark, a word, a hairline beneath. No boxes,
 * no colour flood, no bounce: it should read like lines in a field note, not a
 * form. Looks like a list; each row is still a real button with a ≥ 44px target
 * and aria-checked mirrored for assistive tech.
 */
export function ChoiceList({
  question,
  value,
  onChange,
}: {
  question: ObservationQuestion;
  value: string | undefined;
  onChange: (choiceId: string) => void;
}) {
  if (!question.choices) return null;

  return (
    <div role="radiogroup" aria-label={question.question} className="flex flex-col">
      {question.choices.map((choice) => {
        const selected = value === choice.id;
        return (
          <button
            key={choice.id}
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(choice.id)}
            className={
              "group flex min-h-[56px] w-full items-center gap-4 border-b border-stone " +
              "py-4 text-left text-body-lg transition-colors duration-micro ease-quiet " +
              (selected ? "text-ink" : "text-charcoal hover:text-ink")
            }
          >
            <span
              aria-hidden="true"
              className={
                "relative h-[9px] w-[9px] shrink-0 rounded-full border transition-colors " +
                (selected ? "border-ink" : "border-stone group-hover:border-charcoal")
              }
            >
              {selected ? <span className="absolute inset-[1.5px] rounded-full bg-ink" /> : null}
            </span>
            <span className="flex-1">{choice.label}</span>
          </button>
        );
      })}
    </div>
  );
}
