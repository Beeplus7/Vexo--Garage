import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DesignEmbed } from "@/components/DesignEmbed";
import { designSrc, isMarketingHost } from "@/lib/design-catalog";
import { postAuthPath } from "@/lib/garage-auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Vexo Garage",
  description: "Your car. Your service. Your choice.",
};

/** Marketing → hero 01. App → role-aware home (garages or garage dashboard). */
export default async function Page() {
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "";

  if (!isMarketingHost(host)) {
    try {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      if (data.user) redirect(postAuthPath(data.user));
    } catch {
      // fall through
    }
    redirect("/garages");
  }

  return <DesignEmbed src={designSrc(1)} title="Hero marketing" />;
}
