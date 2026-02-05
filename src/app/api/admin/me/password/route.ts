import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const currentPassword = body.currentPassword || "";
  const newPassword = body.newPassword || "";

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "Current password incorrect" }, { status: 400 });

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: session.id }, data: { passwordHash } });

  return NextResponse.json({ ok: true });
}
