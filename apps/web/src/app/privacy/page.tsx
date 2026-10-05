import type { Metadata } from "next";
import { DesignEmbed } from "@/components/DesignEmbed";
import { designSrc } from "@/lib/design-catalog";

export const metadata: Metadata = {
  title: "Privacy",
};

export default function Page() {
  return <DesignEmbed src={designSrc(24)} title="Privacy" />;
}
