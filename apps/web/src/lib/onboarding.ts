import type { User } from "@supabase/supabase-js";

export type OnboardingMeta = {
  onboarding_complete?: boolean;
  full_name?: string;
  phone?: string;
  postcode?: string;
  district?: string;
  reg?: string;
  role?: "customer" | "garage";
};

export function getOnboardingMeta(user: User | null | undefined): OnboardingMeta {
  return (user?.user_metadata || {}) as OnboardingMeta;
}

export function needsOnboarding(user: User | null | undefined): boolean {
  if (!user) return false;
  const meta = getOnboardingMeta(user);
  return meta.onboarding_complete !== true;
}
