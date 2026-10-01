import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { HomeIntro } from '../../components/HomeIntro';
import { DEFAULT_PRICING } from '../pricing';
import shell from '../../../index.html?raw';

/**
 * "/" is the page every crawler and assistant fetches — far more often than the pages that
 * carry text — and it shipped them an empty #root, because the editor cannot be rendered
 * without a browser. HomeIntro stands in for it until React mounts.
 */
const html = () => renderToString(<StaticRouter location="/"><HomeIntro /></StaticRouter>);
const text = () => html().replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

describe('HomeIntro', () => {
  it('renders without a browser — no window, no Firebase, no editor', () => {
    expect(() => html()).not.toThrow();
  });

  it('says enough to be worth reading: what it is, and what you can do with it', () => {
    const words = text().split(' ').length;
    expect(words).toBeGreaterThan(120);
    expect(text()).toContain('Paste SVG markup');
  });

  it('carries links, since the home page offered a crawler none at all', () => {
    const hrefs = [...html().matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
    expect(hrefs).toEqual(expect.arrayContaining(['/features', '/gallery', '/pricing', '/blog', '/about', '/support']));
  });

  it('takes the free allowance from pricing rather than repeating a number that will drift', () => {
    expect(text()).toContain(`${DEFAULT_PRICING.freeMonthlyCredits} AI credits a month`);
  });

  it('is hidden from any browser that runs JavaScript, so a reader never sees it flash', () => {
    // Painted, it showed for ~130ms on a fast connection before the editor replaced it.
    // index.html marks <html> before the body is parsed and hides this class under the mark;
    // the two have to name the same class, or the flash comes back with nothing failing.
    expect(html()).toContain('class="home-intro"');
    expect(shell).toContain("document.documentElement.classList.add('js')");
    expect(shell).toContain('.js .home-intro { display: none; }');
    // Before the body: a rule that arrived after #root would be too late to stop the paint.
    expect(shell.indexOf('.js .home-intro')).toBeLessThan(shell.indexOf('<div id="root">'));
  });
});
