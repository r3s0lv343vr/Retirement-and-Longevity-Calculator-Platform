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
      className={`ad-slot flex min-h-[5.5rem] flex-col items-center justify-center rounded-xl border border-dashed border-pine/20 bg-white px-4 py-5 text-center ${className}`}
      aria-label={`Advertisement: ${slot.label}`}
      data-ad-placement={placement}
    >
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted">Advertisement</p>
      {client ? (
        <ins
          className="adsbygoogle block"
          style={{ display: "block", minWidth: Math.min(slot.width, 300), minHeight: Math.min(slot.height, 90) }}
          data-ad-client={client}
          data-ad-slot={placement}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : (
        <div className="mt-1 flex min-h-16 items-center justify-center px-2 text-pine/45">
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
