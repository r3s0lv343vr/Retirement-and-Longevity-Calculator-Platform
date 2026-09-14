import { CategoryHub } from "@/components/CategoryHub";
import { journeyByPath } from "@/lib/journeys";
import { SITE_URL } from "@/lib/seo";
import type { Metadata } from "next";

const journey = journeyByPath("/family")!;

export const metadata: Metadata = {
  title: "Growing a Family – Child Cost Calculators | Runaway Finance",
  description:
    "See what having a child could do to household finances. Plan living, school and university nest eggs, then link to home and savings decisions.",
  alternates: { canonical: `${SITE_URL}/family` },
};

export default function FamilyPage() {
  return <CategoryHub journey={journey} />;
}
