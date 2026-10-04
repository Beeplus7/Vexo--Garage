import type { Metadata } from "next";
import { DesignEmbed } from "@/components/DesignEmbed";

export const metadata: Metadata = {
  title: 'How it works',
};

export default function Page() {
  return <DesignEmbed src='/design/pages/08.html' title='How it works' />;
}
