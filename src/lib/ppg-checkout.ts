/**
 * PayPro Global checkout URL builder.
 * Product IDs are from the PPG dashboard (Store settings → Product setup).
 */

export const PPG_PRODUCT_IDS = {
  'pro-monthly':  132975,
  'pro-annual':   133016,
  'credits-100':  133059,
  'credits-300':  133017,
  'credits-1000': 133018,
} as const;

export type PpgProductKey = keyof typeof PPG_PRODUCT_IDS;

export type Currency = 'USD' | 'INR';

/** Button copy per currency, kept beside the product ids because the two have to
 *  agree with the vendor dashboard together: a price here that PayPro does not
 *  charge is a number somebody read, believed, and was then billed something else
 *  for. Whole strings rather than a symbol and an amount stitched together, so
 *  each reads as one sentence and stays translatable.
 *
 *  INR is not a conversion. It is roughly ₹50 to the dollar against a market rate
 *  near ₹88, which is where purchasing power puts it — and the annual plan is 25%
 *  off the monthly rather than the 20% USD gets, because one charge a year has
 *  eleven fewer chances to fall foul of India's recurring-payment rules than
 *  twelve do. */
export const PPG_PRICE_LABELS: Record<Currency, Record<PpgProductKey, string>> = {
  USD: {
    'pro-monthly': 'Monthly — $10/mo',
    'pro-annual': 'Annual — $8/mo ($96/yr)',
    'credits-100': '100 credits — $5',
    'credits-300': '300 credits — $10',
    'credits-1000': '1,000 credits — $15',
  },
  INR: {
    'pro-monthly': 'Monthly — ₹500/mo',
    'pro-annual': 'Annual — ₹375/mo (₹4,500/yr)',
    'credits-100': '100 credits — ₹250',
    'credits-300': '300 credits — ₹500',
    'credits-1000': '1,000 credits — ₹750',
  },
};

/** Which currency to quote on the page, guessed from the browser's time zone.
 *
 *  Display only. What the buyer is actually charged in is PayPro's decision, made
 *  from their IP — which is the right authority, because the tax treatment and
 *  the payment methods offered follow from it too. This page cannot see an IP
 *  without asking a server, and the time zone agrees with it for almost everyone
 *  while costing nothing to read.
 *
 *  So the two can disagree — a VPN, or somebody travelling — and the page says as
 *  much beneath the prices rather than pretending to certainty it does not have.
 *
 *  Anything unrecognised is USD, which is also what the build renders: there is
 *  no browser at build time, and quoting whichever machine ran the build would be
 *  worse than quoting the base currency. */
export function localCurrency(): Currency {
  if (typeof Intl === 'undefined') return 'USD';
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // Calcutta is the older spelling, still reported by some systems.
    if (zone === 'Asia/Kolkata' || zone === 'Asia/Calcutta') return 'INR';
  } catch {
    // No Intl, or a locked-down environment. USD is the safe answer.
  }
  return 'USD';
}

interface CheckoutOptions {
  uid?: string | null;
  email?: string | null;
  displayName?: string | null;
  /** Hold the checkout to the currency the page quoted.
   *
   *  Set only when that is not the base currency — so in practice, only for a
   *  buyer being shown rupees. Everyone else is left to PayPro's own detection,
   *  which is how a German comes to be billed in euros without us naming it.
   *
   *  It exists because the page guesses from the time zone and PayPro decides by
   *  IP, and those disagree for anyone on a VPN. Without this, somebody quoted
   *  ₹250 could arrive at a euro total with nothing having warned them. Note this
   *  fixes the currency only: the billing country still comes from the IP, and
   *  has to, because that is what the tax is owed against. */
  currency?: Currency;
}

export function buildCheckoutUrl(product: PpgProductKey, opts: CheckoutOptions = {}): string {
  // Currency is left unset unless the caller asks for one, so PayPro reads it
  // from the buyer's IP. This used to be hard-coded to USD, which kept the
  // checkout matching the prices on our own page but billed India in dollars —
  // a currency their banks mark up, hesitate over, and decline recurring
  // mandates in. India is the largest source of visitors here and converts
  // almost never.
  const params = new URLSearchParams({
    'products[1][id]': String(PPG_PRODUCT_IDS[product]),
  });
  if (opts.currency) params.set('currency', opts.currency);
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
