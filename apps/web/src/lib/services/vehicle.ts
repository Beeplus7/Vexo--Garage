/** UK reg: allow formats like OL08 4AB / OL084AB */
export function normalizeReg(input: string) {
  return input.replace(/\s+/g, "").toUpperCase();
}

export function isValidUkReg(input: string) {
  const reg = normalizeReg(input);
  // Broad UK plate patterns (current + older)
  return /^[A-Z]{1,3}\d{1,4}[A-Z]{0,3}$/.test(reg) && reg.length >= 5 && reg.length <= 8;
}

export function vehicleApiConfigured() {
  return Boolean(process.env.DVLA_API_KEY);
}

export function motApiConfigured() {
  return Boolean(process.env.DVSA_API_KEY);
}
