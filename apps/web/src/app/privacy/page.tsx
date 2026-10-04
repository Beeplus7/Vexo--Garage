import type { Metadata } from "next";
import { DesignEmbed } from "@/components/DesignEmbed";

export const metadata: Metadata = {
  title: 'Privacy',
};

export default function Page() {
  return <DesignEmbed src='/design/pages/24.html' title='Privacy' />;
}
