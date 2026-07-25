import { describe, it, expect } from 'vitest';
import {
  EDIT_MODELS,
  IMAGE_MODELS,
  DEFAULT_EDIT_MODEL,
  DEFAULT_IMAGE_MODEL,
  resolveEditModel,
  resolveImageModel,
  visibleEditModels,
} from '../models';

/** Models dropped once they had no Azure deployment behind them. Users who picked one
 *  before it went away still have it in localStorage, so it must resolve, not linger. */
const RETIRED = [
  'gpt-5',
  'gpt-4o-mini',
  'gpt-4.1',
  'gpt-5.1',
  'gpt-5.1-codex',
  'gpt-5.1-codex-mini',
  'gpt-5.2',
  'gpt-5.2-codex',
];

describe('resolveEditModel', () => {
  it('keeps a model that still exists', () => {
    for (const m of EDIT_MODELS) {
      expect(resolveEditModel(m.value)).toBe(m.value);
    }
  });

  it('falls back to the default for every retired model', () => {
    for (const stale of RETIRED) {
      expect(resolveEditModel(stale)).toBe(DEFAULT_EDIT_MODEL);
    }
  });

  it('falls back for null (first visit) and for junk', () => {
    expect(resolveEditModel(null)).toBe(DEFAULT_EDIT_MODEL);
    expect(resolveEditModel('')).toBe(DEFAULT_EDIT_MODEL);
    expect(resolveEditModel('not-a-model')).toBe(DEFAULT_EDIT_MODEL);
  });

  it('resolves to something actually in the list', () => {
    const values = EDIT_MODELS.map(m => m.value);
    expect(values).toContain(DEFAULT_EDIT_MODEL);
    expect(values).toContain(resolveEditModel('gpt-5.2'));
  });
});

describe('resolveImageModel', () => {
  it('keeps existing models and falls back otherwise', () => {
    for (const m of IMAGE_MODELS) expect(resolveImageModel(m.value)).toBe(m.value);
    expect(resolveImageModel(null)).toBe(DEFAULT_IMAGE_MODEL);
    expect(resolveImageModel('gpt-image-0')).toBe(DEFAULT_IMAGE_MODEL);
  });
});

describe('visibleEditModels', () => {
  it('hides the superseded models by default', () => {
    const shown = visibleEditModels(DEFAULT_EDIT_MODEL).map(m => m.value);
    expect(shown).toEqual([
      'gpt-5.4-nano',
      'gpt-5.4-mini',
      'gpt-5.6-luna',
      'gpt-5.6-terra',
      'gpt-5.6-sol',
    ]);
  });

  it('keeps a hidden model visible while it is the current selection', () => {
    // Otherwise the radio group would render with nothing checked.
    expect(visibleEditModels('gpt-5.4').map(m => m.value)).toContain('gpt-5.4');
    expect(visibleEditModels('gpt-5-mini').map(m => m.value)).toContain('gpt-5-mini');
  });

  it('does not show a hidden model that is not selected', () => {
    expect(visibleEditModels(DEFAULT_EDIT_MODEL).map(m => m.value)).not.toContain('gpt-5.4');
  });

  it('is ordered by ascending credit cost', () => {
    const cost = (label: string) => Number(label.match(/\((\d+)x\)/)![1]);
    const costs = EDIT_MODELS.map(m => cost(m.label));
    expect(costs).toEqual([...costs].sort((a, b) => a - b));
  });
});
