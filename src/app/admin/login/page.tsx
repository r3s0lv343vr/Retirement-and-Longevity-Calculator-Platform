import { AdminLoginForm } from "@/components/AdminLoginForm";

export default function AdminLoginPage() {
  const hint =
    process.env.NODE_ENV === "production"
      ? process.env.ADMIN_PASSWORD
        ? null
        : "Set ADMIN_PASSWORD in the hosting environment, then reload."
      : process.env.ADMIN_PASSWORD
        ? null
        : "Local default password is dev-admin. Set ADMIN_PASSWORD to override.";

  return (
    <main className="mx-auto max-w-5xl px-5 pb-16 sm:px-6">
      <AdminLoginForm hint={hint} />
    </main>
  );
}
