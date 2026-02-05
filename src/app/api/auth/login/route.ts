import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";
import { setSessionCookie, signSession } from "@/lib/auth";

const prisma = new PrismaClient();

async function ensureBootstrapAdmin() {
  const username = "admin";
  const email = "admin@example.com";
  const defaultPassword = "admin123";

  const existing = await prisma.user.findUnique({ where: { username } });

  // if admin doesn't exist, create it
  if (!existing) {
    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    await prisma.user.create({
      data: {
        username,
        name: "Administrator",
        email,
        role: Role.ADMIN,
        passwordHash,
      },
    });
    return;
  }

  // if admin exists but is not ADMIN, make it ADMIN
  if (existing.role !== Role.ADMIN) {
    await prisma.user.update({
      where: { username },
      data: { role: Role.ADMIN },
    });
  }

  // if admin exists but passwordHash is empty/null, set default password
  if (!existing.passwordHash || existing.passwordHash.trim().length < 20) {
    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    await prisma.user.update({
      where: { username },
      data: { passwordHash },
    });
  }
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
