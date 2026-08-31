import { NextResponse } from "next/server";
import { adminSessionFromRequest, createLoginResponse } from "@/lib/admin/request";
import { adminPassword } from "@/lib/admin/session";

const attempts = new Map<string, { count: number; resetAt: number }>();

function clientKey(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

function tooMany(key: string): boolean {
  const now = Date.now();
  const row = attempts.get(key);
  if (!row || row.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return false;
  }
  row.count += 1;
  return row.count > 8;
}

export async function POST(request: Request) {
  if (!adminPassword()) {
    return NextResponse.json({ error: "Set ADMIN_PASSWORD to enable the admin." }, { status: 503 });
  }
  if (tooMany(clientKey(request))) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  let password = "";
  try {
    const text = await request.text();
    if (text) {
      const body = JSON.parse(text) as { password?: string };
      password = typeof body.password === "string" ? body.password : "";
    }
  } catch {
    return NextResponse.json({ error: "Body must be JSON." }, { status: 400 });
  }

  return createLoginResponse(password);
}

export async function GET(request: Request) {
  return NextResponse.json({ ok: adminSessionFromRequest(request) });
}
