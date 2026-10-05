"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

type Garage = {
  id: string;
  name: string;
  postcode: string;
  district: string;
  phone: string | null;
  email: string | null;
  services: Record<string, number>;
  rating: number;
  bookingsCount: number;
  trafficViews: number;
  boostActive: boolean;
  stripeConnectId?: string | null;
  motLicenseVerified?: boolean;
  companiesHouseVerified?: boolean;
};

type Booking = {
  id: string;
  reg: string;
  postcode: string;
  service: string;
  price: number;
  status: string;
  videoProofUrl: string | null;
  motCertUrl: string | null;
  createdAt: string;
};

type NavId =
  | "dashboard"
  | "bookings"
  | "commissions"
  | "passports"
  | "reminders"
  | "boost"
  | "traffic"
  | "widget"
  | "settings"
  | "services"
  | "proofs";

const NAV: { id: NavId; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "bookings", label: "Bookings" },
  { id: "services", label: "Services" },
  { id: "proofs", label: "Upload proof" },
  { id: "commissions", label: "Commissions" },
  { id: "passports", label: "Passports" },
  { id: "reminders", label: "Reminders" },
  { id: "boost", label: "Boost" },
  { id: "traffic", label: "Traffic" },
  { id: "widget", label: "Widget" },
  { id: "settings", label: "Settings" },
];

const inputClass =
  "h-11 w-full rounded-lg border border-[#E7D5C5] bg-white px-3 text-sm text-[#4A2C14]";

export function GarageDashboard() {
  const [nav, setNav] = useState<NavId>("dashboard");
  const [garage, setGarage] = useState<Garage | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [rows, setRows] = useState<{ name: string; price: string }[]>([]);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountPhone, setAccountPhone] = useState("");
  const [accountPostcode, setAccountPostcode] = useState("");
  const [saving, setSaving] = useState(false);
  const [proofBookingId, setProofBookingId] = useState("");
  const [proofBusy, setProofBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/garage/me");
    const data = (await res.json()) as {
      error?: string;
      needsSignup?: boolean;
      garage?: Garage;
      bookings?: Booking[];
    };
    if (!res.ok) throw new Error(data.error || "Failed to load");
    if (data.needsSignup || !data.garage) {
      window.location.href = "/garage/signup";
      return;
    }
    setGarage(data.garage);
    setBookings(data.bookings || []);
    setRows(
      Object.entries((data.garage.services || {}) as Record<string, number>).map(
        ([name, price]) => ({ name, price: String(price) }),
      ),
    );
    setAccountName(data.garage.name);
    setAccountPhone(data.garage.phone || "");
    setAccountPostcode(data.garage.postcode);
    setProofBookingId((prev) => prev || data.bookings?.[0]?.id || "");
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await load();
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Load failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const pending = useMemo(
    () => bookings.filter((b) => b.status === "pending"),
    [bookings],
  );
  const revenuePence = useMemo(
    () =>
      bookings
        .filter((b) => ["accepted", "completed", "proof_uploaded"].includes(b.status))
        .reduce((sum, b) => sum + Math.round(b.price * 0.9), 0),
    [bookings],
  );

  async function acceptBooking(bookingId: string) {
    if (!garage) return;
    setError(null);
    try {
      const res = await fetch(`/api/garages/${garage.id}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Accept failed");
      setMsg("Booking accepted — upload video proof next.");
      setProofBookingId(bookingId);
      setNav("proofs");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Accept failed");
    }
  }

  async function saveServices() {
    setSaving(true);
    setError(null);
    const services: Record<string, number> = {};
    for (const row of rows) {
      const price = Number(row.price);
      if (!row.name.trim() || !Number.isFinite(price)) continue;
      services[row.name.trim()] = price;
    }
    try {
      const res = await fetch("/api/garage/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ services }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Save failed");
      setMsg("Services saved.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function saveSettings() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/garage/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: accountName,
          phone: accountPhone,
          postcode: accountPostcode,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Save failed");
      setMsg("Settings saved.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function uploadProof(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!proofBookingId) {
      setError("Select a booking");
      return;
    }
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("bookingId", proofBookingId);
    setProofBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/proof/upload", { method: "POST", body: fd });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setMsg(data.message || "Proof uploaded");
      form.reset();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setProofBusy(false);
    }
  }

  if (loading) {
    return (
      <Shell>
        <p className="p-10 text-sm text-[#4A2C14]/70">Loading dashboard…</p>
      </Shell>
    );
  }

  if (!garage) {
    return (
      <Shell>
        <div className="p-10">
          <p className="text-sm text-red-700">{error || "Garage not found"}</p>
          <Link
            href="/garage/signup"
            className="mt-4 inline-flex h-11 items-center rounded-lg bg-[#FF6B00] px-4 text-sm font-bold text-white"
          >
            Complete garage signup
          </Link>
        </div>
      </Shell>
    );
  }

  const garageGets = (revenuePence / 100).toFixed(2);

  return (
    <Shell>
      {/* Top bar — page 20 style */}
      <header className="border-b border-[#FFE4CC] bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="leading-none">
              <span className="text-lg font-extrabold tracking-tight text-[#FF6B00]">
                VEXO
              </span>
              <span className="ml-1 text-lg font-extrabold tracking-tight text-[#4A2C14]">
                GARAGE
              </span>
            </Link>
            <span className="hidden rounded-full bg-[#FFF4EC] px-2 py-0.5 text-[10px] font-bold text-[#FF6B00] sm:inline">
              Page 20 of 38
            </span>
          </div>
          <p className="order-last w-full text-xs text-[#4A2C14]/65 sm:order-none sm:w-auto">
            Home › Garage › Dashboard · {garage.name} · {garage.district} ·{" "}
            {garage.rating.toFixed(1)}★ · {garage.bookingsCount} bookings ·{" "}
            {garage.trafficViews} views
          </p>
          <div className="flex items-center gap-2">
            <Link
              href="/garages"
              className="inline-flex h-9 items-center rounded-lg bg-[#FF6B00] px-3 text-xs font-bold text-white"
            >
              Book MOT
            </Link>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="inline-flex h-9 items-center rounded-lg border border-[#E7D5C5] px-3 text-xs font-bold text-[#4A2C14]"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1440px] gap-0 lg:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="border-b border-[#FFE4CC] bg-white lg:min-h-[calc(100dvh-57px)] lg:border-b-0 lg:border-r">
          <div className="p-4">
            <div className="rounded-xl border border-[#FFE4CC] bg-[#FFF4EC] p-4">
              <p className="text-[10px] font-bold tracking-[0.12em] text-[#FF6B00]">
                VEXO GARAGE
              </p>
              <h1 className="mt-1 text-lg font-extrabold leading-tight text-[#4A2C14]">
                {garage.name}
              </h1>
              <p className="mt-1 text-xs text-[#4A2C14]/70">
                {garage.rating.toFixed(1)}★ · {garage.bookingsCount} bookings ·{" "}
                {garage.trafficViews} views
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                <Badge ok={!!garage.motLicenseVerified}>
                  MOT {garage.motLicenseVerified ? "Verified ✓" : "Pending"}
                </Badge>
                <Badge ok>Insurance Verified ✓</Badge>
                <Badge ok={!!garage.companiesHouseVerified}>
                  Co. {garage.companiesHouseVerified ? "Verified ✓" : "Optional"}
                </Badge>
                <Badge ok>Video Verified</Badge>
              </div>
              <p className="mt-3 text-[11px] leading-4 text-[#4A2C14]/65">
                {garage.postcode} · {garage.district}
                {garage.phone ? ` · ${garage.phone}` : ""}
              </p>
            </div>

            <nav className="mt-4 flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
              {NAV.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setNav(item.id)}
                  className={`shrink-0 rounded-lg px-3 py-2.5 text-left text-sm font-bold ${
                    nav === item.id
                      ? "bg-[#FF6B00] text-white"
                      : "text-[#4A2C14]/75 hover:bg-[#FFF4EC]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <Link
                href="/admin"
                className="shrink-0 rounded-lg px-3 py-2.5 text-sm font-bold text-[#4A2C14]/55 hover:bg-[#FFF4EC]"
              >
                Admin /admin
              </Link>
            </nav>
          </div>
        </aside>

        {/* Main */}
        <main className="bg-[#FFFBF7] px-4 py-6 sm:px-6">
          {error ? (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </p>
          ) : null}
          {msg ? (
            <p className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
              {msg}
            </p>
          ) : null}

          {(nav === "dashboard" || nav === "traffic" || nav === "commissions") && (
            <>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                <div>
                  <p className="text-xs font-bold tracking-[0.14em] text-[#FF6B00]">
                    Dashboard
                  </p>
                  <h2 className="text-2xl font-extrabold text-[#4A2C14]">
                    Welcome back, {garage.name}
                  </h2>
                  <p className="mt-1 text-xs text-[#4A2C14]/65">
                    Your car. Your service. Your choice. · National coverage ·
                    Open Across UK Day1 · LIVE TODAY 2026
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void startStripeConnect(garage.id, setError)}
                  className="inline-flex h-10 items-center rounded-lg bg-[#FF6B00] px-4 text-xs font-bold text-white"
                >
                  {garage.stripeConnectId
                    ? "Manage Stripe →"
                    : "Connect Stripe payouts →"}
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label="Bookings This Month"
                  value={String(garage.bookingsCount)}
                  sub={`${pending.length} pending · ${bookings.length} total loaded`}
                />
                <StatCard
                  label="Traffic Views This Week"
                  value={String(garage.trafficViews)}
                  sub="Source: Google ranking + local SEO + promoted"
                />
                <StatCard
                  label="Revenue This Month"
                  value={`£${garageGets}`}
                  sub="Via Stripe Connect · garage 90% share"
                />
                <StatCard
                  label="Rating"
                  value={`${garage.rating.toFixed(1)}★`}
                  sub={`${garage.bookingsCount} bookings · Video Verified`}
                />
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MiniStat
                  label="Boost"
                  value={garage.boostActive ? "Active £199/mo" : "Off"}
                />
                <MiniStat label="Passports" value="+£300 resale" />
                <MiniStat label="Reminders" value="National MOT" />
                <MiniStat
                  label="Widget"
                  value="Free embed"
                  onClick={() => setNav("widget")}
                />
              </div>
            </>
          )}

          {(nav === "dashboard" || nav === "bookings") && (
            <section className="mt-6 rounded-xl border border-[#FFE4CC] bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-extrabold text-[#4A2C14]">
                    Recent Bookings
                  </h3>
                  <p className="text-xs text-[#4A2C14]/60">
                    {pending.length
                      ? `${pending.length} pending — action required`
                      : "Accept / mark completed + upload video proof"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setNav("bookings")}
                  className="text-xs font-bold text-[#FF6B00]"
                >
                  View all bookings
                </button>
              </div>

              {!bookings.length ? (
                <p className="mt-4 text-sm text-[#4A2C14]/65">
                  No bookings yet. When customers book {garage.name}, they appear
                  here (Accept → Upload proof → 48h approve).
                </p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-left text-xs">
                    <thead className="text-[#4A2C14]/55">
                      <tr className="border-b border-[#FFE4CC]">
                        <th className="py-2 pr-3 font-semibold">Booking</th>
                        <th className="py-2 pr-3 font-semibold">Reg</th>
                        <th className="py-2 pr-3 font-semibold">Service</th>
                        <th className="py-2 pr-3 font-semibold">Price</th>
                        <th className="py-2 pr-3 font-semibold">Status</th>
                        <th className="py-2 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b) => (
                        <tr key={b.id} className="border-b border-[#FFF4EC]">
                          <td className="py-3 pr-3 font-bold text-[#4A2C14]">
                            {b.id.slice(0, 10)}…
                          </td>
                          <td className="py-3 pr-3 font-semibold">{b.reg}</td>
                          <td className="py-3 pr-3">{b.service}</td>
                          <td className="py-3 pr-3">
                            £{(b.price / 100).toFixed(2)}
                          </td>
                          <td className="py-3 pr-3">
                            <StatusPill status={b.status} />
                          </td>
                          <td className="py-3">
                            <div className="flex flex-wrap gap-1">
                              {b.status === "pending" ? (
                                <button
                                  type="button"
                                  onClick={() => void acceptBooking(b.id)}
                                  className="rounded-md bg-[#FF6B00] px-2 py-1 font-bold text-white"
                                >
                                  Accept
                                </button>
                              ) : null}
                              <button
                                type="button"
                                onClick={() => {
                                  setProofBookingId(b.id);
                                  setNav("proofs");
                                }}
                                className="rounded-md border border-[#FF6B00] px-2 py-1 font-bold text-[#FF6B00]"
                              >
                                Upload Proof
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {(nav === "dashboard" || nav === "proofs") && (
            <section className="mt-6 rounded-xl border border-[#FFE4CC] bg-white p-5 shadow-sm">
              <h3 className="text-lg font-extrabold text-[#4A2C14]">
                Upload Video Proof — Shield Mandatory
              </h3>
              <p className="mt-1 text-xs text-[#4A2C14]/60">
                No video = payout delayed · 30sec + MOT cert · MinIO / Supabase
                video_proofs · +£2 Shield
              </p>
              <form onSubmit={uploadProof} className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="block space-y-1 md:col-span-2">
                  <span className="text-sm font-semibold text-[#4A2C14]">
                    Booking
                  </span>
                  <select
                    className={inputClass}
                    value={proofBookingId}
                    onChange={(e) => setProofBookingId(e.target.value)}
                    required
                  >
                    <option value="">Select booking…</option>
                    {bookings.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.reg} · {b.service} · {b.status}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block space-y-1 rounded-xl border border-dashed border-[#FF6B00]/50 bg-[#FFF4EC] p-4">
                  <span className="text-sm font-bold text-[#4A2C14]">
                    Video upload 30sec mandatory
                  </span>
                  <p className="text-[11px] text-[#4A2C14]/60">
                    Format mp4 · max 100MB · Badge Mandatory +£2 Shield
                  </p>
                  <input
                    name="video"
                    type="file"
                    accept="video/*"
                    required
                    className="mt-2 block w-full text-sm"
                  />
                </label>
                <label className="block space-y-1 rounded-xl border border-dashed border-[#E7D5C5] bg-[#FFFBF7] p-4">
                  <span className="text-sm font-bold text-[#4A2C14]">
                    MOT cert photo upload
                  </span>
                  <p className="text-[11px] text-[#4A2C14]/60">
                    Format jpg png pdf · max 10MB
                  </p>
                  <input
                    name="cert"
                    type="file"
                    accept="image/*,.pdf"
                    className="mt-2 block w-full text-sm"
                  />
                </label>
                <button
                  type="submit"
                  disabled={proofBusy || !bookings.length}
                  className="md:col-span-2 flex h-12 items-center justify-center rounded-xl bg-[#FF6B00] text-sm font-bold text-white disabled:opacity-60"
                >
                  {proofBusy ? "Uploading…" : "Submit Proof for Approval"}
                </button>
              </form>
              {!bookings.length ? (
                <p className="mt-3 text-sm text-[#4A2C14]/60">
                  Unlocks when you have a booking to prove.
                </p>
              ) : null}
            </section>
          )}

          {(nav === "dashboard" || nav === "boost") && (
            <section className="mt-6 rounded-xl border border-[#FF6B00]/35 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-extrabold text-[#4A2C14]">
                Vexo Boost — Growth Engine
              </h3>
              <p className="mt-1 text-xs text-[#4A2C14]/65">
                £199/mo · Guaranteed 10 bookings/month or refund · Google ranking
                + local SEO + promoted placement · Clean marketing boost
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <StatCard
                  label="Traffic"
                  value={String(garage.trafficViews)}
                  sub="views this week"
                />
                <StatCard
                  label="Bookings"
                  value={String(garage.bookingsCount)}
                  sub={garage.boostActive ? "Boost active" : "Boost off"}
                />
                <StatCard
                  label="Status"
                  value={garage.boostActive ? "Active" : "Off"}
                  sub="Guaranteed 10/mo or refund"
                />
              </div>
              <Link
                href="/boost"
                className="mt-4 inline-flex h-11 items-center rounded-lg bg-[#FF6B00] px-4 text-sm font-bold text-white"
              >
                {garage.boostActive
                  ? "Manage Boost →"
                  : "Upgrade Boost £199/mo →"}
              </Link>
            </section>
          )}

          {nav === "services" && (
            <section className="rounded-xl border border-[#FFE4CC] bg-white p-5">
              <h3 className="text-lg font-extrabold text-[#4A2C14]">
                Services & prices
              </h3>
              <p className="mt-1 text-xs text-[#4A2C14]/60">
                Exact quote not estimate — add anything beyond defaults.
              </p>
              <ul className="mt-4 space-y-2">
                {rows.map((row, idx) => (
                  <li
                    key={`${row.name}-${idx}`}
                    className="flex flex-col gap-2 rounded-lg border border-[#E7D5C5] px-3 py-2 sm:flex-row sm:items-center"
                  >
                    <input
                      className={`${inputClass} sm:flex-1`}
                      value={row.name}
                      onChange={(e) =>
                        setRows((list) =>
                          list.map((r, i) =>
                            i === idx ? { ...r, name: e.target.value } : r,
                          ),
                        )
                      }
                    />
                    <span className="flex items-center gap-2">
                      £
                      <input
                        type="number"
                        min={0}
                        className="h-11 w-24 rounded-lg border border-[#E7D5C5] px-2 text-sm"
                        value={row.price}
                        onChange={(e) =>
                          setRows((list) =>
                            list.map((r, i) =>
                              i === idx ? { ...r, price: e.target.value } : r,
                            ),
                          )
                        }
                      />
                      <button
                        type="button"
                        className="text-xs font-bold text-red-600"
                        onClick={() =>
                          setRows((list) => list.filter((_, i) => i !== idx))
                        }
                      >
                        Remove
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-col gap-2 rounded-lg bg-[#FFF4EC] p-4 sm:flex-row">
                <input
                  className={`${inputClass} flex-1`}
                  placeholder="Add another service"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
                <input
                  type="number"
                  className={`${inputClass} sm:w-28`}
                  placeholder="£"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                />
                <button
                  type="button"
                  className="h-11 rounded-lg border border-[#FF6B00] px-4 text-sm font-bold text-[#FF6B00]"
                  onClick={() => {
                    const name = newName.trim();
                    if (!name) return;
                    if (rows.some((r) => r.name.toLowerCase() === name.toLowerCase())) {
                      setError("Service already listed");
                      return;
                    }
                    setRows((r) => [...r, { name, price: newPrice || "0" }]);
                    setNewName("");
                    setNewPrice("");
                  }}
                >
                  Add
                </button>
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={() => void saveServices()}
                className="mt-4 flex h-12 w-full items-center justify-center rounded-xl bg-[#FF6B00] text-sm font-bold text-white disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save services & prices"}
              </button>
            </section>
          )}

          {nav === "settings" && (
            <section className="rounded-xl border border-[#FFE4CC] bg-white p-5">
              <h3 className="text-lg font-extrabold text-[#4A2C14]">Settings</h3>
              <div className="mt-4 space-y-3">
                <label className="block space-y-1">
                  <span className="text-sm font-semibold">Company name</span>
                  <input
                    className={inputClass}
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-sm font-semibold">Phone</span>
                  <input
                    className={inputClass}
                    value={accountPhone}
                    onChange={(e) => setAccountPhone(e.target.value)}
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-sm font-semibold">Postcode</span>
                  <input
                    className={`${inputClass} uppercase`}
                    value={accountPostcode}
                    onChange={(e) => setAccountPostcode(e.target.value)}
                  />
                </label>
                <p className="text-xs text-[#4A2C14]/55">
                  Login: {garage.email || "—"} · Stripe:{" "}
                  {garage.stripeConnectId || "not connected"}
                </p>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void saveSettings()}
                  className="flex h-12 w-full items-center justify-center rounded-xl bg-[#FF6B00] text-sm font-bold text-white disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save settings"}
                </button>
              </div>
            </section>
          )}

          {nav === "widget" && (
            <section className="rounded-xl border border-[#FFE4CC] bg-white p-5">
              <h3 className="text-lg font-extrabold text-[#4A2C14]">
                Free embed widget
              </h3>
              <p className="mt-1 text-xs text-[#4A2C14]/60">
                Drop this on your garage site — customers book without leaving.
              </p>
              <pre className="mt-4 overflow-x-auto rounded-lg bg-[#FFF4EC] p-4 text-[11px] text-[#4A2C14]">
{`<iframe src="https://app.vexogarage.co.uk/widget/${garage.id}" width="100%" height="520" style="border:0;border-radius:12px" title="${garage.name} booking"></iframe>`}
              </pre>
              <button
                type="button"
                className="mt-3 inline-flex h-10 items-center rounded-lg border border-[#FF6B00] px-4 text-sm font-bold text-[#FF6B00]"
                onClick={() => {
                  const code = `<iframe src="https://app.vexogarage.co.uk/widget/${garage.id}" width="100%" height="520" style="border:0;border-radius:12px" title="${garage.name} booking"></iframe>`;
                  void navigator.clipboard.writeText(code);
                  setMsg("Widget code copied.");
                }}
              >
                Copy widget code
              </button>
            </section>
          )}

          {(nav === "passports" || nav === "reminders") && (
            <section className="rounded-xl border border-[#FFE4CC] bg-white p-5">
              <h3 className="text-lg font-extrabold text-[#4A2C14]">
                {nav === "passports" ? "Passports" : "Reminders"}
              </h3>
              <p className="mt-2 text-sm text-[#4A2C14]/70">
                {nav === "passports"
                  ? "Permanent vehicle passports (+£300 resale) appear here as jobs complete with proof."
                  : "National MOT reminders drive return bookings to your district. Stats fill as traffic runs."}
              </p>
            </section>
          )}

          {nav === "commissions" && (
            <section className="mt-6 rounded-xl border border-[#FFE4CC] bg-white p-5">
              <h3 className="text-lg font-extrabold text-[#4A2C14]">
                Commissions · {garage.district}
              </h3>
              <p className="mt-1 text-xs text-[#4A2C14]/60">
                Garage 90% · Vexo 10% (+ Shield + Passport) · Stripe Connect
                auto-split
              </p>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-xs">
                  <thead className="text-[#4A2C14]/55">
                    <tr className="border-b border-[#FFE4CC]">
                      <th className="py-2 pr-3">District</th>
                      <th className="py-2 pr-3">Bookings</th>
                      <th className="py-2 pr-3">Garage 90%</th>
                      <th className="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-3 pr-3 font-bold">
                        {garage.district} · {garage.name}
                      </td>
                      <td className="py-3 pr-3">{garage.bookingsCount}</td>
                      <td className="py-3 pr-3">£{garageGets}</td>
                      <td className="py-3">
                        <span className="rounded-full bg-green-100 px-2 py-0.5 font-bold text-[#0A7A3E]">
                          {garage.stripeConnectId ? "Ready" : "Connect Stripe"}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <p className="mt-8 text-center text-[10px] tracking-wide text-[#4A2C14]/45">
            Production Ready LIVE TODAY · /garage/dashboard · Page 20 of 38 ·
            White #FFF · Orange #FF6B00 · Brown #4A2C14 · Light orange #FFF4EC
          </p>
        </main>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] max-w-[100vw] overflow-x-hidden bg-[#FFFBF7] text-[#4A2C14]">
      {children}
    </div>
  );
}

function Badge({
  children,
  ok,
}: {
  children: ReactNode;
  ok?: boolean;
}) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
        ok
          ? "bg-green-100 text-[#0A7A3E]"
          : "bg-[#FFF4EC] text-[#4A2C14]/60"
      }`}
    >
      {children}
    </span>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl border border-[#FFE4CC] bg-white px-4 py-3 shadow-sm">
      <p className="text-[11px] font-semibold text-[#4A2C14]/55">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-[#4A2C14]">{value}</p>
      <p className="mt-1 text-[11px] text-[#4A2C14]/60">{sub}</p>
    </div>
  );
}

function MiniStat({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick?: () => void;
}) {
  const className =
    "rounded-xl border border-[#FFE4CC] bg-white px-3 py-2 text-left shadow-sm";
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        <p className="text-[10px] font-semibold text-[#4A2C14]/55">{label}</p>
        <p className="text-sm font-extrabold text-[#4A2C14]">{value}</p>
      </button>
    );
  }
  return (
    <div className={className}>
      <p className="text-[10px] font-semibold text-[#4A2C14]/55">{label}</p>
      <p className="text-sm font-extrabold text-[#4A2C14]">{value}</p>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const tone =
    status === "pending"
      ? "bg-[#FFF4EC] text-[#FF6B00]"
      : status === "proof_uploaded"
        ? "bg-green-100 text-[#0A7A3E]"
        : "bg-[#F0F4FF] text-[#0A66FF]";
  return (
    <span className={`rounded-full px-2 py-0.5 font-bold capitalize ${tone}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

async function startStripeConnect(
  garageId: string,
  setError: (msg: string | null) => void,
) {
  setError(null);
  try {
    const res = await fetch("/api/stripe/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ garageId }),
    });
    const data = (await res.json()) as { error?: string; url?: string };
    if (!res.ok || !data.url) {
      throw new Error(data.error || "Could not start Stripe Connect");
    }
    window.location.href = data.url;
  } catch (e) {
    setError(e instanceof Error ? e.message : "Stripe Connect failed");
  }
}
