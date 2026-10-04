"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";

type Props = {
  email: string;
  defaults: {
    fullName: string;
    phone: string;
    postcode: string;
    reg: string;
    role: "customer" | "garage";
  };
};

export function OnboardingForm({ email, defaults }: Props) {
  const router = useRouter();
  const [fullName, setFullName] = useState(defaults.fullName);
  const [phone, setPhone] = useState(defaults.phone);
  const [postcode, setPostcode] = useState(defaults.postcode);
  const [reg, setReg] = useState(defaults.reg);
  const [role, setRole] = useState<"customer" | "garage">(defaults.role);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const cleanPostcode = postcode.trim().toUpperCase();
    const district = cleanPostcode.split(/\s+/)[0] || "";
    const cleanReg = reg.trim().toUpperCase().replace(/\s/g, "");

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          phone: phone.trim() || null,
          postcode: cleanPostcode,
          district,
          reg: cleanReg || null,
          role,
          onboarding_complete: true,
        },
      });
      if (updateError) throw updateError;

      // Best-effort customer row for booking flows
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          fullName: fullName.trim(),
          phone: phone.trim() || null,
          postcode: cleanPostcode,
          district,
          reg: cleanReg || null,
          role,
        }),
      });

      if (role === "garage") {
        router.replace("/garage/signup");
      } else {
        router.replace("/");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onboarding failed");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <Field label="Email">
        <input
          value={email}
          disabled
          className="h-12 w-full rounded-md border border-[#E7D5C5] bg-[#FFF4EC] px-3 text-sm"
        />
      </Field>

      <Field label="Full name">
        <input
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="h-12 w-full rounded-md border border-[#E7D5C5] bg-white px-3 text-sm"
          placeholder="Jane Driver"
        />
      </Field>

      <Field label="Mobile (optional — Twilio later)">
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="h-12 w-full rounded-md border border-[#E7D5C5] bg-white px-3 text-sm"
          placeholder="+44 7…"
        />
      </Field>

      <Field label="Postcode">
        <input
          required
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
          className="h-12 w-full rounded-md border border-[#E7D5C5] bg-white px-3 text-sm"
          placeholder="OL8 4AB"
        />
      </Field>

      <Field label="Vehicle reg (optional)">
        <input
          value={reg}
          onChange={(e) => setReg(e.target.value)}
          className="h-12 w-full rounded-md border border-[#E7D5C5] bg-white px-3 text-sm uppercase"
          placeholder="OL08 4AB"
        />
      </Field>

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold text-[#4A2C14]">I am a</legend>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="role"
            checked={role === "customer"}
            onChange={() => setRole("customer")}
          />
          Driver / customer
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="role"
            checked={role === "garage"}
            onChange={() => setRole("garage")}
          />
          Garage owner
        </label>
      </fieldset>

      <button
        type="submit"
        disabled={busy}
        className="flex h-12 w-full items-center justify-center rounded-md bg-[#FF6B00] text-sm font-bold text-white disabled:opacity-60"
      >
        {busy ? "Saving…" : "Continue"}
      </button>
    </form>
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
