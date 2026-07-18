"use client";

import { getAnonymousSessionId } from "@/lib/collection/client";

/** Send one word for the current animal. Never throws into the game flow. */
export async function submitWord(animalId: string, word: string): Promise<void> {
  if (typeof window === "undefined" || !word) return;
  try {
    const res = await fetch("/api/words", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ animalId, word, anonymousSessionId: getAnonymousSessionId() }),
    });
    // eslint-disable-next-line no-console
    if (!res.ok) console.error("[see-what] word save failed", res.status, await res.text().catch(() => ""));
    // eslint-disable-next-line no-console
    else console.info("[see-what] word saved", { animalId, word });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[see-what] word save error", error);
  }
}

export type Naming = { name: string | null; namingStatus: string };

export async function fetchNaming(animalId: string): Promise<Naming | null> {
  try {
    const res = await fetch(`/api/animals/naming?animalId=${encodeURIComponent(animalId)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as Naming;
  } catch {
    return null;
  }
}
