"use client";

import { useEffect, useRef } from "react";
import { AD_SLOTS, adsensePublisherId, adsenseSlotId, type AdPlacement } from "@/lib/ads";

type Props = {
  placement: AdPlacement;
  className?: string;
};

export function AdSlot({ placement, className = "" }: Props) {
  const slot = AD_SLOTS[placement];
  const client = adsensePublisherId();
  const unit = adsenseSlotId();
  const pushed = useRef(false);

  useEffect(() => {
    if (!client || pushed.current) return;
    try {
      const win = window as unknown as { adsbygoogle?: unknown[] };
      win.adsbygoogle = win.adsbygoogle || [];
      win.adsbygoogle.push({});
      pushed.current = true;
    } catch {
      /* AdSense script may not be ready yet */
    }
  }, [client]);

  if (!client) return null;

  return (
    <aside
      className={`ad-slot flex w-full flex-col items-center justify-center ${className}`}
      aria-label={`Advertisement: ${slot.label}`}
      data-ad-placement={placement}
    >
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted">Advertisement</p>
      <ins
        className="adsbygoogle block w-full"
        style={{ display: "block", minWidth: slot.width, minHeight: slot.height }}
        data-ad-client={client}
        data-ad-slot={unit ?? undefined}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}

export function AdSidebar() {
  if (!adsensePublisherId()) return null;
  return (
    <div className="hidden min-w-0 xl:block">
      <div className="sticky top-6 space-y-4">
        <AdSlot placement="sidebar" />
        <AdSlot placement="sidebar-2" />
        <AdSlot placement="sidebar-3" />
      </div>
    </div>
  );
}
