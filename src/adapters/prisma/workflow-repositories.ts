import type {
  MissionRecord,
  WeeklyPlanRecord,
} from "@/core/domain";
import type {
  MissionRepository,
  ReportRepository,
} from "@/application/ports";
import { prisma } from "@/lib/prisma";

const toMissionRecord = (mission: {
  lever: MissionRecord["lever"];
  primaryTask: string;
  supportTask: string | null;
  doNotDoReminder: string;
  recommendedMinutes: number;
  startNowStep: string;
  successDefinition: string;
  source: MissionRecord["source"];
}): MissionRecord => ({
  lever: mission.lever,
  primaryTask: mission.primaryTask,
  supportTask: mission.supportTask,
  doNotDoReminder: mission.doNotDoReminder,
  recommendedMinutes: mission.recommendedMinutes,
  startNowStep: mission.startNowStep,
  successDefinition: mission.successDefinition,
  source: mission.source,
});

export const prismaMissionRepository: MissionRepository = {
  getMissionContext: async ({
    userId,
    today,
    weekStart,
    includeExistingMission,
  }) => {
    const [user, strategy, lastPause, lastLeverLog, existingMission] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { businessType: true, commandMode: true },
      }),
      prisma.weeklyPlan.findUnique({
        where: { userId_weekStart: { userId, weekStart } },
        select: { selectedLever: true },
      }),
      prisma.pauseWindow.findFirst({
        where: { userId },
        orderBy: { endDate: "desc" },
        select: { endDate: true },
      }),
      prisma.workLogSession.findFirst({
        where: {
          userId,
          category: { in: ["LEVER", "ASSET_BUILD"] },
        },
        orderBy: { date: "desc" },
        select: { date: true },
      }),
      includeExistingMission
        ? prisma.dailyMission.findUnique({
            where: { userId_date: { userId, date: today } },
            select: {
              lever: true,
              primaryTask: true,
              supportTask: true,
              doNotDoReminder: true,
              recommendedMinutes: true,
              startNowStep: true,
              successDefinition: true,
              source: true,
            },
          })
        : Promise.resolve(null),
    ]);

    return {
      businessType: user?.businessType ?? "unknown",
      commandMode: user?.commandMode ?? true,
      weeklyLever: strategy?.selectedLever ?? "Distribution",
      lastPauseEnd: lastPause?.endDate ?? null,
      lastLeverLogDate: lastLeverLog?.date ?? null,
      existingMission: existingMission ? toMissionRecord(existingMission) : null,
    };
  },

  saveMission: async ({ userId, date, mission }) => {
    const saved = await prisma.dailyMission.upsert({
      where: { userId_date: { userId, date } },
      update: {
        lever: mission.lever,
        primaryTask: mission.primaryTask,
        supportTask: mission.supportTask,
        doNotDoReminder: mission.doNotDoReminder,
        recommendedMinutes: mission.recommendedMinutes,
        startNowStep: mission.startNowStep,
        successDefinition: mission.successDefinition,
        source: mission.source,
      },
      create: {
        userId,
        date,
        lever: mission.lever,
        primaryTask: mission.primaryTask,
        supportTask: mission.supportTask,
        doNotDoReminder: mission.doNotDoReminder,
        recommendedMinutes: mission.recommendedMinutes,
        startNowStep: mission.startNowStep,
        successDefinition: mission.successDefinition,
        source: mission.source,
      },
      select: {
        lever: true,
        primaryTask: true,
        supportTask: true,
        doNotDoReminder: true,
        recommendedMinutes: true,
        startNowStep: true,
        successDefinition: true,
        source: true,
      },
    });

    return toMissionRecord(saved);
  },
};

export const prismaReportRepository: ReportRepository = {
  getWeeklyReportSnapshot: async ({
    userId,
    historyStart,
    weekStart,
    weekEnd,
  }) => {
    const [revenues, logs, strategy, user] = await Promise.all([
      prisma.weeklyRevenue.findMany({
        where: {
          userId,
          weekStart: { gte: historyStart, lte: weekStart },
        },
        orderBy: { weekStart: "asc" },
        select: {
          weekStart: true,
          revenueCents: true,
          trafficSessions: true,
          leadsGenerated: true,
          closedSales: true,
          churnedCustomers: true,
          grossMarginPct: true,
        },
      }),
      prisma.workLogSession.findMany({
        where: {
          userId,
          date: { gte: historyStart, lte: weekEnd },
        },
        orderBy: { date: "asc" },
        select: { date: true, minutes: true, category: true },
      }),
      prisma.weeklyPlan.findUnique({
        where: { userId_weekStart: { userId, weekStart } },
        select: {
          selectedLever: true,
          reasoningSummary: true,
          growthStatus: true,
          executionStatus: true,
          driftStatus: true,
          allocationAdjustment: true,
        },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { fullLoggingEnabled: true },
      }),
    ]);

    return {
      revenues,
      logs,
      strategy: strategy as WeeklyPlanRecord | null,
      fullLoggingEnabled: user?.fullLoggingEnabled ?? false,
    };
  },

  getMonthlyReportSnapshot: async (userId) => {
    const [user, weeks, logs] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { createdAt: true },
      }),
      prisma.weeklyRevenue.findMany({
        where: { userId },
        orderBy: { weekStart: "asc" },
        select: {
          weekStart: true,
          revenueCents: true,
          trafficSessions: true,
          leadsGenerated: true,
          closedSales: true,
          churnedCustomers: true,
          grossMarginPct: true,
        },
      }),
      prisma.workLogSession.findMany({
        where: { userId },
        orderBy: { date: "asc" },
        select: { date: true, minutes: true, category: true },
      }),
    ]);

    return {
      createdAt: user?.createdAt ?? new Date(),
      weeks,
      logs,
    };
  },
};
