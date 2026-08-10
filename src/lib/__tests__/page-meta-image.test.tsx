import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PageMeta } from '../../components/PageMeta';
import { DEFAULT_IMAGE } from '../route-meta';

// ---------------------------------------------------------------------------
// og:image, the runtime half.
//
// The same rule — resolve a root-relative path against the origin, leave a URL
// alone — is written twice: here and in scripts/prerender.cjs, which stamps the
// tag a non-JS crawler reads. They cannot share code (one is a .cjs build
// script), so each needs its own guard. Getting it wrong is invisible in the
// app and only shows as a broken share card somewhere else.
// ---------------------------------------------------------------------------
function ogImage(): string | null {
  return document.head.querySelector('meta[property="og:image"]')?.getAttribute('content') ?? null;
}

function renderMeta(props: { image?: string }) {
  render(
    <MemoryRouter initialEntries={['/blog']}>
      <PageMeta title="What's New" description="…" {...props} />
    </MemoryRouter>,
  );
}

describe('PageMeta og:image', () => {
  beforeEach(() => {
    document.head.querySelectorAll('meta[property="og:image"]').forEach(el => el.remove());
  });

  it('resolves a root-relative picture against the live origin', () => {
    renderMeta({ image: '/screenshots/17-gallery.png' });
    expect(ogImage()).toBe(`${window.location.origin}/screenshots/17-gallery.png`);
  });

  it('leaves a picture that is already a URL alone', () => {
    renderMeta({ image: 'https://cdn.example.com/card.png' });
    expect(ogImage()).toBe('https://cdn.example.com/card.png');
  });

  it('falls back to the default picture, still absolute', () => {
    renderMeta({});
    expect(ogImage()).toBe(`${window.location.origin}${DEFAULT_IMAGE}`);
  });
});
