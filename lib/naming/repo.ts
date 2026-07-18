import "server-only";
import { dbSelect, dbPatch, dbConfigured } from "./db";
import { OBSERVATION_DAYS } from "./period";

export type NamingStatus = "observing" | "named";
export type AnimalRow = {
  id: string;
  name: string | null;
  published_at: string;
  naming_status: NamingStatus;
};

const DAY_MS = 24 * 60 * 60 * 1000;

/** Animals whose 7-day window has closed but are not yet named (max 10 / run). */
export async function animalsReadyForNaming(now: Date = new Date()): Promise<AnimalRow[]> {
  const cutoff = new Date(now.getTime() - OBSERVATION_DAYS * DAY_MS).toISOString();
  return dbSelect<AnimalRow>(
    `animals?select=id,name,published_at,naming_status` +
      `&naming_status=eq.observing&published_at=lte.${encodeURIComponent(cutoff)}&limit=10`,
  );
}

export async function wordsFor(animalId: string): Promise<string[]> {
  const rows = await dbSelect<{ word: string }>(
    `observations?select=word&animal_id=eq.${encodeURIComponent(animalId)}&limit=500`,
  );
  return rows.map((r) => r.word);
}

export async function existingNames(): Promise<string[]> {
  const rows = await dbSelect<{ name: string | null }>(`animals?select=name&naming_status=eq.named`);
  return rows.map((r) => r.name).filter((n): n is string => Boolean(n));
}

/**
 * Atomically claim + name an animal. The condition `naming_status=eq.observing`
 * means only the first caller succeeds — prevents double / re-naming. Returns
 * true if THIS call performed the naming.
 */
export async function claimName(animalId: string, name: string): Promise<boolean> {
  const rows = await dbPatch<AnimalRow>(
    `animals?id=eq.${encodeURIComponent(animalId)}&naming_status=eq.observing`,
    { name, naming_status: "named" },
  );
  return rows.length > 0;
}

/** For display: the animal's current name + status (static fallback if no DB). */
export async function namingOf(
  animalId: string,
): Promise<{ name: string | null; namingStatus: NamingStatus }> {
  if (!dbConfigured()) return { name: null, namingStatus: "observing" };
  const rows = await dbSelect<AnimalRow>(
    `animals?select=name,naming_status&id=eq.${encodeURIComponent(animalId)}&limit=1`,
  );
  const r = rows[0];
  return r ? { name: r.name, namingStatus: r.naming_status } : { name: null, namingStatus: "observing" };
}
