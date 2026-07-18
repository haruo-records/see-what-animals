import { NextResponse } from "next/server";
import { validateWord } from "@/lib/naming/word";
import { isUuid, isValidId } from "@/lib/collection/validation";
import { dbConfigured, dbInsert } from "@/lib/naming/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/words — store one word for an animal. Same validation as the client,
 * re-checked here (never trust the client). One word per session per animal is
 * enforced by a UNIQUE(animal_id, anonymous_session_id) constraint.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const animalId = typeof body.animalId === "string" ? body.animalId.trim() : "";
  const sessionId = typeof body.anonymousSessionId === "string" ? body.anonymousSessionId.trim() : "";
  if (!isValidId(animalId)) return NextResponse.json({ ok: false, error: "invalid_animal" }, { status: 400 });
  if (!isUuid(sessionId)) return NextResponse.json({ ok: false, error: "invalid_session" }, { status: 400 });

  const check = validateWord(body.word);
  if (!check.ok) return NextResponse.json({ ok: false, error: check.reason }, { status: 400 });

  if (!dbConfigured()) return NextResponse.json({ ok: true, stored: false });

  try {
    await dbInsert(
      "observations",
      [{ animal_id: animalId, word: check.word, anonymous_session_id: sessionId }],
      { onConflict: "animal_id,anonymous_session_id", ignoreDuplicates: true },
    );
    return NextResponse.json({ ok: true, stored: true });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("word store failed", error);
    return NextResponse.json({ ok: false, error: "store_failed" }, { status: 200 });
  }
}
