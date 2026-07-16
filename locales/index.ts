import { en, type Dictionary } from "./en";
import { ja } from "./ja";
import type { Locale } from "@/data/site-settings";

const dictionaries: Record<Locale, Dictionary> = { en, ja };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? en;
}

export type { Dictionary };
