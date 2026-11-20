import { SignJWT, jwtVerify } from "jose";

export const COOKIE = "posterai_session";
const key = () => new TextEncoder().encode(process.env.SESSION_SECRET ?? "");

export async function createSession() {
  return new SignJWT({ ok: true })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(key());
}

export async function verifySession(token?: string) {
  if (!token || !process.env.SESSION_SECRET) return false;
  try { await jwtVerify(token, key()); return true; } catch { return false; }
}
