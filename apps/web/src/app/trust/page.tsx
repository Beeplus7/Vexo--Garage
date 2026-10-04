import type { Metadata } from "next";
import { DesignEmbed } from "@/components/DesignEmbed";

export const metadata: Metadata = {
  title: 'Trust & safety',
};

export default function Page() {
  return <DesignEmbed src='/design/pages/09.html' title='Trust & safety' />;
}
