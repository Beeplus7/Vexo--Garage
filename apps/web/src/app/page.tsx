import type { Metadata } from "next";
import { DesignEmbed } from "@/components/DesignEmbed";

export const metadata: Metadata = {
  title: 'Home',
};

export default function Page() {
  return <DesignEmbed src='/design/pages/38.html' title='Home' />;
}
