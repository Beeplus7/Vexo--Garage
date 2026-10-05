"use client";

import { SiteChrome } from "@/components/SiteChrome";
import { APP_URL, MARKETING_URL } from "@/lib/site-urls";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <SiteChrome variant="app">
      <main className="mx-auto flex w-full max-w-lg flex-col px-6 py-20">
        <p className="text-xs font-bold tracking-[0.14em] text-[#FF6B00]">
          Something went wrong
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#4A2C14]">
          We hit a snag
        </h1>
        <p className="mt-2 text-sm leading-6 tracking-wide text-[#4A2C14]/75">
          {error.message || "Please try again in a moment."}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-11 items-center rounded-md bg-[#FF6B00] px-4 text-sm font-bold text-white"
          >
            Try again
          </button>
          <a
            href={MARKETING_URL}
            className="inline-flex h-11 items-center rounded-md border border-[#E7D5C5] bg-white px-4 text-sm font-bold text-[#4A2C14]"
          >
            Marketing home
          </a>
          <a
            href={`${APP_URL}/garages`}
            className="inline-flex h-11 items-center rounded-md border border-[#E7D5C5] bg-white px-4 text-sm font-bold text-[#4A2C14]"
          >
            Find garages
          </a>
        </div>
      </main>
    </SiteChrome>
  );
}
