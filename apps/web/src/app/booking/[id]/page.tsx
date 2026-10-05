import type { Metadata } from "next";
import { BookingDetail } from "@/components/BookingDetail";

export const metadata: Metadata = {
  title: "Booking detail",
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BookingDetail bookingId={id} />;
}
