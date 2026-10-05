import type { Metadata } from "next";
import { DesignEmbed } from "@/components/DesignEmbed";
import { designSrc } from "@/lib/design-catalog";

export const metadata: Metadata = {
  title: "Services",
};

export default function Page() {
  return <DesignEmbed src={designSrc(27)} title="Services" />;
}
