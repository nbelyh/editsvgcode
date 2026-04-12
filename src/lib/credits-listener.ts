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

    unsubSnapshot = onSnapshot(
      doc(firebaseDb, 'usage', user.uid),
      async (snap) => {
        const usageData = snap.data();
        const pricing = await fetchPricing();

        if (user.isAnonymous) {
          const remaining = usageData?.credits ?? pricing.anonymousTrialCredits;
          const creditsByModel = usageData?.credits_by_model;
          onChange({ remaining, limit: pricing.anonymousTrialCredits, tier: 'free', creditsByModel });
          return;
        }

        // For signed-in users we also need the user profile for tier
        const userSnap = await getDoc(doc(firebaseDb, 'users', user.uid));
        const userData = userSnap.data();
        const tier: 'free' | 'pro' =
          userData?.tier === 'pro' && userData?.subscriptionStatus === 'active' ? 'pro' : 'free';
        const limit = tier === 'pro' ? pricing.proMonthlyCredits : pricing.freeMonthlyCredits;
        const month = new Date().toISOString().slice(0, 7);
        const remaining = (!usageData || usageData.month !== month) ? limit : (usageData.credits ?? 0);
        const creditsByModel = usageData?.month === month ? usageData.credits_by_model : undefined;
        onChange({ remaining, limit, tier, creditsByModel });
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
