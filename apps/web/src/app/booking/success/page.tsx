import type { Metadata } from "next";
import Link from "next/link";
import { DesignEmbed } from "@/components/DesignEmbed";
import { designSrc } from "@/lib/design-catalog";
import { SessionConfirm } from "./session-confirm";

export const metadata: Metadata = {
  title: "Booking success",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;

  if (!sessionId) {
    return <DesignEmbed src={designSrc(28)} title="Booking success" />;
  }

  return (
    <main className="min-h-[100dvh] bg-[#FFF4EC] text-[#4A2C14]">
      <div className="mx-auto max-w-lg px-6 py-12">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF6B00]">
          Vexo Garage
        </p>
        <h1 className="mt-3 text-3xl font-extrabold">Payment held</h1>
        <p className="mt-2 text-sm leading-6 text-[#4A2C14]/80">
          Checkout complete. Funds stay in escrow until Shield video proof and your
          approve.
        </p>
        <SessionConfirm sessionId={sessionId} />
        <Link
          href="/"
          className="mt-8 inline-block text-sm font-semibold text-[#4A2C14]/70"
        >
          ← Back home
        </Link>
      </div>
    </main>
  );
}
