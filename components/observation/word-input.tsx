"use client";

import { MAX_WORD_LENGTH, validateWord, wordHint } from "@/lib/naming/word";

/**
 * A single-word field. No spaces or newlines (stripped live), max 20 chars.
 * Quiet, like the rest of the form: one hairline, a helper line, a counter.
 */
export function WordInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const raw = value ?? "";
  const check = raw.trim() ? validateWord(raw) : null;
  const invalid = check !== null && !check.ok;
  const hint = check && !check.ok ? wordHint(check.reason) : "";

  return (
    <div>
      <p className="text-body text-charcoal">One word only.</p>
      <input
        type="text"
        value={raw}
        onChange={(e) => onChange(e.target.value.replace(/\s+/g, "").slice(0, MAX_WORD_LENGTH))}
        maxLength={MAX_WORD_LENGTH}
        placeholder="One word"
        aria-invalid={invalid ? true : undefined}
        aria-label="What do you call it? One word only."
        className={
          "mt-5 w-full border-b bg-transparent pb-2 text-body-lg text-ink " +
          "placeholder:text-muted focus:outline-none transition-colors " +
          (invalid ? "border-clay focus:border-clay" : "border-stone focus:border-charcoal")
        }
      />
      <div className="mt-3 flex items-center justify-between">
        <span className="text-caption text-muted">{hint || "\u00a0"}</span>
        <span className="text-caption text-muted">
          {raw.length}/{MAX_WORD_LENGTH}
        </span>
      </div>
    </div>
  );
}
