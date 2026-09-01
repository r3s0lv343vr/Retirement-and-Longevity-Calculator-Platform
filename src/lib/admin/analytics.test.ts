import { describe, expect, it } from "vitest";
import { applyEvent, emptyState, snapshotFromState } from "./analytics";
import { authenticateAdmin, verifyAdminSession } from "./session";
import { hashPassword, passwordMatchesHash, validateNewPassword } from "./credentials";
import { isBot } from "./request";
import { normalizePath } from "./constants";

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

describe("isBot", () => {
  it("skips crawlers and allows browsers", () => {
    expect(isBot("Mozilla/5.0 (Macintosh) Chrome/120")).toBe(false);
    expect(isBot("Googlebot/2.1")).toBe(true);
    expect(isBot("curl/8.0")).toBe(false);
  });
});
