/** Normalise UK-friendly input to E.164. */
export function toE164(input: string): string | null {
  const raw = input.trim().replace(/[\s()-]/g, "");
  if (!raw) return null;
  if (/^\+[1-9]\d{7,14}$/.test(raw)) return raw;
  // UK local 07… → +447…
  if (/^07\d{9}$/.test(raw)) return `+44${raw.slice(1)}`;
  // UK without leading 0: 7xxxxxxxxx
  if (/^7\d{9}$/.test(raw)) return `+44${raw}`;
  // digits with country already (44…)
  if (/^44\d{9,10}$/.test(raw)) return `+${raw}`;
  return null;
}
