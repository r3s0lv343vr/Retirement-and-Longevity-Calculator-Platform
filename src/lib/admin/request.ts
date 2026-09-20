import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, VISITOR_COOKIE } from "./constants";
import type { CalculatorTool } from "./constants";
import { normalizePath } from "./constants";
import { recordAnalyticsEvent } from "./store";
import { encodeAdminStore, isDurableAuth, loadStoredAdmin, type AuthPersistence, type StoredAdmin } from "./credentials";
import { adminCookieOptions, adminStoreCookieOptions, authenticateAdmin, newVisitorId, verifyAdminSession } from "./session";

const BOT_HINT = /bot|crawler|spider|slurp|bingpreview|facebookexternalhit/i;

export function isBot(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false;
  return BOT_HINT.test(userAgent);
}

export function readCookie(request: Request, name: string): string | undefined {
  const header = request.headers.get("cookie");
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [rawKey, ...rest] = part.trim().split("=");
    if (rawKey === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

export function visitorFromRequest(request: Request): { visitorId: string; isNew: boolean } {
  const existing = readCookie(request, VISITOR_COOKIE);
  if (existing && /^[a-f0-9]{32}$/i.test(existing)) {
    return { visitorId: existing, isNew: false };
  }
  return { visitorId: newVisitorId(), isNew: true };
}

export function stampVisitorCookie(response: NextResponse, visitorId: string, isNew: boolean): NextResponse {
  if (!isNew) return response;
  response.cookies.set(VISITOR_COOKIE, visitorId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}

export async function recordPageview(request: Request, path: string): Promise<{ visitorId: string; isNew: boolean }> {
  const visitor = visitorFromRequest(request);
  if (!isBot(request.headers.get("user-agent"))) {
    await recordAnalyticsEvent({
      type: "pageview",
      visitorId: visitor.visitorId,
      path: normalizePath(path),
      at: new Date().toISOString(),
    });
  }
  return visitor;
}

export async function recordCalculatorRun(request: Request, tool: CalculatorTool): Promise<{ visitorId: string; isNew: boolean }> {
  const visitor = visitorFromRequest(request);
  if (!isBot(request.headers.get("user-agent"))) {
    await recordAnalyticsEvent({
      type: "run",
      visitorId: visitor.visitorId,
      tool,
      at: new Date().toISOString(),
    });
  }
  return visitor;
}

export async function withRunTracking(
  request: Request,
  tool: CalculatorTool,
  response: NextResponse,
): Promise<NextResponse> {
  try {
    const visitor = await recordCalculatorRun(request, tool);
    return stampVisitorCookie(response, visitor.visitorId, visitor.isNew);
  } catch {
    return response;
  }
}

export function jsonWithVisitor(
  body: unknown,
  visitor: { visitorId: string; isNew: boolean },
  init?: number | ResponseInit,
): NextResponse {
  const response = NextResponse.json(body, typeof init === "number" ? { status: init } : init);
  return stampVisitorCookie(response, visitor.visitorId, visitor.isNew);
}

export async function adminSessionFromCookies(): Promise<boolean> {
  const jar = await cookies();
  return verifyAdminSession(jar.get(ADMIN_COOKIE)?.value);
}

export async function adminSessionFromRequest(request: Request | NextRequest): Promise<boolean> {
  return verifyAdminSession(readCookie(request, ADMIN_COOKIE));
}

export function stampAdminAuthCookies(
  response: NextResponse,
  token: string,
  record?: StoredAdmin | null,
  persistence: AuthPersistence = "memory",
): NextResponse {
  response.cookies.set({
    ...adminCookieOptions,
    value: token,
  });
  if (record && !isDurableAuth(persistence)) {
    response.cookies.set({
      ...adminStoreCookieOptions,
      value: encodeAdminStore(record),
    });
    return response;
  }
  response.cookies.set({
    ...adminStoreCookieOptions,
    value: "",
    maxAge: 0,
  });
  return response;
}

export async function createLoginResponse(password: string): Promise<NextResponse> {
  const token = await authenticateAdmin(password);
  if (!token) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }
  const { record, persistence } = await loadStoredAdmin();
  return stampAdminAuthCookies(NextResponse.json({ ok: true }), token, record, persistence);
}

export function createLogoutResponse(): NextResponse {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    ...adminCookieOptions,
    value: "",
    maxAge: 0,
  });
  return response;
}
