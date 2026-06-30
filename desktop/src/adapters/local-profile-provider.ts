import type { ActiveProfileProvider } from "../../../src/application/identity";

export const LOCAL_OWNER_PROFILE_ID = "local-owner";

export const localProfileProvider: ActiveProfileProvider = {
  getActiveProfile: async () => ({
    id: LOCAL_OWNER_PROFILE_ID,
    displayName: "Local Operator",
    email: null,
    source: "local-profile",
  }),
};
