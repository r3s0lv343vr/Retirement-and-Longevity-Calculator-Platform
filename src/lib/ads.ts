export type AdPlacement =
  | "header-leaderboard"
  | "after-intro"
  | "sidebar"
  | "sidebar-2"
  | "sidebar-3"
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
  "sidebar-3": { label: "Sidebar", size: "160 × 600", width: 160, height: 600 },
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

/** Where each live slot actually appears. Keep in step with the public pages. */
export const AD_SLOT_USAGE: { placement: AdPlacement; where: string }[] = [
  { placement: "header-leaderboard", where: "Hub and every calculator" },
  { placement: "footer", where: "Hub and every calculator" },
  { placement: "footer-2", where: "Hub and every calculator" },
  { placement: "after-intro", where: "Every calculator" },
  { placement: "form-break-1", where: "Every calculator form" },
  { placement: "form-break-2", where: "How long form · Child form" },
  { placement: "form-break-3", where: "How long form" },
  { placement: "form-break-4", where: "How long form" },
  { placement: "mid-form", where: "Every calculator" },
  { placement: "pre-outlook", where: "Every calculator" },
  { placement: "after-stats", where: "Every calculator results" },
  { placement: "in-outlook", where: "How long outlook" },
  { placement: "after-chart", where: "How long outlook" },
  { placement: "after-comparison", where: "How long outlook" },
  { placement: "sidebar", where: "Every calculator" },
  { placement: "sidebar-2", where: "Every calculator" },
  { placement: "sidebar-3", where: "Every calculator" },
];

export function adsensePublisherId(raw = process.env.NEXT_PUBLIC_ADSENSE_CLIENT): string | null {
  const value = raw?.trim() ?? "";
  return /^ca-pub-\d{9,22}$/.test(value) ? value : null;
}

export function adsenseSlotId(raw = process.env.NEXT_PUBLIC_ADSENSE_SLOT): string | null {
  const value = raw?.trim() ?? "";
  return /^\d{6,16}$/.test(value) ? value : null;
}
