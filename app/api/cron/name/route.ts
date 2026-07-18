import { NextResponse } from "next/server";
import { dbConfigured } from "@/lib/naming/db";
import { animalsReadyForNaming, claimName, existingNames, wordsFor } from "@/lib/naming/repo";
import { buildNamingPrompt } from "@/lib/naming/prompt";
import { generateName } from "@/lib/naming/provider";
import { isBlockedName, parseTwoWordName, pickFallbackName } from "@/lib/naming/name";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_ATTEMPTS = 3;

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  // In production a secret is required; Vercel Cron sends "Authorization: Bearer <CRON_SECRET>".
  if (!secret) return process.env.NODE_ENV !== "production";
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!dbConfigured()) {
    return NextResponse.json({ ok: false, error: "db_not_configured" });
  }

  const named: string[] = [];
  const skipped: string[] = [];

  let animals;
  try {
    animals = await animalsReadyForNaming();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("cron read failed", error);
    return NextResponse.json({ ok: false, error: "read_failed" }, { status: 200 });
  }

  const namesList = await existingNames();
  const usedLower = new Set(namesList.map((n) => n.toLowerCase()));

  for (const animal of animals) {
    try {
      const words = await wordsFor(animal.id);

      let chosen: string | null = null;
      for (let attempt = 0; attempt < MAX_ATTEMPTS && !chosen; attempt++) {
        const prompt = buildNamingPrompt(words, namesList);
        let raw = "";
        try {
          raw = await generateName(prompt);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error("naming model call failed", error);
          continue; // safe retry
        }
        const candidate = parseTwoWordName(raw);
        if (candidate && !usedLower.has(candidate.toLowerCase()) && !isBlockedName(candidate)) {
          chosen = candidate;
        }
      }
      if (!chosen) chosen = pickFallbackName(usedLower); // safe fallback (incl. 0 words)

      // Atomic claim prevents double / re-naming.
      const didName = await claimName(animal.id, chosen);
      if (didName) {
        usedLower.add(chosen.toLowerCase());
        namesList.push(chosen);
        named.push(`${animal.id}:${chosen}`);
      } else {
        skipped.push(animal.id); // already named by a concurrent run
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("naming failed for", animal.id, error);
      skipped.push(animal.id);
    }
  }

  return NextResponse.json({ ok: true, named, skipped });
}
