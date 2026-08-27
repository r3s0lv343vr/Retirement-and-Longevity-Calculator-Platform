import type { Metadata } from "next";
import { DM_Sans, Source_Serif_4 } from "next/font/google";
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
  title: "How Long Before I Go Broke Calculator",
  description:
    "Retirement and Longevity Calculator. Find out if your savings will last while accounting for healthcare inflation, lifestyle phases, and part-time work.",
  openGraph: {
    title: "How Long Before I Go Broke Calculator",
    description:
      "Retirement and Longevity Calculator that does not assume a straight line of spending.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${serif.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
