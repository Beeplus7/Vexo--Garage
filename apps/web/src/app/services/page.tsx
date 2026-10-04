import type { Metadata } from "next";
import { DesignEmbed } from "@/components/DesignEmbed";

export const metadata: Metadata = {
  title: 'Services',
};

export default function Page() {
  return <DesignEmbed src='/design/pages/27.html' title='Services' />;
}
