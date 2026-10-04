import type { Metadata } from "next";
import { DesignEmbed } from "@/components/DesignEmbed";

export const metadata: Metadata = {
  title: 'Garages',
};

export default function Page() {
  return <DesignEmbed src='/design/pages/02.html' title='Garages' />;
}
