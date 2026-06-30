import type {
  DatedWorkLogRecord,
  WeeklyPlanRecord,
  WeeklyRevenueRecord,
} from "@/core/domain";
import {
  calcEhr,
  momentumStatus,
  projectionRange,
  rollingSlope,
  stageFromEhr,
  stageTarget,
  weeklyHours,
} from "@/core/progress";

const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;
const AVERAGE_DAYS_PER_MONTH = 30.4;

const endOfWeekMonday = (date: Date) => {
  const end = new Date(date);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
};

export interface WeeklyReportInput {
  weekStart: Date;
  revenues: WeeklyRevenueRecord[];
  logs: DatedWorkLogRecord[];
  strategy: WeeklyPlanRecord | null;
  fullLoggingEnabled: boolean;
}

export const calculateWeeklyReport = ({
  weekStart,
  revenues,
  logs,
  strategy,
  fullLoggingEnabled,
}: WeeklyReportInput) => {
  const weekEnd = endOfWeekMonday(weekStart);
  const thisWeekRevenue =
    revenues.find((item) => item.weekStart.getTime() === weekStart.getTime()) ?? null;
  const thisWeekLogs = logs.filter(
    (item) => item.date.getTime() >= weekStart.getTime() && item.date.getTime() <= weekEnd.getTime(),
  );

  const hours = weeklyHours(thisWeekLogs);
  const leverEhr = calcEhr(thisWeekRevenue?.revenueCents ?? 0, hours.leverHours || 1);
  const totalEhr = calcEhr(thisWeekRevenue?.revenueCents ?? 0, hours.totalHours || 1);

  const ehrSeries = revenues.map((week) => {
    const revenueWeekEnd = endOfWeekMonday(week.weekStart);
    const weekLogs = logs.filter(
      (item) =>
        item.date.getTime() >= week.weekStart.getTime() &&
        item.date.getTime() <= revenueWeekEnd.getTime(),
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
    fullLoggingEnabled,
    slope,
    targetRange,
    momentum,
    stage,
    projection,
    lever: strategy?.selectedLever ?? "Distribution",
    bottleneckNote:
      strategy?.reasoningSummary ??
      "Revenue entry saved. Waiting for more execution history.",
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

export interface MonthlyReportInput {
  now: Date;
  createdAt: Date;
  weeks: WeeklyRevenueRecord[];
  logs: DatedWorkLogRecord[];
}

export const calculateMonthlyReport = ({
  now,
  createdAt,
  weeks,
  logs,
}: MonthlyReportInput) => {
  const monthsActive = Math.max(
    1,
    Math.floor(
      (now.getTime() - createdAt.getTime()) /
        (MILLISECONDS_PER_DAY * AVERAGE_DAYS_PER_MONTH),
    ),
  );

  const totalRevenue = weeks.reduce((acc, item) => acc + item.revenueCents, 0) / 100;
  const totalHours = logs.reduce((acc, item) => acc + item.minutes, 0) / 60;
  const averageEhr = totalHours ? Number((totalRevenue / totalHours).toFixed(2)) : 0;

  const trend = weeks.map((week, index) => {
    const weekEnd = endOfWeekMonday(week.weekStart);
    const weekLogs = logs.filter(
      (item) =>
        item.date.getTime() >= week.weekStart.getTime() &&
        item.date.getTime() <= weekEnd.getTime(),
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
    averageEhr,
    slope,
    trend,
    notes: [
      "Track drift logs weekly to keep EHR trend interpretation clean.",
      "Preserve one-lever discipline when slope is below target.",
      "Use pause mode when unavailable to avoid false inactivity signals.",
    ],
  };
};
