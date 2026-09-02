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
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-1 px-4 py-4 sm:gap-1.5 sm:px-6 sm:py-5">
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
                  ? "min-h-[84px] gap-4 px-2.5 py-1.5 font-serif text-xl sm:min-h-24 sm:px-3 sm:text-2xl"
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
                  width={96}
                  height={96}
                  className="h-[84px] w-[84px] shrink-0 bg-paper sm:h-24 sm:w-24"
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
