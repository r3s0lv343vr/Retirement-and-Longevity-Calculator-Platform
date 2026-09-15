import Link from "next/link";
import { HUB_NAME } from "@/lib/brand";
import { NAV_LINKS, navHrefForCurrent, type NavHref } from "@/lib/journeys";

export function ClusterNav({ current }: { current: string }) {
  const activeHref: NavHref = navHrefForCurrent(current);
  return (
    <>
      <nav className="relative z-20 overflow-visible border-b border-pine/20 bg-pine text-paper" aria-label="Family finance">
        <div className="mx-auto flex max-w-5xl items-start gap-1 px-4 pt-3 pb-2 sm:items-end sm:gap-1.5 sm:px-6 sm:pt-3.5 sm:pb-2.5">
          <Link href="/" className="relative z-30 -mb-4 mr-3 shrink-0 sm:-mb-5 sm:mr-4" aria-label={HUB_NAME}>
            <img
              src="/rf-mark.png"
              alt=""
              width={96}
              height={96}
              className="h-[84px] w-[84px] bg-paper shadow-[0_2px_8px_rgba(20,34,28,0.18)] sm:h-24 sm:w-24"
            />
          </Link>
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1 sm:gap-1.5">
            {NAV_LINKS.map((link) => {
              const active = activeHref === link.href;
              const home = link.href === "/";
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "inline-flex min-h-11 items-center rounded-md px-2.5 py-2 text-sm leading-snug sm:min-h-12 sm:px-3 sm:text-base",
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
        </div>
      </nav>
      <div aria-hidden className="h-4 sm:h-5" />
    </>
  );
}
