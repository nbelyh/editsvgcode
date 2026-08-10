import { describe, it, expect } from 'vitest';
import { UPDATES, formatUpdateDate } from '../updates';
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
