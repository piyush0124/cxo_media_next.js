import { NextResponse } from "next/server";
import wpPrisma from "@/lib/prisma";
import { requireAuth } from "@/lib/session";

export async function POST(req: Request) {
  requireAuth();

  const { ids } = await req.json();

  if (!Array.isArray(ids) || !ids.length) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  await wpPrisma.category.deleteMany({
    where: { id: { in: ids } },
  });

  return NextResponse.json({ ok: true });
}
