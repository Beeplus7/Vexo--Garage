import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Confirm your email" };

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col justify-center px-6 py-16">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF6B00]">
        Entrance gate
      </p>
      <h1 className="mt-3 text-3xl font-extrabold text-[#4A2C14]">
        Check your inbox
      </h1>
      <p className="mt-3 text-sm leading-6 text-[#4A2C14]/80">
        We sent a confirmation link
        {email ? (
          <>
            {" "}
            to <span className="font-semibold text-[#4A2C14]">{email}</span>
          </>
        ) : null}
        . Open it to verify your email, then we&apos;ll finish onboarding.
      </p>
      <p className="mt-4 text-sm text-[#4A2C14]/70">
        Can&apos;t find it? Check spam, or wait a minute and request signup again.
      </p>
      <Link
        href="/auth/login"
        className="mt-8 inline-flex h-12 items-center justify-center rounded-md bg-[#FF6B00] text-sm font-bold text-white"
      >
        Back to login
      </Link>
    </main>
  );
}
