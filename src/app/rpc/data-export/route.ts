import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveProfile } from "@/lib/session";
import { unauthorized } from "@/lib/http";

export async function GET() {
  const profile = await requireActiveProfile();
  if (!profile) return unauthorized();

  const [user, weeklyRevenues, strategies, logs, missions, pauses] = await Promise.all([
    prisma.user.findUnique({
      where: { id: profile.id },
      select: {
        email: true,
        name: true,
        businessUrl: true,
        socialLinks: true,
        businessDescription: true,
        businessType: true,
        hoursAvailablePerWeek: true,
        weeklyRevenueBaselineCents: true,
        targetMonthlyIncomeCents: true,
        targetMaxHoursPerWeek: true,
        consistencyWindowMonths: true,
        fullLoggingEnabled: true,
        commandMode: true,
        createdAt: true,
      },
    }),
    prisma.weeklyRevenue.findMany({ where: { userId: profile.id }, orderBy: { weekStart: "asc" } }),
    prisma.weeklyPlan.findMany({ where: { userId: profile.id }, orderBy: { weekStart: "asc" } }),
    prisma.workLogSession.findMany({ where: { userId: profile.id }, orderBy: { date: "asc" } }),
    prisma.dailyMission.findMany({ where: { userId: profile.id }, orderBy: { date: "asc" } }),
    prisma.pauseWindow.findMany({ where: { userId: profile.id }, orderBy: { startDate: "asc" } }),
  ]);

  return NextResponse.json({
    policy: "We do not sell your data.",
    exportedAt: new Date().toISOString(),
    data: {
      user,
      weeklyRevenues,
      strategies,
      logs,
      missions,
      pauses,
    },
  });
}
