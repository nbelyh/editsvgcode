import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { FeaturesPage } from '../../pages/FeaturesPage';

/**
 * Every thumbnail on /features declares its real size, so the browser reserves its box before
 * the picture arrives. Undeclared, each was zero pixels tall until it loaded, and the page's
 * text jumped down ~330px as they came in: a layout shift of 0.21, near what search counts as
 * poor. A size that no longer matches its file brings the jump back with nothing else failing,
 * so the declared size is checked against the file itself.
 */

// Inlined, so the bytes can be read without fs — the app tsconfig has no node types.
const THUMBS = import.meta.glob('/public/screenshots/thumbs/*.png', { query: '?inline', import: 'default', eager: true }) as Record<string, string>;

/** Width and height from a PNG's IHDR chunk, which sits at a fixed offset. */
function pngSize(dataUrl: string): [number, number] {
  const bytes = Uint8Array.from(atob(dataUrl.slice(dataUrl.indexOf(',') + 1)), (c) => c.charCodeAt(0));
  const view = new DataView(bytes.buffer);
  return [view.getUint32(16), view.getUint32(20)];
}

describe('/features thumbnails', () => {
  // The page as the prerender serves it. Rendered here rather than through entry-server's
  // renderRoute: under the test runner react-router and react-router-dom load as two copies, so
  // the page's useLocation cannot see that function's router. The build has no such split.
  const html = renderToString(
    <MantineProvider withCssVariables={false} withGlobalClasses={false}>
      <MemoryRouter initialEntries={['/features']}><FeaturesPage /></MemoryRouter>
    </MantineProvider>,
  );
  const images = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => {
    const attr = (name: string) => new RegExp(`\\s${name}="([^"]*)"`).exec(m[0])?.[1];
    return { src: attr('src'), width: Number(attr('width')), height: Number(attr('height')) };
  });

  it('renders thumbnails at all — the check below must not pass over an empty page', () => {
    expect(images.length).toBeGreaterThan(10);
  });

  it('gives every thumbnail the size of the file it shows', () => {
    for (const image of images) {
      const file = THUMBS[`/public${image.src}`];
      expect(file, `${image.src} is not in public/screenshots/thumbs`).toBeDefined();
      expect([image.width, image.height], image.src).toEqual(pngSize(file));
    }
  });
});
