"use client";

import { MAX_RESPONSE_LENGTH, validateResponse, responseHint } from "@/lib/response/response";

/**
 * The single free-text field. One word, a few words, or a short phrase — no
 * one-word rule, no suggestions, no "right" answer. Quiet, like the rest of the
 * page: one hairline, a soft helper line, a counter.
 */
export function ResponseInput({
  value,
  onChange,
  onEnter,
  ariaLabel = "What do you see?",
}: {
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  ariaLabel?: string;
}) {
  const raw = value ?? "";
  const check = raw.trim() ? validateResponse(raw) : null;
  const invalid = check !== null && !check.ok;
  const hint = check && !check.ok ? responseHint(check.reason) : "";

  return (
    <div>
      <input
        type="text"
        value={raw}
        onChange={(e) => onChange(e.target.value.slice(0, MAX_RESPONSE_LENGTH))}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onEnter && !invalid && raw.trim()) onEnter();
        }}
        maxLength={MAX_RESPONSE_LENGTH}
        placeholder="Type one or more words..."
        aria-invalid={invalid ? true : undefined}
        aria-label={ariaLabel}
        className={
          "w-full border-b bg-transparent pb-2 text-body-lg text-ink " +
          "placeholder:text-muted focus:outline-none transition-colors " +
          (invalid ? "border-clay focus:border-clay" : "border-stone focus:border-charcoal")
        }
      />
      <div className="mt-3 flex items-center justify-between">
        <span className="text-caption text-muted">{hint || "\u00a0"}</span>
        <span className="text-caption text-muted">
          {raw.length}/{MAX_RESPONSE_LENGTH}
        </span>
      </div>
    </div>
  );
}
