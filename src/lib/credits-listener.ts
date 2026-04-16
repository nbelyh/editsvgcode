import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { firebaseDb, logError } from './firebase';
import { fetchPricing } from './pricing';
import { nextRechargeDate } from '../../shared/billing';
import type { Credits } from './api-client';

/**
 * Subscribe to real-time credit balance updates.
 * Listens to `usage/{uid}` via onSnapshot so credits update instantly
 * after every server-side deduction — no manual re-fetch needed.
 *
 * The usage doc now contains stable, display-ready values maintained by the backend.
 * The frontend just reads them — no period/tier interpretation needed.
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
    let cachedStartDay: number | undefined;
    let tierLoaded = false;

    unsubSnapshot = onSnapshot(
      doc(firebaseDb, 'usage', user.uid),
      async (snap) => {
        try {
          if (!cachedPricing) cachedPricing = await fetchPricing();
          const pricing = cachedPricing;
          const usageData = snap.data();

          if (user.isAnonymous) {
            const remaining = usageData?.credits ?? pricing.anonymousTrialCredits;
            const creditsByModel = usageData?.credits_by_model;
            onChange({ remaining, limit: pricing.anonymousTrialCredits, tier: 'free', creditsByModel });
            return;
          }

          // Load startDay once for rechargeAt calculation (fallback if not in usage doc)
          if (!tierLoaded) {
            const userSnap = await getDoc(doc(firebaseDb, 'users', user.uid));
            const userData = userSnap.data();
            const isPro = userData?.tier === 'pro' && userData?.subscriptionStatus === 'active';
            cachedStartDay = isPro
              ? userData?.subscriptionStartDay
              : (user.metadata.creationTime ? new Date(user.metadata.creationTime).getUTCDate() : undefined);
            tierLoaded = true;
          }

          // Read stable values from the usage doc
          const tier = (usageData?.tier as 'free' | 'pro') ?? 'free';
          const limit = usageData?.limit ?? (tier === 'pro' ? pricing.proMonthlyCredits : pricing.freeMonthlyCredits);
          const remaining = usageData?.credits ?? limit;
          const creditsByModel = usageData?.credits_by_model;
          const packCredits = usageData?.packCredits ?? 0;
          const rechargeAt = usageData?.rechargeAt ?? nextRechargeDate(new Date(), cachedStartDay).toISOString();

          onChange({ remaining, limit, tier, creditsByModel, packCredits, rechargeAt });
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

