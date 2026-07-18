import { en, type Dictionary } from "./en";

/**
 * English-only. getDictionary keeps its signature so existing callers
 * (getDictionary("en")) are unchanged, but there is only one dictionary.
 */
export function getDictionary(_locale?: string): Dictionary {
  return en;
}

export type { Dictionary };
