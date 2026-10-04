import type { Metadata } from "next";
import { DesignEmbed } from "@/components/DesignEmbed";

export const metadata: Metadata = {
  title: 'API routes map',
};

export default function Page() {
  return <DesignEmbed src='/design/pages/37.html' title='API routes map' />;
}
