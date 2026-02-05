import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";
import { setSessionCookie, signSession } from "@/lib/auth";

const prisma = new PrismaClient();

async function ensureBootstrapAdmin() {
  const count = await prisma.user.count();
  if (count > 0) return;

  const passwordHash = await bcrypt.hash("admin123", 10);
  await prisma.user.create({
    data: {
      username: "admin",
      name: "Administrator",
      email: "admin@example.com",
      role: Role.ADMIN,
      passwordHash,
    },
  });
}

export async function POST(req: Request) {
  await ensureBootstrapAdmin();

  const body = await req.json();
  const username = (body.username || "").trim();
  const password = body.password || "";

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const token = await signSession({
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
  });

  setSessionCookie(token);
  return NextResponse.json({ ok: true });
}
