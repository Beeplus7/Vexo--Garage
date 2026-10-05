"use client";

import Link from "next/link";
import { useMemo } from "react";
import { DesignEmbed } from "@/components/DesignEmbed";
import { designSrc } from "@/lib/design-catalog";

type Props = {
  garageName: string;
  postcode: string;
  district: string;
};

/**
 * Exact page-20 HTML design (the file you sent), with a small live-controls bar.
 * Functional accept/upload/Stripe lives at /garage/manage.
 */
export function GarageDashboardDesign({
  garageName,
  postcode,
  district,
}: Props) {
  const replacements = useMemo(
    () =>
      [
        ["A1 Motors Oldham", garageName],
        ["A1 Motors", garageName],
        ["OL8 4AB", postcode || "OL8 4AB"],
        ["123 Oldham Rd, Oldham OL8 4AB", `${garageName} · ${postcode}`],
      ] as [string, string][],
    [garageName, postcode],
  );

  return (
    <div className="relative h-[100dvh] w-full max-w-[100vw] overflow-x-hidden bg-white">
      <div
        className="absolute inset-x-0 top-0 z-50 flex flex-col gap-2 border-b border-[#FFE4CC] bg-white/95 px-3 py-2 text-xs shadow-sm backdrop-blur sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
        style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top))" }}
      >
        <p className="min-w-0 truncate font-semibold text-[#4A2C14]">
          <span className="font-extrabold text-[#FF6B00]">Live</span> ·{" "}
          {garageName} · {postcode} · {district}
        </p>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            href="/garage/manage"
            className="inline-flex h-8 items-center rounded-lg bg-[#FF6B00] px-3 font-bold text-white"
          >
            Live controls →
          </Link>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="inline-flex h-8 items-center rounded-lg border border-[#E7D5C5] px-3 font-bold text-[#4A2C14]"
            >
              Logout
            </button>
          </form>
        </div>
      </div>
      <div className="h-full max-w-full overflow-x-hidden pt-[4.5rem] sm:pt-12">
        <DesignEmbed
          src={designSrc(20)}
          title="Garage dashboard — page 20 of 38"
          textReplacements={replacements}
        />
      </div>
    </div>
  );
}
