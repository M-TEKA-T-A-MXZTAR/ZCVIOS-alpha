import { browserProfileProvider } from "@/adapters/browser/active-profile-provider";
import { resolveActiveProfile } from "@/application/identity";

export const requireActiveProfile = () =>
  resolveActiveProfile(browserProfileProvider);
