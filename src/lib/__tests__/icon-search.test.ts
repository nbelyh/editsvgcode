import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchIcons, formatIconForModel, svgOf } from '../icon-search';
import DEFAULT_SVG from '../../assets/default.svg?raw';

const BODY = '<path d="M0 0h24v24H0z"/>';

/**
 * The icon service, faked: a search restricted to the "filled" sets finds no brand logos, and
 * the same search across every set finds Strava in Simple Icons. Every request is recorded.
 */
function fakeIconify(opts: { filledHas?: string[]; everyHas?: string[]; status?: number } = {}) {
  const requests: string[] = [];
  const fetchMock = vi.fn(async (url: string) => {
    requests.push(url);
    if (opts.status) return new Response('', { status: opts.status });
    if (url.includes('/search?')) {
      const restricted = url.includes('prefixes=');
      const icons = restricted ? (opts.filledHas ?? []) : (opts.everyHas ?? ['simple-icons:strava']);
      const collections = Object.fromEntries(icons.map((id) => {
        const prefix = id.split(':')[0];
        return [prefix, { name: prefix, license: { title: 'CC0 1.0', spdx: 'CC0-1.0' } }];
      }));
      return Response.json({ icons, total: icons.length, collections });
    }
    // /{prefix}.json?icons=a,b — one download for all of a set's icons.
    const names = new URL(url).searchParams.get('icons')!.split(',');
    return Response.json({ width: 24, height: 24, icons: Object.fromEntries(names.map((n) => [n, { body: BODY }])) });
  });
  vi.stubGlobal('fetch', fetchMock);
  return requests;
}

afterEach(() => vi.unstubAllGlobals());

describe('fetchIcons — a style is a preference, not a wall', () => {
  it('searches every set when the chosen style\'s sets have nothing, and finds the brand', async () => {
    const requests = fakeIconify();
    const { icons, error } = await fetchIcons('strava', 'filled', true, 'monochrome');
    expect(error).toBeUndefined();
    expect(icons.map((i) => i.name)).toEqual(['simple-icons:strava']);
    const searches = requests.filter((u) => u.includes('/search?'));
    expect(searches).toHaveLength(2);
    expect(searches[1]).not.toContain('prefixes=');
  });

  it('keeps to the style\'s sets when they have a match', async () => {
    const requests = fakeIconify({ filledHas: ['mdi:heart'] });
    const { icons } = await fetchIcons('heart', 'filled', true, 'monochrome');
    expect(icons.map((i) => i.name)).toEqual(['mdi:heart']);
    expect(requests.filter((u) => u.includes('/search?'))).toHaveLength(1);
  });

  it('does not search again when the service itself failed', async () => {
    fakeIconify({ status: 503 });
    const { icons, error } = await fetchIcons('strava', 'filled', true, 'monochrome');
    expect(icons).toEqual([]);
    expect(error).toContain('HTTP 503');
  });
});

describe('fetchIcons — few requests per search', () => {
  it('downloads each set\'s icons at once, from at most 8 sets', async () => {
    // 40 matches spread over 12 sets.
    const everyHas = Array.from({ length: 40 }, (_, i) => `set${i % 12}:heart-${i}`);
    const requests = fakeIconify({ everyHas });
    const { icons } = await fetchIcons('heart', 'any', true, 'any');
    const downloads = requests.filter((u) => !u.includes('/search?'));
    expect(downloads).toHaveLength(8);
    expect(new Set(icons.map((i) => i.name.split(':')[0])).size).toBe(8);
    expect(icons.length).toBeGreaterThan(8);
    expect(icons[0].svg).toBe(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">${BODY}</svg>`);
  });

  it('tells the model not to draw a look-alike when every download fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => url.includes('/search?')
      ? Response.json({ icons: ['simple-icons:strava'], total: 1, collections: {} })
      : new Response('', { status: 429 })));
    const { icons, error } = await fetchIcons('strava', 'any', false, 'any');
    expect(icons).toEqual([]);
    expect(error).toContain('rather than drawing a look-alike');
  });
});

describe('svgOf — the SVG the .svg endpoint would give', () => {
  it('uses the icon\'s own size over the set\'s', () => {
    const set = { width: 20, height: 20, icons: { a: { body: BODY, width: 12, height: 12 } } };
    expect(svgOf(set, 'a')).toBe(`<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">${BODY}</svg>`);
  });

  it('follows an alias to its parent', () => {
    const set = { width: 512, height: 512, icons: { parent: { body: BODY, width: 576 } }, aliases: { child: { parent: 'parent' } } };
    expect(svgOf(set, 'child')).toContain('viewBox="0 0 576 512"');
  });

  it('skips a rotated alias and a missing icon', () => {
    const set = { icons: { parent: { body: BODY } }, aliases: { turned: { parent: 'parent', rotate: 1 } } };
    expect(svgOf(set, 'turned')).toBeNull();
    expect(svgOf(set, 'nothing')).toBeNull();
  });
});

describe('formatIconForModel — a box to fill, not a transform to work out', () => {
  const icon = {
    name: 'simple-icons:strava', setName: 'Simple Icons', license: 'CC0 1.0', needsAttribution: false,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">${BODY}</svg>`,
  } as Parameters<typeof formatIconForModel>[0];
  const drawing = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="10" height="10"/></svg>';

  it('hands over the icon as an <svg> placed by x, y, width and height, which inserts as it is', () => {
    const text = formatIconForModel(icon, drawing);
    const snippet = /```svg\n([\s\S]*?)\n```/.exec(text)![1];
    expect(snippet).toBe(`<svg x="163" y="113" width="75" height="75" viewBox="0 0 24 24" color="currentColor">${BODY}</svg>`);
    expect(text).not.toContain('transform=');
  });

  it('names a quarter-size box for each corner of the drawing, and says to insert it last', () => {
    const text = formatIconForModel(icon, drawing);
    expect(text).toContain('top left x="12" y="12" width="75" height="75"');
    expect(text).toContain('top right x="313" y="12" width="75" height="75"');
    expect(text).toContain('position "last-child"');
    expect(text).not.toContain('starter');
  });

  it('says the icon replaces the untouched starter drawing', () => {
    const text = formatIconForModel(icon, DEFAULT_SVG);
    expect(text).toContain("untouched starter sample");
    expect(text).toContain(`<svg x="16" y="16" width="368" height="368"`);
  });

  it('falls back to the rule alone when the drawing has no size', () => {
    const text = formatIconForModel(icon, '<svg xmlns="http://www.w3.org/2000/svg"/>');
    expect(text).toContain("about a quarter of the drawing's shorter side");
    expect(text).not.toContain('width="75"');
  });
});

describe('formatIconForModel — sizes beside text', () => {
  it('names the font sizes the drawing uses, from attributes and style rules', () => {
    const icon = { name: 'mdi:bell', setName: 'MDI', license: 'Apache 2.0', needsAttribution: false,
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">${BODY}</svg>` } as Parameters<typeof formatIconForModel>[0];
    const card = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 300"><style>.title { font-size: 18px; } .hint { font-size: 11px; }</style><text font-size="14">a</text></svg>';
    expect(formatIconForModel(icon, card)).toContain('(font sizes here: 11, 14, 18)');
  });
});
