import { Prisma } from "@prisma/client";
import {
  decideMissionAction,
  RESET_MISSION,
  selectGeneratedMission,
  toMissionPayload,
} from "@/core/missions";
import { calculateMonthlyReport, calculateWeeklyReport } from "@/core/reports";
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

  const upserted = await prisma.weeklyPlan.upsert({
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

  return upserted;
};

type MissionArgs = {
  userId: string;
  apiKey: string | null;
  forceRegenerate?: boolean;
};

export const getOrCreateDailyMission = async ({ userId, apiKey, forceRegenerate = false }: MissionArgs) => {
  const today = startOfDay();
  const weekStart = startOfWeekMonday(today);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const strategy = await prisma.weeklyPlan.findUnique({
    where: { userId_weekStart: { userId, weekStart } },
  });
  const weeklyLever = strategy?.selectedLever ?? "Distribution";
  const hasKey = Boolean(apiKey);

  const lastPause = await prisma.pauseWindow.findFirst({
    where: { userId },
    orderBy: { endDate: "desc" },
  });

  const hasEndedPauseToday = Boolean(
    lastPause && startOfDay(lastPause.endDate).getTime() === today.getTime(),
  );

  const lastLeverLog = await prisma.workLogSession.findFirst({
    where: {
      userId,
      category: { in: ["LEVER", "ASSET_BUILD"] },
    },
    orderBy: { date: "desc" },
  });
  const rawDaysInactive = lastLeverLog
    ? Math.floor((today.getTime() - startOfDay(lastLeverLog.date).getTime()) / MILLISECONDS_PER_DAY)
    : 999;
  const daysInactive = Math.max(0, rawDaysInactive);

  const existingMission = forceRegenerate
    ? null
    : await prisma.dailyMission.findUnique({
        where: { userId_date: { userId, date: today } },
      });

  const action = decideMissionAction({
    forceRegenerate,
    hasExistingMission: Boolean(existingMission),
    hasEndedPauseToday,
    daysInactive,
  });

  if (action === "existing" && existingMission) {
    return {
      mission: toMissionPayload(existingMission, hasKey, weeklyLever),
      inactivityLevel: daysInactive,
    };
  }

  if (action === "reset") {
    const mission = await prisma.dailyMission.upsert({
      where: { userId_date: { userId, date: today } },
      update: { ...RESET_MISSION, lever: weeklyLever },
      create: { userId, date: today, lever: weeklyLever, ...RESET_MISSION },
    });

    return {
      mission: toMissionPayload(mission, hasKey, weeklyLever),
      inactivityLevel: daysInactive,
    };
  }

  const generatedMission = await generateExecutionMission(
    apiKey,
    weeklyLever,
    user?.commandMode ?? true,
    `Business type: ${user?.businessType ?? "unknown"}. Weekly lever: ${weeklyLever}.`,
  );
  const finalMission = selectGeneratedMission(weeklyLever, generatedMission);

  const mission = await prisma.dailyMission.upsert({
    where: { userId_date: { userId, date: today } },
    update: {
      lever: finalMission.lever,
      primaryTask: finalMission.primaryTask,
      supportTask: finalMission.supportTask,
      doNotDoReminder: finalMission.doNotDoReminder,
      recommendedMinutes: finalMission.recommendedMinutes,
      startNowStep: finalMission.startNowStep,
      successDefinition: finalMission.successDefinition,
      source: finalMission.source,
    },
    create: {
      userId,
      date: today,
      lever: finalMission.lever,
      primaryTask: finalMission.primaryTask,
      supportTask: finalMission.supportTask,
      doNotDoReminder: finalMission.doNotDoReminder,
      recommendedMinutes: finalMission.recommendedMinutes,
      startNowStep: finalMission.startNowStep,
      successDefinition: finalMission.successDefinition,
      source: finalMission.source,
    },
  });

  return {
    mission: toMissionPayload(mission, hasKey, weeklyLever),
    inactivityLevel: daysInactive,
  };
};

export const buildWeeklyReport = async (userId: string) => {
  const weekStart = startOfWeekMonday();
  const historyStart = new Date(weekStart);
  historyStart.setDate(historyStart.getDate() - 21);

  const [revenues, logs, strategy, user] = await Promise.all([
    prisma.weeklyRevenue.findMany({
      where: {
        userId,
        weekStart: {
          gte: historyStart,
          lte: weekStart,
        },
      },
      orderBy: { weekStart: "asc" },
    }),
    prisma.workLogSession.findMany({
      where: {
        userId,
        date: {
          gte: historyStart,
          lte: endOfWeekMonday(weekStart),
        },
      },
      orderBy: { date: "asc" },
    }),
    prisma.weeklyPlan.findUnique({
      where: { userId_weekStart: { userId, weekStart } },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { fullLoggingEnabled: true } }),
  ]);

  return calculateWeeklyReport({
    weekStart,
    revenues,
    logs,
    strategy,
    fullLoggingEnabled: user?.fullLoggingEnabled ?? false,
  });
};

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

export const buildMonthlyReport = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const weeks = await prisma.weeklyRevenue.findMany({
    where: { userId },
    orderBy: { weekStart: "asc" },
  });

  const logs = await prisma.workLogSession.findMany({
    where: { userId },
    orderBy: { date: "asc" },
  });

  return calculateMonthlyReport({
    now: startOfDay(),
    createdAt: startOfDay(user?.createdAt ?? new Date()),
    weeks,
    logs,
  });
};

export const prismaJson = (value: Prisma.JsonValue) => JSON.stringify(value, null, 2);
