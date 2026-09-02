import { describe, expect, it } from "vitest";
import { applyEvent, emptyState, snapshotFromState } from "./analytics";
import { authenticateAdmin, verifyAdminSession } from "./session";
import {
  decodeAdminStore,
  encodeAdminStore,
  hashPassword,
  passwordMatchesHash,
  resolveStoredAdmin,
  validateNewPassword,
  type StoredAdmin,
} from "./credentials";
import { isBot } from "./request";
import { CALCULATOR_SEO } from "@/lib/seo";
import { HUB_TITLE } from "@/lib/brand";
import {
  CALCULATOR_TOOLS,
  KNOWN_PATHS,
  PATH_LABELS,
  TOOL_LABELS,
  clusterPageGroups,
  normalizePath,
  pagesWithCounts,
  toolsWithCounts,
} from "./constants";

describe("admin catalog matches the public site", () => {
  it("uses the same product names as the calculators", () => {
    expect(PATH_LABELS["/"]).toBe(HUB_TITLE);
    expect(PATH_LABELS["/longevity"]).toBe("How Long Before I Go Broke Calculator");
    expect(TOOL_LABELS.longevity).toBe(CALCULATOR_SEO["/longevity"].name);
    expect(TOOL_LABELS.child).toBe(CALCULATOR_SEO["/child"].name);
    expect(TOOL_LABELS.goal).toBe(CALCULATOR_SEO["/goal"].name);
    expect(KNOWN_PATHS).toHaveLength(8);
    expect(CALCULATOR_TOOLS).toHaveLength(7);
  });

  it("lists every public page and tool even at zero", () => {
    const pages = pagesWithCounts([]);
    expect(pages.map((row) => row.path)).toEqual([...KNOWN_PATHS]);
    expect(pages.every((row) => row.pageviews === 0)).toBe(true);
    const tools = toolsWithCounts([]);
    expect(tools.map((row) => row.tool)).toEqual([...CALCULATOR_TOOLS]);
    const groups = clusterPageGroups([{ path: "/child", pageviews: 4 }]);
    expect(groups[0]?.rows[0]?.label).toBe(HUB_TITLE);
    expect(groups.flatMap((group) => group.rows).find((row) => row.path === "/child")?.pageviews).toBe(4);
  });
});

describe("normalizePath", () => {
  it("keeps known calculator paths and drops query strings", () => {
    expect(normalizePath("/longevity?foo=1")).toBe("/longevity");
    expect(normalizePath("/need/")).toBe("/need");
    expect(normalizePath("/child")).toBe("/child");
    expect(normalizePath("/goal?x=1")).toBe("/goal");
    expect(normalizePath("/secret")).toBe("other");
  });
});

describe("applyEvent", () => {
  it("counts unique visitors separately from pageviews", () => {
    let state = emptyState();
    state = applyEvent(state, { type: "pageview", visitorId: "a", path: "/", at: "2026-08-31T10:00:00.000Z" });
    state = applyEvent(state, { type: "pageview", visitorId: "a", path: "/longevity", at: "2026-08-31T11:00:00.000Z" });
    state = applyEvent(state, { type: "pageview", visitorId: "b", path: "/", at: "2026-08-31T12:00:00.000Z" });
    const snap = snapshotFromState(state, "memory", new Date("2026-08-31T13:00:00.000Z"));
    expect(snap.lifetime.pageviews).toBe(3);
    expect(snap.lifetime.visitors).toBe(2);
    expect(snap.lifetime.users).toBe(0);
    expect(snap.today.visitors).toBe(2);
  });

  it("counts site users only after a calculator run", () => {
    let state = emptyState();
    state = applyEvent(state, { type: "pageview", visitorId: "a", path: "/need", at: "2026-08-31T10:00:00.000Z" });
    state = applyEvent(state, { type: "run", visitorId: "a", tool: "need", at: "2026-08-31T10:01:00.000Z" });
    state = applyEvent(state, { type: "run", visitorId: "a", tool: "need", at: "2026-08-31T10:02:00.000Z" });
    state = applyEvent(state, { type: "pageview", visitorId: "b", path: "/", at: "2026-08-31T10:03:00.000Z" });
    const snap = snapshotFromState(state, "memory", new Date("2026-08-31T13:00:00.000Z"));
    expect(snap.lifetime.visitors).toBe(2);
    expect(snap.lifetime.users).toBe(1);
    expect(snap.today.users).toBe(1);
    expect(snap.byTool[0]).toEqual({ tool: "need", runs: 2 });
  });

  it("unions unique visitors across days instead of summing daily uniques", () => {
    let state = emptyState();
    state = applyEvent(state, { type: "pageview", visitorId: "a", path: "/", at: "2026-08-30T10:00:00.000Z" });
    state = applyEvent(state, { type: "pageview", visitorId: "a", path: "/", at: "2026-08-31T10:00:00.000Z" });
    state = applyEvent(state, { type: "pageview", visitorId: "b", path: "/", at: "2026-08-31T11:00:00.000Z" });
    const snap = snapshotFromState(state, "memory", new Date("2026-08-31T13:00:00.000Z"));
    expect(snap.last7.visitors).toBe(2);
    expect(snap.last7.pageviews).toBe(3);
  });
});

describe("admin session", () => {
  it("signs and verifies a session for an environment password", async () => {
    const previous = process.env.ADMIN_PASSWORD;
    process.env.ADMIN_PASSWORD = "test-secret";
    const token = await authenticateAdmin("test-secret");
    expect(token).toBeTruthy();
    expect(await verifyAdminSession(token)).toBe(true);
    expect(await authenticateAdmin("nope")).toBeNull();
    expect(await verifyAdminSession("tampered")).toBe(false);
    if (previous === undefined) delete process.env.ADMIN_PASSWORD;
    else process.env.ADMIN_PASSWORD = previous;
  });
});

describe("stored password", () => {
  it("hashes a password and checks it without keeping the plaintext", () => {
    const { hash, salt } = hashPassword("correct-horse");
    expect(passwordMatchesHash("correct-horse", salt, hash)).toBe(true);
    expect(passwordMatchesHash("wrong-horse", salt, hash)).toBe(false);
  });

  it("rejects a short or mismatched new password", () => {
    expect(validateNewPassword("short")).toMatch(/at least 8/);
    expect(validateNewPassword("long-enough", "other")).toMatch(/do not match/);
    expect(validateNewPassword("long-enough", "long-enough")).toBeNull();
  });
});

describe("admin store cookie", () => {
  const record: StoredAdmin = {
    hash: "aa",
    salt: "bb",
    sessionSecret: "cc",
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-01T00:00:00.000Z",
  };

  it("round-trips a hashed record and rejects a tampered cookie", () => {
    const encoded = encodeAdminStore(record);
    expect(decodeAdminStore(encoded)).toEqual(record);
    expect(decodeAdminStore(`${encoded}x`)).toBeNull();
    expect(decodeAdminStore("not-a-cookie")).toBeNull();
  });

  it("uses the browser cookie when the server file is missing", () => {
    const cookie = encodeAdminStore(record);
    const fromCookie = resolveStoredAdmin(null, "memory", cookie);
    expect(fromCookie.persistence).toBe("browser");
    expect(fromCookie.record?.sessionSecret).toBe("cc");
    const fromFile = resolveStoredAdmin(JSON.stringify({ ...record, sessionSecret: "file" }), "file", cookie);
    expect(fromFile.persistence).toBe("file");
    expect(fromFile.record?.sessionSecret).toBe("file");
  });
});

describe("isBot", () => {
  it("skips crawlers and allows browsers", () => {
    expect(isBot("Mozilla/5.0 (Macintosh) Chrome/120")).toBe(false);
    expect(isBot("Googlebot/2.1")).toBe(true);
    expect(isBot("curl/8.0")).toBe(false);
  });
});
