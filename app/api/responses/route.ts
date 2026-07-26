import { NextResponse } from "next/server";
import { validateResponse } from "@/lib/response/response";
import { isUuid, isValidId } from "@/lib/collection/validation";
import { dbConfigured, dbInsert } from "@/lib/naming/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/responses — store the "What do you see?" answer for a work.
 *
 * The answer is written to the existing `observations` table under the work's
 * real animal_id, exactly as typed (trimmed / whitespace-collapsed), never
 * bucketed — grouping happens at read time in /api/responses/summary, so it can
 * become AI clustering without migrating rows. One row per observer per work via
 * UNIQUE(animal_id, anonymous_session_id).
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const animalId = typeof body.animalId === "string" ? body.animalId.trim() : "";
  const sessionId =
    typeof body.anonymousSessionId === "string" ? body.anonymousSessionId.trim() : "";
  if (!isValidId(animalId)) {
    return NextResponse.json({ ok: false, error: "invalid_animal" }, { status: 400 });
  }
  if (!isUuid(sessionId)) {
    return NextResponse.json({ ok: false, error: "invalid_session" }, { status: 400 });
  }

  const check = validateResponse(body.text);
  if (!check.ok) return NextResponse.json({ ok: false, error: check.reason }, { status: 400 });

  if (!dbConfigured()) return NextResponse.json({ ok: true, stored: false });

  try {
    await dbInsert(
      "observations",
      [{ animal_id: animalId, word: check.text, anonymous_session_id: sessionId }],
      { onConflict: "animal_id,anonymous_session_id", ignoreDuplicates: true },
    );
    return NextResponse.json({ ok: true, stored: true });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("response store failed", error);
    return NextResponse.json({ ok: false, error: "store_failed" }, { status: 500 });
  }
}
