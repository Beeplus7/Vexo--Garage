/** Public origin for auth redirects (never leak 127.0.0.1 / https://localhost). */
export function getAuthOrigin(request: Request): string {
  const url = new URL(request.url);
  const hostHeader = request.headers.get("x-forwarded-host") || request.headers.get("host") || url.host;
  const host = hostHeader.split(",")[0]?.trim() || url.host;
  const protoHeader = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();

  const isLocal =
    host.startsWith("localhost") ||
    host.startsWith("127.0.0.1") ||
    host.endsWith(".localhost");

  if (isLocal) {
    // Local Next is HTTP only — never https://localhost
    const port = host.includes(":") ? "" : ":3001";
    const withPort = host.includes(":") ? host : `${host}${port}`;
    return `http://${withPort}`;
  }

  const proto = protoHeader || (host.includes("vexogarage.co.uk") ? "https" : url.protocol.replace(":", ""));
  return `${proto}://${host}`;
}

export function getBrowserAuthOrigin(): string {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_APP_URL || "https://app.vexogarage.co.uk";
  }
  const { hostname, port } = window.location;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return `http://${hostname}:${port || "3001"}`;
  }
  return window.location.origin;
}
