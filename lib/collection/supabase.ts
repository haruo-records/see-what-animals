/**
 * Minimal Supabase access over the REST/PostgREST endpoint using fetch — no
 * @supabase/supabase-js dependency. SERVER ONLY: this uses the service role key
 * and must never be imported into a client component.
 *
 * If the env vars are absent, isConfigured() is false and callers no-op, so the
 * app runs (and never shows fake data) until Supabase is set up.
 */
import "server-only";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export function isConfigured(): boolean {
  return Boolean(SUPABASE_URL && SERVICE_ROLE_KEY);
}

function headers(): Record<string, string> {
  return {
    "content-type": "application/json",
    apikey: SERVICE_ROLE_KEY,
    authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  };
}

/** Insert one or more rows. Throws on non-2xx so callers can log. */
export async function insertResponses(rows: Record<string, unknown>[]): Promise<void> {
  if (!isConfigured() || rows.length === 0) return;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/observation_responses`, {
    method: "POST",
    headers: { ...headers(), prefer: "return=minimal" },
    body: JSON.stringify(rows),
    // Avoid caching; this is a write.
    cache: "no-store",
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Supabase insert failed: ${res.status} ${detail.slice(0, 300)}`);
  }
}

/** Call a Postgres function (RPC) and return its JSON result. */
export async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T | null> {
  if (!isConfigured()) return null;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(args),
    cache: "no-store",
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Supabase rpc ${fn} failed: ${res.status} ${detail.slice(0, 300)}`);
  }
  return (await res.json()) as T;
}
