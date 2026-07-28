import { describe, it, expect } from 'vitest';
import { suggestGalleryMeta, displayAuthorName } from '../gallery-meta';

describe('suggestGalleryMeta', () => {
  it('builds title and description from the first chat prompt', () => {
    const meta = suggestGalleryMeta({ firstPrompt: 'draw a cat riding a bicycle' });
    expect(meta.title).toBe('Cat riding a bicycle');
    expect(meta.description).toBe('draw a cat riding a bicycle');
  });

  it('strips polite/imperative filler from the title', () => {
    expect(suggestGalleryMeta({ firstPrompt: 'please create an orange fox logo' }).title).toBe('Orange fox logo');
    expect(suggestGalleryMeta({ firstPrompt: 'Can you generate me a snowman with a hat' }).title).toBe('Snowman with a hat');
  });

  it('limits the title to a few words and strips trailing punctuation', () => {
    const meta = suggestGalleryMeta({ firstPrompt: 'draw a red dragon flying over the misty mountains at night, breathing fire' });
    expect(meta.title).toBe('Red dragon flying over the misty');
    expect(meta.title.length).toBeLessThanOrEqual(51); // 50 + ellipsis
  });

  it('collapses whitespace and truncates long descriptions at a word boundary', () => {
    const prompt = 'draw   a\n\nvery ' + 'detailed '.repeat(40) + 'scene';
    const meta = suggestGalleryMeta({ firstPrompt: prompt });
    expect(meta.description.length).toBeLessThanOrEqual(201); // 200 + ellipsis
    expect(meta.description).not.toMatch(/\s{2,}/);
    expect(meta.description.endsWith('…')).toBe(true);
  });

  it('falls back to the SVG <title> element when there is no prompt', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><title>Sunset over the sea</title><rect/></svg>';
    expect(suggestGalleryMeta({ svg })).toEqual({ title: 'Sunset over the sea', description: '' });
  });

  it('prefers the root <title> over nested ones', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><title>Root title</title><g><title>Nested</title></g></svg>';
    expect(suggestGalleryMeta({ svg }).title).toBe('Root title');
  });

  it('ignores malformed SVG', () => {
    expect(suggestGalleryMeta({ svg: '<svg><title>Broken' }).title).toBe('');
  });

  it('falls back to the file name when there is no prompt and no SVG title', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><rect/></svg>';
    expect(suggestGalleryMeta({ svg, fileName: 'company-logo' })).toEqual({ title: 'company-logo', description: '' });
  });

  it('returns empty strings when nothing usable is available', () => {
    expect(suggestGalleryMeta({})).toEqual({ title: '', description: '' });
    expect(suggestGalleryMeta({ svg: '<svg/>', firstPrompt: '   ' })).toEqual({ title: '', description: '' });
  });
});

describe('displayAuthorName', () => {
  it('keeps the given name and initialises the surname', () => {
    expect(displayAuthorName('Nikolay Belykh')).toBe('Nikolay B.');
  });

  it('drops middle parts rather than initialising them', () => {
    expect(displayAuthorName('Ada King Lovelace')).toBe('Ada L.');
  });

  it('leaves a single-word name alone', () => {
    expect(displayAuthorName('Prince')).toBe('Prince');
  });

  it('tolerates padding and empty input', () => {
    expect(displayAuthorName('  Grace   Hopper  ')).toBe('Grace H.');
    expect(displayAuthorName('')).toBe('');
  });
});
