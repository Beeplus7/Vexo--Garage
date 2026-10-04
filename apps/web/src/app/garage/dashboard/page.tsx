import type { Metadata } from "next";
import { DesignEmbed } from "@/components/DesignEmbed";

export const metadata: Metadata = {
  title: 'Garage dashboard',
};

export default function Page() {
  return <DesignEmbed src='/design/pages/33.html' title='Garage dashboard' />;
}
