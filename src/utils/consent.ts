// ─────────────────────────────────────────────────────────────
//  Cookie consent + site preferences — single source of truth.
//
//  Shared by the cookie banner (CookieBanner) and the granular
//  controls in Information Central → Settings → Preferences, so a
//  choice made in either place is reflected and enforced everywhere.
// ─────────────────────────────────────────────────────────────

const CONSENT_KEY = 'nr-cookie-consent';
const PREFS_KEY = 'nr-preferences';
export const CONSENT_EVENT = 'nr-consent-change';

export interface Consent {
  analytics: boolean;
  personalization: boolean;
  marketing: boolean;
}

export interface Preferences {
  emails: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
}

export const DEFAULT_CONSENT: Consent = {
  analytics: false,
  personalization: false,
  marketing: false,
};

export const DEFAULT_PREFERENCES: Preferences = {
  emails: false,
  reducedMotion: false,
  highContrast: false,
};

const isBrowser = () => typeof window !== 'undefined';

// ── Consent ──────────────────────────────────────────────────
export function getConsent(): Consent {
  if (!isBrowser()) return { ...DEFAULT_CONSENT };
  const raw = localStorage.getItem(CONSENT_KEY);
  if (!raw) return { ...DEFAULT_CONSENT };
  // Back-compat with the old binary banner values.
  if (raw === 'all') return { analytics: true, personalization: true, marketing: true };
  if (raw === 'essential') return { ...DEFAULT_CONSENT };
  try {
    const p = JSON.parse(raw);
    return {
      analytics: !!p.analytics,
      personalization: !!p.personalization,
      marketing: !!p.marketing,
    };
  } catch {
    return { ...DEFAULT_CONSENT };
  }
}

/** True once the user has made any explicit choice (so the banner can hide). */
export function hasConsentDecision(): boolean {
  return isBrowser() && localStorage.getItem(CONSENT_KEY) != null;
}

export function setConsent(consent: Consent): void {
  if (!isBrowser()) return;
  localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: consent }));
}

export const acceptAllConsent = () =>
  setConsent({ analytics: true, personalization: true, marketing: true });

export const rejectNonEssentialConsent = () => setConsent({ ...DEFAULT_CONSENT });

export function clearConsent(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(CONSENT_KEY);
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: getConsent() }));
}

/** Subscribe to consent changes (same tab via CustomEvent, other tabs via storage). */
export function onConsentChange(cb: (c: Consent) => void): () => void {
  if (!isBrowser()) return () => {};
  const handler = () => cb(getConsent());
  window.addEventListener(CONSENT_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(CONSENT_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

// ── Preferences (accessibility / comms) ──────────────────────
export function getPreferences(): Preferences {
  if (!isBrowser()) return { ...DEFAULT_PREFERENCES };
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { ...DEFAULT_PREFERENCES };
    const p = JSON.parse(raw);
    return {
      emails: !!p.emails,
      reducedMotion: !!p.reducedMotion,
      highContrast: !!p.highContrast,
    };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

export function setPreferences(prefs: Preferences): void {
  if (!isBrowser()) return;
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  applyPreferences(prefs);
}

export function clearPreferences(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(PREFS_KEY);
  applyPreferences(DEFAULT_PREFERENCES);
}

/** Reflect accessibility preferences on the document root (CSS hooks). */
export function applyPreferences(prefs: Preferences): void {
  if (!isBrowser()) return;
  const root = document.documentElement;
  root.classList.toggle('reduce-motion', prefs.reducedMotion);
  root.classList.toggle('high-contrast', prefs.highContrast);
}

// ── Cache ────────────────────────────────────────────────────
/** Clear Cache Storage, session storage, and any registered service workers. */
export async function clearSiteCache(): Promise<void> {
  if (!isBrowser()) return;
  try {
    sessionStorage.clear();
  } catch {
    /* ignore */
  }
  if ('caches' in window) {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    } catch {
      /* ignore */
    }
  }
  if ('serviceWorker' in navigator) {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    } catch {
      /* ignore */
    }
  }
}
