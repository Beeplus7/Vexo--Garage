import type { Metadata } from "next";
import { DesignEmbed } from "@/components/DesignEmbed";

export const metadata: Metadata = {
  title: 'Terms & privacy',
};

export default function Page() {
  return <DesignEmbed src='/design/pages/35.html' title='Terms & privacy' />;
}
