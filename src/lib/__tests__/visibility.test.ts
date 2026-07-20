import { describe, it, expect } from 'vitest';
import { visibilityOf } from '../visibility';

// ---------------------------------------------------------------------------
// visibilityOf — privacy regression guard.
//
// Legacy prod docs carry only the `private` boolean. They must NEVER map to
// 'public' (gallery-listed): going public requires the owner to explicitly
// write visibility: 'public'. If this suite fails, a deploy could silently
// expose user files in the public gallery.
// ---------------------------------------------------------------------------
describe('visibilityOf', () => {
  it('maps legacy private docs to private', () => {
    expect(visibilityOf({ private: true })).toBe('private');
  });

  it('maps legacy non-private docs to unlisted, not public', () => {
    expect(visibilityOf({ private: false })).toBe('unlisted');
  });

  it('maps docs with no visibility info to unlisted', () => {
    expect(visibilityOf({})).toBe('unlisted');
    expect(visibilityOf(undefined)).toBe('unlisted');
    expect(visibilityOf(null)).toBe('unlisted');
  });

  it('passes explicit visibility values through', () => {
    expect(visibilityOf({ visibility: 'private' })).toBe('private');
    expect(visibilityOf({ visibility: 'unlisted' })).toBe('unlisted');
    expect(visibilityOf({ visibility: 'public' })).toBe('public');
  });

  it('explicit visibility wins over the legacy boolean', () => {
    expect(visibilityOf({ visibility: 'private', private: false })).toBe('private');
    expect(visibilityOf({ visibility: 'unlisted', private: true })).toBe('unlisted');
  });

  it('falls back to the legacy mapping for malformed visibility values', () => {
    expect(visibilityOf({ visibility: 'PUBLIC', private: true })).toBe('private');
    expect(visibilityOf({ visibility: true, private: false })).toBe('unlisted');
    expect(visibilityOf({ visibility: 1 })).toBe('unlisted');
    expect(visibilityOf({ visibility: '' })).toBe('unlisted');
  });

  it("never returns 'public' without the literal visibility: 'public'", () => {
    const inputs = [
      undefined,
      null,
      {},
      { private: false },
      { private: true },
      { visibility: 'PUBLIC' },
      { visibility: 'Public' },
      { visibility: true },
      { visibility: ['public'] },
      { public: true },
    ];
    for (const input of inputs) {
      expect(visibilityOf(input)).not.toBe('public');
    }
  });
});
