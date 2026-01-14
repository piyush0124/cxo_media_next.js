import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const KEY_PREFIX = "nav_menu_"; // nav_menu_primary

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const key = (searchParams.get("key") || "primary").trim();
    const dbKey = `${KEY_PREFIX}${key}`;

    const row = await prisma.setting.findUnique({ where: { key: dbKey } });

    let items: any[] = [];
    if (row?.value) {
      try {
        items = JSON.parse(row.value);
      } catch {
        items = [];
      }
    }

    return NextResponse.json({ ok: true, items });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, message: e?.message || "Failed to load menu" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const key = (searchParams.get("key") || "primary").trim();
    const dbKey = `${KEY_PREFIX}${key}`;

    const body = await req.json();
    const items = body?.items ?? [];

    await prisma.setting.upsert({
      where: { key: dbKey },
      create: { key: dbKey, value: JSON.stringify(items) },
      update: { value: JSON.stringify(items) },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, message: e?.message || "Failed to save menu" },
      { status: 500 }
    );
  }
}
