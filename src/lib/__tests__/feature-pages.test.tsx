import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { FEATURE_PAGES, tryItHref } from '../feature-pages';
import routeMeta from '../route-meta.json';
import { SSR_ROUTES } from '../../entry-server';
import { parseSvg } from '../svg-export';
import { FeatureDetailPage } from '../../pages/FeatureDetailPage';
import { FeaturesPage } from '../../pages/FeaturesPage';

/**
 * The /features/<slug> pages are one list, read by the client route, the build-time render and
 * route-meta.json's titles. A page missing from any of them is a page that 404s, ships with no
 * title, or reaches crawlers empty — none of which shows in the app itself.
 */

// Inlined, so the bytes can be read without fs — the app tsconfig has no node types.
const SCREENSHOTS = import.meta.glob('/public/screenshots/*.png', { query: '?inline', import: 'default', eager: true }) as Record<string, string>;

function pngSize(dataUrl: string): [number, number] {
  const bytes = Uint8Array.from(atob(dataUrl.slice(dataUrl.indexOf(',') + 1)), (c) => c.charCodeAt(0));
  const view = new DataView(bytes.buffer);
  return [view.getUint32(16), view.getUint32(20)];
}

const render = (node: React.ReactNode, path: string) => renderToString(
  <MantineProvider withCssVariables={false} withGlobalClasses={false}>
    <MemoryRouter initialEntries={[path]}>{node}</MemoryRouter>
  </MantineProvider>,
);

const slugs = FEATURE_PAGES.map((p) => p.slug);
const routes = routeMeta.routes as Record<string, { title: string; description: string; image?: string }>;

describe('feature pages', () => {
  it('each has a title and description, and nothing in route-meta.json is left without a page', () => {
    for (const slug of slugs) expect(routes[`/features/${slug}`], slug).toBeDefined();
    const listed = Object.keys(routes).filter((r) => r.startsWith('/features/'));
    expect(listed.sort()).toEqual(slugs.map((s) => `/features/${s}`).sort());
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('each is rendered at build time, so a reader without JavaScript gets the page', () => {
    for (const slug of slugs) expect(SSR_ROUTES).toContain(`/features/${slug}`);
  });

  it('keeps descriptions to what a search result shows', () => {
    for (const slug of slugs) expect(routes[`/features/${slug}`].description.length, slug).toBeLessThanOrEqual(160);
  });

  it('links only to pages that exist, and never to itself', () => {
    for (const page of FEATURE_PAGES) {
      for (const slug of page.related) {
        expect(slugs, `${page.slug} → ${slug}`).toContain(slug);
        expect(slug).not.toBe(page.slug);
      }
    }
  });

  it('gives every picture the size of its file, so the page does not jump as they load', () => {
    for (const page of FEATURE_PAGES) {
      for (const image of page.sections.flatMap((s) => (s.image ? [s.image] : []))) {
        const file = SCREENSHOTS[`/public${image.src}`];
        expect(file, `${image.src} is not in public/screenshots`).toBeDefined();
        expect([image.width, image.height], image.src).toEqual(pngSize(file));
      }
      const image = routes[`/features/${page.slug}`].image;
      if (image) expect(SCREENSHOTS[`/public${image}`], image).toBeDefined();
    }
  });

  it('opens the editor on a drawing that is valid SVG and short enough for a link', () => {
    for (const page of FEATURE_PAGES) {
      if (!page.tryIt) continue;
      expect(parseSvg(page.tryIt.svg), page.slug).not.toHaveProperty('error');
      expect(page.tryIt.svg.length).toBeLessThan(100_000);
      expect(decodeURIComponent(tryItHref(page.tryIt.svg).slice('/?svg='.length))).toBe(page.tryIt.svg);
    }
  });

  it('renders its heading and every section', () => {
    for (const page of FEATURE_PAGES) {
      const html = render(<FeatureDetailPage slug={page.slug} />, `/features/${page.slug}`);
      expect(html).toContain('<h1');
      for (const section of page.sections) expect(html, `${page.slug}: ${section.heading}`).toContain(section.heading);
    }
  });
});

describe('/features cards', () => {
  it('each link to a feature page that exists', () => {
    const html = render(<FeaturesPage />, '/features');
    const linked = [...html.matchAll(/href="\/features\/([a-z-]+)"/g)].map((m) => m[1]);
    expect(linked.length).toBeGreaterThan(10);
    for (const slug of linked) expect(slugs).toContain(slug);
    // And every page is reached from at least one card.
    for (const slug of slugs) expect(linked, slug).toContain(slug);
  });
});
