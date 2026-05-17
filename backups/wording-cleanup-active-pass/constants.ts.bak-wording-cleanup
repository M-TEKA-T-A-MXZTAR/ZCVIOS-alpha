import { Lever } from "@prisma/client";

export const LEVER_OPTIONS: Lever[] = [
  "Distribution",
  "Conversion",
  "Pricing",
  "Traffic",
  "Retention",
  "AssetBuild",
  "Automation",
  "Authority",
];

export const STRATEGY_AGENT_SYSTEM_PROMPT = `You are the Strategy Engine of ZC-VIOS.
Your job: diagnose bottlenecks and select ONE weekly revenue lever.
Constraints:
- Only one lever.
- Only choose from: Distribution, Conversion, Pricing, Traffic, Retention, Asset Build, Automation, Authority.
- Neutral tone, no motivational language.
- Strict JSON only.
Primary metric: 4-week rolling EHR slope.
Secondary: execution consistency, drift ratio, weeks on lever, weekly revenue, business type, user notes.
Selection priorities:
1) revenue near zero + assets exist -> Distribution
2) traffic exists but low sales -> Conversion
3) margin/pricing issues -> Pricing
4) no visibility -> Traffic
5) churn -> Retention
6) overwhelmed -> Automation
7) unclear positioning but sales exist -> Authority
8) Asset Build only if distribution stable
Return JSON exactly:
{
  "selectedLever": "Distribution",
  "reasoningSummary": "2-3 neutral sentences referencing metrics.",
  "growthStatus": "below_target | within_target | above_target",
  "executionStatus": "low | moderate | strong",
  "driftStatus": "low | moderate | high",
  "leverChangeRecommended": true | false,
  "allocationAdjustment": "none | tighten_focus | increase_asset_build"
}`;

export const EXECUTION_AGENT_SYSTEM_PROMPT = `You are the Execution Engine of ZC-VIOS.
Your job: translate the selected weekly lever into a concise daily mission.
Constraints:
- Do not change the weekly lever.
- Do not introduce additional levers.
- Command Mode: short, clear, direct.
- Neutral tone; strict JSON only.
Return JSON exactly:
{
  "primaryTask": "Clear action statement.",
  "supportTask": "Optional short support action.",
  "doNotDoReminder": "One short guardrail sentence.",
  "recommendedMinutes": 60,
  "startNowStep": "Immediate micro action.",
  "successDefinition": "Measurable completion statement."
}`;

export const DETERMINISTIC_MISSIONS: Record<
  Lever,
  {
    primaryTask: string;
    supportTask: string;
    doNotDoReminder: string;
    recommendedMinutes: number;
    startNowStep: string;
    successDefinition: string;
  }
> = {
  Distribution: {
    primaryTask: "Publish one concrete offer to two channels where buyers already exist.",
    supportTask: "Reuse one existing asset; no new long-form creation.",
    doNotDoReminder: "Do not redesign branding before publishing.",
    recommendedMinutes: 60,
    startNowStep: "Open your best-performing past post and draft a sharper CTA.",
    successDefinition: "Offer published in two channels with clear next step link.",
  },
  Conversion: {
    primaryTask: "Audit and tighten one sales step with highest drop-off.",
    supportTask: "Add one objection-handling line to the offer page or script.",
    doNotDoReminder: "Do not add new products today.",
    recommendedMinutes: 55,
    startNowStep: "Review last 10 leads and list one repeated objection.",
    successDefinition: "One conversion step updated and tested with a real lead.",
  },
  Pricing: {
    primaryTask: "Increase clarity and margin in one offer tier.",
    supportTask: "Prepare one concise value explanation for the new price.",
    doNotDoReminder: "Do not discount reactively without test window.",
    recommendedMinutes: 50,
    startNowStep: "Calculate delivery cost for your main offer.",
    successDefinition: "Updated pricing communicated in one customer-facing asset.",
  },
  Traffic: {
    primaryTask: "Launch one targeted outreach or content batch for new visibility.",
    supportTask: "Document source quality in one line per lead source.",
    doNotDoReminder: "Do not switch platforms mid-session.",
    recommendedMinutes: 65,
    startNowStep: "Write one channel-specific hook for your ideal buyer.",
    successDefinition: "At least one traffic action shipped and tracked.",
  },
  Retention: {
    primaryTask: "Run one retention touchpoint for recent buyers.",
    supportTask: "Collect one specific feedback signal from active customers.",
    doNotDoReminder: "Do not chase net-new offers before retention touchpoint is sent.",
    recommendedMinutes: 45,
    startNowStep: "List your last 5 buyers and pick one follow-up message.",
    successDefinition: "Retention outreach sent and responses tracked.",
  },
  AssetBuild: {
    primaryTask: "Ship one reusable asset that shortens future execution.",
    supportTask: "Tag where this asset plugs into this week’s lever.",
    doNotDoReminder: "Do not build assets disconnected from current lever.",
    recommendedMinutes: 60,
    startNowStep: "Clone your most repeated task into a reusable template.",
    successDefinition: "Reusable asset completed and linked to active workflow.",
  },
  Automation: {
    primaryTask: "Automate one repetitive task consuming more than 20 minutes/day.",
    supportTask: "Document fallback manual step in one sentence.",
    doNotDoReminder: "Do not automate unstable processes with unclear inputs.",
    recommendedMinutes: 50,
    startNowStep: "Identify one repeat action from yesterday’s log.",
    successDefinition: "Automation live for one recurring task with quick verification.",
  },
  Authority: {
    primaryTask: "Publish one proof-based positioning asset (case, result, authority post).",
    supportTask: "Add one measurable outcome line.",
    doNotDoReminder: "Do not inflate claims without proof.",
    recommendedMinutes: 55,
    startNowStep: "Pick one customer result and draft a 3-line case summary.",
    successDefinition: "Authority asset published and connected to offer path.",
  },
};
