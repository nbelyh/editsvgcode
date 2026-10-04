import { getAnalytics, logEvent, type Analytics } from 'firebase/analytics';
import { getApp } from 'firebase/app';
import { config } from './config';

function getAnalyticsInstance(): Analytics | null {
  if (config.FIREBASE_AUTH_DOMAIN === 'localhost') return null;
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
export function trackAiChat(model: string, effort?: string): void {
  const a = getAnalyticsInstance();
  // Effort as the request went out: image-like prompts are sent at low whatever the picker says.
  if (a) logEvent(a, 'ai_chat', { model, ...(effort ? { effort } : {}) });
}

/** User turned down the offer to generate (or change) a picture, choosing a hand drawing. */
export function trackImageDeclined(meta: { model: string; modify: boolean }): void {
  const a = getAnalyticsInstance();
  if (a) logEvent(a, 'ai_image_declined', meta);
}

/**
 * User pasted a whole SVG document into the chat, and it was opened without a model call.
 * `source` tells a sent message from the phone's Paste SVG button.
 */
export function trackPastedSvg(source: 'message' | 'button'): void {
  const a = getAnalyticsInstance();
  if (a) logEvent(a, 'ai_pasted_svg', { source });
}

/** User accepted an AI SVG edit. */
export function trackAiAccept(): void {
  const a = getAnalyticsInstance();
  if (a) logEvent(a, 'ai_accept');
}

/** User rejected an AI SVG edit. */
export function trackAiReject(meta: { model: string; effort?: string; tool: string; prompt_len: number }): void {
  const a = getAnalyticsInstance();
  if (a) logEvent(a, 'ai_reject', meta);
}

/** User rated an AI response with thumbs up. */
export function trackAiThumbsUp(meta: { model: string; effort?: string; prompt_len: number }): void {
  const a = getAnalyticsInstance();
  if (a) logEvent(a, 'ai_thumbs_up', meta);
}

/** User rated an AI response with thumbs down. */
export function trackAiThumbsDown(meta: { model: string; effort?: string; prompt_len: number; shared: boolean }): void {
  const a = getAnalyticsInstance();
  if (a) logEvent(a, 'ai_thumbs_down', meta);
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

/** User exported the drawing as a picture — what they chose, so the defaults can follow use. */
export function trackExport(meta: { format: string; size: string; background: string; action: 'download' | 'copy' }): void {
  const a = getAnalyticsInstance();
  if (a) logEvent(a, 'file_export', meta);
}

/** User copied the drawing as code: svg, datauri, base64, css or react. */
export function trackCopyAs(kind: string): void {
  const a = getAnalyticsInstance();
  if (a) logEvent(a, 'copy_as', { kind });
}

/** User downloaded a file. */
export function trackDownload(): void {
  const a = getAnalyticsInstance();
  if (a) logEvent(a, 'file_download');
}

/** User opened the sign-in modal. */
export function trackViewSignIn(): void {
  const a = getAnalyticsInstance();
  if (a) logEvent(a, 'view_sign_in');
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
