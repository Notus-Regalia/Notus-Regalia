import { NextResponse } from 'next/server';
import Mux from '@mux/mux-node';

// Signed playback requires a fresh, short-lived JWT minted server-side with the
// signing key — never expose the private key to the browser. This route runs on
// every request (no caching) so the token is always valid.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const playbackId = process.env.NEXT_PUBLIC_MUX_PLAYBACK_ID;
const keyId = process.env.MUX_SIGNING_KEY_ID;
const keySecret = process.env.MUX_SIGNING_PRIVATE_KEY;

export async function GET() {
  if (!playbackId || !keyId || !keySecret) {
    return NextResponse.json(
      { error: 'Mux signing env vars are not configured' },
      { status: 500 },
    );
  }

  const mux = new Mux({ jwtSigningKey: keyId, jwtPrivateKey: keySecret });

  // `type: 'video'` scopes the token to playback (audience "v"). The hero loops,
  // so give it a generous window to outlast long sessions.
  //
  // Do NOT pin a `min_resolution` here. For signed playback the restriction
  // lives in the token claims, and `min_resolution: '2160p'` made Mux serve a
  // manifest with a SINGLE 4K rendition (~12.5 Mbps, H.264 High@5.2). That
  // plays on a fast dev machine but breaks in production: real connections
  // can't sustain 12.5 Mbps for an autoplaying background loop, and many
  // phones/laptops can't hardware-decode 4K H.264 — with no lower rung in the
  // ladder, ABR has nothing to fall back to and the video never starts.
  // Leaving the ladder intact lets ABR pick a rendition that actually plays.
  const token = await mux.jwt.signPlaybackId(playbackId, {
    type: 'video',
    expiration: '12h',
    keyId,
    keySecret,
  });

  return NextResponse.json(
    { token, playbackId },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}
