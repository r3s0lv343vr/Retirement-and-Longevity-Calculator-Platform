import { NextResponse } from "next/server";
import { adminSessionFromRequest } from "@/lib/admin/request";
import { readAnalyticsSnapshot } from "@/lib/admin/store";
import { adminPassword } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!adminSessionFromRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const stats = await readAnalyticsSnapshot();
  return NextResponse.json({
    stats,
    adsLive: Boolean(process.env.NEXT_PUBLIC_ADSENSE_CLIENT),
    passwordConfigured: Boolean(process.env.ADMIN_PASSWORD || process.env.NODE_ENV !== "production"),
    usingEnvPassword: Boolean(process.env.ADMIN_PASSWORD),
    adminReady: Boolean(adminPassword()),
  });
}
