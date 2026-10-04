import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthGate } from "@/components/AuthGate";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Login" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (data.user) redirect("/");
  } catch {
    // Missing key in some envs — still show gate
  }
  return <AuthGate mode="login" error={error} />;
}
