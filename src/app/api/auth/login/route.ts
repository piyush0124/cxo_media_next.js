import { NextResponse } from "next/server";
import { login } from "@/lib/auth";

export async function POST(req: Request) {
  const { username, password } = await req.json();
  const user = await login(username, password);
  if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  return NextResponse.json({ id: user.id, name: user.name, role: user.role });
}
