import { useEffect, useRef, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { subscribeCredits } from '../lib/credits-listener';

const PRO_KEY = 'esvg-tier-pro';

// One serve per page load. Unmounting takes the host div and everything in it,
// so without these the sidebar's collapse/expand — or a resize across the
// desktop breakpoint — would inject carbon.js again and bill another
// impression for the same page view. Instead the rendered unit is detached and
// kept here, then re-attached to whatever host mounts next.
let cachedUnit: Element | null = null;
let served = false;

/**
 * Carbon Ads placement, shown to everyone except Pro.
 *
 * Loads optimistically on mount rather than waiting to learn the tier: for a
 * signed-in user that meant an auth round-trip plus the users/{uid} Firestore
 * read before the script tag existed, and a failed read left the ad off for the
 * whole session. Pro is remembered per device so a subscriber sees the ad at
 * most once, on the first load after subscribing.
 */
export function CarbonAd() {
  const adsRef = useRef<HTMLDivElement>(null);
  const [isPro, setIsPro] = useState(() => localStorage.getItem(PRO_KEY) === 'true');

  useEffect(() => {
    const remember = (pro: boolean) => {
      setIsPro(pro);
      localStorage.setItem(PRO_KEY, String(pro));
    };
    // Guests never reach subscribeCredits, so clear a stale Pro flag left on a
    // shared device by a previous account.
    const unsubAuth = onAuthStateChanged(getAuth(), (user) => {
      if (!user || user.isAnonymous) remember(false);
    });
    const unsubCredits = subscribeCredits((credits) => remember(credits.tier === 'pro'));
    return () => {
      unsubAuth();
      unsubCredits();
    };
  }, []);

  useEffect(() => {
    // Dev must not serve by default: the placement is registered for the live
    // domain, and the e2e suite runs the desktop layout against localhost in two
    // browsers, so serving here would bill invalid impressions on every run.
    // Run localStorage.setItem('esvg-ads-local', 'true') to opt in for a look.
    const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    if (isLocal && localStorage.getItem('esvg-ads-local') !== 'true') return;
    const host = adsRef.current;
    if (isPro || !host) return;

    if (cachedUnit) {
      host.appendChild(cachedUnit);
    } else if (!served && !document.getElementById('_carbonads_js')) {
      // The id guard covers a duplicate while the host is alive (StrictMode
      // runs this twice); `served` covers the remount, when the script has
      // gone from the DOM along with its host.
      served = true;
      const script = document.createElement('script');
      script.id = '_carbonads_js';
      script.async = true;
      script.type = 'text/javascript';
      script.src = '//cdn.carbonads.com/carbon.js?serve=CWYICK37&placement=editsvgcodecom';
      host.appendChild(script);
    }

    return () => {
      // Detach before React drops the host, keeping the node alive in
      // cachedUnit. Nothing to save if carbon.js has not rendered yet.
      const unit = host.querySelector('[id^="carbonads"]');
      if (unit) {
        unit.remove();
        cachedUnit = unit;
      }
    };
  }, [isPro]);

  if (isPro) return null;
  // Separator and background live on the host, so both vanish with the ad
  // rather than leaving an empty ruled band. The unit itself is left exactly
  // as Carbon serves it — their placement policy forbids altering it.
  return <div ref={adsRef} className="carbon-host" />;
}
