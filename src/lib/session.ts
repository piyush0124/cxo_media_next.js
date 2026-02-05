import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "admin_token";

export type AdminSession = {
  id: number;
  username: string;
  role: "ADMIN" | "AUTHOR";
};

function getSecretKey() {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) throw new Error("ADMIN_JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: AdminSession) {
  const key = getSecretKey();

  // HS256 equivalent of jsonwebtoken default usage with a shared secret
  return await new SignJWT(payload as unknown as Record<string, any>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

export function setSessionCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export function clearSessionCookie() {
  cookies().set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export async function getSession(): Promise<AdminSession | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const key = getSecretKey();
    const { payload } = await jwtVerify(token, key);

    // payload fields come back as unknown; cast to AdminSession
    return payload as unknown as AdminSession;
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export function requireAuth() {
  // TEMP: allow logged-in users
  // later replace with real session validation
  return true;
}
