import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { applyEvent, emptyState, snapshotFromState, type AnalyticsEvent, type AnalyticsSnapshot, type AnalyticsState } from "./analytics";

const REDIS_KEY = "nestspan:analytics";
const FILE_NAME = "analytics.json";

export type PersistenceKind = AnalyticsSnapshot["persistence"];

let memoryState: AnalyticsState = emptyState();
let memoryPersistence: PersistenceKind = "memory";
let queue: Promise<void> = Promise.resolve();

function filePath(): string {
  const custom = process.env.ANALYTICS_FILE?.trim();
  if (custom) return custom;
  return path.join(process.cwd(), ".data", FILE_NAME);
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
  if (redisConfig()) {
    try {
      const result = await redisCommand(["GET", REDIS_KEY]);
      const state = parseState(typeof result === "string" ? result : null) ?? emptyState();
      memoryState = state;
      memoryPersistence = "redis";
      return { state, persistence: "redis" };
    } catch {
      memoryPersistence = "memory";
      return { state: memoryState, persistence: "memory" };
    }
  }

  try {
    const raw = await readFile(filePath(), "utf8");
    const state = parseState(raw) ?? emptyState();
    memoryState = state;
    memoryPersistence = "file";
    return { state, persistence: "file" };
  } catch {
    try {
      const raw = await readFile(path.join("/tmp", "nestspan-analytics.json"), "utf8");
      const state = parseState(raw) ?? emptyState();
      memoryState = state;
      memoryPersistence = "file";
      return { state, persistence: "file" };
    } catch {
      if (memoryPersistence === "file") {
        return { state: memoryState, persistence: "file" };
      }
      memoryPersistence = "memory";
      return { state: memoryState, persistence: "memory" };
    }
  }
}

async function saveState(state: AnalyticsState, persistence: PersistenceKind): Promise<PersistenceKind> {
  memoryState = state;
  if (persistence === "redis" || redisConfig()) {
    try {
      await redisCommand(["SET", REDIS_KEY, JSON.stringify(state)]);
      memoryPersistence = "redis";
      return "redis";
    } catch {
      /* fall through */
    }
  }

  try {
    const target = filePath();
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, JSON.stringify(state), "utf8");
    memoryPersistence = "file";
    return "file";
  } catch {
    try {
      const fallback = path.join("/tmp", "nestspan-analytics.json");
      await writeFile(fallback, JSON.stringify(state), "utf8");
      memoryPersistence = "file";
      return "file";
    } catch {
      memoryPersistence = "memory";
      return "memory";
    }
  }
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
    const { state, persistence } = await loadState();
    const next = applyEvent(state, event);
    await saveState(next, persistence);
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
