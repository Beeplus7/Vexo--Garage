import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { needsOnboarding } from "@/lib/onboarding";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Welcome" };

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    redirect("/auth/login?next=/onboarding");
  }
  if (!needsOnboarding(data.user)) {
    redirect("/garages");
  }

  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-xl flex-col justify-center px-6 py-12 md:py-16">
      <OnboardingWizard
        email={data.user.email || ""}
        defaults={{
          fullName:
            (data.user.user_metadata?.full_name as string) ||
            (data.user.user_metadata?.name as string) ||
            "",
          phone: (data.user.user_metadata?.phone as string) || "",
          postcode: (data.user.user_metadata?.postcode as string) || "",
          reg: (data.user.user_metadata?.reg as string) || "",
          role:
            (data.user.user_metadata?.role as "customer" | "garage") ||
            "customer",
        }}
      />
    </main>
  );
}
