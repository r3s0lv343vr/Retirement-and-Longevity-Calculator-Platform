import type { Metadata } from "next";
import { DM_Sans, Source_Serif_4 } from "next/font/google";
import { VisitBeacon } from "@/components/VisitBeacon";
import { HUB_TITLE } from "@/lib/brand";
import { HUB_SEO_DESCRIPTION, HUB_SEO_TITLE, SITE_URL } from "@/lib/seo";
import "./globals.css";

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: HUB_SEO_TITLE,
    template: "%s",
  },
  description: HUB_SEO_DESCRIPTION,
  openGraph: {
    title: HUB_SEO_TITLE,
    description: HUB_SEO_DESCRIPTION,
    type: "website",
    siteName: HUB_TITLE,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${serif.variable} font-sans antialiased`}>
        {children}
        <VisitBeacon />
      </body>
    </html>
  );
}
