import type { Metadata } from "next";
import { DesignEmbed } from "@/components/DesignEmbed";
import { designSrc } from "@/lib/design-catalog";

export const metadata: Metadata = {
  title: "How it works",
};

export default function Page() {
  return <DesignEmbed src={designSrc(8)} title="How it works" />;
}
