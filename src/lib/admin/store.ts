import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { applyEvent, emptyState, snapshotFromState, type AnalyticsEvent, type AnalyticsSnapshot, type AnalyticsState } from "./analytics";

export type PersistenceKind = AnalyticsSnapshot["persistence"];
export type BlobKind = "analytics" | "admin";

const REDIS_KEYS: Record<BlobKind, string> = {
  analytics: "nestspan:analytics",
  admin: "nestspan:admin",
};

const blobMemory = new Map<BlobKind, string>();
let memoryState: AnalyticsState = emptyState();
let memoryPersistence: PersistenceKind = "memory";
let queue: Promise<void> = Promise.resolve();

function filePathFor(kind: BlobKind): string {
  if (kind === "admin") {
    const custom = process.env.ADMIN_FILE?.trim();
    if (custom) return custom;
    return path.join(process.cwd(), ".data", "admin.json");
  }
  const custom = process.env.ANALYTICS_FILE?.trim();
  if (custom) return custom;
  return path.join(process.cwd(), ".data", "analytics.json");
}

function tmpPathFor(kind: BlobKind): string {
  return path.join("/tmp", kind === "admin" ? "nestspan-admin.json" : "nestspan-analytics.json");
}

function redisConfig(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim() || process.env.KV_REST_API_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim() || process.env.KV_REST_API_TOKEN?.trim();
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ""), token };
}

async function redisCommand(command: unknown[]): Promise<unknown> {
  const redis = redisConfig();
  if (!redis) return null;
  const response = await fetch(redis.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${redis.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Redis ${response.status}`);
  }
  const payload = (await response.json()) as { result?: unknown };
  return payload.result ?? null;
}

export async function readPersistedText(kind: BlobKind): Promise<{ text: string | null; persistence: PersistenceKind }> {
  if (redisConfig()) {
    try {
      const result = await redisCommand(["GET", REDIS_KEYS[kind]]);
      const text = typeof result === "string" ? result : null;
      if (text) blobMemory.set(kind, text);
      return { text, persistence: "redis" };
    } catch {
      return { text: blobMemory.get(kind) ?? null, persistence: "memory" };
    }
  }

  try {
    const text = await readFile(filePathFor(kind), "utf8");
    blobMemory.set(kind, text);
    return { text, persistence: "file" };
  } catch {
    try {
      const text = await readFile(tmpPathFor(kind), "utf8");
      blobMemory.set(kind, text);
      return { text, persistence: "file" };
    } catch {
      const text = blobMemory.get(kind) ?? null;
      return { text, persistence: text ? "memory" : "memory" };
    }
  }
}

export async function writePersistedText(kind: BlobKind, text: string): Promise<PersistenceKind> {
  blobMemory.set(kind, text);
  if (redisConfig()) {
    try {
      await redisCommand(["SET", REDIS_KEYS[kind], text]);
      return "redis";
    } catch {
      /* fall through */
    }
  }
  try {
    const target = filePathFor(kind);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, text, "utf8");
    return "file";
  } catch {
    try {
      await writeFile(tmpPathFor(kind), text, "utf8");
      return "file";
    } catch {
      return "memory";
    }
  }
}

function parseState(raw: string | null | undefined): AnalyticsState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AnalyticsState;
    if (!parsed || typeof parsed !== "object") return null;
    return {
      lifetimePageviews: Number(parsed.lifetimePageviews) || 0,
      visitorFirstSeen: parsed.visitorFirstSeen && typeof parsed.visitorFirstSeen === "object" ? parsed.visitorFirstSeen : {},
      userFirstSeen: parsed.userFirstSeen && typeof parsed.userFirstSeen === "object" ? parsed.userFirstSeen : {},
      days: parsed.days && typeof parsed.days === "object" ? parsed.days : {},
    };
  } catch {
    return null;
  }
}

async function loadState(): Promise<{ state: AnalyticsState; persistence: PersistenceKind }> {
  const { text, persistence } = await readPersistedText("analytics");
  const state = parseState(text) ?? memoryState;
  memoryState = state;
  memoryPersistence = persistence;
  return { state, persistence };
}

async function saveState(state: AnalyticsState): Promise<PersistenceKind> {
  memoryState = state;
  const persistence = await writePersistedText("analytics", JSON.stringify(state));
  memoryPersistence = persistence;
  return persistence;
}

function enqueue<T>(work: () => Promise<T>): Promise<T> {
  const run = queue.then(work, work);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export async function recordAnalyticsEvent(event: AnalyticsEvent): Promise<void> {
  await enqueue(async () => {
    const { state } = await loadState();
    await saveState(applyEvent(state, event));
  });
}

export async function readAnalyticsSnapshot(): Promise<AnalyticsSnapshot> {
  return enqueue(async () => {
    const { state, persistence } = await loadState();
    return snapshotFromState(state, persistence);
  });
}

export function currentPersistence(): PersistenceKind {
  if (redisConfig()) return "redis";
  return memoryPersistence;
}

export function enqueuePersist<T>(work: () => Promise<T>): Promise<T> {
  return enqueue(work);
}
