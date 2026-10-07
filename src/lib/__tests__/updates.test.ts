import { describe, it, expect } from 'vitest';
import { UPDATES, formatUpdateDate, updateMeta, updatePath } from '../updates';
import { SSR_ROUTES, BLOG_META } from '../../entry-server';
import { metaFor } from '../route-meta';

// ---------------------------------------------------------------------------
// The update log shown on /blog.
//
// Entries are hand-written, so the guards here are for the mistakes hand-written
// data invites: a duplicated id (two entries fighting over one anchor), a date
// out of order, or a screenshot path that points at nothing.
// ---------------------------------------------------------------------------
describe('UPDATES', () => {
  it('has at least one entry', () => {
    expect(UPDATES.length).toBeGreaterThan(0);
  });

  it('gives every entry its own id', () => {
    const ids = UPDATES.map(u => u.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('uses ids that are safe as URL anchors', () => {
    for (const update of UPDATES) {
      expect(update.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it('is ordered newest first', () => {
    const dates = UPDATES.map(u => u.date);
    expect(dates).toStrictEqual([...dates].sort().reverse());
  });

  it('dates every entry as a calendar date', () => {
    for (const update of UPDATES) {
      expect(update.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('gives every entry a summary and at least one change', () => {
    for (const update of UPDATES) {
      expect(update.summary.length).toBeGreaterThan(0);
      expect(update.changes.length).toBeGreaterThan(0);
    }
  });

  // A screenshot that 404s is easy to miss — the alt text simply shows in its
  // place — and only turns up as a hole in the published page. The paths point
  // into public/, which nothing imports, so nothing else would catch a typo.
  // Globbed rather than read with fs: the app tsconfig has no node types.
  const SCREENSHOTS = import.meta.glob('/public/screenshots/**/*.png');

  it('points every picture at a file that exists', () => {
    const files = Object.keys(SCREENSHOTS);
    expect(files.length).toBeGreaterThan(0); // guard the glob itself
    for (const update of UPDATES) {
      for (const image of update.images ?? []) {
        expect(files).toContain(`/public${image.src}`);
        expect(files).toContain(`/public${image.thumb}`);
      }
    }
  });

  // The blog is the one route that names its own share picture. Drop the field
  // from route-meta.json and the page quietly reverts to the editor
  // screenshot, which is not what a "what's new" link should show.
  it('gives the page its own share picture', () => {
    expect(metaFor('/blog').image).toBeTruthy();
  });

  it('describes every picture, for readers who cannot see it', () => {
    for (const update of UPDATES) {
      for (const image of update.images ?? []) {
        expect(image.alt.length).toBeGreaterThan(0);
      }
    }
  });
});

describe('formatUpdateDate', () => {
  it('reads the date as a calendar date, not as UTC midnight', () => {
    // `new Date('2026-08-10')` is UTC midnight, which is 9 August in every
    // timezone west of Greenwich. The day must not drift.
    expect(formatUpdateDate('2026-08-10')).toBe('10 August 2026');
    expect(formatUpdateDate('2026-01-01')).toBe('1 January 2026');
  });
});

// Each update has a page of its own at /blog/<id>, its <head> taken from the entry itself.
describe('update pages', () => {
  it('renders every update on its own page at build time', () => {
    for (const update of UPDATES) {
      expect(updatePath(update)).toBe(`/blog/${update.id}`);
      expect(SSR_ROUTES).toContain(updatePath(update));
      expect(BLOG_META[updatePath(update)]).toEqual(updateMeta(update));
    }
  });

  it('gives every page a description that search results show whole', () => {
    for (const update of UPDATES) {
      const { title, description } = updateMeta(update);
      expect(title).toBe(update.title);
      expect(description.length).toBeGreaterThan(40);
      expect(description.length).toBeLessThanOrEqual(160);
    }
  });

  it('describes a page in whole sentences of its summary when they fit', () => {
    const meta = updateMeta({ ...UPDATES[0], summary: 'One short sentence. Another one. ' + 'A long one '.repeat(20) + 'ends here.' });
    expect(meta.description).toBe('One short sentence. Another one.');
  });

  it('shares the first picture of an update, or none', () => {
    for (const update of UPDATES) expect(updateMeta(update).image).toBe(update.images?.[0]?.src);
  });
});

// An article's pictures point into public/ as plain Markdown, which nothing else checks.
describe('articles', () => {
  const SCREENSHOTS = import.meta.glob('/public/screenshots/**/*.png');
  it('points every picture in an article at a file that exists', () => {
    const files = Object.keys(SCREENSHOTS);
    for (const update of UPDATES) {
      const pictures = [...(update.article ?? '').matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)].map((m) => m[1]);
      for (const src of pictures) expect(files).toContain(`/public${src}`);
    }
  });

  it('gives every picture in an article a caption', () => {
    for (const update of UPDATES) {
      for (const m of (update.article ?? '').matchAll(/!\[([^\]]*)\]\(/g)) expect(m[1].length).toBeGreaterThan(20);
    }
  });
});
