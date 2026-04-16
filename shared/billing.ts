/**
 * Shared billing utilities used by both frontend and backend.
 * Pure functions with zero dependencies — safe to import from either environment.
 */

/** Compute the billing period key ("YYYY-MM") for the current period,
 *  anchored to the user's subscription/signup start day. */
export function billingPeriodKey(today: Date, startDay?: number): string {
  if (!startDay) return today.toISOString().slice(0, 7);
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const resetDayThisMonth = Math.min(startDay, daysInMonth);
  if (today.getDate() >= resetDayThisMonth) {
    return `${year}-${String(month + 1).padStart(2, '0')}`;
  }
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  return `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}`;
}

/** Compute the next date credits will reset, based on the billing start day. */
export function nextRechargeDate(today: Date, startDay?: number): Date {
  if (!startDay) {
    return new Date(today.getFullYear(), today.getMonth() + 1, 1);
  }
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const resetDayThisMonth = Math.min(startDay, daysInMonth);
  if (today.getDate() >= resetDayThisMonth) {
    const nextMonthIdx = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const daysInNext = new Date(nextYear, nextMonthIdx + 1, 0).getDate();
    return new Date(nextYear, nextMonthIdx, Math.min(startDay, daysInNext));
  }
  return new Date(year, month, resetDayThisMonth);
}

/** Pricing configuration shape — shared between frontend and backend. */
export interface PricingConfig {
  anonymousTrialCredits: number;
  freeMonthlyCredits: number;
  proMonthlyCredits: number;
  proMonthlyPriceUsd: number;
  proAnnualPriceUsd: number;
  bulkPackCredits: number;
  bulkPackPriceUsd: number;
}

/** Default pricing values — single source of truth. */
export const DEFAULT_PRICING: PricingConfig = {
  anonymousTrialCredits: 20,
  freeMonthlyCredits: 100,
  proMonthlyCredits: 1000,
  proMonthlyPriceUsd: 10,
  proAnnualPriceUsd: 96,
  bulkPackCredits: 300,
  bulkPackPriceUsd: 10,
};

/** Map Firestore config doc fields to PricingConfig. */
export function mapFirestorePricing(d: Record<string, unknown>): PricingConfig {
  return {
    anonymousTrialCredits: (d.anonymous_trial_credits as number) ?? DEFAULT_PRICING.anonymousTrialCredits,
    freeMonthlyCredits: (d.free_monthly_credits as number) ?? DEFAULT_PRICING.freeMonthlyCredits,
    proMonthlyCredits: (d.pro_monthly_credits as number) ?? DEFAULT_PRICING.proMonthlyCredits,
    proMonthlyPriceUsd: (d.pro_monthly_price_usd as number) ?? DEFAULT_PRICING.proMonthlyPriceUsd,
    proAnnualPriceUsd: (d.pro_annual_price_usd as number) ?? DEFAULT_PRICING.proAnnualPriceUsd,
    bulkPackCredits: (d.bulk_pack_credits as number) ?? DEFAULT_PRICING.bulkPackCredits,
    bulkPackPriceUsd: (d.bulk_pack_price_usd as number) ?? DEFAULT_PRICING.bulkPackPriceUsd,
  };
}
