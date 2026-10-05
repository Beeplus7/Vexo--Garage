import type { Metadata } from "next";
import { DesignEmbed } from "@/components/DesignEmbed";
import { designSrc } from "@/lib/design-catalog";

export const metadata: Metadata = {
  title: "Contact",
};

export default function Page() {
  return <DesignEmbed src={designSrc(25)} title="Contact" />;
}
