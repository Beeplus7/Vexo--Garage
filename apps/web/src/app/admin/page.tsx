import type { Metadata } from "next";
import { DesignEmbed } from "@/components/DesignEmbed";

export const metadata: Metadata = {
  title: 'Admin',
};

export default function Page() {
  return <DesignEmbed src='/design/pages/34.html' title='Admin' />;
}
