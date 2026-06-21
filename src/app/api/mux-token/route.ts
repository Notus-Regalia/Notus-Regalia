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
  // For SIGNED playback, rendition limits must live in the token claims — query
  // params on the manifest URL are ignored. `min_resolution: 2160p` pins the
  // hero to the 4K rendition so ABR never drops to a softer one.
  const token = await mux.jwt.signPlaybackId(playbackId, {
    type: 'video',
    expiration: '12h',
    keyId,
    keySecret,
    params: { min_resolution: '2160p' },
  });

  return NextResponse.json(
    { token, playbackId },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}
