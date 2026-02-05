import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";
import { getSession } from "@/lib/auth";

const prisma = new PrismaClient();

function parseId(id: string) {
  const n = Number(id);
  return Number.isFinite(n) ? n : null;
}

const allowedRoles = new Set(["ADMIN", "EDITOR", "AUTHOR", "CONTRIBUTOR", "SUBSCRIBER"]);

export async function GET(_: Request, ctx: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const id = parseId(ctx.params.id);
  if (id === null) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, username: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
  });

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ user });
}

export async function PUT(req: Request, ctx: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const id = parseId(ctx.params.id);
  if (id === null) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const body = await req.json();

  const username = String(body.username || "").trim();
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim() || null;
  const role = String(body.role || "AUTHOR") as Role;
  const password = String(body.password || "").trim();

  if (!username || !name) {
    return NextResponse.json({ error: "username and name are required" }, { status: 400 });
  }
  if (!allowedRoles.has(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const data: any = { username, name, email, role };
  if (password) data.passwordHash = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, username: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
    });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Update failed (duplicate username/email?)" }, { status: 400 });
  }
}

export async function DELETE(_: Request, ctx: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const id = parseId(ctx.params.id);
  if (id === null) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  // WP-like safety: don't delete yourself
  if (Number(session.id) === id) {
    return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
