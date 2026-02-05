import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { generateToken, hashToken } from "@/lib/passwordTokens";
import { sendSetPasswordEmail } from "@/lib/mailer";

const prisma = new PrismaClient();

const allowedRoles = new Set(["ADMIN", "EDITOR", "AUTHOR", "CONTRIBUTOR", "SUBSCRIBER"]);

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const role = (searchParams.get("role") || "").trim();

  const where: any = {};
  if (role) where.role = role;

  if (q) {
    where.OR = [
      { username: { contains: q, mode: "insensitive" } },
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const username = String(body.username || "").trim().toLowerCase();

const emailRaw = String(body.email || "").trim();
const email = emailRaw ? emailRaw.toLowerCase() : null;

  const name = String(body.name || "").trim();
  const role = String(body.role || "AUTHOR") as Role;

  if (!username || !name || !email) {
    return NextResponse.json({ error: "username, name and email are required" }, { status: 400 });
  }
  if (!allowedRoles.has(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  // temporary password hash (not emailed)
  const tempPassword = generateToken().slice(0, 12);
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  try {
    const existing = await prisma.user.findFirst({
  where: {
    OR: [
      { username },
      ...(email ? [{ email }] : []),
    ],
  },
  select: { id: true, username: true, email: true },
});

if (existing) {
  return NextResponse.json(
    { error: "Username or email already exists (case-insensitive match)." },
    { status: 400 }
  );
}

    const user = await prisma.user.create({
      data: { username, name, email, role, passwordHash },
      select: { id: true, username: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
    });

    // create reset token record
    const rawToken = generateToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 2); // 2 hours

    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const setPasswordUrl = `${baseUrl}/set-password?uid=${user.id}&token=${rawToken}`;

    let emailSent = false;
    let emailError: string | null = null;

    try {
      await sendSetPasswordEmail({
        to: user.email!,
        siteName: "CXO Media",
        setPasswordUrl,
        username: user.username,
      });
      emailSent = true;
    } catch (e: any) {
      emailSent = false;
      emailError = e?.message || "Email failed";
    }

    return NextResponse.json({ user, emailSent, emailError }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: "User create failed (duplicate username/email?)" }, { status: 400 });
  }
}
