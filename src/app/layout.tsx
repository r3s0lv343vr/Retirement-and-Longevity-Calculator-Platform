import type { Metadata } from "next";
import { DM_Sans, Source_Serif_4 } from "next/font/google";
import { VisitBeacon } from "@/components/VisitBeacon";
import { HUB_BLURB, HUB_TITLE } from "@/lib/brand";
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
  title: {
    default: HUB_TITLE,
    template: "%s",
  },
  description: HUB_BLURB,
  openGraph: {
    title: HUB_TITLE,
    description: HUB_BLURB,
    type: "website",
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
