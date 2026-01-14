import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

const KEY_PREFIX = "nav_menu_";

function resolveHref(item: any) {
  if (item.type === "category") return `/category/${item.value}`;
  if (item.type === "page") return `/${item.value}`;
  if (item.type === "custom") return item.value;
  return "#";
}

function mapTree(items: any[]): any[] {
  return (items || []).map((it) => ({
    id: it.id,
    title: it.label,
    href: resolveHref(it),
    children: mapTree(it.children || []),
  }));
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = (searchParams.get("key") || "primary").trim();

  const row = await prisma.setting.findUnique({ where: { key: `${KEY_PREFIX}${key}` } });
  const raw = row?.value ? JSON.parse(row.value) : [];

  return NextResponse.json({ items: mapTree(raw) });
}
