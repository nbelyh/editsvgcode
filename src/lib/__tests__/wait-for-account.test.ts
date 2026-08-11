import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/** The fake auth this module observes. `currentUser` is read through a getter so
 *  a test can change who is signed in mid-wait, exactly as a redirect does. */
let currentUser: { uid: string; isAnonymous: boolean; displayName?: string | null } | null = null;
let listeners: Array<(user: unknown) => void> = [];

vi.mock('firebase/auth', () => ({
  getAuth: () => ({
    get currentUser() { return currentUser; },
  }),
  onIdTokenChanged: (_auth: unknown, cb: (user: unknown) => void) => {
    listeners.push(cb);
    return () => { listeners = listeners.filter((l) => l !== cb); };
  },
}));

const { waitForAccount, settleProfile } = await import('../wait-for-account');

/** A real User carries twenty-odd fields; this module reads three. Cast rather
 *  than stub the rest, which would assert things about Firebase that no test
 *  here is checking. */
const asUser = (u: { uid: string; isAnonymous: boolean; displayName?: string | null }) =>
  u as unknown as import('firebase/auth').User;

const guest = { uid: 'anon-1', isAnonymous: true };
const account = { uid: 'real-1', isAnonymous: false };

describe('waitForAccount', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    currentUser = null;
    listeners = [];
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('resolves at once when a real account is already signed in', async () => {
    currentUser = account;
    await expect(waitForAccount()).resolves.toBe(account);
  });

  it('keeps waiting while the user is still anonymous', async () => {
    currentUser = guest;
    const pending = waitForAccount(10000);
    let settled = false;
    void pending.then(() => { settled = true; });
    await vi.advanceTimersByTimeAsync(2000);
    expect(settled).toBe(false);
  });

  it('resolves when the account appears with no event at all', async () => {
    // The case that broke this twice: linking refreshes the user in place, so
    // nothing may fire. Polling is what catches it.
    currentUser = guest;
    const pending = waitForAccount(10000);
    await vi.advanceTimersByTimeAsync(500);
    currentUser = account;
    await vi.advanceTimersByTimeAsync(200);
    await expect(pending).resolves.toBe(account);
  });

  it('resolves when an auth event announces the account', async () => {
    // The other route in: the link failed as credential-already-in-use and was
    // recovered by signing in, which is a different user object.
    currentUser = guest;
    const pending = waitForAccount(10000);
    currentUser = account;
    listeners.forEach((l) => l(account));
    await expect(pending).resolves.toBe(account);
  });

  it('gives up rather than holding the page forever', async () => {
    currentUser = guest;
    const pending = waitForAccount(5000);
    await vi.advanceTimersByTimeAsync(5001);
    await expect(pending).resolves.toBeNull();
  });

  it('stops polling and unsubscribes once settled', async () => {
    currentUser = guest;
    const pending = waitForAccount(5000);
    expect(listeners.length).toBe(1);
    currentUser = account;
    await vi.advanceTimersByTimeAsync(200);
    await pending;
    expect(listeners.length).toBe(0);
    // A leaked interval would keep firing long after the promise settled.
    expect(vi.getTimerCount()).toBe(0);
  });

  it('leaves nothing running after giving up either', async () => {
    currentUser = guest;
    const pending = waitForAccount(5000);
    await vi.advanceTimersByTimeAsync(5001);
    await pending;
    expect(listeners.length).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('settleProfile', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    currentUser = null;
    listeners = [];
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns at once when the name is already there', async () => {
    const named = { uid: 'real-1', isAnonymous: false, displayName: 'Ada' };
    currentUser = named;
    await expect(settleProfile(asUser(named))).resolves.toBe(named);
    // Nothing scheduled: the common case must not cost a tick.
    expect(vi.getTimerCount()).toBe(0);
  });

  it('waits for a name that is still being written, then returns the fresh user', async () => {
    // The race this exists for: firebase.ts fills displayName in after the link,
    // and navigating away first loses it permanently.
    const nameless = { uid: 'real-1', isAnonymous: false, displayName: null };
    currentUser = nameless;
    const pending = settleProfile(asUser(nameless), 1500);
    const named = { uid: 'real-1', isAnonymous: false, displayName: 'Ada' };
    currentUser = named;
    await vi.advanceTimersByTimeAsync(200);
    await expect(pending).resolves.toBe(named);
  });

  it('gives up rather than holding a buyer for a name that never arrives', async () => {
    // Some providers return none at all; a checkout that opens beats one that
    // waits forever for something that is not coming.
    const nameless = { uid: 'real-1', isAnonymous: false, displayName: null };
    currentUser = nameless;
    const pending = settleProfile(asUser(nameless), 1500);
    await vi.advanceTimersByTimeAsync(1501);
    await expect(pending).resolves.toBe(nameless);
    expect(vi.getTimerCount()).toBe(0);
  });
});
