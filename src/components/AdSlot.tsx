import { AD_SLOTS, type AdPlacement } from "@/lib/ads";

type Props = {
  placement: AdPlacement;
  className?: string;
};

export function AdSlot({ placement, className = "" }: Props) {
  const slot = AD_SLOTS[placement];
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  return (
    <aside
      className={`ad-slot flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-pine/20 bg-white px-3 py-3 text-center ${className}`}
      aria-label={`Advertisement: ${slot.label}`}
      data-ad-placement={placement}
      style={{ minHeight: slot.height }}
    >
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted">Advertisement</p>
      {client ? (
        <ins
          className="adsbygoogle block w-full"
          style={{ display: "block", minWidth: slot.width, minHeight: slot.height }}
          data-ad-client={client}
          data-ad-slot={placement}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : (
        <div
          className="mt-1 flex w-full max-w-full items-center justify-center text-pine/45"
          style={{ minHeight: Math.max(slot.height - 36, 48) }}
        >
          <span className="text-xs">
            {slot.label}
            <span className="mx-1 text-muted/60">·</span>
            {slot.size}
          </span>
        </div>
      )}
    </aside>
  );
}
