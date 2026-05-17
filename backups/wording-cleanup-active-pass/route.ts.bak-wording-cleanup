import { NextResponse } from "next/server";
import { decryptApiKey } from "@/lib/crypto";
import { getOrCreateDailyMission } from "@/lib/engine";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { endOfWeekMonday, startOfWeekMonday } from "@/lib/time";
import { unauthorized } from "@/lib/http";

const getMeta = async (userId: string) => {
  const now = new Date();
  const weekStart = startOfWeekMonday(now);
  const day = now.getDay();

  const revenue = await prisma.weeklyRevenue.findUnique({
    where: { userId_weekStart: { userId, weekStart } },
  });

  const pause = await prisma.pauseWindow.findFirst({
    where: {
      userId,
      isActive: true,
      endDate: { gte: now },
    },
  });

  const weeklyRevenueMissing = day >= 3 && !revenue;
  const revenueReminderWindow = (day === 1 || day === 2) && !revenue;
  const revenueReminderMessage =
    day === 1
      ? "Monday revenue check-in is due. Save this week’s revenue to refresh strategy."
      : day === 2
        ? "Tuesday grace window: save weekly revenue today to avoid EHR pause."
        : "";

  return {
    isPaused: Boolean(pause),
    pauseUntil: pause?.endDate ?? null,
    currentWeekRevenue: revenue ? revenue.revenueCents / 100 : null,
    weeklyRevenueMissing,
    revenueReminderWindow,
    revenueReminderMessage,
    weekWindowEnd: endOfWeekMonday(weekStart),
  };
};

export async function GET() {
  const session = await requireSession();
  if (!session) return unauthorized();

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  const apiKey = user?.openAiApiKeyEncrypted ? decryptApiKey(user.openAiApiKeyEncrypted) : null;
  const result = await getOrCreateDailyMission({ userId: session.user.id, apiKey });
  const meta = await getMeta(session.user.id);

  return NextResponse.json({
    ...result,
    ...meta,
  });
}

export async function POST() {
  const session = await requireSession();
  if (!session) return unauthorized();

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  const apiKey = user?.openAiApiKeyEncrypted ? decryptApiKey(user.openAiApiKeyEncrypted) : null;
  const result = await getOrCreateDailyMission({
    userId: session.user.id,
    apiKey,
    forceRegenerate: true,
  });

  return NextResponse.json(result);
}
