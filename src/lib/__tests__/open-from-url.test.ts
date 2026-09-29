import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchSvgFromUrl, readOpenParam, withoutOpenParam, MAX_FETCHED } from '../open-from-url';

/** A link can carry the drawing, so an assistant that wrote SVG has somewhere to send someone. */

const SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="5" height="5"/></svg>';

describe('readOpenParam', () => {
  it('reads markup out of the address, encoded as a link would carry it', () => {
    expect(readOpenParam(`?svg=${encodeURIComponent(SVG)}`)).toEqual({ kind: 'svg', svg: SVG });
  });

  it('reads an https address to fetch', () => {
    expect(readOpenParam('?url=https%3A%2F%2Fexample.com%2Flogo.svg')).toEqual({ kind: 'url', url: 'https://example.com/logo.svg' });
  });

  it('refuses anything but https, so no data:, javascript: or file: address is fetched', () => {
    for (const url of ['http://example.com/a.svg', 'javascript:alert(1)', 'data:image/svg+xml,<svg/>', 'file:///etc/passwd', 'not a url']) {
      expect(readOpenParam(`?url=${encodeURIComponent(url)}`), url).toMatchObject({ kind: 'invalid' });
    }
  });

  it('says why, rather than opening nothing in silence', () => {
    // A link that cannot be used is still a link someone followed on purpose.
    expect(readOpenParam('?svg=hello')).toEqual({ kind: 'invalid', reason: expect.stringContaining('does not carry an SVG') });
    expect(readOpenParam(`?svg=${encodeURIComponent('<svg>' + 'x'.repeat(100_000))}`))
      .toEqual({ kind: 'invalid', reason: expect.stringContaining('too large to carry in a link') });
    expect(readOpenParam('?url=http%3A%2F%2Fexample.com%2Fa.svg'))
      .toEqual({ kind: 'invalid', reason: expect.stringContaining('Only https') });
  });

  it('asks for nothing when the address carries nothing', () => {
    expect(readOpenParam('')).toBeNull();
    expect(readOpenParam('?tab=ai')).toBeNull();
  });

  it('takes its parameter back out, keeping the rest of the address', () => {
    expect(withoutOpenParam(`?svg=${encodeURIComponent(SVG)}`)).toBe('');
    expect(withoutOpenParam('?url=https%3A%2F%2Fe.com%2Fa.svg&tab=ai')).toBe('?tab=ai');
  });
});

describe('fetchSvgFromUrl', () => {
  afterEach(() => vi.unstubAllGlobals());
  const stub = (impl: () => Promise<Response> | Response) => vi.stubGlobal('fetch', vi.fn(impl));

  it('returns the markup it fetched', async () => {
    stub(() => new Response(SVG, { status: 200 }));
    expect(await fetchSvgFromUrl('https://example.com/a.svg')).toEqual({ svg: SVG });
  });

  it('says what to do instead when the other site will not be read from a browser', async () => {
    stub(() => Promise.reject(new TypeError('Failed to fetch')));
    const result = await fetchSvgFromUrl('https://example.com/a.svg');
    expect('error' in result && result.error).toContain('paste its code in instead');
  });

  it('reports what the address answered, and refuses what is not a drawing', async () => {
    stub(() => new Response('nope', { status: 404 }));
    expect(await fetchSvgFromUrl('https://example.com/a.svg')).toEqual({ error: expect.stringContaining('404') });
    stub(() => new Response('<html>hello</html>', { status: 200 }));
    expect(await fetchSvgFromUrl('https://example.com/a.svg')).toEqual({ error: expect.stringContaining('did not return an SVG') });
  });

  it('refuses a file too large for the editor', async () => {
    stub(() => new Response(`<svg>${'x'.repeat(MAX_FETCHED)}</svg>`, { status: 200 }));
    expect(await fetchSvgFromUrl('https://example.com/a.svg')).toEqual({ error: expect.stringContaining('too large') });
  });

  it('refuses an oversized file on its declared length, without reading it', async () => {
    const response = new Response('<svg/>', { status: 200, headers: { 'content-length': String(MAX_FETCHED + 1) } });
    stub(() => response);
    expect(await fetchSvgFromUrl('https://example.com/a.svg')).toEqual({ error: expect.stringContaining('too large') });
    // Never taken a reader to it: the declared length was enough to refuse on.
    expect(response.bodyUsed).toBe(false);
  });

  it('stops reading a body that never ends, rather than filling the tab with it', async () => {
    // A body far past the ceiling, delivered in pieces: the read must abandon it partway.
    const chunk = new TextEncoder().encode('<svg>' + 'x'.repeat(100_000));
    let sent = 0;
    const body = new ReadableStream({
      pull(controller) {
        sent += chunk.length;
        controller.enqueue(chunk);
        // Far more than could ever be accepted; the reader should give up long before.
        if (sent > MAX_FETCHED * 8) controller.close();
      },
    });
    stub(() => new Response(body, { status: 200 }));
    expect(await fetchSvgFromUrl('https://example.com/a.svg')).toEqual({ error: expect.stringContaining('too large') });
    expect(sent).toBeLessThan(MAX_FETCHED * 2);
  });

  it('gives up on an address that never answers', async () => {
    vi.useFakeTimers();
    stub((...args: unknown[]) => new Promise((_, reject) => {
      const signal = (args[1] as { signal?: AbortSignal })?.signal;
      signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
    }) as Promise<Response>);
    try {
      const pending = fetchSvgFromUrl('https://example.com/slow.svg');
      await vi.advanceTimersByTimeAsync(21_000);
      expect(await pending).toEqual({ error: expect.stringContaining('took too long') });
    } finally {
      vi.useRealTimers();
    }
  });
});
