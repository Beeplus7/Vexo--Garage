"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getBrowserAuthOrigin } from "@/lib/auth-origin";
import { createClient } from "@/lib/supabase/browser";

type AuthGateProps = {
  mode: "login" | "register";
  error?: string;
};

export function AuthGate({ mode, error }: AuthGateProps) {
  const [busy, setBusy] = useState<"google" | "phone" | null>(null);
  const [localError, setLocalError] = useState<string | null>(error || null);
  const twilioReady = useMemo(
    () => process.env.NEXT_PUBLIC_TWILIO_READY === "1",
    [],
  );

  async function continueWithGoogle() {
    setBusy("google");
    setLocalError(null);
    try {
      const supabase = createClient();
      const origin = getBrowserAuthOrigin();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?next=/`,
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });
      if (oauthError) {
        setLocalError(oauthError.message);
        setBusy(null);
      }
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : "Google sign-in failed");
      setBusy(null);
    }
  }

  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col justify-center px-6 py-16">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF6B00]">
        Entrance gate
      </p>
      <h1 className="mt-3 text-3xl font-extrabold text-[#4A2C14]">
        {mode === "login" ? "Log in" : "Create account"}
      </h1>
      <p className="mt-2 text-sm leading-6 text-[#4A2C14]/80">
        {mode === "login"
          ? "Sign in with Google. Phone / Twilio wires in when credentials land."
          : "Customer + garage onboarding. Google works now; phone Magic Link next."}
      </p>

      {localError ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {localError}
        </p>
      ) : null}

      <div className="mt-8 space-y-3">
        <button
          type="button"
          onClick={continueWithGoogle}
          disabled={busy === "google"}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-md border border-[#E7D5C5] bg-white text-sm font-bold text-[#4A2C14] hover:border-[#FF6B00] disabled:opacity-60"
        >
          <GoogleIcon />
          {busy === "google"
            ? "Redirecting to Google…"
            : mode === "login"
              ? "Continue with Google"
              : "Sign up with Google"}
        </button>

        <button
          type="button"
          disabled
          className="flex h-12 w-full items-center justify-center rounded-md bg-[#FF6B00] text-sm font-bold text-white opacity-60"
          title="Awaiting Twilio credentials"
        >
          {twilioReady
            ? "Continue with phone"
            : "Continue with phone / Twilio (awaiting credentials)"}
        </button>
      </div>

      <p className="mt-6 text-sm">
        {mode === "login" ? (
          <>
            No account?{" "}
            <Link href="/auth/register" className="font-bold text-[#FF6B00]">
              Register
            </Link>
          </>
        ) : (
          <>
            Already joined?{" "}
            <Link href="/auth/login" className="font-bold text-[#FF6B00]">
              Log in
            </Link>
          </>
        )}
      </p>

      {mode === "register" ? (
        <Link
          href="/garage/signup"
          className="mt-4 text-sm font-semibold text-[#4A2C14]/70"
        >
          Garage signup instead →
        </Link>
      ) : (
        <Link href="/" className="mt-8 text-sm font-semibold text-[#4A2C14]/70">
          ← Back home
        </Link>
      )}
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.2C29.3 35.3 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l.1.1 6.3 5.2C39.3 36.9 44 32 44 24c0-1.2-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}
