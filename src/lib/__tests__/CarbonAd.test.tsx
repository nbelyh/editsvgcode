import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { CarbonAd } from '../../components/CarbonAd';

vi.mock('firebase/auth', () => ({
  getAuth: () => ({}),
  onAuthStateChanged: (_auth: unknown, cb: (u: unknown) => void) => {
    cb(null);
    return () => {};
  },
}));

vi.mock('../credits-listener', () => ({
  subscribeCredits: (cb: (c: { tier: string }) => void) => {
    cb({ tier: 'free' });
    return () => {};
  },
}));

function renderAd() {
  return render(<MantineProvider><CarbonAd /></MantineProvider>);
}

const scripts = () => document.querySelectorAll('script[src*="carbonads"]').length;

describe('CarbonAd', () => {
  beforeEach(() => {
    localStorage.clear();
    // jsdom runs on localhost, where serving is off by default.
    localStorage.setItem('esvg-ads-local', 'true');
  });

  it('reuses the served unit across a remount instead of loading carbon.js again', () => {
    const first = renderAd();
    const host = document.querySelector('.carbon-host');
    expect(host).not.toBeNull();
    expect(scripts()).toBe(1);

    // Stand in for carbon.js rendering its unit into the host.
    const unit = document.createElement('div');
    unit.id = 'carbonads';
    unit.textContent = 'ad';
    host!.appendChild(unit);

    // Collapsing the sidebar unmounts the host, taking the script with it.
    first.unmount();
    expect(document.querySelector('[id^="carbonads"]')).toBeNull();
    expect(scripts()).toBe(0);

    // Reopening must re-attach the same node and must not re-inject: a second
    // load would bill another impression for the same page view.
    renderAd();
    const reopened = document.querySelector('.carbon-host');
    expect(reopened!.querySelector('#carbonads')).toBe(unit);
    expect(scripts()).toBe(0);
    expect(document.querySelectorAll('[id^="carbonads"]').length).toBe(1);
  });
});
