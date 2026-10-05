import Link from "next/link";
import { APP_URL, MARKETING_URL } from "@/lib/site-urls";

type ChromeLink = { href: string; label: string; external?: boolean };

const marketingLinks: ChromeLink[] = [
  { href: `${MARKETING_URL}/how-it-works`, label: "How it works", external: true },
  { href: `${MARKETING_URL}/services`, label: "Services", external: true },
  { href: `${MARKETING_URL}/pricing`, label: "Pricing", external: true },
  { href: `${MARKETING_URL}/garage`, label: "For garages", external: true },
  { href: `${APP_URL}/auth/login`, label: "Log in", external: true },
];

const appLinks: ChromeLink[] = [
  { href: `${APP_URL}/garages`, label: "Garages", external: true },
  { href: `${MARKETING_URL}/how-it-works`, label: "How it works", external: true },
  { href: `${MARKETING_URL}/pricing`, label: "Pricing", external: true },
  { href: `${APP_URL}/auth/login`, label: "Log in", external: true },
];

export function SiteChrome({
  children,
  bare = false,
  variant = "app",
}: {
  children: React.ReactNode;
  bare?: boolean;
  variant?: "app" | "marketing";
}) {
  if (bare) return <>{children}</>;

  const links = variant === "marketing" ? marketingLinks : appLinks;
  const homeHref = variant === "marketing" ? MARKETING_URL : APP_URL;
  const ctaHref = `${APP_URL}/auth/register`;

  return (
    <div className="flex min-h-full flex-col bg-[#FFF4EC] text-[#4A2C14]">
      <header className="sticky top-0 z-40 border-b border-[#E7D5C5]/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <Link
            href={homeHref}
            className="text-lg font-extrabold tracking-tight text-[#FF6B00]"
          >
            Vexo Garage
          </Link>
          <nav className="hidden items-center gap-4 text-sm font-semibold tracking-wide md:flex">
            {links.map((l) =>
              l.external ? (
                <a key={l.href} href={l.href} className="hover:text-[#FF6B00]">
                  {l.label}
                </a>
              ) : (
                <Link key={l.href} href={l.href} className="hover:text-[#FF6B00]">
                  {l.label}
                </Link>
              ),
            )}
          </nav>
          <a
            href={ctaHref}
            className="inline-flex h-9 items-center rounded-lg bg-[#FF6B00] px-3 text-sm font-bold text-white"
          >
            Get started
          </a>
        </div>
      </header>
      <div className="flex-1">{children}</div>
      <footer className="border-t border-[#E7D5C5]/80 bg-white/70">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-xs tracking-wide text-[#4A2C14]/70">
          <p>Your car. Your service. Your choice.</p>
          <div className="flex flex-wrap gap-4 font-semibold">
            <a href={`${MARKETING_URL}/trust`} className="hover:text-[#FF6B00]">
              Trust
            </a>
            <a href={`${MARKETING_URL}/contact`} className="hover:text-[#FF6B00]">
              Contact
            </a>
            <a href={`${APP_URL}/terms`} className="hover:text-[#FF6B00]">
              Terms
            </a>
            <a href={`${APP_URL}/privacy`} className="hover:text-[#FF6B00]">
              Privacy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
