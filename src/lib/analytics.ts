import { getAnalytics, logEvent } from 'firebase/analytics';
import { getApp } from 'firebase/app';
import { config } from './config';
import { analyticsState } from './cookie-consent';

// Events fired before the visitor's choice is known — the page view on load,
// a sign-in restored at startup — wait here instead of being lost. The choice
// takes a moment even where nobody is asked (see consentRequired). Sent once
// analytics is allowed, dropped if it is declined; capped, since a visitor who
// never answers never decides.
const queued: [string, Record<string, unknown> | undefined][] = [];
const MAX_QUEUED = 50;

function track(name: string, params?: Record<string, unknown>): void {
  if (config.FIREBASE_AUTH_DOMAIN === 'localhost') return;
  const state = analyticsState();
  if (state === 'undecided') {
    if (queued.length < MAX_QUEUED) queued.push([name, params]);
    return;
  }
  if (state === 'off') return;
  // getAnalytics() starts Google Analytics, cookies and all: only once allowed.
  try {
    logEvent(getAnalytics(getApp()), name, params);
  } catch { /* analytics unavailable (blocked, unsupported) */ }
}

/** Sends what was queued before the choice was known; called once analytics is allowed. */
export function flushQueuedEvents(): void {
  for (const [name, params] of queued.splice(0)) track(name, params);
}

/** Forgets what was queued; called when analytics is declined. */
export function dropQueuedEvents(): void {
  queued.length = 0;
}

/** Log a SPA page_view on route change. */
export function trackPageView(path: string): void {
  track('page_view', { page_path: path });
}

/** User sent an AI chat message. */
export function trackAiChat(model: string, effort?: string): void {
  // Effort as the request went out: image-like prompts are sent at low whatever the picker says.
  track('ai_chat', { model, ...(effort ? { effort } : {}) });
}

/** User turned down the offer to generate (or change) a picture, choosing a hand drawing. */
export function trackImageDeclined(meta: { model: string; modify: boolean }): void {
  track('ai_image_declined', meta);
}

/**
 * User pasted a whole SVG document into the chat, and it was opened without a model call.
 * `source` tells a sent message from the phone's Paste SVG button.
 */
export function trackPastedSvg(source: 'message' | 'button'): void {
  track('ai_pasted_svg', { source });
}

/** User accepted an AI SVG edit. */
export function trackAiAccept(): void {
  track('ai_accept');
}

/** User rejected an AI SVG edit. */
export function trackAiReject(meta: { model: string; effort?: string; tool: string; prompt_len: number }): void {
  track('ai_reject', meta);
}

/** User rated an AI response with thumbs up. */
export function trackAiThumbsUp(meta: { model: string; effort?: string; prompt_len: number }): void {
  track('ai_thumbs_up', meta);
}

/** User rated an AI response with thumbs down. */
export function trackAiThumbsDown(meta: { model: string; effort?: string; prompt_len: number; shared: boolean }): void {
  track('ai_thumbs_down', meta);
}

/** AI image generation completed. */
export function trackImageGen(model: string): void {
  track('image_gen', { model });
}

/** User signed in (upgraded from anonymous). */
export function trackSignIn(provider: string): void {
  track('login', { method: provider });
}

/** User saved a document to cloud. */
export function trackSave(): void {
  track('file_save');
}

/** User opened a file (from URL or upload). */
export function trackFileOpen(source: 'url' | 'upload'): void {
  track('file_open', { source });
}

/** User exported the drawing as a picture — what they chose, so the defaults can follow use. */
export function trackExport(meta: { format: string; size: string; background: string; action: 'download' | 'copy' }): void {
  track('file_export', meta);
}

/** User copied the drawing as code: svg, datauri, base64, css or react. */
export function trackCopyAs(kind: string): void {
  track('copy_as', { kind });
}

/** User downloaded a file. */
export function trackDownload(): void {
  track('file_download');
}

/** User opened the sign-in modal. */
export function trackViewSignIn(): void {
  track('view_sign_in');
}

/** User visited the pricing page. */
export function trackViewPricing(): void {
  track('view_pricing');
}

/** User clicked a purchase/subscribe button. */
export function trackBeginCheckout(sku: string): void {
  track('begin_checkout', { items: [{ item_id: sku }] });
}

/** User hit the credit limit. */
export function trackCreditsExhausted(): void {
  track('credits_exhausted');
}
