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
  // Quality FLOOR, not a lock. For signed playback the restriction lives in the
  // token claims. `min_resolution: '1080p'` keeps the 1080p / 1440p / 2160p
  // rungs and drops the soft 360–720p ones, so the hero never opens blurry
  // while ABR ramps up — yet 4K-capable devices on a fast connection still
  // climb to 2160p on their own.
  //
  // Do NOT raise this to '2160p': that collapses the manifest to a SINGLE 4K
  // rendition (~12.5 Mbps, H.264 High@5.2). With no lower rung to fall back to,
  // connections that can't sustain 12.5 Mbps — and devices that can't decode
  // 4K H.264 — get nothing, so the autoplaying background video never starts.
  const token = await mux.jwt.signPlaybackId(playbackId, {
    type: 'video',
    expiration: '12h',
    keyId,
    keySecret,
    params: { min_resolution: '1080p' },
  });

  return NextResponse.json(
    { token, playbackId },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}
