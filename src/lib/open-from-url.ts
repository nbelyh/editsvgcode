/**
 * Opening a drawing from the address itself, so a link can carry the document.
 *
 * An assistant that has just written SVG for someone has nowhere to send them: the markup is
 * in the chat, and the editor opens on its own starter drawing. A link does carry it —
 * `?svg=<the markup, url-encoded>` for something small enough to sit in a URL, and
 * `?url=<https://…>` for a file already on the web, a raw file on a code host being the usual
 * case. Both open the same way an upload does — as a new document, which then becomes the one
 * this browser is holding, exactly as opening a file from disk does — and the parameter is
 * dropped from the address once the drawing is in hand.
 *
 * What arrives this way is a stranger's markup, but so is anything pasted or uploaded — the
 * preview sanitises it all the same way. The limits here are about what a browser and a host
 * will carry, not about trust.
 */

/** Longer than any URL a browser or a host will reliably carry. */
const MAX_INLINE = 100_000;
/** A fetched file is not bounded by the address bar, so it gets the editor's own ceiling. */
export const MAX_FETCHED = 2_000_000;

export type OpenRequest =
  | { kind: 'svg'; svg: string }
  | { kind: 'url'; url: string }
  /** Asked for, but unusable — say so rather than opening nothing in silence. */
  | { kind: 'invalid'; reason: string };

/** What the address asks to open, or null when it asks for nothing. */
export function readOpenParam(search: string): OpenRequest | null {
  const params = new URLSearchParams(search);

  const svg = params.get('svg');
  if (svg !== null) {
    const text = svg.trim();
    if (!text.includes('<svg')) return { kind: 'invalid', reason: 'That link does not carry an SVG drawing.' };
    if (text.length > MAX_INLINE) {
      return { kind: 'invalid', reason: 'That drawing is too large to carry in a link. Paste its code in instead.' };
    }
    return { kind: 'svg', svg: text };
  }

  const url = params.get('url');
  if (url !== null) {
    let parsed: URL;
    try {
      parsed = new URL(url.trim());
    } catch {
      return { kind: 'invalid', reason: 'That link does not carry a valid address.' };
    }
    // https only: an http address would be blocked as mixed content anyway, and the other
    // schemes a URL can carry — data:, javascript:, file: — have no business being fetched.
    if (parsed.protocol !== 'https:') {
      return { kind: 'invalid', reason: 'Only https addresses can be opened. Paste the code in instead.' };
    }
    return { kind: 'url', url: parsed.href };
  }

  return null;
}

/** The address with svg/url taken out, so a reload does not open it all over again. */
export function withoutOpenParam(search: string): string {
  const params = new URLSearchParams(search);
  params.delete('svg');
  params.delete('url');
  const rest = params.toString();
  return rest ? `?${rest}` : '';
}

/** How long to wait on a stranger's server before giving up on it. */
const FETCH_TIMEOUT_MS = 20_000;

/**
 * Fetch a drawing named by `?url=`. Returns the markup, or the reason it could not be had.
 *
 * The body is read in pieces and abandoned as soon as it passes the ceiling, rather than
 * buffered whole and measured afterwards — an address that answers with a hundred megabytes is
 * exactly what the ceiling is for, and `text()` would have taken all of it first.
 */
export async function fetchSvgFromUrl(url: string, signal?: AbortSignal): Promise<{ svg: string } | { error: string }> {
  const timeout = new AbortController();
  const timer = setTimeout(() => timeout.abort(), FETCH_TIMEOUT_MS);
  const onCallerAbort = () => timeout.abort();
  signal?.addEventListener('abort', onCallerAbort);
  try {
    let response: Response;
    try {
      response = await fetch(url, { signal: timeout.signal, redirect: 'follow' });
    } catch {
      if (timeout.signal.aborted && !signal?.aborted) return { error: 'That address took too long to answer.' };
      // Otherwise almost always the other site declining to be read from a browser, which is
      // its choice to make and nothing the reader can fix — so say what to do instead.
      return { error: 'That address could not be read from the browser. Open the file and paste its code in instead.' };
    }
    if (!response.ok) return { error: `That address answered ${response.status}. Check the link, or paste the code in instead.` };

    const declared = Number(response.headers.get('content-length'));
    if (declared > MAX_FETCHED) return { error: 'That file is too large to open here.' };

    const text = await readCapped(response, MAX_FETCHED);
    if (text === null) return { error: 'That file is too large to open here.' };
    if (!text.includes('<svg')) return { error: 'That address did not return an SVG file.' };
    return { svg: text };
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onCallerAbort);
  }
}

/** The body as text, or null once it passes `limit`. Reading stops there. */
async function readCapped(response: Response, limit: number): Promise<string | null> {
  if (!response.body) {
    // No streams (jsdom, older engines): the whole body arrives either way, so measure it.
    const text = await response.text();
    return text.length > limit ? null : text;
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let text = '';
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      text += decoder.decode(value, { stream: true });
      if (text.length > limit) return null;
    }
  } finally {
    reader.cancel().catch(() => { /* already finished or gone */ });
  }
  return text + decoder.decode();
}
