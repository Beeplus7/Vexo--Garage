import type { Metadata } from "next";
import { DesignEmbed } from "@/components/DesignEmbed";

export const metadata: Metadata = {
  title: 'Passport info',
};

export default function Page() {
  return <DesignEmbed src='/design/pages/05.html' title='Passport info' />;
}
