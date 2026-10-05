import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { GarageSignupForm } from "@/components/GarageSignupForm";
import { getGarageMeta, isGarageRole } from "@/lib/garage-auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Garage signup",
};

export default async function GarageSignupPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    redirect("/auth/login?next=/garage/signup");
  }

  const meta = getGarageMeta(data.user);
  if (isGarageRole(data.user) && meta.garage_signup_complete && meta.garage_id) {
    redirect("/garage/dashboard");
  }

  // Customers who open this URL are fine — they become garage on submit
  return (
    <GarageSignupForm
      defaults={{
        email: data.user.email || "",
        fullName:
          (data.user.user_metadata?.full_name as string) ||
          (data.user.user_metadata?.name as string) ||
          "",
        phone: (data.user.user_metadata?.phone as string) || "",
        postcode: (data.user.user_metadata?.postcode as string) || "",
      }}
    />
  );
}
