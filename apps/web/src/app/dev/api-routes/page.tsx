import type { Metadata } from "next";
import { DesignEmbed } from "@/components/DesignEmbed";
import { designSrc } from "@/lib/design-catalog";

export const metadata: Metadata = {
  title: "API routes map",
};

export default function Page() {
  return <DesignEmbed src={designSrc(37)} title="API routes map" />;
}
