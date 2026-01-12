import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __wpPrisma: PrismaClient | undefined;
}

const wpPrisma =
  global.__wpPrisma ||
  new PrismaClient({
    datasources: { db: { url: process.env.WP_DATABASE_URL } },
  });

if (process.env.NODE_ENV !== "production") global.__wpPrisma = wpPrisma;

export default wpPrisma;
