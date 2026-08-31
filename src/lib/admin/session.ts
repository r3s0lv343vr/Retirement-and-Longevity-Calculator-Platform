import { createHmac, createHash, randomBytes, timingSafeEqual } from "crypto";
import { ADMIN_COOKIE } from "./constants";

const SESSION_DAYS = 7;

export function adminPassword(): string | null {
  const fromEnv = process.env.ADMIN_PASSWORD?.trim();
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV === "production") return null;
  return "dev-admin";
}

function signingKey(): string | null {
  const password = adminPassword();
  if (!password) return null;
  return createHash("sha256").update(`nestspan-admin:${password}`).digest("hex");
}

function passwordMatches(given: string): boolean {
  const expected = adminPassword();
  if (!expected) return false;
  const a = createHash("sha256").update(given).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export type AdminSession = {
  exp: number;
};

export function signAdminSession(now = Date.now()): string | null {
  const key = signingKey();
  if (!key) return null;
  const session: AdminSession = { exp: now + SESSION_DAYS * 24 * 60 * 60 * 1000 };
  const payload = Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
  const sig = createHmac("sha256", key).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyAdminSession(token: string | undefined | null, now = Date.now()): boolean {
  if (!token) return false;
  const key = signingKey();
  if (!key) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = createHmac("sha256", key).update(payload).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AdminSession;
    return typeof session.exp === "number" && session.exp > now;
  } catch {
    return false;
  }
}

export function authenticateAdmin(password: string): string | null {
  if (!passwordMatches(password)) return null;
  return signAdminSession();
}

export function newVisitorId(): string {
  return randomBytes(16).toString("hex");
}

export const adminCookieOptions = {
  name: ADMIN_COOKIE,
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_DAYS * 24 * 60 * 60,
  secure: process.env.NODE_ENV === "production",
};
