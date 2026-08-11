import { getAuth, onIdTokenChanged, type User } from 'firebase/auth';

/** How often to re-check while waiting.
 *
 *  Polled as well as subscribed because a link refreshes the User object in
 *  place, and this should not depend on being right about which Firebase events
 *  that does and does not emit. Cheap: a property read every eighth of a second,
 *  only while a purchase is actually waiting. */
const POLL_MS = 125;

/** Long enough for a redirect to come back and finish linking on a slow
 *  connection, short enough that a purchase parked by somebody who then
 *  abandoned the sign-in does not hold the page's buttons for long. This is the
 *  worst case a buyer who changed their mind pays. */
const DEFAULT_TIMEOUT_MS = 6000;

/**
 * Resolve once a real (non-anonymous) account is present, or null if none turns
 * up in time.
 *
 * Watches auth from the outside on purpose. The alternative is reaching into the
 * redirect handling in firebase.ts and reshaping it to report when it is done —
 * but that module is the sign-in path for every page, and a checkout resume is
 * not a good reason to put all of it at risk.
 *
 * Watching for "non-anonymous, by any route" also sidesteps needing to know which
 * way the buyer arrived, and there are two. Linking an anonymous account leaves
 * the in-memory user reporting isAnonymous until it is refreshed. And the link
 * failing because the credential already belongs to an account — what happens
 * for anyone who has signed in here before — is recovered by signing in with
 * that credential instead, producing a different user object entirely. Neither
 * distinction matters to a caller that only wants to know "is there a real
 * account yet".
 */
export function waitForAccount(timeoutMs: number = DEFAULT_TIMEOUT_MS): Promise<User | null> {
  const auth = getAuth();
  return new Promise<User | null>((resolve) => {
    let settled = false;
    let unsub: (() => void) | undefined;

    const done = (user: User | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      clearInterval(poll);
      unsub?.();
      resolve(user);
    };

    const check = () => {
      const user = auth.currentUser;
      if (user && !user.isAnonymous) done(user);
    };

    const timer = setTimeout(() => done(null), timeoutMs);
    const poll = setInterval(check, POLL_MS);
    unsub = onIdTokenChanged(auth, check);
    // The same hazard sessionUser() documents: the listener can fire during
    // subscription, before `unsub` has been assigned, which would leave the
    // subscription alive after the promise settled.
    if (settled) unsub();
    check(); // Already signed in: resolve now rather than a poll tick later.
  });
}

/** How long to let a freshly linked account finish acquiring a name. */
const PROFILE_SETTLE_MS = 1500;

/**
 * Wait, briefly, for a just-signed-in account to have a display name.
 *
 * The redirect handler in firebase.ts fills displayName and photoURL in after
 * the link, and it is the only writer of them for an account created from an
 * anonymous one. A caller that navigates away the instant the account appears
 * cuts that write off mid-flight: the name is then lost for good, and the page
 * being navigated to has none to prefill.
 *
 * Waiting for the name to land is the same thing as waiting for the write to
 * finish — the local user is only updated once the server confirms — without
 * this module needing to know that handler exists.
 *
 * Bounded and best-effort. Some providers return no name at all, and a checkout
 * that opens a second late with a name is better than one that never opens.
 */
export function settleProfile(user: User, timeoutMs: number = PROFILE_SETTLE_MS): Promise<User> {
  if (user.displayName) return Promise.resolve(user);
  const auth = getAuth();
  return new Promise<User>((resolve) => {
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      clearInterval(poll);
      resolve(auth.currentUser ?? user);
    };
    const timer = setTimeout(done, timeoutMs);
    const poll = setInterval(() => {
      if (auth.currentUser?.displayName) done();
    }, POLL_MS);
  });
}
