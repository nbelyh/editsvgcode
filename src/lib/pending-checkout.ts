/**
 * A purchase parked while the buyer signs in.
 *
 * sessionStorage rather than a ref or component state, because sign-in is
 * `linkWithRedirect`: the whole page leaves for the provider and comes back as a
 * new document. Nothing held in memory survives that — which is exactly why the
 * first attempt at resuming a purchase never fired.
 */

/** How long a parked purchase stays valid.
 *
 *  Only has to outlive a redirect to the provider and back, which is seconds.
 *  Kept short because an abandoned park is indistinguishable from one still on
 *  its way: while it looks fresh the page holds its buttons and says a checkout
 *  is coming, so a generous window is a generous window of lying to somebody who
 *  changed their mind. Past this it is ignored on sight. */
export const PENDING_CHECKOUT_TTL_MS = 2 * 60 * 1000;

const KEY = 'pending-checkout';

/** Park a purchase for the sign-in round trip. Silent when storage is unavailable
 *  (private mode): sign-in still works, the buyer just clicks the plan again. */
export function setPendingCheckout(product: string, now: number = Date.now()): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ product, at: now }));
  } catch {
    // No storage. Nothing to be done, and nothing worth breaking sign-in over.
  }
}

export function clearPendingCheckout(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // As above.
  }
}

/** Whether a fresh purchase is parked, without consuming it. For deciding on the
 *  first render that a resume is coming, so the page can hold its buttons instead
 *  of enabling them and then yanking the buyer away a moment later. */
export function hasPendingCheckout(now: number = Date.now()): boolean {
  let raw: string | null = null;
  try {
    raw = sessionStorage.getItem(KEY);
  } catch {
    return false;
  }
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw) as { product?: unknown; at?: unknown };
    return typeof parsed.product === 'string'
      && typeof parsed.at === 'number'
      && now - parsed.at <= PENDING_CHECKOUT_TTL_MS;
  } catch {
    return false;
  }
}

/** Take the parked purchase, if one is waiting and still fresh. Always clears:
 *  reading it means we are acting on it, and a key that survives being read would
 *  fire again on the next render. */
export function takePendingCheckout(now: number = Date.now()): string | null {
  let raw: string | null = null;
  try {
    raw = sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
  if (!raw) return null;
  clearPendingCheckout();
  try {
    const parsed = JSON.parse(raw) as { product?: unknown; at?: unknown };
    if (typeof parsed.product !== 'string' || typeof parsed.at !== 'number') return null;
    if (now - parsed.at > PENDING_CHECKOUT_TTL_MS) return null;
    return parsed.product;
  } catch {
    return null; // Something else wrote the key, or it was truncated.
  }
}
