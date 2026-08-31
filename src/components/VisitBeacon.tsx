"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function VisitBeacon() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/api")) return;
    const body = JSON.stringify({ path: pathname });
    const send = () => {
      try {
        if (navigator.sendBeacon) {
          navigator.sendBeacon("/api/collect", new Blob([body], { type: "application/json" }));
          return;
        }
      } catch {
        /* fall through */
      }
      void fetch("/api/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      });
    };
    send();
  }, [pathname]);

  return null;
}
