import { NextResponse } from "next/server";
import { needsSetup, saveStoredAdmin, validateNewPassword } from "@/lib/admin/credentials";
import { signAdminSession, adminCookieOptions } from "@/lib/admin/session";

export async function POST(request: Request) {
  if (!(await needsSetup())) {
    return NextResponse.json({ error: "An admin password is already set." }, { status: 409 });
  }

  let password = "";
  let confirm = "";
  try {
    const text = await request.text();
    if (text) {
      const body = JSON.parse(text) as { password?: string; confirm?: string };
      password = typeof body.password === "string" ? body.password : "";
      confirm = typeof body.confirm === "string" ? body.confirm : "";
    }
  } catch {
    return NextResponse.json({ error: "Body must be JSON." }, { status: 400 });
  }

  const invalid = validateNewPassword(password, confirm);
  if (invalid) {
    return NextResponse.json({ error: invalid }, { status: 400 });
  }

  await saveStoredAdmin(password);
  const token = await signAdminSession();
  if (!token) {
    return NextResponse.json({ error: "Could not start a session." }, { status: 500 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    ...adminCookieOptions,
    value: token,
  });
  return response;
}
