import { describe, it, expect } from 'vitest';
import DEFAULT_SVG from '../../assets/default.svg?raw';
import { docOrigin } from '../doc-origin';

describe('docOrigin — what an AI turn started from', () => {
  it('recognises the starter drawing, however it was reformatted', () => {
    expect(docOrigin(DEFAULT_SVG)).toBe('starter');
    // Stored and replayed copies lose the comment and the line breaks.
    expect(docOrigin(DEFAULT_SVG.replace(/<!--[\s\S]*?-->/g, '').replace(/\n\s*/g, ' '))).toBe('starter');
  });

  it('calls a document with nothing drawn in it empty', () => {
    expect(docOrigin('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"></svg>')).toBe('empty');
    expect(docOrigin('<svg xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g"/></defs></svg>')).toBe('empty');
  });

  it('calls anything else the user\'s own', () => {
    expect(docOrigin('<svg xmlns="http://www.w3.org/2000/svg"><circle r="5"/></svg>')).toBe('own');
    // The starter with one change is the user's own drawing now.
    expect(docOrigin(DEFAULT_SVG.replace('fill="red"', 'fill="blue"'))).toBe('own');
  });
});
