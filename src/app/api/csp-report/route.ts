import { NextRequest, NextResponse } from 'next/server';

// Receives Content-Security-Policy violation reports. Browsers POST here via the
// CSP `report-to` (Reporting API, content-type application/reports+json) and the
// legacy `report-uri` (content-type application/csp-report) directives set in
// src/middleware.ts. We log them; wire this into a SIEM/log pipeline later.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  let report: unknown;
  try {
    // Both report formats are JSON; read defensively in case the body is empty.
    const text = await request.text();
    report = text ? JSON.parse(text) : null;
  } catch {
    report = '<unparseable report body>';
  }

  console.warn('[SECURITY] csp_violation', {
    userAgent: request.headers.get('user-agent') ?? 'unknown',
    report,
  });

  // 204: report accepted, nothing to return. Browsers ignore the body anyway.
  return new NextResponse(null, { status: 204 });
}
