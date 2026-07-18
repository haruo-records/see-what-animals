import { NextResponse } from "next/server";
import { insertResponses, isConfigured } from "@/lib/collection/supabase";
import { deviceTypeFromUserAgent } from "@/lib/collection/device";
import {
  clamp,
  countryForStorage,
  isUuid,
  isValidId,
  parseAnswers,
  sanitizeLanguage,
  sanitizeReferrer,
  sanitizeUtm,
} from "@/lib/collection/validation";
import { LIMITS } from "@/lib/collection/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/observations
 * Saves anonymous answer rows. Country + device + time are derived server-side;
 * raw IP is NEVER read or stored (only Vercel's country header is used).
 */
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const body = (payload ?? {}) as Record<string, unknown>;

  const anonymousSessionId = clamp(body.anonymousSessionId, LIMITS.sessionId);
  const observationSessionId = clamp(body.sessionId, LIMITS.id);
  const gameVersion = clamp(body.gameVersion, LIMITS.version);
  const answers = parseAnswers(body.answers);

  if (!anonymousSessionId || !isUuid(anonymousSessionId)) {
    return NextResponse.json({ ok: false, error: "invalid_session" }, { status: 400 });
  }
  if (!observationSessionId || !isValidId(observationSessionId)) {
    return NextResponse.json({ ok: false, error: "invalid_observation_session" }, { status: 400 });
  }
  if (!gameVersion) {
    return NextResponse.json({ ok: false, error: "invalid_game_version" }, { status: 400 });
  }
  if (answers.length === 0) {
    return NextResponse.json({ ok: false, error: "no_answers" }, { status: 400 });
  }

  // Country is decided on the SERVER only (Vercel's geo header). The raw IP is
  // never read or stored. In dev, an optional DEV_FALLBACK_COUNTRY can stand in
  // when the header is absent (production ignores it).
  let countryHeader = request.headers.get("x-vercel-ip-country");
  if (!countryHeader && process.env.NODE_ENV !== "production") {
    countryHeader = process.env.DEV_FALLBACK_COUNTRY ?? null;
  }
  const countryCode = countryForStorage(countryHeader); // ISO alpha-2 or "XX"
  const deviceType = deviceTypeFromUserAgent(request.headers.get("user-agent"));
  const language = sanitizeLanguage(body.language);
  const referrer = sanitizeReferrer(body.referrer);
  const utmSource = sanitizeUtm(body.utmSource);
  const utmMedium = sanitizeUtm(body.utmMedium);
  const utmCampaign = sanitizeUtm(body.utmCampaign);

  const rows = answers.map((a) => ({
    session_id: observationSessionId,
    question_id: a.questionId,
    answer_id: a.answerId,
    country_code: countryCode,
    language,
    device_type: deviceType,
    referrer,
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign,
    anonymous_session_id: anonymousSessionId,
    game_version: gameVersion,
    question_version: a.questionVersion,
    // answered_at defaults to now() in the database (server time).
  }));

  if (!isConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn("[observations] Supabase not configured — skipping insert", rows.length);
    }
    return NextResponse.json({ ok: true, stored: false, count: rows.length });
  }

  try {
    await insertResponses(rows);
    return NextResponse.json({ ok: true, stored: true, count: rows.length });
  } catch (error) {
    // Do not surface as a hard failure — the experience must not break on save errors.
    // eslint-disable-next-line no-console
    console.error("Failed to store observation", error);
    return NextResponse.json({ ok: false, stored: false, error: "store_failed" }, { status: 200 });
  }
}
