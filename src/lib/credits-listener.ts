import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { firebaseDb, logError } from './firebase';
import { fetchPricing } from './pricing';
import type { Credits } from './api-client';

/**
 * Subscribe to real-time credit balance updates.
 * Listens to `usage/{uid}` via onSnapshot so credits update instantly
 * after every server-side deduction — no manual re-fetch needed.
 *
 * The usage doc contains stable, display-ready values maintained by the backend
 * (init-credits on sign-in, ensureCurrentPeriod on API calls, daily recharge timer).
 * The frontend just reads them directly.
 *
 * Returns an unsubscribe function.
 */
export function subscribeCredits(onChange: (credits: Credits) => void): () => void {
  let unsubSnapshot: (() => void) | null = null;

  const unsubAuth = onAuthStateChanged(getAuth(), (user) => {
    unsubSnapshot?.();
    unsubSnapshot = null;

    if (!user) return;

    let cachedPricing: Awaited<ReturnType<typeof fetchPricing>> | null = null;

    unsubSnapshot = onSnapshot(
      doc(firebaseDb, 'usage', user.uid),
      async (snap) => {
        try {
          if (!cachedPricing) cachedPricing = await fetchPricing();
          const pricing = cachedPricing;
          const data = snap.data();

          if (user.isAnonymous) {
            onChange({
              remaining: data?.credits ?? pricing.anonymousTrialCredits,
              limit: pricing.anonymousTrialCredits,
              tier: 'free',
              creditsByModel: data?.credits_by_model,
            });
            return;
          }

          // For signed-in users, all values are maintained by the backend
          const tier = (data?.tier as 'free' | 'pro') ?? 'free';
          const limit = data?.limit ?? (tier === 'pro' ? pricing.proMonthlyCredits : pricing.freeMonthlyCredits);
          onChange({
            remaining: data?.credits ?? limit,
            limit,
            tier,
            creditsByModel: data?.credits_by_model,
            packCredits: data?.packCredits ?? 0,
            rechargeAt: data?.rechargeAt,
          });
        } catch (err) {
          logError('credits-listener', err);
        }
      },
      (error) => {
        logError('credits-snapshot', error);
      },
    );
  });

  return () => {
    unsubAuth();
    unsubSnapshot?.();
  };
}

