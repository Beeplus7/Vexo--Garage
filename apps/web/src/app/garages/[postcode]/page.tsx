import type { Metadata } from "next";
import { GarageFinder } from "@/components/GarageFinder";

export const metadata: Metadata = {
  title: "Garages by postcode",
};

export default async function Page({
  params,
}: {
  params: Promise<{ postcode: string }>;
}) {
  const { postcode } = await params;
  const decoded = decodeURIComponent(postcode || "OL8 4");
  return (
    <GarageFinder initialPostcode={decoded} initialService="MOT" />
  );
}
