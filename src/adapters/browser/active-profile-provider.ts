import { getServerSession } from "next-auth";
import type { ActiveProfileProvider } from "@/application/identity";
import { authOptions } from "@/lib/auth";

export const browserProfileProvider: ActiveProfileProvider = {
  getActiveProfile: async () => {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return null;
    }

    return {
      id: session.user.id,
      displayName: session.user.name ?? null,
      email: session.user.email ?? null,
      source: "browser-session",
    };
  },
};
