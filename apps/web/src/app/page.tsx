export default function Home() {
  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-hidden bg-[#0B1F2A] text-[#F4F7F5]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 20% 10%, #1F6B5A 0%, transparent 55%), radial-gradient(ellipse 60% 40% at 90% 80%, #C45C26 0%, transparent 50%)",
        }}
      />
      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-16 sm:px-10">
        <p className="mb-4 text-sm font-medium tracking-[0.2em] uppercase text-[#8FCBB8]">
          vexogarage.co.uk
        </p>
        <h1 className="max-w-2xl font-[family-name:var(--font-geist-sans)] text-5xl font-semibold tracking-tight sm:text-6xl">
          Vexo Garage
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-[#B7C4BE]">
          Fresh workspace for web, app, and mobile. Bookings, servicing, and
          garage ops — powered by Supabase.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <a
            href="/downloads/Vexo-Garage-Brand-Kit-White-With-Main-Logo.html"
            download
            className="inline-flex h-12 items-center justify-center bg-[#F4F7F5] px-6 text-sm font-semibold text-[#0B1F2A] transition hover:bg-white"
          >
            Brand kit
          </a>
          <a
            href="/downloads/vexo_x5f_garage_x5f_white_x5f_production_x5f_architecture.html"
            download
            className="inline-flex h-12 items-center justify-center border border-[#3A545E] px-6 text-sm font-semibold text-[#F4F7F5] transition hover:border-[#8FCBB8]"
          >
            Architecture
          </a>
          <a
            href="/downloads/vexo_x5f_garage_x5f_full_x5f_page_x5f_inventory.html"
            download
            className="inline-flex h-12 items-center justify-center border border-[#3A545E] px-6 text-sm font-semibold text-[#F4F7F5] transition hover:border-[#8FCBB8]"
          >
            Page inventory
          </a>
          <a
            href="/downloads/Vexo-Garage-Full-Api-Inventory-V2.html"
            download
            className="inline-flex h-12 items-center justify-center border border-[#3A545E] px-6 text-sm font-semibold text-[#F4F7F5] transition hover:border-[#8FCBB8]"
          >
            API inventory
          </a>
          <a
            href="/downloads/vexo_backend_production_supabase_ready.zip"
            download
            className="inline-flex h-12 items-center justify-center border border-[#3A545E] px-6 text-sm font-semibold text-[#F4F7F5] transition hover:border-[#8FCBB8]"
          >
            Backend zip
          </a>
          <a
            href="https://github.com/Beeplus7/Vexo--Garage"
            className="inline-flex h-12 items-center justify-center border border-[#3A545E] px-6 text-sm font-semibold text-[#F4F7F5] transition hover:border-[#8FCBB8]"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
        <section id="stack" className="mt-20 grid gap-6 sm:grid-cols-3">
          {[
            ["Web", "Next.js app in apps/web"],
            ["Mobile", "Expo app in apps/mobile"],
            ["Shared", "Types & constants in packages/shared"],
          ].map(([title, body]) => (
            <div key={title} className="border-t border-[#3A545E] pt-4">
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#B7C4BE]">{body}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
