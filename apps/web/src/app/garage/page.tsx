import type { Metadata } from "next";
import { DesignEmbed } from "@/components/DesignEmbed";

export const metadata: Metadata = {
  title: 'For garages',
};

export default function Page() {
  return <DesignEmbed src='/design/pages/11.html' title='For garages' />;
}
