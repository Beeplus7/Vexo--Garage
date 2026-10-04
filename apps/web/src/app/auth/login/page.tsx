import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Login" };

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col justify-center px-6 py-16">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF6B00]">Entrance gate</p>
      <h1 className="mt-3 text-3xl font-extrabold text-[#4A2C14]">Log in</h1>
      <p className="mt-2 text-sm leading-6 text-[#4A2C14]/80">
        Ready for Google Auth + Twilio SMS. Paste credentials next and we wire the gate.
      </p>
      <div className="mt-8 space-y-3">
        <button
          type="button"
          disabled
          className="flex h-12 w-full items-center justify-center rounded-md border border-[#E7D5C5] bg-white text-sm font-bold text-[#4A2C14] opacity-70"
        >
          Continue with Google (awaiting credentials)
        </button>
        <button
          type="button"
          disabled
          className="flex h-12 w-full items-center justify-center rounded-md bg-[#FF6B00] text-sm font-bold text-white opacity-70"
        >
          Continue with phone / Twilio (awaiting credentials)
        </button>
      </div>
      <p className="mt-6 text-sm">
        No account?{" "}
        <Link href="/auth/register" className="font-bold text-[#FF6B00]">
          Register
        </Link>
      </p>
      <Link href="/" className="mt-8 text-sm font-semibold text-[#4A2C14]/70">
        ← Back home
      </Link>
    </main>
  );
}
