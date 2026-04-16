/**
 * PayPro Global checkout URL builder.
 * Product IDs are from the PPG dashboard (Store settings → Product setup).
 */

export const PPG_PRODUCT_IDS = {
  'pro-monthly':  132975,
  'pro-annual':   133016,
  'credits-300':  133017,
  'credits-1000': 133018,
} as const;

export type PpgProductKey = keyof typeof PPG_PRODUCT_IDS;

interface CheckoutOptions {
  uid?: string | null;
  email?: string | null;
  displayName?: string | null;
}

export function buildCheckoutUrl(product: PpgProductKey, opts: CheckoutOptions = {}): string {
  const params = new URLSearchParams({
    'products[1][id]': String(PPG_PRODUCT_IDS[product]),
  });
  if (opts.uid)  params.set('x-uid', opts.uid);
  if (opts.email) {
    params.set('billing-email', opts.email);
    params.set('use-license-info', 'true');
    params.set('license-email', opts.email);
  }
  if (opts.displayName) {
    const [first, ...rest] = opts.displayName.trim().split(' ');
    params.set('billing-first-name', first);
    if (rest.length) params.set('billing-last-name', rest.join(' '));
    params.set('license-name', opts.displayName);
  }
  if (window.location.hostname === 'localhost') {
    params.set('use-test-mode', 'true');
    // params.set('secret-key', '6KK@GZjmuM');
  }
  return `https://store.payproglobal.com/checkout?${params.toString()}`;
}
