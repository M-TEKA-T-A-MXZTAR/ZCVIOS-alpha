process.env.DATABASE_URL ??= "file:./dev.db";

await import("../prisma/seed.mjs");
