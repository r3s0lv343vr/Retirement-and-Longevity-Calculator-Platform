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
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-1 px-4 py-3 sm:gap-1.5 sm:px-6 sm:py-3.5">
        {LINKS.map((link) => {
          const active = current === link.href;
          const home = link.href === "/";
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={[
                "inline-flex min-h-11 items-center rounded-md px-3 py-2 text-base leading-snug sm:min-h-12 sm:px-3.5 sm:text-lg",
                home ? "gap-2 font-serif" : null,
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
                  width={40}
                  height={40}
                  className="h-9 w-9 shrink-0 rounded-[2px] bg-paper sm:h-10 sm:w-10"
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
