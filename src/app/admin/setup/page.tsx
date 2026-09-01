import { redirect } from "next/navigation";
import { AdminSetupForm } from "@/components/AdminSetupForm";
import { needsSetup } from "@/lib/admin/credentials";

export const dynamic = "force-dynamic";

export default async function AdminSetupPage() {
  if (!(await needsSetup())) {
    redirect("/admin/login");
  }

  return (
    <main className="mx-auto max-w-5xl px-5 pb-16 sm:px-6">
      <AdminSetupForm />
    </main>
  );
}
