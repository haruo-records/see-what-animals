import { NextResponse } from "next/server";
import { namingOf } from "@/lib/naming/repo";
import { isValidId } from "@/lib/collection/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("animalId") ?? "";
  if (!isValidId(id)) {
    return NextResponse.json({ name: null, namingStatus: "observing" }, { status: 400 });
  }
  try {
    return NextResponse.json(await namingOf(id));
  } catch {
    return NextResponse.json({ name: null, namingStatus: "observing" });
  }
}
