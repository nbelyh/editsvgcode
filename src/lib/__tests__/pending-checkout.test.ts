import { describe, it, expect, beforeEach } from 'vitest';
import {
  setPendingCheckout,
  takePendingCheckout,
  clearPendingCheckout,
  PENDING_CHECKOUT_TTL_MS,
  hasPendingCheckout,
} from '../pending-checkout';

const KEY = 'pending-checkout';

describe('pending checkout', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('survives the round trip a redirect sign-in makes of it', () => {
    setPendingCheckout('pro-monthly', 1000);
    // sessionStorage is what outlives the navigation; a ref would not have.
    expect(sessionStorage.getItem(KEY)).toBeTruthy();
    expect(takePendingCheckout(1000)).toBe('pro-monthly');
  });

  it('is taken exactly once, so a re-render cannot send the buyer twice', () => {
    setPendingCheckout('credits-1000', 1000);
    expect(takePendingCheckout(1000)).toBe('credits-1000');
    expect(takePendingCheckout(1000)).toBeNull();
  });

  it('is gone when nothing was parked', () => {
    expect(takePendingCheckout()).toBeNull();
  });

  it('expires, so signing in much later does not spring a payment page', () => {
    setPendingCheckout('pro-monthly', 1000);
    expect(takePendingCheckout(1000 + PENDING_CHECKOUT_TTL_MS + 1)).toBeNull();
  });

  it('survives right up to the expiry', () => {
    setPendingCheckout('pro-monthly', 1000);
    expect(takePendingCheckout(1000 + PENDING_CHECKOUT_TTL_MS)).toBe('pro-monthly');
  });

  it('clears an expired key rather than leaving it to be re-read', () => {
    setPendingCheckout('pro-monthly', 1000);
    takePendingCheckout(1000 + PENDING_CHECKOUT_TTL_MS + 1);
    expect(sessionStorage.getItem(KEY)).toBeNull();
  });

  it('ignores a key something else wrote', () => {
    sessionStorage.setItem(KEY, 'not json at all');
    expect(takePendingCheckout()).toBeNull();
  });

  it('ignores a key of the right shape but the wrong types', () => {
    sessionStorage.setItem(KEY, JSON.stringify({ product: 42, at: 'soon' }));
    expect(takePendingCheckout()).toBeNull();
  });

  it('clears on abandonment', () => {
    setPendingCheckout('pro-monthly');
    clearPendingCheckout();
    expect(takePendingCheckout()).toBeNull();
  });
});

describe('hasPendingCheckout', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('sees a parked purchase without consuming it', () => {
    setPendingCheckout('pro-monthly', 1000);
    expect(hasPendingCheckout(1000)).toBe(true);
    // The point of peeking: the resume still gets to take it afterwards.
    expect(hasPendingCheckout(1000)).toBe(true);
    expect(takePendingCheckout(1000)).toBe('pro-monthly');
  });

  it('is false with nothing parked', () => {
    expect(hasPendingCheckout()).toBe(false);
  });

  it('agrees with take about expiry, so the buttons are not held for a purchase that will be discarded', () => {
    setPendingCheckout('pro-monthly', 1000);
    const past = 1000 + PENDING_CHECKOUT_TTL_MS + 1;
    expect(hasPendingCheckout(past)).toBe(false);
    expect(takePendingCheckout(past)).toBeNull();
  });

  it('is false for a key something else wrote', () => {
    sessionStorage.setItem(KEY, 'not json at all');
    expect(hasPendingCheckout()).toBe(false);
  });
});
