import type { Metadata } from "next";
import { DesignEmbed } from "@/components/DesignEmbed";
import { designSrc } from "@/lib/design-catalog";

export const metadata: Metadata = {
  title: "Final site map (internal)",
};

/** Design 38 — production checklist / complete site map. Not linked for users. */
export default function FinalMapPage() {
  return <DesignEmbed src={designSrc(38)} title="Final site map 38 of 38" />;
}
