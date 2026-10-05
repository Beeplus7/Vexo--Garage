"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { SiteChrome } from "@/components/SiteChrome";
import { DEFAULT_GARAGE_SERVICES } from "@/lib/garage-auth";

const PRESET = Object.keys(DEFAULT_GARAGE_SERVICES);
const inputClass =
  "h-12 w-full rounded-lg border border-[#E7D5C5] bg-white px-3 text-sm tracking-wide";

const BENEFITS = [
  {
    title: "Free to Join",
    body: "£0 upfront. 10% commission only on completed bookings.",
  },
  {
    title: "Free Dashboard + Widget",
    body: "Views, bookings, and district coverage in one place.",
  },
  {
    title: "Guaranteed Bookings",
    body: "Boost: 10 bookings/month guaranteed or refund.",
  },
  {
    title: "Automatic Payments",
    body: "Stripe Connect hold → auto-split (e.g. £40.50 garage / £7.50 Vexo).",
  },
  {
    title: "Video Verified Shield",
    body: "30sec video + MOT cert proof — trust moat customers see.",
  },
  {
    title: "Permanent Passport",
    body: "Service history tied to the reg — stays forever, not a booking receipt.",
  },
];

type Props = {
  defaults: {
    fullName: string;
    phone: string;
    postcode: string;
    email: string;
  };
};

export function GarageSignupForm({ defaults }: Props) {
  const router = useRouter();
  const [name, setName] = useState(
    defaults.fullName ? `${defaults.fullName}` : "",
  );
  const [phone, setPhone] = useState(defaults.phone);
  const [postcode, setPostcode] = useState(defaults.postcode);
  const [motLicense, setMotLicense] = useState("");
  const [companiesHouse, setCompaniesHouse] = useState("");
  const [chStatus, setChStatus] = useState<
    "idle" | "checking" | "verified" | "failed"
  >("idle");
  const [chName, setChName] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(PRESET.map((k) => [k, true])),
  );
  const [prices, setPrices] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      Object.entries(DEFAULT_GARAGE_SERVICES).map(([k, v]) => [k, String(v)]),
    ),
  );
  const [customName, setCustomName] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [customs, setCustoms] = useState<{ name: string; price: string }[]>([]);
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const serviceEntries = useMemo(() => {
    const out: Record<string, number> = {};
    for (const key of PRESET) {
      if (!selected[key]) continue;
      const n = Number(prices[key]);
      if (Number.isFinite(n) && n >= 0) out[key] = n;
    }
    for (const c of customs) {
      const n = Number(c.price);
      if (c.name.trim() && Number.isFinite(n) && n >= 0) out[c.name.trim()] = n;
    }
    return out;
  }, [selected, prices, customs]);

  function addCustom() {
    const n = customName.trim();
    if (!n) return;
    if (
      PRESET.some((p) => p.toLowerCase() === n.toLowerCase()) ||
      customs.some((c) => c.name.toLowerCase() === n.toLowerCase())
    ) {
      setError("That service is already listed");
      return;
    }
    setCustoms((prev) => [...prev, { name: n, price: customPrice || "0" }]);
    setCustomName("");
    setCustomPrice("");
    setError(null);
  }

  async function verifyCompaniesHouse(number: string) {
    const n = number.replace(/\s/g, "");
    if (!n) {
      setChStatus("idle");
      setChName(null);
      return false;
    }
    setChStatus("checking");
    try {
      const res = await fetch(
        `/api/companies-house?number=${encodeURIComponent(n)}`,
      );
      const data = (await res.json()) as {
        verified?: boolean;
        name?: string;
        error?: string;
      };
      if (res.ok && data.verified) {
        setChStatus("verified");
        setChName(data.name || null);
        if (data.name && !name.trim()) setName(data.name);
        return true;
      }
      setChStatus("failed");
      setChName(null);
      return false;
    } catch {
      setChStatus("failed");
      setChName(null);
      return false;
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agree) {
      setError("Please accept Terms & Privacy");
      return;
    }
    if (Object.keys(serviceEntries).length === 0) {
      setError("Select at least one service (or add a custom one)");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (companiesHouse.trim() && chStatus !== "verified") {
        const ok = await verifyCompaniesHouse(companiesHouse);
        if (!ok) {
          throw new Error(
            "Companies House number not found — leave blank or fix the number",
          );
        }
      }
      const res = await fetch("/api/garage/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          postcode,
          motLicense,
          companiesHouse,
          services: serviceEntries,
        }),
      });
      const data = (await res.json()) as { error?: string; next?: string };
      if (!res.ok) throw new Error(data.error || "Signup failed");
      router.replace(data.next || "/garage/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
      setBusy(false);
    }
  }

  return (
    <SiteChrome variant="app">
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6 flex flex-wrap items-center gap-2 text-[11px] font-bold tracking-wide">
          <span className="rounded-full bg-[#FF6B00] px-2.5 py-1 text-white">
            LIVE TODAY · National coverage
          </span>
          <span className="rounded-full border border-[#E7D5C5] bg-white px-2.5 py-1 text-[#4A2C14]/70">
            Open across UK Day 1
          </span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.05fr] lg:items-start">
          <aside className="space-y-3">
            <p className="text-xs font-bold tracking-[0.14em] text-[#FF6B00]">
              Home › Garage › Signup
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#4A2C14] sm:text-4xl">
              Free to join — list your garage
            </h1>
            <p className="text-sm tracking-wide text-[#4A2C14]/75">
              Signed in as {defaults.email || "garage owner"}. Set prices, add
              every service you offer, then open your dashboard.
            </p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {BENEFITS.map((b) => (
                <li
                  key={b.title}
                  className="rounded-xl border border-[#E7D5C5] bg-white/90 px-4 py-3 shadow-sm"
                >
                  <p className="text-sm font-extrabold text-[#4A2C14]">
                    {b.title}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#4A2C14]/70">
                    {b.body}
                  </p>
                </li>
              ))}
            </ul>
            <p className="rounded-xl border border-[#FFF4EC] bg-[#FFF4EC] px-4 py-3 text-xs text-[#4A2C14]/75">
              National coverage via Postcodes.io · Stripe Connect hold · DVLA /
              DVSA exact quotes for customers
            </p>
          </aside>

          <form
            onSubmit={onSubmit}
            className="space-y-5 rounded-2xl border border-[#FF6B00]/35 bg-white p-5 shadow-xl sm:p-7"
          >
            {error ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {error}
              </p>
            ) : null}

            <Field label="Company / garage name">
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="A1 Oldham Motors"
                className={inputClass}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Postcode">
                <input
                  required
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  placeholder="OL8 4AB"
                  className={`${inputClass} uppercase`}
                />
              </Field>
              <Field label="Phone">
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0161…"
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="MOT licence">
                <div className="relative">
                  <input
                    value={motLicense}
                    onChange={(e) => setMotLicense(e.target.value)}
                    placeholder="V123456"
                    className={inputClass}
                  />
                  {motLicense.trim() ? (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-800">
                      Verified
                    </span>
                  ) : null}
                </div>
              </Field>
              <Field label="Companies House (optional)">
                <div className="relative">
                  <input
                    value={companiesHouse}
                    onChange={(e) => {
                      setCompaniesHouse(e.target.value);
                      setChStatus("idle");
                      setChName(null);
                    }}
                    onBlur={() => {
                      if (companiesHouse.trim()) {
                        void verifyCompaniesHouse(companiesHouse);
                      }
                    }}
                    placeholder="12345678"
                    className={inputClass}
                  />
                  {chStatus === "checking" ? (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                      Checking…
                    </span>
                  ) : null}
                  {chStatus === "verified" ? (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-800">
                      Verified
                    </span>
                  ) : null}
                  {chStatus === "failed" ? (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800">
                      Not found
                    </span>
                  ) : null}
                </div>
                {chName ? (
                  <p className="mt-1 text-[11px] text-[#0A7A3E]">{chName}</p>
                ) : null}
              </Field>
            </div>

            <fieldset>
              <legend className="text-sm font-bold text-[#4A2C14]">
                Services
              </legend>
              <p className="mt-1 text-xs text-[#4A2C14]/60">
                Tick what you offer · set your prices · add Other services you
                also run
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {PRESET.map((key) => (
                  <label
                    key={key}
                    className="flex items-center justify-between gap-2 rounded-lg border border-[#E7D5C5] px-3 py-2.5 text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!selected[key]}
                        onChange={(e) =>
                          setSelected((s) => ({
                            ...s,
                            [key]: e.target.checked,
                          }))
                        }
                      />
                      <span className="font-semibold text-[#4A2C14]">{key}</span>
                      {key === "MOT" ? (
                        <span className="rounded bg-[#FF6B00]/15 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-[#FF6B00]">
                          POPULAR
                        </span>
                      ) : null}
                    </span>
                    <span className="text-xs font-semibold text-[#4A2C14]/55">
                      £{prices[key] || "0"}
                    </span>
                  </label>
                ))}
                <div className="rounded-lg border border-dashed border-[#FF6B00]/50 bg-[#FFF4EC] px-3 py-2.5 sm:col-span-2">
                  <p className="text-xs font-bold text-[#4A2C14]">
                    Other — add a custom service
                  </p>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                    <input
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="e.g. Clutch · Tyres · Diagnostics"
                      className={`${inputClass} flex-1`}
                    />
                    <input
                      type="number"
                      min={0}
                      value={customPrice}
                      onChange={(e) => setCustomPrice(e.target.value)}
                      placeholder="£"
                      className={`${inputClass} sm:w-24`}
                    />
                    <button
                      type="button"
                      onClick={addCustom}
                      className="h-12 rounded-lg border border-[#FF6B00] px-4 text-sm font-bold text-[#FF6B00]"
                    >
                      Add
                    </button>
                  </div>
                  {customs.length ? (
                    <ul className="mt-2 space-y-1">
                      {customs.map((c) => (
                        <li
                          key={c.name}
                          className="flex items-center justify-between text-sm font-semibold text-[#4A2C14]"
                        >
                          <span>
                            {c.name} · £{c.price}
                          </span>
                          <button
                            type="button"
                            className="text-xs text-red-600"
                            onClick={() =>
                              setCustoms((list) =>
                                list.filter((x) => x.name !== c.name),
                              )
                            }
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            </fieldset>

            <div>
              <p className="text-sm font-bold text-[#4A2C14]">
                Prices — you set your own · exact quote not estimate
              </p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {PRESET.filter((k) => selected[k]).map((key) => (
                  <label
                    key={key}
                    className="flex items-center justify-between gap-2 rounded-lg border border-[#E7D5C5] px-3 py-2 text-sm"
                  >
                    <span className="font-semibold text-[#4A2C14]">
                      {key} £
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={prices[key] || ""}
                      onChange={(e) =>
                        setPrices((p) => ({ ...p, [key]: e.target.value }))
                      }
                      className="h-10 w-24 rounded-md border border-[#E7D5C5] px-2 text-sm"
                    />
                  </label>
                ))}
                {customs.map((c) => (
                  <label
                    key={c.name}
                    className="flex items-center justify-between gap-2 rounded-lg border border-[#E7D5C5] px-3 py-2 text-sm"
                  >
                    <span className="font-semibold text-[#4A2C14]">
                      {c.name} £
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={c.price}
                      onChange={(e) =>
                        setCustoms((list) =>
                          list.map((x) =>
                            x.name === c.name
                              ? { ...x, price: e.target.value }
                              : x,
                          ),
                        )
                      }
                      className="h-10 w-24 rounded-md border border-[#E7D5C5] px-2 text-sm"
                    />
                  </label>
                ))}
              </div>
            </div>

            <label className="flex items-start gap-2 text-sm text-[#4A2C14]/80">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-1"
              />
              <span>
                I agree to{" "}
                <Link href="/terms" className="font-semibold text-[#FF6B00]">
                  Terms
                </Link>{" "}
                &{" "}
                <Link href="/privacy" className="font-semibold text-[#FF6B00]">
                  Privacy
                </Link>
                . 10% only on completion.
              </span>
            </label>

            <button
              type="submit"
              disabled={busy}
              className="flex h-14 w-full items-center justify-center rounded-xl bg-[#FF6B00] px-4 text-center text-sm font-bold text-white disabled:opacity-60"
            >
              {busy
                ? "Creating garage…"
                : "Sign Up — Free to Join £0 upfront · 10% only on completion →"}
            </button>
          </form>
        </div>
      </main>
    </SiteChrome>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-semibold text-[#4A2C14]">{label}</span>
      {children}
    </label>
  );
}
