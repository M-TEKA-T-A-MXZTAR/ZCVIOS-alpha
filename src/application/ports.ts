import type {
  DatedWorkLogRecord,
  Lever,
  MissionContent,
  MissionRecord,
  MissionSource,
  WeeklyPlanRecord,
  WeeklyRevenueRecord,
} from "@/core/domain";

export interface MissionContextSnapshot {
  businessType: string;
  commandMode: boolean;
  weeklyLever: Lever;
  lastPauseEnd: Date | null;
  lastLeverLogDate: Date | null;
  existingMission: MissionRecord | null;
}

export interface MissionContextQuery {
  userId: string;
  today: Date;
  weekStart: Date;
  includeExistingMission: boolean;
}

export interface MissionRepository {
  getMissionContext(query: MissionContextQuery): Promise<MissionContextSnapshot>;
  saveMission(input: { userId: string; date: Date; mission: MissionRecord }): Promise<MissionRecord>;
}

export interface MissionGenerator {
  generate(input: {
    apiKey: string | null;
    lever: Lever;
    commandMode: boolean;
    context: string;
  }): Promise<MissionContent & { source: MissionSource }>;
}

export interface WeeklyReportSnapshot {
  revenues: WeeklyRevenueRecord[];
  logs: DatedWorkLogRecord[];
  strategy: WeeklyPlanRecord | null;
  fullLoggingEnabled: boolean;
}

export interface MonthlyReportSnapshot {
  createdAt: Date;
  weeks: WeeklyRevenueRecord[];
  logs: DatedWorkLogRecord[];
}

export interface ReportRepository {
  getWeeklyReportSnapshot(input: {
    userId: string;
    historyStart: Date;
    weekStart: Date;
    weekEnd: Date;
  }): Promise<WeeklyReportSnapshot>;
  getMonthlyReportSnapshot(userId: string): Promise<MonthlyReportSnapshot>;
}
