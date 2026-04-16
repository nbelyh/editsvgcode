import { describe, it, expect } from 'vitest';
import { billingPeriodKey, nextRechargeDate, mapFirestorePricing, DEFAULT_PRICING } from '../billing';

/** Local-time date helper to avoid UTC timezone pitfalls. */
function d(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day, 12, 0, 0);
}

// ---------------------------------------------------------------------------
// billingPeriodKey
// ---------------------------------------------------------------------------
describe('billingPeriodKey', () => {
  it('returns YYYY-MM of today when no start day', () => {
    expect(billingPeriodKey(d(2026, 4, 16))).toBe('2026-04');
    expect(billingPeriodKey(d(2026, 1, 5))).toBe('2026-01');
    expect(billingPeriodKey(d(2026, 12, 31))).toBe('2026-12');
  });

  it('returns current month when today >= start day', () => {
    expect(billingPeriodKey(d(2026, 4, 16), 15)).toBe('2026-04');
    expect(billingPeriodKey(d(2026, 4, 15), 15)).toBe('2026-04'); // exact match
  });

  it('returns previous month when today < start day', () => {
    expect(billingPeriodKey(d(2026, 4, 14), 15)).toBe('2026-03');
    expect(billingPeriodKey(d(2026, 4, 1), 15)).toBe('2026-03');
  });

  it('wraps to previous year in January', () => {
    expect(billingPeriodKey(d(2026, 1, 5), 15)).toBe('2025-12');
    expect(billingPeriodKey(d(2026, 1, 1), 2)).toBe('2025-12');
  });

  it('clamps start day to days in month (Feb 28)', () => {
    // Feb 2026 has 28 days. Start day 31 → clamped to 28.
    expect(billingPeriodKey(d(2026, 2, 28), 31)).toBe('2026-02'); // 28 >= 28
    expect(billingPeriodKey(d(2026, 2, 27), 31)).toBe('2026-01'); // 27 < 28
  });

  it('clamps start day 30 for February', () => {
    expect(billingPeriodKey(d(2026, 2, 28), 30)).toBe('2026-02');
    expect(billingPeriodKey(d(2026, 2, 27), 30)).toBe('2026-01');
  });

  it('handles start day 1 (always current month)', () => {
    expect(billingPeriodKey(d(2026, 4, 1), 1)).toBe('2026-04');
    expect(billingPeriodKey(d(2026, 4, 30), 1)).toBe('2026-04');
  });

  it('handles end-of-year transitions', () => {
    expect(billingPeriodKey(d(2026, 12, 25), 15)).toBe('2026-12');
    expect(billingPeriodKey(d(2026, 12, 10), 15)).toBe('2026-11');
  });

  it('handles leap year February', () => {
    // 2028 is a leap year (29 days in Feb)
    expect(billingPeriodKey(d(2028, 2, 29), 31)).toBe('2028-02');
    expect(billingPeriodKey(d(2028, 2, 28), 31)).toBe('2028-01');
  });
});

// ---------------------------------------------------------------------------
// nextRechargeDate
// ---------------------------------------------------------------------------
describe('nextRechargeDate', () => {
  it('returns first of next month when no start day', () => {
    expect(nextRechargeDate(d(2026, 4, 16))).toEqual(new Date(2026, 4, 1)); // May 1
  });

  it('returns next month start day when today >= start day', () => {
    expect(nextRechargeDate(d(2026, 4, 16), 15)).toEqual(new Date(2026, 4, 15)); // May 15
    expect(nextRechargeDate(d(2026, 4, 15), 15)).toEqual(new Date(2026, 4, 15)); // exact match → next month
  });

  it('returns this month start day when today < start day', () => {
    expect(nextRechargeDate(d(2026, 4, 10), 15)).toEqual(new Date(2026, 3, 15)); // April 15
  });

  it('wraps December → January', () => {
    expect(nextRechargeDate(d(2026, 12, 20), 15)).toEqual(new Date(2027, 0, 15));
  });

  it('wraps December with no start day', () => {
    expect(nextRechargeDate(d(2026, 12, 15))).toEqual(new Date(2027, 0, 1));
  });

  it('clamps for short months', () => {
    // After Jan 31 (start day 31) → next is Feb, which has 28 days → Feb 28
    expect(nextRechargeDate(d(2026, 1, 31), 31)).toEqual(new Date(2026, 1, 28));
  });

  it('clamps for leap year', () => {
    // After Jan 31, 2028 (leap year) → Feb has 29 days → Feb 29
    expect(nextRechargeDate(d(2028, 1, 31), 31)).toEqual(new Date(2028, 1, 29));
  });
});

// ---------------------------------------------------------------------------
// mapFirestorePricing
// ---------------------------------------------------------------------------
describe('mapFirestorePricing', () => {
  it('returns all defaults for empty doc', () => {
    expect(mapFirestorePricing({})).toEqual(DEFAULT_PRICING);
  });

  it('overrides individual fields', () => {
    const result = mapFirestorePricing({ free_monthly_credits: 200 });
    expect(result.freeMonthlyCredits).toBe(200);
    expect(result.proMonthlyCredits).toBe(DEFAULT_PRICING.proMonthlyCredits);
  });

  it('maps all Firestore field names correctly', () => {
    const result = mapFirestorePricing({
      anonymous_trial_credits: 50,
      free_monthly_credits: 200,
      pro_monthly_credits: 2000,
      pro_monthly_price_usd: 20,
      pro_annual_price_usd: 192,
      bulk_pack_credits: 500,
      bulk_pack_price_usd: 15,
    });
    expect(result).toEqual({
      anonymousTrialCredits: 50,
      freeMonthlyCredits: 200,
      proMonthlyCredits: 2000,
      proMonthlyPriceUsd: 20,
      proAnnualPriceUsd: 192,
      bulkPackCredits: 500,
      bulkPackPriceUsd: 15,
    });
  });
});
