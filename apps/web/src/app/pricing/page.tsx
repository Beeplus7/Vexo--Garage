import type { Metadata } from "next";
import { DesignEmbed } from "@/components/DesignEmbed";

export const metadata: Metadata = {
  title: 'Pricing',
};

export default function Page() {
  return <DesignEmbed src='/design/pages/10.html' title='Pricing' />;
}
