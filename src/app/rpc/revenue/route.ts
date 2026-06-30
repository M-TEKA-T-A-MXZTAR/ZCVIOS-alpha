import { NextResponse } from "next/server";
import { z } from "zod";
import { decryptApiKey } from "@/lib/crypto";
import { runStrategyOnWeeklyRevenueSave } from "@/lib/engine";
import { prisma } from "@/lib/prisma";
import { requireActiveProfile } from "@/lib/session";
import { startOfWeekMonday } from "@/lib/time";
import { unauthorized } from "@/lib/http";

const schema = z.object({
  revenue: z.number().min(0).max(10_000_000),
  note: z.string().max(240).optional(),
  trafficSessions: z.number().min(0).max(100000).optional(),
  leadsGenerated: z.number().min(0).max(100000).optional(),
  closedSales: z.number().min(0).max(100000).optional(),
  churnedCustomers: z.number().min(0).max(100000).optional(),
  grossMarginPct: z.number().min(0).max(100).optional(),
  weekStart: z.string().date().optional(),
});

export async function GET() {
  const profile = await requireActiveProfile();
  if (!profile) return unauthorized();

  const weekStart = startOfWeekMonday();

  const [current, recent, strategy] = await Promise.all([
    prisma.weeklyRevenue.findUnique({
      where: { userId_weekStart: { userId: profile.id, weekStart } },
    }),
    prisma.weeklyRevenue.findMany({
      where: { userId: profile.id },
      orderBy: { weekStart: "desc" },
      take: 8,
    }),
    prisma.weeklyPlan.findUnique({
      where: { userId_weekStart: { userId: profile.id, weekStart } },
    }),
  ]);

  return NextResponse.json({
    weekStart,
    currentRevenue: current ? current.revenueCents / 100 : null,
    currentSignals: {
      trafficSessions: current?.trafficSessions ?? null,
      leadsGenerated: current?.leadsGenerated ?? null,
      closedSales: current?.closedSales ?? null,
      churnedCustomers: current?.churnedCustomers ?? null,
      grossMarginPct: current?.grossMarginPct ?? null,
    },
    currentLever: strategy?.selectedLever ?? "Distribution",
    recent: recent.map((item) => ({
      weekStart: item.weekStart,
      revenue: item.revenueCents / 100,
      trafficSessions: item.trafficSessions,
      leadsGenerated: item.leadsGenerated,
      closedSales: item.closedSales,
      churnedCustomers: item.churnedCustomers,
      grossMarginPct: item.grossMarginPct,
      strategyTriggered: item.strategyTriggered,
    })),
  });
}

export async function POST(req: Request) {
  const profile = await requireActiveProfile();
  if (!profile) return unauthorized();

  try {
    const body = await req.json();
    const input = schema.parse(body);
    const weekStart = input.weekStart ? startOfWeekMonday(new Date(input.weekStart)) : startOfWeekMonday();

    const revenue = await prisma.weeklyRevenue.upsert({
      where: { userId_weekStart: { userId: profile.id, weekStart } },
      update: {
        revenueCents: Math.round(input.revenue * 100),
        note: input.note,
        trafficSessions: input.trafficSessions ?? null,
        leadsGenerated: input.leadsGenerated ?? null,
        closedSales: input.closedSales ?? null,
        churnedCustomers: input.churnedCustomers ?? null,
        grossMarginPct: input.grossMarginPct ?? null,
        strategyTriggered: true,
      },
      create: {
        userId: profile.id,
        weekStart,
        revenueCents: Math.round(input.revenue * 100),
        note: input.note,
        trafficSessions: input.trafficSessions ?? null,
        leadsGenerated: input.leadsGenerated ?? null,
        closedSales: input.closedSales ?? null,
        churnedCustomers: input.churnedCustomers ?? null,
        grossMarginPct: input.grossMarginPct ?? null,
        strategyTriggered: true,
      },
    });

    const user = await prisma.user.findUnique({ where: { id: profile.id } });
    const apiKey = user?.openAiApiKeyEncrypted ? decryptApiKey(user.openAiApiKeyEncrypted) : null;

    const strategy = await runStrategyOnWeeklyRevenueSave({
      userId: profile.id,
      apiKey,
      weekStart,
      note: input.note,
      signals: {
        trafficSessions: input.trafficSessions ?? null,
        leadsGenerated: input.leadsGenerated ?? null,
        closedSales: input.closedSales ?? null,
        churnedCustomers: input.churnedCustomers ?? null,
        grossMarginPct: input.grossMarginPct ?? null,
      },
    });

    return NextResponse.json({
      ok: true,
      revenue: revenue.revenueCents / 100,
      strategy: {
        selectedLever: strategy.selectedLever,
        reasoningSummary: strategy.reasoningSummary,
      },
      signals: {
        trafficSessions: revenue.trafficSessions,
        leadsGenerated: revenue.leadsGenerated,
        closedSales: revenue.closedSales,
        churnedCustomers: revenue.churnedCustomers,
        grossMarginPct: revenue.grossMarginPct,
      },
    });
  } catch {
    return NextResponse.json({ error: "Invalid revenue entry" }, { status: 400 });
  }
}
