import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Register" };

export default function RegisterPage() {
  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col justify-center px-6 py-16">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF6B00]">Entrance gate</p>
      <h1 className="mt-3 text-3xl font-extrabold text-[#4A2C14]">Create account</h1>
      <p className="mt-2 text-sm leading-6 text-[#4A2C14]/80">
        Customer + garage onboarding. Google OAuth and Twilio phone Magic Link wire in next.
      </p>
      <div className="mt-8 space-y-3">
        <button
          type="button"
          disabled
          className="flex h-12 w-full items-center justify-center rounded-md border border-[#E7D5C5] bg-white text-sm font-bold text-[#4A2C14] opacity-70"
        >
          Sign up with Google (awaiting credentials)
        </button>
        <button
          type="button"
          disabled
          className="flex h-12 w-full items-center justify-center rounded-md bg-[#FF6B00] text-sm font-bold text-white opacity-70"
        >
          Sign up with phone / Twilio (awaiting credentials)
        </button>
      </div>
      <p className="mt-6 text-sm">
        Already joined?{" "}
        <Link href="/auth/login" className="font-bold text-[#FF6B00]">
          Log in
        </Link>
      </p>
      <Link href="/garage/signup" className="mt-4 text-sm font-semibold text-[#4A2C14]/70">
        Garage signup instead →
      </Link>
    </main>
  );
}
