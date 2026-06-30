import { invoke } from "@tauri-apps/api/core";
import type {
  ActiveProfile,
  ActiveProfileProvider,
} from "../../../src/application/identity";

export const LOCAL_OWNER_PROFILE_ID = "local-owner";

export interface DesktopBootstrapStatus {
  profile: ActiveProfile;
  databasePath: string;
  schemaVersion: number;
  migrationCount: number;
}

type DesktopLocalProfileProvider = ActiveProfileProvider & {
  initialize(): Promise<DesktopBootstrapStatus>;
};

export const localProfileProvider: DesktopLocalProfileProvider = {
  initialize: () => invoke<DesktopBootstrapStatus>("initialize_local_profile"),
  getActiveProfile: async () => (await localProfileProvider.initialize()).profile,
};
