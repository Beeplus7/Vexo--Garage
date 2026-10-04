import type { Metadata } from "next";
import { DesignEmbed } from "@/components/DesignEmbed";

export const metadata: Metadata = {
  title: 'Embed widget',
};

type Props = { params: Promise<Record<string, string>> };

export default async function Page({ params }: Props) {
  await params;
  return <DesignEmbed src='/design/pages/31.html' title='Embed widget' />;
}
