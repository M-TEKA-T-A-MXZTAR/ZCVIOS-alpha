import type { ReportRepository } from "./ports";
import { calculateMonthlyReport, calculateWeeklyReport } from "../core/reports";

const startOfDay = (date: Date) => {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
};

const endOfWeekMonday = (date: Date) => {
  const value = startOfDay(date);
  value.setDate(value.getDate() + 6);
  value.setHours(23, 59, 59, 999);
  return value;
};

export const createReportService = (repository: ReportRepository) => ({
  buildWeeklyReport: async (input: { userId: string; weekStart: Date }) => {
    const weekStart = startOfDay(input.weekStart);
    const historyStart = new Date(weekStart);
    historyStart.setDate(historyStart.getDate() - 21);
    const weekEnd = endOfWeekMonday(weekStart);

    const snapshot = await repository.getWeeklyReportSnapshot({
      userId: input.userId,
      historyStart,
      weekStart,
      weekEnd,
    });

    return calculateWeeklyReport({
      weekStart,
      revenues: snapshot.revenues,
      logs: snapshot.logs,
      strategy: snapshot.strategy,
      fullLoggingEnabled: snapshot.fullLoggingEnabled,
    });
  },

  buildMonthlyReport: async (input: { userId: string; now: Date }) => {
    const snapshot = await repository.getMonthlyReportSnapshot(input.userId);

    return calculateMonthlyReport({
      now: startOfDay(input.now),
      createdAt: startOfDay(snapshot.createdAt),
      weeks: snapshot.weeks,
      logs: snapshot.logs,
    });
  },
});
