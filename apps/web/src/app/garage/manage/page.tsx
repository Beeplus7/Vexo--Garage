import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { GarageDashboard } from "@/components/GarageDashboard";
import { needsGarageSignup, postAuthPath } from "@/lib/garage-auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Garage live controls",
};

/** Functional console (bookings, Stripe, services, uploads). Visual design is /garage/dashboard page 20. */
export default async function GarageManagePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    redirect("/auth/login?next=/garage/manage");
  }
  if (needsGarageSignup(data.user)) {
    redirect("/garage/signup");
  }
  if (data.user.user_metadata?.role !== "garage") {
    redirect(postAuthPath(data.user));
  }

  return <GarageDashboard />;
}
