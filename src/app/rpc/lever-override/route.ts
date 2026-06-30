import { NextResponse } from "next/server";
import { z } from "zod";
import { Lever } from "@prisma/client";
import { LEVER_OPTIONS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { requireActiveProfile } from "@/lib/session";
import { startOfWeekMonday } from "@/lib/time";
import { unauthorized } from "@/lib/http";

const schema = z.object({
  selectedLever: z.nativeEnum(Lever),
  reason: z.string().max(240).optional(),
});

export async function POST(req: Request) {
  const profile = await requireActiveProfile();
  if (!profile) return unauthorized();

  try {
    const body = await req.json();
    const input = schema.parse(body);

    if (!LEVER_OPTIONS.includes(input.selectedLever)) {
      return NextResponse.json({ error: "Lever not allowed" }, { status: 400 });
    }

    const weekStart = startOfWeekMonday();
    const strategy = await prisma.weeklyPlan.upsert({
      where: { userId_weekStart: { userId: profile.id, weekStart } },
      update: {
        selectedLever: input.selectedLever,
        manualOverride: true,
        overrideReason: input.reason ?? "Manual override by user",
        reasoningSummary:
          "System evaluation shown. Lever changed manually per operator preference and recorded for weekly traceability.",
      },
      create: {
        userId: profile.id,
        weekStart,
        selectedLever: input.selectedLever,
        reasoningSummary:
          "System evaluation shown. Lever changed manually per operator preference and recorded for weekly traceability.",
        growthStatus: "within_target",
        executionStatus: "moderate",
        driftStatus: "low",
        leverChangeRecommended: false,
        allocationAdjustment: "none",
        manualOverride: true,
        overrideReason: input.reason ?? "Manual override by user",
      },
    });

    return NextResponse.json({
      ok: true,
      selectedLever: strategy.selectedLever,
      overrideRecorded: strategy.manualOverride,
    });
  } catch {
    return NextResponse.json({ error: "Invalid override request" }, { status: 400 });
  }
}
