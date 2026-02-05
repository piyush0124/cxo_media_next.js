import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev_secret_change_me");

export type SessionUser = {
  id: string;
  username: string;
  name: string;
  role: string;
};

export async function signSession(user: SessionUser) {
  return await new SignJWT({ user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function getSession() {
  const token = cookies().get("session")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    return (payload as any).user as SessionUser;
  } catch {
    return null;
  }
}

export function setSessionCookie(token: string) {
  cookies().set("session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearSessionCookie() {
  cookies().set("session", "", { httpOnly: true, path: "/", maxAge: 0 });
}
