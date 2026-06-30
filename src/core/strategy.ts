import type { StrategyDecision, StrategyInput } from "@/core/domain";

export const selectWeeklyLeverDeterministically = (input: StrategyInput): StrategyDecision => {
  const traffic = input.trafficSessions ?? 0;
  const leads = input.leadsGenerated ?? 0;
  const sales = input.closedSales ?? 0;
  const churn = input.churnedCustomers ?? 0;
  const margin = input.grossMarginPct ?? null;

  let selectedLever = input.previousLever ?? "Distribution";

  if (input.weeklyRevenue < 300 && leads > 0) {
    selectedLever = "Distribution";
  } else if (traffic >= 80 && leads >= 8 && sales <= 1) {
    selectedLever = "Conversion";
  } else if (margin !== null && margin > 0 && margin < 35) {
    selectedLever = "Pricing";
  } else if (traffic < 40 && leads < 6) {
    selectedLever = "Traffic";
  } else if (churn >= 2) {
    selectedLever = "Retention";
  } else if (input.driftRatio > 0.2) {
    selectedLever = "Automation";
  } else if (input.previousLever === "Distribution") {
    selectedLever = "Conversion";
  }

  const heuristicNote =
    selectedLever === "Conversion"
      ? "Traffic and lead volume are present, while conversion remains constrained."
      : selectedLever === "Pricing"
        ? "Margin pressure indicates pricing structure needs revision."
        : selectedLever === "Traffic"
          ? "Visibility signals are low, so distribution inflow requires reinforcement."
          : selectedLever === "Retention"
            ? "Churn signal indicates retention leverage has immediate upside."
            : selectedLever === "Automation"
              ? "Drift ratio is elevated and focus recovery requires execution simplification."
              : "Revenue position and execution pattern support focused distribution output.";

  const growthStatus = input.slope < 2 ? "below_target" : input.slope > 8 ? "above_target" : "within_target";
  const executionStatus =
    input.executionConsistency < 0.35 ? "low" : input.executionConsistency < 0.75 ? "moderate" : "strong";
  const driftStatus = input.driftRatio > 0.2 ? "high" : input.driftRatio > 0.1 ? "moderate" : "low";
  const allocationAdjustment = input.driftRatio > 0.2 && input.slope < 2 ? "tighten_focus" : "none";

  return {
    selectedLever,
    reasoningSummary:
      `Weekly lever selected using deterministic rules from EHR slope, execution consistency, drift ratio, and weekly operating signals. ${heuristicNote} Focus remains constrained to one lever for the week.`,
    growthStatus,
    executionStatus,
    driftStatus,
    leverChangeRecommended: input.slope < 0,
    allocationAdjustment,
  };
};

export type { StrategyDecision, StrategyInput } from "@/core/domain";
