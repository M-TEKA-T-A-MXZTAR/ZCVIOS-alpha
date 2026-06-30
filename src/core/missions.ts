import type {
  Lever,
  MissionContent,
  MissionRecord,
  MissionSource,
} from "@/core/domain";

export const DETERMINISTIC_MISSIONS: Record<Lever, MissionContent> = {
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

export const RESET_MISSION: MissionContent & { source: "RESET" } = {
  primaryTask: "Run a 30-minute reset block on the active weekly lever.",
  supportTask: "Log one completed action before ending session.",
  doNotDoReminder: "Do not redesign your weekly plan today.",
  recommendedMinutes: 30,
  startNowStep: "Set a 30-minute timer and begin the smallest lever action.",
  successDefinition: "One lever task completed and logged.",
  source: "RESET",
};

export type MissionAction = "existing" | "reset" | "generate";

export interface MissionActionInput {
  forceRegenerate: boolean;
  hasExistingMission: boolean;
  hasEndedPauseToday: boolean;
  daysInactive: number;
}

export const decideMissionAction = ({
  forceRegenerate,
  hasExistingMission,
  hasEndedPauseToday,
  daysInactive,
}: MissionActionInput): MissionAction => {
  if (!forceRegenerate && hasExistingMission) return "existing";
  if (hasEndedPauseToday || daysInactive >= 7) return "reset";
  return "generate";
};

export const toMissionPayload = (
  mission: MissionRecord | null,
  canUseAi: boolean,
  weeklyLever: Lever,
) => {
  if (!mission) {
    return {
      primaryTask: "No mission generated yet.",
      supportTask: "",
      doNotDoReminder: "",
      recommendedMinutes: 30,
      startNowStep: "",
      successDefinition: "",
      source: "TEMPLATE" as MissionSource,
      lever: weeklyLever,
      canUseAi,
    };
  }

  return {
    primaryTask: mission.primaryTask,
    supportTask: mission.supportTask,
    doNotDoReminder: mission.doNotDoReminder,
    recommendedMinutes: mission.recommendedMinutes,
    startNowStep: mission.startNowStep,
    successDefinition: mission.successDefinition,
    source: mission.source,
    lever: mission.lever,
    canUseAi,
  };
};

export const selectGeneratedMission = (
  lever: Lever,
  generated: MissionContent & { source: MissionSource },
): MissionRecord => {
  if (generated.source === "AI") {
    return { ...generated, lever };
  }

  return {
    ...DETERMINISTIC_MISSIONS[lever],
    lever,
    source: generated.source,
  };
};
