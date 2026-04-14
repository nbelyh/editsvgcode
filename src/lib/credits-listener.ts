import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { firebaseDb } from './firebase';
import { fetchPricing } from './pricing';
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

    // Cache user tier + pricing so we don't re-fetch on every snapshot event
    let cachedTier: 'free' | 'pro' | null = null;
    let cachedPricing: Awaited<ReturnType<typeof fetchPricing>> | null = null;

    unsubSnapshot = onSnapshot(
      doc(firebaseDb, 'usage', user.uid),
      async (snap) => {
        // Fetch pricing + tier once, then reuse
        if (!cachedPricing) cachedPricing = await fetchPricing();
        const pricing = cachedPricing;

        if (user.isAnonymous) {
          const remaining = snap.data()?.credits ?? pricing.anonymousTrialCredits;
          const creditsByModel = snap.data()?.credits_by_model;
          onChange({ remaining, limit: pricing.anonymousTrialCredits, tier: 'free', creditsByModel });
          return;
        }

        if (cachedTier === null) {
          const userSnap = await getDoc(doc(firebaseDb, 'users', user.uid));
          const userData = userSnap.data();
          cachedTier = userData?.tier === 'pro' && userData?.subscriptionStatus === 'active' ? 'pro' : 'free';
        }

        const usageData = snap.data();
        const tier = cachedTier;
        const limit = tier === 'pro' ? pricing.proMonthlyCredits : pricing.freeMonthlyCredits;
        const month = new Date().toISOString().slice(0, 7);

        let remaining: number;
        let creditsByModel: Record<string, number> | undefined;
        let rechargeAt: string | undefined;

        if (tier === 'pro') {
          // Pro: no auto-reset — use stored credits as-is
          remaining = usageData?.credits ?? 0;
          creditsByModel = usageData?.credits_by_model;
        } else {
          // Free: auto-reset on new month
          remaining = (!usageData || usageData.month !== month) ? limit : (usageData.credits ?? 0);
          creditsByModel = usageData?.month === month ? usageData.credits_by_model : undefined;
          // Next recharge = first day of next month
          const [y, m] = month.split('-').map(Number);
          const nextMonth = new Date(y, m, 1); // month is 0-indexed, so m (1-12) gives next month
          rechargeAt = nextMonth.toISOString();
        }

        onChange({ remaining, limit, tier, creditsByModel, rechargeAt });
      },
      (error) => {
        console.warn('Credits snapshot error:', error.message);
      },
    );
  });

  return () => {
    unsubAuth();
    unsubSnapshot?.();
  };
}
