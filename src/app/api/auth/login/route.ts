import { NextResponse } from "next/server";
import { login } from "@/lib/auth";
import { signSession, setSessionCookie } from "@/lib/session";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  const user = await login(username, password);
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = signSession({
    id: user.id,
    username: user.username,
    role: user.role,
  });

  setSessionCookie(token);

  return NextResponse.json({ ok: true });
}
