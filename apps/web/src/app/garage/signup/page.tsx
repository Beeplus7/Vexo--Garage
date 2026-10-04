import type { Metadata } from "next";
import { DesignEmbed } from "@/components/DesignEmbed";

export const metadata: Metadata = {
  title: 'Garage signup',
};

export default function Page() {
  return <DesignEmbed src='/design/pages/32.html' title='Garage signup' />;
}
