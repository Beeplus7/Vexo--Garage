"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SiteChrome } from "@/components/SiteChrome";

type Booking = {
  id: string;
  reg: string;
  postcode: string;
  service: string;
  price: number;
  status: string;
  videoProofUrl: string | null;
  motCertUrl: string | null;
  passportHash: string | null;
  garage: {
    id: string;
    name: string;
    postcode: string;
    district: string;
    phone: string | null;
    rating: number;
  } | null;
  proof: {
    videoUrl: string;
    certUrl: string | null;
    aiVerified: boolean;
  } | null;
};

export function BookingDetail({ bookingId }: { bookingId: string }) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/bookings/${bookingId}`);
        const data = (await res.json()) as {
          error?: string;
          booking?: Booking;
        };
        if (!res.ok) throw new Error(data.error || "Load failed");
        if (!cancelled) setBooking(data.booking || null);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Load failed");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  async function act(action: "approve" | "dispute") {
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      const res = await fetch("/api/shield/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, action }),
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) throw new Error(data.error || "Action failed");
      setMsg(data.message || `${action} ok`);
      const refresh = await fetch(`/api/bookings/${bookingId}`);
      const refreshed = (await refresh.json()) as { booking?: Booking };
      if (refreshed.booking) setBooking(refreshed.booking);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <SiteChrome variant="app">
        <main className="mx-auto max-w-2xl px-6 py-16 text-sm text-[#4A2C14]/70">
          Loading booking…
        </main>
      </SiteChrome>
    );
  }

  if (!booking) {
    return (
      <SiteChrome variant="app">
        <main className="mx-auto max-w-2xl px-6 py-16">
          <p className="text-sm text-red-700">{error || "Booking not found"}</p>
          <Link href="/garages" className="mt-4 inline-block text-[#FF6B00]">
            ← Back to garages
          </Link>
        </main>
      </SiteChrome>
    );
  }

  const canDecide =
    booking.proof ||
    booking.videoProofUrl ||
    ["proof_uploaded", "accepted", "completed"].includes(booking.status);

  return (
    <SiteChrome variant="app">
      <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
        <p className="text-xs font-bold tracking-[0.14em] text-[#FF6B00]">
          Booking · 48h escrow
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-[#4A2C14]">
          {booking.service} · {booking.reg}
        </h1>
        <p className="mt-1 text-sm text-[#4A2C14]/70">
          £{(booking.price / 100).toFixed(2)} · {booking.status} ·{" "}
          {booking.garage?.name || "Garage"} · {booking.postcode}
        </p>

        {error ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        ) : null}
        {msg ? (
          <p className="mt-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
            {msg}
          </p>
        ) : null}

        <section className="mt-6 rounded-xl border border-[#FFE4CC] bg-white p-5">
          <h2 className="text-lg font-extrabold text-[#4A2C14]">
            Video proof · Shield
          </h2>
          {booking.proof?.videoUrl || booking.videoProofUrl ? (
            <div className="mt-3 space-y-2 text-sm">
              <a
                className="font-bold text-[#FF6B00]"
                href={booking.proof?.videoUrl || booking.videoProofUrl || "#"}
                target="_blank"
                rel="noreferrer"
              >
                Open video proof →
              </a>
              {(booking.proof?.certUrl || booking.motCertUrl) && (
                <a
                  className="block font-bold text-[#FF6B00]"
                  href={booking.proof?.certUrl || booking.motCertUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open MOT certificate →
                </a>
              )}
              <p className="text-xs text-[#4A2C14]/60">
                AI verified:{" "}
                {booking.proof?.aiVerified ? "Yes ✓" : "Pending"} · Approve
                within 48h to capture escrow
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-[#4A2C14]/65">
              Waiting for garage to upload 30sec video + MOT cert. Garage console:{" "}
              <Link href="/garage/manage" className="font-bold text-[#FF6B00]">
                /garage/manage
              </Link>
            </p>
          )}

          {canDecide && booking.status !== "completed" && booking.status !== "disputed" ? (
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => void act("approve")}
                className="inline-flex h-11 items-center rounded-lg bg-[#FF6B00] px-4 text-sm font-bold text-white disabled:opacity-60"
              >
                Approve · release payout
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void act("dispute")}
                className="inline-flex h-11 items-center rounded-lg border border-red-300 px-4 text-sm font-bold text-red-700 disabled:opacity-60"
              >
                Dispute · refund
              </button>
            </div>
          ) : null}

          {booking.passportHash ? (
            <p className="mt-4 text-xs text-[#0A7A3E]">
              Passport hash: {booking.passportHash.slice(0, 24)}…
            </p>
          ) : null}
        </section>
      </main>
    </SiteChrome>
  );
}
