import type { Metadata } from "next";
import { DesignEmbed } from "@/components/DesignEmbed";

export const metadata: Metadata = {
  title: 'Reviews',
};

export default function Page() {
  return <DesignEmbed src='/design/pages/26.html' title='Reviews' />;
}
