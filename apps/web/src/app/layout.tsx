import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { APP_URL, MARKETING_URL } from "@/lib/site-urls";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Vexo Garage",
    template: "%s · Vexo Garage",
  },
  description:
    "Your car. Your service. Your choice. — MOT, service bookings, video Shield proof, and Passport history.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || MARKETING_URL || APP_URL,
  ),
  alternates: {
    canonical: MARKETING_URL,
  },
  openGraph: {
    siteName: "Vexo Garage",
    type: "website",
    locale: "en_GB",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-GB"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
