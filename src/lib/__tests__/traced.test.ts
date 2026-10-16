import { describe, it, expect } from 'vitest';
import { looksTraced } from '../traced';

const tracedPath = (i: number) => `  <path d="M0 0 C5 3 9 7 14 11 Z " transform="translate(${i * 10},${i * 5})" style="fill: #1C1817;"/>`;
const svg = (lines: string[]) => ['<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">', ...lines, '</svg>'].join('\n');

describe('looksTraced', () => {
  it('knows the tracer\'s markup: anonymous paths placed by translate() and coloured inline', () => {
    expect(looksTraced(svg(Array.from({ length: 22 }, (_, i) => tracedPath(i))))).toBe(true);
  });

  it('still knows it after a few hand edits added other elements', () => {
    const lines = Array.from({ length: 20 }, (_, i) => tracedPath(i));
    lines.push('  <rect id="teeth-white" x="302" y="430" width="282" height="158" fill="#FFFFFF"/>', '  <text x="5" y="5">Hi</text>', '  <path d="M0 0 L5 5"/>');
    expect(looksTraced(svg(lines))).toBe(true);
  });

  it('says no to an icon, a hand-made drawing, or a few traced paths', () => {
    expect(looksTraced(svg(['  <circle r="5"/>', '  <path d="M0 0 L5 5" fill="red"/>']))).toBe(false);
    expect(looksTraced(svg(Array.from({ length: 30 }, (_, i) => `  <path d="M${i} 0 L5 5" fill="#123456"/>`)))).toBe(false);
    expect(looksTraced(svg(Array.from({ length: 5 }, (_, i) => tracedPath(i))))).toBe(false);
  });
});
