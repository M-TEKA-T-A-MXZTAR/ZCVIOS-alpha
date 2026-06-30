import {
  decideMissionAction,
  RESET_MISSION,
  selectGeneratedMission,
  toMissionPayload,
} from "@/core/missions";
import type { MissionGenerator, MissionRepository } from "@/application/ports";

const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

const startOfDay = (date: Date) => {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
};

export const createMissionService = (dependencies: {
  repository: MissionRepository;
  generator: MissionGenerator;
}) => ({
  getOrCreateDailyMission: async (input: {
    userId: string;
    apiKey: string | null;
    today: Date;
    weekStart: Date;
    forceRegenerate?: boolean;
  }) => {
    const forceRegenerate = input.forceRegenerate ?? false;
    const today = startOfDay(input.today);
    const context = await dependencies.repository.getMissionContext({
      userId: input.userId,
      today,
      weekStart: input.weekStart,
      includeExistingMission: !forceRegenerate,
    });

    const hasEndedPauseToday = Boolean(
      context.lastPauseEnd && startOfDay(context.lastPauseEnd).getTime() === today.getTime(),
    );
    const rawDaysInactive = context.lastLeverLogDate
      ? Math.floor(
          (today.getTime() - startOfDay(context.lastLeverLogDate).getTime()) /
            MILLISECONDS_PER_DAY,
        )
      : 999;
    const daysInactive = Math.max(0, rawDaysInactive);

    const action = decideMissionAction({
      forceRegenerate,
      hasExistingMission: Boolean(context.existingMission),
      hasEndedPauseToday,
      daysInactive,
    });

    if (action === "existing" && context.existingMission) {
      return {
        mission: toMissionPayload(
          context.existingMission,
          Boolean(input.apiKey),
          context.weeklyLever,
        ),
        inactivityLevel: daysInactive,
      };
    }

    if (action === "reset") {
      const saved = await dependencies.repository.saveMission({
        userId: input.userId,
        date: today,
        mission: {
          ...RESET_MISSION,
          lever: context.weeklyLever,
        },
      });

      return {
        mission: toMissionPayload(saved, Boolean(input.apiKey), context.weeklyLever),
        inactivityLevel: daysInactive,
      };
    }

    const generated = await dependencies.generator.generate({
      apiKey: input.apiKey,
      lever: context.weeklyLever,
      commandMode: context.commandMode,
      context: `Business type: ${context.businessType}. Weekly lever: ${context.weeklyLever}.`,
    });
    const finalMission = selectGeneratedMission(context.weeklyLever, generated);
    const saved = await dependencies.repository.saveMission({
      userId: input.userId,
      date: today,
      mission: finalMission,
    });

    return {
      mission: toMissionPayload(saved, Boolean(input.apiKey), context.weeklyLever),
      inactivityLevel: daysInactive,
    };
  },
});
