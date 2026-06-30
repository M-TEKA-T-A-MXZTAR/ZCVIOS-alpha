import { NextResponse } from "next/server";
import { buildWeeklyReviewPacket } from "@/lib/engine";
import { requireActiveProfile } from "@/lib/session";
import { unauthorized } from "@/lib/http";

export async function GET() {
  const profile = await requireActiveProfile();
  if (!profile) return unauthorized();

  const packet = await buildWeeklyReviewPacket(profile.id);
  return NextResponse.json(packet);
}
