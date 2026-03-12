import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

const PH_BOUNDS = {
  lamin: 4,
  lamax: 22.5,
  lomin: 116,
  lomax: 127.5,
};

const OPENSKY_STATES_URL =
  `https://opensky-network.org/api/states/all?lamin=${PH_BOUNDS.lamin}&lomin=${PH_BOUNDS.lomin}&lamax=${PH_BOUNDS.lamax}&lomax=${PH_BOUNDS.lomax}`;
const LOCAL_CREDENTIALS_FILE = path.join(process.cwd(), "src", "utils", "credentials.json");
const OPENSKY_TOKEN_URL =
  process.env.OPENSKY_TOKEN_URL ||
  "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token";

const toPositiveInt = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.round(parsed);
};

const OPENSKY_UPSTREAM_REFRESH_MS = toPositiveInt(process.env.OPENSKY_UPSTREAM_REFRESH_MS, 60000);
const OPENSKY_STALE_FALLBACK_MS = toPositiveInt(process.env.OPENSKY_STALE_FALLBACK_MS, 15 * 60 * 1000);
const OPENSKY_FAILURE_BACKOFF_MS = toPositiveInt(process.env.OPENSKY_FAILURE_BACKOFF_MS, 120000);
const OPENSKY_MIN_REFRESH_MS = 5000;
const OPENSKY_MAX_REFRESH_MS = 60000;

type OpenSkyStatesPayload = {
  time?: number;
  states?: unknown[];
};

type OpenSkyCredentialsJson = {
  opensky?: {
    clientId?: string;
    clientSecret?: string;
    username?: string;
    password?: string;
    tokenUrl?: string;
  };
  username?: string;
  password?: string;
  clientId?: string;
  clientSecret?: string;
  tokenUrl?: string;
  OPENSKY_USERNAME?: string;
  OPENSKY_PASSWORD?: string;
  OPENSKY_CLIENT_ID?: string;
  OPENSKY_CLIENT_SECRET?: string;
};

type AdsbAircraft = {
  id: string;
  icao24: string;
  callsign: string | null;
  originCountry: string | null;
  lat: number;
  lon: number;
  altitudeMeters: number | null;
  velocityMps: number | null;
  headingDeg: number | null;
  verticalRateMps: number | null;
  onGround: boolean;
  squawk: string | null;
  lastContact: number | null;
};

type AdsbFeedPayload = {
  source: string;
  fetchedAt: string;
  timestamp: number | null;
  aircraft: AdsbAircraft[];
};

type AdsbRouteCache = {
  payload: AdsbFeedPayload | null;
  fetchedAtMs: number;
  inFlight: Promise<AdsbFeedPayload> | null;
  lastFailureAtMs: number;
};

const globalAdsbCache = globalThis as typeof globalThis & {
  __notusAdsbRouteCache?: AdsbRouteCache;
};

const adsbRouteCache: AdsbRouteCache = globalAdsbCache.__notusAdsbRouteCache ?? {
  payload: null,
  fetchedAtMs: 0,
  inFlight: null,
  lastFailureAtMs: 0,
};
globalAdsbCache.__notusAdsbRouteCache = adsbRouteCache;

type OpenSkyTokenCache = {
  accessToken: string | null;
  expiresAtMs: number;
  inFlight: Promise<string | null> | null;
};

const globalOpenSkyTokenCache = globalThis as typeof globalThis & {
  __notusOpenSkyTokenCache?: OpenSkyTokenCache;
};

const openSkyTokenCache: OpenSkyTokenCache = globalOpenSkyTokenCache.__notusOpenSkyTokenCache ?? {
  accessToken: null,
  expiresAtMs: 0,
  inFlight: null,
};
globalOpenSkyTokenCache.__notusOpenSkyTokenCache = openSkyTokenCache;

class UpstreamHttpError extends Error {
  status: number;
  stage: "token" | "states";

  constructor(status: number, stage: "token" | "states", message?: string) {
    super(message ?? "Upstream ADS-B feed unavailable");
    this.status = status;
    this.stage = stage;
  }
}

const toTrimmedStringOrNull = (value: unknown) => {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

const toFiniteNumberOrNull = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

const toCredentialValue = (value: unknown) => {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

type OpenSkyCredentials = {
  oauthClientId: string | null;
  oauthClientSecret: string | null;
  username: string | null;
  password: string | null;
  tokenUrl: string;
};

const resolveOpenSkyCredentials = async (): Promise<OpenSkyCredentials> => {
  const envClientId = toCredentialValue(process.env.OPENSKY_CLIENT_ID);
  const envClientSecret = toCredentialValue(process.env.OPENSKY_CLIENT_SECRET);
  const envUsername = toCredentialValue(process.env.OPENSKY_USERNAME);
  const envPassword = toCredentialValue(process.env.OPENSKY_PASSWORD);
  if (envClientId && envClientSecret) {
    return {
      oauthClientId: envClientId,
      oauthClientSecret: envClientSecret,
      username: envUsername,
      password: envPassword,
      tokenUrl: toCredentialValue(process.env.OPENSKY_TOKEN_URL) ?? OPENSKY_TOKEN_URL,
    };
  }

  try {
    const raw = await readFile(LOCAL_CREDENTIALS_FILE, "utf8");
    const json = JSON.parse(raw) as OpenSkyCredentialsJson;

    const oauthClientId =
      envClientId ??
      toCredentialValue(json?.opensky?.clientId) ??
      toCredentialValue(json?.clientId) ??
      toCredentialValue(json?.OPENSKY_CLIENT_ID);
    const oauthClientSecret =
      envClientSecret ??
      toCredentialValue(json?.opensky?.clientSecret) ??
      toCredentialValue(json?.clientSecret) ??
      toCredentialValue(json?.OPENSKY_CLIENT_SECRET);
    const username =
      envUsername ??
      toCredentialValue(json?.opensky?.username) ??
      toCredentialValue(json?.username) ??
      toCredentialValue(json?.OPENSKY_USERNAME);
    const password =
      envPassword ??
      toCredentialValue(json?.opensky?.password) ??
      toCredentialValue(json?.password) ??
      toCredentialValue(json?.OPENSKY_PASSWORD);
    const tokenUrl =
      toCredentialValue(process.env.OPENSKY_TOKEN_URL) ??
      toCredentialValue(json?.opensky?.tokenUrl) ??
      toCredentialValue(json?.tokenUrl) ??
      OPENSKY_TOKEN_URL;

    return { oauthClientId, oauthClientSecret, username, password, tokenUrl };
  } catch {
    return {
      oauthClientId: envClientId,
      oauthClientSecret: envClientSecret,
      username: envUsername,
      password: envPassword,
      tokenUrl: toCredentialValue(process.env.OPENSKY_TOKEN_URL) ?? OPENSKY_TOKEN_URL,
    };
  }
};

type OpenSkyTokenResponse = {
  access_token?: string;
  expires_in?: number;
  token_type?: string;
};

const getOAuthBearerToken = async (
  clientId: string,
  clientSecret: string,
  tokenUrl: string
) => {
  const now = Date.now();
  if (
    openSkyTokenCache.accessToken &&
    openSkyTokenCache.expiresAtMs - 60_000 > now
  ) {
    return openSkyTokenCache.accessToken;
  }

  if (!openSkyTokenCache.inFlight) {
    openSkyTokenCache.inFlight = (async () => {
      const body = new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      });
      const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
        cache: "no-store",
      });

      if (!response.ok) {
        throw new UpstreamHttpError(response.status, "token");
      }

      const tokenPayload = (await response.json()) as OpenSkyTokenResponse;
      const accessToken = toCredentialValue(tokenPayload.access_token);
      if (!accessToken) {
        throw new Error("OAuth token payload missing access token");
      }

      const expiresInSeconds =
        typeof tokenPayload.expires_in === "number" && Number.isFinite(tokenPayload.expires_in)
          ? Math.max(60, Math.round(tokenPayload.expires_in))
          : 1800;
      openSkyTokenCache.accessToken = accessToken;
      openSkyTokenCache.expiresAtMs = Date.now() + expiresInSeconds * 1000;
      return accessToken;
    })()
      .finally(() => {
        openSkyTokenCache.inFlight = null;
      });
  }

  return openSkyTokenCache.inFlight;
};

const mapOpenSkyStateToAircraft = (state: unknown): AdsbAircraft | null => {
  if (!Array.isArray(state)) return null;
  const icao24Raw = toTrimmedStringOrNull(state[0]);
  if (!icao24Raw) return null;

  const lat = toFiniteNumberOrNull(state[6]);
  const lon = toFiniteNumberOrNull(state[5]);
  if (lat === null || lon === null) return null;

  const inPhilippineBounds =
    lat >= PH_BOUNDS.lamin &&
    lat <= PH_BOUNDS.lamax &&
    lon >= PH_BOUNDS.lomin &&
    lon <= PH_BOUNDS.lomax;
  if (!inPhilippineBounds) return null;

  const onGround = Boolean(state[8]);
  if (onGround) return null;

  const icao24 = icao24Raw.toLowerCase();
  return {
    id: `adsb-${icao24}`,
    icao24,
    callsign: toTrimmedStringOrNull(state[1]),
    originCountry: toTrimmedStringOrNull(state[2]),
    lastContact: toFiniteNumberOrNull(state[4]),
    lon,
    lat,
    altitudeMeters: toFiniteNumberOrNull(state[7]),
    onGround,
    velocityMps: toFiniteNumberOrNull(state[9]),
    headingDeg: toFiniteNumberOrNull(state[10]),
    verticalRateMps: toFiniteNumberOrNull(state[11]),
    squawk: toTrimmedStringOrNull(state[14]),
  };
};

const buildResponseHeaders = () => ({ "Cache-Control": "no-store, max-age=0" });

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const resolveRequestedRefreshMs = (request: Request) => {
  const raw = new URL(request.url).searchParams.get("cadenceMs");
  if (!raw) return OPENSKY_UPSTREAM_REFRESH_MS;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return OPENSKY_UPSTREAM_REFRESH_MS;
  return clamp(Math.round(parsed), OPENSKY_MIN_REFRESH_MS, OPENSKY_MAX_REFRESH_MS);
};

const buildBasicAuthHeader = (username: string, password: string) =>
  `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;

const fetchOpenSkyPayload = async (): Promise<AdsbFeedPayload> => {
  const credentials = await resolveOpenSkyCredentials();
  const directBasicAuthHeader =
    credentials.username && credentials.password
      ? buildBasicAuthHeader(credentials.username, credentials.password)
      : null;
  const oauthAsBasicFallbackHeader =
    credentials.oauthClientId && credentials.oauthClientSecret
      ? buildBasicAuthHeader(credentials.oauthClientId, credentials.oauthClientSecret)
      : null;

  const fetchStates = (authorization: string | null) => {
    const headers: HeadersInit = authorization ? { Authorization: authorization } : {};
    return fetch(OPENSKY_STATES_URL, {
      cache: "no-store",
      headers,
    });
  };

  let response: Response | null = null;
  if (credentials.oauthClientId && credentials.oauthClientSecret) {
    try {
      const accessToken = await getOAuthBearerToken(
        credentials.oauthClientId,
        credentials.oauthClientSecret,
        credentials.tokenUrl
      );
      response = await fetchStates(`Bearer ${accessToken}`);
    } catch (error) {
      if (directBasicAuthHeader) {
        response = await fetchStates(directBasicAuthHeader);
      } else if (oauthAsBasicFallbackHeader) {
        response = await fetchStates(oauthAsBasicFallbackHeader);
      } else {
        if (error instanceof UpstreamHttpError) throw error;
        throw new UpstreamHttpError(503, "token", "OpenSky OAuth token request failed");
      }
    }
  } else if (directBasicAuthHeader) {
    response = await fetchStates(directBasicAuthHeader);
  } else {
    response = await fetchStates(null);
  }

  if (
    response &&
    !response.ok &&
    (response.status === 401 || response.status === 403) &&
    oauthAsBasicFallbackHeader
  ) {
    response = await fetchStates(oauthAsBasicFallbackHeader);
  }

  if (!response || !response.ok) {
    throw new UpstreamHttpError(response?.status ?? 503, "states");
  }

  const payload = (await response.json()) as OpenSkyStatesPayload;
  const aircraftByIcao = new Map<string, AdsbAircraft>();
  const states = Array.isArray(payload.states) ? payload.states : [];

  states.forEach((entry) => {
    const aircraft = mapOpenSkyStateToAircraft(entry);
    if (!aircraft) return;
    aircraftByIcao.set(aircraft.id, aircraft);
  });

  return {
    source: "OpenSky Network ADS-B",
    fetchedAt: new Date().toISOString(),
    timestamp: typeof payload.time === "number" ? payload.time : null,
    aircraft: Array.from(aircraftByIcao.values()),
  };
};

export async function GET(request: Request) {
  const requestedRefreshMs = resolveRequestedRefreshMs(request);
  const now = Date.now();
  const cacheAgeMs = now - adsbRouteCache.fetchedAtMs;
  const failureAgeMs = now - adsbRouteCache.lastFailureAtMs;
  if (adsbRouteCache.payload && cacheAgeMs < requestedRefreshMs) {
    return NextResponse.json(
      {
        ...adsbRouteCache.payload,
        cached: true,
        stale: false,
        cacheAgeMs,
        refreshMs: requestedRefreshMs,
      },
      { headers: buildResponseHeaders() }
    );
  }

  if (
    adsbRouteCache.payload &&
    adsbRouteCache.lastFailureAtMs > 0 &&
    failureAgeMs < OPENSKY_FAILURE_BACKOFF_MS
  ) {
    return NextResponse.json(
      {
        ...adsbRouteCache.payload,
        cached: true,
        stale: true,
        cacheAgeMs,
        refreshMs: requestedRefreshMs,
        retryInMs: OPENSKY_FAILURE_BACKOFF_MS - failureAgeMs,
      },
      { headers: buildResponseHeaders() }
    );
  }

  try {
    if (!adsbRouteCache.inFlight) {
      adsbRouteCache.inFlight = fetchOpenSkyPayload()
        .then((payload) => {
          adsbRouteCache.payload = payload;
          adsbRouteCache.fetchedAtMs = Date.now();
          adsbRouteCache.lastFailureAtMs = 0;
          return payload;
        })
        .finally(() => {
          adsbRouteCache.inFlight = null;
        });
    }

    const payload = await adsbRouteCache.inFlight;
    const servedAtAgeMs = Date.now() - adsbRouteCache.fetchedAtMs;

    return NextResponse.json(
      {
        ...payload,
        cached: servedAtAgeMs > 0,
        stale: false,
        cacheAgeMs: Math.max(0, servedAtAgeMs),
        refreshMs: requestedRefreshMs,
      },
      {
        headers: buildResponseHeaders(),
      }
    );
  } catch (error) {
    adsbRouteCache.lastFailureAtMs = Date.now();
    const staleAgeMs = Date.now() - adsbRouteCache.fetchedAtMs;
    if (adsbRouteCache.payload && staleAgeMs <= OPENSKY_STALE_FALLBACK_MS) {
      return NextResponse.json(
        {
          ...adsbRouteCache.payload,
          cached: true,
          stale: true,
          cacheAgeMs: staleAgeMs,
          refreshMs: requestedRefreshMs,
        },
        {
          headers: buildResponseHeaders(),
        }
      );
    }

    return NextResponse.json(
      {
        error: "ADS-B feed request failed",
        upstreamStatus: error instanceof UpstreamHttpError ? error.status : null,
        upstreamStage: error instanceof UpstreamHttpError ? error.stage : null,
      },
      {
        status: 503,
        headers: buildResponseHeaders(),
      }
    );
  }
}
