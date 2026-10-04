import type { Metadata } from "next";
import { DesignEmbed } from "@/components/DesignEmbed";

export const metadata: Metadata = {
  title: 'Contact',
};

export default function Page() {
  return <DesignEmbed src='/design/pages/25.html' title='Contact' />;
}
