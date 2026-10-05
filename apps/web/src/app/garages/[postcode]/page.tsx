import type { Metadata } from "next";
import { DesignEmbed } from "@/components/DesignEmbed";
import { designSrc } from "@/lib/design-catalog";

export const metadata: Metadata = {
  title: "Garages by postcode",
};

export default async function Page({
  params,
}: {
  params: Promise<Record<string, string>>;
}) {
  await params;
  return <DesignEmbed src={designSrc(15)} title="Garages by postcode" />;
}
