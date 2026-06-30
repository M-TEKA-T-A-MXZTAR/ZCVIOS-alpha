import assert from "node:assert/strict";
import type { StrategyInput, WorkLogRecord } from "../src/core/domain";
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

console.log("PASS: deterministic progress and weekly strategy core verified.");
