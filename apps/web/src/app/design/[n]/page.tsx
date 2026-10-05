import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DesignEmbed } from "@/components/DesignEmbed";
import { designSrc } from "@/lib/design-catalog";

type Props = { params: Promise<{ n: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { n } = await params;
  return { title: `Design ${n.padStart(2, "0")}` };
}

/** Archive viewer for any of the 38 design HTML files (incl. superseded). */
export default async function DesignPage({ params }: Props) {
  const { n } = await params;
  const num = Number(n);
  if (!Number.isInteger(num) || num < 1 || num > 38) notFound();
  return (
    <DesignEmbed src={designSrc(num)} title={`Design ${String(num).padStart(2, "0")}`} />
  );
}
