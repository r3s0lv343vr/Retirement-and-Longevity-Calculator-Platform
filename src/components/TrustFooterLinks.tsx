import Link from "next/link";
import { TRUST_PAGES } from "@/lib/trust";

export function TrustFooterLinks() {
  return (
    <nav className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-paper/80" aria-label="About this site">
      {Object.values(TRUST_PAGES).map((page) => (
        <Link key={page.path} href={page.path} className="underline decoration-paper/30 underline-offset-2 hover:text-paper">
          {page.name}
        </Link>
      ))}
    </nav>
  );
}
