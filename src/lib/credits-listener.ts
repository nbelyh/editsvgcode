import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { firebaseDb, logError } from './firebase';
import { fetchPricing } from './pricing';
import { billingPeriodKey, nextRechargeDate } from '../../shared/billing';
import type { Credits } from './api-client';

/**
 * Subscribe to real-time credit balance updates.
 * Listens to `usage/{uid}` via onSnapshot so credits update instantly
 * after every server-side deduction — no manual re-fetch needed.
 *
 * Returns an unsubscribe function.
 */
export function subscribeCredits(onChange: (credits: Credits) => void): () => void {
  let unsubSnapshot: (() => void) | null = null;

  const unsubAuth = onAuthStateChanged(getAuth(), (user) => {
    // Tear down previous snapshot listener if user changed
    unsubSnapshot?.();
    unsubSnapshot = null;

    if (!user) return;

    // Cache user tier + startDay + pricing so we don't re-fetch on every snapshot event
    let cached: { tier: 'free' | 'pro'; startDay?: number } | null = null;
    let cachedPricing: Awaited<ReturnType<typeof fetchPricing>> | null = null;

    unsubSnapshot = onSnapshot(
      doc(firebaseDb, 'usage', user.uid),
      async (snap) => {
        try {
          // Fetch pricing + tier once, then reuse
          if (!cachedPricing) cachedPricing = await fetchPricing();
          const pricing = cachedPricing;

          if (user.isAnonymous) {
            const remaining = snap.data()?.credits ?? pricing.anonymousTrialCredits;
            const creditsByModel = snap.data()?.credits_by_model;
            onChange({ remaining, limit: pricing.anonymousTrialCredits, tier: 'free', creditsByModel });
            return;
          }

          if (cached === null) {
            const userSnap = await getDoc(doc(firebaseDb, 'users', user.uid));
            const userData = userSnap.data();
            const isPro = userData?.tier === 'pro' && userData?.subscriptionStatus === 'active';
            const startDay = isPro
              ? userData?.subscriptionStartDay
              : (user.metadata.creationTime ? new Date(user.metadata.creationTime).getUTCDate() : undefined);
            cached = { tier: isPro ? 'pro' : 'free', startDay };
          }

          const usageData = snap.data();
          const { tier, startDay } = cached;
          const limit = tier === 'pro' ? pricing.proMonthlyCredits : pricing.freeMonthlyCredits;
          const today = new Date();
          const rechargeAt = nextRechargeDate(today, startDay).toISOString();

          let remaining: number;
          let creditsByModel: Record<string, number> | undefined;
          const packCredits = usageData?.packCredits ?? 0;

          if (tier === 'pro') {
            const period = billingPeriodKey(today, startDay);
            if (!usageData || usageData.month !== period) {
              remaining = limit + packCredits;
            } else {
              remaining = (usageData.credits ?? limit) + packCredits;
              creditsByModel = usageData.credits_by_model;
            }
          } else {
            const period = billingPeriodKey(today, startDay);
            if (!usageData) {
              // No usage doc yet — fresh user, full monthly allowance
              remaining = limit;
            } else if (usageData.month === period) {
              // Current billing period
              remaining = (usageData.credits ?? 0) + packCredits;
              creditsByModel = usageData.credits_by_model;
            } else {
              // New billing period — full monthly allowance + packs
              remaining = limit + packCredits;
            }
          }

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

