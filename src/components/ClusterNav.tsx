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
    <>
    <nav className="relative z-20 overflow-visible border-b border-pine/20 bg-pine text-paper" aria-label="Calculators">
      <div className="mx-auto flex max-w-5xl flex-wrap items-end gap-1 px-4 pt-3 pb-2 sm:gap-1.5 sm:px-6 sm:pt-3.5 sm:pb-2.5">
        <Link href="/" className="relative z-30 -mb-4 mr-4 shrink-0 sm:-mb-5 sm:mr-5" aria-label={HUB_NAME}>
          <img
            src="/rf-mark.png"
            alt=""
            width={96}
            height={96}
            className="h-[84px] w-[84px] bg-paper shadow-[0_2px_8px_rgba(20,34,28,0.18)] sm:h-24 sm:w-24"
          />
        </Link>
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
                home ? "font-serif" : null,
                active
                  ? "bg-paper/15 font-semibold text-paper"
                  : "text-paper/85 transition hover:bg-paper/10 hover:text-paper",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
    <div aria-hidden className="h-4 sm:h-5" />
    </>
  );
}
