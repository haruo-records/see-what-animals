import { NextResponse } from "next/server";
import { isValidId } from "@/lib/collection/validation";
import { dbConfigured, dbSelect } from "@/lib/naming/db";
import { normalizeResponse } from "@/lib/response/response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_ROWS = 24;

/**
 * GET /api/responses/summary?animalId=... — "What did people see?".
 *
 * ┌── THE ONE SWAP POINT ─────────────────────────────────────────────────────┐
 * │ Everything that decides how answers are grouped lives in this handler.     │
 * │ Right now it is exact match, case-insensitive (normalizeResponse). To move │
 * │ to semantic clustering (friend / buddy / pal → one group), replace the     │
 * │ block marked below with a call to the clustering service. The stored rows, │
 * │ the save endpoint, and the UI all stay exactly as they are.                │
 * └────────────────────────────────────────────────────────────────────────────┘
 *
 * This is NOT a ranking. It returns "what people saw", ordered by how many said
 * it only so the page reads naturally top-to-bottom — no ranks, bars, or shares.
 */
export async function GET(request: Request) {
  const animalId = new URL(request.url).searchParams.get("animalId") ?? "";
  if (!isValidId(animalId)) {
    return NextResponse.json({ total: 0, responses: [] }, { status: 400 });
  }
  if (!dbConfigured()) return NextResponse.json({ total: 0, responses: [] });

  try {
    const rows = await dbSelect<{ word: string }>(
      `observations?animal_id=eq.${encodeURIComponent(animalId)}&select=word`,
    );

    // ── grouping (exact match, case-insensitive) ────────────────────────────
    // Replace this block with a clustering call to change ONLY the display.
    const buckets = new Map<string, { display: string; count: number }>();
    for (const row of rows) {
      const raw = typeof row.word === "string" ? row.word.trim() : "";
      if (!raw) continue;
      const key = normalizeResponse(raw);
      const existing = buckets.get(key);
      if (existing) existing.count += 1;
      else buckets.set(key, { display: raw, count: 1 });
    }
    // ────────────────────────────────────────────────────────────────────────

    const responses = Array.from(buckets.values())
      .sort((a, b) => b.count - a.count || a.display.localeCompare(b.display))
      .slice(0, MAX_ROWS)
      .map((b) => ({ text: b.display, count: b.count }));

    return NextResponse.json({ total: rows.length, responses });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("responses summary read failed", error);
    return NextResponse.json({ total: 0, responses: [] });
  }
}
