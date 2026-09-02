import Link from "next/link";
import { HUB_NAME } from "@/lib/brand";
import type { TrustPath } from "@/lib/trust";

const LINKS = [
  { href: "/", label: HUB_NAME },
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
  current: "/" | "/longevity" | "/need" | "/when" | "/claim" | "/housing" | "/child" | "/goal" | TrustPath;
}) {
  return (
    <nav className="border-b border-pine/20 bg-pine text-paper" aria-label="Calculators">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-1 px-4 py-3.5 sm:gap-1.5 sm:px-6 sm:py-4">
        {LINKS.map((link) => {
          const active = current === link.href;
          const home = link.href === "/";
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={[
                "inline-flex items-center rounded-md leading-snug",
                home
                  ? "min-h-14 gap-3 px-2.5 py-1.5 font-serif text-lg sm:min-h-16 sm:px-3 sm:text-xl"
                  : "min-h-11 px-3 py-2 text-base sm:min-h-12 sm:px-3.5 sm:text-lg",
                active
                  ? "bg-paper/15 font-semibold text-paper"
                  : "text-paper/85 transition hover:bg-paper/10 hover:text-paper",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {home ? (
                <img
                  src="/rf-mark.png"
                  alt=""
                  width={64}
                  height={64}
                  className="h-14 w-14 shrink-0 bg-paper sm:h-16 sm:w-16"
                />
              ) : null}
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
