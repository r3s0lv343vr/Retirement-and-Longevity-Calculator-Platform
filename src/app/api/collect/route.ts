import { NextResponse } from "next/server";
import { jsonWithVisitor, recordPageview } from "@/lib/admin/request";

export async function POST(request: Request) {
  let path = "/";
  try {
    const text = await request.text();
    if (text) {
      const body = JSON.parse(text) as { path?: string };
      if (typeof body.path === "string") path = body.path;
    }
  } catch {
    return NextResponse.json({ error: "Body must be JSON." }, { status: 400 });
  }

  if (path.startsWith("/admin") || path.startsWith("/api")) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  try {
    const visitor = await recordPageview(request, path);
    return jsonWithVisitor({ ok: true }, visitor);
  } catch {
    return NextResponse.json({ ok: true, skipped: true });
  }
}
