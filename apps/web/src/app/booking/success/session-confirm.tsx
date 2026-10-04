"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SessionPayload = {
  session?: {
    id: string;
    status: string | null;
    paymentStatus: string | null;
    amountTotal: number | null;
    currency: string | null;
    paymentIntentId: string | null;
  };
  booking?: {
    id: string;
    reg: string;
    service: string;
    status: string;
    postcode: string;
    garage?: { name: string } | null;
  } | null;
  error?: string;
};

export function SessionConfirm({ sessionId }: { sessionId: string }) {
  const [data, setData] = useState<SessionPayload | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/stripe/session?session_id=${encodeURIComponent(sessionId)}`,
        );
        const json = (await res.json()) as SessionPayload;
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setData({ error: "Could not load session" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (!data) {
    return (
      <p className="mt-8 text-sm text-[#4A2C14]/60">Confirming Stripe session…</p>
    );
  }

  if (data.error) {
    return <p className="mt-8 text-sm text-red-700">{data.error}</p>;
  }

  const amount =
    data.session?.amountTotal != null
      ? `£${(data.session.amountTotal / 100).toFixed(2)}`
      : "—";

  return (
    <div className="mt-8 space-y-4 border-t border-[#E7D5C5] pt-6 text-sm">
      <Row label="Session" value={data.session?.id || sessionId} />
      <Row label="Status" value={data.session?.status || "—"} />
      <Row label="Payment" value={data.session?.paymentStatus || "—"} />
      <Row label="Amount" value={amount} />
      {data.booking ? (
        <>
          <Row label="Booking" value={data.booking.id} />
          <Row label="Reg" value={data.booking.reg} />
          <Row label="Service" value={data.booking.service} />
          <Row label="Garage" value={data.booking.garage?.name || "—"} />
          <Row label="Booking status" value={data.booking.status} />
          <Link
            href={`/booking/${data.booking.id}`}
            className="mt-4 flex h-12 w-full items-center justify-center rounded-md bg-[#FF6B00] text-sm font-bold text-white"
          >
            View booking
          </Link>
        </>
      ) : (
        <p className="text-[#4A2C14]/70">
          Subscription or session without booking — check Boost dashboard if
          applicable.
        </p>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-[#4A2C14]/60">{label}</span>
      <span className="max-w-[60%] truncate text-right font-semibold">{value}</span>
    </div>
  );
}
