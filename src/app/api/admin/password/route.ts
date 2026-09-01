import { NextResponse } from "next/server";
import { adminSessionFromRequest } from "@/lib/admin/request";
import { authStatus, loadStoredAdmin, saveStoredAdmin, validateNewPassword, verifyPassword } from "@/lib/admin/credentials";

export async function POST(request: Request) {
  if (!(await adminSessionFromRequest(request))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const status = await authStatus();
  if (status.mode === "env") {
    return NextResponse.json(
      { error: "This host uses ADMIN_PASSWORD. Change it there, not in the dashboard." },
      { status: 400 },
    );
  }

  let current = "";
  let next = "";
  let confirm = "";
  try {
    const text = await request.text();
    if (text) {
      const body = JSON.parse(text) as { current?: string; next?: string; confirm?: string };
      current = typeof body.current === "string" ? body.current : "";
      next = typeof body.next === "string" ? body.next : "";
      confirm = typeof body.confirm === "string" ? body.confirm : "";
    }
  } catch {
    return NextResponse.json({ error: "Body must be JSON." }, { status: 400 });
  }

  if (!(await verifyPassword(current))) {
    return NextResponse.json({ error: "Current password is wrong." }, { status: 401 });
  }
  const invalid = validateNewPassword(next, confirm);
  if (invalid) {
    return NextResponse.json({ error: invalid }, { status: 400 });
  }

  const { record } = await loadStoredAdmin();
  await saveStoredAdmin(next, record);
  return NextResponse.json({ ok: true });
}
