import type { Metadata } from "next";
import { DesignEmbed } from "@/components/DesignEmbed";

export const metadata: Metadata = {
  title: 'Admin dashboard',
};

export default function Page() {
  return <DesignEmbed src='/design/pages/21.html' title='Admin dashboard' />;
}
