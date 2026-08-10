import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { DEFAULT_TITLE, DEFAULT_DESCRIPTION, DEFAULT_IMAGE, SITE_NAME } from '../lib/route-meta';

/**
 * Per-route <head> tags.
 *
 * React 19 can hoist <title>/<meta> rendered in a component, and that was the
 * first implementation — but it only ever *appends*. It does not replace what
 * index.html already carries and does not deduplicate, so every route ended up
 * with two titles and two descriptions, and the static one (being first) won.
 * That is documented behaviour, not a bug: React hoists and nothing more, which
 * is why metadata libraries still exist.
 *
 * Removing the static tags to avoid the clash costs more than it saves. Social
 * scrapers read og:* so they are fine either way, and Google renders — but AI
 * crawlers (GPTBot, ClaudeBot, PerplexityBot) and Bing/Yandex largely do not run
 * JS, and would find a page with no title at all. It also fights the prerender
 * step, which puts real per-route tags in the served HTML: React would then
 * duplicate those too.
 *
 * So write imperatively and overwrite. index.html (and, once prerendered, each
 * route's own HTML) supplies the tags a non-JS crawler sees; this replaces them
 * in place on mount and on every client-side navigation. Never two of anything.
 */

export interface PageMetaProps {
  /** Page title without the site name — omit on the home page, which keeps the
   *  bare product title it already ranks under. */
  title?: string;
  description?: string;
  /** Root-relative path to the share-card picture. Pages that do not set one
   *  get DEFAULT_IMAGE — always written, never left at the previous route's
   *  choice, or a share of the editor would carry the blog's screenshot. */
  image?: string;
  /** Keep the page out of the index: private/unlisted documents, the signed-in
   *  areas, and the not-found state that the :fileId route serves as a 200. */
  noindex?: boolean;
}

function upsert(selector: string, create: () => HTMLElement): HTMLElement {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  return el;
}

function setMeta(attr: 'name' | 'property', key: string, content: string): void {
  const el = upsert(`meta[${attr}="${key}"]`, () => {
    const m = document.createElement('meta');
    m.setAttribute(attr, key);
    return m;
  });
  el.setAttribute('content', content);
}

/**
 * Hook form, for components that return from more than one branch. A rendered
 * <PageMeta> only takes effect on the branch it sits in — EditorPage has three
 * (phone, tablet, desktop) and the tags were silently missing on two of them,
 * so mobile crawlers saw no noindex on private documents. A hook cannot be
 * missed by a branch. Prefer it wherever the component has early returns.
 */
export function usePageMeta({ title, description, image, noindex }: PageMetaProps): void {
  const { pathname } = useLocation();

  useEffect(() => {
    const fullTitle = title ? `${title} — ${SITE_NAME}` : DEFAULT_TITLE;
    const desc = description || DEFAULT_DESCRIPTION;
    // Self-referencing, from the live origin so beta and localhost point at
    // themselves rather than claiming the production URL.
    const url = `${window.location.origin}${pathname}`;

    document.title = fullTitle;
    setMeta('name', 'description', desc);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:url', url);
    // Absolute: scrapers do not resolve a relative og:image. A picture already
    // named by URL is left alone — prefixing the origin would make nonsense of
    // it, and prerender.cjs makes the same distinction on the same values.
    const picture = image || DEFAULT_IMAGE;
    setMeta('property', 'og:image',
      /^https?:\/\//.test(picture) ? picture : `${window.location.origin}${picture}`);

    const canonical = upsert('link[rel="canonical"]', () => {
      const l = document.createElement('link');
      l.setAttribute('rel', 'canonical');
      return l;
    });
    canonical.setAttribute('href', url);

    // Added and removed rather than set to "index": a stale noindex left behind
    // by the previous route would quietly delist the next page.
    if (noindex) {
      setMeta('name', 'robots', 'noindex, follow');
    } else {
      document.head.querySelector('meta[name="robots"]')?.remove();
    }
  }, [title, description, image, noindex, pathname]);
}

/** Component form, for the single-return pages. Renders nothing. */
export function PageMeta(props: PageMetaProps) {
  usePageMeta(props);
  return null;
}
