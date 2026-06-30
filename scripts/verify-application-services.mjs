import assert from "node:assert/strict";
import { createMissionService } from "../src/application/mission-service.ts";
import { createReportService } from "../src/application/report-service.ts";

const today = new Date(2026, 5, 30);
const weekStart = new Date(2026, 5, 29);

const existingMission = {
  lever: "Distribution",
  primaryTask: "Publish one offer.",
  supportTask: "Reuse an existing asset.",
  doNotDoReminder: "Do not redesign branding.",
  recommendedMinutes: 60,
  startNowStep: "Open the offer draft.",
  successDefinition: "Offer published.",
  source: "TEMPLATE",
};

let missionContext = {
  businessType: "digital",
  commandMode: true,
  weeklyLever: "Distribution",
  lastPauseEnd: null,
  lastLeverLogDate: new Date(2026, 5, 29),
  existingMission,
};

const missionState = {
  includeExistingMission: false,
  savedMission: null,
  generatorCalls: 0,
};

const missionRepository = {
  getMissionContext: async (query) => {
    missionState.includeExistingMission = query.includeExistingMission;
    return missionContext;
  },
  saveMission: async ({ mission }) => {
    missionState.savedMission = mission;
    return mission;
  },
};

const missionGenerator = {
  generate: async ({ lever, context }) => {
    missionState.generatorCalls += 1;
    assert.equal(lever, "Distribution");
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
  assert.equal(missionState.savedMission, null);
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
  assert.equal(missionState.savedMission?.source, "RESET");
  assert.equal(missionState.generatorCalls, 0);

  missionState.savedMission = null;
  missionContext = {
    ...missionContext,
    existingMission,
    lastPauseEnd: null,
  };
  const generatedResult = await missionService.getOrCreateDailyMission({
    userId: "local-user",
    apiKey: "test-key",
    today,
    weekStart,
    forceRegenerate: true,
  });
  assert.equal(missionState.includeExistingMission, false);
  assert.equal(generatedResult.mission.primaryTask, "Publish an AI-assisted offer.");
  assert.equal(generatedResult.mission.canUseAi, true);
  assert.equal(missionState.savedMission?.source, "AI");
  assert.equal(missionState.generatorCalls, 1);

  const firstWeek = new Date(2026, 5, 1);
  const secondWeek = new Date(2026, 5, 8);
  const reportState = { weeklyQuery: null };

  const reportRepository = {
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
