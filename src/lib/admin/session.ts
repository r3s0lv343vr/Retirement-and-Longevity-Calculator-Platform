import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { ADMIN_COOKIE, ADMIN_STORE_COOKIE } from "./constants";
import { sessionSecret, verifyPassword } from "./credentials";

export const SESSION_DAYS = 7;

export type AdminSession = {
  exp: number;
};

export async function signAdminSession(now = Date.now()): Promise<string | null> {
  const key = await sessionSecret();
  if (!key) return null;
  const session: AdminSession = { exp: now + SESSION_DAYS * 24 * 60 * 60 * 1000 };
  const payload = Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
  const sig = createHmac("sha256", key).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export async function verifyAdminSession(token: string | undefined | null, now = Date.now()): Promise<boolean> {
  if (!token) return false;
  const key = await sessionSecret();
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

export async function authenticateAdmin(password: string): Promise<string | null> {
  if (!(await verifyPassword(password))) return null;
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

/** Hash and salt only, for hosts that cannot keep .data/admin.json. Same life as the session. */
export const adminStoreCookieOptions = {
  name: ADMIN_STORE_COOKIE,
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_DAYS * 24 * 60 * 60,
  secure: process.env.NODE_ENV === "production",
};
