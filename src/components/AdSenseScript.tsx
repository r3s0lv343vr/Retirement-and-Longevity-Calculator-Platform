"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { adsensePublisherId } from "@/lib/ads";

export function AdSenseScript() {
  const pathname = usePathname();
  const client = adsensePublisherId();
  if (!client || pathname?.startsWith("/admin")) return null;
  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
