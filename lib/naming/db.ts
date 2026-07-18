import "server-only";

const URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export function dbConfigured(): boolean {
  return Boolean(URL && KEY);
}

function headers(extra: Record<string, string> = {}): Record<string, string> {
  return { "content-type": "application/json", apikey: KEY, authorization: `Bearer ${KEY}`, ...extra };
}

export async function dbSelect<T>(pathAndQuery: string): Promise<T[]> {
  if (!dbConfigured()) return [];
  const res = await fetch(`${URL}/rest/v1/${pathAndQuery}`, { headers: headers(), cache: "no-store" });
  if (!res.ok) throw new Error(`select ${res.status} ${await res.text().catch(() => "")}`);
  return (await res.json()) as T[];
}

export async function dbInsert<T>(
  table: string,
  rows: Record<string, unknown>[],
  opts: { onConflict?: string; ignoreDuplicates?: boolean } = {},
): Promise<T[]> {
  if (!dbConfigured() || rows.length === 0) return [];
  const path = opts.onConflict ? `${table}?on_conflict=${opts.onConflict}` : table;
  const prefer = opts.ignoreDuplicates
    ? "resolution=ignore-duplicates,return=minimal"
    : "return=minimal";
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    method: "POST",
    headers: headers({ prefer }),
    body: JSON.stringify(rows),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`insert ${res.status} ${await res.text().catch(() => "")}`);
  return [];
}

/** PATCH with return=representation so callers can detect how many rows changed. */
export async function dbPatch<T>(pathAndQuery: string, body: Record<string, unknown>): Promise<T[]> {
  if (!dbConfigured()) return [];
  const res = await fetch(`${URL}/rest/v1/${pathAndQuery}`, {
    method: "PATCH",
    headers: headers({ prefer: "return=representation" }),
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`patch ${res.status} ${await res.text().catch(() => "")}`);
  return (await res.json()) as T[];
}
