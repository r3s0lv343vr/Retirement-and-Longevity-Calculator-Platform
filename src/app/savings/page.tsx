import { CategoryHub } from "@/components/CategoryHub";
import { journeyByPath } from "@/lib/journeys";
import { SITE_URL } from "@/lib/seo";
import type { Metadata } from "next";

const journey = journeyByPath("/savings")!;

export const metadata: Metadata = {
  title: "Building Savings – Goal Survival Calculator | Runaway Finance",
  description:
    "See whether competing expenses could force a dip into money set aside for a goal, then link to home, family and retirement decisions.",
  alternates: { canonical: `${SITE_URL}/savings` },
};

export default function SavingsPage() {
  return <CategoryHub journey={journey} />;
}
