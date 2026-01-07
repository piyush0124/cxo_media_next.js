import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const COOKIE_NAME = "admin_token";

export type AdminSession = {
  id: number;
  username: string;
  role: "ADMIN" | "AUTHOR";
};

export function signSession(payload: AdminSession) {
  const secret = process.env.ADMIN_JWT_SECRET!;
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export function setSessionCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // set true in production https
    path: "/",
  });
}

export function clearSessionCookie() {
  cookies().set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export function getSession(): AdminSession | null {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const secret = process.env.ADMIN_JWT_SECRET!;
    return jwt.verify(token, secret) as AdminSession;
  } catch {
    return null;
  }
}

export function requireAdmin(): AdminSession {
  const session = getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}
