import assert from "node:assert/strict";
import { createMissionService } from "../src/application/mission-service";
import type {
  MissionContextQuery,
  MissionContextSnapshot,
  MissionGenerator,
  MissionRepository,
  ReportRepository,
} from "../src/application/ports";
import { createReportService } from "../src/application/report-service";
import type { Lever, MissionRecord } from "../src/core/domain";

const today = new Date(2026, 5, 30);
const weekStart = new Date(2026, 5, 29);
const weeklyLever: Lever = "Distribution";

const existingMission: MissionRecord = {
  lever: weeklyLever,
  primaryTask: "Publish one offer.",
  supportTask: "Reuse an existing asset.",
  doNotDoReminder: "Do not redesign branding.",
  recommendedMinutes: 60,
  startNowStep: "Open the offer draft.",
  successDefinition: "Offer published.",
  source: "TEMPLATE",
};

let missionContext: MissionContextSnapshot = {
  businessType: "digital",
  commandMode: true,
  weeklyLever,
  lastPauseEnd: null,
  lastLeverLogDate: new Date(2026, 5, 29),
  existingMission,
};

const missionState: {
  includeExistingMission: boolean;
  savedMission: MissionRecord | null;
  generatorCalls: number;
} = {
  includeExistingMission: false,
  savedMission: null,
  generatorCalls: 0,
};

const missionRepository: MissionRepository = {
  getMissionContext: async (query: MissionContextQuery) => {
    missionState.includeExistingMission = query.includeExistingMission;
    return missionContext;
  },
  saveMission: async ({ mission }) => {
    missionState.savedMission = mission;
    return mission;
  },
};

const missionGenerator: MissionGenerator = {
  generate: async ({ lever, context }) => {
    missionState.generatorCalls += 1;
    assert.equal(lever, weeklyLever);
    assert.equal(context, "Business type: digital. Weekly lever: Distribution.");
    return {
      primaryTask: "Publish an AI-assisted offer.",
      supportTask: "Reuse one existing asset.",
      doNotDoReminder: "Do not add another lever.",
      recommendedMinutes: 45,
      startNowStep: "Open the strongest existing product.",
      successDefinition: "One offer published.",
      source: "AI",
    };
  },
};

const missionService = createMissionService({
  repository: missionRepository,
  generator: missionGenerator,
});

const readSavedMission = (): MissionRecord | null => missionState.savedMission;
type WeeklyQuery = Parameters<ReportRepository["getWeeklyReportSnapshot"]>[0];

const run = async () => {
  const existingResult = await missionService.getOrCreateDailyMission({
    userId: "local-user",
    apiKey: null,
    today,
    weekStart,
  });
  assert.equal(missionState.includeExistingMission, true);
  assert.equal(existingResult.mission.primaryTask, "Publish one offer.");
  assert.equal(existingResult.inactivityLevel, 1);
  assert.equal(readSavedMission(), null);
  assert.equal(missionState.generatorCalls, 0);

  missionContext = {
    ...missionContext,
    existingMission: null,
    lastPauseEnd: today,
  };
  const resetResult = await missionService.getOrCreateDailyMission({
    userId: "local-user",
    apiKey: null,
    today,
    weekStart,
  });
  assert.equal(resetResult.mission.source, "RESET");
  assert.equal(readSavedMission()?.source, "RESET");
  assert.equal(missionState.generatorCalls, 0);

  missionState.savedMission = null;
  missionContext = {
    ...missionContext,
    existingMission,
    lastPauseEnd: null,
  };
  const generatedResult = await missionService.getOrCreateDailyMission({
    userId: "local-user",
    apiKey: "fixture-value",
    today,
    weekStart,
    forceRegenerate: true,
  });
  assert.equal(missionState.includeExistingMission, false);
  assert.equal(generatedResult.mission.primaryTask, "Publish an AI-assisted offer.");
  assert.equal(generatedResult.mission.canUseAi, true);
  assert.equal(readSavedMission()?.source, "AI");
  assert.equal(missionState.generatorCalls, 1);

  const firstWeek = new Date(2026, 5, 1);
  const secondWeek = new Date(2026, 5, 8);
  const reportState: { weeklyQuery: WeeklyQuery | null } = { weeklyQuery: null };

  const reportRepository: ReportRepository = {
    getWeeklyReportSnapshot: async (query) => {
      reportState.weeklyQuery = query;
      return {
        revenues: [
          { weekStart: firstWeek, revenueCents: 6000 },
          { weekStart: secondWeek, revenueCents: 12000 },
        ],
        logs: [
          { date: new Date(2026, 5, 2), category: "LEVER", minutes: 60 },
          { date: new Date(2026, 5, 9), category: "LEVER", minutes: 120 },
          { date: new Date(2026, 5, 10), category: "MAINTENANCE", minutes: 60 },
        ],
        strategy: null,
        fullLoggingEnabled: true,
      };
    },
    getMonthlyReportSnapshot: async () => ({
      createdAt: new Date(2026, 0, 1, 15, 30),
      weeks: [
        { weekStart: firstWeek, revenueCents: 6000 },
        { weekStart: secondWeek, revenueCents: 12000 },
      ],
      logs: [
        { date: new Date(2026, 5, 2), category: "LEVER", minutes: 60 },
        { date: new Date(2026, 5, 9), category: "LEVER", minutes: 120 },
        { date: new Date(2026, 5, 10), category: "MAINTENANCE", minutes: 60 },
      ],
    }),
  };

  const reportService = createReportService(reportRepository);
  const weeklyReport = await reportService.buildWeeklyReport({
    userId: "local-user",
    weekStart: secondWeek,
  });
  assert.equal(weeklyReport.revenue, 120);
  assert.equal(weeklyReport.leverEhr, 60);
  assert.equal(weeklyReport.fullLoggingEnabled, true);
  assert.ok(reportState.weeklyQuery);
  assert.equal(reportState.weeklyQuery.historyStart.getTime(), new Date(2026, 4, 18).getTime());
  assert.equal(reportState.weeklyQuery.weekEnd.getHours(), 23);

  const monthlyReport = await reportService.buildMonthlyReport({
    userId: "local-user",
    now: new Date(2026, 3, 1, 20, 0),
  });
  assert.equal(monthlyReport.monthsActive, 2);
  assert.equal(monthlyReport.totalRevenue, 180);
  assert.equal(monthlyReport.totalHours, 4);
  assert.equal(monthlyReport.averageEhr, 45);

  console.log("PASS: application services verified with in-memory adapters.");
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
