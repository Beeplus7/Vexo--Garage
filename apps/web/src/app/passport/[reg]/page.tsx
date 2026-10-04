import type { Metadata } from "next";
import { DesignEmbed } from "@/components/DesignEmbed";

export const metadata: Metadata = {
  title: 'Passport',
};

type Props = { params: Promise<Record<string, string>> };

export default async function Page({ params }: Props) {
  await params;
  return <DesignEmbed src='/design/pages/30.html' title='Passport' />;
}
