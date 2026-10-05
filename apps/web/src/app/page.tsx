import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DesignEmbed } from "@/components/DesignEmbed";
import { designSrc, isMarketingHost } from "@/lib/design-catalog";

export const metadata: Metadata = {
  title: "Vexo Garage",
  description: "Your car. Your service. Your choice.",
};

/**
 * Marketing apex → hero (01).
 * App host → real product entry (/garages), not design 38 checklist/sitemap.
 */
export default async function Page() {
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "";

  if (!isMarketingHost(host)) {
    redirect("/garages");
  }

  return <DesignEmbed src={designSrc(1)} title="Hero marketing" />;
}
