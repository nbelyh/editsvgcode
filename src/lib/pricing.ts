import { doc, getDoc } from 'firebase/firestore';
import { firebaseDb } from './firebase';

export interface PricingConfig {
  anonymousTrialCredits: number;
  freeMonthlyCredits: number;
  proMonthlyCredits: number;
  proMonthlyPriceUsd: number;
  proAnnualPriceUsd: number;
  bulkPackCredits: number;
  bulkPackPriceUsd: number;
}

/** Hardcoded defaults — used before Firestore config is fetched */
export const DEFAULT_PRICING: PricingConfig = {
  anonymousTrialCredits: 20,
  freeMonthlyCredits: 100,
  proMonthlyCredits: 1000,
  proMonthlyPriceUsd: 9,
  proAnnualPriceUsd: 79,
  bulkPackCredits: 1000,
  bulkPackPriceUsd: 15,
};

/** Named exports kept for backward compat */
export const ANONYMOUS_TRIAL_CREDITS = DEFAULT_PRICING.anonymousTrialCredits;
export const FREE_MONTHLY_CREDITS = DEFAULT_PRICING.freeMonthlyCredits;
export const PRO_MONTHLY_CREDITS = DEFAULT_PRICING.proMonthlyCredits;
export const PRO_MONTHLY_PRICE_USD = DEFAULT_PRICING.proMonthlyPriceUsd;
export const PRO_ANNUAL_PRICE_USD = DEFAULT_PRICING.proAnnualPriceUsd;
export const BULK_PACK_CREDITS = DEFAULT_PRICING.bulkPackCredits;
export const BULK_PACK_PRICE_USD = DEFAULT_PRICING.bulkPackPriceUsd;

let clientCache: { pricing: PricingConfig; expiresAt: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/** Fetch pricing config from Firestore, falling back to defaults. Cached for 5 minutes. */
export async function fetchPricing(): Promise<PricingConfig> {
  if (clientCache && Date.now() < clientCache.expiresAt) {
    return clientCache.pricing;
  }
  try {
    const snap = await getDoc(doc(firebaseDb, 'config', 'pricing'));
    const d = snap.data();
    if (!d) return DEFAULT_PRICING;
    const pricing: PricingConfig = {
      anonymousTrialCredits: d.anonymous_trial_credits ?? DEFAULT_PRICING.anonymousTrialCredits,
      freeMonthlyCredits: d.free_monthly_credits ?? DEFAULT_PRICING.freeMonthlyCredits,
      proMonthlyCredits: d.pro_monthly_credits ?? DEFAULT_PRICING.proMonthlyCredits,
      proMonthlyPriceUsd: d.pro_monthly_price_usd ?? DEFAULT_PRICING.proMonthlyPriceUsd,
      proAnnualPriceUsd: d.pro_annual_price_usd ?? DEFAULT_PRICING.proAnnualPriceUsd,
      bulkPackCredits: d.bulk_pack_credits ?? DEFAULT_PRICING.bulkPackCredits,
      bulkPackPriceUsd: d.bulk_pack_price_usd ?? DEFAULT_PRICING.bulkPackPriceUsd,
    };
    clientCache = { pricing, expiresAt: Date.now() + CACHE_TTL_MS };
    return pricing;
  } catch {
    return DEFAULT_PRICING;
  }
}
