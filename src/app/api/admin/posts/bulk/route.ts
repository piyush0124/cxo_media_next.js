import { NextResponse } from "next/server";
import wpPrisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

function bad(msg: string, status = 400) {
  return NextResponse.json({ ok: false, message: msg }, { status });
}

export async function POST(req: Request) {
  const session = getSession();
  if (!session) return bad("Unauthorized", 401);

  const body = await req.json().catch(() => ({}));
  const ids: number[] = Array.isArray(body.ids) ? body.ids.map((x: any) => Number(x)).filter((n) => !Number.isNaN(n)) : [];
  const action = String(body.action || "").toUpperCase();

  if (!ids.length) return bad("No ids provided");

  if (action === "TRASH") {
    await wpPrisma.post.updateMany({ where: { id: { in: ids } }, data: { status: "TRASH" } });
    return NextResponse.json({ ok: true });
  }

  if (action === "RESTORE") {
    await wpPrisma.post.updateMany({ where: { id: { in: ids } }, data: { status: "DRAFT" } });
    return NextResponse.json({ ok: true });
  }

  if (action === "PUBLISH") {
    await wpPrisma.post.updateMany({ where: { id: { in: ids } }, data: { status: "PUBLISHED", publishedAt: new Date() } });
    return NextResponse.json({ ok: true });
  }

  if (action === "DRAFT") {
    await wpPrisma.post.updateMany({ where: { id: { in: ids } }, data: { status: "DRAFT", publishedAt: null } });
    return NextResponse.json({ ok: true });
  }

  if (action === "DELETE") {
    await wpPrisma.post.deleteMany({ where: { id: { in: ids } } });
    return NextResponse.json({ ok: true });
  }

  return bad("Invalid action");
}
