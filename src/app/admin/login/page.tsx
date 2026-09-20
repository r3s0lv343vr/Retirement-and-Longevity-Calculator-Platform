import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/AdminLoginForm";
import { authStatus, needsSetup } from "@/lib/admin/credentials";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await needsSetup()) {
    redirect("/admin/setup");
  }

  const status = await authStatus();
  const hint =
    status.persistence === "browser"
      ? "Use the password you created in this browser. This host is not keeping .data/admin.json, so a hashed verifier is kept here for 7 days — not the password itself."
      : "Use the password you created on this server. You can change it after you sign in.";

  return (
    <main className="mx-auto max-w-5xl px-5 pb-16 sm:px-6">
      <AdminLoginForm hint={hint} />
    </main>
  );
}
