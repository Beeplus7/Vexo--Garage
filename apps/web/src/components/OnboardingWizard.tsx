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

const STEPS = [
  { id: "welcome", title: "Welcome" },
  { id: "role", title: "You" },
  { id: "details", title: "Details" },
  { id: "vehicle", title: "Ready" },
] as const;

export function OnboardingWizard({ email, defaults }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [flipKey, setFlipKey] = useState(0);
  const [dir, setDir] = useState<"next" | "back">("next");
  const [fullName, setFullName] = useState(defaults.fullName);
  const [phone, setPhone] = useState(defaults.phone);
  const [postcode, setPostcode] = useState(defaults.postcode);
  const [reg, setReg] = useState(defaults.reg);
  const [role, setRole] = useState<"customer" | "garage">(defaults.role);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function go(to: number) {
    if (to < 0 || to >= STEPS.length) return;
    setDir(to > step ? "next" : "back");
    setStep(to);
    setFlipKey((k) => k + 1);
    setError(null);
  }

  function nextFromWelcome() {
    go(1);
  }

  function nextFromRole() {
    go(2);
  }

  function nextFromDetails() {
    if (!fullName.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!postcode.trim()) {
      setError("Postcode helps us match nearby garages");
      return;
    }
    go(3);
  }

  async function finish() {
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
        router.replace("/garages");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onboarding failed");
      setBusy(false);
    }
  }

  return (
    <div className="w-full">
      {/* Progress */}
      <div className="mb-8 flex items-center justify-between gap-2">
        {STEPS.map((s, i) => {
          const active = i === step;
          const done = i < step;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => i < step && go(i)}
              className="flex min-w-0 flex-1 flex-col items-center gap-2"
              aria-current={active ? "step" : undefined}
            >
              <span
                className={[
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition",
                  done
                    ? "bg-[#0A7A3E] text-white"
                    : active
                      ? "bg-[#FF6B00] text-white shadow-[0_8px_20px_rgba(255,107,0,0.35)]"
                      : "bg-white text-[#4A2C14]/45 ring-1 ring-[#E7D5C5]",
                ].join(" ")}
              >
                {done ? "✓" : i + 1}
              </span>
              <span
                className={[
                  "truncate text-[11px] font-semibold tracking-wide",
                  active ? "text-[#FF6B00]" : "text-[#4A2C14]/45",
                ].join(" ")}
              >
                {s.title}
              </span>
            </button>
          );
        })}
      </div>

      {error ? (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="vexo-flip-stage">
        <div
          key={flipKey}
          className={[
            "vexo-flip-card rounded-2xl border border-[#E7D5C5] bg-white p-6 shadow-[0_20px_50px_rgba(74,44,20,0.08)] md:p-8",
            dir === "next" ? "is-next" : "is-back",
          ].join(" ")}
        >
          {step === 0 ? (
            <WelcomeStep onNext={nextFromWelcome} />
          ) : null}
          {step === 1 ? (
            <RoleStep
              role={role}
              onChange={setRole}
              onBack={() => go(0)}
              onNext={nextFromRole}
            />
          ) : null}
          {step === 2 ? (
            <DetailsStep
              email={email}
              fullName={fullName}
              phone={phone}
              postcode={postcode}
              setFullName={setFullName}
              setPhone={setPhone}
              setPostcode={setPostcode}
              onBack={() => go(1)}
              onNext={nextFromDetails}
            />
          ) : null}
          {step === 3 ? (
            <VehicleStep
              reg={reg}
              setReg={setReg}
              role={role}
              busy={busy}
              onBack={() => go(2)}
              onFinish={finish}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center">
      <div className="relative mx-auto mb-6 flex h-40 w-40 items-center justify-center">
        <span className="vexo-pulse-ring absolute inset-0 rounded-full bg-[#FF6B00]/25" />
        <span className="vexo-pulse-ring absolute inset-3 rounded-full bg-[#FF6B00]/15 [animation-delay:0.6s]" />
        <div className="vexo-float relative z-10">
          <ShieldGraphic />
        </div>
      </div>
      <p className="text-xs font-bold tracking-[0.14em] text-[#FF6B00]">
        Welcome to Vexo Garage
      </p>
      <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#4A2C14] md:text-3xl">
        Book with proof. Pay with trust.
      </h2>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-6 tracking-wide text-[#4A2C14]/75">
        Escrow holds payment until Shield video proof. Nearby garages. Your Passport
        history in one place.
      </p>
      <ul className="mx-auto mt-6 grid max-w-sm gap-2 text-left text-sm text-[#4A2C14]/85">
        <InfoRow icon="🔒" text="Funds held until you approve the job" />
        <InfoRow icon="🎬" text="Shield video proof from the bay" />
        <InfoRow icon="📍" text="Matched to garages near your postcode" />
      </ul>
      <button
        type="button"
        onClick={onNext}
        className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-md bg-[#FF6B00] text-sm font-bold text-white"
      >
        Start welcome tour
      </button>
    </div>
  );
}

function RoleStep({
  role,
  onChange,
  onBack,
  onNext,
}: {
  role: "customer" | "garage";
  onChange: (r: "customer" | "garage") => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div>
      <div className="mb-5 flex justify-center">
        <div className="vexo-float">
          <PeopleGraphic />
        </div>
      </div>
      <h2 className="text-center text-2xl font-extrabold tracking-tight text-[#4A2C14]">
        Who are you joining as?
      </h2>
      <p className="mt-2 text-center text-sm tracking-wide text-[#4A2C14]/70">
        Flip the card that fits — you can change later in support.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <RoleCard
          active={role === "customer"}
          title="Driver"
          subtitle="Book MOT & service"
          graphic={<CarGraphic />}
          onClick={() => onChange("customer")}
        />
        <RoleCard
          active={role === "garage"}
          title="Garage"
          subtitle="Win local bookings"
          graphic={<GarageGraphic />}
          onClick={() => onChange("garage")}
        />
      </div>
      <WizardNav onBack={onBack} onNext={onNext} nextLabel="Continue" />
    </div>
  );
}

function DetailsStep({
  email,
  fullName,
  phone,
  postcode,
  setFullName,
  setPhone,
  setPostcode,
  onBack,
  onNext,
}: {
  email: string;
  fullName: string;
  phone: string;
  postcode: string;
  setFullName: (v: string) => void;
  setPhone: (v: string) => void;
  setPostcode: (v: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div>
      <div className="mb-5 flex justify-center">
        <div className="vexo-float">
          <MapGraphic />
        </div>
      </div>
      <h2 className="text-center text-2xl font-extrabold tracking-tight text-[#4A2C14]">
        Your details
      </h2>
      <p className="mt-2 text-center text-sm tracking-wide text-[#4A2C14]/70">
        We use postcode to rank garages within about 0.3 miles first.
      </p>
      <div className="mt-6 space-y-3">
        <Field label="Email">
          <input
            value={email}
            disabled
            className="h-12 w-full rounded-md border border-[#E7D5C5] bg-[#FFF4EC] px-3 text-sm tracking-wide"
          />
        </Field>
        <Field label="Full name">
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="h-12 w-full rounded-md border border-[#E7D5C5] bg-white px-3 text-sm tracking-wide"
            placeholder="Jane Driver"
          />
        </Field>
        <Field label="Mobile (optional)">
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-12 w-full rounded-md border border-[#E7D5C5] bg-white px-3 text-sm tracking-wide"
            placeholder="07… or +44…"
          />
        </Field>
        <Field label="Postcode">
          <input
            required
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            className="h-12 w-full rounded-md border border-[#E7D5C5] bg-white px-3 text-sm tracking-wide uppercase"
            placeholder="OL8 4AB"
          />
        </Field>
      </div>
      <WizardNav onBack={onBack} onNext={onNext} nextLabel="Almost there" />
    </div>
  );
}

function VehicleStep({
  reg,
  setReg,
  role,
  busy,
  onBack,
  onFinish,
}: {
  reg: string;
  setReg: (v: string) => void;
  role: "customer" | "garage";
  busy: boolean;
  onBack: () => void;
  onFinish: () => void;
}) {
  return (
    <div>
      <div className="mb-5 flex justify-center">
        <div className="vexo-float">
          <PassportGraphic />
        </div>
      </div>
      <h2 className="text-center text-2xl font-extrabold tracking-tight text-[#4A2C14]">
        {role === "garage" ? "You’re set for garage signup" : "Add your car (optional)"}
      </h2>
      <p className="mt-2 text-center text-sm tracking-wide text-[#4A2C14]/70">
        {role === "garage"
          ? "Next we’ll open garage signup so you can list services and Connect payouts."
          : "Reg unlocks Passport history and faster MOT booking. Skip if you prefer."}
      </p>
      {role === "customer" ? (
        <div className="mt-6">
          <Field label="Vehicle registration">
            <input
              value={reg}
              onChange={(e) => setReg(e.target.value)}
              className="h-12 w-full rounded-md border border-[#E7D5C5] bg-white px-3 text-sm font-bold tracking-[0.2em] uppercase"
              placeholder="AB12 CDE"
            />
          </Field>
        </div>
      ) : (
        <div className="mt-6 rounded-xl bg-[#FFF4EC] px-4 py-3 text-sm tracking-wide text-[#4A2C14]/80">
          Free to join · Garage keeps 90% · Boost optional £199/mo
        </div>
      )}
      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-12 flex-1 items-center justify-center rounded-md border border-[#E7D5C5] bg-white text-sm font-bold text-[#4A2C14]"
        >
          Back
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onFinish}
          className="inline-flex h-12 flex-[1.4] items-center justify-center rounded-md bg-[#FF6B00] text-sm font-bold text-white disabled:opacity-60"
        >
          {busy
            ? "Saving…"
            : role === "garage"
              ? "Continue to garage signup"
              : "Find garages near me"}
        </button>
      </div>
    </div>
  );
}

function WizardNav({
  onBack,
  onNext,
  nextLabel,
}: {
  onBack: () => void;
  onNext: () => void;
  nextLabel: string;
}) {
  return (
    <div className="mt-8 flex gap-3">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex h-12 flex-1 items-center justify-center rounded-md border border-[#E7D5C5] bg-white text-sm font-bold text-[#4A2C14]"
      >
        Back
      </button>
      <button
        type="button"
        onClick={onNext}
        className="inline-flex h-12 flex-[1.4] items-center justify-center rounded-md bg-[#FF6B00] text-sm font-bold text-white"
      >
        {nextLabel}
      </button>
    </div>
  );
}

function RoleCard({
  active,
  title,
  subtitle,
  graphic,
  onClick,
}: {
  active: boolean;
  title: string;
  subtitle: string;
  graphic: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-xl border px-4 py-5 text-left transition",
        active
          ? "border-[#FF6B00] bg-[#FFF4EC] shadow-[0_12px_28px_rgba(255,107,0,0.18)]"
          : "border-[#E7D5C5] bg-white hover:border-[#FF6B00]/50",
      ].join(" ")}
    >
      <div className="mb-3 flex h-14 items-center justify-center">{graphic}</div>
      <p className="text-base font-extrabold text-[#4A2C14]">{title}</p>
      <p className="mt-1 text-xs tracking-wide text-[#4A2C14]/65">{subtitle}</p>
    </button>
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
      <span className="text-sm font-semibold tracking-wide text-[#4A2C14]">
        {label}
      </span>
      {children}
    </label>
  );
}

function InfoRow({ icon, text }: { icon: string; text: string }) {
  return (
    <li className="flex items-start gap-2 rounded-lg bg-[#FFF4EC] px-3 py-2">
      <span aria-hidden>{icon}</span>
      <span className="tracking-wide">{text}</span>
    </li>
  );
}

/* ——— Infographics (inline SVG) ——— */

function ShieldGraphic() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden>
      <rect width="120" height="120" rx="28" fill="#FFF4EC" />
      <path
        d="M60 18L92 32V58C92 78 78 94 60 102C42 94 28 78 28 58V32L60 18Z"
        fill="#FF6B00"
      />
      <path
        d="M46 58L55 67L76 46"
        stroke="white"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="88" cy="28" r="10" fill="#0A7A3E" />
      <path
        d="M84 28h8M88 24v8"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PeopleGraphic() {
  return (
    <svg width="100" height="72" viewBox="0 0 100 72" fill="none" aria-hidden>
      <circle cx="34" cy="24" r="12" fill="#FF6B00" />
      <path d="M14 62c2-14 12-22 20-22s18 8 20 22" fill="#4A2C14" opacity="0.85" />
      <circle cx="70" cy="22" r="11" fill="#0A7A3E" />
      <path d="M52 62c2-12 10-20 18-20s16 8 18 20" fill="#4A2C14" opacity="0.55" />
    </svg>
  );
}

function CarGraphic() {
  return (
    <svg width="72" height="44" viewBox="0 0 72 44" fill="none" aria-hidden>
      <path
        d="M10 28h52l-4-12c-1-4-4-6-8-6H26c-4 0-7 2-8 6l-8 12z"
        fill="#FF6B00"
      />
      <rect x="8" y="28" width="56" height="8" rx="3" fill="#4A2C14" />
      <circle cx="22" cy="36" r="6" fill="#FFF4EC" stroke="#4A2C14" strokeWidth="3" />
      <circle cx="52" cy="36" r="6" fill="#FFF4EC" stroke="#4A2C14" strokeWidth="3" />
    </svg>
  );
}

function GarageGraphic() {
  return (
    <svg width="72" height="52" viewBox="0 0 72 52" fill="none" aria-hidden>
      <path d="M8 24L36 6l28 18v24H8V24z" fill="#4A2C14" />
      <rect x="18" y="28" width="36" height="20" fill="#FF6B00" />
      <path d="M22 34h28M22 39h28M22 44h28" stroke="#FFF4EC" strokeWidth="2" />
    </svg>
  );
}

function MapGraphic() {
  return (
    <svg width="110" height="80" viewBox="0 0 110 80" fill="none" aria-hidden>
      <rect x="8" y="10" width="94" height="60" rx="16" fill="#FFF4EC" />
      <path
        d="M20 48c12-18 22-26 35-26s22 10 35 28"
        stroke="#E7D5C5"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="55" cy="30" r="14" fill="#FF6B00" />
      <circle cx="55" cy="30" r="5" fill="white" />
      <path d="M55 44v16" stroke="#FF6B00" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function PassportGraphic() {
  return (
    <svg width="120" height="80" viewBox="0 0 120 80" fill="none" aria-hidden>
      <rect x="18" y="12" width="84" height="56" rx="10" fill="#4A2C14" />
      <rect x="26" y="20" width="68" height="40" rx="6" fill="#FF6B00" />
      <text
        x="60"
        y="45"
        textAnchor="middle"
        fill="white"
        fontSize="14"
        fontWeight="800"
        fontFamily="ui-sans-serif, system-ui"
      >
        AB12 CDE
      </text>
    </svg>
  );
}
