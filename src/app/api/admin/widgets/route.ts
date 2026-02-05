import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@/lib/auth";

const prisma = new PrismaClient();

function requireAdmin(session: any) {
  return session?.role === "ADMIN";
}

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!requireAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const area = (searchParams.get("area") || "sidebar").trim();

  const row = await prisma.widgetArea.findUnique({ where: { areaKey: area } });
  const widgets = row?.config ? JSON.parse(row.config) : [];

  return NextResponse.json({ area, widgets });
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!requireAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const area = (searchParams.get("area") || "sidebar").trim();

  const body = await req.json().catch(() => ({}));
  const widgets = body.widgets;

  if (!Array.isArray(widgets)) {
    return NextResponse.json({ error: "Invalid widgets payload" }, { status: 400 });
  }

  await prisma.widgetArea.upsert({
    where: { areaKey: area },
    create: { areaKey: area, config: JSON.stringify(widgets) },
    update: { config: JSON.stringify(widgets) },
  });

  return NextResponse.json({ ok: true });
}
