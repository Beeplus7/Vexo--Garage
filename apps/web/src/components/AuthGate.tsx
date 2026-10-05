"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { getBrowserAuthOrigin } from "@/lib/auth-origin";
import { postAuthPath } from "@/lib/garage-auth";
import { createClient } from "@/lib/supabase/browser";

type AuthGateProps = {
  mode: "login" | "register";
  error?: string;
};

function friendlyAuthError(raw?: string | null): string | null {
  if (!raw) return null;
  if (
    raw === "email_confirmed_login" ||
    /PKCE|code verifier/i.test(raw)
  ) {
    return "Your email is confirmed. Log in with your password on this device (open the confirm link in the same browser you signed up in, or just log in here).";
  }
  if (raw === "missing_code" || raw === "invalid_confirm_link") {
    return "That confirmation link is invalid or expired. Log in with your password, or request a new link.";
  }
  return raw;
}

export function AuthGate({ mode, error }: AuthGateProps) {
  const router = useRouter();
  const [busy, setBusy] = useState<"google" | "email" | "phone" | null>(null);
  const [localError, setLocalError] = useState<string | null>(
    friendlyAuthError(error),
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [phoneStep, setPhoneStep] = useState<"idle" | "code">("idle");
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
          redirectTo: `${origin}/auth/callback?next=/onboarding`,
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

  async function continueWithEmail(e: React.FormEvent) {
    e.preventDefault();
    setBusy("email");
    setLocalError(null);
    const origin = getBrowserAuthOrigin();
    const supabase = createClient();

    try {
      if (mode === "register") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${origin}/auth/confirm?next=/onboarding`,
            data: {
              full_name: fullName.trim() || undefined,
              role: "customer",
              onboarding_complete: false,
            },
          },
        });
        if (signUpError) throw signUpError;

        if (!data.session) {
          router.push(
            `/auth/check-email?email=${encodeURIComponent(email.trim())}`,
          );
          return;
        }
        router.push(postAuthPath(data.user));
        router.refresh();
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) throw signInError;
      const { data: userData } = await supabase.auth.getUser();
      router.push(postAuthPath(userData.user));
      router.refresh();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Auth failed");
      setBusy(null);
    }
  }

  async function sendPhoneCode() {
    setBusy("phone");
    setLocalError(null);
    try {
      const res = await fetch("/api/auth/phone/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = (await res.json()) as { error?: string; phone?: string };
      if (!res.ok) throw new Error(data.error || "Could not send code");
      if (data.phone) setPhone(data.phone);
      setPhoneStep("code");
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "SMS failed");
    } finally {
      setBusy(null);
    }
  }

  async function verifyPhoneCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy("phone");
    setLocalError(null);
    try {
      const res = await fetch("/api/auth/phone/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const data = (await res.json()) as { error?: string; next?: string };
      if (!res.ok) throw new Error(data.error || "Invalid code");
      router.push(data.next || "/onboarding");
      router.refresh();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Verify failed");
      setBusy(null);
    }
  }

  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col justify-center px-6 py-16">
      <p className="text-xs font-bold tracking-[0.12em] text-[#FF6B00]">
        Entrance gate
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#4A2C14]">
        {mode === "login" ? "Log in" : "Create account"}
      </h1>
      <p className="mt-2 text-sm leading-6 tracking-wide text-[#4A2C14]/80">
        {mode === "login"
          ? "Google, email, or phone. Open the confirmation link in the same browser you used to sign up."
          : "Sign up with Google, email, or phone. Open the email confirmation link in this same browser."}
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

        <div className="relative py-2 text-center text-xs font-semibold tracking-wide text-[#4A2C14]/50">
          or email
        </div>

        <form onSubmit={continueWithEmail} className="space-y-3">
          {mode === "register" ? (
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name"
              className="h-12 w-full rounded-md border border-[#E7D5C5] bg-white px-3 text-sm tracking-wide"
            />
          ) : null}
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="h-12 w-full rounded-md border border-[#E7D5C5] bg-white px-3 text-sm tracking-wide"
          />
          <input
            required
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 8 chars)"
            className="h-12 w-full rounded-md border border-[#E7D5C5] bg-white px-3 text-sm tracking-wide"
          />
          <button
            type="submit"
            disabled={busy === "email"}
            className="flex h-12 w-full items-center justify-center rounded-md bg-[#FF6B00] text-sm font-bold text-white disabled:opacity-60"
          >
            {busy === "email"
              ? "Please wait…"
              : mode === "login"
                ? "Log in with email"
                : "Sign up — send confirmation email"}
          </button>
        </form>

        <div className="relative py-2 text-center text-xs font-semibold tracking-wide text-[#4A2C14]/50">
          or phone
        </div>

        {twilioReady ? (
          phoneStep === "idle" ? (
            <div className="space-y-3">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07… or +44…"
                inputMode="tel"
                className="h-12 w-full rounded-md border border-[#E7D5C5] bg-white px-3 text-sm tracking-wide"
              />
              <button
                type="button"
                onClick={sendPhoneCode}
                disabled={busy === "phone" || !phone.trim()}
                className="flex h-12 w-full items-center justify-center rounded-md border border-[#E7D5C5] text-sm font-bold text-[#4A2C14] hover:border-[#FF6B00] disabled:opacity-60"
              >
                {busy === "phone" ? "Sending code…" : "Continue with phone"}
              </button>
              <p className="text-[11px] leading-4 text-[#4A2C14]/55">
                Trial Twilio: destination numbers may need verifying in the Twilio
                console first.
              </p>
            </div>
          ) : (
            <form onSubmit={verifyPhoneCode} className="space-y-3">
              <p className="text-xs text-[#4A2C14]/70">
                Code sent to <span className="font-semibold">{phone}</span>
              </p>
              <input
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="6-digit code"
                inputMode="numeric"
                autoComplete="one-time-code"
                className="h-12 w-full rounded-md border border-[#E7D5C5] bg-white px-3 text-sm tracking-wide"
              />
              <button
                type="submit"
                disabled={busy === "phone"}
                className="flex h-12 w-full items-center justify-center rounded-md bg-[#FF6B00] text-sm font-bold text-white disabled:opacity-60"
              >
                {busy === "phone" ? "Checking…" : "Verify & continue"}
              </button>
              <button
                type="button"
                className="text-xs font-semibold text-[#4A2C14]/60"
                onClick={() => {
                  setPhoneStep("idle");
                  setCode("");
                }}
              >
                Use a different number
              </button>
            </form>
          )
        ) : (
          <button
            type="button"
            disabled
            className="flex h-12 w-full items-center justify-center rounded-md border border-[#E7D5C5] text-sm font-bold text-[#4A2C14] opacity-60"
          >
            Continue with phone (Twilio not ready)
          </button>
        )}
      </div>

      <p className="mt-6 text-sm tracking-wide">
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
          className="mt-4 text-sm font-semibold tracking-wide text-[#4A2C14]/70"
        >
          Garage signup instead →
        </Link>
      ) : (
        <Link
          href="/"
          className="mt-8 text-sm font-semibold tracking-wide text-[#4A2C14]/70"
        >
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
