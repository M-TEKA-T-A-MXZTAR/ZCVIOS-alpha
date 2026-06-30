import type { Lever, ProgressStage, RevenueRecord, WorkLogRecord } from "@/core/domain";

export const toHours = (minutes: number) => Number((minutes / 60).toFixed(2));

export const calcEhr = (revenueCents: number, hours: number) => {
  if (!hours) return 0;
  return Number(((revenueCents / 100) / hours).toFixed(2));
};

export const rollingSlope = (values: number[]) => {
  if (values.length < 2) return 0;
  const oldest = values[0] || 1;
  const latest = values[values.length - 1];
  const periods = values.length - 1;
  return Number((((latest - oldest) / Math.abs(oldest || 1)) / periods * 100).toFixed(2));
};

export const stageFromEhr = (ehr: number): ProgressStage => {
  if (ehr < 35) return "Survival";
  if (ehr < 80) return "Stability";
  if (ehr < 160) return "Independence";
  return "Freedom";
};

export const stageTarget = (stage: ProgressStage) => {
  switch (stage) {
    case "Survival":
      return { min: 5, max: 10, guidance: "Lift reliability and keep execution simple." };
    case "Stability":
      return { min: 3, max: 6, guidance: "Reduce waste and improve conversion consistency." };
    case "Independence":
      return { min: 2, max: 4, guidance: "Protect margin and standardize repeatable wins." };
    default:
      return { min: 0, max: 2, guidance: "Emphasize time ownership and asset yield." };
  }
};

export const momentumStatus = (slope: number, target: { min: number; max: number }) => {
  if (slope < target.min) return "below required slope";
  if (slope > target.max) return "above target";
  return "within target";
};

export const weeklyHours = (logs: WorkLogRecord[]) => {
  const leverMinutes = logs
    .filter((item) => item.category === "LEVER" || item.category === "ASSET_BUILD")
    .reduce((acc, item) => acc + item.minutes, 0);
  const totalMinutes = logs.reduce((acc, item) => acc + item.minutes, 0);
  const driftMinutes = logs
    .filter((item) => item.category === "DRIFT")
    .reduce((acc, item) => acc + item.minutes, 0);

  return {
    leverHours: toHours(leverMinutes),
    totalHours: toHours(totalMinutes),
    driftRatio: totalMinutes ? Number((driftMinutes / totalMinutes).toFixed(3)) : 0,
  };
};

export const projectionRange = (currentEhr: number, slopePercent: number) => {
  const conservative = slopePercent * 0.6;
  const low = Number((currentEhr * (1 + conservative / 100 * 0.75)).toFixed(2));
  const high = Number((currentEhr * (1 + conservative / 100 * 1.25)).toFixed(2));
  return { low, high };
};

export const defaultLeverByHeuristic = (
  revenue: RevenueRecord | null,
  logs: WorkLogRecord[],
  previousLever: Lever | null,
): Lever => {
  const hasAssets = logs.some((item) => item.category === "ASSET_BUILD");
  const totalMinutes = logs.reduce((acc, item) => acc + item.minutes, 0);
  const driftMinutes = logs
    .filter((item) => item.category === "DRIFT")
    .reduce((acc, item) => acc + item.minutes, 0);
  const driftRatio = totalMinutes ? driftMinutes / totalMinutes : 0;

  if ((revenue?.revenueCents ?? 0) < 30000 && hasAssets) return "Distribution";
  if (driftRatio > 0.35) return "Automation";
  if (previousLever === "Distribution") return "Conversion";
  if (previousLever === "Conversion") return "Pricing";
  return previousLever ?? "Distribution";
};
