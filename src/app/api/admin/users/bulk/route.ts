import { NextResponse } from "next/server";
import { PrismaClient, Role } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { isAdmin } from "@/lib/rbac";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const action = body.action as "delete" | "role";
  const ids = (body.ids || []) as Array<number | string>;

  const parsedIds = ids.map((x) => Number(x)).filter((n) => Number.isFinite(n));
  if (parsedIds.length === 0) return NextResponse.json({ error: "ids required" }, { status: 400 });

  // Prevent self actions
  const myId = Number(session.id);
  const idsNoSelf = parsedIds.filter((id) => id !== myId);

  if (action === "delete") {
    await prisma.user.deleteMany({ where: { id: { in: idsNoSelf } } });
    return NextResponse.json({ ok: true });
  }

  if (action === "role") {
    const role = String(body.role || "") as Role;
    const allowedRoles = new Set(["ADMIN", "EDITOR", "AUTHOR", "CONTRIBUTOR", "SUBSCRIBER"]);
    if (!allowedRoles.has(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    await prisma.user.updateMany({
      where: { id: { in: idsNoSelf } },
      data: { role },
    });

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
