import type { Metadata } from "next";
import { headers } from "next/headers";
import { DesignEmbed } from "@/components/DesignEmbed";
import { designSrc, isMarketingHost } from "@/lib/design-catalog";

export const metadata: Metadata = {
  title: "Vexo Garage",
  description: "Your car. Your service. Your choice.",
};

/** Marketing apex → hero (01). App host → final finder home (38). */
export default async function Page() {
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "";
  const marketing = isMarketingHost(host);
  const design = marketing ? 1 : 38;
  const title = marketing ? "Hero marketing" : "App home";

  return <DesignEmbed src={designSrc(design)} title={title} />;
}
