import { NextResponse } from "next/server";
import { signSession } from "@/lib/session";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false, message: "Invalid JSON" }, { status: 400 });

  const { username, password } = body;

  // TODO: replace with real auth
  if (username !== "admin" || password !== "admin123") {
    return NextResponse.json({ ok: false, message: "Invalid credentials" }, { status: 401 });
  }

  const token = signSession({ id: 1, username: "admin", role: "ADMIN" });

  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}
