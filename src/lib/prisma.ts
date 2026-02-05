import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __appPrisma: PrismaClient | undefined;
}

const prisma =
  global.__appPrisma ||
  new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } },
  });

if (process.env.NODE_ENV !== "production") global.__appPrisma = prisma;

export default prisma;
