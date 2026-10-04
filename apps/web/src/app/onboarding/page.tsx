import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/OnboardingForm";
import { needsOnboarding } from "@/lib/onboarding";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Onboarding" };

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    redirect("/auth/login?next=/onboarding");
  }
  if (!needsOnboarding(data.user)) {
    redirect("/");
  }

  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col justify-center px-6 py-16">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF6B00]">
        Welcome to Vexo
      </p>
      <h1 className="mt-3 text-3xl font-extrabold text-[#4A2C14]">
        Finish onboarding
      </h1>
      <p className="mt-2 text-sm leading-6 text-[#4A2C14]/80">
        Tell us a bit about you so we can match garages near your postcode.
      </p>
      <OnboardingForm
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
