import { CategoryHub } from "@/components/CategoryHub";
import { journeyByPath } from "@/lib/journeys";
import { SITE_URL } from "@/lib/seo";
import type { Metadata } from "next";

const journey = journeyByPath("/home")!;

export const metadata: Metadata = {
  title: "Buying a Home – Mortgage & Ownership Cost | Runaway Finance",
  description:
    "See what a house really costs once tax, insurance and life sit beside the payment, and how extra payments can retire the loan sooner.",
  alternates: { canonical: `${SITE_URL}/home` },
};

export default function HomeJourneyPage() {
  return <CategoryHub journey={journey} />;
}
