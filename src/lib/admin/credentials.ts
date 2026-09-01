import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { enqueuePersist, readPersistedText, writePersistedText, type PersistenceKind } from "./store";
import { ADMIN_STORE_COOKIE, MIN_PASSWORD_LENGTH } from "./constants";

export type StoredAdmin = {
  hash: string;
  salt: string;
  sessionSecret: string;
  createdAt: string;
  updatedAt: string;
};

export type AuthMode = "env" | "stored" | "setup";

export type AuthPersistence = PersistenceKind | "env" | "browser";

export type AuthStatus = {
  mode: AuthMode;
  persistence: AuthPersistence;
};

function storePepper(): string {
  return process.env.ADMIN_COOKIE_SECRET?.trim() || "nestspan-admin-cfg-v1";
}

export function encodeAdminStore(record: StoredAdmin): string {
  const payload = Buffer.from(JSON.stringify(record), "utf8").toString("base64url");
  const sig = createHmac("sha256", storePepper()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function decodeAdminStore(raw: string | undefined | null): StoredAdmin | null {
  if (!raw) return null;
  const [payload, sig] = raw.split(".");
  if (!payload || !sig) return null;
  const expected = createHmac("sha256", storePepper()).update(payload).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    return parseStored(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

export function resolveStoredAdmin(
  persistedText: string | null,
  persistedKind: PersistenceKind,
  cookieRaw?: string | null,
): { record: StoredAdmin | null; persistence: AuthPersistence } {
  const fromDisk = parseStored(persistedText);
  if (fromDisk) return { record: fromDisk, persistence: persistedKind };
  const fromCookie = decodeAdminStore(cookieRaw);
  if (fromCookie) return { record: fromCookie, persistence: "browser" };
  return { record: null, persistence: persistedKind };
}

async function peekStoreCookie(): Promise<string | undefined> {
  try {
    const { cookies } = await import("next/headers");
    const jar = await cookies();
    return jar.get(ADMIN_STORE_COOKIE)?.value;
  } catch {
    return undefined;
  }
}

function envPassword(): string | null {
  const value = process.env.ADMIN_PASSWORD?.trim();
  return value ? value : null;
}

export function hashPassword(password: string, salt = randomBytes(16).toString("hex")): { hash: string; salt: string } {
  const hash = scryptSync(password, salt, 64).toString("hex");
  return { hash, salt };
}

export function passwordMatchesHash(password: string, salt: string, hash: string): boolean {
  const next = scryptSync(password, salt, 64);
  const prev = Buffer.from(hash, "hex");
  if (next.length !== prev.length) return false;
  return timingSafeEqual(next, prev);
}

function parseStored(raw: string | null): StoredAdmin | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredAdmin;
    if (!parsed?.hash || !parsed?.salt || !parsed?.sessionSecret) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function loadStoredAdmin(): Promise<{ record: StoredAdmin | null; persistence: AuthPersistence }> {
  const { text, persistence } = await readPersistedText("admin");
  return resolveStoredAdmin(text, persistence, await peekStoreCookie());
}

export async function saveStoredAdmin(password: string, previous?: StoredAdmin | null): Promise<StoredAdmin> {
  const { hash, salt } = hashPassword(password);
  const now = new Date().toISOString();
  const record: StoredAdmin = {
    hash,
    salt,
    sessionSecret: previous?.sessionSecret || randomBytes(32).toString("hex"),
    createdAt: previous?.createdAt || now,
    updatedAt: now,
  };
  await enqueuePersist(async () => {
    await writePersistedText("admin", JSON.stringify(record));
  });
  return record;
}

export async function authStatus(): Promise<AuthStatus> {
  if (envPassword()) return { mode: "env", persistence: "env" };
  const { record, persistence } = await loadStoredAdmin();
  if (record) return { mode: "stored", persistence };
  return { mode: "setup", persistence };
}

export async function needsSetup(): Promise<boolean> {
  const status = await authStatus();
  return status.mode === "setup";
}

export async function verifyPassword(password: string): Promise<boolean> {
  const env = envPassword();
  if (env) {
    const a = Buffer.from(hashPassword(password, "env-compare").hash, "hex");
    const b = Buffer.from(hashPassword(env, "env-compare").hash, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  }
  const { record } = await loadStoredAdmin();
  if (!record) return false;
  return passwordMatchesHash(password, record.salt, record.hash);
}

export async function sessionSecret(): Promise<string | null> {
  const env = envPassword();
  if (env) return hashPassword(`nestspan-admin:${env}`, "session").hash;
  const { record } = await loadStoredAdmin();
  return record?.sessionSecret ?? null;
}

export function validateNewPassword(password: string, confirm?: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (confirm !== undefined && password !== confirm) {
    return "The two passwords do not match.";
  }
  return null;
}
