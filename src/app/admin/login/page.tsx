import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/AdminLoginForm";
import { needsSetup } from "@/lib/admin/credentials";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await needsSetup()) {
    redirect("/admin/setup");
  }

  return (
    <main className="mx-auto max-w-5xl px-5 pb-16 sm:px-6">
      <AdminLoginForm hint="Use the password you created on this server. You can change it after you sign in." />
    </main>
  );
}
