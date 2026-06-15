import { NextRequest, NextResponse } from 'next/server';

type RateBucket = {
  count: number;
  resetAt: number;
};

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 80;
const CLEANUP_INTERVAL_MS = 5 * 60_000;

const globalStore = globalThis as typeof globalThis & {
  __nrRateLimitStore?: Map<string, RateBucket>;
  __nrRateLimitCleanupAt?: number;
};

const rateStore = globalStore.__nrRateLimitStore ?? new Map<string, RateBucket>();
globalStore.__nrRateLimitStore = rateStore;

const getClientIp = (request: NextRequest) => {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
};

const cleanupOldBuckets = (now: number) => {
  const nextCleanupAt = globalStore.__nrRateLimitCleanupAt ?? 0;
  if (now < nextCleanupAt) return;

  for (const [key, bucket] of rateStore.entries()) {
    if (now >= bucket.resetAt) rateStore.delete(key);
  }
  globalStore.__nrRateLimitCleanupAt = now + CLEANUP_INTERVAL_MS;
};

const logSecurityEvent = (event: string, request: NextRequest, meta: Record<string, string | number>) => {
  // Simple hook for now. Route this to a SIEM/log pipeline when available.
  console.warn('[SECURITY]', event, {
    path: request.nextUrl.pathname,
    method: request.method,
    ...meta,
  });
};

export function middleware(request: NextRequest) {
  const now = Date.now();
  cleanupOldBuckets(now);

  const ip = getClientIp(request);
  const key = `${ip}:${request.nextUrl.pathname}`;
  const bucket = rateStore.get(key);

  if (!bucket || now >= bucket.resetAt) {
    rateStore.set(key, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    bucket.count += 1;
    rateStore.set(key, bucket);
  }

  const activeBucket = rateStore.get(key)!;
  const remaining = Math.max(0, MAX_REQUESTS_PER_WINDOW - activeBucket.count);
  const resetSeconds = Math.ceil((activeBucket.resetAt - now) / 1000);

  if (activeBucket.count > MAX_REQUESTS_PER_WINDOW) {
    logSecurityEvent('rate_limit_exceeded', request, {
      ip,
      count: activeBucket.count,
      limit: MAX_REQUESTS_PER_WINDOW,
    });

    return NextResponse.json(
      { error: 'Too many requests. Please try again shortly.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(resetSeconds),
          'X-RateLimit-Limit': String(MAX_REQUESTS_PER_WINDOW),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(resetSeconds),
        },
      }
    );
  }

  const queryLength = request.nextUrl.search.length;
  if (queryLength > 1500) {
    logSecurityEvent('large_query_string', request, { ip, queryLength });
  }

  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', String(MAX_REQUESTS_PER_WINDOW));
  response.headers.set('X-RateLimit-Remaining', String(remaining));
  response.headers.set('X-RateLimit-Reset', String(resetSeconds));

  return response;
}

export const config = {
  // Rate-limit all page and API routes.
  // Static assets (_next/static, images, favicon) are excluded to avoid
  // penalising normal browsing.
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|assets/|robots\\.txt|sitemap\\.xml|world-110m\\.json|google[0-9a-f]+\\.html).*)',
  ],
};
