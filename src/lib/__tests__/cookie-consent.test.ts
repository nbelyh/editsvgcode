import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { consentRequired } from '../cookie-consent';

/**
 * Only visitors from countries that require it are asked about analytics
 * cookies. Anything short of a clear answer from Cloudflare must mean "ask".
 */

function trace(body: string) {
  return vi.fn(async () => new Response(body));
}

describe('consentRequired', () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(() => vi.unstubAllGlobals());

  it('asks a visitor from the EU', async () => {
    vi.stubGlobal('fetch', trace('h=editsvgcode.com\nloc=AT\nwarp=off\n'));
    expect(await consentRequired()).toBe(true);
  });

  it('asks a visitor from the UK or Switzerland', async () => {
    vi.stubGlobal('fetch', trace('loc=GB\n'));
    expect(await consentRequired()).toBe(true);
    sessionStorage.clear();
    vi.stubGlobal('fetch', trace('loc=CH\n'));
    expect(await consentRequired()).toBe(true);
  });

  it('does not ask a visitor from elsewhere', async () => {
    vi.stubGlobal('fetch', trace('h=editsvgcode.com\nloc=US\n'));
    expect(await consentRequired()).toBe(false);
  });

  it('asks when the country is unknown or Tor', async () => {
    vi.stubGlobal('fetch', trace('loc=XX\n'));
    expect(await consentRequired()).toBe(true);
    sessionStorage.clear();
    vi.stubGlobal('fetch', trace('loc=T1\n'));
    expect(await consentRequired()).toBe(true);
  });

  it('asks when there is no Cloudflare in front, and the SPA answers with its page', async () => {
    vi.stubGlobal('fetch', trace('<!doctype html><html><body></body></html>'));
    expect(await consentRequired()).toBe(true);
  });

  it('asks when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('network'); }));
    expect(await consentRequired()).toBe(true);
  });

  it('checks once per session', async () => {
    const fetch = trace('loc=US\n');
    vi.stubGlobal('fetch', fetch);
    await consentRequired();
    expect(await consentRequired()).toBe(false);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
