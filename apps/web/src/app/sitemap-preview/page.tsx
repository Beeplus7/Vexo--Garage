import type { Metadata } from "next";
import { DesignEmbed } from "@/components/DesignEmbed";

export const metadata: Metadata = {
  title: 'Sitemap preview',
};

export default function Page() {
  return <DesignEmbed src='/design/pages/36.html' title='Sitemap preview' />;
}
