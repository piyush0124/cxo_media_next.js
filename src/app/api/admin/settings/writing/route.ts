import { NextResponse } from "next/server";
import wpPrisma from "@/lib/prisma";
import { requireAuth } from "@/lib/session";

export async function GET() {
  requireAuth();

  const row = await wpPrisma.setting.findUnique({
    where: { key: "defaultCategoryId" },
  });

  const categories = await wpPrisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json({
    ok: true,
    defaultCategoryId: row?.value ? Number(row.value) : null,
    categories,
  });
}

export async function POST(req: Request) {
  requireAuth();

  const { defaultCategoryId } = await req.json();

  await wpPrisma.setting.upsert({
    where: { key: "defaultCategoryId" },
    update: { value: String(defaultCategoryId) },
    create: { key: "defaultCategoryId", value: String(defaultCategoryId) },
  });

  return NextResponse.json({ ok: true });
}
