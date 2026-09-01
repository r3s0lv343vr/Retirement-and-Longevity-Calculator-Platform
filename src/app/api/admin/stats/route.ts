import { NextResponse } from "next/server";
import { adminSessionFromRequest } from "@/lib/admin/request";
import { readAnalyticsSnapshot } from "@/lib/admin/store";
import { authStatus } from "@/lib/admin/credentials";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await adminSessionFromRequest(request))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const stats = await readAnalyticsSnapshot();
  const auth = await authStatus();
  return NextResponse.json({
    stats,
    adsLive: Boolean(process.env.NEXT_PUBLIC_ADSENSE_CLIENT),
    auth,
  });
}
