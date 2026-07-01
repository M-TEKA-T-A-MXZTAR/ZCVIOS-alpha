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

const createMissionHarness = (contextOverrides = {}) => {
  const state = {
    includeExistingMission: null,
    savedMission: null,
    generatorCalls: 0,
  };
  const context = {
    businessType: "digital",
    commandMode: true,
    weeklyLever: "Distribution",
    lastPauseEnd: null,
    lastLeverLogDate: new Date(2026, 5, 29),
    existingMission,
    ...contextOverrides,
  };
  const repository = {
    getMissionContext: async (query) => {
      state.includeExistingMission = query.includeExistingMission;
      return context;
    },
    saveMission: async ({ mission }) => {
      state.savedMission = mission;
      return mission;
    },
  };
  const generator = {
    generate: async ({ lever, context: promptContext }) => {
      state.generatorCalls += 1;
      assert.equal(lever, "Distribution", "Generator must receive the active weekly lever.");
      assert.equal(
        promptContext,
        "Business type: digital. Weekly lever: Distribution.",
        "Generator context must remain deterministic.",
      );
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
  return {
    state,
    service: createMissionService({ repository, generator }),
  };
};

const getExistingMissionResult = async () => {
  const harness = createMissionHarness();
  const result = await harness.service.getOrCreateDailyMission({
    userId: "local-user",
    apiKey: null,
    today,
    weekStart,
  });
  return { ...harness, result };
};

const verifyExistingQuery = async () => {
  const { state } = await getExistingMissionResult();
  assert.equal(state.includeExistingMission, true, "Existing mission lookup must be enabled.");
  console.log("PASS: existing mission query mode verified.");
};

const verifyExistingPayload = async () => {
  const { result } = await getExistingMissionResult();
  assert.equal(result.mission.primaryTask, "Publish one offer.");
  console.log("PASS: existing mission payload verified.");
};

const verifyExistingInactivity = async () => {
  const { result } = await getExistingMissionResult();
  assert.equal(result.inactivityLevel, 1, "One elapsed local calendar day must report inactivity 1.");
  console.log("PASS: existing mission inactivity verified.");
};

const verifyExistingNoWrite = async () => {
  const { state } = await getExistingMissionResult();
  assert.equal(state.savedMission, null, "Existing mission lookup must not write a replacement.");
  console.log("PASS: existing mission no-write behavior verified.");
};

const verifyExistingNoGenerator = async () => {
  const { state } = await getExistingMissionResult();
  assert.equal(state.generatorCalls, 0, "Existing mission lookup must not call the generator.");
  console.log("PASS: existing mission no-generator behavior verified.");
};

const verifyResetMission = async () => {
  const { service, state } = createMissionHarness({ existingMission: null, lastPauseEnd: today });
  const result = await service.getOrCreateDailyMission({
    userId: "local-user",
    apiKey: null,
    today,
    weekStart,
  });
  assert.equal(state.includeExistingMission, true);
  assert.equal(result.mission.source, "RESET");
  assert.equal(state.savedMission?.source, "RESET");
  assert.equal(state.generatorCalls, 0);
  console.log("PASS: reset mission application-service path verified.");
};

const verifyGeneratedMission = async () => {
  const { service, state } = createMissionHarness();
  const result = await service.getOrCreateDailyMission({
    userId: "local-user",
    apiKey: "test-key",
    today,
    weekStart,
    forceRegenerate: true,
  });
  assert.equal(state.includeExistingMission, false);
  assert.equal(result.mission.primaryTask, "Publish an AI-assisted offer.");
  assert.equal(result.mission.canUseAi, true);
  assert.equal(state.savedMission?.source, "AI");
  assert.equal(state.generatorCalls, 1);
  console.log("PASS: generated mission application-service path verified.");
};

const verifyReportService = async () => {
  const firstWeek = new Date(2026, 5, 1);
  const secondWeek = new Date(2026, 5, 8);
  const reportState = { weeklyQuery: null };
  const repository = {
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
  const service = createReportService(repository);
  const weekly = await service.buildWeeklyReport({ userId: "local-user", weekStart: secondWeek });
  assert.equal(weekly.revenue, 120);
  assert.equal(weekly.leverEhr, 60);
  assert.equal(weekly.fullLoggingEnabled, true);
  assert.equal(reportState.weeklyQuery.historyStart.getTime(), new Date(2026, 4, 18).getTime());
  assert.equal(reportState.weeklyQuery.weekEnd.getHours(), 23);
  const monthly = await service.buildMonthlyReport({
    userId: "local-user",
    now: new Date(2026, 3, 1, 20, 0),
  });
  assert.equal(monthly.monthsActive, 2);
  assert.equal(monthly.totalRevenue, 180);
  assert.equal(monthly.totalHours, 4);
  assert.equal(monthly.averageEhr, 45);
  console.log("PASS: report application service verified with in-memory adapters.");
};

const verifiers = {
  "mission-existing-query": verifyExistingQuery,
  "mission-existing-payload": verifyExistingPayload,
  "mission-existing-inactivity": verifyExistingInactivity,
  "mission-existing-no-write": verifyExistingNoWrite,
  "mission-existing-no-generator": verifyExistingNoGenerator,
  "mission-reset": verifyResetMission,
  "mission-generated": verifyGeneratedMission,
  report: verifyReportService,
};

const mode = process.argv[2] ?? "all";

const run = async () => {
  if (mode === "all") {
    for (const verifier of Object.values(verifiers)) await verifier();
    return;
  }
  const verifier = verifiers[mode];
  if (!verifier) throw new Error(`Unknown application-service verification mode: ${mode}`);
  await verifier();
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
