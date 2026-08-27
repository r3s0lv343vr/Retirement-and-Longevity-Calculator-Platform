export type AdPlacement =
  | "header-leaderboard"
  | "after-intro"
  | "sidebar"
  | "sidebar-2"
  | "form-break-1"
  | "form-break-2"
  | "form-break-3"
  | "form-break-4"
  | "mid-form"
  | "pre-outlook"
  | "after-stats"
  | "in-outlook"
  | "after-chart"
  | "after-comparison"
  | "footer"
  | "footer-2";

export const AD_SLOTS: Record<
  AdPlacement,
  { label: string; size: string; width: number; height: number }
> = {
  "header-leaderboard": { label: "Top banner", size: "970 × 250", width: 970, height: 250 },
  "after-intro": { label: "Below intro", size: "728 × 90", width: 728, height: 90 },
  sidebar: { label: "Sidebar", size: "160 × 600", width: 160, height: 600 },
  "sidebar-2": { label: "Sidebar", size: "160 × 600", width: 160, height: 600 },
  "form-break-1": { label: "In-content", size: "728 × 90", width: 728, height: 90 },
  "form-break-2": { label: "In-content", size: "300 × 250", width: 300, height: 250 },
  "form-break-3": { label: "In-content", size: "728 × 90", width: 728, height: 90 },
  "form-break-4": { label: "In-content", size: "300 × 250", width: 300, height: 250 },
  "mid-form": { label: "In-content", size: "336 × 280", width: 336, height: 280 },
  "pre-outlook": { label: "Before results", size: "728 × 90", width: 728, height: 90 },
  "after-stats": { label: "In results", size: "728 × 90", width: 728, height: 90 },
  "in-outlook": { label: "In results", size: "300 × 250", width: 300, height: 250 },
  "after-chart": { label: "In results", size: "728 × 90", width: 728, height: 90 },
  "after-comparison": { label: "In results", size: "300 × 250", width: 300, height: 250 },
  footer: { label: "Footer banner", size: "728 × 90", width: 728, height: 90 },
  "footer-2": { label: "Footer", size: "300 × 250", width: 300, height: 250 },
};
