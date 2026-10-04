import Link from "next/link";

const links = [
  { href: "/garages", label: "Garages" },
  { href: "/services", label: "Services" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/garage", label: "For garages" },
  { href: "/auth/login", label: "Login" },
];

export function SiteChrome({
  children,
  bare = false,
}: {
  children: React.ReactNode;
  bare?: boolean;
}) {
  if (bare) return <>{children}</>;

  return (
    <div className="min-h-full flex flex-col bg-[#FFF4EC] text-[#4A2C14]">
      <header className="sticky top-0 z-40 border-b border-[#E7D5C5]/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <Link href="/" className="text-lg font-extrabold tracking-tight text-[#FF6B00]">
            Vexo Garage
          </Link>
          <nav className="hidden items-center gap-4 text-sm font-semibold md:flex">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-[#FF6B00]">
                {l.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/auth/register"
            className="inline-flex h-9 items-center rounded-md bg-[#FF6B00] px-3 text-sm font-bold text-white"
          >
            Get started
          </Link>
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
