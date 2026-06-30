export type ActiveProfileSource = "browser-session" | "local-profile";

export interface ActiveProfile {
  id: string;
  displayName: string | null;
  email: string | null;
  source: ActiveProfileSource;
}

export interface ActiveProfileProvider {
  getActiveProfile(): Promise<ActiveProfile | null>;
}

export const resolveActiveProfile = (provider: ActiveProfileProvider) =>
  provider.getActiveProfile();
