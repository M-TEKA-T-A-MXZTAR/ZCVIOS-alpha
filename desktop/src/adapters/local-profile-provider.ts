import { invoke } from "@tauri-apps/api/core";
import type {
  ActiveProfile,
  ActiveProfileProvider,
} from "../../../src/application/identity";

export const LOCAL_OWNER_PROFILE_ID = "local-owner";

export interface OperatorBaseline {
  displayName: string;
  focusedHoursPerWeek: number;
  weeklyRevenueCents: number;
  primaryChannel: string;
  activeOffer: string;
  isComplete: boolean;
}

export interface OperatorBaselineInput {
  displayName: string;
  focusedHoursPerWeek: number;
  weeklyRevenueCents: number;
  primaryChannel: string;
  activeOffer: string;
}

export interface DesktopBootstrapStatus {
  profile: ActiveProfile;
  baseline: OperatorBaseline;
  databasePath: string;
  schemaVersion: number;
  migrationCount: number;
}

type DesktopLocalProfileProvider = ActiveProfileProvider & {
  initialize(): Promise<DesktopBootstrapStatus>;
  saveBaseline(input: OperatorBaselineInput): Promise<DesktopBootstrapStatus>;
};

export const localProfileProvider: DesktopLocalProfileProvider = {
  initialize: () => invoke<DesktopBootstrapStatus>("initialize_local_profile"),
  saveBaseline: (input) =>
    invoke<DesktopBootstrapStatus>("save_operator_baseline", { input }),
  getActiveProfile: async () => (await localProfileProvider.initialize()).profile,
};
