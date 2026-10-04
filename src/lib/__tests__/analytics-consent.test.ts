import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Nothing may reach Google Analytics before the visitor's choice is known:
 * getAnalytics() alone sets the _ga cookies. Events fired meanwhile wait, and
 * go out or are dropped with the answer.
 */

const getAnalytics = vi.fn(() => ({}));
const logEvent = vi.fn();
vi.mock('firebase/analytics', () => ({ getAnalytics, logEvent }));
vi.mock('firebase/app', () => ({ getApp: () => ({}) }));
vi.mock('../config', () => ({ config: { FIREBASE_AUTH_DOMAIN: 'editsvgcode.com' } }));

async function load() {
  vi.resetModules();
  const consent = await import('../cookie-consent');
  const analytics = await import('../analytics');
  return { ...consent, ...analytics };
}

describe('analytics consent gate', () => {
  beforeEach(() => {
    getAnalytics.mockClear();
    logEvent.mockClear();
  });

  it('touches nothing while the choice is unknown', async () => {
    const { trackPageView, trackSave } = await load();
    trackPageView('/');
    trackSave();
    expect(getAnalytics).not.toHaveBeenCalled();
    expect(logEvent).not.toHaveBeenCalled();
  });

  it('sends what waited, in order, once allowed', async () => {
    const { trackPageView, trackSave, allowAnalytics, flushQueuedEvents } = await load();
    trackPageView('/');
    trackSave();
    allowAnalytics();
    flushQueuedEvents();
    expect(logEvent.mock.calls.map(c => c[1])).toEqual(['page_view', 'file_save']);
  });

  it('drops what waited, and sends nothing after, once declined', async () => {
    const { trackPageView, trackSave, denyAnalytics, dropQueuedEvents, flushQueuedEvents } = await load();
    trackPageView('/');
    denyAnalytics();
    dropQueuedEvents();
    trackSave();
    flushQueuedEvents();
    expect(getAnalytics).not.toHaveBeenCalled();
    expect(logEvent).not.toHaveBeenCalled();
  });

  it('sends straight away once allowed', async () => {
    const { trackSave, allowAnalytics } = await load();
    allowAnalytics();
    trackSave();
    expect(logEvent).toHaveBeenCalledTimes(1);
  });
});
