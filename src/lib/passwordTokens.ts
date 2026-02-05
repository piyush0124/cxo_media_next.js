import crypto from "crypto";

export function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function hashToken(rawToken: string) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}
