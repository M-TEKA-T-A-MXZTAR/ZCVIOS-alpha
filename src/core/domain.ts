export const LEVER_VALUES = [
  "Distribution",
  "Conversion",
  "Pricing",
  "Traffic",
  "Retention",
  "AssetBuild",
  "Automation",
  "Authority",
] as const;

export type Lever = (typeof LEVER_VALUES)[number];

export type LogCategory = "LEVER" | "ASSET_BUILD" | "MAINTENANCE" | "DRIFT";
export type MissionSource = "AI" | "TEMPLATE" | "RESET";

export type GrowthStatus = "below_target" | "within_target" | "above_target";
export type ExecutionStatus = "low" | "moderate" | "strong";
export type DriftStatus = "low" | "moderate" | "high";
export type AllocationAdjustment = "none" | "tighten_focus" | "increase_asset_build";

export type ProgressStage = "Survival" | "Stability" | "Independence" | "Freedom";

export interface RevenueRecord {
  revenueCents: number;
}

export interface WeeklyRevenueRecord extends RevenueRecord {
  weekStart: Date;
  trafficSessions?: number | null;
  leadsGenerated?: number | null;
  closedSales?: number | null;
  churnedCustomers?: number | null;
  grossMarginPct?: number | null;
}

export interface WorkLogRecord {
  minutes: number;
  category: LogCategory;
}

export interface DatedWorkLogRecord extends WorkLogRecord {
  date: Date;
}

export interface MissionContent {
  primaryTask: string;
  supportTask: string | null;
  doNotDoReminder: string;
  recommendedMinutes: number;
  startNowStep: string;
  successDefinition: string;
}

export interface MissionRecord extends MissionContent {
  lever: Lever;
  source: MissionSource;
}

export interface WeeklyPlanRecord {
  selectedLever: Lever;
  reasoningSummary: string;
  growthStatus: GrowthStatus;
  executionStatus: ExecutionStatus;
  driftStatus: DriftStatus;
  allocationAdjustment: AllocationAdjustment;
}

export interface StrategyInput {
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
}

export interface StrategyDecision {
  selectedLever: Lever;
  reasoningSummary: string;
  growthStatus: GrowthStatus;
  executionStatus: ExecutionStatus;
  driftStatus: DriftStatus;
  leverChangeRecommended: boolean;
  allocationAdjustment: AllocationAdjustment;
}
