import { NextResponse } from "next/server";
import { isConfigured, rpc } from "@/lib/collection/supabase";
import { clamp, parseCountryParam } from "@/lib/collection/validation";
import { LIMITS, MIN_COUNTRY_SAMPLE_SIZE } from "@/lib/collection/config";
import type { ResultsResponse } from "@/types/collection";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function emptyResults(questionId: string, reason: string): ResultsResponse {
  return {
    questionId,
    totalResponses: 0,
    global: [],
    country: { available: false, reason },
    topCountries: [],
  };
}

/**
 * GET /api/observations/results?questionId=...
 * Real aggregates from the database. Country breakdowns below the sample
 * threshold are withheld (privacy + statistical stability). Never returns
 * dummy data: with no backend or no rows, counts are simply empty.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = clamp(url.searchParams.get("sessionId"), LIMITS.id);
  const questionId = clamp(url.searchParams.get("questionId"), LIMITS.id);
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId_required" }, { status: 400 });
  }
  if (!questionId) {
    return NextResponse.json({ error: "questionId_required" }, { status: 400 });
  }

  // Optional country filter. Absent => global (world). Invalid => 400.
  // The value is validated server-side (never trusted raw).
  const country = parseCountryParam(url.searchParams.get("country"));
  if (country === "invalid") {
    return NextResponse.json({ error: "invalid_country" }, { status: 400 });
  }

  if (!isConfigured()) {
    return NextResponse.json(emptyResults(questionId, "not_configured"));
  }

  try {
    const data = await rpc<ResultsResponse>("get_observation_results", {
      p_session_id: sessionId,
      p_question_id: questionId,
      p_country: country, // null => global; "JP"/"XX" => that bucket
      p_min_sample: MIN_COUNTRY_SAMPLE_SIZE,
    });
    return NextResponse.json(data ?? emptyResults(questionId, "no_data"));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to read results", error);
    return NextResponse.json(emptyResults(questionId, "read_failed"), { status: 200 });
  }
}
