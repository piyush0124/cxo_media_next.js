import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getSetting(key: string, fallback = "") {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? fallback;
}

export async function getBooleanSetting(key: string, fallback = false) {
  const v = await getSetting(key);
  if (!v) return fallback;
  return v === "1" || v === "true";
}

export async function getNumberSetting(key: string, fallback = 0) {
  const v = await getSetting(key);
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}
