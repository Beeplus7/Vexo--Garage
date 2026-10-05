import type { Metadata } from "next";
import { DesignEmbed } from "@/components/DesignEmbed";
import { designSrc } from "@/lib/design-catalog";

export const metadata: Metadata = {
  title: "For garages",
};

export default function Page() {
  return <DesignEmbed src={designSrc(11)} title="For garages" />;
}
