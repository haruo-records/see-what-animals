"use client";

import { useId } from "react";
import { getDictionary } from "@/locales";

const dict = getDictionary("en");

/**
 * A short, optional note or name. Quiet field, gentle counter. Used for free-text
 * questions and for the closing observation note. Never required.
 */
export function FreeTextNote({
  label,
  value,
  onChange,
  maxLength = 160,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="flex items-baseline justify-between">
        <span className="text-body text-charcoal">{label}</span>
        <span className="u-label">{dict.observe.optional}</span>
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        maxLength={maxLength}
        placeholder={placeholder}
        rows={2}
        className={
          "mt-3 w-full resize-none rounded-sm border border-stone bg-transparent px-4 py-3 " +
          "text-body-lg text-ink placeholder:text-muted focus:border-charcoal focus:outline-none"
        }
      />
      <div className="mt-1 text-right">
        <span className="text-caption text-muted">
          {value.length} / {maxLength}
        </span>
      </div>
    </div>
  );
}
