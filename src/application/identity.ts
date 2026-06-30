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

/** Resolve the current owner profile without exposing the delivery-specific identity mechanism. */
export const resolveActiveProfile = (
  provider: ActiveProfileProvider,
): Promise<ActiveProfile | null> => provider.getActiveProfile();
