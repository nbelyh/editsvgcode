import { describe, it, expect } from 'vitest';
import {
  getAreaInfo,
  getLastOpenedTag,
  isItemAvailable,
  getAttributeValueContext,
} from '../completion-provider';

// ---------------------------------------------------------------------------
// getAreaInfo
// ---------------------------------------------------------------------------
describe('getAreaInfo', () => {
  it('returns available for plain text with tags', () => {
    const result = getAreaInfo('<svg><rect ');
    expect(result.isCompletionAvailable).toBe(true);
  });

  it('strips matched strings and returns available', () => {
    const result = getAreaInfo('<svg attr="value"><rect ');
    expect(result.isCompletionAvailable).toBe(true);
    expect(result.clearedText).not.toContain('"value"');
  });

  it('returns unavailable when inside a double-quoted string', () => {
    const result = getAreaInfo('<svg attr="partialVal');
    expect(result.isCompletionAvailable).toBe(false);
  });

  it('returns unavailable when inside a single-quoted string', () => {
    const result = getAreaInfo("<svg attr='partialVal");
    expect(result.isCompletionAvailable).toBe(false);
  });

  it('returns unavailable inside an XML comment', () => {
    const result = getAreaInfo('<svg><!-- partial comment');
    expect(result.isCompletionAvailable).toBe(false);
  });

  it('returns unavailable inside CDATA', () => {
    const result = getAreaInfo('<svg><![CDATA[some data');
    expect(result.isCompletionAvailable).toBe(false);
  });

  it('handles empty string', () => {
    const result = getAreaInfo('');
    expect(result.isCompletionAvailable).toBe(true);
    expect(result.clearedText).toBe('');
  });
});

// ---------------------------------------------------------------------------
// getLastOpenedTag
// ---------------------------------------------------------------------------
describe('getLastOpenedTag', () => {
  it('finds the last unclosed tag', () => {
    const result = getLastOpenedTag('<svg><rect ');
    expect(result).toBeDefined();
    expect(result!.tagName).toBe('rect');
  });

  it('detects attribute search when cursor is inside opening tag', () => {
    const result = getLastOpenedTag('<svg><rect width="100" ');
    expect(result).toBeDefined();
    expect(result!.tagName).toBe('rect');
    expect(result!.isAttributeSearch).toBe(true);
  });

  it('returns undefined when all tags are closed', () => {
    const result = getLastOpenedTag('<svg><rect/></svg>');
    expect(result).toBeUndefined();
  });

  it('returns undefined for empty string', () => {
    const result = getLastOpenedTag('');
    expect(result).toBeUndefined();
  });

  it('ignores closed tags via closing tag stack', () => {
    const result = getLastOpenedTag('<svg><g><rect/></g><circle ');
    expect(result).toBeDefined();
    expect(result!.tagName).toBe('circle');
  });

  it('finds parent when child is self-closed', () => {
    const result = getLastOpenedTag('<svg><g><rect/>');
    expect(result).toBeDefined();
    expect(result!.tagName).toBe('g');
  });
});

// ---------------------------------------------------------------------------
// isItemAvailable
// ---------------------------------------------------------------------------
describe('isItemAvailable', () => {
  it('returns true when no items used', () => {
    expect(isItemAvailable('rect', '1', [])).toBe(true);
  });

  it('returns false when maxOccurs reached', () => {
    expect(isItemAvailable('rect', '1', ['rect'])).toBe(false);
  });

  it('returns true when maxOccurs is unbounded', () => {
    expect(isItemAvailable('rect', 'unbounded', ['rect', 'rect', 'rect'])).toBe(true);
  });

  it('defaults maxOccurs to 1 when undefined', () => {
    expect(isItemAvailable('rect', undefined, ['rect'])).toBe(false);
  });

  it('allows more items when maxOccurs > count', () => {
    expect(isItemAvailable('rect', '3', ['rect', 'rect'])).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getAttributeValueContext
// ---------------------------------------------------------------------------
describe('getAttributeValueContext', () => {
  it('detects attribute name and partial value', () => {
    const result = getAttributeValueContext('<rect fill="re');
    expect(result).toBeDefined();
    expect(result!.attrName).toBe('fill');
    expect(result!.partialValue).toBe('re');
  });

  it('detects empty partial value right after opening quote', () => {
    const result = getAttributeValueContext('<rect width="');
    expect(result).toBeDefined();
    expect(result!.attrName).toBe('width');
    expect(result!.partialValue).toBe('');
  });

  it('returns null when not inside attribute value', () => {
    expect(getAttributeValueContext('<rect fill')).toBeNull();
  });

  it('returns null for plain text', () => {
    expect(getAttributeValueContext('hello world')).toBeNull();
  });

  it('handles attributes with hyphens and colons', () => {
    const result = getAttributeValueContext('<svg xmlns:xlink="http://');
    expect(result).toBeDefined();
    expect(result!.attrName).toBe('xmlns:xlink');
  });
});
