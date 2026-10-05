import type { Metadata } from "next";
import Link from "next/link";
import {
  DESIGN_ROUTES,
  SUPERSEDED_DESIGNS,
  designSrc,
} from "@/lib/design-catalog";

export const metadata: Metadata = { title: "38 design pages" };

const ALL = Array.from({ length: 38 }, (_, i) => i + 1);

function liveRouteFor(n: number): string | null {
  const hit = DESIGN_ROUTES.find((r) => r.design === n);
  return hit?.route ?? null;
}

export default function DesignIndexPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 text-[#4A2C14]">
      <h1 className="text-3xl font-extrabold">38 design pages</h1>
      <p className="mt-2 text-sm text-[#4A2C14]/75">
        Hero (01) on marketing host · App home (38) on app host · Archive viewer
        for every HTML.
      </p>

      <h2 className="mt-10 text-lg font-bold">Live routes</h2>
      <ul className="mt-4 space-y-2 text-sm">
        {DESIGN_ROUTES.map((r) => {
          const demo = r.route
            .replace("[postcode]", "OL8")
            .replace("[id]", "demo")
            .replace("[reg]", "OL084AB")
            .replace("[slug]", "a1-motors")
            .replace("[garageSlug]", "a1-motors");
          return (
            <li
              key={`${r.route}-${r.design}-${r.host}`}
              className="flex items-center justify-between border-b border-[#E7D5C5] py-2"
            >
              <Link href={demo} className="font-semibold text-[#FF6B00]">
                {r.route}
              </Link>
              <span className="text-[#4A2C14]/60">
                {r.title} · d{String(r.design).padStart(2, "0")} · {r.host}
              </span>
            </li>
          );
        })}
      </ul>

      <h2 className="mt-10 text-lg font-bold">All 01–38 (inject viewer)</h2>
      <ul className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
        {ALL.map((n) => {
          const pad = String(n).padStart(2, "0");
          const live = liveRouteFor(n);
          const superseded = (SUPERSEDED_DESIGNS as readonly number[]).includes(n);
          return (
            <li key={n}>
              <Link
                href={`/design/${n}`}
                className="block rounded-lg border border-[#E7D5C5] px-3 py-2 font-semibold hover:border-[#FF6B00]"
              >
                {pad}
                <span className="mt-0.5 block text-[11px] font-normal text-[#4A2C14]/55">
                  {live ? live : superseded ? "superseded" : "archive"}
                </span>
              </Link>
              <a
                href={designSrc(n)}
                className="mt-1 block text-[10px] text-[#4A2C14]/45"
              >
                raw html
              </a>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
