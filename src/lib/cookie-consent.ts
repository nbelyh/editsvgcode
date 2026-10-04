const CONSENT_KEY = 'cookie-consent';
const REGION_KEY = 'cookie-consent-required';

export type ConsentValue = 'accepted' | 'declined' | null;

export function getConsent(): ConsentValue {
  return localStorage.getItem(CONSENT_KEY) as ConsentValue;
}

export function setConsent(value: 'accepted' | 'declined'): void {
  localStorage.setItem(CONSENT_KEY, value);
}

export function hasResponded(): boolean {
  return getConsent() !== null;
}

// The one switch every analytics call checks. Calling getAnalytics() is what
// starts Google Analytics — it sets the _ga cookies and sends a page view — so
// nothing may call it until this is 'on'. It used to be called from every
// tracking helper unconditionally, and the banner held back nothing.
// 'undecided' until the stored answer, the region check or the banner settles
// it; events wait in the meantime (see analytics.ts).
let state: 'undecided' | 'on' | 'off' = 'undecided';

export function analyticsState(): 'undecided' | 'on' | 'off' {
  return state;
}

export function allowAnalytics(): void {
  state = 'on';
}

export function denyAnalytics(): void {
  state = 'off';
}

/**
 * Where analytics cookies need consent before they are set: the EU, the rest
 * of the EEA, the UK and Switzerland. Visitors elsewhere are not asked; the
 * privacy policy covers them.
 */
const CONSENT_COUNTRIES = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE',
  'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  'IS', 'LI', 'NO',
  'GB', 'CH',
]);

/**
 * Whether this visitor has to be asked. Cloudflare, which the site sits behind,
 * reports the visitor's country at /cdn-cgi/trace. Anything that does not give
 * a clear answer — no Cloudflare in front (localhost, preview channels), a
 * failed or slow request, an unknown or Tor country code — counts as "ask".
 * Cached for the session, so it costs one request per visit.
 */
export async function consentRequired(): Promise<boolean> {
  try {
    const cached = sessionStorage.getItem(REGION_KEY);
    if (cached !== null) return cached === '1';
  } catch { /* storage unavailable — just ask Cloudflare */ }

  let required = true;
  try {
    const res = await fetch('/cdn-cgi/trace', { signal: AbortSignal.timeout(3000) });
    const loc = /^loc=([A-Z]{2})$/m.exec(await res.text())?.[1];
    if (loc && loc !== 'XX' && loc !== 'T1') required = CONSENT_COUNTRIES.has(loc);
  } catch { /* no answer — ask */ }

  try { sessionStorage.setItem(REGION_KEY, required ? '1' : '0'); } catch { /* not cached */ }
  return required;
}
