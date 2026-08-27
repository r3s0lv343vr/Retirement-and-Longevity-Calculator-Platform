export type AdPlacement =
  | "header-leaderboard"
  | "sidebar"
  | "mid-form"
  | "pre-outlook"
  | "in-outlook"
  | "footer";

export const AD_SLOTS: Record<
  AdPlacement,
  { label: string; size: string; width: number; height: number }
> = {
  "header-leaderboard": { label: "Top banner", size: "728 × 90", width: 728, height: 90 },
  sidebar: { label: "Sidebar", size: "160 × 600", width: 160, height: 600 },
  "mid-form": { label: "In-content", size: "300 × 250", width: 300, height: 250 },
  "pre-outlook": { label: "Before results", size: "728 × 90", width: 728, height: 90 },
  "in-outlook": { label: "In results", size: "300 × 250", width: 300, height: 250 },
  footer: { label: "Footer banner", size: "728 × 90", width: 728, height: 90 },
};
