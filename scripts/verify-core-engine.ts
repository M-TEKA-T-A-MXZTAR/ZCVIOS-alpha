import assert from "node:assert/strict";
import type {
  DatedWorkLogRecord,
  StrategyInput,
  WeeklyRevenueRecord,
  WorkLogRecord,
} from "../src/core/domain";
import {
  DETERMINISTIC_MISSIONS,
  decideMissionAction,
  RESET_MISSION,
  selectGeneratedMission,
  toMissionPayload,
} from "../src/core/missions";
import {
  calcEhr,
  defaultLeverByHeuristic,
  momentumStatus,
  projectionRange,
  rollingSlope,
  stageFromEhr,
  stageTarget,
  toHours,
  weeklyHours,
} from "../src/core/progress";
import { calculateMonthlyReport, calculateWeeklyReport } from "../src/core/reports";
import { selectWeeklyLeverDeterministically } from "../src/core/strategy";

const baseStrategyInput = (overrides: Partial<StrategyInput> = {}): StrategyInput => ({
  businessType: "digital",
  weeklyRevenue: 1000,
  slope: 4,
  executionConsistency: 0.8,
  driftRatio: 0.05,
  weeksOnLever: 1,
  previousLever: null,
  trafficSessions: 100,
  leadsGenerated: 10,
  closedSales: 4,
  churnedCustomers: 0,
  grossMarginPct: 60,
  ...overrides,
});

assert.equal(toHours(90), 1.5);
assert.equal(calcEhr(30000, 2), 150);
assert.equal(calcEhr(30000, 0), 0);
assert.equal(rollingSlope([100, 110, 120]), 10);
assert.equal(rollingSlope([100]), 0);

assert.equal(stageFromEhr(20), "Survival");
assert.equal(stageFromEhr(35), "Stability");
assert.equal(stageFromEhr(80), "Independence");
assert.equal(stageFromEhr(160), "Freedom");
assert.deepEqual(stageTarget("Stability"), {
  min: 3,
  max: 6,
  guidance: "Reduce waste and improve conversion consistency.",
});
assert.equal(momentumStatus(2, { min: 3, max: 6 }), "below required slope");
assert.equal(momentumStatus(4, { min: 3, max: 6 }), "within target");
assert.equal(momentumStatus(7, { min: 3, max: 6 }), "above target");
assert.deepEqual(projectionRange(100, 10), { low: 104.5, high: 107.5 });

const logs: WorkLogRecord[] = [
  { category: "LEVER", minutes: 60 },
  { category: "ASSET_BUILD", minutes: 30 },
  { category: "MAINTENANCE", minutes: 30 },
  { category: "DRIFT", minutes: 60 },
];
assert.deepEqual(weeklyHours(logs), {
  leverHours: 1.5,
  totalHours: 3,
  driftRatio: 0.333,
});

assert.equal(
  defaultLeverByHeuristic(
    { revenueCents: 10000 },
    [{ category: "ASSET_BUILD", minutes: 60 }],
    null,
  ),
  "Distribution",
);
assert.equal(
  defaultLeverByHeuristic(
    { revenueCents: 100000 },
    [
      { category: "DRIFT", minutes: 40 },
      { category: "MAINTENANCE", minutes: 60 },
    ],
    null,
  ),
  "Automation",
);
assert.equal(defaultLeverByHeuristic(null, [], "Distribution"), "Conversion");
assert.equal(defaultLeverByHeuristic(null, [], "Conversion"), "Pricing");
assert.equal(defaultLeverByHeuristic(null, [], null), "Distribution");

assert.equal(
  selectWeeklyLeverDeterministically(
    baseStrategyInput({ weeklyRevenue: 100, leadsGenerated: 2 }),
  ).selectedLever,
  "Distribution",
);
assert.equal(
  selectWeeklyLeverDeterministically(
    baseStrategyInput({ trafficSessions: 100, leadsGenerated: 10, closedSales: 1 }),
  ).selectedLever,
  "Conversion",
);
assert.equal(
  selectWeeklyLeverDeterministically(
    baseStrategyInput({ grossMarginPct: 20 }),
  ).selectedLever,
  "Pricing",
);
assert.equal(
  selectWeeklyLeverDeterministically(
    baseStrategyInput({ trafficSessions: 20, leadsGenerated: 2, grossMarginPct: null }),
  ).selectedLever,
  "Traffic",
);
assert.equal(
  selectWeeklyLeverDeterministically(
    baseStrategyInput({ churnedCustomers: 2, grossMarginPct: null }),
  ).selectedLever,
  "Retention",
);
assert.equal(
  selectWeeklyLeverDeterministically(
    baseStrategyInput({ driftRatio: 0.3, grossMarginPct: null }),
  ).selectedLever,
  "Automation",
);
assert.equal(
  selectWeeklyLeverDeterministically(
    baseStrategyInput({ previousLever: "Distribution", grossMarginPct: null }),
  ).selectedLever,
  "Conversion",
);

const statuses = selectWeeklyLeverDeterministically(
  baseStrategyInput({ slope: -1, executionConsistency: 0.2, driftRatio: 0.3 }),
);
assert.equal(statuses.growthStatus, "below_target");
assert.equal(statuses.executionStatus, "low");
assert.equal(statuses.driftStatus, "high");
assert.equal(statuses.leverChangeRecommended, true);
assert.equal(statuses.allocationAdjustment, "tighten_focus");

assert.equal(
  decideMissionAction({
    forceRegenerate: false,
    hasExistingMission: true,
    hasEndedPauseToday: false,
    daysInactive: 0,
  }),
  "existing",
);
assert.equal(
  decideMissionAction({
    forceRegenerate: true,
    hasExistingMission: true,
    hasEndedPauseToday: false,
    daysInactive: 0,
  }),
  "generate",
);
assert.equal(
  decideMissionAction({
    forceRegenerate: false,
    hasExistingMission: false,
    hasEndedPauseToday: true,
    daysInactive: 0,
  }),
  "reset",
);
assert.equal(
  decideMissionAction({
    forceRegenerate: false,
    hasExistingMission: false,
    hasEndedPauseToday: false,
    daysInactive: 7,
  }),
  "reset",
);
assert.equal(RESET_MISSION.source, "RESET");
assert.equal(DETERMINISTIC_MISSIONS.Distribution.recommendedMinutes, 60);

const emptyMissionPayload = toMissionPayload(null, false, "Distribution");
assert.equal(emptyMissionPayload.primaryTask, "No mission generated yet.");
assert.equal(emptyMissionPayload.source, "TEMPLATE");
assert.equal(emptyMissionPayload.canUseAi, false);

const aiMission = selectGeneratedMission("Pricing", {
  primaryTask: "Review one offer tier.",
  supportTask: "Check delivery cost.",
  doNotDoReminder: "Do not publish before review.",
  recommendedMinutes: 40,
  startNowStep: "Open the pricing sheet.",
  successDefinition: "One tier reviewed.",
  source: "AI",
});
assert.equal(aiMission.primaryTask, "Review one offer tier.");
assert.equal(aiMission.lever, "Pricing");
assert.equal(aiMission.source, "AI");

const templateMission = selectGeneratedMission("Pricing", {
  primaryTask: "Ignored fallback text.",
  supportTask: null,
  doNotDoReminder: "Ignored.",
  recommendedMinutes: 10,
  startNowStep: "Ignored.",
  successDefinition: "Ignored.",
  source: "TEMPLATE",
});
assert.equal(templateMission.primaryTask, DETERMINISTIC_MISSIONS.Pricing.primaryTask);
assert.equal(templateMission.source, "TEMPLATE");

const firstWeek = new Date(2026, 5, 1);
const secondWeek = new Date(2026, 5, 8);
const weeklyRevenues: WeeklyRevenueRecord[] = [
  {
    weekStart: firstWeek,
    revenueCents: 6000,
    trafficSessions: 30,
    leadsGenerated: 4,
    closedSales: 1,
    churnedCustomers: 0,
    grossMarginPct: 55,
  },
  {
    weekStart: secondWeek,
    revenueCents: 12000,
    trafficSessions: 90,
    leadsGenerated: 10,
    closedSales: 2,
    churnedCustomers: 0,
    grossMarginPct: 60,
  },
];
const reportLogs: DatedWorkLogRecord[] = [
  { date: new Date(2026, 5, 2), category: "LEVER", minutes: 60 },
  { date: new Date(2026, 5, 9), category: "LEVER", minutes: 120 },
  { date: new Date(2026, 5, 10), category: "MAINTENANCE", minutes: 60 },
];

const weeklyReport = calculateWeeklyReport({
  weekStart: secondWeek,
  revenues: weeklyRevenues,
  logs: reportLogs,
  strategy: {
    selectedLever: "Conversion",
    reasoningSummary: "Conversion is the current constrained step.",
    growthStatus: "within_target",
    executionStatus: "strong",
    driftStatus: "low",
    allocationAdjustment: "none",
  },
  fullLoggingEnabled: true,
});
assert.equal(weeklyReport.revenue, 120);
assert.equal(weeklyReport.leverEhr, 60);
assert.equal(weeklyReport.totalEhr, 40);
assert.equal(weeklyReport.slope, 0);
assert.equal(weeklyReport.stage, "Stability");
assert.equal(weeklyReport.momentum, "below required slope");
assert.equal(weeklyReport.lever, "Conversion");
assert.equal(weeklyReport.weeklySignals.trafficSessions, 90);
assert.deepEqual(weeklyReport.chartData, [
  { week: "W1", revenue: 60, ehr: 60 },
  { week: "W2", revenue: 120, ehr: 60 },
]);

const monthlyReport = calculateMonthlyReport({
  now: new Date(2026, 3, 1),
  createdAt: new Date(2026, 0, 1),
  weeks: weeklyRevenues,
  logs: reportLogs,
});
assert.equal(monthlyReport.monthsActive, 2);
assert.equal(monthlyReport.totalRevenue, 180);
assert.equal(monthlyReport.totalHours, 4);
assert.equal(monthlyReport.averageEhr, 45);
assert.equal(monthlyReport.slope, 0);
assert.deepEqual(monthlyReport.trend, [
  { period: "W1", revenue: 60, ehr: 60 },
  { period: "W2", revenue: 120, ehr: 60 },
]);

console.log("PASS: deterministic core workflows verified.");
