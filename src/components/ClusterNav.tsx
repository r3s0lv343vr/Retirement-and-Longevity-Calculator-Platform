import Link from "next/link";

const LINKS = [
  { href: "/", label: "Runaway Finances" },
  { href: "/longevity", label: "How long" },
  { href: "/need", label: "How much" },
  { href: "/when", label: "When" },
  { href: "/claim", label: "67 vs 70" },
  { href: "/housing", label: "Housing" },
  { href: "/child", label: "Child" },
  { href: "/goal", label: "Goal" },
] as const;

export function ClusterNav({
  current,
}: {
  current: "/" | "/longevity" | "/need" | "/when" | "/claim" | "/housing" | "/child" | "/goal";
}) {
  return (
    <nav className="border-b border-pine/10 bg-pine text-paper" aria-label="Calculators">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-5 gap-y-2 px-5 py-2 text-sm sm:px-6">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={current === link.href ? "page" : undefined}
            className={
              current === link.href ? "font-semibold text-paper" : "text-paper/75 transition hover:text-paper"
            }
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
