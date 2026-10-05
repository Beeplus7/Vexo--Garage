import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { GarageDashboardDesign } from "@/components/GarageDashboardDesign";
import {
  getGarageMeta,
  needsGarageSignup,
  postAuthPath,
} from "@/lib/garage-auth";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Garage dashboard",
};

/** Exact page-20 design HTML. Live API controls → /garage/manage */
export default async function GarageDashboardPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    redirect("/auth/login?next=/garage/dashboard");
  }
  if (needsGarageSignup(data.user)) {
    redirect("/garage/signup");
  }
  if (data.user.user_metadata?.role !== "garage") {
    redirect(postAuthPath(data.user));
  }

  const meta = getGarageMeta(data.user);
  let garage = meta.garage_id
    ? await prisma.garage.findUnique({ where: { id: meta.garage_id } })
    : null;
  if (!garage && data.user.email) {
    garage = await prisma.garage.findFirst({
      where: { email: data.user.email.toLowerCase() },
    });
  }

  return (
    <GarageDashboardDesign
      garageName={garage?.name || meta.garage_name || "Your garage"}
      postcode={garage?.postcode || "OL8"}
      district={garage?.district || "OL8"}
    />
  );
}
