import type { User } from "@supabase/supabase-js";
import { getOnboardingMeta, needsOnboarding } from "@/lib/onboarding";

export type GarageMeta = {
  garage_id?: string;
  garage_name?: string;
  garage_signup_complete?: boolean;
  mot_license?: string;
};

export function getGarageMeta(user: User | null | undefined): GarageMeta {
  return (user?.user_metadata || {}) as GarageMeta;
}

export function isGarageRole(user: User | null | undefined): boolean {
  return getOnboardingMeta(user).role === "garage";
}

export function needsGarageSignup(user: User | null | undefined): boolean {
  if (!isGarageRole(user)) return false;
  const g = getGarageMeta(user);
  return g.garage_signup_complete !== true || !g.garage_id;
}

/** Where a signed-in user should land. */
export function postAuthPath(user: User | null | undefined): string {
  if (!user) return "/auth/login";
  if (needsOnboarding(user)) return "/onboarding";
  if (needsGarageSignup(user)) return "/garage/signup";
  if (isGarageRole(user)) return "/garage/dashboard";
  return "/garages";
}

export const DEFAULT_GARAGE_SERVICES: Record<string, number> = {
  MOT: 45,
  "Full Service": 189,
  Brakes: 120,
  "Tesla Service": 249,
  "BMW Repair": 350,
};
