import type { Metadata } from "next";
import Link from "next/link";
import manifest from "@/lib/pages-manifest.json";

export const metadata: Metadata = { title: "38 design pages" };

export default function DesignIndexPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-extrabold text-[#4A2C14]">38 design pages wired</h1>
      <p className="mt-2 text-sm text-[#4A2C14]/75">Source HTML in /design/pages — App routes below.</p>
      <ul className="mt-8 space-y-2 text-sm">
        {manifest.routes.map((r) => (
          <li key={r.route} className="flex items-center justify-between border-b border-[#E7D5C5] py-2">
            <Link href={r.route.replace("[postcode]", "OL8").replace("[id]", "demo").replace("[reg]", "OL084AB").replace("[slug]", "a1-motors").replace("[garageSlug]", "a1-motors")} className="font-semibold text-[#FF6B00]">
              {r.route}
            </Link>
            <span className="text-[#4A2C14]/60">{r.title}{r.design ? ` · design ${r.design}` : " · gate"}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
