import { describe, it, expect, afterEach } from 'vitest';
import { buildCheckoutUrl, localCurrency, PPG_PRICE_LABELS, PPG_PRODUCT_IDS } from '../ppg-checkout';

const paramsOf = (url: string) => new URL(url).searchParams;

describe('buildCheckoutUrl', () => {
  it('names no currency by default, leaving PayPro to read it from the IP', () => {
    // The whole point of dropping the old hard-coded USD: a German should be
    // billed in euros without this page having an opinion about it.
    expect(paramsOf(buildCheckoutUrl('credits-100')).has('currency')).toBe(false);
  });

  it('holds the checkout to a currency when the page quoted one', () => {
    // Set only for a buyer shown rupees, so a VPN cannot land them on a euro
    // total after they were promised ₹250.
    expect(paramsOf(buildCheckoutUrl('credits-100', { currency: 'INR' })).get('currency')).toBe('INR');
  });

  it('never names a billing country, which decides the tax and is the IP to answer', () => {
    const url = buildCheckoutUrl('credits-100', { currency: 'INR', uid: 'u1' });
    expect(paramsOf(url).has('billing-country')).toBe(false);
  });

  it('carries the account so the purchase can be attributed to it', () => {
    const p = paramsOf(buildCheckoutUrl('pro-monthly', {
      uid: 'uid-1', email: 'a@b.com', displayName: 'Ada Lovelace',
    }));
    expect(p.get('x-uid')).toBe('uid-1');
    expect(p.get('billing-email')).toBe('a@b.com');
    expect(p.get('billing-first-name')).toBe('Ada');
    expect(p.get('billing-last-name')).toBe('Lovelace');
  });

  it('asks for the product the caller named', () => {
    const p = paramsOf(buildCheckoutUrl('credits-1000'));
    expect(p.get('products[1][id]')).toBe(String(PPG_PRODUCT_IDS['credits-1000']));
  });
});

describe('localCurrency', () => {
  const realResolved = Intl.DateTimeFormat.prototype.resolvedOptions;
  afterEach(() => {
    Intl.DateTimeFormat.prototype.resolvedOptions = realResolved;
  });

  const inZone = (timeZone: string) => {
    Intl.DateTimeFormat.prototype.resolvedOptions = function resolvedOptions(this: Intl.DateTimeFormat) {
      return { ...realResolved.call(this), timeZone };
    };
  };

  it('quotes rupees in India', () => {
    inZone('Asia/Kolkata');
    expect(localCurrency()).toBe('INR');
  });

  it('accepts the older spelling some systems still report', () => {
    inZone('Asia/Calcutta');
    expect(localCurrency()).toBe('INR');
  });

  it('quotes dollars everywhere else', () => {
    inZone('Europe/Berlin');
    expect(localCurrency()).toBe('USD');
  });

  it('falls back to dollars rather than throwing when the zone cannot be read', () => {
    Intl.DateTimeFormat.prototype.resolvedOptions = () => { throw new Error('locked down'); };
    expect(localCurrency()).toBe('USD');
  });
});

describe('price labels', () => {
  it('quotes every product in every currency', () => {
    // A missing entry would render "undefined" on a buy button.
    for (const currency of Object.keys(PPG_PRICE_LABELS) as Array<keyof typeof PPG_PRICE_LABELS>) {
      for (const product of Object.keys(PPG_PRODUCT_IDS) as Array<keyof typeof PPG_PRODUCT_IDS>) {
        expect(PPG_PRICE_LABELS[currency][product]).toBeTruthy();
      }
    }
  });

  it('quotes rupees with a rupee sign and dollars with a dollar sign', () => {
    // Guards the copy-paste that leaves a dollar amount in the rupee table.
    for (const label of Object.values(PPG_PRICE_LABELS.INR)) expect(label).toContain('₹');
    for (const label of Object.values(PPG_PRICE_LABELS.INR)) expect(label).not.toContain('$');
    for (const label of Object.values(PPG_PRICE_LABELS.USD)) expect(label).toContain('$');
    for (const label of Object.values(PPG_PRICE_LABELS.USD)) expect(label).not.toContain('₹');
  });
});

