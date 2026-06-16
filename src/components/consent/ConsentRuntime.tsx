"use client";
import { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/next';
import { getConsent, getPreferences, applyPreferences, onConsentChange } from '@/utils/consent';

/**
 * Mounted once in the root layout. Applies stored accessibility preferences on
 * load and gates Vercel Analytics behind analytics consent — so nothing tracks
 * until the user opts in, and toggling consent takes effect live.
 */
export default function ConsentRuntime() {
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);

  useEffect(() => {
    applyPreferences(getPreferences());
    setAnalyticsAllowed(getConsent().analytics);
    return onConsentChange((c) => setAnalyticsAllowed(c.analytics));
  }, []);

  return analyticsAllowed ? <Analytics /> : null;
}
