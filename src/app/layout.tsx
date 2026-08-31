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
  title: {
    default: "Retirement and Longevity Calculators",
    template: "%s",
  },
  description:
    "Retirement and longevity calculators. How long savings last, how much nest egg you need, and when full-time work can end.",
  openGraph: {
    title: "Retirement and Longevity Calculators",
    description:
      "A small cluster of retirement calculators. The original longevity outlook is unchanged.",
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
