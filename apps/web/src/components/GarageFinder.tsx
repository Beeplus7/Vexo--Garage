"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { SiteChrome } from "@/components/SiteChrome";

type GarageRow = {
  id: string;
  name: string;
  postcode: string;
  district: string;
  distance: number;
  servicePrice: number;
  rating: number;
  bookingsCount: number;
  trafficViews: number;
  boostActive: boolean;
  services?: Record<string, number>;
  phone?: string | null;
};

type Vehicle = {
  make?: string;
  model?: string;
  year?: number | string;
  colour?: string;
  source?: string;
};

type Mot = {
  expiry?: string;
  mileage?: number;
  source?: string;
};

const inputClass =
  "h-12 w-full rounded-lg border border-[#E7D5C5] bg-white px-3 text-sm tracking-wide uppercase";

export function GarageFinder({
  initialPostcode = "OL8 4",
  initialService = "MOT",
}: {
  initialPostcode?: string;
  initialService?: string;
}) {
  const router = useRouter();
  const [postcode, setPostcode] = useState(initialPostcode);
  const [service, setService] = useState(initialService);
  const [reg, setReg] = useState("");
  const [garages, setGarages] = useState<GarageRow[]>([]);
  const [meta, setMeta] = useState<{
    district?: string;
    lat?: number;
    lng?: number;
    source?: string;
  }>({});
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [mot, setMot] = useState<Mot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingGarage, setBookingGarage] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  const search = useCallback(async () => {
    const pc = postcode.trim();
    if (!pc) {
      setError("Enter a postcode");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const gRes = await fetch(
        `/api/garages?postcode=${encodeURIComponent(pc)}&service=${encodeURIComponent(service)}&national=true`,
      );
      const gData = (await gRes.json()) as {
        error?: string;
        garages?: GarageRow[];
        district?: string;
        lat?: number;
        lng?: number;
        source?: string;
      };
      if (!gRes.ok) throw new Error(gData.error || "Search failed");
      setGarages(gData.garages || []);
      setMeta({
        district: gData.district,
        lat: gData.lat,
        lng: gData.lng,
        source: gData.source,
      });

      const cleanReg = reg.trim().toUpperCase().replace(/\s/g, "");
      if (cleanReg.length >= 5) {
        const [vRes, mRes] = await Promise.all([
          fetch(`/api/vehicle?reg=${encodeURIComponent(cleanReg)}`),
          fetch(`/api/mot?reg=${encodeURIComponent(cleanReg)}`),
        ]);
        const vJson = (await vRes.json()) as Vehicle;
        const mJson = (await mRes.json()) as Mot;
        setVehicle(vRes.ok ? vJson : null);
        setMot(mRes.ok ? mJson : null);
      } else {
        setVehicle(null);
        setMot(null);
      }

      const district = gData.district || pc.split(/\s+/)[0];
      if (typeof window !== "undefined") {
        const path = `/garages/${encodeURIComponent(district)}`;
        if (window.location.pathname !== path) {
          router.replace(path);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }, [postcode, service, reg, router]);

  useEffect(() => {
    void search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function bookNow(garageId: string) {
    const cleanReg = reg.trim().toUpperCase().replace(/\s/g, "") || "OL084AB";
    const pc = postcode.trim();
    setBookingGarage(garageId);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "booking",
          reg: cleanReg,
          postcode: pc,
          service,
          garageId,
          customerEmail: email.trim() || undefined,
        }),
      });
      const data = (await res.json()) as { error?: string; url?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Checkout failed");
      }
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
      setBookingGarage(null);
    }
  }

  return (
    <SiteChrome variant="app">
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <p className="text-xs font-bold tracking-[0.14em] text-[#FF6B00]">
          Live finder · Your car. Your service. Your choice.
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#4A2C14]">
          MOT garages near you
        </h1>
        <p className="mt-1 text-sm text-[#4A2C14]/70">
          Exact quote from DVLA when keyed · Haversine distance · Stripe hold on
          book
        </p>

        <form
          className="mt-6 grid gap-3 rounded-2xl border border-[#FFE4CC] bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-5"
          onSubmit={(e) => {
            e.preventDefault();
            void search();
          }}
        >
          <label className="block space-y-1 lg:col-span-1">
            <span className="text-xs font-semibold text-[#4A2C14]/70">
              Postcode
            </span>
            <input
              className={inputClass}
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              placeholder="OL8 4AB"
              required
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-[#4A2C14]/70">Reg</span>
            <input
              className={inputClass}
              value={reg}
              onChange={(e) => setReg(e.target.value)}
              placeholder="OL08 4AB"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-[#4A2C14]/70">
              Service
            </span>
            <select
              className="h-12 w-full rounded-lg border border-[#E7D5C5] bg-white px-3 text-sm"
              value={service}
              onChange={(e) => setService(e.target.value)}
            >
              {[
                "MOT",
                "Full Service",
                "Brakes",
                "Tesla Service",
                "BMW Repair",
              ].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-[#4A2C14]/70">
              Email (for checkout)
            </span>
            <input
              type="email"
              className="h-12 w-full rounded-lg border border-[#E7D5C5] bg-white px-3 text-sm normal-case"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
            />
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center rounded-lg bg-[#FF6B00] text-sm font-bold text-white disabled:opacity-60"
            >
              {loading ? "Searching…" : "Search"}
            </button>
          </div>
        </form>

        {error ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        ) : null}

        {(vehicle || mot) && (
          <div className="mt-4 rounded-xl border border-[#FFE4CC] bg-[#FFF4EC] px-4 py-3 text-sm text-[#4A2C14]">
            <p className="font-bold">Exact quote for your car</p>
            <p className="mt-1 text-xs text-[#4A2C14]/75">
              {vehicle
                ? `${vehicle.make || ""} ${vehicle.model || ""} ${vehicle.year || ""} ${vehicle.colour || ""} · ${vehicle.source || "DVLA"}`
                : "Vehicle lookup pending"}
              {mot?.expiry
                ? ` · MOT expiry ${new Date(mot.expiry).toLocaleDateString("en-GB")} · ${mot.source || "DVSA"}`
                : ""}
              {mot?.mileage ? ` · ${mot.mileage.toLocaleString()} miles` : ""}
            </p>
          </div>
        )}

        <p className="mt-4 text-xs text-[#4A2C14]/55">
          {garages.length} garages
          {meta.district ? ` · ${meta.district}` : ""}
          {meta.source ? ` · ${meta.source}` : ""}
          {meta.lat != null ? ` · ${meta.lat.toFixed(3)}, ${meta.lng?.toFixed(3)}` : ""}
        </p>

        <ul className="mt-4 space-y-3">
          {garages.map((g) => (
            <li
              key={g.id}
              className="rounded-2xl border border-[#FFE4CC] bg-white p-4 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-extrabold text-[#4A2C14]">
                      {g.name}
                    </h2>
                    {g.boostActive ? (
                      <span className="rounded bg-[#FF6B00]/15 px-2 py-0.5 text-[10px] font-bold text-[#FF6B00]">
                        BOOST
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-[#4A2C14]/65">
                    {g.distance}mi · {g.postcode} · {g.rating.toFixed(1)}★ ·{" "}
                    {g.bookingsCount} bookings · {g.trafficViews} views
                  </p>
                  <p className="mt-2 text-sm font-bold text-[#4A2C14]">
                    {service} £{g.servicePrice}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                  <button
                    type="button"
                    disabled={bookingGarage === g.id}
                    onClick={() => void bookNow(g.id)}
                    className="inline-flex h-11 items-center justify-center rounded-lg bg-[#FF6B00] px-4 text-sm font-bold text-white disabled:opacity-60"
                  >
                    {bookingGarage === g.id
                      ? "Opening checkout…"
                      : `Book Now £${g.servicePrice}`}
                  </button>
                  <Link
                    href={`/garage/${encodeURIComponent(g.id)}`}
                    className="text-xs font-bold text-[#FF6B00]"
                  >
                    View details →
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {!loading && !garages.length ? (
          <p className="mt-8 text-sm text-[#4A2C14]/65">
            No garages in range yet. Try OL8 or expand search — national coverage
            Day 1.
          </p>
        ) : null}
      </main>
    </SiteChrome>
  );
}
