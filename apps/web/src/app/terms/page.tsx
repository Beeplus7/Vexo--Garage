import type { Metadata } from "next";
import { DesignEmbed } from "@/components/DesignEmbed";

export const metadata: Metadata = {
  title: 'Terms',
};

export default function Page() {
  return <DesignEmbed src='/design/pages/23.html' title='Terms' />;
}
