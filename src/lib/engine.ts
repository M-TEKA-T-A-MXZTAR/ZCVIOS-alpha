import { Prisma } from "@prisma/client";
import {
  prismaMissionRepository,
  prismaReportRepository,
} from "@/adapters/prisma/workflow-repositories";
import { createMissionService } from "@/application/mission-service";
import { createReportService } from "@/application/report-service";
import { generateExecutionMission, generateStrategy } from "@/lib/ai";
import {
  calcEhr,
  defaultLeverByHeuristic,
  rollingSlope,
  weeklyHours,
} from "@/lib/metrics";
import { prisma } from "@/lib/prisma";
import { endOfWeekMonday, startOfDay, startOfWeekMonday } from "@/lib/time";

const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

const missionService = createMissionService({
  repository: prismaMissionRepository,
  generator: {
    generate: ({ apiKey, lever, commandMode, context }) =>
      generateExecutionMission(apiKey, lever, commandMode, context),
  },
});

const reportService = createReportService(prismaReportRepository);

type StrategyArgs = {
  userId: string;
  apiKey: string | null;
  weekStart: Date;
  note?: string;
  signals?: {
    trafficSessions?: number | null;
    leadsGenerated?: number | null;
    closedSales?: number | null;
    churnedCustomers?: number | null;
    grossMarginPct?: number | null;
  };
};

export const runStrategyOnWeeklyRevenueSave = async ({ userId, apiKey, weekStart, note, signals }: StrategyArgs) => {
  const recentWeeks = await prisma.weeklyRevenue.findMany({
    where: {
      userId,
      weekStart: {
        gte: new Date(weekStart.getTime() - MILLISECONDS_PER_DAY * 28),
        lte: weekStart,
      },
    },
    orderBy: { weekStart: "asc" },
  });

  const weekLogs = await prisma.workLogSession.findMany({
    where: {
      userId,
      date: {
        gte: weekStart,
        lte: endOfWeekMonday(weekStart),
      },
    },
  });

  const latestRevenue = recentWeeks[recentWeeks.length - 1] ?? null;
  const previousStrategy = await prisma.weeklyPlan.findFirst({
    where: { userId },
    orderBy: { weekStart: "desc" },
  });
  const recentPlans = await prisma.weeklyPlan.findMany({
    where: { userId },
    orderBy: { weekStart: "desc" },
  });

  let weeksOnLever = 0;
  const currentLever = previousStrategy?.selectedLever ?? null;
  if (currentLever) {
    for (const plan of recentPlans) {
      if (plan.selectedLever === currentLever) {
        weeksOnLever += 1;
      } else {
        break;
      }
    }
  }

  const ehrSeries = recentWeeks.map((week) => {
    const weekStartTime = week.weekStart.getTime();
    const weekEndTime = endOfWeekMonday(week.weekStart).getTime();
    const logs = weekLogs.filter((item) => {
      const itemTime = item.date.getTime();
      return itemTime >= weekStartTime && itemTime <= weekEndTime;
    });
    const { leverHours } = weeklyHours(logs);
    return calcEhr(week.revenueCents, leverHours || 1);
  });
  const slope = rollingSlope(ehrSeries.slice(-4));

  const totalLogs = weekLogs.length;
  const completedLogs = weekLogs.filter((log) => log.completed).length;
  const consistency = totalLogs ? completedLogs / totalLogs : 0;
  const hours = weeklyHours(weekLogs);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const heuristicLever = defaultLeverByHeuristic(latestRevenue, weekLogs, previousStrategy?.selectedLever ?? null);

  const strategy = await generateStrategy(apiKey, {
    businessType: user?.businessType ?? "unknown",
    weeklyRevenue: (latestRevenue?.revenueCents ?? 0) / 100,
    slope,
    executionConsistency: consistency,
    driftRatio: hours.driftRatio,
    weeksOnLever,
    previousLever: previousStrategy?.selectedLever ?? heuristicLever,
    trafficSessions: signals?.trafficSessions ?? latestRevenue?.trafficSessions ?? null,
    leadsGenerated: signals?.leadsGenerated ?? latestRevenue?.leadsGenerated ?? null,
    closedSales: signals?.closedSales ?? latestRevenue?.closedSales ?? null,
    churnedCustomers: signals?.churnedCustomers ?? latestRevenue?.churnedCustomers ?? null,
    grossMarginPct: signals?.grossMarginPct ?? latestRevenue?.grossMarginPct ?? null,
    note,
  });

  const adjustment =
    hours.driftRatio > 0.2 && strategy.growthStatus === "below_target"
      ? "tighten_focus"
      : strategy.allocationAdjustment;

  return prisma.weeklyPlan.upsert({
    where: {
      userId_weekStart: { userId, weekStart },
    },
    update: {
      selectedLever: strategy.selectedLever,
      reasoningSummary: strategy.reasoningSummary,
      growthStatus: strategy.growthStatus,
      executionStatus: strategy.executionStatus,
      driftStatus: strategy.driftStatus,
      leverChangeRecommended: strategy.leverChangeRecommended,
      allocationAdjustment: adjustment,
      manualOverride: false,
      overrideReason: null,
    },
    create: {
      userId,
      weekStart,
      selectedLever: strategy.selectedLever,
      reasoningSummary: strategy.reasoningSummary,
      growthStatus: strategy.growthStatus,
      executionStatus: strategy.executionStatus,
      driftStatus: strategy.driftStatus,
      leverChangeRecommended: strategy.leverChangeRecommended,
      allocationAdjustment: adjustment,
    },
  });
};

type MissionArgs = {
  userId: string;
  apiKey: string | null;
  forceRegenerate?: boolean;
};

export const getOrCreateDailyMission = async ({ userId, apiKey, forceRegenerate = false }: MissionArgs) => {
  const today = startOfDay();

  return missionService.getOrCreateDailyMission({
    userId,
    apiKey,
    today,
    weekStart: startOfWeekMonday(today),
    forceRegenerate,
  });
};

export const buildWeeklyReport = async (userId: string) =>
  reportService.buildWeeklyReport({
    userId,
    weekStart: startOfWeekMonday(),
  });

export const buildWeeklyReviewPacket = async (userId: string) => {
  const report = await buildWeeklyReport(userId);
  const weekStart = startOfWeekMonday();

  const missionSnapshot = await prisma.dailyMission.findFirst({
    where: {
      userId,
      date: {
        gte: weekStart,
        lte: endOfWeekMonday(weekStart),
      },
    },
    orderBy: { date: "desc" },
  });

  const overrideHistory = await prisma.weeklyPlan.findMany({
    where: { userId, manualOverride: true },
    orderBy: { weekStart: "desc" },
    take: 12,
    select: {
      weekStart: true,
      selectedLever: true,
      overrideReason: true,
      updatedAt: true,
    },
  });

  return {
    report,
    missionSnapshot: missionSnapshot
      ? {
          date: missionSnapshot.date,
          lever: missionSnapshot.lever,
          primaryTask: missionSnapshot.primaryTask,
          supportTask: missionSnapshot.supportTask,
          doNotDoReminder: missionSnapshot.doNotDoReminder,
          recommendedMinutes: missionSnapshot.recommendedMinutes,
          successDefinition: missionSnapshot.successDefinition,
          source: missionSnapshot.source,
        }
      : null,
    overrideHistory,
  };
};

export const buildMonthlyReport = async (userId: string) =>
  reportService.buildMonthlyReport({
    userId,
    now: startOfDay(),
  });

export const prismaJson = (value: Prisma.JsonValue) => JSON.stringify(value, null, 2);
