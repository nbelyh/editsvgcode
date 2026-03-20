import { describe, it, expect } from 'vitest';
import { stepUp, stepDown, isAbsoluteLength, LEVELS } from '../preview-utils';

// ---------------------------------------------------------------------------
// stepUp / stepDown (zoom levels)
// ---------------------------------------------------------------------------
describe('stepUp', () => {
  it('returns the next level above the given value', () => {
    expect(stepUp(100)).toBe(125);
  });

  it('returns 2 from 1', () => {
    expect(stepUp(1)).toBe(2);
  });

  it('returns next level for in-between values', () => {
    expect(stepUp(110)).toBe(125);
  });

  it('returns 1.5x for values beyond max level', () => {
    expect(stepUp(5000)).toBe(7500);
  });

  it('steps through all levels correctly', () => {
    let z = LEVELS[0];
    for (let i = 1; i < LEVELS.length; i++) {
      z = stepUp(z);
      expect(z).toBe(LEVELS[i]);
    }
  });
});

describe('stepDown', () => {
  it('returns the previous level below the given value', () => {
    expect(stepDown(100)).toBe(75);
  });

  it('returns 1 at minimum', () => {
    expect(stepDown(1)).toBe(1);
  });

  it('returns previous level for in-between values', () => {
    expect(stepDown(110)).toBe(100);
  });

  it('returns value/1.5 floored for values beyond max', () => {
    expect(stepDown(6000)).toBe(5000);
  });

  it('steps through all levels in reverse correctly', () => {
    let z = LEVELS[LEVELS.length - 1];
    for (let i = LEVELS.length - 2; i >= 0; i--) {
      z = stepDown(z);
      expect(z).toBe(LEVELS[i]);
    }
  });
});

// ---------------------------------------------------------------------------
// isAbsoluteLength
// ---------------------------------------------------------------------------
describe('isAbsoluteLength', () => {
  it('accepts plain numbers', () => {
    expect(isAbsoluteLength('100')).toBe(true);
  });

  it('accepts numbers with px suffix', () => {
    expect(isAbsoluteLength('200px')).toBe(true);
  });

  it('accepts decimal numbers', () => {
    expect(isAbsoluteLength('12.5')).toBe(true);
    expect(isAbsoluteLength('12.5px')).toBe(true);
  });

  it('accepts with leading/trailing whitespace', () => {
    expect(isAbsoluteLength('  100  ')).toBe(true);
    expect(isAbsoluteLength('  100px  ')).toBe(true);
  });

  it('rejects percentage values', () => {
    expect(isAbsoluteLength('50%')).toBe(false);
  });

  it('rejects em/rem/other units', () => {
    expect(isAbsoluteLength('2em')).toBe(false);
    expect(isAbsoluteLength('1rem')).toBe(false);
    expect(isAbsoluteLength('10vw')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isAbsoluteLength('')).toBe(false);
  });

  it('rejects non-numeric strings', () => {
    expect(isAbsoluteLength('auto')).toBe(false);
    expect(isAbsoluteLength('inherit')).toBe(false);
  });
});
