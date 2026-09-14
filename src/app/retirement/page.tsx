import { CategoryHub } from "@/components/CategoryHub";
import { journeyByPath } from "@/lib/journeys";
import { SITE_URL } from "@/lib/seo";
import type { Metadata } from "next";

const journey = journeyByPath("/retirement")!;

export const metadata: Metadata = {
  title: "Planning Retirement – Longevity, Need & Claiming | Runaway Finance",
  description:
    "When can you stop working, how much do you need, how long will savings last, and should you claim Social Security at 67 or 70?",
  robots: { index: false, follow: false },
  alternates: { canonical: `${SITE_URL}/retirement` },
};

export default function RetirementPage() {
  return <CategoryHub journey={journey} />;
}
