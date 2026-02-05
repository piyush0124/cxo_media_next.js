import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, username: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
  });

  return NextResponse.json({ user });
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const name = (body.name || "").trim();
  const email = (body.email || "").trim() || null;

  const user = await prisma.user.update({
    where: { id: session.id },
    data: { name, email },
    select: { id: true, username: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
  });

  return NextResponse.json({ user });
}
