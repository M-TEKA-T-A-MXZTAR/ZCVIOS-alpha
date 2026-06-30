import { NextResponse } from "next/server";
import { buildMonthlyReport } from "@/lib/engine";
import { requireActiveProfile } from "@/lib/session";
import { unauthorized } from "@/lib/http";

export async function GET() {
  const profile = await requireActiveProfile();
  if (!profile) return unauthorized();

  const report = await buildMonthlyReport(profile.id);
  return NextResponse.json(report);
}
