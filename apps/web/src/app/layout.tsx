import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
    process.env.NEXT_PUBLIC_SITE_URL || "https://app.vexogarage.co.uk",
  ),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
