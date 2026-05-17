import { DailyMission, Lever, MissionSource, Prisma } from "@prisma/client";
import { generateExecutionMission, generateStrategy } from "@/lib/ai";
import { DETERMINISTIC_MISSIONS } from "@/lib/constants";
import {
  calcEhr,
  defaultLeverByHeuristic,
  momentumStatus,
  projectionRange,
  rollingSlope,
  stageFromEhr,
  stageTarget,
  weeklyHours,
} from "@/lib/metrics";
import { prisma } from "@/lib/prisma";
import { endOfWeekMonday, formatISODate, startOfDay, startOfWeekMonday } from "@/lib/time";

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
        gte: new Date(weekStart.getTime() - 1000 * 60 * 60 * 24 * 28),
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

  const ehrSeries = recentWeeks.map((week) => {
    const logs = weekLogs.filter(
      (item) =>
        formatISODate(item.date) >= formatISODate(week.weekStart) &&
        formatISODate(item.date) <= formatISODate(endOfWeekMonday(week.weekStart)),
    );
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
    weeksOnLever: previousStrategy ? 1 : 0,
    previousLever: previousStrategy?.selectedLever ?? heuristicLever,
    trafficSessions: signals?.trafficSessions ?? latestRevenue?.trafficSessions ?? null,
    leadsGenerated: signals?.leadsGenerated ?? latestRevenue?.leadsGenerated ?? null,
    closedSales: signals?.closedSales ?? latestRevenue?.closedSales ?? null,
    churnedCustomers: signals?.churnedCustomers ?? latestRevenue?.churnedCustomers ?? null,
    grossMarginPct: signals?.grossMarginPct ?? latestRevenue?.grossMarginPct ?? null,
    note,
  });

  const adjustment = hours.driftRatio > 0.2 && strategy.growthStatus === "below_target" ? "tighten_focus" : strategy.allocationAdjustment;

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

const toMissionPayload = (mission: DailyMission | null, canUseAi: boolean, weeklyLever: Lever) => {
  if (!mission) {
    return {
      primaryTask: "No mission generated yet.",
      supportTask: "",
      doNotDoReminder: "",
      recommendedMinutes: 30,
      startNowStep: "",
      successDefinition: "",
      source: MissionSource.TEMPLATE,
      lever: weeklyLever,
      canUseAi,
    };
  }

  return {
    primaryTask: mission.primaryTask,
    supportTask: mission.supportTask,
    doNotDoReminder: mission.doNotDoReminder,
    recommendedMinutes: mission.recommendedMinutes,
    startNowStep: mission.startNowStep,
    successDefinition: mission.successDefinition,
    source: mission.source,
    lever: mission.lever,
    canUseAi,
  };
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

  const hasEndedPauseToday =
    Boolean(lastPause) &&
    startOfDay(lastPause!.endDate).getTime() === today.getTime();

  const lastLeverLog = await prisma.workLogSession.findFirst({
    where: {
      userId,
      category: { in: ["LEVER", "ASSET_BUILD"] },
    },
    orderBy: { date: "desc" },
  });
  const rawDaysInactive = lastLeverLog
    ? Math.floor((today.getTime() - startOfDay(lastLeverLog.date).getTime()) / (1000 * 60 * 60 * 24))
    : 999;
  const daysInactive = Math.max(0, rawDaysInactive);

  if (!forceRegenerate) {
    const existing = await prisma.dailyMission.findUnique({
      where: { userId_date: { userId, date: today } },
    });
    if (existing) {
      return {
        mission: toMissionPayload(existing, hasKey, weeklyLever),
        inactivityLevel: daysInactive,
      };
    }
  }

  if (hasEndedPauseToday || daysInactive >= 7) {
    const reset = {
      primaryTask: "Run a 30-minute reset block on the active weekly lever.",
      supportTask: "Log one completed action before ending session.",
      doNotDoReminder: "Do not redesign your weekly plan today.",
      recommendedMinutes: 30,
      startNowStep: "Set a 30-minute timer and begin the smallest lever action.",
      successDefinition: "One lever task completed and logged.",
      source: MissionSource.RESET,
    };

    const mission = await prisma.dailyMission.upsert({
      where: { userId_date: { userId, date: today } },
      update: { ...reset, lever: weeklyLever },
      create: { userId, date: today, lever: weeklyLever, ...reset },
    });

    return {
      mission: toMissionPayload(mission, hasKey, weeklyLever),
      inactivityLevel: daysInactive,
    };
  }

  const aiMission = await generateExecutionMission(
    apiKey,
    weeklyLever,
    user?.commandMode ?? true,
    `Business type: ${user?.businessType ?? "unknown"}. Weekly lever: ${weeklyLever}.`,
  );

  const finalMission = aiMission.source === MissionSource.AI ? aiMission : DETERMINISTIC_MISSIONS[weeklyLever];
  const source = aiMission.source;

  const mission = await prisma.dailyMission.upsert({
    where: { userId_date: { userId, date: today } },
    update: {
      lever: weeklyLever,
      primaryTask: finalMission.primaryTask,
      supportTask: finalMission.supportTask,
      doNotDoReminder: finalMission.doNotDoReminder,
      recommendedMinutes: finalMission.recommendedMinutes,
      startNowStep: finalMission.startNowStep,
      successDefinition: finalMission.successDefinition,
      source,
    },
    create: {
      userId,
      date: today,
      lever: weeklyLever,
      primaryTask: finalMission.primaryTask,
      supportTask: finalMission.supportTask,
      doNotDoReminder: finalMission.doNotDoReminder,
      recommendedMinutes: finalMission.recommendedMinutes,
      startNowStep: finalMission.startNowStep,
      successDefinition: finalMission.successDefinition,
      source,
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

  const thisWeekRevenue = revenues.find((item) => item.weekStart.getTime() === weekStart.getTime()) ?? null;
  const thisWeekLogs = logs.filter(
    (item) => item.date.getTime() >= weekStart.getTime() && item.date.getTime() <= endOfWeekMonday(weekStart).getTime(),
  );

  const hours = weeklyHours(thisWeekLogs);
  const leverEhr = calcEhr(thisWeekRevenue?.revenueCents ?? 0, hours.leverHours || 1);
  const totalEhr = calcEhr(thisWeekRevenue?.revenueCents ?? 0, hours.totalHours || 1);

  const ehrSeries = revenues.map((week) => {
    const weekEnd = endOfWeekMonday(week.weekStart);
    const weekLogs = logs.filter(
      (item) => item.date.getTime() >= week.weekStart.getTime() && item.date.getTime() <= weekEnd.getTime(),
    );
    const weekHours = weeklyHours(weekLogs);
    return calcEhr(week.revenueCents, weekHours.leverHours || 1);
  });

  const slope = rollingSlope(ehrSeries.slice(-4));
  const stage = stageFromEhr(leverEhr);
  const targetRange = stageTarget(stage);
  const momentum = momentumStatus(slope, targetRange);
  const projection = projectionRange(leverEhr, slope);

  return {
    weekStart,
    revenue: Number(((thisWeekRevenue?.revenueCents ?? 0) / 100).toFixed(2)),
    weeklySignals: {
      trafficSessions: thisWeekRevenue?.trafficSessions ?? null,
      leadsGenerated: thisWeekRevenue?.leadsGenerated ?? null,
      closedSales: thisWeekRevenue?.closedSales ?? null,
      churnedCustomers: thisWeekRevenue?.churnedCustomers ?? null,
      grossMarginPct: thisWeekRevenue?.grossMarginPct ?? null,
    },
    leverEhr,
    totalEhr,
    fullLoggingEnabled: user?.fullLoggingEnabled ?? false,
    slope,
    targetRange,
    momentum,
    stage,
    projection,
    lever: strategy?.selectedLever ?? "Distribution",
    bottleneckNote: strategy?.reasoningSummary ?? "Revenue entry saved. Waiting for more execution history.",
    growthStatus: strategy?.growthStatus ?? "within_target",
    driftStatus: strategy?.driftStatus ?? "low",
    executionStatus: strategy?.executionStatus ?? "moderate",
    allocationAdjustment: strategy?.allocationAdjustment ?? "none",
    chartData: revenues.map((item, index) => ({
      week: `W${index + 1}`,
      revenue: Number((item.revenueCents / 100).toFixed(2)),
      ehr: ehrSeries[index] ?? 0,
    })),
  };
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

  const createdAt = user?.createdAt ?? new Date();
  const monthsActive = Math.max(
    1,
    Math.floor((startOfDay().getTime() - startOfDay(createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30.4)),
  );

  const totalRevenue = weeks.reduce((acc, item) => acc + item.revenueCents, 0) / 100;
  const totalHours = logs.reduce((acc, item) => acc + item.minutes, 0) / 60;
  const avgEhr = totalHours ? Number((totalRevenue / totalHours).toFixed(2)) : 0;

  const trend = weeks.map((week, index) => {
    const weekEnd = endOfWeekMonday(week.weekStart);
    const weekLogs = logs.filter(
      (item) => item.date.getTime() >= week.weekStart.getTime() && item.date.getTime() <= weekEnd.getTime(),
    );
    const weekHours = weeklyHours(weekLogs);
    return {
      period: `W${index + 1}`,
      revenue: Number((week.revenueCents / 100).toFixed(2)),
      ehr: calcEhr(week.revenueCents, weekHours.leverHours || 1),
    };
  });

  const slope = rollingSlope(trend.slice(-4).map((item) => item.ehr));

  return {
    monthsActive,
    totalRevenue: Number(totalRevenue.toFixed(2)),
    totalHours: Number(totalHours.toFixed(2)),
    averageEhr: avgEhr,
    slope,
    trend,
    notes: [
      "Track drift logs weekly to keep EHR interpretation clean.",
      "Preserve one-lever discipline when slope is below target.",
      "Use pause mode when unavailable to avoid false inactivity signals.",
    ],
  };
};

export const prismaJson = (value: Prisma.JsonValue) => JSON.stringify(value, null, 2);
