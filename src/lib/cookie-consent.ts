const CONSENT_KEY = 'cookie-consent';

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
