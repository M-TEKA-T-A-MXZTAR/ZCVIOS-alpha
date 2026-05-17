import {
  AllocationAdjustment,
  DriftStatus,
  ExecutionStatus,
  GrowthStatus,
  Lever,
  MissionSource,
} from "@prisma/client";
import { z } from "zod";
import {
  DETERMINISTIC_MISSIONS,
  EXECUTION_AGENT_SYSTEM_PROMPT,
  LEVER_OPTIONS,
  STRATEGY_AGENT_SYSTEM_PROMPT,
} from "@/lib/constants";

type StrategyInput = {
  businessType: string;
  weeklyRevenue: number;
  slope: number;
  executionConsistency: number;
  driftRatio: number;
  weeksOnLever: number;
  previousLever: Lever | null;
  trafficSessions?: number | null;
  leadsGenerated?: number | null;
  closedSales?: number | null;
  churnedCustomers?: number | null;
  grossMarginPct?: number | null;
  note?: string;
};

const strategySchema = z.object({
  selectedLever: z.enum([
    "Distribution",
    "Conversion",
    "Pricing",
    "Traffic",
    "Retention",
    "Asset Build",
    "Automation",
    "Authority",
  ]),
  reasoningSummary: z.string(),
  growthStatus: z.enum(["below_target", "within_target", "above_target"]),
  executionStatus: z.enum(["low", "moderate", "strong"]),
  driftStatus: z.enum(["low", "moderate", "high"]),
  leverChangeRecommended: z.boolean(),
  allocationAdjustment: z.enum(["none", "tighten_focus", "increase_asset_build"]),
});

const executionSchema = z.object({
  primaryTask: z.string(),
  supportTask: z.string(),
  doNotDoReminder: z.string(),
  recommendedMinutes: z.number(),
  startNowStep: z.string(),
  successDefinition: z.string(),
});

const mapLever = (raw: string): Lever => {
  if (raw === "Asset Build") return "AssetBuild";
  return LEVER_OPTIONS.includes(raw as Lever) ? (raw as Lever) : "Distribution";
};

const callOpenAiJson = async (apiKey: string, systemPrompt: string, userPrompt: string) => {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-5.2",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`OpenAI error ${response.status}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  return JSON.parse(content);
};

export const strategyFallback = (input: StrategyInput) => {
  const traffic = input.trafficSessions ?? 0;
  const leads = input.leadsGenerated ?? 0;
  const sales = input.closedSales ?? 0;
  const churn = input.churnedCustomers ?? 0;
  const margin = input.grossMarginPct ?? null;

  let selectedLever: Lever = input.previousLever ?? "Distribution";

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

  const growthStatus: GrowthStatus = input.slope < 2 ? "below_target" : input.slope > 8 ? "above_target" : "within_target";
  const executionStatus: ExecutionStatus =
    input.executionConsistency < 0.35 ? "low" : input.executionConsistency < 0.75 ? "moderate" : "strong";
  const driftStatus: DriftStatus = input.driftRatio > 0.2 ? "high" : input.driftRatio > 0.1 ? "moderate" : "low";
  const allocationAdjustment: AllocationAdjustment = input.driftRatio > 0.2 && input.slope < 2 ? "tighten_focus" : "none";

  return {
    selectedLever,
    reasoningSummary:
      `Weekly lever selected using deterministic rules from EHR slope, execution consistency, and weekly business signals. ${heuristicNote} Focus remains constrained to one lever for the week.`,
    growthStatus,
    executionStatus,
    driftStatus,
    leverChangeRecommended: input.slope < 0,
    allocationAdjustment,
  };
};

export const generateStrategy = async (apiKey: string | null, input: StrategyInput) => {
  if (!apiKey) {
    return strategyFallback(input);
  }

  try {
    const payload = await callOpenAiJson(
      apiKey,
      STRATEGY_AGENT_SYSTEM_PROMPT,
      `Business type: ${input.businessType}
Weekly revenue: ${input.weeklyRevenue}
4-week EHR slope: ${input.slope}
Execution consistency: ${input.executionConsistency}
Drift ratio: ${input.driftRatio}
Weeks on current lever: ${input.weeksOnLever}
Traffic sessions this week: ${input.trafficSessions ?? "unknown"}
Leads generated this week: ${input.leadsGenerated ?? "unknown"}
Closed sales this week: ${input.closedSales ?? "unknown"}
Churned customers this week: ${input.churnedCustomers ?? "unknown"}
Gross margin % this week: ${input.grossMarginPct ?? "unknown"}
Previous lever: ${input.previousLever ?? "none"}
User note: ${input.note ?? "none"}`,
    );

    const parsed = strategySchema.parse(payload);
    return {
      selectedLever: mapLever(parsed.selectedLever),
      reasoningSummary: parsed.reasoningSummary,
      growthStatus: parsed.growthStatus as GrowthStatus,
      executionStatus: parsed.executionStatus as ExecutionStatus,
      driftStatus: parsed.driftStatus as DriftStatus,
      leverChangeRecommended: parsed.leverChangeRecommended,
      allocationAdjustment: parsed.allocationAdjustment as AllocationAdjustment,
    };
  } catch {
    return strategyFallback(input);
  }
};

export const missionFallback = (lever: Lever) => {
  const mission = DETERMINISTIC_MISSIONS[lever];
  return {
    ...mission,
    source: MissionSource.TEMPLATE,
  };
};

export const generateExecutionMission = async (
  apiKey: string | null,
  lever: Lever,
  commandMode: boolean,
  context: string,
) => {
  if (!apiKey) {
    return missionFallback(lever);
  }

  try {
    const payload = await callOpenAiJson(
      apiKey,
      EXECUTION_AGENT_SYSTEM_PROMPT,
      `Weekly lever: ${lever}
Mode: ${commandMode ? "Command" : "Insight"}
Context: ${context}`,
    );
    const parsed = executionSchema.parse(payload);
    return {
      ...parsed,
      recommendedMinutes: Math.max(15, Math.min(180, Math.round(parsed.recommendedMinutes))),
      source: MissionSource.AI,
    };
  } catch {
    return missionFallback(lever);
  }
};
