// Framing policy shared by next.config.ts (static headers) and src/middleware.ts
// (per-request CSP). Kept dependency-free so it runs in both Node and the Edge
// runtime.
//
// PORTFOLIO_ORIGINS lists the origins allowed to embed this site in an
// <iframe>, separated by spaces and/or commas, e.g.
//   PORTFOLIO_ORIGINS="https://example.com http://localhost:3000"
// Unset/empty → framing is blocked entirely (frame-ancestors 'none' + DENY).

/**
 * Parse PORTFOLIO_ORIGINS into a de-duplicated list of plain http(s) origins.
 * Anything that isn't `http(s)://host[:port]` (optionally with a single
 * trailing slash) is ignored, so no paths, queries, wildcards, credentials or
 * CSP keywords can get into the header.
 */
export function parseFrameOrigins(raw: string | undefined | null): string[] {
  if (!raw) return [];
  const out = new Set<string>();
  for (const token of raw.split(/[\s,]+/)) {
    if (!token || /[*'";]/.test(token)) continue; // wildcards / CSP syntax
    let url: URL;
    try {
      url = new URL(token);
    } catch {
      continue;
    }
    if (url.protocol !== 'https:' && url.protocol !== 'http:') continue;
    if (!url.hostname || url.username || url.password) continue;
    // Origin only: allow at most a bare trailing "/", nothing after it.
    if (url.pathname !== '/' || url.search || url.hash || /[?#]/.test(token)) continue;
    if (!/^https?:\/\/[^/]+\/?$/i.test(token)) continue;
    out.add(url.origin); // normalised: lowercase host, default port dropped
  }
  return [...out];
}

/** The origins allowed to frame the site, read from the environment. */
export const getFrameOrigins = (): string[] =>
  parseFrameOrigins(process.env.PORTFOLIO_ORIGINS);

/** CSP `frame-ancestors` directive for the given allowlist. */
export const frameAncestorsDirective = (origins: string[]): string =>
  origins.length ? `frame-ancestors 'self' ${origins.join(' ')}` : "frame-ancestors 'none'";
