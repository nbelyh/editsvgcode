import { getAnalytics, logEvent, type Analytics } from 'firebase/analytics';
import { getApp } from 'firebase/app';

function getAnalyticsInstance(): Analytics | null {
  try {
    return getAnalytics(getApp());
  } catch {
    return null;
  }
}

/** Log a SPA page_view on route change. */
export function trackPageView(path: string): void {
  const a = getAnalyticsInstance();
  if (a) logEvent(a, 'page_view', { page_path: path });
}

/** User sent an AI chat message. */
export function trackAiChat(model: string): void {
  const a = getAnalyticsInstance();
  if (a) logEvent(a, 'ai_chat', { model });
}

/** User accepted an AI SVG edit. */
export function trackAiAccept(): void {
  const a = getAnalyticsInstance();
  if (a) logEvent(a, 'ai_accept');
}

/** User rejected an AI SVG edit. */
export function trackAiReject(): void {
  const a = getAnalyticsInstance();
  if (a) logEvent(a, 'ai_reject');
}

/** AI image generation completed. */
export function trackImageGen(model: string): void {
  const a = getAnalyticsInstance();
  if (a) logEvent(a, 'image_gen', { model });
}

/** User signed in (upgraded from anonymous). */
export function trackSignIn(provider: string): void {
  const a = getAnalyticsInstance();
  if (a) logEvent(a, 'login', { method: provider });
}

/** User saved a document to cloud. */
export function trackSave(): void {
  const a = getAnalyticsInstance();
  if (a) logEvent(a, 'file_save');
}

/** User opened a file (from URL or upload). */
export function trackFileOpen(source: 'url' | 'upload'): void {
  const a = getAnalyticsInstance();
  if (a) logEvent(a, 'file_open', { source });
}

/** User downloaded a file. */
export function trackDownload(): void {
  const a = getAnalyticsInstance();
  if (a) logEvent(a, 'file_download');
}

/** User visited the pricing page. */
export function trackViewPricing(): void {
  const a = getAnalyticsInstance();
  if (a) logEvent(a, 'view_pricing');
}

/** User clicked a purchase/subscribe button. */
export function trackBeginCheckout(sku: string): void {
  const a = getAnalyticsInstance();
  if (a) logEvent(a, 'begin_checkout', { items: [{ item_id: sku }] });
}

/** User hit the credit limit. */
export function trackCreditsExhausted(): void {
  const a = getAnalyticsInstance();
  if (a) logEvent(a, 'credits_exhausted');
}
